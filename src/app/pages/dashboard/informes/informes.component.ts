import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import {NavbarComponent} from '../../../shared/components/navbar/navbar.component';
import {FormsModule} from '@angular/forms';
import {BoxComponent} from '../../../shared/components/box/box.component';

@Component({
  selector: 'app-informes',
  templateUrl: './informes.component.html',
  imports: [
    NavbarComponent,
    FormsModule,
    BoxComponent
  ],
  styleUrls: ['./informes.component.scss']
})
export class InformesComponent implements AfterViewInit {
  fechaInicio: string = '';
  fechaFin: string = '';
  tipoInforme: string = 'calorias';
  registros = [
    { fecha: '2025-02-20', calorias: 1800, proteinas: 120, carbohidratos: 200, grasas: 50, agua: 2, peso: 75, ayuno: 12 },
    { fecha: '2025-02-21', calorias: 1750, proteinas: 110, carbohidratos: 190, grasas: 45, agua: 1.8, peso: 74.8, ayuno: 14 },
    { fecha: '2025-02-22', calorias: 1850, proteinas: 130, carbohidratos: 210, grasas: 55, agua: 2.2, peso: 74.6, ayuno: 13 }
  ];

  ngAfterViewInit() {
    this.createChart('caloriasChart', 'Calorías Consumidas', this.registros.map(r => r.calorias));
    this.createChart('macronutrientesChart', 'Macronutrientes', this.registros.map(r => r.proteinas));
    this.createChart('aguaChart', 'Consumo de Agua', this.registros.map(r => r.agua));
    this.createChart('pesoChart', 'Peso Corporal', this.registros.map(r => r.peso));
    this.createChart('ayunoChart', 'Tiempo de Ayuno', this.registros.map(r => r.ayuno));
  }

  createChart(id: string, label: string, data: number[]) {
    new Chart(id, {
      type: 'line',
      data: {
        labels: this.registros.map(r => r.fecha),
        datasets: [{
          label,
          data,
          borderColor: '#4eabf9',
          backgroundColor: 'rgba(78, 171, 249, 0.2)',
          fill: true
        }]
      }
    });
  }
}
