'use client';

import { useEffect } from 'react';

export default function VitalsReporter() {
  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') return;

    // Dynamic import pour éviter les erreurs de chunk loading
    const initVitals = async () => {
      try {
        const { reportWebVitals } = await import('@/lib/vitals');
        reportWebVitals();
      } catch (error) {
        // Silently ignore errors in production
        console.warn('Web Vitals initialization failed:', error);
      }
    };

    initVitals();
  }, []);

  return null; // Composant invisible
}
