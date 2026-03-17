import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { ArtistService } from '../../../services/artist';
import { Artist } from '../../../models/artist.model';

@Component({
  selector: 'app-admin-artists',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatCardModule],
  templateUrl: './admin-artists.html',
  styleUrls: ['./admin-artists.css']
})
export class AdminArtists implements OnInit {
  artists = signal<Artist[]>([]);
  displayedColumns = ['id', 'name', 'songsCount', 'actions'];
  showModal = false;
  isEditMode = false;
  currentArtist: any = {};

  constructor(
    private artistService: ArtistService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.artistService.getArtists().subscribe({
      next: (artists) => {
        console.log('Artists loaded:', artists);
        this.artists.set(artists);
      },
      error: (error) => console.error('Error loading artists:', error)
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentArtist = { name: '', imageUrl: '', songsCount: 0 };
    this.showModal = true;
  }

  openEditModal(artist: Artist): void {
    this.isEditMode = true;
    this.currentArtist = { ...artist };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentArtist = {};
  }

  saveArtist(): void {
    if (this.isEditMode) {
      this.artistService.updateArtist(this.currentArtist.id, this.currentArtist).subscribe({
        next: () => {
          this.loadArtists();
          this.closeModal();
        },
        error: (error) => console.error('Error updating artist:', error)
      });
    } else {
      this.artistService.addArtist(this.currentArtist).subscribe({
        next: () => {
          this.loadArtists();
          this.closeModal();
        },
        error: (error) => console.error('Error adding artist:', error)
      });
    }
  }

  deleteArtist(id: number): void {
    console.log('Deleting artist with id:', id);
    if (confirm('Are you sure you want to delete this artist?')) {
      this.artistService.deleteArtist(id).subscribe({
        next: () => {
          console.log('Artist deleted successfully');
          this.loadArtists();
        },
        error: (error) => console.error('Error deleting artist:', error)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
