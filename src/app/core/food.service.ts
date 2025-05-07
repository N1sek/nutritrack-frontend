import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FoodService {
  constructor(private http: HttpClient) {}

  searchFoods(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/foods/search?query=${query}`);
  }
}
