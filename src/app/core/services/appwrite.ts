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
    try {
      // Complete the magic URL session
      const session = await this.account.updateMagicURLSession(userId, secret);
      // Add a small delay to ensure session is properly established
      await new Promise((resolve) => setTimeout(resolve, 100));
      // Verify the session is active before proceeding
      await this.account.get();
      return session;
    } catch (error) {
      console.error('Magic URL session update failed:', error);
      throw error;
    }
  }

  async deleteSession(sessionId: string = 'current') {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    this.account.deleteSession(sessionId);
    this.router.navigate(['/login']);
    location.reload();
    return;
  }

  async createMFAChallenge(factorType: AuthenticationFactor) {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    try {
      // Add a small delay to ensure session is stable
      await new Promise((resolve) => setTimeout(resolve, 200));
      return await this.account.createMfaChallenge(factorType);
    } catch (error) {
      console.error('MFA Challenge creation failed:', error);
      throw error;
    }
  }

  async getMFAFactors() {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    return await this.account.listMfaFactors();
  }
  async updateMFAChallenge(challengeId: string, otp: string) {
    if (!this.account) {
      throw new Error('Appwrite account service is not initialized');
    }
    try {
      // Log current MFA status for debugging
      const factors = await this.getMFAFactors();
      console.log('Current MFA factors:', factors);
      const result = await this.account.updateMfaChallenge(challengeId, otp);
      // Verify session after MFA completion
      const user = await this.account.get();
      console.log('User after MFA:', user);
      return result;
    } catch (error) {
      console.error('MFA Challenge update failed:', error);
      throw error;
    }
  }
}
