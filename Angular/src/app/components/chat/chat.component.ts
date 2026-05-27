import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: { role: string; content: string }[] = [
    {
      role: 'assistant',
      content: 'Hey! I\'m Musix 🎵 the smart assistant of MY Music.\n\nI can help you with:\n🎵 Search songs & artists\n🛒 Manage your cart\n❤️ Your favorites\n📦 Track orders\n👤 Profile details\n\nWhat would you like to know?'
    }
  ];
  input = '';
  loading = false;
  isOpen = false;

  constructor(private chatService: ChatService, private router: Router) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  send() {
    if (!this.input.trim() || this.loading) return;

    const userMsg = this.input;
    this.input = '';
    this.loading = true;
    this.messages.push({ role: 'user', content: userMsg });

    this.chatService.send(userMsg, this.messages.slice(0, -1)).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.action === 'navigate_artist') {
          this.messages.push({ role: 'assistant', content: res.reply });
          setTimeout(() => this.router.navigate(['/songs'], { queryParams: { artistId: res.artistId } }), 1000);
        } else if (res?.reply) {
          this.messages.push({ role: 'assistant', content: res.reply });
        }
      },
      error: () => {
        this.loading = false;
        this.messages.push({ role: 'assistant', content: 'Server error, please try again. 😔' });
      }
    });
  }

  onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }
}
