import {
  Component, ElementRef, ViewChild,
  AfterViewChecked, OnInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user';
import { AudioRecorderComponent } from '../audio-recorder/audio-recorder.component';

interface Message {
  role: string;
  content: string;
  time: string;
}

const THEME_CHECK_INTERVAL_MS = 60_000;
const LOGIN_POLL_INTERVAL_MS  = 500;
const CAMERA_CONSENT_KEY      = 'cameraConsent';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, AudioRecorderComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: Message[] = [
    {
      role: 'assistant',
      content:
        'Hey! I\'m Musix 🎵 the smart assistant of MY Music.\n\n' +
        'I can help you with:\n🎵 Search songs & artists\n🛒 Manage your cart\n' +
        '❤️ Your favorites\n📦 Track orders\n👤 Profile details\n\nWhat would you like to know?',
      time: this.now()
    }
  ];

  suggestions = [
    { icon: '🎤', text: 'Show me all artists' },
    { icon: '🎵', text: 'What songs do you have?' },
    { icon: '🛒', text: 'What\'s in my cart?' },
    { icon: '❤️', text: 'Show my favorites' }
  ];

  input    = '';
  loading  = false;
  isOpen   = false;
  toastMsg = '';

  isLoggedIn          = false;
  showConsentPrompt   = false;
  pendingThemeChange: string | null = null;
  themeSuggestionMsg  = '';
  showThemeSuggestion = false;

  private themeCheckTimer: any = null;
  private loginPollTimer: any  = null;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  ngOnInit(): void {
    // Apply theme immediately if already logged in on page load
    if (this.userService.isLoggedIn()) {
      this.onLoginDetected();
    } else {
      this.applyThemeToDocument('LIGHT');
    }

    // Poll every 500ms to detect login
    this.loginPollTimer = setInterval(() => {
      const loggedIn = this.userService.isLoggedIn();

      if (loggedIn && !this.isLoggedIn) {
        this.onLoginDetected();
        this.cdr.detectChanges();
      }

      if (!loggedIn && this.isLoggedIn) {
        this.onLogoutDetected();
        this.cdr.detectChanges();
      }
    }, LOGIN_POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.themeCheckTimer) clearInterval(this.themeCheckTimer);
    if (this.loginPollTimer)  clearInterval(this.loginPollTimer);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // -------------------------------------------------------------------------
  // Login / logout handlers
  // -------------------------------------------------------------------------

  private onLoginDetected(): void {
    this.isLoggedIn = true;
    this.applyStoredTheme();

    const consent = localStorage.getItem(CAMERA_CONSENT_KEY);

    if (consent === 'true') {
      this.startCameraChecks();
    } else if (consent === 'false') {
    } else {
      this.isOpen = true;
      setTimeout(() => this.promptCameraConsent(), 400);
    }
  }

  private onLogoutDetected(): void {
    this.isLoggedIn          = false;
    this.showConsentPrompt   = false;
    this.showThemeSuggestion = false;
    if (this.themeCheckTimer) {
      clearInterval(this.themeCheckTimer);
      this.themeCheckTimer = null;
    }
    this.applyThemeToDocument('LIGHT');
  }

  // -------------------------------------------------------------------------
  // Camera consent
  // -------------------------------------------------------------------------

  private promptCameraConsent(): void {
    this.showConsentPrompt = true;
    this.messages.push({
      role: 'assistant',
      content:
        '📷 Would you like to enable smart ambient theme detection using your ' +
        'camera to automatically adjust the store\'s lighting based on your environment?',
      time: this.now()
    });
    this.cdr.detectChanges();
  }

  grantCameraConsent(): void {
    localStorage.setItem(CAMERA_CONSENT_KEY, 'true');
    this.showConsentPrompt = false;
    this.messages.push({
      role: 'assistant',
      content: '✅ Smart theme detection enabled! I\'ll adjust the store\'s lighting based on your environment 🌟',
      time: this.now()
    });
    this.startCameraChecks();
    this.cdr.detectChanges();
  }

  denyCameraConsent(): void {
    localStorage.setItem(CAMERA_CONSENT_KEY, 'false');
    this.showConsentPrompt = false;
    this.messages.push({
      role: 'assistant',
      content: '👍 No problem! You can always enable it later from your profile settings.',
      time: this.now()
    });
    this.cdr.detectChanges();
  }

  // -------------------------------------------------------------------------
  // Camera / ambient theme
  // -------------------------------------------------------------------------

  private startCameraChecks(): void {
    if (this.themeCheckTimer) return; // already running
    this.runAmbientCheck();
    this.themeCheckTimer = setInterval(() => this.runAmbientCheck(), THEME_CHECK_INTERVAL_MS);
  }

  private runAmbientCheck(): void {
    if (!this.userService.isLoggedIn()) return;
    if (localStorage.getItem(CAMERA_CONSENT_KEY) !== 'true') return;

    this.chatService.checkAmbientTheme().subscribe({
      next: result => {
        if (result.suggest && result.new_theme && result.message) {
          this.pendingThemeChange  = result.new_theme;
          this.themeSuggestionMsg  = result.message;
          this.showThemeSuggestion = true;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        if (err?.status === 503) {
          localStorage.setItem(CAMERA_CONSENT_KEY, 'false');
          if (this.themeCheckTimer) {
            clearInterval(this.themeCheckTimer);
            this.themeCheckTimer = null;
          }
        }
      }
    });
  }

  acceptThemeSuggestion(): void {
    const userId   = this.userService.getCurrentUserId();
    const newTheme = this.pendingThemeChange;
    if (!userId || !newTheme) return;

    this.userService.updateTheme(userId, newTheme).subscribe({
      next: () => {
        this.applyThemeToDocument(newTheme);
        this.dismissThemeSuggestion();
        this.showToast(`✅ Theme switched to ${newTheme === 'DARK' ? 'Night 🌙' : 'Light ☀️'} Mode`);
      },
      error: () => this.showToast('⚠️ Could not update theme, please try again.')
    });
  }

  dismissThemeSuggestion(): void {
    this.showThemeSuggestion = false;
    this.pendingThemeChange  = null;
    this.themeSuggestionMsg  = '';
  }

  // -------------------------------------------------------------------------
  // Theme helpers
  // -------------------------------------------------------------------------

  private applyStoredTheme(): void {
    this.applyThemeToDocument(this.userService.getPreferredTheme());
  }

  private applyThemeToDocument(theme: string): void {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(theme === 'DARK' ? 'theme-dark' : 'theme-light');
  }

  // -------------------------------------------------------------------------
  // Chat helpers
  // -------------------------------------------------------------------------

  private now(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => { this.toastMsg = ''; this.cdr.detectChanges(); }, 3000);
  }

  copy(text: string): void {
    navigator.clipboard.writeText(text);
    this.showToast('✅ Copied to clipboard!');
  }

  sendSuggestion(text: string): void {
    this.input = text;
    this.send();
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  onTranscribed(text: string): void {
    this.input = text;
  }

  // -------------------------------------------------------------------------
  // Send message
  // -------------------------------------------------------------------------

  async send(): Promise<void> {
    if (!this.input.trim() || this.loading) return;

    const userMsg = this.input;
    this.input    = '';
    this.loading  = true;
    this.messages.push({ role: 'user', content: userMsg, time: this.now() });

    try {
      const { songs, artists } = await this.chatService.getContext().toPromise() as any;
      const body = this.chatService.buildBody(
        userMsg,
        this.messages.slice(0, -1),
        songs,
        artists,
        this.pendingThemeChange ?? undefined
      );

      const response = await fetch(this.chatService.apiUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Server error');

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        this.loading = false;
        if (data?.action === 'navigate_artist') {
          this.messages.push({ role: 'assistant', content: data.reply, time: this.now() });
          this.showToast(`🎵 Navigating to songs by ${data.artistName || ''}...`);
          setTimeout(() => this.router.navigate(['/songs'], { queryParams: { artistId: data.artistId } }), 1500);
        } else if (data?.reply) {
          this.messages.push({ role: 'assistant', content: data.reply, time: this.now() });
        }
        return;
      }

      this.messages.push({ role: 'assistant', content: '', time: this.now() });
      const idx     = this.messages.length - 1;
      const reader  = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        this.messages[idx].content += decoder.decode(value, { stream: true });
        this.cdr.detectChanges();
      }

      this.loading = false;

    } catch {
      this.loading = false;
      this.messages.push({ role: 'assistant', content: 'Server error, please try again. 😔', time: this.now() });
    }
  }
}
