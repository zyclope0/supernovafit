'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: React.ElementType
  current?: boolean
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
  showHome?: boolean
  maxItems?: number
}

// Mapping des routes vers des labels lisibles (hors du composant pour éviter les re-renders)
const routeLabels: Record<string, { label: string; icon?: React.ElementType }> = {
  '/': { label: 'Accueil', icon: HomeIcon },
  '/diete': { label: 'Diète' },
  '/entrainements': { label: 'Entraînements' },
  '/mesures': { label: 'Mesures' },
  '/journal': { label: 'Journal' },
  '/export': { label: 'Export' },
  '/profil': { label: 'Profil' },
  '/guide': { label: 'Guide' },
  '/nouveautes': { label: 'Nouveautés' },
  '/coach': { label: 'Coach Dashboard' },
  '/coach/all-athletes': { label: 'Tous les Athlètes' },
  '/coach/mes-athletes': { label: 'Mes Athlètes' },
  '/coach/programmes': { label: 'Programmes' },
  '/coach/rapports': { label: 'Rapports' },
  '/coach/athlete': { label: 'Athlète' },
  '/auth': { label: 'Connexion' },
  '/create-coach': { label: 'Devenir Coach' },
  '/legal/terms': { label: 'Conditions d\'utilisation' },
  '/legal/privacy': { label: 'Confidentialité' },
  '/legal/cookies': { label: 'Cookies' }
}

/**
 * Composant Breadcrumbs intelligent avec génération automatique
 * 
 * Features:
 * - Génération automatique basée sur l'URL
 * - Support des routes dynamiques
 * - Icônes personnalisables
 * - Navigation clavier accessible
 * - Schema.org structured data
 * - Responsive design
 */
export function Breadcrumbs({ 
  items, 
  className,
  showHome = true,
  maxItems = 5
}: BreadcrumbsProps) {
  const pathname = usePathname()

  // Génération automatique des breadcrumbs si non fournis
  const breadcrumbItems = useMemo(() => {
    if (items) return items

    const pathSegments = pathname.split('/').filter(Boolean)
    const generatedItems: BreadcrumbItem[] = []

    // Ajouter l'accueil si demandé et pas déjà sur l'accueil
    if (showHome && pathname !== '/') {
      generatedItems.push({
        label: 'Accueil',
        href: '/',
        icon: HomeIcon
      })
    }

    // Construire les segments
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      // Gérer les routes dynamiques (ex: /coach/athlete/[id])
      let label = routeLabels[currentPath]?.label || segment
      const href = currentPath

      // Cas spéciaux pour les routes dynamiques
      if (currentPath.includes('/coach/athlete/') && !currentPath.endsWith('/athlete')) {
        const athleteId = segment
        label = `Athlète ${athleteId.slice(0, 8)}...` // Truncate ID
      } else if (currentPath.includes('/coach/athlete/') && segment !== 'athlete') {
        // Sous-pages d'athlète (diete, entrainements, etc.)
        const subPageLabels: Record<string, string> = {
          'diete': 'Diète',
          'entrainements': 'Entraînements', 
          'mesures': 'Mesures',
          'journal': 'Journal',
          'plan-diete': 'Plan Diète'
        }
        label = subPageLabels[segment] || segment
      }

      // Capitaliser la première lettre si pas de mapping
      if (!routeLabels[currentPath]) {
        label = label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, ' ')
      }

      generatedItems.push({
        label,
        href,
        icon: routeLabels[currentPath]?.icon,
        current: isLast
      })
    })

    // Limiter le nombre d'items si nécessaire
    if (generatedItems.length > maxItems) {
      const start = generatedItems.slice(0, 1) // Home
      const end = generatedItems.slice(-2) // 2 derniers
      return [
        ...start,
        { label: '...', href: '#', current: false },
        ...end
      ]
    }

    return generatedItems
  }, [items, pathname, showHome, maxItems])

  // Ne pas afficher sur la page d'accueil si pas d'items custom
  if (!items && pathname === '/') {
    return null
  }

  return (
    <nav 
      className={cn(
        'flex items-center space-x-1 text-sm',
        'mb-6 px-1',
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1" itemScope itemType="https://schema.org/BreadcrumbList">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          const Icon = item.icon

          return (
            <li 
              key={item.href}
              className="flex items-center"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index > 0 && (
                <ChevronRightIcon 
                  className="h-4 w-4 text-white/40 mx-2 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              
              {isLast ? (
                <span 
                  className={cn(
                    'flex items-center gap-1.5 font-medium',
                    'text-white',
                    'cursor-default'
                  )}
                  aria-current="page"
                  itemProp="name"
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
                  <span className="truncate max-w-[200px]">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5',
                    'text-white/70 hover:text-white',
                    'transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent',
                    'rounded px-1 py-0.5'
                  )}
                  itemProp="item"
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
                  <span itemProp="name" className="truncate max-w-[150px]">{item.label}</span>
                </Link>
              )}
              
              {/* Schema.org metadata */}
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Hook pour générer des breadcrumbs personnalisés
 */
export function useBreadcrumbs(customItems?: BreadcrumbItem[]) {
  return useMemo(() => {
    if (customItems) return customItems
    
    // Logique de génération basée sur le pathname
    // Peut être étendue selon les besoins
    return []
  }, [customItems])
}