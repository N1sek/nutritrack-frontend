// src/app/pages/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService, UserProfile } from '../../../core/user/user.service';
import {NavbarComponent} from '../../../shared/components/navbar/navbar.component';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [
    NavbarComponent,
    FormsModule
  ],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  email = '';
  password = '';
  error: string | null = null;
  loading = false;

  login() {
    if (!this.email || !this.password) {
      this.showError('Por favor, completa todos los campos.');
      return;
    }

    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        // Una vez tenemos el token, pedimos el perfil
        this.userService.getProfile().subscribe({
          next: (user: UserProfile) => {
            this.loading = false;
            if (user.role === 'ADMIN') {
              this.router.navigate(['/admin/users']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
          error: () => {
            this.loading = false;
            // Si falla al cargar perfil, al menos vamos al dashboard
            this.router.navigate(['/dashboard']);
          }
        });
      },
      error: err => {
        this.loading = false;
        if (err.status === 400) {
          this.showError(err.error?.message || 'Credenciales incorrectas.');
        } else if (err.status === 0) {
          this.showError('No se pudo conectar al servidor.');
        } else {
          this.showError('Error inesperado. Intenta de nuevo.');
        }
      }
    });
  }

  private showError(msg: string) {
    this.error = msg;
    setTimeout(() => (this.error = null), 4000);
  }
}
