import { Component, EventEmitter, Output } from '@angular/core';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { FoodService } from '../../../core/food.service';
import {FormsModule} from '@angular/forms';

declare var bootstrap: any; // ✅ declare bootstrap global variable

@Component({
  selector: 'app-search-food-modal',
  standalone: true,
  templateUrl: './search-food-modal.component.html',
  imports: [
    FormsModule
  ]
})
export class SearchFoodModalComponent {
  query: string = '';
  results: any[] = [];
  loading: boolean = false;

  @Output() foodSelected = new EventEmitter<any>();

  private searchSubject = new Subject<string>();

  constructor(private foodService: FoodService) {
    this.searchSubject.pipe(
      debounceTime(400),
      switchMap(query => {
        if (!query.trim()) {
          this.results = [];
          return [];
        }
        this.loading = true;
        return this.foodService.searchFoods(query);
      })
    ).subscribe(result => {
      this.results = result;
      this.loading = false;
    });
  }

  onSearchChange() {
    this.searchSubject.next(this.query);
  }

  selectFood(food: any) {
    this.foodSelected.emit(food);
    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('searchFoodModal')!);
    modalInstance?.hide();
  }

  openModal() {
    const modalInstance = new bootstrap.Modal(document.getElementById('searchFoodModal')!);
    modalInstance.show();
  }
}
