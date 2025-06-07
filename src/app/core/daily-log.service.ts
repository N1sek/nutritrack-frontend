import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

export interface DailyLogEntryResponse {
  id: number;
  quantity: number;
  mealType: string;
  food?: {
    id: number;
    name: string;
    imageUrl?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    // …
  };
  recipe?: {
    id: number;
    name: string;
    imageUrl?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    // …
  };
}


export interface DailyLogMealBreakdownResponse {
  mealType: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalSugar: number;
  totalSalt: number;
  totalSaturatedFat: number;
}


export interface DailyLogResponse {
  id: number;
  date: string;
  entries: DailyLogEntryResponse[];

  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalSugar: number;
  totalSalt: number;
  totalSaturatedFat: number;

  breakdownByMealType: DailyLogMealBreakdownResponse[];

  fastingHours: number | null;
}


export interface DailyLog {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalSugar: number;
  totalSalt: number;
  totalSaturatedFat: number;

  weight: number | null;
  water: number | null;

  fastingHours: number | null;
}


@Injectable({ providedIn: 'root' })
export class DailyLogService {
  constructor(private http: HttpClient) {}


  getDiary(date: string): Observable<DailyLogResponse> {
    return this.http.get<DailyLogResponse>(`${environment.apiUrl}/daily-log`, {
      params: new HttpParams().set('date', date)
    });
  }


  saveOrUpdateDiary(payload: any): Observable<DailyLogResponse> {
    return this.http.post<DailyLogResponse>(`${environment.apiUrl}/daily-log`, payload);
  }


  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/daily-log/entry/${id}`);
  }


  getExistingLogsInRange(start: string, end: string): Observable<DailyLog[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<DailyLog[]>(`${environment.apiUrl}/daily-log/existing-range`, { params });
  }
}
