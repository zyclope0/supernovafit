'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
    color?: 'purple' | 'cyan' | 'green' | 'pink'
    variant?: 'primary' | 'secondary'
  }
  actions?: Array<{
    label: string
    shortLabel?: string
    onClick: () => void
    icon?: LucideIcon
    color?: 'purple' | 'cyan' | 'green' | 'pink'
    variant?: 'primary' | 'secondary'
  }>
  customContent?: React.ReactNode
  className?: string
}

const colorMap = {
  purple: 'neon-purple',
  cyan: 'neon-cyan', 
  green: 'neon-green',
  pink: 'neon-pink'
}

export default function PageHeader({ 
  title, 
  description, 
  icon: Icon,
  action,
  actions,
  customContent,
  className = ''
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          {Icon && (
            <div className="p-2 rounded-lg bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20">
              <Icon className="h-5 w-5 text-neon-purple" />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold neon-text">{title}</h1>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
      </div>
      
      {/* Custom content (like progress indicators) */}
      {customContent && (
        <div className="flex-shrink-0">
          {customContent}
        </div>
      )}
      
      {/* Single action */}
      {action && !actions && (
        <button
          onClick={action.onClick}
          className={`hidden md:flex px-4 py-2 bg-${colorMap[action.color || 'purple']}/20 text-${colorMap[action.color || 'purple']} rounded-lg font-medium hover:bg-${colorMap[action.color || 'purple']}/30 transition-all duration-200 transform hover:scale-105 items-center gap-2`}
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </button>
      )}
      
      {/* Multiple actions */}
      {actions && (
        <div className="hidden md:flex gap-2">
          {actions.map((actionItem, index) => {
            const ActionIcon = actionItem.icon
            return (
              <button
                key={index}
                onClick={actionItem.onClick}
                className={`px-3 py-2 bg-${colorMap[actionItem.color || 'cyan']}/20 text-${colorMap[actionItem.color || 'cyan']} rounded-lg font-medium hover:bg-${colorMap[actionItem.color || 'cyan']}/30 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-sm`}
              >
                {ActionIcon && <ActionIcon className="h-4 w-4" />}
                <span className="hidden lg:inline">{actionItem.label}</span>
                <span className="lg:hidden">{actionItem.shortLabel || actionItem.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}