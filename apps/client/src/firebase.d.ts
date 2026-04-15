import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { Messaging } from 'firebase/messaging';

declare const app: FirebaseApp;
declare const db: Firestore;
declare const auth: Auth;
declare const messaging: Messaging;

export { app, db, auth, messaging};

