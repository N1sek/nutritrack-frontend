import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRecipeModalComponent } from './create-recipe-modal.component';

describe('CreateRecipeModalComponent', () => {
  let component: CreateRecipeModalComponent;
  let fixture: ComponentFixture<CreateRecipeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRecipeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRecipeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
