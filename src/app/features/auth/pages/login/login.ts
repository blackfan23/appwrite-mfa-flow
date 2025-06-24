import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    IonicModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private auth = inject(Auth);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  emailSent = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
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
      const success = await this.auth.loginWithMagicLink(email).toPromise();
      
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
