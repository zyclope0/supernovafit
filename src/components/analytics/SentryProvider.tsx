'use client'

import { useEffect } from 'react'



export default function SentryProvider() {
  useEffect(() => {
    // Initialiser Sentry côté client
    const initSentry = async () => {
      try {
        
        const Sentry = await import('@sentry/nextjs')
        
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          tracesSampleRate: 0.1,
          release: process.env.NEXT_PUBLIC_APP_VERSION || '1.2.0',
          environment: process.env.NODE_ENV,
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
            }
            
            return event
          },
          initialScope: {
            tags: {
              component: "supernovafit-frontend",
              module: "fitness-app"
            },
          },
        })
        
      } catch (error) {
        console.error('❌ Sentry initialization failed:', error)
      }
    }
    
    initSentry()
  }, [])

  return null
}
