import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../models/user.model';
import { Order } from '../../models/order.model';
import { UserService } from '../../services/user';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTabsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);
  
  user = signal<User>({
    userName: '',
    firstName: '',
    lastName: '',
    password: ''
  });
  
  orders = signal<Order[]>([]);
  editMode = signal<boolean>(false);
  expandedOrderId = signal<number | null>(null);

  ngOnInit() {
    this.loadUserData();
    this.loadOrders();
  }

  loadUserData() {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.user.set({ ...currentUser, password: '' });
    }
  }

  loadOrders() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;
    
    this.orderService.getUserOrders(userId).subscribe({
      next: (orders) => {
        console.log('Orders from server:', orders);
        if (orders.length > 0) {
          console.log('First order:', orders[0]);
          console.log('First order keys:', Object.keys(orders[0]));
        }
        const sortedOrders = orders.sort((a, b) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        this.orders.set(sortedOrders);
      },
      error: (error) => console.error('Failed to load orders:', error)
    });
  }

  toggleEditMode() {
    this.editMode.set(!this.editMode());
  }

  saveChanges() {
    const userData: any = {
      id: this.user().id,
      userName: this.user().userName,
      firstName: this.user().firstName,
      lastName: this.user().lastName
    };
    
    if (this.user().password && this.user().password?.trim()) {
      userData.password = this.user().password;
    }
    
    this.userService.updateUser(userData).subscribe({
      next: () => {
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        this.editMode.set(false);
      },
      error: (error) => {
        if (error.error === 'Password too weak') {
          this.snackBar.open('Password is too weak. Please choose a stronger password.', 'Close', { duration: 4000 });
        } else {
          this.snackBar.open('Failed to update profile. Please try again.', 'Close', { duration: 4000 });
        }
      }
    });
  }

  cancelEdit() {
    this.loadUserData();
    this.editMode.set(false);
  }

  toggleOrderDetails(orderId: number) {
    if (this.expandedOrderId() === orderId) {
      this.expandedOrderId.set(null);
    } else {
      this.expandedOrderId.set(orderId);
    }
  }

  isOrderExpanded(orderId: number): boolean {
    return this.expandedOrderId() === orderId;
  }
}
