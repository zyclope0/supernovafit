'use client'

import React from 'react'
import ClickableCard from './ClickableCard'

interface ExportCardData {
  icon: React.ReactNode
  label: string
  description: string
  color: 'purple' | 'cyan' | 'green' | 'pink' | 'yellow' | 'orange' | 'red'
  bgColor?: string
  borderColor?: string
  iconColor?: string
}

interface ExportCardClickableProps {
  data: ExportCardData
  onView: () => void
  viewLabel?: string
  className?: string
  isSelected?: boolean
}

export default function ExportCardClickable({
  data,
  onView,
  viewLabel = 'Sélectionner',
  className = '',
  isSelected = false
}: ExportCardClickableProps) {
  return (
    <ClickableCard
      onView={onView}
      onEdit={() => {}} // Not applicable for export cards
      onDelete={() => {}} // Not applicable for export cards
      viewLabel={viewLabel}
      className={`cursor-pointer ${className} ${isSelected ? 'ring-2 ring-neon-cyan' : ''}`}
      showActions={false} // Hide edit/delete actions for export cards
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`${data.iconColor || `text-neon-${data.color}`} ${data.bgColor || `bg-neon-${data.color}/10`} p-2 rounded-lg`}>
          {data.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white">{data.label}</h3>
          <p className="text-sm text-muted-foreground">{data.description}</p>
        </div>
      </div>
      
      {isSelected && (
        <div className={`flex items-center gap-2 text-xs ${data.iconColor || `text-neon-${data.color}`}`}>
          <div className={`w-2 h-2 rounded-full ${data.bgColor || `bg-neon-${data.color}/20`}`}></div>
          <span>Sélectionné</span>
        </div>
      )}
    </ClickableCard>
  )
}
