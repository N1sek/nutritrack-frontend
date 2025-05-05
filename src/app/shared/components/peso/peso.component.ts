import {AfterViewInit, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-peso',
  imports: [CommonModule],
  templateUrl: './peso.component.html',
  styleUrl: './peso.component.scss'
})
export class PesoComponent implements AfterViewInit {

  ngAfterViewInit() {
    this.createWeightChart();
    this.createNutricionChart();
    this.createAguaChart();
  }

  createNutricionChart() {
    const ctx = document.getElementById('nutricionChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Consumido', 'Restante'],
        datasets: [{
          data: [1200, 596],  // Ejemplo: 1200 consumido, 596 restante
          backgroundColor: ['#0d6efd', '#e9ecef'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  }

  createAguaChart() {
    const ctx = document.getElementById('aguaChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Consumido', 'Restante'],
        datasets: [{
          data: [1.5, 0.5],  // 1.5L consumido, 0.5L restante
          backgroundColor: ['#0d6efd', '#e9ecef'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        rotation: -90,
        circumference: 180, // media circunferencia
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  }


  createWeightChart() {
    const ctx = document.getElementById('weightChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Peso (kg)',
          data: [72, 71.5, 71.8, 71.3, 71, 70.8, 70.5],
          backgroundColor: '#4eabf9',
          borderRadius: 8,
          barThickness: 20
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            suggestedMin: 70,
            suggestedMax: 73,
            grid: {
              drawTicks: false
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }


}
