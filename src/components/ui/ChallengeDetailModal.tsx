'use client'

import React from 'react'
import { Calendar, Target, Trophy, Play, Pause, Trash2, Star } from 'lucide-react'
import StandardModal from './StandardModal'
import { formatDate } from '@/lib/utils'

interface Challenge {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  type: 'nutrition' | 'training' | 'streak' | 'social' | 'special'
  target: number
  current: number
  unit?: string
  status: 'active' | 'paused' | 'completed' | 'expired'
  startDate: string
  endDate?: string
  completed_at?: string
  xpReward: number
  created_at?: Date | string
}

interface ChallengeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  challenge: Challenge | null
  onDelete?: () => void
  onComplete?: () => void
  onPause?: () => void
  onResume?: () => void
}

export default function ChallengeDetailModal({
  isOpen,
  onClose,
  challenge,
  onDelete,
  onComplete,
  onPause,
  onResume
}: ChallengeDetailModalProps) {
  if (!isOpen || !challenge) return null

  // Calculer le pourcentage de progression
  const progressPercentage = challenge.target && challenge.target > 0
    ? Math.min((challenge.current / challenge.target) * 100, 100)
    : 0
  
  // Déterminer la couleur de la barre de progression
  const getProgressColor = () => {
    if (challenge.status === 'completed') return 'bg-neon-cyan'
    if (challenge.status === 'expired') return 'bg-neon-red'
    if (progressPercentage >= 80) return 'bg-neon-green'
    if (progressPercentage >= 50) return 'bg-neon-yellow'
    return 'bg-neon-pink'
  }

  // Déterminer la couleur basée sur la difficulté
  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
      case 'easy': return 'text-neon-green'
      case 'medium': return 'text-neon-yellow'
      case 'hard': return 'text-neon-red'
      default: return 'text-gray-400'
    }
  }

  // Déterminer le label de difficulté
  const getDifficultyLabel = () => {
    switch (challenge.difficulty) {
      case 'easy': return 'Facile'
      case 'medium': return 'Moyen'
      case 'hard': return 'Difficile'
      default: return 'Inconnu'
    }
  }

  // Déterminer l'emoji de catégorie
  const getCategoryEmoji = () => {
    switch (challenge.category) {
      case 'fitness': return '💪'
      case 'nutrition': return '🍎'
      case 'wellness': return '🧘'
      case 'social': return '👥'
      case 'learning': return '📚'
      case 'productivity': return '⚡'
      default: return '🎯'
    }
  }

  // Déterminer le label de type
  const getTypeLabel = () => {
    switch (challenge.type) {
      case 'nutrition': return 'Nutrition'
      case 'training': return 'Entraînement'
      case 'streak': return 'Série'
      case 'social': return 'Social'
      case 'special': return 'Spécial'
      default: return 'Inconnu'
    }
  }

  // Déterminer le label de statut
  const getStatusLabel = () => {
    switch (challenge.status) {
      case 'active': return 'En cours'
      case 'paused': return 'En pause'
      case 'completed': return 'Terminé'
      case 'expired': return 'Expiré'
      default: return 'Inconnu'
    }
  }

  // Déterminer la couleur de statut
  const getStatusColor = () => {
    switch (challenge.status) {
      case 'active': return 'text-neon-green'
      case 'paused': return 'text-neon-yellow'
      case 'completed': return 'text-neon-cyan'
      case 'expired': return 'text-neon-red'
      default: return 'text-gray-400'
    }
  }

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={challenge.title}
      subtitle={`${getCategoryEmoji()} ${getStatusLabel()}`}
      icon={getCategoryEmoji()}
      maxWidth="2xl"
      height="85vh"
    >
      <div className="p-6 pb-4 overflow-y-auto max-h-full">
        <div className="space-y-4">
        {/* Description */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Description
          </h4>
          <p className="text-white text-sm leading-relaxed">
            {challenge.description}
          </p>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-neon-purple" />
              <span className="text-sm font-medium text-white">Progression</span>
            </div>
            <div className="text-2xl font-bold text-neon-purple">
              {challenge.current}/{challenge.target}
            </div>
            <div className="text-xs text-gray-400">
              {Math.round(progressPercentage)}% terminé
            </div>
          </div>
          
          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-neon-yellow" />
              <span className="text-sm font-medium text-white">Récompense XP</span>
            </div>
            <div className="text-2xl font-bold text-neon-yellow">
              {challenge.xpReward}
            </div>
            <div className="text-xs text-gray-400">points d&apos;expérience</div>
          </div>
        </div>

        {/* Barre de progression détaillée */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Progression détaillée
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Avancement</span>
              <span className="text-white font-medium">
                {challenge.current} / {challenge.target} {challenge.unit || ''}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-center text-xs text-gray-400">
              {Math.round(progressPercentage)}% terminé
            </div>
          </div>
        </div>

        {/* Détails du challenge */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            Détails du challenge
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Catégorie</span>
                <span className="text-sm text-white font-medium">
                  {getCategoryEmoji()} {challenge.category}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Difficulté</span>
                <span className={`text-sm font-medium ${getDifficultyColor()}`}>
                  {getDifficultyLabel()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Type</span>
                <span className="text-sm text-white font-medium">
                  {getTypeLabel()}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Statut</span>
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusLabel()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Date de début</span>
                <span className="text-sm text-white font-medium">
                  {formatDate(challenge.startDate)}
                </span>
              </div>
              {challenge.endDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Date de fin</span>
                  <span className="text-sm text-white font-medium">
                    {formatDate(challenge.endDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dates importantes */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Chronologie
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neon-cyan" />
                <span className="text-sm text-white">Créé le</span>
              </div>
              <span className="text-sm text-neon-cyan font-medium">
                {formatDate(challenge.created_at || challenge.startDate)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-neon-green" />
                <span className="text-sm text-white">Démarré le</span>
              </div>
              <span className="text-sm text-neon-green font-medium">
                {formatDate(challenge.startDate)}
              </span>
            </div>
            
            {challenge.completed_at && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-neon-yellow" />
                  <span className="text-sm text-white">Terminé le</span>
                </div>
                <span className="text-sm text-neon-yellow font-medium">
                  {formatDate(challenge.completed_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        </div>
      </div>
      
      {/* Actions */}
      {(onDelete || onComplete || onPause || onResume) && (
        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-white/10">
          {challenge.status === 'active' && (
            <>
              {onPause && (
                <button
                  onClick={onPause}
                  className="flex items-center gap-2 px-4 py-2 bg-neon-yellow/20 text-neon-yellow rounded-lg hover:bg-neon-yellow/30 transition-colors"
                >
                  <Pause className="h-4 w-4" />
                  Mettre en pause
                </button>
              )}
              {onComplete && (
                <button
                  onClick={onComplete}
                  className="flex items-center gap-2 px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors"
                >
                  <Trophy className="h-4 w-4" />
                  Terminer
                </button>
              )}
            </>
          )}
          
          {challenge.status === 'paused' && onResume && (
            <button
              onClick={onResume}
              className="flex items-center gap-2 px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors"
            >
              <Play className="h-4 w-4" />
              Reprendre
            </button>
          )}
          
          
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          )}
        </div>
      )}
    </StandardModal>
  )
}
