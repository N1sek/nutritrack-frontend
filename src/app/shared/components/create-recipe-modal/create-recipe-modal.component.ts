// src/app/shared/components/create-recipe-modal/create-recipe-modal.component.ts
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FoodService } from '../../../core/food.service';
import { RecipeService } from '../../../core/recipe.service';

declare const bootstrap: any;

@Component({
  selector: 'app-create-recipe-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-recipe-modal.component.html',
  styleUrls: ['./create-recipe-modal.component.scss']
})
export class CreateRecipeModalComponent {
  @Output() recipeCreated = new EventEmitter<any>();

  private foodService = inject(FoodService);
  private recipeService = inject(RecipeService);

  // paso del modal (1=info, 2=ingredientes)
  step = 1;

  // búsqueda de alimentos
  searchQuery = '';
  private activeQuery = '';
  private searchSubject = new Subject<string>();
  loadingExternal = false;
  externalPage = 1;
  externalSize = 10;
  hasMoreExternal = true;

  // resultados
  localResults: any[] = [];
  externalResults: any[] = [];
  mergedResults: any[] = [];

  // formulario receta
  form = {
    name: '',
    description: '',
    instructions: '',
    imageUrl: '',
    mealType: 'LUNCH',
    isPublic: true,
    ingredients: [] as { food: any; quantity: number; customNutrition?: any }[]
  };

  // edición de nutrición
  editingIndex: number | null = null;
  customNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  // totales
  total = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  constructor() {
    // configurar debounce de búsqueda
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(query => {
        const q = query.trim();
        if (!q) {
          this.clearSearch();
          return;
        }
        this.activeQuery = q;
        this.externalPage = 1;
        this.hasMoreExternal = true;
        this.loadingExternal = true;
        this.fetchLocalFoods(q);
        this.fetchExternalFoods(q);
      });
  }

  /** Abre el modal */
  openModal() {
    const modalEl = document.getElementById('createRecipeModal')!;
    new bootstrap.Modal(modalEl).show();
  }

  /** Cambiar de paso */
  goToStep(step: number) {
    this.step = step;
    if (step === 2) {
      // reset búsqueda al entrar al paso 2
      this.searchQuery = '';
      this.clearSearch();
    }
  }

  /** Handler de input de búsqueda */
  onSearchQueryChange() {
    this.searchSubject.next(this.searchQuery);
  }

  /** Limpia resultados de búsqueda */
  private clearSearch() {
    this.localResults = [];
    this.externalResults = [];
    this.mergedResults = [];
    this.loadingExternal = false;
    this.hasMoreExternal = true;
  }

  /** Trae alimentos locales */
  private fetchLocalFoods(query: string) {
    this.foodService.searchLocalFoods(query).subscribe(res => {
      if (query !== this.activeQuery) return;
      this.localResults = res;
      this.mergeResults();
    });
  }

  /** Trae alimentos externos paginados */
  private fetchExternalFoods(query: string) {
    this.foodService
      .searchExternalFoods(query, this.externalPage, this.externalSize)
      .subscribe(res => {
        if (query !== this.activeQuery) return;
        if (this.externalPage === 1) {
          this.externalResults = res;
        } else {
          this.externalResults = [...this.externalResults, ...res];
        }
        if (res.length < this.externalSize) {
          this.hasMoreExternal = false;
        }
        this.loadingExternal = false;
        this.mergeResults();
      });
  }

  /** Cargar siguiente página de externos */
  loadMoreExternalFoods() {
    if (this.loadingExternal || !this.hasMoreExternal) return;
    this.externalPage++;
    this.loadingExternal = true;
    this.fetchExternalFoods(this.activeQuery);
  }

  /** Unir locales primero, luego externos sin duplicados */
  private mergeResults() {
    const seen = new Set<string>();
    const all: any[] = [];

    for (const f of this.localResults) {
      const key = `${f.name.toLowerCase()}|${f.imageUrl || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        all.push({ ...f, tempQuantity: 100 });
      }
    }
    for (const f of this.externalResults) {
      const key = `${f.name.toLowerCase()}|${f.imageUrl || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        all.push({ ...f, tempQuantity: 100 });
      }
    }

    this.mergedResults = all;
  }

  /** Añadir ingrediente (importa si no tiene id) */
  addIngredient(food: any) {
    const quantity = food.tempQuantity || 100;
    const finalize = (f: any) => {
      if (!this.form.ingredients.some(i => i.food.id === f.id)) {
        this.form.ingredients.push({ food: f, quantity });
        this.updateTotal();
      }
    };

    if (!food.id) {
      this.foodService.importFood(food).subscribe({
        next: finalize,
        error: err => console.error('Error importar alimento:', err)
      });
    } else {
      finalize(food);
    }
  }

  /** Editar valores custom de nutrición */
  startEditNutrition(index: number) {
    this.editingIndex = index;
    const base = this.form.ingredients[index].customNutrition || this.form.ingredients[index].food;
    this.customNutrition = {
      calories: base.calories ?? 0,
      protein: base.protein ?? 0,
      carbs: base.carbs ?? 0,
      fat: base.fat ?? 0
    };
  }
  confirmEditNutrition() {
    if (this.editingIndex !== null) {
      this.form.ingredients[this.editingIndex].customNutrition = { ...this.customNutrition };
      this.editingIndex = null;
      this.updateTotal();
    }
  }
  cancelEditNutrition() {
    this.editingIndex = null;
  }

  /** Cambiar qty de ingrediente */
  updateIngredientQuantity(index: number, qty: number) {
    if (qty > 0) {
      this.form.ingredients[index].quantity = qty;
      this.updateTotal();
    }
  }

  /** Quitar ingrediente */
  removeIngredient(index: number) {
    this.form.ingredients.splice(index, 1);
    this.updateTotal();
  }

  /** Recalcular totales */
  private updateTotal() {
    const tot = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const i of this.form.ingredients) {
      const f = i.customNutrition || i.food;
      const factor = i.quantity / 100;
      tot.calories += (f.calories || 0) * factor;
      tot.protein  += (f.protein  || 0) * factor;
      tot.carbs    += (f.carbs    || 0) * factor;
      tot.fat      += (f.fat      || 0) * factor;
    }
    this.total = {
      calories: Math.round(tot.calories),
      protein:  Math.round(tot.protein),
      carbs:    Math.round(tot.carbs),
      fat:      Math.round(tot.fat)
    };
  }

  /** Enviar receta al backend */
  submitRecipe() {
    const invalid = this.form.ingredients.find(i => !i.food?.id);
    if (invalid) {
      console.error('Ingrediente sin ID:', invalid);
      return;
    }

    const payload = {
      name: this.form.name,
      description: this.form.description,
      instructions: this.form.instructions,
      imageUrl: this.form.imageUrl,
      mealType: this.form.mealType,
      isPublic: this.form.isPublic,
      ingredients: this.form.ingredients.map(i => ({
        foodId: i.food.id,
        quantity: i.quantity
      }))
    };

    this.recipeService.createRecipe(payload).subscribe({
      next: created => {
        this.recipeCreated.emit(created);
        const modal = bootstrap.Modal.getInstance(document.getElementById('createRecipeModal')!);
        modal?.hide();
        this.resetForm();
      },
      error: err => console.error('Error crear receta:', err)
    });
  }

  /** Reset completo del formulario */
  private resetForm() {
    this.form = {
      name: '',
      description: '',
      instructions: '',
      imageUrl: '',
      mealType: 'LUNCH',
      isPublic: true,
      ingredients: []
    };
    this.step = 1;
    this.searchQuery = '';
    this.clearSearch();
    this.editingIndex = null;
    this.customNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    this.total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
}
