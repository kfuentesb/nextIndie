import { Routes } from '@angular/router';
import {authGuard} from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/feed/feed.module').then(m => m.FeedModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
