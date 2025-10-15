'use client';

import React from 'react';
import {
  Trophy,
  Target,
  TrendingUp,
  Users,
  Zap,
  Award,
  Calendar,
  Activity,
} from 'lucide-react';
import {
  formatNumberWithSeparators,
  formatPercentage,
} from '@/lib/numberUtils';

interface TeamStats {
  totalXP: number;
  challengesCompleted: number;
  totalWorkouts: number;
  totalCalories: number;
  averageProgress: number;
  activeAthletes: number;
  totalAthletes: number;
  weeklyGoal: number;
  monthlyGoal: number;
}

interface TeamProgressProps {
  stats: TeamStats;
  onViewDetails?: () => void;
}

export default function TeamProgress({
  stats,
  onViewDetails,
}: TeamProgressProps) {
  const getProgressPercentage = (current: number, target: number) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-neon-green bg-neon-green/20';
    if (percentage >= 60) return 'text-neon-yellow bg-neon-yellow/20';
    if (percentage >= 40) return 'text-orange-400 bg-orange-400/20';
    return 'text-neon-red bg-neon-red/20';
  };

  const weeklyProgress = getProgressPercentage(
    stats.totalWorkouts,
    stats.weeklyGoal,
  );
  const monthlyProgress = getProgressPercentage(
    stats.challengesCompleted,
    stats.monthlyGoal,
  );
  const teamEngagement = getProgressPercentage(
    stats.activeAthletes,
    stats.totalAthletes,
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Progression collective
          </h2>
          <p className="text-gray-400 text-sm">
            Vue d&apos;ensemble de l&apos;équipe • {stats.activeAthletes}/
            {stats.totalAthletes} athlètes actifs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-neon-yellow" />
          <span className="text-sm text-gray-400">Équipe</span>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* XP Total */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-neon-purple" />
            <span className="text-sm text-gray-400">XP Total</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumberWithSeparators(stats.totalXP, 0)}
          </div>
          <div className="text-xs text-gray-400">Points d&apos;expérience</div>
        </div>

        {/* Challenges Complétés */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-gray-400">Challenges</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.challengesCompleted}
          </div>
          <div className="text-xs text-gray-400">Complétés ce mois</div>
        </div>

        {/* Entraînements Totaux */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm text-gray-400">Entraînements</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.totalWorkouts}
          </div>
          <div className="text-xs text-gray-400">Cette semaine</div>
        </div>

        {/* Calories Totales */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-neon-pink" />
            <span className="text-sm text-gray-400">Calories</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumberWithSeparators(stats.totalCalories, 0)}
          </div>
          <div className="text-xs text-gray-400">Brûlées aujourd&apos;hui</div>
        </div>
      </div>

      {/* Objectifs et Progression */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Objectif Hebdomadaire */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm font-medium text-white">
                Objectif hebdomadaire
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs ${getProgressColor(weeklyProgress)}`}
            >
              {formatPercentage(weeklyProgress, 0)}
            </span>
          </div>
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Entraînements</span>
              <span className="text-white">
                {stats.totalWorkouts} / {stats.weeklyGoal}
              </span>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                weeklyProgress >= 80
                  ? 'bg-neon-green'
                  : weeklyProgress >= 60
                    ? 'bg-neon-yellow'
                    : weeklyProgress >= 40
                      ? 'bg-orange-400'
                      : 'bg-neon-red'
              }`}
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>

        {/* Objectif Mensuel */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-neon-yellow" />
              <span className="text-sm font-medium text-white">
                Objectif mensuel
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs ${getProgressColor(monthlyProgress)}`}
            >
              {formatPercentage(monthlyProgress, 0)}
            </span>
          </div>
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Challenges</span>
              <span className="text-white">
                {stats.challengesCompleted} / {stats.monthlyGoal}
              </span>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                monthlyProgress >= 80
                  ? 'bg-neon-green'
                  : monthlyProgress >= 60
                    ? 'bg-neon-yellow'
                    : monthlyProgress >= 40
                      ? 'bg-orange-400'
                      : 'bg-neon-red'
              }`}
              style={{ width: `${monthlyProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Engagement de l'équipe */}
      <div className="glass-effect p-4 rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neon-purple" />
            <span className="text-sm font-medium text-white">
              Engagement de l&apos;équipe
            </span>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs ${getProgressColor(teamEngagement)}`}
          >
            {formatPercentage(teamEngagement, 0)}
          </span>
        </div>
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Athlètes actifs</span>
            <span className="text-white">
              {stats.activeAthletes} / {stats.totalAthletes}
            </span>
          </div>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              teamEngagement >= 80
                ? 'bg-neon-green'
                : teamEngagement >= 60
                  ? 'bg-neon-yellow'
                  : teamEngagement >= 40
                    ? 'bg-orange-400'
                    : 'bg-neon-red'
            }`}
            style={{ width: `${teamEngagement}%` }}
          />
        </div>
      </div>

      {/* Progression moyenne */}
      <div className="glass-effect p-4 rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neon-green" />
            <span className="text-sm font-medium text-white">
              Progression moyenne
            </span>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs ${getProgressColor(stats.averageProgress)}`}
          >
            {formatPercentage(stats.averageProgress, 0)}
          </span>
        </div>
        <div className="text-sm text-gray-400 mb-2">
          Moyenne des progressions individuelles
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              stats.averageProgress >= 80
                ? 'bg-neon-green'
                : stats.averageProgress >= 60
                  ? 'bg-neon-yellow'
                  : stats.averageProgress >= 40
                    ? 'bg-orange-400'
                    : 'bg-neon-red'
            }`}
            style={{ width: `${stats.averageProgress}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="text-sm text-gray-400">
          Données mises à jour en temps réel
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Voir les détails
              console.log("Voir les détails de l'équipe");
            }}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Détails
          </button>
          <button
            onClick={onViewDetails}
            className="px-3 py-1 text-xs bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple rounded-lg transition-colors"
          >
            Rapport complet
          </button>
        </div>
      </div>
    </div>
  );
}
