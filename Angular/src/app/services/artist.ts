import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Artist } from '../models/artist.model';

@Injectable({ providedIn: 'root' })
export class ArtistService {
  private apiUrl = 'https://localhost:44393/api/Artist'; 

  constructor(private http: HttpClient) { }
  
  getArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }

  getArtistById(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of({} as Artist))
    );
  }

  addArtist(artist: Artist): Observable<Artist> {
    return this.http.post<Artist>(this.apiUrl, artist).pipe(
      catchError(error => {
        console.error('Error adding artist:', error);
        throw error;
      })
    );
  }

  updateArtist(id: number, artist: Artist): Observable<Artist> {
    return this.http.put<Artist>(`${this.apiUrl}/${id}`, artist).pipe(
      catchError(error => {
        console.error('Error updating artist:', error);
        throw error;
      })
    );
  }

  deleteArtist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting artist:', error);
        throw error;
      })
    );
  }
}
