import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService, UserProfile } from '../../../core/user/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ CommonModule, RouterLink, RouterLinkActive ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  userImageUrl: string | null = null;
  isAdmin = false;
  private sub?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Carga inicial de perfil
    this.userService.profileChanged$.subscribe((user: UserProfile | null) => {
      if (user) {
        this.userImageUrl = user.avatarUrl || null;
        this.isAdmin = user.role === 'ADMIN';
      } else {
        this.userImageUrl = null;
        this.isAdmin = false;
      }
    });
    this.userService.loadInitialProfile();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  logout() {
    this.authService.logout();
    this.userService.clearProfile();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
