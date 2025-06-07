import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface AdminUser {
  id: number;
  name: string;
  nickname: string;
  email: string;
  role: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin/users`;
  constructor(private http: HttpClient) {}

  listUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.base);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  toggleEnabled(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/toggle`, {});
  }

  updateRole(id: number, role: string): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/role`, { role });
  }
}
