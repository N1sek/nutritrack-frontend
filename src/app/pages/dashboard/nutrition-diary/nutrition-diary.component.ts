import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { formatDate }                           from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { BoxComponent }                         from '../../../shared/components/box/box.component';
import { SearchFoodModalComponent }             from '../../../shared/components/search-food-modal/search-food-modal.component';
import { DailyLogService, DailyLogResponse, DailyLogEntryResponse } from '../../../core/daily-log.service';

@Component({
  selector: 'app-nutrition-diary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchFoodModalComponent,
    BoxComponent
  ],
  templateUrl: './nutrition-diary.component.html',
  styleUrls: ['./nutrition-diary.component.scss']
})
export class NutritionDiaryComponent implements OnInit {
  @ViewChild(SearchFoodModalComponent) searchModal!: SearchFoodModalComponent;

  currentDate   = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  dailyLog: DailyLogResponse | null = null;
  entries: DailyLogEntryResponse[]  = [];
  meals = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];
  loading = false;
  fastingHours: number | null = null;

  private dailyLogService = inject(DailyLogService);

  ngOnInit(): void {
    this.fetchDiary();
  }

  fetchDiary(): void {
    this.loading = true;
    this.dailyLogService.getDiary(this.currentDate).subscribe({
      next: res => {
        this.dailyLog     = res;
        this.entries      = res.entries  || [];
        this.fastingHours = res.fastingHours;
        this.loading      = false;
      },
      error: () => {
        this.dailyLog     = null;
        this.entries      = [];
        this.fastingHours = null;
        this.loading      = false;
      }
    });
  }

  openSearchModal(mealType: string): void {
    this.searchModal.openModal(mealType);
  }

  handleItemSelected(entry: any): void {
    const body = {
      date: this.currentDate,
      fastingHours: this.fastingHours,
      entries: [entry]
    };
    this.dailyLogService.saveOrUpdateDiary(body).subscribe({
      next: () => this.fetchDiary(),
      error: err => console.error('Error guardando entrada:', err)
    });
  }

  deleteEntry(id: number): void {
    this.dailyLogService.deleteEntry(id).subscribe({
      next: () => this.fetchDiary(),
      error: err => console.error('Error borrando entrada:', err)
    });
  }

  getEntriesByMeal(meal: string): DailyLogEntryResponse[] {
    return this.entries.filter(e => e.mealType === meal);
  }

  calcular(entry: any, prop: 'calories'|'protein'|'carbs'|'fat'): number {
    if (entry[prop] != null) {
      return entry[prop];
    }
    const item = entry.food || entry.recipe;
    const q = entry.quantity / 100;
    return Math.round((item?.[prop] || 0) * q * 100) / 100;
  }

  traducirMealType(meal: string): string {
    switch (meal) {
      case 'BREAKFAST': return 'Desayuno';
      case 'LUNCH':     return 'Comida';
      case 'DINNER':    return 'Cena';
      case 'SNACK':     return 'Snack';
      default:          return meal;
    }
  }

  saveFastingHours(): void {
    const body = {
      date: this.currentDate,
      fastingHours: this.fastingHours,
      entries: []
    };
    this.dailyLogService.saveOrUpdateDiary(body).subscribe({
      next: () => this.fetchDiary(),
      error: err => console.error('Error guardando horas de ayuno:', err)
    });
  }

  handleImageError(entry: any): void {
    if (entry.food) {
      entry.food.imageUrl = 'assets/img/no-image-food.png';
    }
    if (entry.recipe) {
      entry.recipe.imageUrl = 'assets/img/no-image-food.png';
    }
  }
}
