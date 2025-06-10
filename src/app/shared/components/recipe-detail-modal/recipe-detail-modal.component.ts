import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService, Recipe } from '../../../core/recipe.service';
import { DailyLogService } from '../../../core/daily-log.service';
import { Modal } from 'bootstrap';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-recipe-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-detail-modal.component.html',
  styleUrls: ['./recipe-detail-modal.component.scss']
})
export class RecipeDetailModalComponent implements AfterViewInit {
  @ViewChild('modalReceta', { static: true }) modalRef!: ElementRef<HTMLElement>;
  private modal!: Modal;

  recipe: Recipe | null = null;
  selectedMealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' = 'LUNCH';
  selectedQuantity = 100;

  private recipeService = inject(RecipeService);
  private dailyLogService = inject(DailyLogService);

  ngAfterViewInit() {
    this.modal = new Modal(this.modalRef.nativeElement, { backdrop: true, keyboard: true });
    this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.recipe = null;
    });
  }

  openModal(recipeId: number) {
    this.recipeService.getRecipeById(recipeId).subscribe({
      next: data => {
        this.recipe = data;
        // reset defaults each time
        this.selectedMealType = 'LUNCH';
        this.selectedQuantity = 100;
        this.modal.show();
      },
      error: err => console.error('Error cargando detalle de receta:', err)
    });
  }

  closeModal() {
    this.modal.hide();
  }

  addToDailyLog() {
    if (!this.recipe) return;
    const entry = {
      recipeId: this.recipe.id,
      quantity: this.selectedQuantity,
      mealType: this.selectedMealType
    };
    const payload = {
      date: new Date().toISOString().split('T')[0],
      entries: [entry]
    };
    this.dailyLogService.saveOrUpdateDiary(payload).subscribe({
      next: () => {
        this.modal.hide();
        this.showToast(`Receta «${this.recipe!.name}» añadida al diario.`);
      },
      error: err => {
        console.error('Error al añadir al diario:', err);
        this.showToast('No se pudo añadir al diario.', 'danger');
      }
    });
  }

  private showToast(message: string, variant: 'success' | 'danger' = 'success') {
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${variant} border-0 position-fixed bottom-0 end-0 m-3`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>
    `;
    document.body.appendChild(toastEl);
    (window as any).bootstrap.Toast.getOrCreateInstance(toastEl).show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }
}
