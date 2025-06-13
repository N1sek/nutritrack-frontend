import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {NavbarComponent} from '../../shared/components/navbar/navbar.component';
import {FooterComponent} from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    FooterComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  standalone: true
})
export class LandingComponent {

  constructor(private router: Router) {}

  goToRegister() {
    this.router.navigate(['/register']);
  }

}
