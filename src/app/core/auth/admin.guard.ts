import { inject, Injectable } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from '../user/user.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard {
  canActivate(): Observable<boolean | UrlTree> {
    const userService = inject(UserService);
    const router = inject(Router);

    return userService.getProfile().pipe(
      map(user => {
        if (user.role === 'ADMIN') {
          return true;
        }
        return router.createUrlTree(['/']);
      }),
      catchError(() => {
        return of(router.createUrlTree(['/']));
      })
    );
  }
}

export const adminGuard: CanActivateFn = (...args) => {
  return inject(AdminGuard).canActivate();
};
