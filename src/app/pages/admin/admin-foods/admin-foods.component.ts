import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal, Toast } from 'bootstrap';
import { FoodService, FoodResponse, FoodRequest } from '../../../core/food.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-admin-foods',
  standalone: true,
  imports: [ CommonModule, FormsModule, NavbarComponent ],
  templateUrl: './admin-foods.component.html',
  styleUrls: ['./admin-foods.component.scss']
})
export class AdminFoodsComponent implements OnInit {
  foods: FoodResponse[] = [];
  loading = false;

  // Búsqueda y filtro
  searchTerm = '';
  filterImported: 'all' | 'imported' | 'local' = 'all';

  // Paginación
  pageSize = 10;
  currentPage = 1;

  // Formulario create/edit
  @ViewChild('formModal') formModalRef!: ElementRef<HTMLDivElement>;
  private formModal!: Modal;
  editingFood: FoodResponse | null = null;
  foodFormData: FoodRequest = {
    name: '',
    imageUrl: '',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    sugar: 0,
    salt: 0,
    saturatedFat: 0,
    allergenIds: []
  };

  @ViewChild('confirmModal') confirmModalRef!: ElementRef<HTMLDivElement>;
  private confirmModal!: Modal;
  selectedFood: FoodResponse | null = null;


  @ViewChild('toast') toastRef!: ElementRef<HTMLDivElement>;
  private toast!: Toast;
  toastMessage = '';

  constructor(private foodService: FoodService) {}

  ngOnInit(): void {
    this.loadFoods();
  }

  private loadFoods(): void {
    this.loading = true;
    this.foodService.listAll().subscribe({
      next: list => {
        this.foods = list;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }


  get filteredFoods(): FoodResponse[] {
    return this.foods
      .filter(f => {
        const term = this.searchTerm.trim().toLowerCase();
        return !term || f.name.toLowerCase().includes(term);
      })
      .filter(f => {
        if (this.filterImported === 'all') return true;
        return this.filterImported === 'imported' ? !!f.imageUrl : !f.imageUrl;
      });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredFoods.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedFoods(): FoodResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredFoods.slice(start, start + this.pageSize);
  }

  goToPage(n: number): void {
    if (n < 1 || n > this.totalPages) return;
    this.currentPage = n;
  }

  openFormModal(food?: FoodResponse): void {
    if (!this.formModal) {
      this.formModal = new Modal(this.formModalRef.nativeElement, {
        focus: false
      });
    }
    if (food) {
      this.editingFood = food;
      this.foodFormData = {
        name: food.name,
        imageUrl: food.imageUrl || '',
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        sugar: food.sugar ?? 0,
        salt: food.salt ?? 0,
        saturatedFat: food.saturatedFat ?? 0,
        allergenIds: []
      };
    } else {
      this.editingFood = null;
      this.foodFormData = {
        name: '',
        imageUrl: '',
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        sugar: 0,
        salt: 0,
        saturatedFat: 0,
        allergenIds: []
      };
    }
    this.formModal.show();
  }

  saveFood(): void {
    const action$ = this.editingFood
      ? this.foodService.updateAdmin(this.editingFood.id, this.foodFormData)
      : this.foodService.createAdmin(this.foodFormData);

    action$.subscribe({
      next: () => {
        this.formModal.hide();
        this.loadFoods();
        this.showToast(`Alimento ${this.editingFood ? 'actualizado' : 'creado'} correctamente.`);
      },
      error: () => {
        this.showToast('Error al guardar el alimento.');
      }
    });
  }

  confirmDelete(food: FoodResponse): void {
    if (!this.confirmModal) {
      this.confirmModal = new Modal(this.confirmModalRef.nativeElement, {
        focus: false
      });
    }
    this.selectedFood = food;
    this.confirmModal.show();
  }

  onDeleteConfirmed(): void {
    if (!this.selectedFood) return;

    const name = this.selectedFood.name;
    const id   = this.selectedFood.id;

    this.foodService
      .deleteAdmin(id)
      .subscribe({
        next: () => {
          this.confirmModal.hide();
          this.loadFoods();
          this.showToast(`Alimento "${name}" eliminado.`);
        },
        error: () => {
          this.showToast('Error al eliminar el alimento.');
        }
      });
  }

  trackById(_index: number, item: FoodResponse) {
    return item.id;
  }


  private showToast(msg: string): void {
    if (!this.toast) {
      this.toast = new Toast(this.toastRef.nativeElement);
    }
    this.toastMessage = msg;
    this.toast.show();
  }
}
