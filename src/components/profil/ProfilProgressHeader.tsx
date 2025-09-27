'use client'

import React from 'react'
// Composant spécialisé pour le profil utilisant ProgressHeader universel
import ProgressHeader from '@/components/ui/ProgressHeader'

interface ProfilData {
  current: number
  target: number
  unit: string
}

interface ProfilProgressHeaderProps {
  title: string
  emoji: string
  period: 'today' | 'week' | 'month'
  onPeriodChange: (period: 'today' | 'week' | 'month') => void
  items: {
    icon: React.ReactNode
    label: string
    data: ProfilData
    color: 'purple' | 'cyan' | 'green' | 'pink' | 'yellow' | 'orange' | 'red'
  }[]
  advice?: string
}

export default function ProfilProgressHeader({
  title,
  emoji,
  period,
  onPeriodChange,
  items,
  advice
}: ProfilProgressHeaderProps) {
  return (
    <ProgressHeader
      title={title}
      emoji={emoji}
      period={period}
      onPeriodChange={onPeriodChange}
      items={items}
      advice={advice}
      showPeriodSelector={false} // Pas de sélecteur de période pour le profil
      periodLabels={{
        today: 'Aujourd\'hui',
        week: 'Semaine',
        month: 'Mois'
      }}
    />
  )
}
