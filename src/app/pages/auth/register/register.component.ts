import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {StepperComponent} from './components/stepper/stepper.component';
import {NavbarComponent} from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    StepperComponent,
    NavbarComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  step = 1;
  userData = {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    goal: '',
  }

  constructor(private router: Router) {}



  nextStep(event: Event) {
    event.preventDefault();
    if (this.step < 3) {
      this.step++;
    }
  }

  prevStep(event: Event) {
    event.preventDefault();
    if (this.step > 1) {
      this.step--;
    }
  }

  validateStep(){
  }



}
