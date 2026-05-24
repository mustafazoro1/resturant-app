/**
 * Firebase configuration – RFC Admin Dashboard
 *
 * This file initializes the Firebase app and exports a Firestore `db` instance.
 * Reads credentials from Vite environment variables (VITE_FIREBASE_*).
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck  ← suppressed until `firebase` package is installed

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Log environment variables for debugging (only in development)
if (import.meta.env.DEV) {
  console.log("Firebase Config (DEV):", firebaseConfig);
}

// Top-level exported bindings
let firebaseApp: any = null;
let db: any = null;

try {
  // Create or reuse the Firebase app instance
  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  // Initialize Firestore
  db = getFirestore(firebaseApp);

  // Initialize Analytics if supported (async check)
  isSupported()
    .then((supported) => {
      if (supported) {
        try {
          getAnalytics(firebaseApp);
        } catch (err) {
          console.warn("Failed to initialize Firebase Analytics:", err);
        }
      }
    })
    .catch((err) => {
      if (import.meta.env.DEV) console.warn("isSupported() failed:", err);
    });
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

export { firebaseApp, db };
export default firebaseApp;
