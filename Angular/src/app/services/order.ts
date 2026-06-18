import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, retry, throwError, timer } from 'rxjs';
import { Order } from '../models/order.model'; 

const RETRY_CONFIG = { count: 3, delay: (n: number) => timer(n * 1000) };

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'https://localhost:44393/api/Order'; 

  constructor(private http: HttpClient) { }
  
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl).pipe(
      retry(RETRY_CONFIG),
      catchError(() => of([]))
    );
  }

  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`).pipe(
      retry(RETRY_CONFIG),
      catchError(() => of([]))
    );
  }

  createOrder(order: any): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order).pipe(
      catchError(err => throwError(() => err))
    );
  }
}