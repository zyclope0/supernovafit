'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface TrendIndicatorProps {
  value: number
  unit: string
  period: '7j' | '30j' | '90j'
  trend: 'up' | 'down' | 'stable'
  className?: string
}

export default function TrendIndicator({
  value,
  unit,
  period,
  trend,
  className = ''
}: TrendIndicatorProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      case 'stable': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      case 'stable': return '→'
      default: return '→'
    }
  }
  
  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'up': return 'Hausse'
      case 'down': return 'Baisse'
      case 'stable': return 'Stable'
      default: return 'Stable'
    }
  }
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm">{getTrendIcon(trend)}</span>
      <span className={cn("text-sm font-medium", getTrendColor(trend))}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}{unit}
      </span>
      <span className="text-xs text-gray-400">
        ({period} - {getTrendLabel(trend)})
      </span>
    </div>
  )
}
