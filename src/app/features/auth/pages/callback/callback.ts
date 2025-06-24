import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule
  ],
  templateUrl: './callback.html',
  styleUrls: ['./callback.scss']
})
export class Callback implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(Auth);
  
  isLoading = true;
  error: string | null = null;

  async ngOnInit() {
    const { userId, secret } = this.route.snapshot.queryParams;
    
    if (!userId || !secret) {
      this.error = 'Invalid authentication link. Please try again.';
      this.isLoading = false;
      return;
    }

    try {
      const success = await this.auth.handleMagicUrlCallback(userId, secret);
      if (!success) {
        this.error = 'Failed to authenticate. Please try again.';
      }
    } catch (error) {
      console.error('Authentication error:', error);
      this.error = 'An error occurred during authentication. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
