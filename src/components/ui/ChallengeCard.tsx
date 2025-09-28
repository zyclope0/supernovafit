'use client';

import React from 'react';
import type { Challenge } from '@/types';
import { getDifficultyColor, getProgressPercentage } from '@/lib/challenges';
import { Trophy, Clock, Target, Zap } from 'lucide-react';

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete?: (challengeId: string) => void;
  onPause?: (challengeId: string) => void;
  onDelete?: (challengeId: string) => void;
  showActions?: boolean;
}

export default function ChallengeCard({
  challenge,
  onComplete,
  onPause,
  onDelete,
  showActions = true,
}: ChallengeCardProps) {
  const progressPercentage = getProgressPercentage(
    challenge.current,
    challenge.target,
  );
  const isCompleted = challenge.status === 'completed';
  const isExpired = challenge.status === 'expired';
  const isPaused = challenge.status === 'paused';

  const getStatusColor = () => {
    if (isCompleted) return 'border-green-500 bg-green-500/10';
    if (isExpired) return 'border-red-500 bg-red-500/10';
    if (isPaused) return 'border-yellow-500 bg-yellow-500/10';
    return 'border-white/20 bg-white/5';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Terminé';
    if (isExpired) return 'Expiré';
    if (isPaused) return 'En pause';
    return 'Actif';
  };

  const getStatusIcon = () => {
    if (isCompleted) return <Trophy className="w-4 h-4 text-green-400" />;
    if (isExpired) return <Clock className="w-4 h-4 text-red-400" />;
    if (isPaused) return <Clock className="w-4 h-4 text-yellow-400" />;
    return <Target className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div
      className={`glass-effect rounded-xl p-6 border transition-all duration-300 hover:scale-105 ${getStatusColor()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{challenge.icon}</div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {challenge.title}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon()}
              <span className="text-white/70">{getStatusText()}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)} bg-white/10`}
              >
                {challenge.difficulty}
              </span>
            </div>
          </div>
        </div>

        {showActions && !isCompleted && !isExpired && (
          <div className="flex gap-2">
            {!isPaused && (
              <button
                onClick={() => onPause?.(challenge.id)}
                className="p-2 text-yellow-400 hover:bg-yellow-400/20 rounded-lg transition-colors"
                title="Mettre en pause"
              >
                <Clock className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDelete?.(challenge.id)}
              className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
              title="Supprimer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-white/80 text-sm mb-4 leading-relaxed">
        {challenge.description}
      </p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/70">Progression</span>
          <span className="text-sm font-medium text-white">
            {challenge.current} / {challenge.target} {challenge.unit}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isCompleted
                ? 'bg-green-400'
                : isExpired
                  ? 'bg-red-400'
                  : 'bg-gradient-to-r from-blue-400 to-purple-400'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-right mt-1">
          <span className="text-xs text-white/60">{progressPercentage}%</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-white/70">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>{challenge.xpReward} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              {challenge.endDate &&
              challenge.endDate !== '' &&
              !isNaN(new Date(challenge.endDate).getTime())
                ? new Date(challenge.endDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })
                : 'En cours'}
            </span>
          </div>
        </div>

        {showActions && !isCompleted && !isExpired && (
          <button
            onClick={() => onComplete?.(challenge.id)}
            disabled={challenge.current < challenge.target}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              challenge.current >= challenge.target
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-white/10 text-white/50 cursor-not-allowed'
            }`}
          >
            {challenge.current >= challenge.target ? 'Terminer' : 'En cours'}
          </button>
        )}
      </div>

      {/* Badge Reward */}
      {challenge.badgeReward && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Badge: {challenge.badgeReward}</span>
          </div>
        </div>
      )}
    </div>
  );
}
