import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

export interface FoodRequest {
  name: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar?: number;
  salt?: number;
  saturatedFat?: number;
  allergenIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class FoodService {
  private readonly baseUrl = `${environment.apiUrl}/foods`;

  constructor(private http: HttpClient) {}

  searchLocalFoods(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/search/local?query=${query}`);
  }

  searchExternalFoods(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/search/external?query=${query}`);
  }

  importFood(food: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/import`, food);
  }

  createFood(food: FoodRequest): Observable<any> {
    return this.http.post<any>(this.baseUrl, food);
  }
}
