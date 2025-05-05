import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-recipe-card',
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss']
})
export class RecipeCardComponent {
  @Input() name!: string;
  @Input() calories!: number;
  @Input() proteins!: number;
  @Input() carbs!: number;
  @Input() fats!: number;
  @Input() imageUrl!: string;
  @Input() tags!: string[];
  @Input() mealType!: string;
  @Input() isFavorite: boolean = false;

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }
}

