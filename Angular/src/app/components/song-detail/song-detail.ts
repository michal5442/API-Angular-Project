import { Component, signal, inject, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SongService } from '../../services/song.service';
import { Song } from '../../models/song.model';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user';
import { ArtistService } from '../../services/artist';

@Component({
  selector: 'app-song-detail',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './song-detail.html',
  styleUrl: './song-detail-new.css',
})
export class SongDetail {
  private songsService = inject(SongService);
  private artistService = inject(ArtistService);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar); 
  
  song = signal<Song | undefined>(undefined);
  artistName = signal<string>('');
  isPlaying = signal<boolean>(false);
  currentTime = signal<number>(0);
  progressPercentage = signal<number>(0);
  audioInitialized = signal<boolean>(false);
  audioPlayer = viewChild<ElementRef<HTMLAudioElement>>('audioPlayer');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSong(Number(id));
    }
  }

  loadSong(id:number){
    this.songsService.getSongById(id).subscribe(res => {
      console.log('Song from server:', res);
      console.log('ImageUrl:', res.imageUrl);
      const cleanedSong = {
        ...res,
        imageUrl: (res.imageUrl || '').replace(/&quot;/g, '').replace(/\\/g, '/')
      };
      console.log('Cleaned imageUrl:', cleanedSong.imageUrl);
      this.song.set(cleanedSong);
      if (res.artistId) {
        this.artistService.getArtistById(res.artistId).subscribe(
          artist => this.artistName.set(artist.name)
        );
      }
    });
  }

  formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  addSongToFavorites(){
    const currentSong = this.song();
    const userId = this.userService.getCurrentUserId();
    if (!currentSong || !userId) {
      alert('Please login to add to favorites');
      return;
    }
    
    const key = `favorites_${userId}`;
    const favorites = JSON.parse(localStorage.getItem(key) || '[]');
    if (!favorites.find((s: Song) => s.id === currentSong.id)) {
      favorites.push(currentSong);
      localStorage.setItem(key, JSON.stringify(favorites));
      this.snackBar.open('Added to favorites!', '', { duration: 2000 });
    } else {
      this.snackBar.open('Already in favorites!', '', { duration: 2000 });
    }
  }

  addSongToCart(){
    const currentSong = this.song();
    const userId = this.userService.getCurrentUserId();
    if (!currentSong || !userId) {
      alert('Please login to add to cart');
      return;
    }
    
    const key = `cart_${userId}`;
    const cart = JSON.parse(localStorage.getItem(key) || '[]');
    if (!cart.find((s: Song) => s.id === currentSong.id)) {
      cart.push(currentSong);
      localStorage.setItem(key, JSON.stringify(cart));
      this.snackBar.open('Added to cart!', '', { duration: 2000 });
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      this.snackBar.open('Already in cart!', '', { duration: 2000 });
    }
  }

  getArtistName(id: number){
    this.artistService.getArtistById(id).subscribe(
      artist => this.artistName.set(artist.name)
    );
  }

  togglePlay() {
    const audio = this.audioPlayer()?.nativeElement;
    if (!audio) return;
    
    const currentSong = this.song();
    if (!currentSong?.songUrl) return;
    
    // Set src only once
    if (!this.audioInitialized()) {
      const relativePath = currentSong.songUrl.substring(currentSong.songUrl.indexOf('music')).replace(/\\/g, '/').replace(/"/g, '');
      const fullUrl = `https://localhost:44393/${relativePath}`;
      audio.src = fullUrl;
      this.audioInitialized.set(true);
      console.log('Audio initialized with:', fullUrl);
    }
    
    console.log('Audio paused state:', audio.paused);
    
    if (audio.paused) {
      audio.play().then(() => {
        this.isPlaying.set(true);
        console.log('Started playing');
      }).catch(error => {
        console.error('Error playing audio:', error);
      });
    } else {
      audio.pause();
      this.isPlaying.set(false);
      console.log('Paused');
    }
  }

  onSongEnded() {
    this.isPlaying.set(false);
    this.currentTime.set(0);
    this.progressPercentage.set(0);
    // Don't reset audioInitialized so the song continues from where it stopped
  }

  onTimeUpdate() {
    const audio = this.audioPlayer()?.nativeElement;
    if (audio) {
      const currentTime = Math.floor(audio.currentTime);
      const duration = this.song()?.duration || 0;
      
      this.currentTime.set(currentTime);
      
      if (duration > 0) {
        const percentage = (audio.currentTime / duration) * 100;
        this.progressPercentage.set(percentage);
      }
    }
  }

  seekTo(event: MouseEvent) {
    const audio = this.audioPlayer()?.nativeElement;
    const duration = this.song()?.duration;
    if (!audio || !duration) return;
    
    const progressBar = event.currentTarget as HTMLElement;
    const clickX = event.offsetX;
    const width = progressBar.offsetWidth;
    const percentage = clickX / width;
    
    audio.currentTime = duration * percentage;
  }
}
