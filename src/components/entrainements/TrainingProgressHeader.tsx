'use client';

import React from 'react';
import { Activity, Clock, Flame, Target } from 'lucide-react';
import ProgressHeader from '@/components/ui/ProgressHeader';

interface TrainingData {
  current: number;
  target: number;
  unit: string;
}

interface TrainingProgressHeaderProps {
  sessions: TrainingData;
  duration: TrainingData;
  calories: TrainingData;
  intensity: TrainingData;
  period: 'today' | 'week' | 'month';
  onPeriodChange: (period: 'today' | 'week' | 'month') => void;
  smartAdvice?: string;
}

export default function TrainingProgressHeader({
  sessions,
  duration,
  calories,
  intensity,
  period,
  onPeriodChange,
  smartAdvice,
}: TrainingProgressHeaderProps) {
  // Génère un conseil intelligent basé sur les données d'entraînement
  const generateSmartAdvice = () => {
    if (smartAdvice) return smartAdvice;

    const sessionsPercent = (sessions.current / sessions.target) * 100;
    const durationPercent = (duration.current / duration.target) * 100;
    const caloriesPercent = (calories.current / calories.target) * 100;

    if (sessionsPercent < 30 && period === 'week') {
      return 'Planifie 2-3 séances cette semaine pour maintenir ta progression';
    }
    if (durationPercent < 50 && sessionsPercent > 70) {
      return 'Augmente légèrement la durée de tes séances pour optimiser les bénéfices';
    }
    if (caloriesPercent > 120) {
      return 'Excellente dépense énergétique ! Pense à bien récupérer';
    }
    if (sessionsPercent > 80 && durationPercent > 80) {
      return 'Performance exceptionnelle ! Tu es sur la bonne voie';
    }
    if (sessionsPercent < 20) {
      return "Commence par une séance courte aujourd'hui pour relancer ta motivation";
    }

    return 'Continue tes efforts ! La régularité est la clé du progrès';
  };

  // Convertir les données vers le format ProgressHeader
  const items = [
    {
      icon: <Target className="h-4 w-4" />,
      label: 'Séances',
      data: sessions,
      color: 'orange' as const,
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: 'Durée',
      data: duration,
      color: 'blue' as const,
    },
    {
      icon: <Flame className="h-4 w-4" />,
      label: 'Calories',
      data: calories,
      color: 'red' as const,
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: 'Intensité',
      data: intensity,
      color: 'purple' as const,
    },
  ];

  return (
    <ProgressHeader
      title="PERFORMANCE"
      emoji="🏋️"
      period={period}
      onPeriodChange={onPeriodChange}
      items={items}
      advice={generateSmartAdvice()}
      periodLabels={{
        today: "Aujourd'hui",
        week: 'Semaine',
        month: 'Mois',
      }}
    />
  );
}
