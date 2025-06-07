import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

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
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  private profileChangedSubject = new BehaviorSubject<UserProfile | null>(null);
  profileChanged$ = this.profileChangedSubject.asObservable();

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/users/me`);
  }

  public get currentProfile(): UserProfile | null {
    return this.profileChangedSubject.value;
  }

  updateProfile(data: Partial<UserProfile>): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/users/me`, data).pipe(
      tap(() => {
        this.getProfile().subscribe(profile => this.profileChangedSubject.next(profile));
      })
    );
  }

  loadInitialProfile(): void {
    this.getProfile().subscribe(profile => this.profileChangedSubject.next(profile));
  }
}
