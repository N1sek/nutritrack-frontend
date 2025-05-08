import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFoodModalComponent } from './search-food-modal.component';

describe('SearchFoodModalComponent', () => {
  let component: SearchFoodModalComponent;
  let fixture: ComponentFixture<SearchFoodModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFoodModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchFoodModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
