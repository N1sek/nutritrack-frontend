import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../../core/user/user.service';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  imports: [
    FormsModule
  ]
})
export class UserComponent implements OnInit {
  private userService = inject(UserService);

  user: any = null;
  error: string | null = null;
  success: string | null = null;

  allergens = [
    { id: 1, name: 'Gluten', icon: '🌾' },
    { id: 2, name: 'Lácteos', icon: '🥛' },
    { id: 3, name: 'Frutos Secos', icon: '🥜' },
    { id: 4, name: 'Huevo', icon: '🥚' },
    { id: 5, name: 'Pescado', icon: '🐟' },
    { id: 6, name: 'Mariscos', icon: '🦐' },
    { id: 7, name: 'Soja', icon: '🌱' },
    { id: 8, name: 'Sésamo', icon: '🌰' },
    { id: 9, name: 'Mostaza', icon: '🌿' },
    { id: 10, name: 'Apio', icon: '🥬' },
    { id: 11, name: 'Sulfitos', icon: '🍷' },
    { id: 12, name: 'Cacahuetes', icon: '🥜' }
  ];

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (data) => {
        const age = this.calculateAge(data.birthDate);

        const allergenMap: { [key: string]: boolean } = {};
        this.allergens.forEach(a => {
          allergenMap[a.name] = data.allergenIds.includes(a.id);
        });

        this.user = {
          ...data,
          age,
          allergens: allergenMap
        };
      },
      error: () => {
        this.error = 'No se pudo cargar el perfil.';
        setTimeout(() => (this.error = null), 4000);
      }
    });
  }

  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  saveProfile() {
    const allergenIds = this.allergens
      .filter(a => this.user.allergens[a.name])
      .map(a => a.id);

    const updatePayload = {
      nickname: this.user.nickname,
      height: this.user.height,
      weight: this.user.weight,
      goal: this.user.goal,
      activityLevel: this.user.activityLevel,
      birthDate: this.user.birthDate,
      allergenIds
    };

    this.userService.updateProfile(updatePayload).subscribe({
      next: () => {
        this.success = 'Perfil actualizado correctamente.';
        setTimeout(() => (this.success = null), 4000);
      },
      error: () => {
        this.error = 'Error al actualizar el perfil.';
        setTimeout(() => (this.error = null), 4000);
      }
    });
  }

  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.user.avatarUrl = reader.result;
    };
    reader.readAsDataURL(file);

    const form = new FormData();
    form.append('file', file);

    this.userService.uploadAvatar(form).subscribe({
      next: () => {
        this.success = 'Avatar actualizado correctamente.';
        this.error   = null;
        this.loadProfile();
        setTimeout(() => this.success = null, 4000);
      },
      error: () => {
        this.error   = 'Error al subir el avatar.';
        this.success = null;
        setTimeout(() => this.error = null, 4000);
      }
    });
  }

  changePassword() {
    console.log('Cambiar contraseña (pendiente)');
  }

  deleteAccount() {
    console.log('Eliminar cuenta (pendiente)');
  }
}
