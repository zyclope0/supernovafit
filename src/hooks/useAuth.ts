'use client';

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useFirebaseError } from './useFirebaseError';
import type { User as UserType } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  // loading: état d'auth uniquement (ne bloque plus sur le profil)
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Gestion d'erreurs Firebase centralisée
  const authErrorHandler = useFirebaseError();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // Gérer le cookie d'authentification pour le middleware
      if (user) {
        // Définir un cookie pour indiquer que l'utilisateur est authentifié
        const isProduction = window.location.protocol === 'https:';
        const secureCookie = isProduction ? '; Secure' : '';
        document.cookie = `auth_token=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureCookie}`;

        setProfileLoading(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserType;
            setUserProfile(profileData);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
          setUserProfile(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
        // Supprimer le cookie à la déconnexion
        document.cookie = 'auth_token=; path=/; max-age=0';
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Connexion par lien magique
  const sendMagicLink = async (email: string) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/verify`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Sauvegarder l'email pour la vérification
      window.localStorage.setItem('emailForSignIn', email);
      return { success: true };
    } catch (error: unknown) {
      authErrorHandler.handleError(error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  };

  // Vérifier et compléter la connexion par lien magique
  const verifyMagicLink = async () => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt(
          'Veuillez confirmer votre email pour la connexion',
        );
      }

      if (email) {
        try {
          await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          return { success: true };
        } catch (error: unknown) {
          authErrorHandler.handleError(error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          };
        }
      }
    }
    return { success: false, error: 'Lien invalide' };
  };

  // Connexion classique (pour les tests)
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  };

  // Déconnexion
  const signOutUser = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  };

  return {
    user,
    userProfile,
    loading,
    profileLoading,
    sendMagicLink,
    verifyMagicLink,
    signIn,
    signOut: signOutUser,
  };
}
