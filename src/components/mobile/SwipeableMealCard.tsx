'use client'

import { Edit, Trash2, Copy, Star } from 'lucide-react'
import SwipeableCard from './SwipeableCard'
import { MealType, Aliment, Macros } from '@/types'
// import { cn } from '@/lib/utils' // TODO: À utiliser si nécessaire

interface SwipeableMealCardProps {
  mealName: string
  mealIcon: string
  time: string
  mealType: MealType
  aliments?: Aliment[]
  macros?: Macros
  mealId?: string
  onEdit?: (mealId: string) => void
  onDelete?: (mealId: string) => void
  onDuplicate?: (mealId: string) => void
  onFavorite?: (mealId: string) => void
  isFavorite?: boolean
  className?: string
}

export default function SwipeableMealCard({
  mealName,
  mealIcon,
  time,
  // mealType, // TODO: À utiliser si nécessaire
  aliments = [],
  macros,
  mealId,
  onEdit,
  onDelete,
  onDuplicate,
  onFavorite,
  isFavorite = false,
  className
}: SwipeableMealCardProps) {
  
  const leftActions = [
    {
      id: 'favorite',
      label: isFavorite ? 'Retirer' : 'Favoris',
      icon: Star,
      color: 'warning' as const,
      action: () => mealId && onFavorite?.(mealId)
    },
    {
      id: 'duplicate',
      label: 'Dupliquer',
      icon: Copy,
      color: 'primary' as const,
      action: () => mealId && onDuplicate?.(mealId)
    }
  ]

  const rightActions = [
    {
      id: 'edit',
      label: 'Modifier',
      icon: Edit,
      color: 'secondary' as const,
      action: () => mealId && onEdit?.(mealId)
    },
    {
      id: 'delete',
      label: 'Supprimer',
      icon: Trash2,
      color: 'danger' as const,
      action: () => mealId && onDelete?.(mealId)
    }
  ]

  const totalCalories = macros?.kcal || 0
  const hasAliments = aliments.length > 0

  return (
    <SwipeableCard
      leftActions={leftActions}
      rightActions={rightActions}
      className={className}
    >
      <div className="glass-effect rounded-xl p-4 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{mealIcon}</div>
            <div>
              <h3 className="font-semibold text-white">{mealName}</h3>
              <p className="text-sm text-white/60">{time}</p>
            </div>
          </div>
          
          {isFavorite && (
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
          )}
        </div>

        {/* Macros Summary */}
        {hasAliments && macros && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">
                {Math.round(totalCalories)}
              </div>
              <div className="text-xs text-white/60">kcal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {Math.round(macros.prot)}g
              </div>
              <div className="text-xs text-white/60">Prot</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400">
                {Math.round(macros.glucides)}g
              </div>
              <div className="text-xs text-white/60">Gluc</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {Math.round(macros.lipides)}g
              </div>
              <div className="text-xs text-white/60">Lip</div>
            </div>
          </div>
        )}

        {/* Aliments List */}
        {hasAliments ? (
          <div className="space-y-2">
            {aliments.slice(0, 3).map((aliment, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                  <span className="text-white/80 truncate">
                    {aliment.nom}
                  </span>
                </div>
                <div className="text-white/60 text-xs">
                  {aliment.quantite}{aliment.unite}
                </div>
              </div>
            ))}
            
            {aliments.length > 3 && (
              <div className="text-xs text-white/50 text-center pt-2">
                +{aliments.length - 3} autres aliments
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-white/40 text-sm">
              Aucun aliment ajouté
            </div>
            <div className="text-xs text-white/30 mt-1">
              Tap pour ajouter des aliments
            </div>
          </div>
        )}

        {/* Mobile Swipe Hint */}
        <div className="flex justify-center mt-3 md:hidden">
          <div className="flex items-center gap-1 text-xs text-white/40">
            <span>←</span>
            <span>Glissez pour les actions</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </SwipeableCard>
  )
}
