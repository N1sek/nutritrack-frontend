import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import { Router }       from '@angular/router';

import { NavbarComponent }  from '../../../shared/components/navbar/navbar.component';
import { StepperComponent } from './components/stepper/stepper.component';
import { AuthService }      from '../../../core/auth/auth.service';

interface Allergen {
  id: number;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    ReactiveFormsModule,
    NavbarComponent,
    StepperComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  step = 1;
  showPassword = false;

  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;
  step4Form!: FormGroup;

  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'danger' = 'success';

  allergens: Allergen[] = [
    { id: 1,  name: 'Gluten',      icon: '🌾' },
    { id: 2,  name: 'Lácteos',     icon: '🥛' },
    { id: 3,  name: 'Frutos Secos', icon: '🥜' },
    { id: 4,  name: 'Huevo',       icon: '🥚' },
    { id: 5,  name: 'Pescado',     icon: '🐟' },
    { id: 6,  name: 'Mariscos',    icon: '🦐' },
    { id: 7,  name: 'Soja',        icon: '🌱' },
    { id: 8,  name: 'Sésamo',      icon: '🌰' },
    { id: 9,  name: 'Mostaza',     icon: '🌿' },
    { id: 10, name: 'Apio',        icon: '🥬' },
    { id: 11, name: 'Sulfitos',    icon: '🍷' },
    { id: 12, name: 'Cacahuetes',  icon: '🥜' }
  ];

  ngOnInit() {
    // Paso 1
    this.step1Form = this.fb.group({
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatch });

    // Paso 2
    this.step2Form = this.fb.group({
      name:      ['', Validators.required],
      nickname:  ['', Validators.required],
      weight:    [null, [Validators.required, Validators.min(1)]],
      height:    [null, [Validators.required, Validators.min(1)]],
      birthDate: ['', Validators.required]
    });

    // Paso 3
    this.step3Form = this.fb.group({
      goal:          ['', Validators.required],
      activityLevel: ['', Validators.required]
    });

    // Paso 4
    const controls: Record<string, any> = {};
    this.allergens.forEach(a => controls[a.id.toString()] = [false]);
    this.step4Form = this.fb.group({ allergens: this.fb.group(controls) });
  }

  private passwordMatch(group: AbstractControl) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { mismatch: true };
  }

  nextStep() {
    const form = this.getFormForStep(this.step);
    if (form.invalid) {
      form.markAllAsTouched();
      this.showToast('Corrige los errores antes de continuar.', 'danger');
      return;
    }
    this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  submitRegister() {
    const form4 = this.getFormForStep(4);
    if (form4.invalid) {
      this.showToast('Selecciona al menos un alérgeno o continúa si no aplica.', 'danger');
      return;
    }

    const payload = {
      email:         this.step1Form.value.email,
      password:      this.step1Form.value.password,
      name:          this.step2Form.value.name,
      nickname:      this.step2Form.value.nickname,
      weight:        this.step2Form.value.weight,
      height:        this.step2Form.value.height,
      birthDate:     this.step2Form.value.birthDate,
      goal:          this.step3Form.value.goal,
      activityLevel: this.step3Form.value.activityLevel,
      allergenIds:   Object.entries(form4.value.allergens)
        .filter(([_, v]) => v)
        .map(([k]) => +k)
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.showToast('Registro exitoso. Ya puedes iniciar sesión.', 'success');
        setTimeout(() => this.router.navigate(['/login']), 1000);
      },
      error: err => {
        this.showToast(err.error?.message || 'Ocurrió un error al registrar.', 'danger');
      }
    });
  }

  private getFormForStep(step: number): FormGroup {
    switch (step) {
      case 1: return this.step1Form;
      case 2: return this.step2Form;
      case 3: return this.step3Form;
      default: return this.step4Form;
    }
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  showToast(message: string, type: 'success' | 'danger') {
    this.toastMessage = message;
    this.toastType    = type;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 4000);
  }

  hideToast() {
    this.toastVisible = false;
  }
}
