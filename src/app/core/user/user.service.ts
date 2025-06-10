import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export type Goal = 'GAIN' | 'MAINTAIN' | 'LOSE';
export type ActivityLevel = 'SEDENTARY' | 'MODERATE' | 'ACTIVE';

export interface UserProfile {
  id: number;
  name: string;
  nickname: string;
  email: string;
  birthDate: string;
  height: number;
  weight: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  role: string;
  isActive: boolean;
  allergenIds: number[];
  avatarUrl: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private profileChangedSubject = new BehaviorSubject<UserProfile | null>(null);
  profileChanged$ = this.profileChangedSubject.asObservable();

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/users/me`);
  }

  uploadAvatar(form: FormData): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/users/me/avatar`,
      form
    );
  }

  public get currentProfile(): UserProfile | null {
    return this.profileChangedSubject.value;
  }

  updateProfile(data: Partial<UserProfile>): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/users/me`, data).pipe(
      tap(() => {
        this.getProfile().subscribe({
          next: profile => this.profileChangedSubject.next(profile),
          error: (err: HttpErrorResponse) => {
            if (err.status === 401 || err.status === 403) {
              this.auth.logout();
              this.profileChangedSubject.next(null);
            }
          }
        });
      })
    );
  }

  loadInitialProfile(): void {
    if (!this.auth.isLoggedIn()) {
      this.profileChangedSubject.next(null);
      return;
    }

    this.getProfile().subscribe({
      next: profile => {
        this.profileChangedSubject.next(profile);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          this.auth.logout();
          this.profileChangedSubject.next(null);
        }
      }
    });
  }
}
