import { Injectable, signal } from '@angular/core';
import { Song } from '../models/song.model';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audio = new Audio();
  currentPlayingId = signal<number | null>(null);
  isPlaying = signal(false);

  constructor() {
    this.audio.addEventListener('ended', () => {
      this.currentPlayingId.set(null);
      this.isPlaying.set(false);
    });
  }

  togglePlay(song: Song) {
    if (this.currentPlayingId() === song.id) {
      if (this.audio.paused) {
        this.audio.play();
        this.isPlaying.set(true);
      } else {
        this.audio.pause();
        this.isPlaying.set(false);
      }
    } else {
      this.audio.pause();
      const relativePath = song.songUrl.substring(song.songUrl.indexOf('music')).replace(/\\/g, '/').replace(/"/g, '');
      const fullUrl = `https://localhost:44393/${relativePath}`;
      this.audio.src = fullUrl;
      this.audio.play();
      this.currentPlayingId.set(song.id);
      this.isPlaying.set(true);
    }
  }

  isPlayingSong(songId: number): boolean {
    return this.currentPlayingId() === songId && !this.audio.paused;
  }
}
