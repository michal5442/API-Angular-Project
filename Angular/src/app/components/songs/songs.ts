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
    console.log('=== Songs ngOnInit ===');
    
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params);
      const artistId = params['artistId'];
      const search = params['search'];
      const minPrice = params['minPrice'];
      const maxPrice = params['maxPrice'];
      
      this.route.data.subscribe(data => {
        this.mode = data['mode'] || 'songs';
        console.log('Mode set to:', this.mode);
        this.title.set(this.mode === 'favorites' ? 'Favorites' : 'Songs');
      });
      
      if (artistId) {
        console.log('Loading songs for artist:', artistId);
        this.loadSongsByArtist(Number(artistId));
      } else if (this.mode === 'favorites') {
        this.loadFavorites();
      } else if (search || minPrice || maxPrice) {
        console.log('Loading songs with search params');
        this.loadSongsWithFilters(search, minPrice, maxPrice);
      } else {
        console.log('Loading all songs');
        this.loadSongs();
      }
    });
  }

  loadSongs() {
    if (this.mode === 'favorites') {
      this.loadFavorites();
    } else {
      this.songsService.getSongs().subscribe({
        next: (res) => {
          console.log('Raw response:', res);
          console.log('Response type:', typeof res);
          console.log('Is array:', Array.isArray(res));
          if (res && res.songs) {
            console.log('First song full object:', res.songs[0]);
            const adaptedSongs = res.songs.map((song: any) => {
              console.log('Song keys:', Object.keys(song));
              console.log('Original song imgUrl:', song.imgUrl);
              console.log('Original song imageUrl:', song.imageUrl);
              const cleaned = (song.imgUrl || song.imageUrl || '').replace(/&quot;/g, '').replace(/\\/g, '/');
              console.log('Cleaned imageUrl:', cleaned);
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
            console.error('Invalid response format:', res);
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
    console.log('loadSongsByArtist called with:', artistId);
    this.title.set(`Songs by Artist`);
    this.songsService.getSongs(artistId).subscribe({
      next: (res) => {
        console.log('Artist songs response:', res);
        if (res && res.songs) {
          const adaptedSongs = res.songs.map((song: any) => {
            console.log('Original song imageUrl:', song.imgUrl || song.imageUrl);
            const cleaned = (song.imgUrl || song.imageUrl || '').replace(/&quot;/g, '').replace(/\\/g, '/');
            console.log('Cleaned imageUrl:', cleaned);
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
          console.log('Adapted songs:', adaptedSongs);
          this.allSongs.set(adaptedSongs);
          this.songs.set(adaptedSongs);
        } else {
          console.error('Invalid response format:', res);
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
    console.log('=== FAVORITES DEBUG ===');
    console.log('Raw favorites:', favorites);
    if (favorites.length > 0) {
      console.log('First favorite imageUrl:', favorites[0].imageUrl);
      console.log('First favorite full object:', favorites[0]);
    }
    console.log('======================');
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
        console.log('Adding to favorites, imageUrl:', song.imageUrl);
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
    console.log('getImageUrl called for:', song.songName, 'imageUrl:', song.imageUrl);
    if (!song.imageUrl || song.imageUrl.length === 0) {
      console.log('No imageUrl, using placeholder');
      return 'https://placehold.co/300x200/4B2152/white?text=No+Image';
    }
    if (song.imageUrl.startsWith('http')) {
      console.log('Already full URL:', song.imageUrl);
      return song.imageUrl;
    }
    const fullUrl = `https://localhost:44393/${song.imageUrl}`;
    console.log('Building full URL:', fullUrl);
    return fullUrl;
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
