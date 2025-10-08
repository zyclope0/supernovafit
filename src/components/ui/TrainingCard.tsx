'use client';

import React from 'react';
import { Entrainement } from '@/types';
import { timestampToDateString } from '@/lib/dateUtils';
import { Timestamp } from 'firebase/firestore';
import {
  Timer,
  Target,
  Edit,
  Trash2,
  Calendar,
  Heart,
  Route,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCoachCommentsByModule } from '@/hooks/useFirestore';
import ModuleComments from './ModuleComments';

interface TrainingCardProps {
  training: Entrainement;
  onEdit: () => void;
  onDelete: () => void;
}

const TRAINING_TYPES = [
  { value: 'cardio', label: 'Cardio', icon: '🏃', color: 'neon-green' },
  {
    value: 'musculation',
    label: 'Musculation',
    icon: '💪',
    color: 'neon-cyan',
  },
  { value: 'hiit', label: 'HIIT', icon: '🔥', color: 'neon-pink' },
  { value: 'yoga', label: 'Yoga', icon: '🧘', color: 'neon-purple' },
  { value: 'natation', label: 'Natation', icon: '🏊', color: 'neon-cyan' },
  { value: 'cyclisme', label: 'Cyclisme', icon: '🚴', color: 'neon-green' },
  { value: 'course', label: 'Course à pied', icon: '🏃', color: 'neon-pink' },
  { value: 'autre', label: 'Autre', icon: '⚡', color: 'neon-purple' },
];

function TrainingCardComponent({
  training,
  onEdit,
  onDelete,
}: TrainingCardProps) {
  const trainingType =
    TRAINING_TYPES.find((t) => t.value === training.type) || TRAINING_TYPES[0];
  const { comments: trainingComments, loading: commentsLoading } =
    useCoachCommentsByModule('entrainements', undefined, training.id);

  const formatDate = (date: string | Timestamp | undefined) => {
    try {
      const dateStr = timestampToDateString(date);
      return format(new Date(dateStr), 'EEEE d MMMM', { locale: fr });
    } catch {
      return timestampToDateString(date);
    }
  };

  return (
    <div className="glass-effect p-4 rounded-lg border border-white/10 hover:glow-cyan transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* En-tête */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{trainingType.icon}</span>
            <div>
              <h3 className={`font-medium text-${trainingType.color}`}>
                {trainingType.label}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(timestampToDateString(training.date))}
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
                <span className="text-white font-medium">
                  {training.calories}
                </span>
                <span className="text-muted-foreground">kcal</span>
              </div>
            )}

            {training.distance && (
              <div className="flex items-center gap-1 text-sm">
                <Route className="h-4 w-4 text-neon-cyan" />
                <span className="text-white font-medium">
                  {training.distance}
                </span>
                <span className="text-muted-foreground">km</span>
              </div>
            )}

            {training.fc_moyenne && (
              <div className="flex items-center gap-1 text-sm">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-white font-medium">
                  {training.fc_moyenne}
                </span>
                <span className="text-muted-foreground">bpm</span>
              </div>
            )}

            <div className="text-xs px-2 py-1 bg-white/10 rounded-full text-muted-foreground">
              {training.source === 'manuel' ? 'Saisie manuelle' : 'Import'}
            </div>
          </div>

          {/* Données avancées (si présentes) */}
          {(training.vitesse_moy ||
            training.elevation_gain ||
            training.puissance_moy) && (
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

          {/* Ressenti (si présent) */}
          {(training.effort_percu ||
            training.fatigue_avant ||
            training.fatigue_apres) && (
            <div className="flex items-center gap-2 sm:gap-3 mb-3 text-xs flex-wrap">
              {training.effort_percu && (
                <div className="text-muted-foreground">
                  <span className="text-neon-purple">Effort:</span>{' '}
                  {training.effort_percu}/10
                </div>
              )}
              {training.fatigue_avant && (
                <div className="text-muted-foreground">
                  <span className="text-neon-cyan">Fatigue avant:</span>{' '}
                  {training.fatigue_avant}/10
                </div>
              )}
              {training.fatigue_apres && (
                <div className="text-muted-foreground">
                  <span className="text-neon-pink">Fatigue après:</span>{' '}
                  {training.fatigue_apres}/10
                </div>
              )}
            </div>
          )}

          {/* Commentaire */}
          {training.commentaire && (
            <div className="text-sm text-muted-foreground bg-white/5 p-3 rounded-lg">
              &quot;{training.commentaire}&quot;
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-2 text-muted-foreground hover:text-neon-cyan transition-colors"
            title="Modifier"
            aria-label="Modifier l'entraînement"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
            title="Supprimer"
            aria-label="Supprimer l'entraînement"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Commentaires du coach pour cet entraînement */}
      <ModuleComments
        comments={trainingComments}
        loading={commentsLoading}
        compact
      />
    </div>
  );
}

const TrainingCard = React.memo(TrainingCardComponent);
export default TrainingCard;
