import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Song } from '../../models/song.model';
import { OrderService } from '../../services/order';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private router = inject(Router);
  
  cartItems = signal<Song[]>([]);
  totalPrice = signal<number>(0);
  userEmail = signal<string>('');
  orderCompleted = signal<boolean>(false);

  ngOnInit() {
    this.loadCart();
    this.loadUserEmail();
  }

  loadCart() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;
    
    const key = `cart_${userId}`;
    const cart = JSON.parse(localStorage.getItem(key) || '[]');
    this.cartItems.set(cart);
    this.calculateTotal();
  }

  loadUserEmail() {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      this.userEmail.set(userData.userName);
    }
  }

  calculateTotal() {
    const total = this.cartItems().reduce((sum, item) => sum + item.price, 0);
    this.totalPrice.set(total);
  }

  completeOrder() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) {
      alert('Please login first');
      return;
    }

    const order = {
      OrderId: 0,
      UserId: Number(userId),
      OrderDate: new Date().toISOString(),
      OrderSum: Number(this.totalPrice()),
      OrderItems: this.cartItems().map(item => ({
        OrderItemId: 0,
        OrderId: 0,
        SongId: Number(item.id)
      }))
    };

    this.orderService.createOrder(order).subscribe({
      next: (response) => {
        const key = `cart_${userId}`;
        localStorage.setItem(key, '[]');
        this.orderCompleted.set(true);
        window.dispatchEvent(new Event('cartUpdated'));
      },
      error: (error) => {
        console.error('Order failed:', error);
        alert('Purchase failed. Please try again.');
      }
    });
  }

  backToSongs() {
    this.router.navigate(['/songs']);
  }
}
