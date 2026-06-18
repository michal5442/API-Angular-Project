import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { SongService } from './song.service';
import { UserService } from './user';
import { ArtistService } from './artist';

export interface ThemeSuggestion {
  suggest: boolean;
  ambient: string;
  new_theme?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  readonly apiUrl      = 'http://127.0.0.1:8001/chat';
  readonly aiBaseUrl   = 'http://127.0.0.1:8001';

  constructor(
    private http: HttpClient,
    private songService: SongService,
    private userService: UserService,
    private artistService: ArtistService
  ) {}

  private getCart(): any[] {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return [];
    return JSON.parse(localStorage.getItem(`cart_${userId}`) || '[]');
  }

  private getFavorites(): any[] {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return [];
    return JSON.parse(localStorage.getItem(`favorites_${userId}`) || '[]');
  }

  buildBody(
    message: string,
    history: { role: string; content: string }[],
    songs: any[],
    artists: any[],
    pendingThemeChange?: string
  ): any {
    const currentUser  = this.userService.getCurrentUser();
    const isLoggedIn   = !!currentUser;
    const preferredTheme = this.userService.getPreferredTheme();

    return {
      message,
      history,
      products:              songs,
      artists:               artists.map(a => ({ id: a.id, name: a.name })),
      cart:                  isLoggedIn ? this.getCart()      : null,
      favorites:             isLoggedIn ? this.getFavorites() : null,
      is_logged_in:          isLoggedIn,
      username:              currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : null,
      preferred_theme:       isLoggedIn ? preferredTheme : null,
      pending_theme_change:  isLoggedIn ? (pendingThemeChange ?? null) : null
    };
  }

  getContext(): Observable<{ songs: any[]; artists: any[] }> {
    return this.songService.getSongs().pipe(
      switchMap(({ songs }) =>
        this.artistService.getArtists().pipe(
          map(artists => ({ songs, artists }))
        )
      )
    );
  }

  checkAmbientTheme(): Observable<ThemeSuggestion> {
    const preferredTheme = this.userService.getPreferredTheme();
    return new Observable(observer => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          video.onloadeddata = () => {
            const canvas = document.createElement('canvas');
            canvas.width  = video.videoWidth  || 320;
            canvas.height = video.videoHeight || 240;
            canvas.getContext('2d')!.drawImage(video, 0, 0);
            stream.getTracks().forEach(t => t.stop());
            canvas.toBlob(blob => {
              if (!blob) { observer.error('No blob'); return; }
              const form = new FormData();
              form.append('file', blob, 'frame.jpg');
              form.append('preferred_theme', preferredTheme);
              this.http.post<ThemeSuggestion>(`${this.aiBaseUrl}/suggest-theme`, form)
                .subscribe({ next: v => { observer.next(v); observer.complete(); }, error: e => observer.error(e) });
            }, 'image/jpeg', 0.8);
          };
        })
        .catch(e => observer.error(e));
    });
  }

}
