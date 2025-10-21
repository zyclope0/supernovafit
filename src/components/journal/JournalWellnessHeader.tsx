'use client';

import React from 'react';

interface WellnessData {
  current: number;
  target: number;
  unit: string;
}

interface JournalWellnessHeaderProps {
  entries: WellnessData;
  avgMood: WellnessData;
  avgEnergy: WellnessData;
  sleepHours: WellnessData;
  period: 'today' | 'week' | 'month';
  onPeriodChange: (period: 'today' | 'week' | 'month') => void;
  smartAdvice?: string;
}

export default function JournalWellnessHeader({
  entries,
  avgMood,
  avgEnergy,
  sleepHours,
  period,
  onPeriodChange,
  smartAdvice,
}: JournalWellnessHeaderProps) {
  // Générer un conseil bienveillant et personnel (esprit Journal)
  const generateWellnessAdvice = () => {
    if (smartAdvice) return smartAdvice;

    const entriesPercent = (entries.current / entries.target) * 100;
    const moodPercent = (avgMood.current / avgMood.target) * 100;
    const energyPercent = (avgEnergy.current / avgEnergy.target) * 100;
    const sleepPercent = (sleepHours.current / sleepHours.target) * 100;

    // Conseils bienveillants et personnels (esprit Journal)
    if (moodPercent > 80 && energyPercent > 80) {
      return '🌟 Tu rayonnes ! Ton équilibre bien-être est exemplaire';
    }
    if (entriesPercent < 30 && period === 'week') {
      return "📝 Prendre quelques minutes chaque jour pour écrire t'aidera à mieux te connaître";
    }
    if (sleepPercent < 70) {
      return "🌙 Un sommeil réparateur est la clé d'une belle énergie et d'une humeur stable";
    }
    if (moodPercent < 50 && period === 'week') {
      return "🌈 Identifie les petits moments qui t'apportent de la joie au quotidien";
    }
    if (energyPercent < 50 && sleepPercent > 80) {
      return '🌱 Malgré un bon sommeil, explore ton alimentation et ton activité physique';
    }
    if (period === 'today' && avgMood.current === 0) {
      return "✨ Comment te sens-tu aujourd'hui ? Chaque émotion compte";
    }

    return '💫 Chaque jour est une nouvelle opportunité de prendre soin de toi';
  };

  // Items avec esprit émotionnel du journal (émojis au lieu d'icônes)
  const wellnessItems = [
    {
      icon: '📝',
      label: 'Entrées',
      data: entries,
      color: 'purple',
      showProgress: true,
    },
    {
      icon: '😊',
      label: 'Humeur',
      data: avgMood,
      color: 'pink',
      showProgress: false, // Score /10, pas de barre
    },
    {
      icon: '⚡',
      label: 'Énergie',
      data: avgEnergy,
      color: 'yellow',
      showProgress: false, // Score /10, pas de barre
    },
    {
      icon: '🌙',
      label: 'Sommeil',
      data: sleepHours,
      color: 'blue',
      showProgress: true,
    },
  ];

  return (
    <div className="glass-effect rounded-xl p-4 border border-white/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
      {/* Header avec esprit personnel et chaleureux */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧘</span>
          <h2 className="text-lg font-semibold text-white">
            BIEN-ÊTRE{' '}
            {period === 'today'
              ? "AUJOURD'HUI"
              : period === 'week'
                ? 'CETTE SEMAINE'
                : 'CE MOIS'}
          </h2>
        </div>

        <div className="hidden sm:flex bg-space-800/50 rounded-lg p-1 backdrop-blur-sm">
          <button
            onClick={() => onPeriodChange('today')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${
              period === 'today'
                ? 'bg-neon-purple/30 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => onPeriodChange('week')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${
              period === 'week'
                ? 'bg-neon-purple/30 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => onPeriodChange('month')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${
              period === 'month'
                ? 'bg-neon-purple/30 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Mois
          </button>
        </div>
      </div>

      {/* Métriques bien-être avec design émotionnel (préserve l'esprit Journal) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {wellnessItems.map((item, index) => {
          const percentage = item.showProgress
            ? Math.min((item.data.current / item.data.target) * 100, 100)
            : 0;
          const isComplete = item.data.current >= item.data.target;

          return (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl">{item.icon}</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {item.data.current}
                {item.data.unit}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {item.label}
              </div>

              {item.showProgress && (
                <div className="w-full bg-space-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 bg-gradient-to-r ${
                      item.color === 'purple'
                        ? 'from-purple-500 to-purple-400'
                        : item.color === 'pink'
                          ? 'from-pink-500 to-pink-400'
                          : item.color === 'yellow'
                            ? 'from-yellow-500 to-yellow-400'
                            : 'from-blue-500 to-blue-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}

              {isComplete && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-neon-green/20 text-neon-green rounded-full text-xs">
                  ✅
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Conseil bienveillant avec design chaleureux (esprit Journal) */}
      <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            💡
          </div>
          <div>
            <p className="text-sm font-medium text-purple-300 mb-1">
              Conseil bien-être
            </p>
            <p className="text-sm text-gray-300">{generateWellnessAdvice()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
