import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Song } from '../models/song.model';

@Injectable({ providedIn: 'root' })
export class SongService{
  private apiUrl = 'https://localhost:44393/api/Song'; 

  constructor(private http: HttpClient) { }
  
  getSongs(artistId?: number, description?: string, minPrice?: number, maxPrice?: number, skip?: number, position?: number): Observable<{ songs: Song[], total: number }> {
    let params = new HttpParams();
    
    if (artistId) {
      params = params.set('artistId', artistId.toString());
      console.log('Setting artistId param:', artistId);
    }
    if (description) params = params.set('description', description);
    if (minPrice !== undefined) params = params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params = params.set('maxPrice', maxPrice.toString());
    params = params.set('skip', '1000');
    params = params.set('position', '1');
    
    const url = `${this.apiUrl}?${params.toString()}`;
    console.log('Request URL:', url);
    
    return this.http.get<{ songs: Song[], total: number }>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('SongService error:', error);
        return of({ songs: [], total: 0 });
      })
    );
  }

  getSongById(id: number): Observable<Song> {
    return this.http.get<Song>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching song:', error);
        return of({} as Song);
      })
    );
  }

  addSong(song: Song): Observable<Song> {
    return this.http.post<Song>(this.apiUrl, song).pipe(
      catchError(error => {
        console.error('Error adding song:', error);
        throw error;
      })
    );
  }

  updateSong(id: number, song: Song): Observable<Song> {
    return this.http.put<Song>(`${this.apiUrl}/${id}`, song).pipe(
      catchError(error => {
        console.error('Error updating song:', error);
        throw error;
      })
    );
  }

  deleteSong(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting song:', error);
        throw error;
      })
    );
  }
}
