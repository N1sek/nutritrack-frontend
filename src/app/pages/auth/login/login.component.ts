import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import {FormsModule} from '@angular/forms';
import {NavbarComponent} from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [
    FormsModule,
    NavbarComponent
  ]
})
export class LoginComponent {
  private authService = inject(AuthService);

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
    this.error = null;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 400) {
          this.showError(err.error?.message || 'Correo o contraseña incorrectos.');
        } else if (err.status === 0) {
          this.showError('No se pudo conectar al servidor. Verifica tu conexión.');
        } else {
          this.showError('Ocurrió un error inesperado. Intenta nuevamente.');
        }

        console.error('Error al iniciar sesión:', err);
      }
    });
  }

  private showError(message: string) {
    this.error = message;
    setTimeout(() => {
      this.error = null;
    }, 4000);
  }
}
