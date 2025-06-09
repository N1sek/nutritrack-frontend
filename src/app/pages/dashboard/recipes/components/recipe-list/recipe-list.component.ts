import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent {
  @Input() name!: string;
  @Input() calories!: number;
  @Input() proteins!: number;
  @Input() carbs!: number;
  @Input() fats!: number;
  @Input() imageUrl!: string;
  @Input() isFavorite: boolean = false;
  @Input() tags!: string[];
  @Input() mealType!: string;

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }
}
