'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwipeAction {
  id: string
  label: string
  icon: React.ElementType
  color: 'danger' | 'warning' | 'success' | 'primary' | 'secondary'
  action: () => void
}

interface SwipeableCardProps {
  children: ReactNode
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  onSwipe?: (direction: 'left' | 'right', actionId?: string) => void
  disabled?: boolean
  className?: string
}

const ACTION_COLORS = {
  danger: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-black',
  success: 'bg-green-500 text-white',
  primary: 'bg-blue-500 text-white',
  secondary: 'bg-gray-500 text-white'
}

export default function SwipeableCard({
  children,
  leftActions = [],
  rightActions = [
    {
      id: 'delete',
      label: 'Supprimer',
      icon: Trash2,
      color: 'danger',
      action: () => console.log('Delete action')
    }
  ],
  onSwipe,
  disabled = false,
  className
}: SwipeableCardProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isSwipeActive, setIsSwipeActive] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const currentX = useRef(0)

  const SWIPE_THRESHOLD = 80
  const MAX_SWIPE = 120

  useEffect(() => {
    const element = cardRef.current
    if (!element || disabled) return

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
      setIsSwipeActive(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwipeActive) return
      
      currentX.current = e.touches[0].clientX
      const deltaX = currentX.current - startX.current
      
      // Limiter le swipe
      const limitedDelta = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX))
      setTranslateX(limitedDelta)
      
      // Déterminer la direction
      if (Math.abs(limitedDelta) > 20) {
        setSwipeDirection(limitedDelta > 0 ? 'right' : 'left')
      } else {
        setSwipeDirection(null)
      }
    }

    const handleTouchEnd = () => {
      setIsSwipeActive(false)
      
      const finalDelta = translateX
      
      if (Math.abs(finalDelta) > SWIPE_THRESHOLD) {
        // Swipe validé
        const direction = finalDelta > 0 ? 'right' : 'left'
        const actions = direction === 'right' ? leftActions : rightActions
        
        if (actions.length > 0) {
          // Exécuter la première action par défaut
          actions[0].action()
          onSwipe?.(direction, actions[0].id)
        }
      }
      
      // Reset position
      setTranslateX(0)
      setSwipeDirection(null)
    }

    // Mouse events pour le développement desktop
    const handleMouseDown = (e: MouseEvent) => {
      startX.current = e.clientX
      setIsSwipeActive(true)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSwipeActive) return
      
      currentX.current = e.clientX
      const deltaX = currentX.current - startX.current
      const limitedDelta = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX))
      setTranslateX(limitedDelta)
      
      if (Math.abs(limitedDelta) > 20) {
        setSwipeDirection(limitedDelta > 0 ? 'right' : 'left')
      } else {
        setSwipeDirection(null)
      }
    }

    const handleMouseUp = () => {
      if (!isSwipeActive) return
      
      const finalDelta = translateX
      
      if (Math.abs(finalDelta) > SWIPE_THRESHOLD) {
        const direction = finalDelta > 0 ? 'right' : 'left'
        const actions = direction === 'right' ? leftActions : rightActions
        
        if (actions.length > 0) {
          actions[0].action()
          onSwipe?.(direction, actions[0].id)
        }
      }
      
      setIsSwipeActive(false)
      setTranslateX(0)
      setSwipeDirection(null)
    }

    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    // Mouse events (pour développement)
    element.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isSwipeActive, translateX, leftActions, rightActions, onSwipe, disabled])

  const getActionColor = (color: string) => ACTION_COLORS[color as keyof typeof ACTION_COLORS]

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center">
          {leftActions.map((action) => {
            const Icon = action.icon
            const isVisible = swipeDirection === 'right' && Math.abs(translateX) > 40
            
            return (
              <div
                key={action.id}
                className={cn(
                  'flex items-center justify-center w-20 h-full transition-all duration-200',
                  getActionColor(action.color),
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                )}
                style={{ transform: `translateX(${Math.max(0, translateX - 80)}px)` }}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          {rightActions.map((action) => {
            const Icon = action.icon
            const isVisible = swipeDirection === 'left' && Math.abs(translateX) > 40
            
            return (
              <div
                key={action.id}
                className={cn(
                  'flex items-center justify-center w-20 h-full transition-all duration-200',
                  getActionColor(action.color),
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                )}
                style={{ transform: `translateX(${Math.min(0, translateX + 80)}px)` }}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Main Card Content */}
      <div
        ref={cardRef}
        className={cn(
          'relative z-10 transition-transform duration-200 ease-out touch-pan-y',
          isSwipeActive && 'transition-none',
          Math.abs(translateX) > SWIPE_THRESHOLD && 'shadow-lg'
        )}
        style={{ 
          transform: `translateX(${translateX}px)`,
          cursor: disabled ? 'default' : 'grab'
        }}
      >
        {children}
      </div>

      {/* Swipe Indicator */}
      {Math.abs(translateX) > 20 && (
        <div className="absolute top-2 right-2 z-20">
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all',
            swipeDirection === 'left' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          )}>
            {Math.abs(translateX) > SWIPE_THRESHOLD ? '✓' : Math.round(Math.abs(translateX))}
          </div>
        </div>
      )}

      {/* Touch Hint (première utilisation) */}
      {!disabled && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 md:hidden">
          <div className="px-2 py-1 bg-black/60 rounded-full text-xs text-white/60 animate-pulse">
            ← Swipe →
          </div>
        </div>
      )}
    </div>
  )
}
