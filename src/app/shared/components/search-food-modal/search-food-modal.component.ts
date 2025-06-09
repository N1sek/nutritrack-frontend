import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FoodService } from '../../../core/food.service';
import { RecipeService } from '../../../core/recipe.service';
declare const bootstrap: any;

@Component({
  selector: 'app-search-food-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-food-modal.component.html'
})
export class SearchFoodModalComponent {
  @Output() itemSelected = new EventEmitter<{
    foodId?: number;
    recipeId?: number;
    quantity: number;
    mealType: string;
    unit: 'g' | 'ml';
  }>();

  // estado del buscador
  query = '';
  quantity = 100;
  unit: 'g' | 'ml' = 'g';
  mealType = '';
  mode: 'food' | 'recipe' = 'food';

  // resultados
  localResults: any[] = [];
  externalResults: any[] = [];
  mergedResults: any[] = [];
  recipeResults: any[] = [];

  externalPage = 1;
  externalSize = 10;
  hasMoreExternal = true;
  loadingExternal = false;

  private activeQuery = '';
  private searchSubject = new Subject<string>();

  private foodService = inject(FoodService);
  private recipeService = inject(RecipeService);

  constructor() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(q => this.doSearch(q));
  }

  openModal(mealType: string) {
    this.mode = 'food';
    this.mealType = mealType;
    this.query = '';
    this.quantity = 100;
    this.unit = 'g';
    this.resetResults();
    new bootstrap.Modal(document.getElementById('searchFoodModal')!).show();
  }

  onSearchChange() {
    this.searchSubject.next(this.query);
  }

  private doSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) {
      return this.resetResults();
    }
    this.activeQuery = trimmed;
    this.externalPage = 1;
    this.hasMoreExternal = true;
    this.loadingExternal = true;

    if (this.mode === 'food') {
      this.fetchLocal(trimmed);
      this.fetchExternal(trimmed);
    } else {
      this.fetchRecipes(trimmed);
    }
  }

  private resetResults() {
    this.localResults = [];
    this.externalResults = [];
    this.mergedResults = [];
    this.recipeResults = [];
    this.loadingExternal = false;
  }

  private fetchLocal(q: string) {
    this.foodService.searchLocalFoods(q).subscribe(res => {
      if (q !== this.activeQuery) return;
      this.localResults = res;
      this.merge();
    });
  }

  private fetchExternal(q: string) {
    this.foodService.searchExternalFoods(q, this.externalPage, this.externalSize)
      .subscribe(res => {
        if (q !== this.activeQuery) return;
        if (this.externalPage === 1) this.externalResults = res;
        else this.externalResults.push(...res);

        this.hasMoreExternal = res.length >= this.externalSize;
        this.loadingExternal = false;
        this.merge();
      });
  }

  private merge() {
    const seen = new Set<string>();
    const all: any[] = [];

    for (const f of this.localResults) {
      const key = f.name.toLowerCase() + '|' + (f.imageUrl || '');
      if (!seen.has(key)) {
        seen.add(key);
        all.push({ ...f });
      }
    }
    for (const f of this.externalResults) {
      const key = f.name.toLowerCase() + '|' + (f.imageUrl || '');
      if (!seen.has(key)) {
        seen.add(key);
        all.push({ ...f });
      }
    }
    this.mergedResults = all;
  }

  private fetchRecipes(q: string) {
    this.recipeService.searchRecipes(q).subscribe(res => this.recipeResults = res);
  }

  loadMoreExternalFoods() {
    if (this.loadingExternal || !this.hasMoreExternal) return;
    this.externalPage++;
    this.loadingExternal = true;
    this.fetchExternal(this.activeQuery);
  }

  selectItem(item: any) {
    const modal = bootstrap.Modal.getInstance(document.getElementById('searchFoodModal')!);

    if (this.mode === 'food') {
      if (!item.id) {
        this.foodService.importFood(item).subscribe({
          next: imported => {
            this.itemSelected.emit({
              foodId: imported.id,
              quantity: this.quantity,
              mealType: this.mealType,
              unit: this.unit
            });
            modal.hide();
          },
          error: err => console.error(err)
        });
      } else {
        this.itemSelected.emit({
          foodId: item.id,
          quantity: this.quantity,
          mealType: this.mealType,
          unit: this.unit
        });
        modal.hide();
      }
    } else {
      this.itemSelected.emit({
        recipeId: item.id,
        quantity: this.quantity,
        mealType: this.mealType,
        unit: this.unit
      });
      modal.hide();
    }
  }
}
