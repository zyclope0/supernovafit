'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2,
  TrendingUp,
  Eye,
  EyeOff,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileChartProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  allowZoom?: boolean
  allowFullscreen?: boolean
  showLegendToggle?: boolean
  className?: string
  height?: number
}

export default function MobileChart({
  children,
  title,
  subtitle,
  allowZoom = true,
  allowFullscreen = true,
  showLegendToggle = false,
  className,
  height = 300
}: MobileChartProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Gestion du zoom par pinch (mobile)
  useEffect(() => {
    const element = chartRef.current
    if (!element || !allowZoom) return

    let initialDistance = 0
    let currentScale = 1

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        )
      } else if (e.touches.length === 1) {
        setTouchStart({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        })
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        )
        
        const scale = currentDistance / initialDistance
        currentScale = Math.min(Math.max(scale, 0.5), 3)
        
        if (currentScale > 1.2) {
          setIsZoomed(true)
        } else if (currentScale < 0.8) {
          setIsZoomed(false)
        }
      }
    }

    const handleTouchEnd = () => {
      initialDistance = 0
      setTouchStart(null)
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [allowZoom])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      // Entrer en mode plein écran
      document.body.style.overflow = 'hidden'
    } else {
      // Sortir du mode plein écran
      document.body.style.overflow = 'auto'
    }
  }

  const resetZoom = () => {
    setIsZoomed(false)
  }

  return (
    <>
      {/* Chart Container */}
      <div 
        ref={chartRef}
        className={cn(
          'glass-effect rounded-xl border border-white/10 overflow-hidden',
          'transition-all duration-300 ease-in-out',
          isZoomed && 'scale-110 z-10 relative',
          className
        )}
        style={{ height: isFullscreen ? '100vh' : height }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{title}</h3>
            {subtitle && (
              <p className="text-xs text-white/60 truncate">{subtitle}</p>
            )}
          </div>
          
          {/* Mobile Controls */}
          <div className="flex items-center gap-1 md:hidden">
            {showLegendToggle && (
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={showLegend ? 'Masquer légende' : 'Afficher légende'}
              >
                {showLegend ? (
                  <EyeOff className="w-4 h-4 text-white/60" />
                ) : (
                  <Eye className="w-4 h-4 text-white/60" />
                )}
              </button>
            )}
            
            {allowZoom && (
              <button
                onClick={resetZoom}
                className={cn(
                  'p-2 hover:bg-white/10 rounded-lg transition-colors',
                  isZoomed ? 'text-blue-400' : 'text-white/60'
                )}
                title="Reset zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            
            {allowFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Plein écran"
              >
                <Maximize2 className="w-4 h-4 text-white/60" />
              </button>
            )}
          </div>
        </div>

        {/* Chart Content */}
        <div 
          className={cn(
            'p-3 transition-all duration-300',
            isZoomed && 'scale-110',
            isFullscreen && 'h-full flex items-center justify-center'
          )}
          style={{ 
            height: isFullscreen ? 'calc(100vh - 60px)' : height - 60,
            transform: isZoomed ? 'scale(1.2)' : 'scale(1)'
          }}
        >
          {/* Wrapper pour masquer/afficher la légende */}
          <div className={cn(
            'h-full w-full',
            !showLegend && '[&_.recharts-legend]:hidden'
          )}>
            {children}
          </div>
        </div>

        {/* Mobile Touch Hints */}
        {allowZoom && (
          <div className="absolute bottom-2 left-2 md:hidden">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/60 rounded-full text-xs text-white/60">
              <ZoomIn className="w-3 h-3" />
              <span>Pinch to zoom</span>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              {subtitle && (
                <p className="text-sm text-white/60">{subtitle}</p>
              )}
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white/60" />
            </button>
          </div>

          {/* Fullscreen Chart */}
          <div className="flex-1 p-4">
            <div className="h-full w-full">
              {children}
            </div>
          </div>

          {/* Fullscreen Controls */}
          <div className="flex items-center justify-center gap-4 p-4 border-t border-white/10">
            {allowZoom && (
              <>
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                    isZoomed 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  )}
                >
                  {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                  {isZoomed ? 'Zoom Out' : 'Zoom In'}
                </button>
                <button
                  onClick={resetZoom}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/60 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </>
            )}
            
            {showLegendToggle && (
              <button
                onClick={() => setShowLegend(!showLegend)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  showLegend 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                )}
              >
                {showLegend ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Légende
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
