import { getAnalytics, logEvent, Analytics } from 'firebase/analytics'
import app from './firebase'
import * as Sentry from '@sentry/nextjs'

// Analytics instance (côté client uniquement)
let analytics: Analytics | null = null

if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app)
  } catch (error) {
    console.error('Erreur initialisation Analytics:', error)
    Sentry.captureException(error)
  }
}

// Helper pour track events avec fallback Sentry
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
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
    console.error('Erreur tracking event:', error)
    Sentry.captureException(error)
  }
}

// Events SuperNovaFit spécifiques
export const trackMealAdded = (mealType: string, foodCount: number, calories?: number) => {
  trackEvent('meal_added', {
    meal_type: mealType,
    food_count: foodCount,
    calories: calories || 0,
    timestamp: Date.now()
  })
}

export const trackTrainingAdded = (trainingType: string, duration: number, source: 'manual' | 'garmin' = 'manual') => {
  trackEvent('training_added', {
    training_type: trainingType,
    duration_minutes: duration,
    source,
    timestamp: Date.now()
  })
}

export const trackMeasureAdded = (measureType: 'weight' | 'body_fat' | 'measurements') => {
  trackEvent('measure_added', {
    measure_type: measureType,
    timestamp: Date.now()
  })
}

export const trackJournalEntry = (mood: number, energy: number) => {
  trackEvent('journal_entry', {
    mood_score: mood,
    energy_score: energy,
    timestamp: Date.now()
  })
}

export const trackCoachInteraction = (action: 'comment_added' | 'comment_read' | 'plan_updated') => {
  trackEvent('coach_interaction', {
    action,
    timestamp: Date.now()
  })
}

export const trackPageView = (pageName: string, userRole: 'coach' | 'sportif' = 'sportif') => {
  trackEvent('page_view', {
    page_name: pageName,
    user_role: userRole,
    timestamp: Date.now()
  })
}

export const trackSearchFood = (query: string, resultsCount: number) => {
  trackEvent('food_search', {
    query_length: query.length,
    results_count: resultsCount,
    timestamp: Date.now()
  })
}

export const trackError = (errorType: string, errorMessage: string, context?: string) => {
  trackEvent('app_error', {
    error_type: errorType,
    error_message: errorMessage.substring(0, 100), // Limiter taille
    context: context || 'unknown',
    timestamp: Date.now()
  })
  
  // Envoyer aussi à Sentry
  Sentry.captureMessage(`Analytics Error: ${errorType} - ${errorMessage}`, 'error')
}
