'use client';

import React from 'react';
import { Trophy, Target, Star, Award } from 'lucide-react';

interface ChallengeStats {
  activeChallenges: number;
  completedChallenges: number;
  totalAchievements: number;
  userLevel?: number;
  userXP?: number;
  nextLevelXP?: number;
}

interface ChallengesProgressHeaderProps {
  title: string;
  emoji: string;
  period: 'today' | 'week' | 'month';
  onPeriodChange: (period: string) => void;
  stats?: ChallengeStats;
}

export default function ChallengesProgressHeader({
  title,
  emoji,
  period,
  onPeriodChange,
  stats,
}: ChallengesProgressHeaderProps) {
  // Générer des conseils intelligents basés sur les stats
  const generateSmartAdvice = (): string => {
    if (!stats) {
      return 'Commencez votre premier challenge pour débloquer votre potentiel !';
    }

    const {
      activeChallenges,
      completedChallenges,
      totalAchievements,
      userLevel,
    } = stats;

    // Conseils basés sur les challenges actifs
    if (activeChallenges === 0) {
      return '💡 Aucun challenge actif. Lancez-vous un défi pour progresser !';
    }

    if (activeChallenges >= 5) {
      return '🔥 Excellent ! Vous avez plusieurs challenges en cours. Gardez le rythme !';
    }

    if (activeChallenges >= 3) {
      return '💪 Bien équilibré ! Vous avez un bon nombre de challenges actifs.';
    }

    // Conseils basés sur les achievements
    if (totalAchievements === 0) {
      return '🎯 Terminez vos premiers challenges pour débloquer des achievements !';
    }

    if (totalAchievements >= 10) {
      return '🏆 Impressionnant ! Vous collectionnez les achievements comme un pro !';
    }

    // Conseils basés sur le niveau
    if (userLevel && userLevel >= 10) {
      return '⭐ Niveau élevé atteint ! Vous êtes un vrai champion des challenges !';
    }

    if (userLevel && userLevel >= 5) {
      return '📈 Niveau intermédiaire ! Continuez sur cette lancée !';
    }

    // Conseils basés sur les challenges terminés
    if (completedChallenges >= 20) {
      return '🎉 Expert des challenges ! Vous avez terminé plus de 20 défis !';
    }

    if (completedChallenges >= 10) {
      return '👏 Très bien ! Vous avez terminé plus de 10 challenges !';
    }

    if (completedChallenges >= 5) {
      return '✨ Bon début ! Vous avez terminé plusieurs challenges !';
    }

    return '🚀 Continuez vos challenges pour progresser et débloquer de nouveaux achievements !';
  };

  // Calculer des objectifs adaptatifs basés sur le niveau
  const getAdaptiveTargets = () => {
    const level = stats?.userLevel || 1;
    return {
      activeChallenges: Math.min(3 + Math.floor(level / 5), 10), // 3 au début, max 10
      completedChallenges: level * 5, // 5 par niveau
      achievements: level * 10, // 10 par niveau
      nextLevel: level + 1, // Prochain niveau
    };
  };

  const targets = getAdaptiveTargets();

  // Calculer les pourcentages
  const getPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const metrics = [
    {
      icon: <Target className="h-5 w-5" />,
      label: 'Actifs',
      current: stats?.activeChallenges || 0,
      target: targets.activeChallenges,
      color: 'green',
      percentage: getPercentage(
        stats?.activeChallenges || 0,
        targets.activeChallenges,
      ),
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: 'Terminés',
      current: stats?.completedChallenges || 0,
      target: targets.completedChallenges,
      color: 'cyan',
      percentage: getPercentage(
        stats?.completedChallenges || 0,
        targets.completedChallenges,
      ),
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: 'Achievements',
      current: stats?.totalAchievements || 0,
      target: targets.achievements,
      color: 'purple',
      percentage: getPercentage(
        stats?.totalAchievements || 0,
        targets.achievements,
      ),
    },
    {
      icon: <Award className="h-5 w-5" />,
      label: 'Niveau',
      current: stats?.userLevel || 1,
      target: targets.nextLevel,
      color: 'pink',
      percentage: stats?.userLevel ? (stats.userLevel % 1) * 100 : 0, // Progression vers le prochain niveau
    },
  ];

  return (
    <div className="glass-effect rounded-xl p-6 mb-6 border border-white/10">
      {/* Header avec titre et emoji */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{emoji}</span>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>

        {/* Sélecteur de période (cohérent avec autres pages) */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex bg-white/10 rounded-lg p-1">
            {[
              { key: 'today', label: "Aujourd'hui", icon: '📅' },
              { key: 'week', label: 'Semaine', icon: '📊' },
              { key: 'month', label: 'Mois', icon: '📈' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => onPeriodChange(p.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  period === p.key
                    ? 'bg-neon-cyan text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-1">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div
              className={`flex items-center gap-2 text-neon-${metric.color}`}
            >
              {metric.icon}
              <span className="text-sm font-medium text-white">
                {metric.label}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white">
                {metric.current}
                <span className="text-sm text-gray-400">/{metric.target}</span>
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full bg-neon-${metric.color}/20 text-neon-${metric.color}`}
              >
                {metric.percentage}%
              </span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 bg-neon-${metric.color}`}
                style={{ width: `${metric.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Conseil intelligent */}
      <div className="bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 rounded-lg p-4 border border-white/10">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-1">💡</span>
          <div>
            <p className="text-sm font-medium text-white mb-1">
              Conseil intelligent
            </p>
            <p className="text-sm text-gray-300">{generateSmartAdvice()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
