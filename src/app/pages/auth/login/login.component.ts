import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../core/auth.service';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NavbarComponent} from "../../../shared/components/navbar/navbar.component";

@Component({
  selector: 'app-login',
    imports: [
        FormsModule,
        NavbarComponent,
        ReactiveFormsModule,
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  constructor(private authService: AuthService) {
  }

  email: string = '';
  password: string = '';

  ngOnInit() {
    alert(`Las credenciales son: 'test@example.com' y password: 123`)
  }

  login() {
    const hardcodedEmail = 'test@example.com';
    const hardcodedPassword = '123';

    console.log('Email ingresado:', this.email);
    console.log('Password ingresado:', this.password);

    if (this.email === hardcodedEmail && this.password === hardcodedPassword) {
      console.log('Login exitoso');
      return this.authService.login();
    } else {
      alert('Correo o contraseña incorrectos');
    }
  }

}
