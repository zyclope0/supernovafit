import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals'
import { trackEvent } from './analytics'
import * as Sentry from '@sentry/nextjs'

// Thresholds Web Vitals (valeurs Google) - Mise à jour v4
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, needs_improvement: 0.25 },
  INP: { good: 200, needs_improvement: 500 }, // Remplace FID
  FCP: { good: 1800, needs_improvement: 3000 },
  LCP: { good: 2500, needs_improvement: 4000 },
  TTFB: { good: 800, needs_improvement: 1800 }
}

// Helper pour déterminer le rating
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS]
  if (!thresholds) return 'good'
  
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.needs_improvement) return 'needs-improvement'
  return 'poor'
}

// Function pour track metric
const trackVital = (metric: Metric) => {
  const rating = getRating(metric.name, metric.value)
  
  // Track dans Analytics
  trackEvent('web_vital', {
    name: metric.name,
    value: Math.round(metric.value),
    rating,
    delta: Math.round(metric.delta),
    id: metric.id,
    timestamp: Date.now()
  })
  
  // Envoyer TOUTES les métriques à Sentry (pas seulement les poor)
  Sentry.addBreadcrumb({
    category: 'web-vital',
    message: `${metric.name}: ${Math.round(metric.value)} (${rating})`,
    data: {
      value: metric.value,
      rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: (metric as unknown as { navigationType?: string }).navigationType || 'unknown'
    },
    level: rating === 'poor' ? 'warning' : 'info'
  })
  
  // Mapping attendu par Sentry pour le dashboard Web Vitals (lowercase + unité correcte)
  const nameMap: Record<string, { key: string; unit: 'none' | 'millisecond' }> = {
    CLS: { key: 'cls', unit: 'none' },
    INP: { key: 'inp', unit: 'millisecond' },
    FCP: { key: 'fcp', unit: 'millisecond' },
    LCP: { key: 'lcp', unit: 'millisecond' },
    TTFB: { key: 'ttfb', unit: 'millisecond' },
  }
  const mapped = nameMap[metric.name]
  if (mapped) {
    try {
      // Attacher au transaction active si possible (plus fiable que la portée globale)
      const scope = (Sentry as unknown as { getCurrentScope?: () => unknown }).getCurrentScope?.()
      const tx = (scope as { getTransaction?: () => { setMeasurement?: (k: string, v: number, u: 'none' | 'millisecond') => void } })?.getTransaction?.()
      if (tx && typeof tx.setMeasurement === 'function') {
        tx.setMeasurement(mapped.key, metric.value, mapped.unit)
      } else {
        // Fallback sécurisé
        Sentry.setMeasurement(mapped.key, metric.value, mapped.unit)
      }
    } catch {
      // Ignorer les erreurs de measurement pour éviter le bruit
      // Silently ignore measurement errors in production
    }
  }
  
  // Web Vitals tracked silently
}

// Main function pour initialiser Web Vitals monitoring
export function reportWebVitals() {
  try {
    // Vitals critiques (web-vitals v4)
    onCLS(trackVital)
    onINP(trackVital) // Remplace FID
    onFCP(trackVital)
    onLCP(trackVital)
    onTTFB(trackVital)
    
    // Web Vitals monitoring initialized
  } catch (error) {
    // Capture error silently in Sentry
    Sentry.captureException(error)
  }
}


