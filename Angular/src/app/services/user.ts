import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'https://localhost:44393/api/User';

  constructor(private http: HttpClient) {}

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/Register`, user).pipe(
      catchError(err => throwError(() => err))
    );
  }

  login(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Login`, user).pipe(
      tap(response => {
        if (response?.user) {
          localStorage.setItem('currentUser', JSON.stringify({
            ...response.user,
            token: response.token
          }));
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    return (user as any).userId || (user as any).id || (user as any).Id || null;
  }

  getPreferredTheme(): string {
    const user = this.getCurrentUser();
    return user?.preferredTheme ?? 'LIGHT';
  }

  updateTheme(userId: number, theme: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${userId}/theme`, JSON.stringify(theme), {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(() => {
        const user = this.getCurrentUser();
        if (user) {
          user.preferredTheme = theme;
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user).pipe(
      tap(updatedUser => localStorage.setItem('currentUser', JSON.stringify(updatedUser))),
      catchError(err => throwError(() => err))
    );
  }
}
