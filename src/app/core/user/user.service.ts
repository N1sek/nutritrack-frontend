import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getProfile() {
    return this.http.get<any>(`${environment.apiUrl}/users/me`);
  }

  updateProfile(data: any) {
    return this.http.put<void>(`${environment.apiUrl}/users/me`, data);
  }
}
