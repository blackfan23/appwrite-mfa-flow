import { Injectable, isDevMode } from '@angular/core';
import { Client, Account, Databases } from 'appwrite';

@Injectable({
  providedIn: 'root'
})
export class Appwrite {
  private client: Client | null = null;
  public account: Account | null = null;
  public databases: Databases | null = null;

  // Environment variables (will be replaced by Vite during build)
  private readonly endpoint = import.meta.env['VITE_APPWRITE_ENDPOINT'] || '';
  private readonly projectId = import.meta.env['VITE_APPWRITE_PROJECT_ID'] || '';
  public readonly databaseId = import.meta.env['VITE_APPWRITE_DATABASE_ID'] || '';
  public readonly usersCollection = import.meta.env['VITE_APPWRITE_USERS_COLLECTION'] || 'users';
  public readonly sessionsCollection = import.meta.env['VITE_APPWRITE_SESSIONS_COLLECTION'] || 'sessions';
  public readonly mfaCollection = import.meta.env['VITE_APPWRITE_MFA_COLLECTION'] || 'mfa_verifications';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (!this.endpoint || !this.projectId) {
      console.error('Missing required Appwrite configuration. Please check your environment variables.');
      return;
    }

    try {
      const client = new Client()
        .setEndpoint(this.endpoint)
        .setProject(this.projectId);

      this.client = client;
      this.account = new Account(client);
      this.databases = new Databases(client);

      if (isDevMode()) {
        console.log('Appwrite initialized with config:', {
          endpoint: this.endpoint,
          projectId: this.projectId,
          databaseId: this.databaseId
        });
      }
    } catch (error) {
      console.error('Failed to initialize Appwrite:', error);
    }
  }

  // Account methods
  async getCurrentUser() {
    if (!this.account) {
      console.error('Appwrite account service is not initialized');
      return null;
    }

    try {
      return await this.account.get();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Authentication methods
  async createMagicURLSession(userId: string, email: string, url: string) {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    // Using createSession with email for magic URL flow
    return this.account.createSession(email, 'magic-link');
  }

  async updateMagicURLSession(userId: string, secret: string) {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    // Using updateSession to verify the magic URL
    return this.account.updateSession(userId);
  }

  async deleteSession(sessionId: string) {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    return this.account.deleteSession(sessionId);
  }
}
