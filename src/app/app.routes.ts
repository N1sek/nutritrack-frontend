import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {authGuard} from './core/auth.guard';
import {LoginComponent} from './pages/auth/login/login.component';
import {RegisterComponent} from './pages/auth/register/register.component';
import {DiarioNutricionComponent} from './pages/dashboard/diario-nutricion/diario-nutricion.component';
import {RecetasComponent} from './pages/dashboard/recetas/recetas.component';
import {InformesComponent} from './pages/dashboard/informes/informes.component';
import {PerfilComponent} from './pages/dashboard/perfil/perfil.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }, //, canActivate: [authGuard]
  { path: 'diario-nutricion', component: DiarioNutricionComponent },
  { path: 'recetas', component: RecetasComponent },
  { path: 'informes', component: InformesComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: '**', redirectTo: '' }
];
