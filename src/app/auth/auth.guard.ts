import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const auth = inject(AuthService);

  // 🚫 SSR SAFE CHECK
  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  const token = auth.getToken();
  const user = auth.getUser();

  // 🔴 NO AUTH DATA
  if (!token || !user) {
    auth.logout();
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // 🔥 TOKEN EXPIRED (frontend check UX only)
  if (auth.isTokenExpired(token)) {
    auth.logout();
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // 🔐 STATUS CHECK (business rule)
  if (user.status !== 2) {

    let message = "Compte inaccessible";

    if (user.status === 1) {
      message = "Compte en attente d'activation";
    }

    if (user.status === 0) {
      message = "Compte archivé";
    }

    console.warn(message);

    auth.logout();
    router.navigate(['/login'], { replaceUrl: true });

    return false;
  }

  return true;
};