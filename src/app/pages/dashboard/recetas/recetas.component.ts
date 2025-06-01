import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { RecipeCardComponent } from './components/recipe-card/recipe-card.component';
import { RecipeFiltersComponent } from './components/recipe-filters/recipe-filters.component';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { CreateRecipeModalComponent } from '../../../shared/components/create-recipe-modal/create-recipe-modal.component';
import { RecipeService } from '../../../core/recipe.service';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [
    NavbarComponent,
    RecipeCardComponent,
    RecipeFiltersComponent,
    RecipeListComponent,
    CreateRecipeModalComponent
  ],
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.scss']
})
export class RecetasComponent {
  @ViewChild(CreateRecipeModalComponent) createModal!: CreateRecipeModalComponent;
  private recipeService = inject(RecipeService);

  isGridView: boolean = window.innerWidth >= 768;
  recipes: any[] = [];
  filteredRecipes: any[] = [];

  currentPage = 0;
  totalPages = 0;
  pageSize = 20;

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }


  ngOnInit() {
    this.loadRecipes();
  }

  loadRecipes() {
    this.recipeService.getAllRecipes(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.recipes = res.content;
        this.totalPages = res.totalPages;
        this.filteredRecipes = [...this.recipes];
      },
      error: (err) => console.error('Error al cargar recetas:', err)
    });
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadRecipes();
    }
  }

  toggleView() {
    this.isGridView = !this.isGridView;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isGridView = window.innerWidth >= 768;
  }

  applyFilters(filters: any) {
    this.filteredRecipes = this.recipes.filter(recipe => {
      if (filters.searchQuery && !recipe.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      if (filters.minCalories && recipe.calories < filters.minCalories) return false;
      if (filters.maxCalories && recipe.calories > filters.maxCalories) return false;
      if (filters.selectedMealType && recipe.mealType !== filters.selectedMealType) return false;
      if (filters.selectedAlergens.length > 0) {
        for (let allergen of filters.selectedAlergens) {
          if ((recipe.tags || []).includes(allergen)) return false;
        }
      }
      return !(filters.showFavorites && !recipe.favorited);
    });
  }

  onRecipeCreated() {
    this.loadRecipes();
  }
}
