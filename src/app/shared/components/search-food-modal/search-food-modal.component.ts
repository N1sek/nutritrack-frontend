import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';
import { FoodService } from '../../../core/food.service';
import { RecipeService } from '../../../core/recipe.service';

declare var bootstrap: any;

@Component({
  selector: 'app-search-food-modal',
  standalone: true,
  templateUrl: './search-food-modal.component.html',
  imports: [CommonModule, FormsModule]
})
export class SearchFoodModalComponent {
  @Output() itemSelected = new EventEmitter<any>();

  query = '';
  quantity = 100;
  mealType = '';
  mode: 'food' | 'recipe' = 'food';

  localResults: any[] = [];
  externalResults: any[] = [];
  mergedResults: any[] = [];
  recipeResults: any[] = [];

  externalPage = 1;
  externalSize = 10;
  hasMoreExternal = true;

  loadingExternal = false;
  private searchSubject = new Subject<string>();
  private activeQuery = '';

  private foodService = inject(FoodService);
  private recipeService = inject(RecipeService);

  constructor() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(q => {
      const trimmed = q.trim();
      if (!trimmed) {
        this.resetResults();
        return;
      }

      this.activeQuery = trimmed;
      this.externalPage = 1;
      this.hasMoreExternal = true;
      this.loadingExternal = true;

      if (this.mode === 'food') {
        this.fetchLocalResults(trimmed);
        this.fetchExternalResults(trimmed);
      } else {
        this.fetchRecipes(trimmed);
      }
    });
  }

  openModal(mealType: string) {
    this.mode = 'food';
    this.mealType = mealType;
    this.query = '';
    this.resetResults();
    new bootstrap.Modal(document.getElementById('searchFoodModal')!).show();
  }

  onSearchChange() {
    this.searchSubject.next(this.query);
  }

  resetResults() {
    this.localResults = [];
    this.externalResults = [];
    this.mergedResults = [];
    this.recipeResults = [];
    this.loadingExternal = false;
  }

  private fetchLocalResults(query: string) {
    this.foodService.searchLocalFoods(query).subscribe(res => {
      if (query !== this.activeQuery) return;
      this.localResults = res;
      this.mergeResults();
    });
  }

  private fetchExternalResults(query: string) {
    this.foodService.searchExternalFoods(query, this.externalPage, this.externalSize)
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

  loadMoreExternalFoods() {
    if (this.loadingExternal || !this.hasMoreExternal) return;
    this.externalPage++;
    this.loadingExternal = true;
    this.fetchExternalResults(this.activeQuery);
  }

  private mergeResults() {
    const seen = new Set<string>();
    const all: any[] = [];

    // locales primero
    for (const f of this.localResults) {
      const key = f.name.toLowerCase() + '|' + (f.imageUrl || '');
      if (!seen.has(key)) {
        seen.add(key);
        all.push({ ...f, tempQuantity: 100 });
      }
    }
    // luego externos
    for (const f of this.externalResults) {
      const key = f.name.toLowerCase() + '|' + (f.imageUrl || '');
      if (!seen.has(key)) {
        seen.add(key);
        all.push({ ...f, tempQuantity: 100 });
      }
    }

    this.mergedResults = all;
  }

  private fetchRecipes(query: string) {
    this.recipeService.searchRecipes(query).subscribe(res => {
      this.recipeResults = res;
    });
  }

  selectItem(item: any) {
    const modal = bootstrap.Modal.getInstance(document.getElementById('searchFoodModal')!);

    if (this.mode === 'food') {
      // si no tiene id (solo externo), importarlo primero
      if (!item.id) {
        this.foodService.importFood(item).subscribe({
          next: imported => {
            this.itemSelected.emit({
              foodId: imported.id,
              quantity: this.quantity,
              mealType: this.mealType
            });
            modal?.hide();
          },
          error: err => console.error('Error al importar alimento:', err)
        });
      } else {
        this.itemSelected.emit({
          foodId: item.id,
          quantity: this.quantity,
          mealType: this.mealType
        });
        modal?.hide();
      }

    } else {
      // modo receta
      this.itemSelected.emit({
        recipeId: item.id,
        quantity: this.quantity,
        mealType: this.mealType
      });
      modal?.hide();
    }
  }

}
