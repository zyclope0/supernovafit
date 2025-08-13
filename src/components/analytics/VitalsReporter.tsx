'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/vitals'

export default function VitalsReporter() {
  useEffect(() => {
    // Initialiser Web Vitals monitoring
    reportWebVitals()
  }, [])
  
  return null // Composant invisible
}
