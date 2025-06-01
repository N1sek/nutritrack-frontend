// src/app/pages/dashboard/recetas/components/recipe-card/recipe-card.component.ts
import { Component, Input } from '@angular/core';
import { RecipeService} from '../../../../../core/recipe.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-card',
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss']
})
export class RecipeCardComponent {
  @Input() id!: number;
  @Input() name!: string;
  @Input() calories!: number;
  @Input() proteins!: number;
  @Input() carbs!: number;
  @Input() fats!: number;
  @Input() imageUrl!: string;
  @Input() tags!: string[];
  @Input() mealType!: string;

  // Recibimos true/false desde el padre, que ahora le pasa `recipe.favorited`
  @Input() isFavorite: boolean = false;

  isToggling: boolean = false;

  constructor(private recipeService: RecipeService) {}

  toggleFavorite() {
    if (this.isToggling || this.id == null) {
      return;
    }
    this.isToggling = true;

    this.recipeService.toggleFavorite(this.id).pipe(
      finalize(() => this.isToggling = false)
    ).subscribe({
      next: () => {
        this.isFavorite = !this.isFavorite;
      },
      error: (err: any) => {
        console.error('Error al marcar/desmarcar favorito:', err);
      }
    });
  }
}
