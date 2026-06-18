import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { UserHistoryService } from '../../services/user-history.service';
import { UserService } from '../../services/user';
import { AudioService } from '../../services/audio.service';
import { Song } from '../../models/song.model';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private userHistoryService = inject(UserHistoryService);
  private userService = inject(UserService);
  private router = inject(Router);
  public audioService = inject(AudioService);

  recommendations = signal<Song[]>([]);
  isLoggedIn = signal<boolean>(false);

  ngOnInit() {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      this.isLoggedIn.set(true);
      this.userHistoryService.getRecommendations(userId).subscribe(songs => {
        this.recommendations.set(songs);
      });
    }
  }

  playSong(song: Song) {
    this.audioService.togglePlay(song);
    this.router.navigate(['/song-detail', song.id]);
  }
}
