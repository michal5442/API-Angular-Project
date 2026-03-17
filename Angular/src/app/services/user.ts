import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'https://localhost:44393/api/User'; 
  
  constructor(private http: HttpClient) { }
    
  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/Register`, user).pipe(
      catchError(err => throwError(() => err))
    );
  }

  login(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/Login`, user).pipe(
      tap(loggedUser => {
        if (loggedUser) {
          localStorage.setItem('currentUser', JSON.stringify(loggedUser));
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  getCurrentUserId(): number | null {
    const user = localStorage.getItem('currentUser');
    console.log('Raw user from localStorage:', user);
    if (!user) return null;
    const parsedUser = JSON.parse(user);
    console.log('Parsed user:', parsedUser);
    console.log('User id:', parsedUser.id);
    console.log('User Id:', parsedUser.Id);
    return parsedUser.id || parsedUser.Id || null;
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user).pipe(
      tap(updatedUser => localStorage.setItem('currentUser', JSON.stringify(updatedUser))),
      catchError(err => throwError(() => err))
    );
  }
}