import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {authGuard} from './core/auth/auth.guard';
import {LoginComponent} from './pages/auth/login/login.component';
import {RegisterComponent} from './pages/auth/register/register.component';
import {NutritionDiaryComponent} from './pages/dashboard/diario-nutricion/nutrition-diary.component';
import {RecetasComponent} from './pages/dashboard/recetas/recetas.component';
import {InformesComponent} from './pages/dashboard/informes/informes.component';
import {PerfilComponent} from './pages/dashboard/perfil/perfil.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'diario-nutricion', component: NutritionDiaryComponent, canActivate: [authGuard] },
  { path: 'recetas', component: RecetasComponent, canActivate: [authGuard] },
  { path: 'informes', component: InformesComponent, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
