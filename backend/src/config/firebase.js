import { initializeApp, getApps, getApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore/lite';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDJslGCCdwm39HUuEha_kwh9_O-9-DptLA",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "alcaldia-leon-app.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "alcaldia-leon-app",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "alcaldia-leon-app.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "297161344020",
  appId: process.env.FIREBASE_APP_ID || "1:297161344020:web:e839f4cadf47c44d899301"
};

// Inicialización limpia con el SDK Lite de Firestore (sin requerir Service Accounts locales)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const isFirebaseConfigured = () => Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

console.log(`🔥 Firebase Firestore conectado exitosamente al proyecto: ${firebaseConfig.projectId}`);
