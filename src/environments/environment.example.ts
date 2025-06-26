// This is an example environment file. Copy this file to environment.ts and environment.prod.ts
// and replace the placeholder values with your actual configuration.

// file is called environment.ts

export const environment = {
  production: false,
  appwrite: {
    // Your Appwrite endpoint (e.g., 'https://cloud.appwrite.io/v1')
    endpoint: 'YOUR_APPWRITE_ENDPOINT',

    // Your Appwrite project ID
    projectId: 'YOUR_APPWRITE_PROJECT_ID',

    // Your Appwrite database ID
    databaseId: 'YOUR_APPWRITE_DATABASE_ID',

    // Collection names (you can keep these defaults or change them to match your setup)
    email: 'YOUR_APPWRITE_EMAIL',
  },
};

// For production, create environment.prod.ts with production: true
// and replace the values with your production configuration.
