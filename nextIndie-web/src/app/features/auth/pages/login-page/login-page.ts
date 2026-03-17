import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest, RegisterRequest } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-box">
        <div class="auth-header">
          <h1 class="logo">NextIndie</h1>
          <p class="subtitle">Descubre los mejores juegos indie</p>
        </div>

        @if (errorMessage()) {
          <div class="error-alert">
            {{ errorMessage() }}
          </div>
        }

        <div class="auth-tabs">
          <button
            class="tab-btn"
            [class.active]="!isRegisterMode()"
            (click)="isRegisterMode.set(false)">
            Iniciar Sesión
          </button>
          <button
            class="tab-btn"
            [class.active]="isRegisterMode()"
            (click)="isRegisterMode.set(true)">
            Registrarse
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">Usuario</label>
            <input
              type="text"
              [(ngModel)]="formData.username"
              name="username"
              class="form-input"
              placeholder="Tu nombre de usuario"
              required>
          </div>

          @if (isRegisterMode()) {
            <div class="form-group">
              <label class="form-label">Email</label>
              <input
                type="email"
                [(ngModel)]="formData.email"
                name="email"
                class="form-input"
                placeholder="tu@email.com"
                required>
            </div>
          }

          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input
              type="password"
              [(ngModel)]="formData.password"
              name="password"
              class="form-input"
              placeholder="••••••••"
              required
              minlength="6">
          </div>

          <button
            type="submit"
            class="btn btn-primary submit-btn"
            [disabled]="isLoading()">
            @if (isLoading()) {
              <span class="spinner"></span>
            } @else {
              {{ isRegisterMode() ? 'Crear Cuenta' : 'Iniciar Sesión' }}
            }
          </button>
        </form>

        <div class="auth-footer">
          @if (!isRegisterMode()) {
            <p>¿No tienes cuenta? <a (click)="isRegisterMode.set(true)">Regístrate</a></p>
          } @else {
            <p>¿Ya tienes cuenta? <a (click)="isRegisterMode.set(false)">Inicia sesión</a></p>
          }
        </div>

        <div class="demo-credentials">
          <p>Demo: admin / admin123</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isRegisterMode = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  formData = {
    username: '',
    email: '',
    password: ''
  };

  onSubmit(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    if (this.isRegisterMode()) {
      const request: RegisterRequest = {
        username: this.formData.username,
        email: this.formData.email,
        password: this.formData.password
      };

      this.authService.register(request).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    } else {
      const request: LoginRequest = {
        username: this.formData.username,
        password: this.formData.password
      };

      this.authService.login(request).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess(): void {
    this.isLoading.set(false);
    this.router.navigate(['/']);
  }

  private handleError(err: any): void {
    this.isLoading.set(false);
    this.errorMessage.set(err.error?.message || 'Error en la autenticación');
  }
}
