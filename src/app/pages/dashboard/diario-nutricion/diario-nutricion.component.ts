import { Component, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { BoxComponent } from '../../../shared/components/box/box.component';
import { SearchFoodModalComponent } from '../../../shared/components/search-food-modal/search-food-modal.component';

@Component({
  selector: 'app-nutrition-diary',
  standalone: true,
  templateUrl: './diario-nutricion.component.html',
  styleUrl: './diario-nutricion.component.scss',
  imports: [
    NavbarComponent,
    BoxComponent,
    SearchFoodModalComponent
  ]
})
export class DiarioNutricionComponent {
  @ViewChild(SearchFoodModalComponent) searchFoodModal!: SearchFoodModalComponent;

  foods: any[] = [];

  calorieGoal = 2200;
  proteinGoal = 150;
  carbGoal = 250;
  fatGoal = 90;

  currentMealType: string = '';

  get totalNutrients() {
    return this.foods.reduce(
      (acc, food) => {
        acc.calories += food.calories;
        acc.protein += food.protein;
        acc.carbs += food.carbs;
        acc.fat += food.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }

  getFoodsForMeal(mealType: string) {
    return this.foods.filter(f => f.mealType === mealType);
  }

  openModal(mealType: string) {
    this.currentMealType = mealType;
    this.searchFoodModal.openModal();
  }

  handleFoodSelected(food: any) {
    const newFood = {
      id: Date.now(),
      name: food.name,
      image: food.imageUrl,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      quantity: '100g',
      mealType: this.currentMealType
    };
    this.foods.push(newFood);
  }
}
