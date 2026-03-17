import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../../shared/models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals para estado reactivo (Angular 19)
  currentUser = signal<User | null>(this.getUserFromStorage());
  isLoggedIn = signal<boolean>(!!this.getToken());

  constructor(private http: HttpClient, private router: Router) {
    // Efecto para sincronizar con localStorage
    effect(() => {
      const user = this.currentUser();
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', user.token || '');
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    });
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.setSession(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.setSession(response))
    );
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setSession(response: AuthResponse): void {
    const user: User = {
      username: response.username,
      email: response.email,
      token: response.token
    };
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}
