'use client'

import React from 'react'
import ProgressHeader from '@/components/ui/ProgressHeader'

interface MesuresProgressData {
  current: number
  target: number
  unit: string
  evolution?: number // Évolution par rapport à la mesure précédente
}

interface MesuresProgressItemProps {
  icon: React.ReactNode
  label: string
  data: MesuresProgressData
  color: string
}

interface MesuresProgressHeaderProps {
  title: string
  emoji: string
  period: 'today' | 'week' | 'month'
  onPeriodChange: (period: 'today' | 'week' | 'month') => void
  items: MesuresProgressItemProps[]
  advice?: string
  periodLabels?: {
    today: string
    week: string
    month: string
  }
}


export default function MesuresProgressHeader({
  title,
  emoji,
  period,
  onPeriodChange,
  items,
  advice,
  periodLabels = {
    today: 'Aujourd\'hui',
    week: 'Semaine', 
    month: 'Mois'
  }
}: MesuresProgressHeaderProps) {
  // Convertir les items vers le format ProgressHeader
  const progressItems = items.map(item => ({
    icon: item.icon,
    label: item.label,
    data: item.data,
    color: item.color
  }))

  return (
    <ProgressHeader
      title={title}
      emoji={emoji}
      period={period}
      onPeriodChange={onPeriodChange}
      items={progressItems}
      advice={advice}
      showPeriodSelector={false} // Pas de sélecteur de période pour les mesures
      periodLabels={periodLabels}
    />
  )
}
