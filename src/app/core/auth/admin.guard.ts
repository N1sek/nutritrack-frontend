import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService);
  const user = userService.currentProfile;

  if (user?.role === 'ADMIN') {
    return true;
  }
  router.navigate(['/dashboard']);
  return false;
};
