import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Appwrite } from './appwrite';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private router = inject(Router);
  private appwrite = inject(Appwrite);
  private authState = new BehaviorSubject<boolean>(false);

  constructor() {
    this.checkAuthState();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.authState.asObservable();
  }

  async getCurrentUser() {
    return this.appwrite.getCurrentUser();
  }

  private checkAuthState(): void {
    this.appwrite.getCurrentUser()
      .then(user => {
        this.authState.next(!!user);
      })
      .catch(() => this.authState.next(false));
  }

  loginWithMagicLink(email: string): Observable<boolean> {
    const successUrl = `${window.location.origin}/auth/callback`;
    
    return from(this.appwrite.createMagicURLSession('unique()', email, successUrl)).pipe(
      tap(() => {
        // Show success message to user
      }),
      map(() => true),
      catchError(error => {
        console.error('Login error:', error);
        return of(false);
      })
    );
  }

  async handleMagicUrlCallback(userId: string, secret: string): Promise<boolean> {
    if (!userId || !secret) {
      this.router.navigate(['/login'], { queryParams: { error: 'invalid-params' } });
      return false;
    }

    try {
      await this.appwrite.updateMagicURLSession(userId, secret);
      this.authState.next(true);
      this.router.navigate(['/dashboard']);
      return true;
    } catch (error) {
      console.error('Error handling magic URL callback:', error);
      this.router.navigate(['/login'], { queryParams: { error: 'invalid-link' } });
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.appwrite.deleteSession('current');
      this.authState.next(false);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
