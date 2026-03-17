import { Component, signal,inject, OnInit } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SongService } from '../../services/song.service';
import { Song } from '../../models/song.model';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatBadgeModule, MatSliderModule, MatTooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  searchQuery = signal('');
  minPrice = signal(0);
  maxPrice = signal(100);
  cartItemsCount = signal(0);
  isLoggedIn = signal(false);
  private songsService = inject(SongService);
  private router = inject(Router);
  songs = signal<Song[]>([]);

  ngOnInit() {
    this.checkLoginStatus();
    this.updateCartCount();
    
    // האזנה לעדכוני סל
    window.addEventListener('cartUpdated', () => {
      this.updateCartCount();
    });
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkLoginStatus();
      this.updateCartCount();
    });
  }

  checkLoginStatus() {
    const user = localStorage.getItem('currentUser');
    console.log('Checking login status - user from localStorage:', user);
    this.isLoggedIn.set(!!user);
    console.log('isLoggedIn set to:', !!user);
  }

  updateCartCount() {
    const user = localStorage.getItem('currentUser');
    if (!user || user === 'null') {
      this.cartItemsCount.set(0);
      return;
    }
    
    try {
      const parsedUser = JSON.parse(user);
      const userId = parsedUser?.id || parsedUser?.userId || parsedUser?.UserId;
      
      if (!userId) {
        this.cartItemsCount.set(0);
        return;
      }
      
      const key = `cart_${userId}`;
      const cart = JSON.parse(localStorage.getItem(key) || '[]');
      this.cartItemsCount.set(cart.length);
    } catch (error) {
      console.error('Error in updateCartCount:', error);
      this.cartItemsCount.set(0);
    }
  }

  onSearch() {
    this.songsService.getSongs(
      undefined, 
      this.searchQuery(), 
      this.minPrice(), 
      this.maxPrice(), 
    ).subscribe(res => {
      this.songs.set(res.songs);
    });
  }

  onLogin() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onProfile() {
    this.router.navigate(['/profile']);
  }

  onLoginLogout() {
    if (this.isLoggedIn()) {
      localStorage.removeItem('currentUser');
      this.isLoggedIn.set(false);
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onCart() {
    this.router.navigate(['/cart']);
  }
}