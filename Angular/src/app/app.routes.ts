import { Routes } from '@angular/router';
import { Songs } from './components/songs/songs';
import { Artists } from './components/artists/artists';
import { About } from './components/about/about';
import { Contact } from './components/contact/contact';
import { HomePage } from './components/home-page/home-page';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { SongDetail } from './components/song-detail/song-detail';
import { Cart } from './components/cart/cart';
import { Checkout } from './components/checkout/checkout';
import { Profile } from './components/profile/profile';
import { AdminLogin } from './components/admin/admin-login/admin-login';
import { AdminDashboard } from './components/admin/admin-dashboard/admin-dashboard';
import { AdminSongs } from './components/admin/admin-songs/admin-songs';
import { AdminArtists } from './components/admin/admin-artists/admin-artists';
import { AdminUsers } from './components/admin/admin-users/admin-users';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'songs', component: Songs, data: { mode: 'songs' } },
  { path: 'favorites', component: Songs, data: { mode: 'favorites' } },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout },
  { path: 'profile', component: Profile },
  { path: 'artists', component: Artists },
  { path: 'about', component: About },
  { path: 'contact', component: Contact},
  { path: '', component: HomePage},
  {path: 'login', component: Login},
  {path: 'register', component: Register},
  {path: 'song-detail/:id', component: SongDetail},
  { path: 'admin-login', component: AdminLogin },
  { path: 'admin', component: AdminDashboard, canActivate: [adminGuard] },
  { path: 'admin/songs', component: AdminSongs, canActivate: [adminGuard] },
  { path: 'admin/artists', component: AdminArtists, canActivate: [adminGuard] },
  { path: 'admin/users', component: AdminUsers, canActivate: [adminGuard] }
];
