import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { StepperComponent } from './components/stepper/stepper.component';
import { FormsModule } from '@angular/forms';
import {NavbarComponent} from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  imports: [FormsModule, StepperComponent, NavbarComponent]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  step = 1;

  form: any = {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    weight: null,
    height: null,
    birthDate: '',
    goal: '',
    activityLevel: '',
    allergens: {}
  };

  allergens = [
    { id: 1, name: 'Gluten', icon: '🌾' },
    { id: 2, name: 'Lácteos', icon: '🥛' },
    { id: 3, name: 'Frutos Secos', icon: '🥜' },
    { id: 4, name: 'Huevo', icon: '🥚' },
    { id: 5, name: 'Pescado', icon: '🐟' },
    { id: 6, name: 'Mariscos', icon: '🦐' },
    { id: 7, name: 'Soja', icon: '🌱' },
    { id: 8, name: 'Sésamo', icon: '🌰' },
    { id: 9, name: 'Mostaza', icon: '🌿' },
    { id: 10, name: 'Apio', icon: '🥬' },
    { id: 11, name: 'Sulfitos', icon: '🍷' },
    { id: 12, name: 'Cacahuetes', icon: '🥜' }
  ];

  nextStep(event: Event) {
    event.preventDefault();

    if (this.step === 1 && this.form.password !== this.form.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    this.step++;
  }

  prevStep(event: Event) {
    event.preventDefault();
    if (this.step > 1) {
      this.step--;
    }
  }

  submitRegister(event: Event) {
    event.preventDefault();

    const allergenIds = this.allergens
      .filter(a => this.form.allergens[a.id])
      .map(a => a.id);

    const payload = {
      name: this.form.name,
      nickname: this.form.nickname,
      email: this.form.email,
      password: this.form.password,
      birthDate: this.form.birthDate,
      height: this.form.height,
      weight: this.form.weight,
      goal: this.form.goal,
      activityLevel: this.form.activityLevel,
      allergenIds
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.showToast('✅ Registro exitoso. Ahora puedes iniciar sesión.', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Ocurrio un error al registrar', 'danger');
      }
    });
  }




  toastVisible = false;
  toastMessage = '';
  toastType = 'success'; // o 'danger', 'warning', etc.

  showToast(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

    setTimeout(() => this.toastVisible = false, 4000);
  }

  hideToast() {
    this.toastVisible = false;
  }

}



