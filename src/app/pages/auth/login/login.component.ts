// src/app/pages/auth/login/login.component.ts
import { Component, inject }       from '@angular/core';
import { Router }                  from '@angular/router';
import { FormsModule }             from '@angular/forms';
import { AuthService }             from '../../../core/auth/auth.service';
import { UserService, UserProfile }from '../../../core/user/user.service';
import { filter, take }            from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router      = inject(Router);

  email    = '';
  password = '';
  error: string | null = null;
  loading = false;

  login() {
    if (!this.email || !this.password) {
      return this.showError('Por favor, completa todos los campos.');
    }

    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.userService.loadInitialProfile();

        this.userService.profileChanged$
          .pipe(
            filter((u): u is UserProfile => u !== null),
            take(1)
          )
          .subscribe({
            next: user => {
              this.loading = false;
              if (user.role === 'ADMIN') {
                this.router.navigate(['/admin/users']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            },
            error: () => {
              this.loading = false;
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
