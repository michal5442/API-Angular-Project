import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly ADMIN_TOKEN_KEY = 'adminToken';
  private apiUrl = 'https://localhost:44393/api/Admin';

  constructor(private http: HttpClient) {}

  login(password: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/Login`, { password }).pipe(
      map(response => {
        if (response?.success && response?.token) {
          localStorage.setItem(this.ADMIN_TOKEN_KEY, response.token);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  logout(): void {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.ADMIN_TOKEN_KEY);
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const exp  = payload['exp'];
      if (exp && Date.now() / 1000 > exp) {
        this.logout();
        return false;
      }
      return role === 'Admin';
    } catch {
      return false;
    }
  }
}
