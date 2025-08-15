'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/vitals'

export default function VitalsReporter() {
  useEffect(() => {
    console.log('[VitalsReporter] Component mounted, initializing Web Vitals...')
    // Initialiser Web Vitals monitoring
    reportWebVitals()
  }, [])
  
  return null // Composant invisible
}
