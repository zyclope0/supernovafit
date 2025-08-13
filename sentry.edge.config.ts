// This file configures the initialization of Sentry for edge runtime.
// The config you add here will be used whenever the edge runtime handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Edge runtime has lower resource limits, so use lower sample rates
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 0.5 : 0.05,

  // Minimal debugging for edge runtime
  debug: false,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.2.0',
  environment: process.env.NODE_ENV,

  // Edge-specific error filtering (more aggressive)
  beforeSend(event, hint) {
    // Filtrer erreurs edge runtime spécifiques
    if (event.exception) {
      const error = hint.originalException as Error
      
      // Ignorer erreurs timeout edge
      if (error?.message?.includes('timeout') ||
          error?.message?.includes('deadline')) {
        return null
      }
      
      // Ignorer erreurs limite mémoire edge
      if (error?.message?.includes('memory') ||
          error?.message?.includes('limit')) {
        return null
      }
    }
    
    return event
  },

  // Edge scope configuration
  initialScope: {
    tags: {
      component: "supernovafit-edge",
      runtime: "edge"
    },
  },
})
