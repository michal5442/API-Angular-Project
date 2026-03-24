import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Song } from '../../models/song.model';
import { CartService } from '../../services/cart.service';
import { AudioService } from '../../services/audio.service';

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
  public audioService = inject(AudioService);

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
    this.audioService.togglePlay(song);
  }

  onSongEnded() {
    // kept for compatibility; main audio element's ended handler will reset service
    // no-op when using AudioService
  }
}
