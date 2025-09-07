'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
  className?: string
  actions?: ReactNode
  icon?: React.ElementType
}

/**
 * Composant PageHeader standardisé
 * 
 * Features:
 * - Titre et sous-titre
 * - Actions (boutons, menus)
 * - Icône optionnelle
 * - Layout responsive
 * - Styles cohérents
 */
export function PageHeader({
  title,
  subtitle,
  children,
  className,
  actions,
  icon: Icon
}: PageHeaderProps) {
  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center sm:justify-between',
      'gap-4 mb-6',
      className
    )}>
      {/* Titre et sous-titre */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-neon-purple" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className={cn(
              'text-2xl font-bold text-white',
              'truncate'
            )}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-white/70 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2">
            {actions}
          </div>
        </div>
      )}
    </div>
  )
}
