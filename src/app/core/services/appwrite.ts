import { inject, Injectable, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import {
  Account,
  Client,
  Databases,
  type AuthenticationFactor,
} from 'appwrite';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Appwrite {
  private client: Client | null = null;
  public account: Account | null = null;
  public databases: Databases | null = null;

  private router = inject(Router);

  // Environment variables from Angular environment files
  private readonly endpoint = environment.appwrite.endpoint;
  private readonly projectId = environment.appwrite.projectId;
  public readonly databaseId = environment.appwrite.databaseId;
  public readonly usersCollection = environment.appwrite.usersCollection;
  public readonly sessionsCollection = environment.appwrite.sessionsCollection;
  public readonly mfaCollection = environment.appwrite.mfaCollection;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (!this.endpoint || !this.projectId) {
      console.error(
        'Missing required Appwrite configuration. Please check your environment variables.'
      );
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
          databaseId: this.databaseId,
        });
      }
    } catch (error) {
      console.error('Failed to initialize Appwrite:', error);
    }
  }

  // Account methods
  async getCurrentUser() {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    return await this.account.get();
  }

  // Authentication methods
  async createMagicURLSession(userId: string, email: string, url: string) {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    // Using createSession with email for magic URL flow
    return this.account.createMagicURLToken(userId, email, url);
  }

  async updateMagicURLSession(userId: string, secret: string) {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    // Using updateSession to verify the magic URL
    return this.account.updateMagicURLSession(userId, secret);
  }

  async deleteSession(sessionId: string = 'current') {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    return this.account.deleteSession(sessionId);
  }

  async createMFAChallenge(factorType: AuthenticationFactor) {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    return this.account.createMfaChallenge(factorType);
  }

  async updateMFAChallenge(challengeId: string, otp: string) {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    try {
      // Use verifyMfaChallenge instead of updateMfaChallenge
      return this.account.updateMfaChallenge(challengeId, otp);
    } catch (error) {
      throw error;
    }
  }
}
