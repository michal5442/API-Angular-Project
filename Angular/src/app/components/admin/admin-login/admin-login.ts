import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLogin {
  password = '';
  errorMessage = '';

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  onLogin(): void {
    this.adminService.login(this.password).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/admin']);
        } else {
          this.errorMessage = 'Invalid password. Please try again.';
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Invalid password. Please try again.';
      }
    });
  }
}
