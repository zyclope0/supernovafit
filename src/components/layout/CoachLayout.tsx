'use client'

import { ReactNode } from 'react'
import MainLayout from './MainLayout'
import { AthleteBreadcrumbs } from '@/components/ui/AthleteBreadcrumbs'

interface CoachLayoutProps {
  children: ReactNode
  athleteId?: string
  athleteName?: string
  currentPage?: 'overview' | 'diete' | 'entrainements' | 'mesures' | 'journal' | 'plan-diete'
  showBreadcrumbs?: boolean
}

/**
 * Layout spécialisé pour les pages coach avec navigation contextuelle
 * 
 * Features:
 * - Breadcrumbs automatiques pour les pages d'athlètes
 * - Support des sous-pages
 * - Fallback vers MainLayout standard
 */
export function CoachLayout({ 
  children, 
  athleteId, 
  athleteName, 
  currentPage,
  showBreadcrumbs = true 
}: CoachLayoutProps) {
  
  // Si pas d'athleteId, utiliser le layout standard
  if (!athleteId || !showBreadcrumbs) {
    return <MainLayout>{children}</MainLayout>
  }

  return (
    <MainLayout>
      {/* Breadcrumbs spécifiques coach/athlète */}
      <div className="-mt-6 mb-6">
        <AthleteBreadcrumbs
          athleteId={athleteId}
          athleteName={athleteName}
          currentPage={currentPage}
        />
      </div>
      {children}
    </MainLayout>
  )
}
