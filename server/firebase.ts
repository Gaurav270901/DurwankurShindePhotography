import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

export function initializeFirebase() {
  if (getApps().length === 0) {
    // In production, you would use a service account key
    // For development, we'll use the Firestore emulator or default credentials
    try {
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'photography-portfolio-dev',
      });
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw new Error('Firebase initialization failed');
    }
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  return db;
}

export function getDb(): Firestore {
  if (!db) {
    return initializeFirebase();
  }
  return db;
}