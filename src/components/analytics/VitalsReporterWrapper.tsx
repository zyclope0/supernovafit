'use client'

import dynamic from 'next/dynamic'

// Dynamic import pour éviter les erreurs de chunk loading
const VitalsReporter = dynamic(
  () => import('@/components/analytics/VitalsReporter'),
  { 
    ssr: false,
    loading: () => null
  }
)

export default function VitalsReporterWrapper() {
  return <VitalsReporter />
}
