import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Recipe {
  id: number;
  name: string;
  description?: string;
  instructions?: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  mealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  isPublic?: boolean;
  ingredients?: any[];
  createdBy?: string;
  createdAt?: string;
  favorited?: boolean;
  favoritesCount?: number;
}

export interface PaginatedRecipes {
  content: Recipe[];
  totalItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  private readonly baseUrl = `${environment.apiUrl}/recipes`;
  private readonly adminBaseUrl = `${environment.apiUrl}/admin/recipes`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http
      .post<{ url: string }>(`${this.baseUrl}/upload`, formData)
      .pipe(map(response => response.url));
  }

  createRecipe(recipeData: any): Observable<Recipe> {
    return this.http.post<Recipe>(this.baseUrl, recipeData);
  }

  getMyRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.baseUrl}/my`);
  }

  deleteMyRecipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAllRecipes(page = 0, size = 20): Observable<PaginatedRecipes> {
    return this.http.get<PaginatedRecipes>(
      `${this.baseUrl}?page=${page}&size=${size}`
    );
  }

  searchRecipes(query: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(
      `${this.baseUrl}/search?query=${encodeURIComponent(query)}`
    );
  }

  getRecipeById(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.baseUrl}/${id}`);
  }

  getFavorites(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.baseUrl}/favorites`);
  }

  toggleFavorite(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/favorite`, {});
  }

  /** Lista todas las recetas (ADMIN) */
  listAllAdmin(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.adminBaseUrl);
  }

  /** Actualiza una receta (ADMIN) */
  updateAdmin(id: number, recipeData: any): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.adminBaseUrl}/${id}`, recipeData);
  }

}
