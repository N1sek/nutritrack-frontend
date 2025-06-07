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
  private readonly adminBase  = `${environment.apiUrl}/admin/foods`;

  constructor(private http: HttpClient) {}

  searchLocalFoods(query: string): Observable<FoodResponse[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<FoodResponse[]>(`${this.baseUrl}/search/local`, { params });
  }

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

  importFood(food: any): Observable<FoodResponse> {
    return this.http.post<FoodResponse>(`${this.baseUrl}/import`, food);
  }

  createFood(food: FoodRequest): Observable<FoodResponse> {
    return this.http.post<FoodResponse>(this.baseUrl, food);
  }

  searchAllFoods(query: string): Observable<FoodResponse[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<FoodResponse[]>(`${this.baseUrl}/search`, { params });
  }

  /** Lista todos los alimentos (ADMIN) */
  listAll(): Observable<FoodResponse[]> {
    return this.http.get<FoodResponse[]>(this.adminBase);
  }

  /** Obtiene un alimento por ID (ADMIN) */
  getOne(id: number): Observable<FoodResponse> {
    return this.http.get<FoodResponse>(`${this.adminBase}/${id}`);
  }

  /** Crea un alimento (ADMIN) */
  createAdmin(food: FoodRequest): Observable<FoodResponse> {
    return this.http.post<FoodResponse>(this.adminBase, food);
  }

  /** Actualiza un alimento (ADMIN) */
  updateAdmin(id: number, food: FoodRequest): Observable<FoodResponse> {
    return this.http.put<FoodResponse>(`${this.adminBase}/${id}`, food);
  }

  /** Elimina un alimento (ADMIN) */
  deleteAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/${id}`);
  }
}
