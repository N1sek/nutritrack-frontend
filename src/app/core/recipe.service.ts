import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

export interface Recipe {
  id: number;
  name: string;
  description?: string;
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

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  private readonly baseUrl = `${environment.apiUrl}/recipes`;

  constructor(private http: HttpClient) {}

  createRecipe(recipeData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/recipes`, recipeData);
  }

  getAllRecipes(page = 0, size = 20): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/recipes?page=${page}&size=${size}`);
  }


  /**
   * Busca recetas por nombre
   */
  searchRecipes(query: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
  }

  /**
   * Obtiene una receta por su ID
   */
  getRecipeById(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene recetas marcadas como favoritas por el usuario
   */
  getFavorites(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.baseUrl}/favorites`);
  }

  /**
   * Marca o desmarca una receta como favorita
   */
  toggleFavorite(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/favorite`, {});
  }
}
