import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderItem } from '../models/orderItem.model';

@Injectable({ providedIn: 'root' })
export class OrderItemService {
  private apiUrl = 'https://localhost:44393/api/OrderItems'; 

  constructor(private http: HttpClient) { }
  
  getOrderItems(): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(this.apiUrl);
  }
}