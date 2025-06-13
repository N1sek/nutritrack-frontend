import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-recipe-filters',
  templateUrl: './recipe-filters.component.html',
  imports: [
    FormsModule,
    NgClass
  ],
  styleUrls: ['./recipe-filters.component.scss']
})
export class RecipeFiltersComponent {
  @Output() filtersChanged = new EventEmitter<any>();

  searchQuery: string = '';
  minCalories: number | null = null;
  maxCalories: number | null = null;
  selectedMealType: string = '';
  selectedTags: string = '';
  selectedAlergens: string[] = [];
  showFavorites: boolean = false;

  isMobile: boolean = window.innerWidth < 768;

  mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

  translateMealType(type: string): string {
    switch (type) {
      case 'BREAKFAST': return 'Desayuno';
      case 'LUNCH': return 'Comida';
      case 'DINNER': return 'Cena';
      case 'SNACK': return 'Snack';
      default: return type;
    }
  }

  allergens = [
    { name: 'Gluten', icon: '🍞' },
    { name: 'Lactosa', icon: '🥛' },
    { name: 'Huevo', icon: '🥚' },
    { name: 'Nueces', icon: '🌰' },
    { name: 'Soja', icon: '🌱' },
    { name: 'Pescado', icon: '🐟' },
    { name: 'Mariscos', icon: '🦐' },
    { name: 'Mostaza', icon: '🌶️' },
    { name: 'Sésamo', icon: '⚪' },
    { name: 'Sulfitos', icon: '🍷' },
    { name: 'Cacahuetes', icon: '🥜' },
    { name: 'Apio', icon: '🥬' }
  ];

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  applyFilters() {

    if (!this.isMobile) {
      this.filtersChanged.emit(this.getFilters());
    }
  }

  // Aplicar cambios solo al pulsar el boton de Aplicar
  applyFiltersOnMobile() {
    this.filtersChanged.emit(this.getFilters());
  }

  toggleFavorites() {
    this.showFavorites = !this.showFavorites;
    this.applyFilters();
  }

  toggleAllergen(allergen: string) {
    const index = this.selectedAlergens.indexOf(allergen);
    if (index > -1) {
      this.selectedAlergens.splice(index, 1);
    } else {
      this.selectedAlergens.push(allergen);
    }
    this.applyFilters();
  }

  private getFilters() {
    return {
      searchQuery: this.searchQuery,
      minCalories: this.minCalories,
      maxCalories: this.maxCalories,
      selectedMealType: this.selectedMealType,
      selectedTags: this.selectedTags,
      selectedAlergens: this.selectedAlergens,
      showFavorites: this.showFavorites
    };
  }
}
