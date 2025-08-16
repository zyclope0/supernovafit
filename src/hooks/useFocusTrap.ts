import { useEffect, useRef } from 'react'

/**
 * Hook pour implémenter un focus trap dans les modals
 * Garde le focus à l'intérieur de l'élément référencé
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    // Focus sur le premier élément
    const timer = setTimeout(() => {
      firstFocusable?.focus()
    }, 100)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      // Si Shift+Tab sur le premier élément, aller au dernier
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable?.focus()
      }
      // Si Tab sur le dernier élément, aller au premier
      else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable?.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
    }
  }, [isActive])

  return containerRef
}
