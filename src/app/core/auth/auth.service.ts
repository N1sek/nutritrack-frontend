// src/app/core/auth/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  token = signal<string | null>(localStorage.getItem('authToken'));

  login(email: string, password: string) {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(res => {
          localStorage.setItem('authToken', res.token);
          this.token.set(res.token);
        })
      );
  }

  register(data: any) {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/auth/register`, data)
      .pipe(
        tap(res => {
          localStorage.setItem('authToken', res.token);
          this.token.set(res.token);
        })
      );
  }

  logout() {
    localStorage.removeItem('authToken');
    this.token.set(null);
  }

  isLoggedIn() {
    return !!this.token();
  }
}
