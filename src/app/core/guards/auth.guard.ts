import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppwriteException } from 'appwrite';
import { Appwrite } from '../services/appwrite';

export const AuthGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const appwrite = inject(Appwrite);

  try {
    const user = await appwrite.getCurrentUser();
    if (user) {
      return true;
    }
  } catch (error) {
    console.error('AUTH GUARD ERROR');
    if (error instanceof AppwriteException) {
      console.error(error.type);
      if (error.type === 'user_more_factors_required') {
        await router.navigate(['/mfa-verification']);
        return false;
      }
    } else {
      console.error(error);
    }
    return false;
  }

  router.navigate(['/login']);
  return false;
};
