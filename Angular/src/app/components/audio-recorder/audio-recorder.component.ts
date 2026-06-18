import { Component, EventEmitter, Output, Input, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

@Component({
  selector: 'app-audio-recorder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-recorder.component.html',
  styleUrls: ['./audio-recorder.component.css']
})
export class AudioRecorderComponent {
  @Output() transcribed = new EventEmitter<string>();
  @Input() existingText = '';

  recording = false;
  starting  = false;

  private recognition: any;
  private accumulatedText = '';
  private stoppedByUser = false;

  constructor(private zone: NgZone) {}

  toggle() {
    if (this.recording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  async startRecording() {
    if (this.starting || this.recording) return;
    this.starting = true;

    const SpeechAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechAPI) {
      alert('Speech recognition is not supported in this browser.');
      this.starting = false;
      return;
    }

    this.accumulatedText = this.existingText ? this.existingText.trimEnd() + ' ' : '';
    this.stoppedByUser = false;

    this.recognition = new SpeechAPI();
    this.recognition.lang = 'he-IL';
    this.recognition.interimResults = true;
    this.recognition.continuous = true;

    this.recognition.onstart = () => {
      this.zone.run(() => {
        this.recording = true;
        this.starting  = false;
      });
    };

    this.recognition.onresult = (event: any) => {
      this.zone.run(() => {
        let interim = '';
        let finalText = this.accumulatedText;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += this.autoPunctuate(transcript) + ' ';
          } else {
            interim = transcript;
          }
        }
        this.accumulatedText = finalText;
        this.transcribed.emit((finalText + interim).trim());
      });
    };

    this.recognition.onerror = (e: any) => {
      if (e.error === 'no-speech') return; // מתעלם, ה-onend יטפל
      this.zone.run(() => this.stopRecording());
    };

    this.recognition.onend = () => {
      this.zone.run(() => {
        if (!this.stoppedByUser && this.recording) {
          // הדפדפן סיים לבד (שתיקה) — מפעיל מחדש
          try { this.recognition.start(); } catch {}
        } else {
          this.cleanup();
        }
      });
    };

    this.recognition.start();
  }

  stopRecording() {
    this.stoppedByUser = true;
    if (this.recognition) {
      this.recognition.stop();
    }
    this.cleanup();
  }

  private autoPunctuate(text: string): string {
    text = text.trim();
    if (!text) return text;

    // הסר פיסוק קיים בסוף לפני שנוסיף
    text = text.replace(/[,،.!?؟]+$/, '');

    const lower = text.toLowerCase();

    // סימן קריאה
    const exclamationHe = /^(וואו|אחלה|מדהים|נהדר|מצוין|כל הכבוד|יופי|ברור|בטח|כן כן|לא לא|עזוב|די|חבל|איזה יופי|איזה כיף)/i;
    const exclamationEn = /^(wow|amazing|great|awesome|excellent|sure|of course|yes yes|no no|stop|enough)/i;

    // סימן שאלה — עברית
    const questionHe = /(\?|؟)$/.test(text) ||
      /^(מה|איך|מתי|איפה|למה|כמה|האם|מי|אילו|באיזה|האם|כיצד|מהו|מהי|מאין|לאן|מנין|עד מתי|כמה זמן)/i.test(text);

    // סימן שאלה — אנגלית
    const questionEn =
      /^(what|how|when|where|why|who|which|whose|whom|is |are |was |were |do |does |did |can |could |would |should |shall |have |has |had |will |may |might )/i.test(text);

    if (exclamationHe.test(text) || exclamationEn.test(text)) {
      return text + '!';
    }
    if (questionHe || questionEn) {
      return text + '?';
    }
    return text + '.';
  }

  private cleanup() {
    this.recording     = false;
    this.starting      = false;
    this.stoppedByUser = false;
  }
}
