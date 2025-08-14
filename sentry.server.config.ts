// This file configures the initialization of Sentry on the server/nodejs side.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  // Note: debug only works with debug bundle, disabled to avoid warnings
  debug: false,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.2.0',
  environment: process.env.NODE_ENV,

  // Server-specific error filtering
  beforeSend(event, hint) {
    // Filtrer erreurs non critiques côté serveur
    if (event.exception) {
      const error = hint.originalException as Error
      
      // Ignorer erreurs Firebase admin temporaires
      if (error?.message?.includes('Firebase Admin') ||
          error?.message?.includes('service account')) {
        return null
      }
      
      // Ignorer timeouts réseau côté serveur
      if (error?.message?.includes('timeout') ||
          error?.message?.includes('ETIMEDOUT')) {
        return null
      }

      // Ignorer erreurs de quota Firestore attendues
      if (error?.message?.includes('quota-exceeded') ||
          error?.message?.includes('rate-limit')) {
        return null
      }
    }
    
    return event
  },

  // Server scope configuration
  initialScope: {
    tags: {
      component: "supernovafit-backend",
      runtime: "nodejs"
    },
  },

  // Spotlight for local development
  spotlight: process.env.NODE_ENV === 'development',
})
