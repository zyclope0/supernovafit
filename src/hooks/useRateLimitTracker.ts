/**
 * Hook pour tracker le rate limiting côté client
 * Met à jour automatiquement le document rate_limits dans Firestore
 * Audit 30.09.2025 - Protection DDoS
 */

import { useEffect, useRef } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export function useRateLimitTracker() {
  const { user } = useAuth();
  const requestCountRef = useRef(0);
  const createCountRef = useRef(0);
  const lastResetRef = useRef(Date.now());

  useEffect(() => {
    if (!user) return;

    // Fonction pour mettre à jour le rate limit dans Firestore
    const updateRateLimit = async () => {
      try {
        const rateLimitRef = doc(db, 'rate_limits', user.uid);
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;

        // Si plus d'une heure s'est écoulée, réinitialiser les compteurs
        if (lastResetRef.current < oneHourAgo) {
          requestCountRef.current = 0;
          createCountRef.current = 0;
          lastResetRef.current = now;
        }

        // Mettre à jour le document
        await setDoc(
          rateLimitRef,
          {
            requestCount: requestCountRef.current,
            createCount: createCountRef.current,
            lastReset: serverTimestamp(),
            userId: user.uid,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (error) {
        console.error('[RateLimit] Error updating rate limit:', error);
      }
    };

    // Mettre à jour toutes les 5 minutes
    const interval = setInterval(updateRateLimit, 5 * 60 * 1000);

    // Mettre à jour immédiatement au mount
    updateRateLimit();

    return () => clearInterval(interval);
  }, [user]);

  // Fonction pour incrémenter le compteur de requêtes
  const trackRequest = () => {
    requestCountRef.current += 1;
  };

  // Fonction pour incrémenter le compteur de créations
  const trackCreate = () => {
    createCountRef.current += 1;
    requestCountRef.current += 1;
  };

  return {
    trackRequest,
    trackCreate,
  };
}
