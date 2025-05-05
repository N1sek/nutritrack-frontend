import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { BoxComponent } from '../../../shared/components/box/box.component';

@Component({
  selector: 'app-diario-nutricion',
  imports: [
    NavbarComponent,
    BoxComponent
  ],
  templateUrl: './diario-nutricion.component.html',
  styleUrl: './diario-nutricion.component.scss'
})
export class DiarioNutricionComponent {

  comidas = [
    { id: 1, nombre: 'Tostada con aguacate', imagen: '', cantidad: '100g', calorias: 200, proteinas: 5, carbohidratos: 20, grasas: 10 },
    { id: 2, nombre: 'Batido de proteína', imagen: '', cantidad: '250ml', calorias: 300, proteinas: 25, carbohidratos: 10, grasas: 5 },
    { id: 3, nombre: 'Pollo a la plancha', imagen: '', cantidad: '150g', calorias: 350, proteinas: 40, carbohidratos: 0, grasas: 8 }
  ];

  objetivoCalorias = 2200;
  objetivoProteinas = 150;
  objetivoCarbohidratos = 250;
  objetivoGrasas = 90;

  get totalNutrientes() {
    return this.comidas.reduce(
      (acc, comida) => {
        acc.calorias += comida.calorias;
        acc.proteinas += comida.proteinas;
        acc.carbohidratos += comida.carbohidratos;
        acc.grasas += comida.grasas;
        return acc;
      },
      { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 }
    );
  }

  get recomendaciones() {
    let sugerencias = [];

    if (this.objetivoProteinas - this.totalNutrientes.proteinas > 0) {
      sugerencias.push({
        id: 1,
        nombre: 'Omelette de claras',
        imagen: 'https://acortar.link/oGwpgd',
        calorias: 150,
        proteinas: 20,
        carbohidratos: 2,
        grasas: 5,
        ingredientes: ['4 claras de huevo', '1 pizca de sal', 'Aceite de oliva'],
        preparacion: 'Bate las claras con sal y cocina en sartén con aceite de oliva hasta que cuaje.'
      });
    }
    if (this.objetivoCarbohidratos - this.totalNutrientes.carbohidratos > 0) {
      sugerencias.push({
        id: 2,
        nombre: 'Avena con frutos secos',
        imagen: 'https://acortar.link/y5APZc',
        calorias: 250,
        proteinas: 8,
        carbohidratos: 45,
        grasas: 5,
        ingredientes: ['40g avena', '200ml leche', '10g frutos secos'],
        preparacion: 'Cocina la avena con la leche y agrega frutos secos antes de servir.'
      });
    }
    if (this.objetivoGrasas - this.totalNutrientes.grasas > 0) {
      sugerencias.push({
        id: 3,
        nombre: 'Ensalada de aguacate y nueces',
        imagen: 'https://acortar.link/7wbn87',
        calorias: 200,
        proteinas: 5,
        carbohidratos: 10,
        grasas: 15,
        ingredientes: ['1 aguacate', '20g nueces', 'Lechuga'],
        preparacion: 'Mezcla todos los ingredientes y aliña con aceite de oliva y sal.'
      });
    }

    return sugerencias;
  }
}
