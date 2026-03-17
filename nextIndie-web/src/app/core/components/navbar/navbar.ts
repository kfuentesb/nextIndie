import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {AuthService} from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/" class="logo">
          <span class="logo-icon">🎮</span>
          <span class="logo-text">NextIndie</span>
        </a>
      </div>

      <div class="navbar-menu">
        @if (authService.currentUser$ | async; as user) {
          <div class="user-section">
            <span class="welcome-text">Hola, {{ user.username }}</span>
            <button class="btn btn-secondary" (click)="logout()">Cerrar Sesión</button>
          </div>
        } @else {
          <a routerLink="/login" class="btn btn-primary">Iniciar Sesión</a>
        }
      </div>
    </nav>
  `,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
