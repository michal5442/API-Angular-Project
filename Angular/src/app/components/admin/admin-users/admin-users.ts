import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.css']
})
export class AdminUsers implements OnInit {
  users = signal<User[]>([]);
  displayedColumns = ['id', 'userName', 'firstName', 'lastName', 'actions'];
  private apiUrl = 'https://localhost:44393/api/User';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('AdminUsers ngOnInit called');
    this.loadUsers();
  }

  loadUsers(): void {
    console.log('Loading users from:', this.apiUrl);
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (response) => {
        console.log('Users response:', response);
        console.log('First user:', response[0]);
        // Map API fields to model fields
        const mappedUsers = response.map((user: any) => ({
          id: user.userId || user.id,
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName
        }));
        console.log('Mapped users:', mappedUsers);
        this.users.set(mappedUsers);
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  deleteUser(id: number | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.loadUsers(),
        error: (error) => console.error('Error deleting user:', error)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
