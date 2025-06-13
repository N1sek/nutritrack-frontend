import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {authGuard} from './core/auth/auth.guard';
import {LoginComponent} from './pages/auth/login/login.component';
import {RegisterComponent} from './pages/auth/register/register.component';
import {NutritionDiaryComponent} from './pages/dashboard/nutrition-diary/nutrition-diary.component';
import {RecipesComponent} from './pages/dashboard/recipes/recipes.component';
import {ReportsComponent} from './pages/dashboard/reports/reports.component';
import { UserComponent} from './pages/dashboard/user/user.component';
import {UsersComponent} from './pages/admin/users/users.component';
import {adminGuard} from './core/auth/admin.guard';
import {AdminFoodsComponent} from './pages/admin/admin-foods/admin-foods.component';
import {FoodsComponent} from './pages/dashboard/foods/foods.component';
import {AdminRecipesComponent} from './pages/admin/admin-recipes/admin-recipes.component';
import {TermsAndConditionsComponent} from './pages/terms-and-conditions/terms-and-conditions.component';
import {PrivacyPolicyComponent} from './pages/privacy-policy/privacy-policy.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'nutrition-diary', component: NutritionDiaryComponent, canActivate: [authGuard] },
  { path: 'recipes', component: RecipesComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'foods', component: FoodsComponent, canActivate: [authGuard] },
  { path: 'user', component: UserComponent, canActivate: [authGuard] },

  { path: 'admin/users', component: UsersComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/foods', component: AdminFoodsComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/recipes', component: AdminRecipesComponent, canActivate: [authGuard, adminGuard] },

  { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: '**', redirectTo: '' }
];
