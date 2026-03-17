import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from '../models/song.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  updateCartCount(userId: number) {
    const key = `cart_${userId}`;
    const cart = JSON.parse(localStorage.getItem(key) || '[]');
    this.cartCountSubject.next(cart.length);
  }

  addToCart(song: Song, userId: number): boolean {
    const key = `cart_${userId}`;
    const cart = JSON.parse(localStorage.getItem(key) || '[]');
    if (!cart.find((s: Song) => s.id === song.id)) {
      cart.push(song);
      localStorage.setItem(key, JSON.stringify(cart));
      this.cartCountSubject.next(cart.length);
      return true;
    }
    return false;
  }

  removeFromCart(songId: number, userId: number) {
    const key = `cart_${userId}`;
    const cart = JSON.parse(localStorage.getItem(key) || '[]');
    const updatedCart = cart.filter((s: Song) => s.id !== songId);
    localStorage.setItem(key, JSON.stringify(updatedCart));
    this.cartCountSubject.next(updatedCart.length);
    return updatedCart;
  }
}
