import React from 'react'
import { cn } from '@/lib/utils'

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'default' | 'neon' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  ariaLabel?: string
  ariaDescribedBy?: string
  showFocusRing?: boolean
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    variant = 'default', 
    size = 'md', 
    icon, 
    iconPosition = 'left',
    ariaLabel,
    ariaDescribedBy,
    showFocusRing = true,
    className,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus-accessible',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        // Variants
        'bg-white/10 hover:bg-white/20 border border-white/20 text-white': variant === 'default',
        'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 hover:from-neon-purple/30 hover:to-neon-cyan/30 border border-neon-purple/30 text-white glow-purple': variant === 'neon',
        'bg-transparent hover:bg-white/5 text-white border border-transparent': variant === 'ghost',
        'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300': variant === 'destructive',
        
        // Sizes
        'px-2 py-1 text-xs rounded': size === 'sm',
        'px-4 py-2 text-sm rounded-lg': size === 'md',
        'px-6 py-3 text-base rounded-xl': size === 'lg',
        
        // Focus ring
        'focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-space-900': showFocusRing,
      },
      className
    )

    const iconClasses = cn(
      'transition-colors duration-200',
      {
        'mr-2': iconPosition === 'left',
        'ml-2': iconPosition === 'right',
      }
    )

    return (
      <button
        ref={ref}
        className={baseClasses}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span className={iconClasses} aria-hidden="true">
            {icon}
          </span>
        )}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className={iconClasses} aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

export default AccessibleButton
