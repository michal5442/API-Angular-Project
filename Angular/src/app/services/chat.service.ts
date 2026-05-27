import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { SongService } from './song.service';
import { UserService } from './user';
import { ArtistService } from './artist';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly apiUrl = 'http://127.0.0.1:8001/chat';

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

  send(message: string, history: { role: string; content: string }[]) {
    const currentUser = this.userService.getCurrentUser();
    const isLoggedIn = !!currentUser;

    return this.songService.getSongs().pipe(
      switchMap(({ songs }) =>
        this.artistService.getArtists().pipe(
          switchMap(artists =>
            this.http.post(this.apiUrl, {
              message,
              history,
              products: songs,
              artists: artists.map(a => ({ id: a.id, name: a.name })),
              cart: isLoggedIn ? this.getCart() : null,
              favorites: isLoggedIn ? this.getFavorites() : null,
              is_logged_in: isLoggedIn,
              username: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : null
            })
          )
        )
      )
    );
  }
}
