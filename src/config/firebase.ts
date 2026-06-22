import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * Firebase Admin SDK — initialised once.
 *
 * We use `applicationDefault()` when a GOOGLE_APPLICATION_CREDENTIALS env var
 * points to a service-account JSON. Otherwise we fall back to project-ID-only
 * initialisation (works on Cloud Run / GCE / local emulators).
 */
let firebaseApp: App;

try {
  if (getApps().length === 0) {
    firebaseApp = initializeApp({
      projectId: env.FIREBASE_PROJECT_ID || undefined,
    });
  } else {
    firebaseApp = getApps()[0];
  }
  logger.info('Firebase Admin SDK initialised');
} catch (error) {
  logger.error({ err: error }, 'Failed to initialise Firebase Admin SDK');
  throw error;
}

export const firebaseAuth: Auth = getAuth(firebaseApp);
export default firebaseApp;
