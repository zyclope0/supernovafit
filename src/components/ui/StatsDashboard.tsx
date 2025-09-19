'use client'

import React from 'react'

interface StatItem {
  label: string
  value: string | number
  unit?: string
  color: 'green' | 'cyan' | 'purple' | 'pink'
  progress?: number
  maxValue?: number
}

interface StatsDashboardProps {
  stats: StatItem[]
  className?: string
}

const colorMap = {
  green: {
    bg: 'bg-neon-green/10',
    border: 'border-neon-green/20', 
    text: 'text-neon-green',
    progress: 'bg-neon-green'
  },
  cyan: {
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/20',
    text: 'text-neon-cyan', 
    progress: 'bg-neon-cyan'
  },
  purple: {
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/20',
    text: 'text-neon-purple',
    progress: 'bg-neon-purple'
  },
  pink: {
    bg: 'bg-neon-pink/10', 
    border: 'border-neon-pink/20',
    text: 'text-neon-pink',
    progress: 'bg-neon-pink'
  }
}

export default function StatsDashboard({ stats, className = '' }: StatsDashboardProps) {
  return (
    <div className={`glass-effect p-4 sm:p-5 lg:p-6 rounded-xl border border-white/10 bg-gradient-to-r from-neon-purple/5 to-neon-cyan/5 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4">
        {stats.map((stat, index) => {
          const colors = colorMap[stat.color]
          const progressPercent = stat.progress !== undefined 
            ? stat.progress 
            : stat.maxValue 
              ? Math.min((Number(stat.value) / stat.maxValue) * 100, 100)
              : undefined
              
          return (
            <div key={index} className={`text-center p-2 sm:p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
              <div className={`text-2xl font-bold ${colors.text}`}>
                {stat.value}{stat.unit && <span className="text-sm">{stat.unit}</span>}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              {progressPercent !== undefined && (
                <div className="w-full bg-space-700 rounded-full h-1 mt-2">
                  <div 
                    className={`${colors.progress} h-1 rounded-full transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
