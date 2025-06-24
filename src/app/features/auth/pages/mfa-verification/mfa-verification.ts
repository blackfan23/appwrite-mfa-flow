import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AppwriteException, AuthenticationFactor } from 'appwrite';
import { Subscription } from 'rxjs';
import { Appwrite } from '../../../../core/services/appwrite';

@Component({
  selector: 'app-mfa-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  template: `
    <ion-content class="ion-padding">
      <div class="ion-text-center ion-padding">
        <ion-icon
          name="shield-checkmark"
          size="large"
          class="mfa-icon"
        ></ion-icon>
        <h2>Verify Your Identity</h2>
        <p>Enter the verification code from your authenticator app</p>
      </div>

      <form [formGroup]="mfaForm" (ngSubmit)="onSubmit()">
        <ion-item>
          <ion-label position="floating">Verification Code</ion-label>
          <ion-input
            type="text"
            inputmode="numeric"
            formControlName="code"
            autocomplete="one-time-code"
            maxlength="6"
          >
          </ion-input>
        </ion-item>

        <ion-note *ngIf="error" color="danger" class="ion-margin-top">
          {{ error }}
        </ion-note>

        <ion-button
          expand="block"
          type="submit"
          class="ion-margin-top"
          [disabled]="mfaForm.invalid || isLoading"
        >
          <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
          <span *ngIf="!isLoading">Verify</span>
        </ion-button>
      </form>
    </ion-content>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .mfa-icon {
        font-size: 64px;
        color: var(--ion-color-primary);
        margin-bottom: 20px;
      }

      ion-content {
        --background: var(--ion-background-color);
      }

      form {
        max-width: 400px;
        margin: 0 auto;
      }
    `,
  ],
})
export class MfaVerificationComponent implements OnInit, OnDestroy {
  mfaForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  private authSubscription?: Subscription;
  private challengeId: string | null = null;
  private appwrite = inject(Appwrite);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.mfaForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });
  }

  async ngOnInit() {
    const challenge = await this.appwrite.createMFAChallenge(
      AuthenticationFactor.Email // factor
    );
    this.challengeId = challenge.$id;
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }

  async onSubmit() {
    if (this.mfaForm.invalid || !this.challengeId) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const code = this.mfaForm.get('code')?.value;
      console.log('challengeId', this.challengeId);
      console.log('code', code);
      const success = await this.appwrite.updateMFAChallenge(
        this.challengeId,
        code
      );

      console.log('success', success);

      if (!success) {
        this.error = 'Invalid verification code. Please try again.';
        // Clear the form on error
        this.mfaForm.reset();
      }

      await this.router.navigate(['/dashboard']);
      return;
    } catch (error: unknown) {
      console.error('MFA verification error:', error);
      if (error instanceof AppwriteException) {
        this.error =
          error.message || 'Failed to verify code. Please try again.';
        if (
          error.code === 401 ||
          error.message?.includes('challenge') ||
          error.message?.includes('expired')
        ) {
          this.error =
            'Verification code expired. Please try logging in again.';
          // Redirect to login after a short delay
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        }
      }
    } finally {
      this.isLoading = false;
    }
  }
}
