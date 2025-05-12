import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
  query: string = '';
  quantity: number = 100;
  mealType: string = '';
  mode: 'food' | 'recipe' = 'food';

  localResults: any[] = [];
  externalResults: any[] = [];
  mergedResults: any[] = [];
  recipeResults: any[] = [];

  loadingExternal: boolean = false;

  @Output() itemSelected = new EventEmitter<any>();


  private searchSubject = new Subject<string>();

  constructor(
    private foodService: FoodService,
    private recipeService: RecipeService
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      if (!query.trim()) {
        this.resetResults();
        return;
      }

      if (this.mode === 'food') {
        this.fetchLocalResults(query);
        this.fetchExternalResults(query);
      } else {
        this.fetchRecipes(query);
      }
    });
  }

  openModal(mealType: string) {
    this.query = '';
    this.quantity = 100;
    this.mealType = mealType;
    this.mode = 'food';
    this.resetResults();

    const modalInstance = new bootstrap.Modal(document.getElementById('searchFoodModal')!);
    modalInstance.show();
  }

  onSearchChange() {
    this.searchSubject.next(this.query);
  }

  resetResults() {
    this.localResults = [];
    this.externalResults = [];
    this.mergedResults = [];
    this.recipeResults = [];
  }

  fetchLocalResults(query: string) {
    this.foodService.searchLocalFoods(query).subscribe(res => {
      this.localResults = res;
      this.mergeResults();
    });
  }

  fetchExternalResults(query: string) {
    this.loadingExternal = true;
    this.foodService.searchExternalFoods(query).subscribe(res => {
      this.externalResults = res;
      this.loadingExternal = false;
      this.mergeResults();
    });
  }

  mergeResults() {
    const merged = [...this.localResults];
    for (const ext of this.externalResults) {
      if (!merged.some(loc => loc.name === ext.name && loc.imageUrl === ext.imageUrl)) {
        merged.push(ext);
      }
    }
    this.mergedResults = merged;
  }

  fetchRecipes(query: string) {
    this.recipeService.searchRecipes(query).subscribe(res => {
      this.recipeResults = res;
    });
  }

  selectItem(item: any) {
    const modal = bootstrap.Modal.getInstance(document.getElementById('searchFoodModal')!);

    if (!item.id) {
      // alimento importado
      this.foodService.importFood(item).subscribe({
        next: (imported) => {
          this.itemSelected.emit({
            foodId: imported.id,
            quantity: this.quantity,
            mealType: this.mealType
          });
          modal?.hide();
        },
        error: (err) => console.error('Error al importar alimento:', err)
      });
    } else {
      // alimento o receta local
      const payload = item.calories
        ? { foodId: item.id, quantity: this.quantity, mealType: this.mealType }
        : { recipeId: item.id, quantity: this.quantity, mealType: this.mealType };

      this.itemSelected.emit(payload);
      modal?.hide();
      (document.activeElement as HTMLElement)?.blur();

    }
  }
}
