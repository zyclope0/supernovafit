'use client'

import React from 'react'
import { formatDate } from '@/lib/utils'
import { Mesure } from '@/types'
import ClickableCard from './ClickableCard'

interface MesuresCardClickableProps {
  mesure: Mesure
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  getStats: (mesure: Mesure) => ({ 
    imc: number; 
    evolution_poids: number; 
    evolution_masse_grasse: number; 
    poids_ideal_min: number; 
    poids_ideal_max: number 
  } | null)
  viewLabel?: string
  className?: string
}

export default function MesuresCardClickable({
  mesure,
  onView,
  onEdit,
  onDelete,
  getStats,
  viewLabel = 'Voir détails',
  className = ''
}: MesuresCardClickableProps) {
  const stats = getStats(mesure)
  
  return (
    <ClickableCard
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      viewLabel={viewLabel}
      className={className}
    >
      {/* Header avec date et jour */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium text-white">{formatDate(mesure.date)}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(mesure.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
          </p>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {mesure.poids && (
          <div className="text-center">
            <div className="text-lg font-semibold text-neon-green">{mesure.poids}</div>
            <div className="text-xs text-muted-foreground">kg</div>
          </div>
        )}
        {stats?.imc && (
          <div className="text-center">
            <div className="text-lg font-semibold text-neon-cyan">{stats.imc}</div>
            <div className="text-xs text-muted-foreground">IMC</div>
          </div>
        )}
        {mesure.masse_grasse && (
          <div className="text-center">
            <div className="text-lg font-semibold text-neon-pink">{mesure.masse_grasse}%</div>
            <div className="text-xs text-muted-foreground">Masse grasse</div>
          </div>
        )}
        {mesure.tour_taille && (
          <div className="text-center">
            <div className="text-lg font-semibold text-neon-yellow">{mesure.tour_taille}</div>
            <div className="text-xs text-muted-foreground">cm</div>
          </div>
        )}
      </div>

      {/* Évolutions */}
      {stats && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {stats.evolution_poids !== 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Évolution poids:</span>
                <span className={`font-medium ${stats.evolution_poids > 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                  {stats.evolution_poids > 0 ? '+' : ''}{stats.evolution_poids.toFixed(1)} kg
                </span>
              </div>
            )}
            {stats.evolution_masse_grasse !== 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Évolution masse grasse:</span>
                <span className={`font-medium ${stats.evolution_masse_grasse > 0 ? 'text-neon-red' : 'text-neon-green'}`}>
                  {stats.evolution_masse_grasse > 0 ? '+' : ''}{stats.evolution_masse_grasse.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commentaire */}
      {mesure.commentaire && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-sm text-muted-foreground italic">
            &quot;{mesure.commentaire}&quot;
          </p>
        </div>
      )}
    </ClickableCard>
  )
}