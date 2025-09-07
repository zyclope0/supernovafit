'use client'

import { useMemo } from 'react'
import { Breadcrumbs } from './Breadcrumbs'
import { HomeIcon, UserIcon, ChartBarIcon, CalendarIcon, ScaleIcon, BookOpenIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: React.ElementType
  current?: boolean
}

interface AthleteBreadcrumbsProps {
  athleteId: string
  athleteName?: string
  currentPage?: 'overview' | 'diete' | 'entrainements' | 'mesures' | 'journal' | 'plan-diete'
  className?: string
}

/**
 * Composant Breadcrumbs spécialisé pour les pages d'athlètes
 * 
 * Features:
 * - Navigation contextuelle coach → athlète → sous-page
 * - Nom d'athlète dynamique
 * - Icônes appropriées
 * - Support des sous-pages
 */
export function AthleteBreadcrumbs({ 
  athleteId, 
  athleteName, 
  currentPage = 'overview',
  className 
}: AthleteBreadcrumbsProps) {
  
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [
      {
        label: 'Accueil',
        href: '/',
        icon: HomeIcon
      },
      {
        label: 'Coach Dashboard',
        href: '/coach',
        icon: HomeIcon
      },
      {
        label: athleteName || `Athlète ${athleteId.slice(0, 8)}...`,
        href: `/coach/athlete/${athleteId}`,
        icon: UserIcon,
        current: currentPage === 'overview'
      }
    ]

    // Ajouter la sous-page si nécessaire
    if (currentPage !== 'overview') {
      const subPageConfig: Record<string, { label: string; icon?: React.ElementType }> = {
        'diete': { label: 'Diète', icon: ChartBarIcon },
        'entrainements': { label: 'Entraînements', icon: CalendarIcon },
        'mesures': { label: 'Mesures', icon: ScaleIcon },
        'journal': { label: 'Journal', icon: BookOpenIcon },
        'plan-diete': { label: 'Plan Diète', icon: ClipboardDocumentListIcon }
      }

      const config = subPageConfig[currentPage]
      if (config) {
        // Marquer l'athlète comme non-current
        items[items.length - 1].current = false
        
        // Ajouter la sous-page
        items.push({
          label: config.label,
          href: `/coach/athlete/${athleteId}/${currentPage}`,
          icon: config.icon,
          current: true
        })
      }
    }

    return items
  }, [athleteId, athleteName, currentPage])

  return <Breadcrumbs items={breadcrumbItems} className={className} showHome={false} />
}
