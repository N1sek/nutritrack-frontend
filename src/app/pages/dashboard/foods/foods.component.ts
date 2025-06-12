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

  private tempExternalId = -1;

  localResults:    FoodResponse[] = [];
  externalResults: FoodResponse[] = [];
  mergedResults:   FoodResponse[] = [];

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

  tempQuantity: Record<number, number>   = {};
  tempMealType: Record<number, MealType> = {};

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
    const byName = new Map<string, FoodResponse>();
    let tempId = -1;

    for (const f of [...this.localResults, ...this.externalResults]) {
      const nameKey = f.name.trim().toLowerCase();
      if (!byName.has(nameKey)) {
        const clone = { ...f };
        if (clone.id == null) clone.id = tempId--;
        byName.set(nameKey, clone);
      } else {
        const existing = byName.get(nameKey)!;
        if (!existing.imageUrl && f.imageUrl) {
          const clone = { ...f };
          clone.id = existing.id;
          byName.set(nameKey, clone);
        }
      }
    }

    this.mergedResults = Array.from(byName.values());
    this.loading       = false;

    for (const food of this.mergedResults) {
      const id = food.id!;
      if (this.tempQuantity[id] == null) this.tempQuantity[id] = 100;
      if (this.tempMealType[id] == null) this.tempMealType[id] = 'LUNCH';
    }
  }



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

  createFood() {
    this.foodService.createFood(this.newFood).subscribe({
      next: created => {
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


  addToDiary(food: FoodResponse) {
    const performAdd = (id: number) => {
      const entry = {
        foodId:   id,
        quantity: this.tempQuantity[id],
        mealType: this.tempMealType[id]
      };
      this.dailyLogService.saveOrUpdateDiary({
        date: this.currentDate,
        fastingHours: null,
        entries: [entry]
      }).subscribe({
        next: () => { this.showToast('📝 Se ha añadido al diario', 'success'); },
        error: err => { this.showToast('⚠️ No se pudo añadir al diario', 'danger'); }
      });
    };

    if (food.id! < 0) {
      const payload = {
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        imageUrl: food.imageUrl
      };
      this.foodService.createFood(payload).subscribe({
        next: created => {
          const oldId = food.id!;
          food.id = created.id;

          this.tempQuantity[created.id] = this.tempQuantity[oldId];
          this.tempMealType[created.id] = this.tempMealType[oldId];
          delete this.tempQuantity[oldId];
          delete this.tempMealType[oldId];

          this.mergedResults = this.mergedResults.map(item =>
            item === food ? { ...item, id: created.id } : item
          );
          performAdd(created.id);
        },
        error: err => {
          this.showToast('⚠️ No se pudo crear el alimento', 'danger');
        }
      });
    } else {
      performAdd(food.id!);
    }
  }

  private showToast(message: string, variant: 'success' | 'danger' = 'success') {
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${variant} border-0 position-fixed bottom-0 end-0 m-3`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button"
                class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast"
                aria-label="Cerrar"></button>
      </div>
    `;
    document.body.appendChild(toastEl);
    (window as any).bootstrap.Toast
      .getOrCreateInstance(toastEl)
      .show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }
}
