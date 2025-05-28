// src/app/core/food.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

export interface FoodResponse {
  id: number;
  name: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar?: number;
  salt?: number;
  saturatedFat?: number;
}

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

  /** Busca solo en tu base de datos local */
  searchLocalFoods(query: string): Observable<FoodResponse[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<FoodResponse[]>(`${this.baseUrl}/search/local`, { params });
  }

  /** Busca en la API externa con paginación */
  searchExternalFoods(
    query: string,
    page: number,
    size: number = 10
  ): Observable<FoodResponse[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<FoodResponse[]>(`${this.baseUrl}/search/external`, { params });
  }

  /** Importa un alimento externo a tu base de datos local */
  importFood(food: any): Observable<FoodResponse> {
    return this.http.post<FoodResponse>(`${this.baseUrl}/import`, food);
  }

  /** Crea un nuevo alimento en tu base de datos local */
  createFood(food: FoodRequest): Observable<FoodResponse> {
    return this.http.post<FoodResponse>(this.baseUrl, food);
  }

  /** Busca combinando local + externa (sin paginar externals) */
  searchAllFoods(query: string): Observable<FoodResponse[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<FoodResponse[]>(`${this.baseUrl}/search`, { params });
  }
}
