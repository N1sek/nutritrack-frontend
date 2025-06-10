import { Component, EventEmitter, Input, Output } from '@angular/core';
import {RecipeService} from '../../../../../core/recipe.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent {
  @Input() id!: number;
  @Input() name!: string;
  @Input() calories!: number;
  @Input() proteins!: number;
  @Input() carbs!: number;
  @Input() fats!: number;
  @Input() imageUrl!: string;
  @Input() mealType!: string;
  @Input() tags: string[] = [];
  @Input() isFavorite: boolean = false;

  @Output() favoriteChanged = new EventEmitter<boolean>();
  @Output() view = new EventEmitter<number>();

  isToggling = false;

  constructor(private recipeService: RecipeService) {}

  viewDetails() {
    this.view.emit(this.id);
  }

  toggleFavorite() {
    if (this.isToggling) return;
    this.isToggling = true;
    this.recipeService.toggleFavorite(this.id)
      .pipe(finalize(() => this.isToggling = false))
      .subscribe({
        next: () => {
          this.isFavorite = !this.isFavorite;
          this.favoriteChanged.emit(this.isFavorite);
        },
        error: err => console.error('Error toggling favorite:', err)
      });
  }
}
