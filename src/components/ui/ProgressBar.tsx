'use client';

import React from 'react';
import type { UserProgress } from '@/types';
import { calculateLevel } from '@/lib/challenges';
import { Star, Trophy, Target, Zap } from 'lucide-react';

interface ProgressBarProps {
  progress: UserProgress;
  showDetails?: boolean;
  compact?: boolean;
}

export default function ProgressBar({
  progress,
  showDetails = true,
  compact = false,
}: ProgressBarProps) {
  const levelInfo = calculateLevel(progress.totalXP);
  const progressPercentage = Math.round(
    (levelInfo.currentLevelXP / levelInfo.nextLevelXP) * 100,
  );

  if (compact) {
    return (
      <div className="glass-effect rounded-lg p-4 border border-white/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-lg font-bold text-white">
              Niveau {progress.level}
            </span>
          </div>
          <div className="text-sm text-white/70">
            {levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP
          </div>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">⭐</div>
          <div>
            <h3 className="text-xl font-bold text-white">Progression</h3>
            <p className="text-white/70 text-sm">Niveau {progress.level}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {progress.totalXP}
          </div>
          <div className="text-sm text-white/70">XP Total</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/70">
            Progression vers le niveau {progress.level + 1}
          </span>
          <span className="text-sm font-medium text-white">
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>{levelInfo.currentLevelXP} XP</span>
          <span>{levelInfo.nextLevelXP} XP</span>
        </div>
      </div>

      {/* Stats Grid */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-lg font-bold text-white">
                {progress.badgesCount}
              </div>
              <div className="text-xs text-white/70">Badges</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <Target className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-lg font-bold text-white">
                {progress.challengesCompleted}
              </div>
              <div className="text-xs text-white/70">Challenges</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <Zap className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-lg font-bold text-white">
                {progress.achievementsUnlocked}
              </div>
              <div className="text-xs text-white/70">Achievements</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <Star className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-lg font-bold text-white">
                {progress.streakDays}
              </div>
              <div className="text-xs text-white/70">Jours streak</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
