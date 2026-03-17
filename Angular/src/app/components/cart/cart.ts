import { Component, signal, OnInit, inject, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Song } from '../../models/song.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  private router = inject(Router);
  private cartService = inject(CartService);
  cartItems = signal<Song[]>([]);
  totalPrice = signal<number>(0);
  currentPlayingId = signal<number | null>(null);
  audioPlayer = viewChild<ElementRef<HTMLAudioElement>>('audioPlayer');

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    const user = localStorage.getItem('currentUser');
    const userId = user ? JSON.parse(user).id : null;
    if (!userId) return;
    
    const key = `cart_${userId}`;
    const cart = JSON.parse(localStorage.getItem(key) || '[]');
    this.cartItems.set(cart);
    this.calculateTotal();
  }

  removeFromCart(songId: number) {
    const user = localStorage.getItem('currentUser');
    const userId = user ? JSON.parse(user).id : null;
    if (!userId) return;
    
    const updatedCart = this.cartService.removeFromCart(songId, userId);
    this.cartItems.set(updatedCart);
    this.calculateTotal();
  }

  calculateTotal() {
    const total = this.cartItems().reduce((sum, item) => sum + item.price, 0);
    this.totalPrice.set(total);
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }

  togglePlay(song: Song) {
    const audio = this.audioPlayer()?.nativeElement;
    if (!audio) return;

    if (this.currentPlayingId() === song.id) {
      // If it's the same song - just pause/resume
      if (audio.paused) {
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      } else {
        audio.pause();
      }
    } else {
      // If it's a new song - switch song
      const fullUrl = `https://localhost:44393/${song.songUrl}`;
      console.log('Playing song:', fullUrl);
      audio.src = fullUrl;
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      this.currentPlayingId.set(song.id);
    }
  }

  onSongEnded() {
    this.currentPlayingId.set(null);
  }
}
