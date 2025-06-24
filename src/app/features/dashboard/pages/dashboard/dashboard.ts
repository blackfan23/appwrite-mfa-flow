import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Appwrite } from '../../../../core/services/appwrite';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard {
  private appwrite = inject(Appwrite);
  private router = inject(Router);

  user: any = null;
  isLoading = true;

  async ngOnInit() {
    try {
      this.user = await this.appwrite.getCurrentUser();
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async logout() {
    await this.appwrite.deleteSession();
    this.router.navigate(['/login']);
  }
}
