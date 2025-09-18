'use client'

import { Edit, Trash2, Copy, Play, Timer } from 'lucide-react'
import SwipeableCard from './SwipeableCard'
import { Entrainement } from '@/types'
// import { cn } from '@/lib/utils' // TODO: À utiliser si nécessaire

interface SwipeableTrainingCardProps {
  training: Entrainement
  onEdit?: (trainingId: string) => void
  onDelete?: (trainingId: string) => void
  onDuplicate?: (trainingId: string) => void
  onRestart?: (trainingId: string) => void
  className?: string
}

export default function SwipeableTrainingCard({
  training,
  onEdit,
  onDelete,
  onDuplicate,
  onRestart,
  className
}: SwipeableTrainingCardProps) {
  
  const leftActions = [
    {
      id: 'duplicate',
      label: 'Dupliquer',
      icon: Copy,
      color: 'primary' as const,
      action: () => onDuplicate?.(training.id)
    },
    {
      id: 'restart',
      label: 'Refaire',
      icon: Play,
      color: 'success' as const,
      action: () => onRestart?.(training.id)
    }
  ]

  const rightActions = [
    {
      id: 'edit',
      label: 'Modifier',
      icon: Edit,
      color: 'secondary' as const,
      action: () => onEdit?.(training.id)
    },
    {
      id: 'delete',
      label: 'Supprimer',
      icon: Trash2,
      color: 'danger' as const,
      action: () => onDelete?.(training.id)
    }
  ]

  const getTypeEmoji = (type: string) => {
    const typeMap: Record<string, string> = {
      'course': '🏃',
      'velo': '🚴',
      'natation': '🏊',
      'musculation': '💪',
      'yoga': '🧘',
      'hiit': '🔥',
      'cardio': '❤️',
      'stretching': '🤸',
      'marche': '🚶',
      'autre': '🏋️'
    }
    return typeMap[type.toLowerCase()] || '🏋️'
  }

  // Fonction pour couleur intensité - TODO: À utiliser si nécessaire
  /*
  const getIntensityColor = (intensite?: string) => {
    switch (intensite?.toLowerCase()) {
      case 'faible': return 'text-green-400'
      case 'modérée': case 'moderate': return 'text-yellow-400'
      case 'élevée': case 'high': return 'text-red-400'
      default: return 'text-white/60'
    }
  }
  */

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}min` : `${hours}h`
  }

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
            <div className="text-2xl">
              {getTypeEmoji(training.type)}
            </div>
            <div>
              <h3 className="font-semibold text-white">{training.type}</h3>
              <p className="text-sm text-white/60">
                {new Date(training.date).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
            </div>
          </div>
          
          {/* TODO: Ajouter intensite au type Entrainement
          {training.intensite && (
            <div className={cn(
              'px-2 py-1 rounded-full text-xs font-medium bg-white/10', 
              getIntensityColor(training.intensite)
            )}>
              {training.intensite}
            </div>
          )}
          */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
          {/* Durée */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Timer className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-blue-400">
              {formatDuration(training.duree)}
            </div>
            <div className="text-xs text-white/60">Durée</div>
          </div>

          {/* Calories */}
          {training.calories && (
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">
                {Math.round(training.calories)}
              </div>
              <div className="text-xs text-white/60">kcal</div>
            </div>
          )}

          {/* Fréquence cardiaque moyenne */}
          {/* TODO: Ajouter frequence_cardiaque_moyenne au type Entrainement
          {training.frequence_cardiaque_moyenne && (
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">
                {Math.round(training.frequence_cardiaque_moyenne)}
              </div>
              <div className="text-xs text-white/60">bpm</div>
            </div>
          )}
          */}

          {/* Distance */}
          {training.distance && (
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {training.distance}
              </div>
              <div className="text-xs text-white/60">km</div>
            </div>
          )}
        </div>

        {/* Notes */}
        {/* TODO: Ajouter notes au type Entrainement
        {training.notes && (
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-sm text-white/80 leading-relaxed">
              {training.notes.length > 100 
                ? `${training.notes.substring(0, 100)}...`
                : training.notes
              }
            </p>
          </div>
        )}
        */}

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
