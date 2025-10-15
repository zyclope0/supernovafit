'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProgressItem {
  icon: React.ReactNode;
  label: string;
  data: { current: number; target: number; unit: string };
  color: 'purple' | 'cyan' | 'green' | 'pink' | 'yellow' | 'orange' | 'red';
  trend?: 'up' | 'down' | 'stable';
}

interface CoachAthleteProgressHeaderProps {
  title: string;
  athleteName: string;
  period: 'today' | 'week' | 'month';
  onPeriodChange: (period: string) => void;
  items: ProgressItem[];
  advice: string;
}

export default function CoachAthleteProgressHeader({
  title,
  athleteName,
  period,
  onPeriodChange,
  items,
  advice,
}: CoachAthleteProgressHeaderProps) {
  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
      cyan: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
      green: 'text-neon-green bg-neon-green/10 border-neon-green/20',
      pink: 'text-neon-pink bg-neon-pink/10 border-neon-pink/20',
      yellow: 'text-neon-yellow bg-neon-yellow/10 border-neon-yellow/20',
      orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      red: 'text-neon-red bg-neon-red/10 border-neon-red/20',
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-neon-green" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-neon-red" />;
      default:
        return null;
    }
  };

  return (
    <div className="glass-effect rounded-xl p-6 mb-6 border border-white/10">
      {/* Header avec titre et sélecteur période */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-gray-400 text-sm">Athlète: {athleteName}</p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {items.map((item, index) => {
          const progress =
            item.data.target > 0
              ? (item.data.current / item.data.target) * 100
              : 0;
          const colorClasses = getColorClasses(item.color);

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${colorClasses}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {getTrendIcon(item.trend)}
              </div>

              <div className="mb-2">
                <div className="text-2xl font-bold">
                  {item.data.current} {item.data.unit}
                </div>
                <div className="text-xs opacity-70">
                  Objectif: {item.data.target} {item.data.unit}
                </div>
              </div>

              {/* Barre de progression */}
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    item.color === 'green'
                      ? 'bg-neon-green'
                      : item.color === 'cyan'
                        ? 'bg-neon-cyan'
                        : item.color === 'purple'
                          ? 'bg-neon-purple'
                          : item.color === 'pink'
                            ? 'bg-neon-pink'
                            : item.color === 'yellow'
                              ? 'bg-neon-yellow'
                              : item.color === 'orange'
                                ? 'bg-orange-500'
                                : 'bg-neon-red'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Conseil IA */}
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="text-sm font-medium text-white mb-1">
              Conseil Coach IA
            </h3>
            <p className="text-sm text-gray-300">{advice}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
