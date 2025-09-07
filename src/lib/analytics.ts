import { getAnalytics, logEvent, Analytics } from 'firebase/analytics'
import app from './firebase'
import * as Sentry from '@sentry/nextjs'

// Analytics instance (côté client uniquement)
let analytics: Analytics | null = null

if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app)
  } catch (error) {
    // Capture error silently in Sentry
    Sentry.captureException(error)
  }
}

// Helper pour track events avec fallback Sentry
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  try {
    if (analytics) {
      logEvent(analytics, eventName, parameters)
    }
    
    // Track aussi dans Sentry pour debugging
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: `Event: ${eventName}`,
      data: parameters,
      level: 'info'
    })
  } catch (error) {
    // Capture error silently in Sentry
    Sentry.captureException(error)
  }
}

