import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DailyLogService {
  constructor(private http: HttpClient) {}

  getDiary(date: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/daily-log?date=${date}`);
  }

  saveOrUpdateDiary(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/daily-log`, payload);
  }

  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/daily-log/entry/${id}`);
  }
}
