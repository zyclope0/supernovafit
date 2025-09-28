'use client';

import React from 'react';
import { Heart, Zap, Moon } from 'lucide-react';
import ProgressHeader from '@/components/ui/ProgressHeader';

interface JournalData {
  current: number;
  target: number;
  unit: string;
}

interface JournalProgressHeaderProps {
  entries: JournalData;
  avgMood: JournalData;
  avgEnergy: JournalData;
  sleepHours: JournalData;
  period: 'today' | 'week' | 'month';
  onPeriodChange: (period: 'today' | 'week' | 'month') => void;
  smartAdvice?: string;
}

export default function JournalProgressHeader({
  entries,
  avgMood,
  avgEnergy,
  sleepHours,
  period,
  onPeriodChange,
  smartAdvice,
}: JournalProgressHeaderProps) {
  // Générer un conseil intelligent basé sur les données
  const generateSmartAdvice = () => {
    if (smartAdvice) return smartAdvice;

    const entriesPercent = (entries.current / entries.target) * 100;
    const moodPercent = (avgMood.current / avgMood.target) * 100;
    const energyPercent = (avgEnergy.current / avgEnergy.target) * 100;
    const sleepPercent = (sleepHours.current / sleepHours.target) * 100;

    if (entriesPercent < 30 && period === 'week') {
      return 'Pense à tenir ton journal plus régulièrement pour mieux suivre ton bien-être';
    }
    if (sleepPercent < 70) {
      return 'Un sommeil de qualité améliorerait ton énergie et ton humeur';
    }
    if (moodPercent < 50 && period === 'week') {
      return "Essaie d'identifier les activités qui boostent ton moral";
    }
    if (energyPercent < 50 && sleepPercent > 80) {
      return 'Malgré un bon sommeil, ton énergie est faible. Vérifie ton alimentation et ton activité';
    }
    if (moodPercent > 80 && energyPercent > 80) {
      return "Excellent état d'esprit ! Continue sur cette lancée";
    }

    return 'Chaque jour compte pour ton bien-être. Continue tes efforts !';
  };

  const items = [
    {
      icon: <Heart className="h-4 w-4" />,
      label: 'Entrées',
      data: entries,
      color: 'purple',
    },
    {
      icon: <Heart className="h-4 w-4" />,
      label: 'Humeur moy',
      data: avgMood,
      color: 'pink',
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: 'Énergie moy',
      data: avgEnergy,
      color: 'yellow',
    },
    {
      icon: <Moon className="h-4 w-4" />,
      label: 'Sommeil',
      data: sleepHours,
      color: 'blue',
    },
  ];

  return (
    <ProgressHeader
      title="BIEN-ÊTRE"
      emoji="🧘"
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
