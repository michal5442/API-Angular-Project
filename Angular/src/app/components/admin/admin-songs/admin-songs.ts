import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SongService } from '../../../services/song.service';
import { AdminService } from '../../../services/admin.service';
import { Song } from '../../../models/song.model';
import { AudioService } from '../../../services/audio.service';

@Component({
  selector: 'app-admin-songs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './admin-songs.html',
  styleUrls: ['./admin-songs.css']
})
export class AdminSongs implements OnInit {
  songs = signal<Song[]>([]);
  showModal = false;
  isEditMode = false;
  currentSong: any = {};
  public audioService = inject(AudioService);

  constructor(
    private songService: SongService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.loadSongs();
  }

  loadSongs(): void {
    console.log('Loading songs...');
    this.songService.getSongs().subscribe({
      next: (response: any) => {
        console.log('Songs response:', response);
        let songsData = [];
        if (Array.isArray(response)) {
          songsData = response;
        } else if (response && response.songs) {
          songsData = response.songs;
        }
        
        // Map API fields to model fields
        const mappedSongs = songsData.map((song: any) => ({
          id: song.songId || song.id,
          songName: song.songName,
          artist: song.artist,
          artistId: song.artistId,
          price: song.price,
          imageUrl: song.imgUrl || song.imageUrl,
          songUrl: song.songUrl,
          description: song.description,
          duration: song.duration
        }));
        
        this.songs.set(mappedSongs);
        console.log('Songs loaded:', this.songs().length);
        console.log('Songs array:', this.songs());
      },
      error: (error) => {
        console.error('Error loading songs:', error);
        this.songs.set([]);
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentSong = {
      songName: '',
      artist: '',
      artistId: null,
      description: '',
      price: 0,
      duration: 0,
      imageUrl: '',
      songUrl: ''
    };
    this.showModal = true;
  }

  openEditModal(song: Song): void {
    this.isEditMode = true;
    this.currentSong = { ...song };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentSong = {};
  }

  saveSong(): void {
    if (this.isEditMode) {
      this.songService.updateSong(this.currentSong.id, this.currentSong).subscribe(() => {
        this.loadSongs();
        this.closeModal();
      });
    } else {
      this.songService.addSong(this.currentSong).subscribe(() => {
        this.loadSongs();
        this.closeModal();
      });
    }
  }

  deleteSong(id: number): void {
    if (confirm('Are you sure you want to delete this song?')) {
      this.songService.deleteSong(id).subscribe(() => {
        this.loadSongs();
      });
    }
  }

  logout(): void {
    this.adminService.logout();
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  playSong(song: Song): void {
    console.log('Playing song:', song);
    if (!song.songUrl) {
      alert('No song URL available');
      return;
    }
    // Delegate playback to the shared AudioService so only one audio plays
    this.audioService.togglePlay(song);
  }
}
