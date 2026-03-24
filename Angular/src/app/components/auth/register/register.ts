import { Component,signal,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../services/user';
import {User} from '../../../models/user.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})

export class Register {
  private usersService = inject(UserService);
  private router = inject(Router);

  newUser: User = {
    userName: '',
    firstName: '',
    lastName: '',
    password: ''
  };
  confirmPassword = '';

  onRegister() {
    // 1. בדיקת התאמת סיסמאות (ולידציה ידנית נוספת)
    if (this.newUser.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Registering user...', this.newUser);

    this.usersService.register(this.newUser).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        alert('Registration successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        
        // אם השרת החזירBadRequest (400)
        if (error.status === 400) {
          // ב-Angular, הטקסט שהשרת מחזיר (כמו "Password too weak") נמצא ב-error.error
          // אם זה טקסט פשוט, נציג אותו. אם זה אובייקט, נציג הודעה כללית.
          const serverMessage = typeof error.error === 'string' ? error.error : 'Invalid input data';
          alert('Error: ' + serverMessage);
        } else {
          alert('Server error. Please try again later.');
        }
      }
    });
  }
}