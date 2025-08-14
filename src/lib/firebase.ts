import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase - SuperNovaFit
// Fallback to project's public web config if env vars are absent (safe for client usage)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyBe176JrNl_R0NmUAFkhCISThnFUUgt8U4',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'supernovafit-a6fe7.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'supernovafit-a6fe7',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'supernovafit-a6fe7.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '261698689691',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:261698689691:web:edc7a7135d94a8250c443e',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-RV0RK8JWN4',
};

// Initialiser Firebase uniquement côté client pour éviter les erreurs SSR/prerender
const isBrowser = typeof window !== 'undefined';
const app = isBrowser ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : (undefined as unknown as ReturnType<typeof initializeApp>);

// Services Firebase
export const auth = isBrowser ? getAuth(app) : (undefined as unknown as ReturnType<typeof getAuth>);
export const db = isBrowser ? getFirestore(app) : (undefined as unknown as ReturnType<typeof getFirestore>);
export const storage = isBrowser ? getStorage(app) : (undefined as unknown as ReturnType<typeof getStorage>);

// Analytics - Chargement dynamique côté client uniquement
export let analytics: unknown = null;

if (isBrowser) {
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) => {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      });
    })
    .catch((error) => {
      console.warn('Analytics non disponible:', error);
    });
}

export default app; 