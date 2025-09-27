'use client'

import React from 'react'
import { Entrainement } from '@/types'
import { Timer, Target, Calendar, Heart, Route, TrendingUp, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useCoachCommentsByModule } from '@/hooks/useFirestore'
import ModuleComments from './ModuleComments'
import ClickableCard from './ClickableCard'

interface TrainingCardClickableProps {
  training: Entrainement
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

const TRAINING_TYPES = [
  { value: 'cardio', label: 'Cardio', icon: '🏃', color: 'neon-green' },
  { value: 'musculation', label: 'Musculation', icon: '💪', color: 'neon-cyan' },
  { value: 'hiit', label: 'HIIT', icon: '🔥', color: 'neon-pink' },
  { value: 'yoga', label: 'Yoga', icon: '🧘', color: 'neon-purple' },
  { value: 'natation', label: 'Natation', icon: '🏊', color: 'neon-cyan' },
  { value: 'cyclisme', label: 'Cyclisme', icon: '🚴', color: 'neon-green' },
  { value: 'course', label: 'Course à pied', icon: '🏃', color: 'neon-pink' },
  { value: 'autre', label: 'Autre', icon: '⚡', color: 'neon-purple' }
]

function TrainingCardClickableComponent({ training, onView, onEdit, onDelete }: TrainingCardClickableProps) {
  const trainingType = TRAINING_TYPES.find(t => t.value === training.type) || TRAINING_TYPES[0]
  const { comments: trainingComments, loading: commentsLoading } = useCoachCommentsByModule('entrainements', undefined, training.id)
  
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEEE d MMMM', { locale: fr })
    } catch {
      return dateStr
    }
  }

  return (
    <ClickableCard
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      viewLabel="Voir détails"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* En-tête */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{trainingType.icon}</span>
            <div>
              <h3 className={`font-medium text-${trainingType.color} group-hover:text-white transition-colors`}>
                {trainingType.label}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(training.date)}
              </div>
            </div>
          </div>

          {/* Statistiques principales */}
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <div className="flex items-center gap-1 text-sm">
              <Timer className="h-4 w-4 text-neon-green" />
              <span className="text-white font-medium">{training.duree}</span>
              <span className="text-muted-foreground">min</span>
            </div>
            
            {training.calories && (
              <div className="flex items-center gap-1 text-sm">
                <Target className="h-4 w-4 text-neon-pink" />
                <span className="text-white font-medium">{training.calories}</span>
                <span className="text-muted-foreground">kcal</span>
              </div>
            )}

            {training.distance && (
              <div className="flex items-center gap-1 text-sm">
                <Route className="h-4 w-4 text-neon-cyan" />
                <span className="text-white font-medium">{training.distance}</span>
                <span className="text-muted-foreground">km</span>
              </div>
            )}

            {training.fc_moyenne && (
              <div className="flex items-center gap-1 text-sm">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-white font-medium">{training.fc_moyenne}</span>
                <span className="text-muted-foreground">bpm</span>
              </div>
            )}
            
            <div className="text-xs px-2 py-1 bg-white/10 rounded-full text-muted-foreground">
              {training.source === 'manuel' ? 'Saisie manuelle' : 'Import'}
            </div>
          </div>

          {/* Données avancées (si présentes) */}
          {(training.vitesse_moy || training.elevation_gain || training.puissance_moy) && (
            <div className="flex items-center gap-2 sm:gap-4 mb-3 text-xs flex-wrap">
              {training.vitesse_moy && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{training.vitesse_moy} km/h</span>
                </div>
              )}
              {training.elevation_gain && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span>⛰️</span>
                  <span>{training.elevation_gain}m D+</span>
                </div>
              )}
              {training.puissance_moy && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  <span>{training.puissance_moy}W</span>
                </div>
              )}
            </div>
          )}

          {/* Commentaire (aperçu) */}
          {training.commentaire && (
            <div className="text-sm text-muted-foreground bg-white/5 p-3 rounded-lg">
              &quot;{training.commentaire.length > 100 ? `${training.commentaire.slice(0, 100)}...` : training.commentaire}&quot;
            </div>
          )}
        </div>
      </div>
      
      {/* Commentaires du coach pour cet entraînement */}
      {trainingComments && trainingComments.length > 0 && (
        <div className="mt-3">
          <ModuleComments comments={trainingComments} loading={commentsLoading} compact />
        </div>
      )}
    </ClickableCard>
  )
}

const TrainingCardClickable = React.memo(TrainingCardClickableComponent)
export default TrainingCardClickable
