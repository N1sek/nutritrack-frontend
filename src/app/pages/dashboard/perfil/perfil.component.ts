import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NavbarComponent} from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  imports: [
    FormsModule,
    NavbarComponent
  ],
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent {
  user = {
    name: 'usuario',
    email: 'test@example.com',
    weight: 70,
    height: 175,
    age: 25,
    gender: 'male',
    goal: 'mantener_peso',
    imageUrl: 'https://img.cryptorank.io/coins/arab_cat1706520810607.png',
    allergens: {} as Record<string, boolean>
  };

  allergens = [
    { name: 'Gluten', icon: '🌾' },
    { name: 'Lácteos', icon: '🥛' },
    { name: 'Frutos Secos', icon: '🥜' },
    { name: 'Huevo', icon: '🥚' },
    { name: 'Pescado', icon: '🐟' },
    { name: 'Mariscos', icon: '🦐' },
    { name: 'Soja', icon: '🌱' },
    { name: 'Sésamo', icon: '🌰' },
    { name: 'Mostaza', icon: '🌿' },
    { name: 'Apio', icon: '🥬' },
    { name: 'Sulfitos', icon: '🍷' },
    { name: 'Cacahuetes', icon: '🥜' }
  ];

  saveProfile() {
    console.log('Guardando cambios...', this.user);
    alert('Perfil actualizado correctamente.');
  }

  changePassword() {
    alert('Funcionalidad de cambio de contraseña próximamente.');
  }

  deleteAccount() {
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.');
    if (confirmDelete) {
      console.log('Cuenta eliminada.');
      alert('Cuenta eliminada.');
    }
  }

  uploadImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.user.imageUrl = URL.createObjectURL(file);
    }
  }
}
