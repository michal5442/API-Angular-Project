import { Component,inject,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ArtistService } from '../../services/artist';
import { Artist } from '../../models/artist.model';

@Component({
  selector: 'app-artists',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './artists.html',
  styleUrl: './artists.css',
})
export class Artists {
  private artistsService = inject(ArtistService);
  private router = inject(Router);
  artists = signal<Artist[]>([]);

  ngOnInit() {
    this.loadArtists();
  }

  loadArtists() {
    console.log('Loading artists...');
    this.artistsService.getArtists().subscribe({
      next: (res) => {
        console.log('Artists loaded:', res);
        this.artists.set(res);
      },
      error: (error) => {
        console.error('Error loading artists:', error);
      }
    });
  }

  goToArtistSongs(artistId: number) {
    console.log('Navigating to songs with artistId:', artistId);
    const artist = this.artists().find(a => a.id === artistId);
    console.log('Found artist:', artist);
    console.log('Songs count:', artist?.songsCount);
    if (artist && artist.songsCount > 0) {
      console.log('Navigating - artist has songs');
      this.router.navigate(['/songs'], { queryParams: { artistId } });
    } else {
      console.log('NOT navigating - songsCount is:', artist?.songsCount);
    }
  }
}