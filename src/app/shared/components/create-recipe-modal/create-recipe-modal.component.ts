// src/app/shared/components/create-recipe-modal/create-recipe-modal.component.ts
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FoodService } from '../../../core/food.service';
import { RecipeService } from '../../../core/recipe.service';

declare const bootstrap: any;

interface Ingredient {
  food: any;
  quantity: number;
  unit: 'g' | 'ml';
  customNutrition?: any;
}

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

  searchQuery = '';
  private activeQuery = '';
  private searchSubject = new Subject<string>();
  loadingExternal = false;
  externalPage = 1;
  externalSize = 10;
  hasMoreExternal = true;

  localResults: any[] = [];
  externalResults: any[] = [];
  mergedResults: any[] = [];

  form = {
    name: '',
    description: '',
    instructions: '',
    imageUrl: '',
    imageFile: null as File | null,
    mealType: 'LUNCH',
    isPublic: true,
    ingredients: [] as Ingredient[]
  };

  imagePreview: string | null = null;

  editingIndex: number | null = null;
  customNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  total = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  constructor() {
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(q => {
        const trimmed = q.trim();
        if (!trimmed) {
          this.clearSearch();
          return;
        }
        this.activeQuery = trimmed;
        this.externalPage = 1;
        this.hasMoreExternal = true;
        this.loadingExternal = true;
        this.fetchLocalFoods(trimmed);
        this.fetchExternalFoods(trimmed);
      });
  }

  openModal() {
    const modalEl = document.getElementById('createRecipeModal')!;
    new bootstrap.Modal(modalEl).show();
  }

  goToStep(n: number) {
    this.step = n;
    if (n === 2) {
      this.searchQuery = '';
      this.clearSearch();
    }
  }

  onSearchQueryChange() {
    this.searchSubject.next(this.searchQuery);
  }

  private clearSearch() {
    this.localResults = [];
    this.externalResults = [];
    this.mergedResults = [];
    this.loadingExternal = false;
    this.hasMoreExternal = true;
  }

  private fetchLocalFoods(query: string) {
    this.foodService.searchLocalFoods(query).subscribe(res => {
      if (query !== this.activeQuery) return;
      this.localResults = res;
      this.mergeResults();
    });
  }

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
        this.hasMoreExternal = res.length === this.externalSize;
        this.loadingExternal = false;
        this.mergeResults();
      });
  }

  loadMoreExternalFoods() {
    if (this.loadingExternal || !this.hasMoreExternal) return;
    this.externalPage++;
    this.loadingExternal = true;
    this.fetchExternalFoods(this.activeQuery);
  }

  private mergeResults() {
    const seen = new Set<string>();
    const all: any[] = [];

    for (const f of this.localResults) {
      const key = `${f.name.toLowerCase()}|${f.imageUrl || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        all.push({ ...f, tempQuantity: 100, tempUnit: 'g' as 'g' | 'ml' });
      }
    }
    for (const f of this.externalResults) {
      const key = `${f.name.toLowerCase()}|${f.imageUrl || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        all.push({ ...f, tempQuantity: 100, tempUnit: 'g' as 'g' | 'ml' });
      }
    }

    this.mergedResults = all;
  }

  addIngredient(food: any) {
    const qty  = food.tempQuantity || 100;
    const unit = food.tempUnit || 'g';
    const finalize = (f: any) => {
      if (!this.form.ingredients.find(i => i.food.id === f.id)) {
        this.form.ingredients.push({ food: f, quantity: qty, unit });
        this.updateTotal();
      }
    };

    if (!food.id) {
      this.foodService.importFood(food).subscribe({
        next: finalize,
        error: err => console.error('Error al importar alimento:', err)
      });
    } else {
      finalize(food);
    }
  }

  startEditNutrition(idx: number) {
    this.editingIndex = idx;
    const base = this.form.ingredients[idx].customNutrition || this.form.ingredients[idx].food;
    this.customNutrition = {
      calories: base.calories ?? 0,
      protein:  base.protein  ?? 0,
      carbs:    base.carbs    ?? 0,
      fat:      base.fat      ?? 0
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

  updateIngredientQuantity(idx: number, qty: number) {
    if (qty > 0) {
      this.form.ingredients[idx].quantity = qty;
      this.updateTotal();
    }
  }

  removeIngredient(idx: number) {
    this.form.ingredients.splice(idx, 1);
    this.updateTotal();
  }

  private updateTotal() {
    const tot = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const ing of this.form.ingredients) {
      const f      = ing.customNutrition || ing.food;
      const factor = ing.quantity / 100;
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

  onFileSelected(evt: Event) {
    const inp = (evt.target as HTMLInputElement);
    if (!inp.files || inp.files.length === 0) {
      this.form.imageFile = null;
      this.imagePreview = null;
      return;
    }
    const file = inp.files[0];
    this.form.imageFile = file;

    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  submitRecipe() {
    const finishCreate = () => {
      const payload = {
        name:         this.form.name,
        description:  this.form.description,
        instructions: this.form.instructions,
        imageUrl:     this.form.imageUrl,
        mealType:     this.form.mealType,
        isPublic:     this.form.isPublic,
        ingredients:  this.form.ingredients.map(i => ({
          foodId:   i.food.id,
          quantity: i.quantity,
          unit:     i.unit
        }))
      };
      this.recipeService.createRecipe(payload).subscribe({
        next: created => {
          this.recipeCreated.emit(created);
          const modal = bootstrap.Modal.getInstance(
            document.getElementById('createRecipeModal')!
          );
          modal?.hide();
          this.resetForm();
        },
        error: err => console.error('Error crear receta:', err)
      });
    };

    if (this.form.imageFile) {
      this.recipeService.uploadImage(this.form.imageFile).subscribe({
        next: url => {
          this.form.imageUrl = url;
          finishCreate();
        },
        error: err => console.error('Error al subir imagen:', err)
      });
    } else {
      finishCreate();
    }
  }

  private resetForm() {
    this.form = {
      name:         '',
      description:  '',
      instructions: '',
      imageUrl:     '',
      imageFile:    null,
      mealType:     'LUNCH',
      isPublic:     true,
      ingredients:  []
    };
    this.imagePreview     = null;
    this.step             = 1;
    this.searchQuery      = '';
    this.clearSearch();
    this.editingIndex     = null;
    this.customNutrition  = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    this.total            = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
}
