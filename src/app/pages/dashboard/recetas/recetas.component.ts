import { Component, HostListener } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { RecipeCardComponent } from './components/recipe-card/recipe-card.component';
import { RecipeFiltersComponent } from './components/recipe-filters/recipe-filters.component';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [
    NavbarComponent,
    RecipeCardComponent,
    RecipeFiltersComponent,
    RecipeListComponent
  ],
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.scss']
})
export class RecetasComponent {
  isGridView: boolean = window.innerWidth >= 768; // Cambiar modo vista segun pantalla
  recipes = [
    {
      name: 'Huevos a la flamenca',
      calories: 250,
      proteins: 15,
      carbs: 20,
      fats: 10,
      imageUrl: 'assets/img/plato2.png',
      tags: ['#vegan', '#lowfat'],
      mealType: 'Cena',
      isFavorite: false
    },
    {
      name: 'Hamburguesa de ternera',
      calories: 400,
      proteins: 30,
      carbs: 35,
      fats: 18,
      imageUrl: 'assets/img/plato3.png',
      tags: ['#highprotein'],
      mealType: 'Almuerzo',
      isFavorite: true
    },
    {
      name: 'Tarta de queso',
      calories: 800,
      proteins: 10,
      carbs: 50,
      fats: 45,
      imageUrl: 'assets/img/plato1.png',
      tags: ['#tagüenisimo'],
      mealType: 'Cena',
      isFavorite: false
    }
  ];

  filteredRecipes = [...this.recipes]; // Inicialmente muestra todas las recetas

  constructor() {
    this.updateViewMode();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateViewMode();
  }

  updateViewMode() {
    this.isGridView = window.innerWidth >= 768;
  }

  toggleView() {
    this.isGridView = !this.isGridView;
  }

  applyFilters(filters: any) {
    console.log("📌 Aplicando filtros: ", filters);

    this.filteredRecipes = this.recipes.filter(recipe => {
      // Filtro de busqueda
      if (filters.searchQuery && !recipe.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }

      // Filtro de calorias
      if (filters.minCalories && recipe.calories < filters.minCalories) {
        return false;
      }
      if (filters.maxCalories && recipe.calories > filters.maxCalories) {
        return false;
      }

      // Filtro de tipo de comida
      if (filters.selectedMealType && recipe.mealType !== filters.selectedMealType) {
        return false;
      }

      // Filtro de alergenos
      if (filters.selectedAlergens.length > 0) {
        for (let allergen of filters.selectedAlergens) {
          if (recipe.tags.includes(allergen)) {
            return false; // Excluir receta si contiene alergeno
          }
        }
      }

      // Filtro de favoritos
      return !(filters.showFavorites && !recipe.isFavorite);


    });

  }
}
