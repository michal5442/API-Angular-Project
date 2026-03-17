import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Rating } from '../models/rating.model';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private apiUrl = 'https://localhost:44393/api/Ratings'; 

  constructor(private http: HttpClient) { }
  
  getRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }
}
