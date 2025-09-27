'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useAriaAnnouncer } from '@/hooks/useAriaAnnouncer'

interface StandardModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  height?: 'auto' | '85vh' | '90vh'
  showFooter?: boolean
  footerContent?: React.ReactNode
  headerContent?: React.ReactNode
  onEdit?: () => void
  editLabel?: string
  className?: string
}

export default function StandardModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = '4xl',
  height = '85vh',
  showFooter = false,
  footerContent,
  headerContent,
  onEdit,
  editLabel = 'Modifier',
  className = ''
}: StandardModalProps) {
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    closeOnEscape: true,
    closeOnOutsideClick: false,
    onClose,
    initialFocus: 'button[aria-label="Fermer"]',
    trapFocus: true
  })
  
  const { announceModalState } = useAriaAnnouncer()

  // Announce modal state changes
  useEffect(() => {
    if (isOpen) {
      announceModalState(true, title)
    }
  }, [isOpen, title, announceModalState])

  if (!isOpen) return null

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl'
  }[maxWidth]

  const heightStyle = height === 'auto' ? {} : { height }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={containerRef} 
        className={`bg-space-900 border-2 border-white/70 rounded-xl w-full ${maxWidthClass} overflow-hidden shadow-2xl shadow-white/40 ring-1 ring-white/70 relative flex flex-col ${className}`}
        style={heightStyle}
        role="dialog" 
        aria-modal="true"
        aria-labelledby="standard-modal-title"
        aria-describedby={subtitle ? "modal-subtitle" : undefined}
      >
        {/* Effet de glow subtil - IDENTIQUE à FormModal */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>
        
        {/* Header - IDENTIQUE à FormModal */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {icon && <div className="text-3xl">{icon}</div>}
            <div>
              <h1 id="standard-modal-title" className="text-xl font-semibold text-white">
                {title}
              </h1>
              {subtitle && (
                <div id="modal-subtitle" className="text-sm text-muted-foreground">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {headerContent && (
              <div className="mr-4">
                {headerContent}
              </div>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit()
                  onClose()
                }}
                className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg text-sm hover:bg-neon-cyan/30 transition-all duration-200 transform hover:scale-105 font-medium"
              >
                ✏️ {editLabel}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          {children}
        </div>

        {/* Footer optionnel */}
        {showFooter && footerContent && (
          <div className="relative z-10 border-t border-white/10">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  )
}
