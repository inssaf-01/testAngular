import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {

  return () => {

    const router = inject(Router);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    if (!allowedRoles.includes(user.role_name)) {
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  };
};