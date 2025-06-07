import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFoodsComponent } from './admin-foods.component';

describe('AdminFoodsComponent', () => {
  let component: AdminFoodsComponent;
  let fixture: ComponentFixture<AdminFoodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFoodsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFoodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
