// This file configures the initialization of Sentry on the browser/client side.
// The config you add here will be used whenever users load a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.2.0',
  environment: process.env.NODE_ENV,

  // Replays for error reproduction
  replaysOnErrorSampleRate: 1.0,
  // This sets the sample rate to be 10%. You may want this to be 100% while in development and sample at a lower rate in production.
  replaysSessionSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Error filtering (same as SentryProvider but as fallback)
  beforeSend(event, hint) {
    // Filtrer erreurs non critiques
    if (event.exception) {
      const error = hint.originalException as Error
      
      // Ignorer erreurs chunk loading (fréquentes mais non critiques)
      if (error?.name === 'ChunkLoadError') {
        return null
      }
      
      // Ignorer erreurs network temporaires
      if (error?.message?.includes('Network Error') || 
          error?.message?.includes('fetch')) {
        return null
      }
      
      // Ignorer erreurs Firebase quota (attendues)
      if (error?.message?.includes('quota-exceeded') ||
          error?.message?.includes('permission-denied')) {
        return null
      }

      // Ignorer erreurs d'extension navigateur
      if (error?.message?.includes('Non-Error promise rejection') ||
          error?.message?.includes('chrome-extension://')) {
        return null
      }
    }
    
    return event
  },

  // Initial scope configuration
  initialScope: {
    tags: {
      component: "supernovafit-frontend",
      module: "fitness-app"
    },
  },

  // Intégrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text and input content by default
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
