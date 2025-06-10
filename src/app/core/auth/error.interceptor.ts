import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError }                      from 'rxjs/operators';
import { throwError }                      from 'rxjs';
import { inject }                          from '@angular/core';
import { Router }                          from '@angular/router';
import { AuthService }                     from './auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
