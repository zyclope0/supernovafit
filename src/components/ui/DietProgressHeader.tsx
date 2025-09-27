'use client'

import React from 'react'
import ProgressHeader from './ProgressHeader'

interface ProgressItem {
  icon: React.ReactNode
  label: string
  data: {
    current: number
    target: number
    unit: string
  }
  color: string
}

interface DietProgressHeaderProps {
  title: string
  emoji: string
  period: 'today' | 'week' | 'month'
  onPeriodChange: (period: 'today' | 'week' | 'month') => void
  items: ProgressItem[]
  advice?: string
}


export default function DietProgressHeader({ 
  title, 
  emoji, 
  period, 
  onPeriodChange, 
  items, 
  advice 
}: DietProgressHeaderProps) {
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
      periodLabels={{
        today: 'Aujourd\'hui',
        week: 'Semaine',
        month: 'Mois'
      }}
    />
  )
}

