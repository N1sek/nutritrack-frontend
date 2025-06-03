// src/app/core/daily-log.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

export interface DailyLog {
  date: string;          // e.g. "2025-06-03"
  totalCalories: number; // aunque en tu DTO lo llamabas "totalCalories"
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  water: number;
  weight: number | null;
  fastingHours: number | null;
}

@Injectable({ providedIn: 'root' })
export class DailyLogService {
  constructor(private http: HttpClient) {}

  /** Obtener el diary (log) de un día */
  getDiary(date: string): Observable<DailyLog> {
    return this.http.get<DailyLog>(`${environment.apiUrl}/daily-log`, {
      params: new HttpParams().set('date', date)
    });
  }

  /** Guardar o actualizar el diary de un día */
  saveOrUpdateDiary(payload: any): Observable<DailyLog> {
    return this.http.post<DailyLog>(`${environment.apiUrl}/daily-log`, payload);
  }

  /** Borrar una entrada concreta */
  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/daily-log/entry/${id}`);
  }

  /**
   * Obtener todos los logs entre “start” y “end” (inclusive).
   * Endpoint: GET /daily-log/range?start=yyyy-MM-dd&end=yyyy-MM-dd
   */
  getExistingLogsInRange(start: string, end: string): Observable<DailyLog[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<DailyLog[]>(`${environment.apiUrl}/daily-log/existing-range`, { params });
  }
}
