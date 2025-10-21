'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressData {
  current: number;
  target: number;
  unit: string;
}

interface ProgressItemProps {
  icon: React.ReactNode;
  label: string;
  data: ProgressData;
  color: string;
}

interface ProgressHeaderProps {
  title: string;
  emoji: string;
  period: 'today' | 'week' | 'month';
  onPeriodChange: (period: 'today' | 'week' | 'month') => void;
  items: ProgressItemProps[];
  advice?: string;
  periodLabels?: {
    today: string;
    week: string;
    month: string;
  };
  showPeriodSelector?: boolean; // NEW: Control period selector visibility
  extraContent?: React.ReactNode; // NEW: Extra content in header
}

function ProgressItem({ icon, label, data, color }: ProgressItemProps) {
  // Si pas d'objectif (target = 0), afficher seulement le nombre
  const hasTarget = data.target > 0;
  const percentage = hasTarget
    ? Math.min((data.current / data.target) * 100, 100)
    : 0;
  const remaining = hasTarget ? Math.max(data.target - data.current, 0) : 0;

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex items-center gap-2 min-w-[80px] sm:min-w-[120px] text-${color}-400`}
      >
        {icon}
        <span className="text-sm font-medium text-white">{label}</span>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white">
            <span className="font-semibold">{data.current}</span>
            {hasTarget && (
              <span className="text-gray-400">
                /{data.target}
                {data.unit}
              </span>
            )}
            {!hasTarget && data.unit && (
              <span className="text-gray-400">{data.unit}</span>
            )}
          </span>
          {hasTarget && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                percentage >= 100
                  ? 'bg-red-500/20 text-red-400'
                  : percentage >= 80
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : percentage >= 50
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {Math.round(percentage)}%
            </span>
          )}
        </div>

        {hasTarget && (
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mt-2">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
                // Couleurs standard
                color === 'orange' && 'from-orange-500 to-orange-400',
                color === 'blue' && 'from-blue-500 to-blue-400',
                color === 'red' && 'from-red-500 to-red-400',
                color === 'purple' && 'from-purple-500 to-purple-400',
                color === 'green' && 'from-green-500 to-green-400',
                color === 'cyan' && 'from-cyan-500 to-cyan-400',
                color === 'pink' && 'from-pink-500 to-pink-400',
                color === 'yellow' && 'from-yellow-500 to-yellow-400',
                // Couleurs neon (pour compatibilité)
                color === 'neon-green' && 'from-neon-green to-neon-green/80',
                color === 'neon-cyan' && 'from-neon-cyan to-neon-cyan/80',
                color === 'neon-yellow' && 'from-neon-yellow to-neon-yellow/80',
                color === 'neon-pink' && 'from-neon-pink to-neon-pink/80',
                color === 'neon-purple' && 'from-neon-purple to-neon-purple/80',
                color === 'neon-orange' && 'from-neon-orange to-neon-orange/80',
                color === 'neon-red' && 'from-neon-red to-neon-red/80',
                color === 'neon-blue' && 'from-neon-blue to-neon-blue/80',
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}

        {hasTarget && remaining > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            reste {remaining}
            {data.unit}
          </p>
        )}

        {!hasTarget && data.current > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {data.current > 1
              ? `${Math.round(data.current / 4)} par mois`
              : '1ère mesure'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProgressHeader({
  title,
  emoji,
  period,
  onPeriodChange,
  items,
  advice,
  periodLabels = {
    today: "Aujourd'hui",
    week: 'Semaine',
    month: 'Mois',
  },
  showPeriodSelector = true, // NEW: Default to true for backward compatibility
  extraContent, // NEW: Extra content prop
}: ProgressHeaderProps) {
  return (
    <div className="glass-effect rounded-xl p-3 sm:p-4 lg:p-6 border border-white/10">
      {/* Header avec toggle période */}
      <div className="flex items-center justify-between mb-4 gap-2 overflow-x-hidden">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <TrendingUp className="h-5 w-5 text-neon-orange flex-shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold text-white truncate">
            {emoji} {title} {period.toUpperCase()}
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {extraContent} {/* NEW: Render extra content */}
          {showPeriodSelector && ( // NEW: Conditional period selector
            <div className="hidden sm:flex bg-space-800 rounded-lg p-1">
              <button
                onClick={() => onPeriodChange('today')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-all whitespace-nowrap ${
                  period === 'today'
                    ? 'bg-neon-orange text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label={`Filtrer par ${periodLabels.today}`}
                aria-pressed={period === 'today'}
              >
                {periodLabels.today}
              </button>
              <button
                onClick={() => onPeriodChange('week')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-all whitespace-nowrap ${
                  period === 'week'
                    ? 'bg-neon-orange text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label={`Filtrer par ${periodLabels.week}`}
                aria-pressed={period === 'week'}
              >
                {periodLabels.week}
              </button>
              <button
                onClick={() => onPeriodChange('month')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-all whitespace-nowrap ${
                  period === 'month'
                    ? 'bg-neon-orange text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label={`Filtrer par ${periodLabels.month}`}
                aria-pressed={period === 'month'}
              >
                {periodLabels.month}
              </button>
            </div>
          )}{' '}
          {/* NEW: Close conditional period selector */}
        </div>
      </div>

      {/* Métriques avec barres de progression */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <ProgressItem key={index} {...item} />
        ))}
      </div>

      {/* Conseil intelligent */}
      {advice && (
        <div className="mt-4 p-3 bg-neon-orange/10 border border-neon-orange/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-neon-orange/20 rounded-full flex items-center justify-center">
              💡
            </div>
            <div>
              <p className="text-sm font-medium text-neon-orange mb-1">
                Conseil intelligent
              </p>
              <p className="text-sm text-gray-300">{advice}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
