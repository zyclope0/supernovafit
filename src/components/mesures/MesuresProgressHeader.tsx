'use client'

import React from 'react'
import ProgressHeader from '@/components/ui/ProgressHeader'
import { Mesure } from '@/types'

interface MesuresProgressHeaderProps {
  mesures: Mesure[]
  stats: {
    imc: number
    evolution_poids: number
    evolution_masse_grasse: number
    poids_ideal_min: number
    poids_ideal_max: number
  } | null
  period: 'today' | 'week' | 'month'
  onPeriodChange: (period: string) => void
}

export default function MesuresProgressHeader({
  mesures,
  stats,
  period,
  onPeriodChange
}: MesuresProgressHeaderProps) {
  
  // Calculer les métriques pour les barres de progression
  const progressItems = [
    {
      icon: <span className="text-2xl">⚖️</span>,
      label: 'Poids',
      data: {
        current: mesures.length > 0 ? (mesures[0].poids || 0) : 0,
        target: stats ? stats.poids_ideal_max : 80,
        unit: 'kg'
      },
      color: 'cyan' as const
    },
    {
      icon: <span className="text-2xl">📏</span>,
      label: 'IMC',
      data: {
        current: stats ? stats.imc : 0,
        target: 25, // IMC normal maximum
        unit: ''
      },
      color: 'green' as const
    },
    {
      icon: <span className="text-2xl">💪</span>,
      label: 'Masse grasse',
      data: {
        current: mesures.length > 0 ? (mesures[0].masse_grasse || 0) : 0,
        target: 20, // Objectif masse grasse
        unit: '%'
      },
      color: 'pink' as const
    },
    {
      icon: <span className="text-2xl">📊</span>,
      label: 'Mesures',
      data: {
        current: mesures.length,
        target: 10, // Objectif nombre de mesures
        unit: ''
      },
      color: 'purple' as const
    }
  ]

  // Conseil intelligent basé sur les données
  const getIntelligentAdvice = () => {
    if (!stats || mesures.length === 0) {
      return 'Ajoutez vos premières mesures pour obtenir des conseils personnalisés.'
    }

    const currentWeight = mesures[0].poids || 0
    const weightStatus = currentWeight > stats.poids_ideal_max ? 
      `Votre poids (${currentWeight}kg) est au-dessus de la fourchette normale (${stats.poids_ideal_min}-${stats.poids_ideal_max}kg).` :
      currentWeight < stats.poids_ideal_min ?
      `Votre poids (${currentWeight}kg) est en-dessous de la fourchette normale (${stats.poids_ideal_min}-${stats.poids_ideal_max}kg).` :
      `Votre poids (${currentWeight}kg) est dans la fourchette normale (${stats.poids_ideal_min}-${stats.poids_ideal_max}kg).`
    
    const evolution = stats.evolution_poids > 0 ? 
      `Vous avez pris ${stats.evolution_poids.toFixed(1)}kg.` : 
      stats.evolution_poids < 0 ? 
      `Vous avez perdu ${Math.abs(stats.evolution_poids).toFixed(1)}kg.` : 
      'Votre poids est stable.'
    
    return `${weightStatus} ${evolution}`
  }

  return (
    <ProgressHeader
      title="MESURES"
      emoji="📏"
      period={period}
      onPeriodChange={onPeriodChange}
      items={progressItems}
      advice={getIntelligentAdvice()}
    />
  )
}