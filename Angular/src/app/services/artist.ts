import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, retry, timer } from 'rxjs';
import { Artist } from '../models/artist.model';

const RETRY_CONFIG = { count: 3, delay: (n: number) => timer(n * 1000) };

@Injectable({ providedIn: 'root' })
export class ArtistService {
  private apiUrl = 'https://localhost:44393/api/Artist'; 

  constructor(private http: HttpClient) { }
  
  getArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(this.apiUrl).pipe(
      retry(RETRY_CONFIG),
      catchError(() => of([]))
    );
  }

  getArtistById(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/${id}`).pipe(
      retry(RETRY_CONFIG),
      catchError(() => of({} as Artist))
    );
  }

  addArtist(artist: Artist): Observable<Artist> {
    return this.http.post<Artist>(this.apiUrl, artist).pipe(
      catchError(error => { throw error; })
    );
  }

  updateArtist(id: number, artist: Artist): Observable<Artist> {
    return this.http.put<Artist>(`${this.apiUrl}/${id}`, artist).pipe(
      catchError(error => { throw error; })
    );
  }

  deleteArtist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => { throw error; })
    );
  }
}
