'use client'

import React from 'react'
import ProgressHeader from '@/components/ui/ProgressHeader'

interface ExportData {
  current: number
  target: number
  unit: string
}

interface ExportProgressHeaderProps {
  title: string
  emoji: string
  items: {
    icon: React.ReactNode
    label: string
    data: ExportData
    color: 'purple' | 'cyan' | 'green' | 'pink' | 'yellow' | 'orange' | 'red'
  }[]
  advice?: string
  lastExportDate?: string // NEW: Add lastExportDate prop
}

export default function ExportProgressHeader({
  title,
  emoji,
  items,
  advice,
  lastExportDate
}: ExportProgressHeaderProps) {
  return (
    <ProgressHeader
      title={title}
      emoji={emoji}
      period="week" // Fixed period, not relevant for export
      onPeriodChange={() => {}} // No-op function
      items={items}
      advice={advice}
      showPeriodSelector={false} // NEW: Hide period selector
      extraContent={ // NEW: Add last export date
        lastExportDate ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-neon-pink">Dernier export:</span>
            <span className="font-medium text-white">{lastExportDate}</span>
          </div>
        ) : null
      }
    />
  )
}
