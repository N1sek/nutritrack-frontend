import { Component, OnInit, inject } from '@angular/core';
import { CommonModule }                from '@angular/common';
import { FormsModule }                 from '@angular/forms';
import { FoodService, FoodResponse }   from '../../../core/food.service';
import { DailyLogService }             from '../../../core/daily-log.service';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

@Component({
  selector: 'app-foods',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.scss']
})
export class FoodsComponent implements OnInit {
  private foodService     = inject(FoodService);
  private dailyLogService = inject(DailyLogService);

  searchQuery    = '';
  loading        = false;

  localResults:    FoodResponse[] = [];
  externalResults: FoodResponse[] = [];
  mergedResults:   FoodResponse[] = [];

  // Inline crear alimento
  showCreateForm = false;
  newFood = {
    name:     '',
    calories: 0,
    protein:  0,
    carbs:    0,
    fat:      0
  };
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // Para añadir al diario
  tempQuantity: Record<number, number>   = {};
  tempMealType: Record<number, MealType> = {};

  // Fecha para añadir al diario automáticamente
  currentDate = new Date().toISOString().slice(0,10);

  ngOnInit() {}

  onSearch() {
    const q = this.searchQuery.trim();
    if (!q) {
      this.localResults = [];
      this.externalResults = [];
      this.mergedResults   = [];
      return;
    }
    this.loading = true;
    this.foodService.searchLocalFoods(q).subscribe(local => {
      this.localResults = local;
      this.mergeAndInit();
    });
    this.foodService.searchExternalFoods(q, 1, 20).subscribe(ext => {
      this.externalResults = ext;
      this.mergeAndInit();
    });
  }

  private mergeAndInit() {
    const seen = new Set<string>();
    const all: FoodResponse[] = [];

    for (const f of [...this.localResults, ...this.externalResults]) {
      const key = `${f.name.toLowerCase()}|${f.imageUrl||''}`;
      if (!seen.has(key)) {
        seen.add(key);
        all.push(f);
        // init temporales si faltan
        if (this.tempQuantity[f.id] == null)   this.tempQuantity[f.id] = 100;
        if (this.tempMealType[f.id] == null)   this.tempMealType[f.id] = 'LUNCH';
      }
    }

    this.mergedResults = all;
    this.loading       = false;
  }

  // Toggle inline crear
  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) this.resetForm();
  }
  cancelCreate() {
    this.showCreateForm = false;
    this.resetForm();
  }

  private resetForm() {
    this.newFood = { name:'', calories:0, protein:0, carbs:0, fat:0 };
    this.selectedFile = null;
    this.imagePreview = null;
  }

  // Preview imagen
  onFileSelected(evt: Event) {
    const inp = evt.target as HTMLInputElement;
    if (!inp.files?.length) {
      this.selectedFile = null;
      this.imagePreview = null;
      return;
    }
    this.selectedFile = inp.files[0];
    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(this.selectedFile);
  }

  // Llamada al backend para crear
  createFood() {
    this.foodService.createFood(this.newFood).subscribe({
      next: created => {
        // insert al top o refresca búsqueda
        if (this.searchQuery.trim()) {
          this.onSearch();
        } else {
          this.mergedResults = [created, ...this.mergedResults];
        }
        this.cancelCreate();
      },
      error: err => console.error('Error al crear alimento:', err)
    });
  }

  // Añadir al diario
  addToDiary(food: FoodResponse) {
    const entry = {
      foodId:   food.id,
      quantity: this.tempQuantity[food.id],
      mealType: this.tempMealType[food.id]
    };
    this.dailyLogService.saveOrUpdateDiary({
      date: this.currentDate,
      fastingHours: null,
      entries: [entry]
    }).subscribe({
      next: () => {
        // opcional: toast de éxito
      },
      error: err => console.error('Error añadiendo al diario:', err)
    });
  }
}
