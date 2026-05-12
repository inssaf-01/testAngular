import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { ListUserComponent } from './users/list/list';

export const routes: Routes = [

  // 🔴 LOGIN AREA
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // 🟢 APP AREA (avec sidebar)
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: 'users', component: ListUserComponent }
    ]
  }

];