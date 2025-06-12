import {Component, OnInit, ViewChild, ElementRef, inject} from '@angular/core';
import { CommonModule }                      from '@angular/common';
import { FormsModule }                       from '@angular/forms';
import { Modal, Toast }                      from 'bootstrap';
import { RecipeService, Recipe, PaginatedRecipes } from '../../../core/recipe.service';
import {FoodService} from '../../../core/food.service';

@Component({
  selector: 'app-admin-recipes',
  standalone: true,
  imports: [ CommonModule, FormsModule],
  templateUrl: './admin-recipes.component.html',
  styleUrls: ['./admin-recipes.component.scss']
})
export class AdminRecipesComponent implements OnInit {
  private foodService = inject(FoodService);
  recipesPage!: PaginatedRecipes;
  loading = false;

  searchTerm = '';

  pageSize     = 10;
  currentPage  = 0;

  ingredientSearch = '';
  ingredientResults: any[] = [];
  selectedIngredient: any = null;
  newIngredientQuantity: number | null = null;
  newIngredientUnit: string = 'g';

  @ViewChild('formModal') formModalRef!: ElementRef<HTMLDivElement>;
  private formModal!: Modal;

  editingRecipe: Recipe | null = null;
  recipeFormData: Partial<Recipe> = {
    name: '',
    description: '',
    instructions: '',
    mealType: undefined,
    imageUrl: '',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    isPublic: false,
    ingredients: []
  };
  selectedFile: File | null = null;

  @ViewChild('confirmModal') confirmModalRef!: ElementRef<HTMLDivElement>;
  private confirmModal!: Modal;
  selectedRecipeToDelete: Recipe | null = null;


  @ViewChild('toast') toastRef!: ElementRef<HTMLDivElement>;
  private toast!: Toast;
  toastMessage = '';

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loading = true;
    this.recipeService
      .getAllRecipes(this.currentPage, this.pageSize)
      .subscribe({
        next: page => {
          this.recipesPage = page;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.showToast('Error cargando recetas');
        }
      });
  }


  get filteredContent(): Recipe[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.recipesPage.content.filter(r =>
      !term || r.name.toLowerCase().includes(term)
    );
  }

  onIngredientSearch() {
    if (this.ingredientSearch.trim().length === 0) {
      this.ingredientResults = [];
      return;
    }

    this.foodService.searchExternalFoods(this.ingredientSearch.trim(), 0, 10).subscribe({
      next: foods => this.ingredientResults = foods,
      error: () => this.ingredientResults = []
    });
  }

  selectIngredient(food: any) {
    this.selectedIngredient = food;
    this.ingredientSearch = food.name;
    this.ingredientResults = [];
  }

  addIngredient() {
    if (!this.selectedIngredient || !this.newIngredientQuantity) return;
    (this.recipeFormData.ingredients as any[]).push({
      food: this.selectedIngredient,
      quantity: this.newIngredientQuantity,
      unit: this.newIngredientUnit
    });
    // Limpiar campos
    this.selectedIngredient = null;
    this.ingredientSearch = '';
    this.newIngredientQuantity = null;
    this.newIngredientUnit = 'g';
  }


  removeIngredient(i: number) {
    (this.recipeFormData.ingredients as any[]).splice(i, 1);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredContent.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(n: number): void {
    if (n < 0 || n >= this.totalPages) return;
    this.currentPage = n;
    this.loadRecipes();
  }

  openFormModal(recipe?: Recipe): void {
    if (!this.formModal) {
      this.formModal = new Modal(this.formModalRef.nativeElement, { focus: false });
    }
    if (recipe) {
      this.editingRecipe = recipe;
      this.recipeFormData = {
        ...recipe,
        ingredients: (recipe.ingredients || []).map((ing: any) => ({
          ...ing,
          unit: ing.unit || 'g'
        }))
      };
    } else {
      this.editingRecipe = null;
      this.recipeFormData = {
        name: '',
        description: '',
        instructions: '',
        mealType: undefined,
        imageUrl: '',
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        isPublic: false,
        ingredients: []
      };
    }
    this.selectedFile = null;
    this.formModal.show();
  }

  saveRecipe(): void {
    const doSave = (imageUrl?: string) => {
      const mappedIngredients = (this.recipeFormData.ingredients || []).map((ing: any) => ({
        foodId: ing.food?.id,
        quantity: ing.quantity
      }));

      const payload = {
        ...this.recipeFormData,
        imageUrl: imageUrl ?? this.recipeFormData.imageUrl,
        ingredients: mappedIngredients
      };

      const action$ = this.editingRecipe
        ? this.recipeService.updateAdmin(this.editingRecipe.id, payload)
        : this.recipeService.createRecipe(payload);
      action$.subscribe({
        next: () => {
          this.formModal.hide();
          this.loadRecipes();
          this.showToast(`Receta ${this.editingRecipe ? 'actualizada' : 'creada'} correctamente`);
        },
        error: () => this.showToast('Error al guardar la receta')
      });
    };

    if (this.selectedFile) {
      this.recipeService.uploadImage(this.selectedFile).subscribe({
        next: url => doSave(url),
        error: () => this.showToast('Error subiendo imagen')
      });
    } else {
      doSave();
    }
  }


  onFileSelected(evt: Event) {
    const inp = evt.target as HTMLInputElement;
    if (inp.files?.length) {
      this.selectedFile = inp.files[0];
    }
  }


  confirmDelete(recipe: Recipe): void {
    if (!this.confirmModal) {
      this.confirmModal = new Modal(this.confirmModalRef.nativeElement, { focus: false });
    }
    this.selectedRecipeToDelete = recipe;
    this.confirmModal.show();
  }

  onDeleteConfirmed(): void {
    if (!this.selectedRecipeToDelete) return;
    const id = this.selectedRecipeToDelete.id;
    this.recipeService.deleteMyRecipe(id).subscribe({
      next: () => {
        this.confirmModal.hide();
        this.loadRecipes();
        this.showToast(`Receta eliminada`);
      },
      error: () => this.showToast('Error al eliminar receta')
    });
  }

  private showToast(msg: string): void {
    if (!this.toast) {
      this.toast = new Toast(this.toastRef.nativeElement);
    }
    this.toastMessage = msg;
    this.toast.show();
  }
}
