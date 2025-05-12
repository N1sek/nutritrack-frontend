import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { environment } from '../../../environments/environment';
import { SearchFoodModalComponent } from '../../../shared/components/search-food-modal/search-food-modal.component';
import {BoxComponent} from '../../../shared/components/box/box.component';
import {NavbarComponent} from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-nutrition-diary',
  standalone: true,
  imports: [
    CommonModule,
    SearchFoodModalComponent,
    BoxComponent,
    NavbarComponent
  ],
  templateUrl: './nutrition-diary.component.html',
  styleUrls: ['./nutrition-diary.component.scss']
})
export class NutritionDiaryComponent implements OnInit {
  @ViewChild(SearchFoodModalComponent) searchModal!: SearchFoodModalComponent;

  currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  entries: any[] = [];
  meals = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDiary();
  }

  fetchDiary() {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/daily-log?date=${this.currentDate}`).subscribe({
      next: (res: any) => {
        this.entries = res.entries || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openSearchModal(mealType: string) {
    this.searchModal.openModal(mealType);
  }

  handleItemSelected(entry: any) {
    const body = {
      date: this.currentDate,
      entries: [entry]
    };

    this.http.post(`${environment.apiUrl}/daily-log`, body).subscribe({
      next: () => this.fetchDiary()
    });
  }

  deleteEntry(id: number) {
    this.http.delete(`${environment.apiUrl}/daily-log/entry/${id}`).subscribe({
      next: () => this.fetchDiary()
    });
  }

  getEntriesByMeal(meal: string) {
    return this.entries.filter(e => e.mealType === meal);
  }

  calcular(entry: any, prop: string): number {
    const item = entry.food || entry.recipe;
    return Math.round((item?.[prop] || 0) * (entry.quantity / 100));
  }

  traducirMealType(meal: string): string {
    switch (meal) {
      case 'BREAKFAST': return 'Desayuno';
      case 'LUNCH': return 'Comida';
      case 'DINNER': return 'Cena';
      case 'SNACK': return 'Almuerzo';
      default: return meal;
    }
  }

  get total() {
    return this.entries.reduce((acc, e) => {
      const item = e.food || e.recipe;
      const q = e.quantity / 100;
      acc.calories += (item.calories || 0) * q;
      acc.protein += (item.protein || 0) * q;
      acc.carbs += (item.carbs || 0) * q;
      acc.fat += (item.fat || 0) * q;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }

  handleImageError(entry: any) {
    if (entry.food) entry.food.imageUrl = 'assets/img/no-image-food.png';
    if (entry.recipe) entry.recipe.imageUrl = 'assets/img/no-image-food.png';
  }

}
