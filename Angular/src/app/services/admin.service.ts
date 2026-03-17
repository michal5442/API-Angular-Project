import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly ADMIN_KEY = 'isAdmin';
  private apiUrl = 'https://localhost:44393/api/Admin';

  constructor(private http: HttpClient) {}

  login(password: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/Login`, { password: password }).pipe(
      map(response => {
        if (response && response.success) {
          localStorage.setItem(this.ADMIN_KEY, 'true');
          return true;
        }
        return false;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.ADMIN_KEY);
  }

  isAdmin(): boolean {
    return localStorage.getItem(this.ADMIN_KEY) === 'true';
  }
}
