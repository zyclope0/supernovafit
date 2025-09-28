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
}

export default function MesuresProgressHeader({
  mesures,
  stats
}: MesuresProgressHeaderProps) {
  
  // Fonction pour déterminer la couleur selon les zones OMS
  const getHealthZoneColor = (type: 'weight' | 'imc' | 'bodyfat', value: number) => {
    switch (type) {
      case 'weight':
        if (!stats) return 'gray'
        if (value >= stats.poids_ideal_min && value <= stats.poids_ideal_max) return 'green'
        if (value < stats.poids_ideal_min * 0.9 || value > stats.poids_ideal_max * 1.1) return 'red'
        return 'yellow'
      
      case 'imc':
        if (value >= 18.5 && value < 25) return 'green'      // Normal
        if (value >= 25 && value < 30) return 'yellow'       // Surpoids
        if (value >= 30) return 'red'                        // Obésité
        return 'blue'                                        // Sous-poids
      
      case 'bodyfat':
        if (value >= 10 && value <= 20) return 'green'       // Normal
        if (value > 20 && value <= 25) return 'yellow'       // Élevé
        if (value > 25) return 'red'                         // Très élevé
        return 'blue'                                        // Très bas
      
      default:
        return 'gray'
    }
  }

  // Calculer les métriques avec logique de zones de santé
  const progressItems = [
    {
      icon: <span className="text-2xl">⚖️</span>,
      label: 'Poids',
      data: {
        current: mesures.length > 0 ? (mesures[0].poids || 0) : 0,
        target: stats ? stats.poids_ideal_max : 80,
        unit: 'kg'
      },
      color: getHealthZoneColor('weight', mesures.length > 0 ? (mesures[0].poids || 0) : 0)
    },
    {
      icon: <span className="text-2xl">📏</span>,
      label: 'IMC',
      data: {
        current: stats ? stats.imc : 0,
        target: 25, // IMC normal maximum
        unit: ''
      },
      color: getHealthZoneColor('imc', stats ? stats.imc : 0)
    },
    {
      icon: <span className="text-2xl">💪</span>,
      label: 'Masse grasse',
      data: {
        current: mesures.length > 0 ? (mesures[0].masse_grasse || 0) : 0,
        target: 20, // Objectif masse grasse
        unit: '%'
      },
      color: getHealthZoneColor('bodyfat', mesures.length > 0 ? (mesures[0].masse_grasse || 0) : 0)
    },
    {
      icon: <span className="text-2xl">📊</span>,
      label: 'Mesures',
      data: {
        current: mesures.length,
        target: 10, // Objectif nombre de mesures
        unit: ''
      },
      color: mesures.length >= 10 ? 'green' : mesures.length >= 5 ? 'yellow' : 'red'
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
      period="week" // Période fixe - pas de sélecteur
      onPeriodChange={() => {}} // Fonction vide - pas de changement
      items={progressItems}
      advice={getIntelligentAdvice()}
    />
  )
}