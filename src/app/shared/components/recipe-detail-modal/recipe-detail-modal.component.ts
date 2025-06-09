// recipe-detail-modal.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService, Recipe } from '../../../core/recipe.service';
import * as bootstrap from 'bootstrap';
import {Modal} from 'bootstrap';



@Component({
  selector: 'app-recipe-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-detail-modal.component.html',
  styleUrls: ['./recipe-detail-modal.component.scss']
})
export class RecipeDetailModalComponent implements AfterViewInit {
  @ViewChild('modalReceta', { static: true }) modalRef!: ElementRef<HTMLDivElement>;
  private modal!: Modal;

  recipe: Recipe | null = null;
  private recipeService = inject(RecipeService);

  ngAfterViewInit() {
    this.modal = new Modal(this.modalRef.nativeElement, { backdrop: true });
    // Cuando se oculte limpiamos el objeto para no tener restos
    this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.recipe = null;
    });
  }

  openModal(recipeId: number) {
    this.recipeService.getRecipeById(recipeId).subscribe({
      next: data => {
        this.recipe = data;
        // inicializa/obtiene y muestra el modal
        const modalEl = document.getElementById('modalReceta')!;
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl, {
          backdrop: true,
          keyboard: true,
          focus: true
        });
        modal.show();
      },
      error: err => console.error('Error cargando detalle de receta:', err)
    });
  }

  closeModal() {
    const modalEl = document.getElementById('modalReceta')!;
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
      modal.hide();
      modal.dispose();  // limpia también el backdrop
    }
  }

  addToDailyLog() {
    console.log('Añadir receta al diario:', this.recipe?.id);
    // implementar más adelante
  }
}
