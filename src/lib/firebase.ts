import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase - SuperNovaFit
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Vérifier que toutes les variables d'environnement sont définies
function validateFirebaseConfig() {
  const requiredVars = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
    'measurementId'
  ];
  
  const missingVars = requiredVars.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missingVars.length > 0) {
    console.error('Firebase configuration error: Missing environment variables:', missingVars);
    console.error('Please ensure these environment variables are set in your production environment:');
    missingVars.forEach(varName => {
      console.error(`- NEXT_PUBLIC_FIREBASE_${varName.toUpperCase()}`);
    });
    throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
  }
}

// Valider la configuration seulement côté client et hors des tests
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  validateFirebaseConfig();
}

// Initialiser Firebase uniquement côté client pour éviter les erreurs SSR/prerender
const isBrowser = typeof window !== 'undefined';
const app = isBrowser ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : (undefined as unknown as ReturnType<typeof initializeApp>);

// Services Firebase
export const auth = isBrowser ? getAuth(app) : (undefined as unknown as ReturnType<typeof getAuth>);
export const db = isBrowser ? getFirestore(app) : (undefined as unknown as ReturnType<typeof getFirestore>);
export const storage = isBrowser ? getStorage(app) : (undefined as unknown as ReturnType<typeof getStorage>);


export default app; 