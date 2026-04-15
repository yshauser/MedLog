// src/firebase.js
import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

// Initialize Firebase services
const app = initializeApp(firebaseConfig);

// Enable Firestore offline persistence with IndexedDB cache.
// Writes are queued locally when offline and auto-synced when back online.
let db;
let isUsingPersistentCache = false;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
  isUsingPersistentCache = true;
} catch (e) {
  // Fallback to memory cache (e.g. private browsing mode)
  console.warn('Persistent cache unavailable, falling back to memory cache:', e);
  db = initializeFirestore(app, {
    localCache: memoryLocalCache()
  });
}

const auth = getAuth(app);
const messaging = getMessaging(app);

export { app, db, auth, messaging, isUsingPersistentCache };