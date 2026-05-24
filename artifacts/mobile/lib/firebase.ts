/**
 * Firebase configuration – RFC Mobile App (Expo)
 *
 * This file initialises the Firebase app and exports a Firestore `db` instance.
 * Reads credentials from EXPO_PUBLIC_ environment variables.
 *
 * ⚠️  Install firebase before using:
 *       pnpm add firebase          (from workspace root)
 *       – or –
 *       cd artifacts/mobile && npm install firebase
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck  ← suppressed until `firebase` package is installed

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** Singleton Firebase app */
export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/** Firestore database — use this for reading/writing RFC data */
export const db = getFirestore(firebaseApp);

export default firebaseApp;
