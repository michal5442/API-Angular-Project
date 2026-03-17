import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { Order } from '../models/order.model'; 

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'https://localhost:44393/api/Order'; 

  constructor(private http: HttpClient) { }
  
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }

  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(() => of([]))
    );
  }

  createOrder(order: any): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order).pipe(
      catchError(err => throwError(() => err))
    );
  }
}