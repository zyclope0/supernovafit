import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AccessibleLinkProps {
  href: string
  children: React.ReactNode
  variant?: 'default' | 'neon' | 'ghost' | 'button'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  ariaLabel?: string
  ariaDescribedBy?: string
  showFocusRing?: boolean
  external?: boolean
  className?: string
  onClick?: () => void
}

const AccessibleLink = React.forwardRef<HTMLAnchorElement, AccessibleLinkProps>(
  ({ 
    href, 
    children, 
    variant = 'default', 
    size = 'md', 
    icon, 
    iconPosition = 'left',
    ariaLabel,
    ariaDescribedBy,
    showFocusRing = true,
    external = false,
    className,
    onClick,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus-accessible',
      {
        // Variants
        'text-neon-cyan hover:text-neon-purple underline decoration-dotted underline-offset-4': variant === 'default',
        'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 hover:from-neon-purple/30 hover:to-neon-cyan/30 border border-neon-purple/30 text-white glow-purple': variant === 'neon',
        'text-white/80 hover:text-white hover:bg-white/5': variant === 'ghost',
        'bg-white/10 hover:bg-white/20 border border-white/20 text-white': variant === 'button',
        
        // Sizes
        'text-xs': size === 'sm',
        'text-sm': size === 'md',
        'text-base': size === 'lg',
        
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

    const linkProps = {
      href,
      className: baseClasses,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      onClick,
      ...(external && {
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-describedby': ariaDescribedBy ? `${ariaDescribedBy} external-link` : 'external-link',
      }),
      ...props,
    }

    return (
      <>
        {external && (
          <span id="external-link" className="sr-only">
            (s&apos;ouvre dans un nouvel onglet)
          </span>
        )}
        <Link ref={ref} {...linkProps}>
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
          {external && (
            <span className="ml-1 text-xs" aria-hidden="true">
              ↗
            </span>
          )}
        </Link>
      </>
    )
  }
)

AccessibleLink.displayName = 'AccessibleLink'

export default AccessibleLink
