import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
import { Appwrite } from './core/services/appwrite';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, IonicModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private platform = inject(Platform);
  private router = inject(Router);
  private appwrite = inject(Appwrite);

  public appPages = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home' },
    { title: 'Profile', url: '/profile', icon: 'person' },
    { title: 'Settings', url: '/settings', icon: 'settings' },
  ];

  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

  constructor() {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Platform is ready, you can do any platform specific work here
    });
  }

  async logout() {
    await this.appwrite.deleteSession();
  }
}
