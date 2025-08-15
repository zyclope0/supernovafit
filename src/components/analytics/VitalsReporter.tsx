'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/vitals'

export default function VitalsReporter() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.log('[VitalsReporter] Component mounted, initializing Web Vitals...')
    }
    // Initialiser Web Vitals monitoring
    reportWebVitals()
  }, [])
  
  return null // Composant invisible
}
