'use client';

import React from 'react';
import ProgressHeader from '@/components/ui/ProgressHeader';
import { Mesure } from '@/types';

interface MesuresProgressHeaderProps {
  mesures: Mesure[];
  stats: {
    imc: number;
    evolution_poids: number;
    evolution_masse_grasse: number;
    poids_ideal_min: number;
    poids_ideal_max: number;
  } | null;
}

export default function MesuresProgressHeader({
  mesures,
  stats,
}: MesuresProgressHeaderProps) {
  // Fonction pour déterminer la couleur selon les zones OMS
  const getHealthZoneColor = (type: 'weight' | 'imc' | 'bodyfat', current: number, target: number) => {
    const ratio = current / target;
    
    if (type === 'weight') {
      // Zones OMS pour le poids (ratio par rapport au poids idéal max)
      if (ratio <= 0.9) return 'blue'; // Sous-poids
      if (ratio <= 1.0) return 'green'; // Normal
      if (ratio <= 1.1) return 'yellow'; // Surpoids léger
      return 'red'; // Surpoids important
    }
    
    if (type === 'imc') {
      // Zones OMS pour l'IMC
      if (current < 18.5) return 'blue'; // Sous-poids
      if (current <= 25) return 'green'; // Normal
      if (current <= 30) return 'yellow'; // Surpoids
      return 'red'; // Obésité
    }
    
    if (type === 'bodyfat') {
      // Zones pour la masse grasse
      if (current <= 15) return 'green'; // Excellent
      if (current <= 20) return 'yellow'; // Bon
      if (current <= 25) return 'orange'; // Acceptable
      return 'red'; // Élevé
    }
    
    return 'gray';
  };

  // Calculer les métriques pour les barres de progression
  const currentWeight = mesures.length > 0 ? mesures[0].poids || 0 : 0;
  const currentIMC = stats ? stats.imc : 0;
  const currentBodyFat = mesures.length > 0 ? mesures[0].masse_grasse || 0 : 0;
  
  const progressItems = [
    {
      icon: <span className="text-2xl">⚖️</span>,
      label: 'Poids',
      data: {
        current: currentWeight,
        target: stats ? stats.poids_ideal_max : 80,
        unit: 'kg',
      },
      color: getHealthZoneColor('weight', currentWeight, stats ? stats.poids_ideal_max : 80),
    },
    {
      icon: <span className="text-2xl">📏</span>,
      label: 'IMC',
      data: {
        current: currentIMC,
        target: 25, // IMC normal maximum
        unit: '',
      },
      color: getHealthZoneColor('imc', currentIMC, 25),
    },
    {
      icon: <span className="text-2xl">💪</span>,
      label: 'Masse grasse',
      data: {
        current: currentBodyFat,
        target: 20, // Objectif masse grasse
        unit: '%',
      },
      color: getHealthZoneColor('bodyfat', currentBodyFat, 20),
    },
    {
      icon: <span className="text-2xl">📊</span>,
      label: 'Mesures',
      data: {
        current: mesures.length,
        target: 0, // Pas de barre de progression
        unit: '',
      },
      color: 'gray' as const,
    },
  ];

  // Conseil intelligent basé sur les données
  const getIntelligentAdvice = () => {
    if (!stats || mesures.length === 0) {
      return 'Ajoutez vos premières mesures pour obtenir des conseils personnalisés.';
    }

    const currentWeight = mesures[0].poids || 0;
    const weightStatus =
      currentWeight > stats.poids_ideal_max
        ? `Votre poids (${currentWeight}kg) est au-dessus de la fourchette normale (${stats.poids_ideal_min}-${stats.poids_ideal_max}kg).`
        : currentWeight < stats.poids_ideal_min
          ? `Votre poids (${currentWeight}kg) est en-dessous de la fourchette normale (${stats.poids_ideal_min}-${stats.poids_ideal_max}kg).`
          : `Votre poids (${currentWeight}kg) est dans la fourchette normale (${stats.poids_ideal_min}-${stats.poids_ideal_max}kg).`;

    const evolution =
      stats.evolution_poids > 0
        ? `Vous avez pris ${stats.evolution_poids.toFixed(1)}kg.`
        : stats.evolution_poids < 0
          ? `Vous avez perdu ${Math.abs(stats.evolution_poids).toFixed(1)}kg.`
          : 'Votre poids est stable.';

    return `${weightStatus} ${evolution}`;
  };

  return (
    <ProgressHeader
      title="MESURES"
      emoji="📏"
      period="today"
      onPeriodChange={() => {}} // Pas de changement de période
      items={progressItems}
      advice={getIntelligentAdvice()}
      showPeriodSelector={false}
    />
  );
}
