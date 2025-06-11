// src/app/core/recipe.service.ts
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

  constructor(private http: HttpClient) {}

  /** Sube un fichero de imagen y devuelve la URL pública */
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http
      .post<{ url: string }>(`${this.baseUrl}/upload`, formData)
      .pipe(map(response => response.url));
  }

  /** Crea una receta (sin imagen, la URL debe venir subida antes) */
  createRecipe(recipeData: any): Observable<Recipe> {
    return this.http.post<Recipe>(this.baseUrl, recipeData);
  }

  getMyRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.baseUrl}/my`);
  }

  /** Elimina una receta creada por mí */
  deleteMyRecipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Obtiene todas las recetas (paginadas) */
  getAllRecipes(page = 0, size = 20): Observable<PaginatedRecipes> {
    return this.http.get<PaginatedRecipes>(
      `${this.baseUrl}?page=${page}&size=${size}`
    );
  }

  /** Busca recetas por nombre */
  searchRecipes(query: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(
      `${this.baseUrl}/search?query=${encodeURIComponent(query)}`
    );
  }

  /** Obtiene una receta por su ID */
  getRecipeById(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.baseUrl}/${id}`);
  }

  /** Obtiene recetas favoritas del usuario */
  getFavorites(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.baseUrl}/favorites`);
  }

  /** Marca o desmarca una receta como favorita */
  toggleFavorite(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/favorite`, {});
  }
}
