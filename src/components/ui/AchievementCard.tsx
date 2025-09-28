'use client';

import React from 'react';
import type { Achievement } from '@/types';
import { getRarityColor } from '@/lib/challenges';
import { Trophy, Star, Crown, Gem } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked?: boolean;
  showDetails?: boolean;
}

export default function AchievementCard({
  achievement,
  isUnlocked = true,
  showDetails = true,
}: AchievementCardProps) {
  const getRarityIcon = () => {
    switch (achievement.rarity) {
      case 'common':
        return <Star className="w-4 h-4 text-gray-400" />;
      case 'rare':
        return <Star className="w-4 h-4 text-blue-400" />;
      case 'epic':
        return <Crown className="w-4 h-4 text-purple-400" />;
      case 'legendary':
        return <Gem className="w-4 h-4 text-yellow-400" />;
      default:
        return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRarityGradient = () => {
    switch (achievement.rarity) {
      case 'common':
        return 'from-gray-400 to-gray-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div
      className={`glass-effect rounded-xl p-6 border transition-all duration-300 hover:scale-105 ${
        isUnlocked
          ? 'border-white/20 bg-white/5'
          : 'border-white/10 bg-white/2 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`text-3xl ${!isUnlocked ? 'grayscale' : ''}`}>
            {achievement.icon}
          </div>
          <div>
            <h3
              className={`text-lg font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-white/50'}`}
            >
              {achievement.name}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              {getRarityIcon()}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)} bg-white/10`}
              >
                {achievement.rarity}
              </span>
            </div>
          </div>
        </div>

        {isUnlocked && (
          <div className="flex items-center gap-1 text-yellow-400">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">
              {achievement.xpReward} XP
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <p
        className={`text-sm mb-4 leading-relaxed ${isUnlocked ? 'text-white/80' : 'text-white/40'}`}
      >
        {achievement.description}
      </p>

      {/* Condition */}
      {showDetails && (
        <div className="mb-4">
          <div className="text-xs text-white/60 mb-1">Condition</div>
          <div
            className={`text-sm ${isUnlocked ? 'text-white/70' : 'text-white/40'}`}
          >
            {achievement.condition}
          </div>
        </div>
      )}

      {/* Footer */}
      {isUnlocked && achievement.unlockedAt && (
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Débloqué le</span>
            <span>
              {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}

      {/* Rarity Effect */}
      {isUnlocked && achievement.rarity !== 'common' && (
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getRarityGradient()} opacity-5 pointer-events-none`}
        />
      )}
    </div>
  );
}
