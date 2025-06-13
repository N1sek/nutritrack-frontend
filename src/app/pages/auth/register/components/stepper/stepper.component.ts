import { Component, Input } from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'register-stepper',
  standalone: true,
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  imports: [
    NgClass
  ]
})
export class StepperComponent {
  @Input() currentStep = 1;

  steps = [1, 2, 3, 4];
}
