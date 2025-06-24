import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AppwriteException } from 'appwrite';
import { Appwrite } from '../../../../core/services/appwrite';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  templateUrl: './callback.html',
  styleUrls: ['./callback.scss'],
})
export class Callback implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appwrite = inject(Appwrite);

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
      await this.appwrite.updateMagicURLSession(userId, secret);
    } catch (error) {
      if (error instanceof AppwriteException) {
        console.error('Authentication error:', error);
        this.error =
          error.message || 'Failed to authenticate. Please try again.';
      }
    } finally {
      this.isLoading = false;
      await this.router.navigate(['/dashboard']);
    }
  }
}
