import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song } from '../models/song.model';

@Injectable({ providedIn: 'root' })
export class UserHistoryService {
  private apiUrl = 'https://localhost:44393/api/UserHistory';

  constructor(private http: HttpClient) {}

  recordListen(userId: number, songId: number): Observable<void> {
    return this.http.post<void>(this.apiUrl, { userId, songId });
  }

  getRecommendations(userId: number): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.apiUrl}/recommended/${userId}`);
  }
}
