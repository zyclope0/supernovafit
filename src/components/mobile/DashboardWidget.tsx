'use client'

import { useState, useRef } from 'react'
import { GripVertical, Maximize2, Minimize2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardWidgetProps {
  id: string
  title: string
  subtitle?: string
  icon?: React.ElementType
  children: React.ReactNode
  size: 'small' | 'medium' | 'large'
  draggable?: boolean
  collapsible?: boolean
  onReorder?: (widgetId: string, newIndex: number) => void
  onToggleSize?: (widgetId: string) => void
  className?: string
}

export default function DashboardWidget({
  id,
  title,
  subtitle,
  icon: Icon,
  children,
  size = 'medium',
  draggable = true,
  collapsible = false,
  // onReorder, // TODO: À implémenter si nécessaire
  onToggleSize,
  className
}: DashboardWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const dragRef = useRef<HTMLDivElement>(null)

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1 min-h-[120px]'
      case 'medium':
        return 'col-span-1 row-span-2 min-h-[240px] md:col-span-2 md:row-span-1'
      case 'large':
        return 'col-span-1 row-span-3 min-h-[360px] md:col-span-2 md:row-span-2'
      default:
        return 'col-span-1 row-span-1'
    }
  }

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!draggable) return
    
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setDragPosition({ x: clientX, y: clientY })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDragPosition({ x: 0, y: 0 })
  }

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  const toggleSize = () => {
    if (onToggleSize) {
      onToggleSize(id)
    }
  }

  return (
    <div 
      ref={dragRef}
      className={cn(
        'glass-effect rounded-xl border border-white/10 overflow-hidden',
        'transition-all duration-300 ease-in-out',
        getSizeClasses(),
        isDragging && 'scale-105 shadow-2xl z-50 rotate-2',
        isCollapsed && 'row-span-1 min-h-[80px]',
        className
      )}
      style={{
        transform: isDragging 
          ? `translate(${dragPosition.x}px, ${dragPosition.y}px) scale(1.05) rotate(2deg)`
          : 'none'
      }}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {draggable && (
            <button
              onTouchStart={handleDragStart}
              onTouchEnd={handleDragEnd}
              onMouseDown={handleDragStart}
              onMouseUp={handleDragEnd}
              className="p-1 hover:bg-white/10 rounded cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="w-4 h-4 text-white/40" />
            </button>
          )}
          
          {Icon && (
            <Icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{title}</h3>
            {subtitle && (
              <p className="text-xs text-white/60 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Widget Controls */}
        <div className="flex items-center gap-1">
          {onToggleSize && (
            <button
              onClick={toggleSize}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Changer la taille"
            >
              {size === 'large' ? (
                <Minimize2 className="w-4 h-4 text-white/60" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white/60" />
              )}
            </button>
          )}
          
          {collapsible && (
            <button
              onClick={toggleCollapse}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title={isCollapsed ? 'Développer' : 'Réduire'}
            >
              <MoreHorizontal className="w-4 h-4 text-white/60" />
            </button>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className={cn(
        'transition-all duration-300 ease-in-out overflow-hidden',
        isCollapsed ? 'h-0 p-0' : 'h-auto p-3'
      )}>
        {!isCollapsed && children}
      </div>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-400 rounded-xl pointer-events-none" />
      )}
    </div>
  )
}
