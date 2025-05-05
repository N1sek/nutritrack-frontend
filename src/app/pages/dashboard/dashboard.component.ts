import { Component, AfterViewInit } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  imports: [
    NavbarComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements AfterViewInit {

  caloriasConsumidas = 1800;
  objetivoCalorias = 2200;
  proteinasConsumidas = 120;
  objetivoProteinas = 150;
  carbohidratosConsumidos = 210;
  objetivoCarbohidratos = 250;
  grasasConsumidas = 80;
  objetivoGrasas = 90;


  ultimasComidas = [
    { id: 1, nombre: 'Tostada con aguacate', imagen: '', cantidad: '100g', calorias: 200, proteinas: 5, carbohidratos: 20, grasas: 10 },
    { id: 2, nombre: 'Batido de proteína', imagen: '', cantidad: '250ml', calorias: 300, proteinas: 25, carbohidratos: 10, grasas: 5 },
    { id: 3, nombre: 'Pollo a la plancha', imagen: '', cantidad: '150g', calorias: 350, proteinas: 40, carbohidratos: 0, grasas: 8 }
  ];

  ngAfterViewInit() {
    this.renderCaloriasChart();
    this.renderPesoChart();
  }

  renderCaloriasChart() {
    new Chart('caloriasChart', {
      type: 'line',
      data: {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        datasets: [{
          label: 'Calorías Consumidas',
          data: [1600, 1750, 1800, 1900, 1850, 2000, 1950],
          borderColor: '#4eabf9',
          tension: 0.3,
          fill: true,
          backgroundColor: 'rgba(78, 171, 249, 0.2)'
        }]
      }
    });
  }

  renderPesoChart() {
    new Chart('pesoChart', {
      type: 'bar',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [{
          label: 'Peso (kg)',
          data: [78, 77.5, 77, 72],
          backgroundColor: '#4eabf9'
        }]
      }
    });
  }

  get caloriasRestantes() {
    return this.objetivoCalorias - this.caloriasConsumidas;
  }

  get proteinasRestantes() {
    return this.objetivoProteinas - this.proteinasConsumidas;
  }

  get carbohidratosRestantes() {
    return this.objetivoCarbohidratos - this.carbohidratosConsumidos;
  }

  get grasasRestantes() {
    return this.objetivoGrasas - this.grasasConsumidas;
  }
}
