import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const AuthGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  try {
    const user = await auth.getCurrentUser();
    if (user) {
      return true;
    }
    
    // Redirect to login with the attempted URL
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  } catch (error) {
    console.error('Auth guard error:', error);
    router.navigate(['/login']);
    return false;
  }
};
