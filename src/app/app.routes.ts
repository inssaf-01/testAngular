import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { ListUserComponent } from './users/list/list';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [

  // 🔴 AUTH
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // 🟢 PROTECTED AREA
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'users', component: ListUserComponent }
    ]
  }

];