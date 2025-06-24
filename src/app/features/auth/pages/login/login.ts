import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ID } from 'appwrite';
import { environment } from '../../../../../environments/environment';
import { Appwrite } from '../../../../core/services/appwrite';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  private fb = inject(FormBuilder);
  private appwrite = inject(Appwrite);

  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  emailSent = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: [
        environment.appwrite.email,
        [Validators.required, Validators.email],
      ],
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const email = this.loginForm.get('email')?.value;
      const success = await this.appwrite.createMagicURLSession(
        ID.unique(),
        email,
        'http://localhost:4200/auth/callback'
      );

      if (success) {
        this.emailSent = true;
      } else {
        this.error = 'Failed to send magic link. Please try again.';
      }
    } catch (error) {
      console.error('Login error:', error);
      this.error = 'An error occurred. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  get email() {
    return this.loginForm.get('email');
  }
}
