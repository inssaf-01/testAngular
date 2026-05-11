import { Routes } from '@angular/router';
import { ListUserComponent } from './users/list/list';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },

  { path: 'users', component: ListUserComponent },
];