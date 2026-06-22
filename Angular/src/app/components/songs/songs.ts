import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Song } from '../../models/song.model';
import { SongService } from '../../services/song.service';
import { UserService } from '../../services/user';
import { AudioService } from '../../services/audio.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-songs',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSliderModule],
  templateUrl: './songs.html',
  styleUrl: './songs.css',
})
export class Songs implements OnInit {
  mode: 'songs' | 'favorites' = 'songs';
  title = signal<string>('Songs');
  minPrice = signal(0);
  maxPrice = signal(100);
  allSongs = signal<Song[]>([]);
  
  private songsService = inject(SongService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  audioService = inject(AudioService);
  songs = signal<Song[]>([]);
  constructor(private router: Router) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.mode = data['mode'] || 'songs';
      this.title.set(this.mode === 'favorites' ? 'Favorites' : 'Songs');

      this.route.queryParams.subscribe(params => {
        const artistId = params['artistId'];
        const search = params['search'];
        const minPrice = params['minPrice'];
        const maxPrice = params['maxPrice'];

        if (artistId) {
          this.loadSongsByArtist(Number(artistId));
        } else if (this.mode === 'favorites') {
          this.loadFavorites();
        } else if (search || minPrice || maxPrice) {
          this.loadSongsWithFilters(search, minPrice, maxPrice);
        } else {
          this.loadSongs();
        }
      });
    });
  }

  loadSongs() {
    if (this.mode === 'favorites') {
      this.loadFavorites();
    } else {
      this.songsService.getSongs().subscribe({
        next: (res) => {
          if (res && res.songs) {
            const adaptedSongs = res.songs.map((song: any) => {
              const cleaned = (song.imgUrl || song.imageUrl || '').replace(/&quot;/g, '').replace(/\\/g, '/');
              return {
                id: song.songId || song.id,
                songName: song.songName,
                artistId: song.artistId,
                artist: song.artist,
                price: song.price,
                imageUrl: cleaned,
                songUrl: song.songUrl,
                description: song.description,
                duration: song.duration
              };
            });
            this.allSongs.set(adaptedSongs);
            this.songs.set(this.shuffleArray(adaptedSongs));
          } else {
            this.allSongs.set([]);
            this.songs.set([]);
          }
        },
        error: (err) => console.error('Error loading songs:', err)
      });
    }
  }

  loadSongsWithFilters(search?: string, minPrice?: string, maxPrice?: string) {
    this.songsService.getSongs(
      undefined,
      search,
      minPrice ? Number(minPrice) : undefined,
      maxPrice ? Number(maxPrice) : undefined
    ).subscribe({
      next: (res) => {
        if (res && res.songs) {
          const adaptedSongs = res.songs.map((song: any) => {
            const cleaned = (song.imgUrl || song.imageUrl || '').replace(/&quot;/g, '').replace(/\\/g, '/');
            return {
              id: song.songId || song.id,
              songName: song.songName,
              artistId: song.artistId,
              artist: song.artist,
              price: song.price,
              imageUrl: cleaned,
              songUrl: song.songUrl,
              description: song.description,
              duration: song.duration
            };
          });
          this.allSongs.set(adaptedSongs);
          this.songs.set(adaptedSongs);
        } else {
          this.allSongs.set([]);
          this.songs.set([]);
        }
      },
      error: (err) => console.error('Error loading songs:', err)
    });
  }

  loadSongsByArtist(artistId: number) {
    this.title.set(`Songs by Artist`);
    this.songsService.getSongs(artistId).subscribe({
      next: (res) => {
        if (res && res.songs) {
          const adaptedSongs = res.songs.map((song: any) => {
            const cleaned = (song.imgUrl || song.imageUrl || '').replace(/&quot;/g, '').replace(/\\/g, '/');
            return {
              id: song.songId || song.id,
              songName: song.songName,
              artistId: song.artistId,
              artist: song.artist,
              price: song.price,
              imageUrl: cleaned,
              songUrl: song.songUrl,
              description: song.description,
              duration: song.duration
            };
          });
          this.allSongs.set(adaptedSongs);
          this.songs.set(adaptedSongs);
        } else {
          this.allSongs.set([]);
          this.songs.set([]);
        }
      },
      error: (err) => console.error('Error loading songs:', err)
    });
  }

  loadFavorites() {
    const user = localStorage.getItem('currentUser');
    const userId = user ? JSON.parse(user).id : null;
    if (!userId) return;
    const key = `favorites_${userId}`;
    const favorites = JSON.parse(localStorage.getItem(key) || '[]');
    this.songs.set(favorites);
  }

  goToDetail(id: number) {
    this.router.navigate(['/song-detail', id]);
  }

  addToCart(song: Song, event: Event) {
    event.stopPropagation();
    const userId = this.userService.getCurrentUserId();
    if (!userId) {
      alert('Please login to add to cart');
      return;
    }
    
    const key = `cart_${userId}`;
    const cart = JSON.parse(localStorage.getItem(key) || '[]');
    if (!cart.find((s: Song) => s.id === song.id)) {
      cart.push(song);
      localStorage.setItem(key, JSON.stringify(cart));
      this.snackBar.open('Added to cart!', '', { duration: 2000 });
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      this.snackBar.open('Already in cart!', '', { duration: 2000 });
    }
  }

  addToFavorites(song: Song, event: Event) {
    event.stopPropagation();
    const userId = this.userService.getCurrentUserId();
    if (!userId) {
      alert('Please login to manage favorites');
      return;
    }
    
    const key = `favorites_${userId}`;
    const favorites = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (this.mode === 'favorites') {
      const updatedFavorites = favorites.filter((s: Song) => s.id !== song.id);
      localStorage.setItem(key, JSON.stringify(updatedFavorites));
      this.loadFavorites();
      this.snackBar.open('Removed from favorites!', '', { duration: 2000 });
    } else {
      if (!favorites.find((s: Song) => s.id === song.id)) {
        favorites.push(song);
        localStorage.setItem(key, JSON.stringify(favorites));
        this.snackBar.open('Added to favorites!', '', { duration: 2000 });
      } else {
        this.snackBar.open('Already in favorites!', '', { duration: 2000 });
      }
    }
  }

  togglePlay(song: Song, event: Event) {
    event.stopPropagation();
    this.audioService.togglePlay(song);
  }

  isPlaying(songId: number): boolean {
    return this.audioService.isPlayingSong(songId);
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getImageUrl(song: Song): string {
    if (!song.imageUrl || song.imageUrl.length === 0) {
      return 'https://placehold.co/300x200/4B2152/white?text=No+Image';
    }
    if (song.imageUrl.startsWith('http')) {
      return song.imageUrl;
    }
    return `https://localhost:44393/${song.imageUrl}`;
  }

  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  onPriceChange() {
    const filtered = this.allSongs().filter(song => 
      song.price >= this.minPrice() && song.price <= this.maxPrice()
    );
    this.songs.set(filtered);
  }
}
