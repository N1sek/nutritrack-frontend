// src/app/core/daily-log.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

/**
 * Cada entrada del diario, tal como la devuelve el backend.
 * Incluye food o recipe completos con sus campos (name, imageUrl, calories, protein, etc.).
 */
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
    // … otros campos si los necesitas
  };
  recipe?: {
    id: number;
    name: string;
    imageUrl?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    // … otros campos si los necesitas
  };
}

/**
 * Desglose por tipo de comida (breakdown) que incluye el backend.
 */
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

/**
 * El DTO completo que devuelve GET /daily-log?date=yyyy-MM-dd
 * Contiene: id, date, array de entries (cada una con food o recipe),
 * totales, breakdown por mealType y fastingHours.
 */
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

/**
 * Este tipo se usa únicamente al pedir todos los logs en un rango (existing-range),
 * donde el backend devuelve totales y otros campos, pero sin el array completo de entries.
 */
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

  /**
   * Obtener el diary (log) completo de un día:
   * Retorna DailyLogResponse, que incluye array "entries" con food/recipe.
   */
  getDiary(date: string): Observable<DailyLogResponse> {
    return this.http.get<DailyLogResponse>(`${environment.apiUrl}/daily-log`, {
      params: new HttpParams().set('date', date)
    });
  }

  /**
   * Guardar o actualizar el diario de un día.
   * El backend devuelve el mismo DailyLogResponse (con entries, totales, fastingHours).
   */
  saveOrUpdateDiary(payload: any): Observable<DailyLogResponse> {
    return this.http.post<DailyLogResponse>(`${environment.apiUrl}/daily-log`, payload);
  }

  /**
   * Borrar una entrada concreta por su ID.
   */
  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/daily-log/entry/${id}`);
  }

  /**
   * Obtener logs existentes en un rango (solo totales, sin array de entries).
   */
  getExistingLogsInRange(start: string, end: string): Observable<DailyLog[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<DailyLog[]>(`${environment.apiUrl}/daily-log/existing-range`, { params });
  }
}
