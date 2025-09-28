// This file configures the initialization of Sentry on the browser/client side.
// The config you add here will be used whenever users load a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// Hook pour instrumenter les transitions de navigation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// DSN Sentry hardcodé pour production (plus fiable que les variables d'environnement)
const SENTRY_DSN =
  'https://6a6884fb3ee7188800e6d7a5a521ac4f@o4509835502813184.ingest.de.sentry.io/4509835686117456';

// Configuration simplifiée pour éviter les erreurs de syntaxe au premier chargement

Sentry.init({
  dsn: SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  // Note: debug only works with debug bundle, disabled to avoid warnings
  debug: false,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.2.0',
  environment: process.env.NODE_ENV,

  // Replays for error reproduction
  replaysOnErrorSampleRate: 1.0,
  // This sets the sample rate to be 10%. You may want this to be 100% while in development and sample at a lower rate in production.
  replaysSessionSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Error filtering avancé pour SuperNovaFit
  beforeSend(event, hint) {
    // Filtrer erreurs non critiques
    if (event.exception) {
      const error = hint.originalException as Error;

      // Ne PAS filtrer ChunkLoadError: on souhaite les voir pour détecter des versions en cache

      // Ignorer erreurs network temporaires
      if (
        error?.message?.includes('Network Error') ||
        error?.message?.includes('fetch') ||
        error?.message?.includes('Failed to fetch')
      ) {
        return null;
      }

      // Ignorer erreurs Firebase quota (attendues)
      if (
        error?.message?.includes('quota-exceeded') ||
        error?.message?.includes('permission-denied') ||
        error?.message?.includes('unavailable')
      ) {
        return null;
      }

      // Ignorer erreurs d'extension navigateur
      if (
        error?.message?.includes('Non-Error promise rejection') ||
        error?.message?.includes('chrome-extension://') ||
        error?.message?.includes('moz-extension://')
      ) {
        return null;
      }

      // Ignorer erreurs de timeout
      if (
        error?.message?.includes('timeout') ||
        error?.message?.includes('aborted')
      ) {
        return null;
      }
    }

    return event;
  },

  // Initial scope configuration
  initialScope: {
    tags: {
      component: 'supernovafit-frontend',
      module: 'fitness-app',
    },
  },

  // Intégrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text and input content by default
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],
  tracesSampler: (samplingContext) => {
    // Échantillonnage plus élevé pour capter les transactions où Web Vitals seront attachés
    const url = samplingContext?.location?.href || '';
    if (url.includes('localhost')) return 1.0;
    return 0.2;
  },
});
