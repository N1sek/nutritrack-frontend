import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import {tap} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  token = signal<string | null>(localStorage.getItem('authToken'));

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(response => this.handleAuthSuccess(response.token)));
  }

  register(data: any) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/register`, data)
      .pipe(tap(response => this.handleAuthSuccess(response.token)));
  }

  logout() {
    localStorage.removeItem('authToken');
    this.token.set(null);
    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(token: string) {
    localStorage.setItem('authToken', token);
    this.token.set(token);
    this.router.navigate(['/dashboard']);
  }

  isLoggedIn() {
    return !!this.token();
  }
}
