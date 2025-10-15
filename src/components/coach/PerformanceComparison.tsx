'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  BarChart3,
  Info,
} from 'lucide-react';
import FeatureNotImplemented from '@/components/ui/FeatureNotImplemented';
import {
  formatNumber,
  formatPercentage,
  formatCalories,
  formatProteins,
  formatPerformanceVariation,
} from '@/lib/numberUtils';

interface AthletePerformance {
  id: string;
  nom: string;
  email: string;
  stats?: {
    calories_jour: number;
    proteines_jour: number;
    entrainements_semaine: number;
    poids_actuel: number;
    variation_poids: number;
    variation_perf: number;
  };
  rank?: number;
}

interface PerformanceComparisonProps {
  athletes: AthletePerformance[];
  metric:
    | 'calories_jour'
    | 'proteines_jour'
    | 'entrainements_semaine'
    | 'variation_perf'
    | 'variation_poids';
  onMetricChange?: (metric: string) => void;
}

export default function PerformanceComparison({
  athletes,
  metric,
  onMetricChange,
}: PerformanceComparisonProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const metrics = [
    {
      key: 'calories_jour',
      label: 'Calories/jour',
      unit: 'kcal',
      icon: <Target className="w-4 h-4" />,
    },
    {
      key: 'proteines_jour',
      label: 'Protéines/jour',
      unit: 'g',
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      key: 'entrainements_semaine',
      label: 'Entraînements/sem',
      unit: 'sessions',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      key: 'variation_perf',
      label: 'Performance',
      unit: '%',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      key: 'variation_poids',
      label: 'Variation poids',
      unit: '%',
      icon: <TrendingDown className="w-4 h-4" />,
    },
  ];

  const currentMetric = metrics.find((m) => m.key === metric) || metrics[0];

  // Trier les athlètes selon la métrique sélectionnée
  const sortedAthletes = [...athletes].sort((a, b) => {
    const aValue = a.stats?.[metric] || 0;
    const bValue = b.stats?.[metric] || 0;
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  // Calculer les statistiques
  const values = athletes.map((a) => a.stats?.[metric] || 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 2:
        return 'text-gray-300 bg-gray-300/20 border-gray-300/30';
      case 3:
        return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getPerformanceColor = (value: number, maxValue: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return 'text-neon-green';
    if (percentage >= 60) return 'text-neon-yellow';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-neon-red';
  };

  return (
    <div className="space-y-4">
      {/* Header avec sélecteur de métrique */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Comparaison des performances
          </h2>
          <p className="text-gray-400 text-sm">
            Classement par {currentMetric.label.toLowerCase()} •{' '}
            {athletes.length} athlète{athletes.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FeatureNotImplemented
            title="Comparaisons de performance"
            description="Les comparaisons sont actuellement simulées. Implémentation requise pour les vraies analyses."
            category="backend"
            priority="medium"
            estimatedTime="3-4 jours"
            icon={<Info className="w-4 h-4" />}
          />
          <Trophy className="w-5 h-5 text-neon-yellow" />
          <span className="text-sm text-gray-400">Leaderboard</span>
        </div>
      </div>

      {/* Sélecteur de métrique */}
      <div className="flex flex-wrap gap-2">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => onMetricChange?.(m.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              metric === m.key
                ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-neon-green" />
            <span className="text-sm text-gray-400">Meilleur</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(maxValue, metric.includes('variation') ? 1 : 0)}{' '}
            {currentMetric.unit}
          </div>
          <div className="text-xs text-gray-400">
            {sortedAthletes[0]?.nom || 'N/A'}
          </div>
        </div>

        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm text-gray-400">Moyenne</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(avgValue, metric.includes('variation') ? 1 : 0)}{' '}
            {currentMetric.unit}
          </div>
          <div className="text-xs text-gray-400">Équipe</div>
        </div>

        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-neon-red" />
            <span className="text-sm text-gray-400">Plus faible</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(minValue, metric.includes('variation') ? 1 : 0)}{' '}
            {currentMetric.unit}
          </div>
          <div className="text-xs text-gray-400">
            {sortedAthletes[sortedAthletes.length - 1]?.nom || 'N/A'}
          </div>
        </div>
      </div>

      {/* Classement des athlètes */}
      <div className="space-y-2">
        {sortedAthletes.map((athlete, index) => {
          const rank = index + 1;
          const value = athlete.stats?.[metric] || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div
              key={athlete.id}
              className="glass-effect rounded-xl p-4 border border-white/10 hover:border-neon-purple/30 
                         transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Rang */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border ${getRankColor(rank)}`}
                  >
                    <span className="text-sm font-bold">
                      {getRankIcon(rank)}
                    </span>
                  </div>

                  {/* Informations athlète */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-white truncate">
                      {athlete.nom}
                    </h4>
                    <p className="text-sm text-gray-400 truncate">
                      {athlete.email}
                    </p>
                  </div>
                </div>

                {/* Valeur et barre de progression */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div
                      className={`text-xl font-bold ${getPerformanceColor(value, maxValue)}`}
                    >
                      {formatNumber(
                        value,
                        metric.includes('variation') ? 1 : 0,
                      )}{' '}
                      {currentMetric.unit}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatPercentage(percentage, 0)} du meilleur
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        percentage >= 80
                          ? 'bg-neon-green'
                          : percentage >= 60
                            ? 'bg-neon-yellow'
                            : percentage >= 40
                              ? 'bg-orange-400'
                              : 'bg-neon-red'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Métriques supplémentaires */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Calories/jour</span>
                    <span className="text-white font-medium">
                      {formatCalories(athlete.stats?.calories_jour || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Protéines/jour</span>
                    <span className="text-white font-medium">
                      {formatProteins(athlete.stats?.proteines_jour || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Entraînements/sem</span>
                    <span className="text-white font-medium">
                      {athlete.stats?.entrainements_semaine || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Performance</span>
                    <span
                      className={`font-medium ${
                        (athlete.stats?.variation_perf || 0) > 0
                          ? 'text-neon-green'
                          : 'text-neon-red'
                      }`}
                    >
                      {formatPerformanceVariation(
                        athlete.stats?.variation_perf || 0,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="text-sm text-gray-400">
          Classement mis à jour en temps réel
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            {sortOrder === 'desc' ? '↑ Croissant' : '↓ Décroissant'}
          </button>
          <button
            onClick={() => {
              // Exporter le classement
              console.log('Exporter le classement');
            }}
            className="px-3 py-1 text-xs bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple rounded-lg transition-colors"
          >
            Exporter
          </button>
        </div>
      </div>
    </div>
  );
}
