import {Component, OnInit, inject, ViewChild} from '@angular/core';
import { CommonModule }                from '@angular/common';
import { FormsModule }                 from '@angular/forms';
import { UserService, UserProfile }    from '../../../core/user/user.service';
import {FoodService} from '../../../core/food.service';
import {RecipeService} from '../../../core/recipe.service';
import {RecipeDetailModalComponent} from '../../../shared/components/recipe-detail-modal/recipe-detail-modal.component';
import {RouterLink} from '@angular/router';

interface Allergen { id: number; name: string; icon: string; }

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RecipeDetailModalComponent,
    RouterLink,
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  private userService = inject(UserService);
  private foodService = inject(FoodService);
  private recipeService = inject(RecipeService);

  @ViewChild('recipeDetailModal', { static: true })
  private recipeDetailModal!: RecipeDetailModalComponent;

  user: UserProfile & { allergens: Record<string, boolean> } | null = null;
  error: string | null     = null;
  success: string | null   = null;

  activeTab: 'info' | 'recipes' | 'foods' = 'info';

  showChangePwd = false;
  oldPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  myRecipes: any[] = [];
  myFoods:    any[] = [];

  allergens: Allergen[] = [
    { id: 1, name: 'Gluten',      icon: '🌾' },
    { id: 2, name: 'Lácteos',     icon: '🥛' },
    { id: 3, name: 'Frutos Secos',icon: '🥜' },
    { id: 4, name: 'Huevo',       icon: '🥚' },
    { id: 5, name: 'Pescado',     icon: '🐟' },
    { id: 6, name: 'Mariscos',    icon: '🦐' },
    { id: 7, name: 'Soja',        icon: '🌱' },
    { id: 8, name: 'Sésamo',      icon: '🌰' },
    { id: 9, name: 'Mostaza',     icon: '🌿' },
    { id: 10, name: 'Apio',       icon: '🥬' },
    { id: 11, name: 'Sulfitos',   icon: '🍷' },
    { id: 12, name: 'Cacahuetes', icon: '🥜' }
  ];

  ngOnInit() {
    this.loadProfile();
  }

  selectTab(tab: 'info'|'recipes'|'foods') {
    this.activeTab = tab;
    if (tab === 'recipes') this.loadMyRecipes();
    if (tab === 'foods')   this.loadMyFoods();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: data => {
        const map: Record<string, boolean> = {};
        this.allergens.forEach(a => map[a.name] = data.allergenIds.includes(a.id));
        this.user = { ...data, allergens: map } as any;
      },
      error: () => {
        this.error = 'No se pudo cargar el perfil.';
        setTimeout(() => this.error = null, 4000);
      }
    });
  }

  saveProfile() {
    if (!this.user) return;
    const ids = this.allergens
      .filter(a => (this.user as any).allergens[a.name])
      .map(a => a.id);
    const payload = {
      nickname: this.user.nickname,
      height: this.user.height,
      weight: this.user.weight,
      goal: this.user.goal,
      activityLevel: this.user.activityLevel,
      birthDate: this.user.birthDate,
      allergenIds: ids
    };
    this.userService.updateProfile(payload).subscribe({
      next: () => {
        this.success = 'Perfil actualizado correctamente.';
        setTimeout(() => this.success = null, 4000);
      },
      error: () => {
        this.error = 'Error al actualizar el perfil.';
        setTimeout(() => this.error = null, 4000);
      }
    });
  }

  uploadImage(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files?.length || !this.user) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.user!.avatarUrl = reader.result as string;
    reader.readAsDataURL(file);

    const form = new FormData();
    form.append('file', file);
    this.userService.uploadAvatar(form).subscribe({
      next: () => {
        this.success = 'Avatar actualizado correctamente.';
        this.loadProfile();
        this.userService.loadInitialProfile(); // Para actualizar tambn la imagen en navbar
        setTimeout(() => this.success = null, 4000);
      },
      error: () => {
        this.error = 'Error al subir el avatar.';
        setTimeout(() => this.error = null, 4000);
      }
    });
  }

  toggleChangePwd() {
    this.showChangePwd = !this.showChangePwd;
  }

  savePassword() {
    if (this.newPassword !== this.confirmNewPassword) {
      this.error = 'Las contraseñas no coinciden.';
      setTimeout(() => this.error = null, 4000);
      return;
    }
    console.log('Aquí invocarías al servicio para cambiar la password');
    this.success = 'Contraseña actualizada.';
    setTimeout(() => this.success = null, 4000);
    this.showChangePwd = false;
    this.oldPassword = this.newPassword = this.confirmNewPassword = '';
  }

  private loadMyFoods() {
    this.myFoods = [];
    this.foodService.getMyFoods().subscribe({
      next: list => this.myFoods = list,
      error: () => this.showError('No se pudieron cargar tus alimentos.')
    });
  }

  private loadMyRecipes() {
    this.myRecipes = [];
    this.recipeService.getMyRecipes().subscribe({
      next: list => this.myRecipes = list,
      error: () => this.showError('No se pudieron cargar tus recetas.')
    });
  }

  private showError(msg: string) {
    this.error = msg;
    setTimeout(() => this.error = null, 4000);
  }

  private showSuccess(msg: string) {
    this.success = msg;
    setTimeout(() => this.success = null, 4000);
  }

  deleteRecipe(id: number) {
    this.recipeService.deleteMyRecipe(id).subscribe({
      next: () => {
        this.myRecipes = this.myRecipes.filter(r => r.id !== id);
        this.showSuccess('Receta eliminada.');
      },
      error: () => this.showError('No se pudo eliminar la receta.')
    });
  }

  deleteFood(id: number) {
    this.foodService.deleteMyFood(id).subscribe({
      next: () => {
        this.myFoods = this.myFoods.filter(f => f.id !== id);
        this.showSuccess('Alimento eliminado.');
      },
      error: () => this.showError('No se pudo eliminar el alimento.')
    });
  }

  viewRecipe(id: number) {
    this.recipeDetailModal.openModal(id);
  }

  deleteAccount() {
    console.log('Eliminar cuenta (pendiente)');
  }
}
