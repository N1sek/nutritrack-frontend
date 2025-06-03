import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  constructor(private router: Router, private authService: AuthService) {}


  goToLogin() {
    this.router.navigate(['/login']);
    // this.router.navigate(['/dashboard']); // Temporal
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToHome(){
    this.router.navigate(['/dashboard']);
  }

  goToDiarioNutricion(){
    this.router.navigate(['/diario-nutricion']);
  }

  goToInformes(){
    this.router.navigate(['/reports']);
  }

  goToPerfil() {
    this.router.navigate(['/perfil']);
  }

  logout(){
    return this.authService.logout();
  }

  isLoggedIn(): boolean{
    return this.authService.isLoggedIn();
  }
  info(){
    console.log(this.isLoggedIn());
  }


}
