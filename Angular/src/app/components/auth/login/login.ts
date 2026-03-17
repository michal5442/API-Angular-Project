import { Component,inject } from '@angular/core';
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
  selector: 'app-login',
  imports: [CommonModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private usersService = inject(UserService);
  private router = inject(Router);
  user: User ={
    userName: '',
    firstName: '',
    lastName: '',
    password:''
  };
  
  onLogin(){
    console.log('Trying to login with:', this.user);
    this.usersService.login(this.user).subscribe({
      next: (response) => {
        console.log('Login SUCCESS:', response);
        if (!response) {
          alert('Invalid username or password. Please register first.');
          this.router.navigate(['/register']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.log('Login ERROR - Status:', error.status);
        console.log('Login ERROR - Full:', error);
        alert('Invalid username or password. Please register first.');
        this.router.navigate(['/register']);
      }
    });
  }
}