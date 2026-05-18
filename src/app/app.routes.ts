import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { ListUserComponent } from './users/list/list';
import { authGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard';
import { ProfileComponent } from './profile/profile';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [

  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [

      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: ListUserComponent, canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])] },
      {
        path: 'profile',
        component: ProfileComponent
      }
    ]
  },
];