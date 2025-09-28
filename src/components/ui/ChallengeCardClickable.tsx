'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  Target,
  Trophy,
  Play,
  Pause,
  Star,
} from 'lucide-react';
import ClickableCard from './ClickableCard';
import { formatDate } from '@/lib/utils';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  type: 'nutrition' | 'training' | 'streak' | 'social' | 'special';
  target: number;
  current: number;
  unit?: string;
  status: 'active' | 'paused' | 'completed' | 'expired';
  startDate: string;
  endDate?: string;
  completed_at?: string;
  xpReward: number;
  created_at?: Date | string;
}

interface ChallengeCardClickableProps {
  challenge: Challenge;
  onView: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export default function ChallengeCardClickable({
  challenge,
  onView,
  onDelete,
  onComplete,
  onPause,
  onResume,
}: ChallengeCardClickableProps) {
  // Calculer le pourcentage de progression
  const progressPercentage =
    challenge.target && challenge.target > 0
      ? Math.min((challenge.current / challenge.target) * 100, 100)
      : 0;

  // Déterminer la couleur basée sur le statut
  const getStatusColor = () => {
    switch (challenge.status) {
      case 'active':
        return 'text-neon-green';
      case 'paused':
        return 'text-neon-yellow';
      case 'completed':
        return 'text-neon-cyan';
      case 'expired':
        return 'text-neon-red';
      default:
        return 'text-gray-400';
    }
  };

  // Déterminer la couleur de la barre de progression
  const getProgressColor = () => {
    if (challenge.status === 'completed') return 'bg-neon-cyan';
    if (challenge.status === 'expired') return 'bg-neon-red';
    if (progressPercentage >= 80) return 'bg-neon-green';
    if (progressPercentage >= 50) return 'bg-neon-yellow';
    return 'bg-neon-pink';
  };

  // Déterminer l'icône de statut
  const getStatusIcon = () => {
    switch (challenge.status) {
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'completed':
        return <Trophy className="h-4 w-4" />;
      case 'expired':
        return <Clock className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  // Déterminer le label de statut
  const getStatusLabel = () => {
    switch (challenge.status) {
      case 'active':
        return 'En cours';
      case 'paused':
        return 'En pause';
      case 'completed':
        return 'Terminé';
      case 'expired':
        return 'Expiré';
      default:
        return 'Inconnu';
    }
  };

  // Déterminer la couleur de fond basée sur la difficulté
  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
      case 'easy':
        return 'bg-neon-green/10 border-neon-green/20';
      case 'medium':
        return 'bg-neon-yellow/10 border-neon-yellow/20';
      case 'hard':
        return 'bg-neon-red/10 border-neon-red/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  // Déterminer le label de difficulté
  const getDifficultyLabel = () => {
    switch (challenge.difficulty) {
      case 'easy':
        return 'Facile';
      case 'medium':
        return 'Moyen';
      case 'hard':
        return 'Difficile';
      default:
        return 'Inconnu';
    }
  };

  // Déterminer l'emoji de catégorie
  const getCategoryEmoji = () => {
    switch (challenge.category) {
      case 'fitness':
        return '💪';
      case 'nutrition':
        return '🍎';
      case 'wellness':
        return '🧘';
      case 'social':
        return '👥';
      case 'learning':
        return '📚';
      case 'productivity':
        return '⚡';
      default:
        return '🎯';
    }
  };

  return (
    <ClickableCard
      onView={onView}
      onEdit={() => {}}
      onDelete={onDelete || (() => {})}
      viewLabel="Voir détails"
    >
      <div className="space-y-4">
        {/* Header avec titre et statut */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getCategoryEmoji()}</span>
              <h3 className="font-semibold text-white text-sm leading-tight">
                {challenge.title}
              </h3>
            </div>
            <p className="text-xs text-gray-400 line-clamp-2">
              {challenge.description}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor()}`}
          >
            {getStatusIcon()}
            <span>{getStatusLabel()}</span>
          </div>
        </div>

        {/* Informations du challenge */}
        <div className="space-y-2">
          {/* Difficulté et type */}
          <div className="flex items-center justify-between text-xs">
            <div className={`px-2 py-1 rounded-full ${getDifficultyColor()}`}>
              <span className="text-white">{getDifficultyLabel()}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Target className="h-3 w-3" />
              <span>{challenge.type.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Progression */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Progression</span>
              <span className="text-white font-medium">
                {challenge.current}/{challenge.target} {challenge.unit || ''}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Dates et XP */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Début: {formatDate(challenge.startDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-neon-yellow" />
              <span className="text-neon-yellow">{challenge.xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Actions contextuelles */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="text-xs text-gray-400">
            {challenge.status === 'active' &&
              `${Math.round(progressPercentage)}% terminé`}
            {challenge.status === 'completed' &&
              `Terminé le ${formatDate(challenge.completed_at || '')}`}
            {challenge.status === 'paused' && 'Mis en pause'}
            {challenge.status === 'expired' && 'Challenge expiré'}
          </div>

          {/* Boutons d'action selon le statut */}
          <div className="flex items-center gap-1">
            {challenge.status === 'active' && (
              <>
                {onPause && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPause();
                    }}
                    className="p-1 hover:bg-white/10 rounded text-neon-yellow"
                    title="Mettre en pause"
                  >
                    <Pause className="h-3 w-3" />
                  </button>
                )}
                {onComplete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete();
                    }}
                    className="p-1 hover:bg-white/10 rounded text-neon-green"
                    title="Marquer comme terminé"
                  >
                    <Trophy className="h-3 w-3" />
                  </button>
                )}
              </>
            )}

            {challenge.status === 'paused' && onResume && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResume();
                }}
                className="p-1 hover:bg-white/10 rounded text-neon-green"
                title="Reprendre"
              >
                <Play className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </ClickableCard>
  );
}
