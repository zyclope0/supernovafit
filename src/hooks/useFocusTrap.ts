import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook pour implémenter un focus trap complet dans les modals
 * Conforme WCAG 2.1 AA (critères 2.1.2, 2.4.3)
 * 
 * @param isActive - Si le focus trap est actif
 * @param onEscape - Callback appelé lors d'Escape (optionnel)
 * @param restoreFocus - Si le focus doit être restauré à l'élément précédent (défaut: true)
 * @param initialFocus - Sélecteur pour l'élément à focuser initialement (optionnel)
 */
export function useFocusTrap(
  isActive: boolean, 
  onEscape?: () => void,
  restoreFocus: boolean = true,
  initialFocus?: string
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  // Sélecteur pour tous les éléments focusables
  const focusableSelector = [
    'button:not([disabled])',
    '[href]:not([disabled])', 
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    '[contenteditable="true"]:not([disabled])',
    'audio[controls]:not([disabled])',
    'video[controls]:not([disabled])',
    'details > summary:first-of-type:not([disabled])'
  ].join(', ')

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter(el => {
      // Filtrer les éléments vraiment visibles et focusables
      const style = window.getComputedStyle(el)
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             !el.hasAttribute('aria-hidden') &&
             el.offsetWidth > 0 && 
             el.offsetHeight > 0
    })
  }, [focusableSelector])

  const focusElement = useCallback((element: HTMLElement | null) => {
    if (!element) return
    
    // Scroll l'élément en vue si nécessaire
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest',
      inline: 'nearest' 
    })
    
    element.focus()
    
    // Vérifier que le focus a bien été appliqué
    if (document.activeElement !== element) {
      // Fallback pour les éléments qui ne peuvent pas recevoir le focus
      element.setAttribute('tabindex', '-1')
      element.focus()
    }
  }, [])

  useEffect(() => {
    if (!isActive) {
      // Restaurer le focus à l'élément précédent si demandé
      if (restoreFocus && previousActiveElementRef.current) {
        const timer = setTimeout(() => {
          focusElement(previousActiveElementRef.current)
          previousActiveElementRef.current = null
        }, 0)
        return () => clearTimeout(timer)
      }
      return
    }

    const container = containerRef.current
    if (!container) return

    // Sauvegarder l'élément actuellement focusé
    previousActiveElementRef.current = document.activeElement as HTMLElement

    const focusableElements = getFocusableElements()
    
    if (focusableElements.length === 0) {
      console.warn('useFocusTrap: Aucun élément focusable trouvé dans le conteneur')
      return
    }

    const firstFocusable = focusableElements[0]
    // lastFocusable utilisé dans les commentaires pour clarté du code

    // Focus initial
    const timer = setTimeout(() => {
      if (initialFocus) {
        const customElement = container.querySelector<HTMLElement>(initialFocus)
        if (customElement && focusableElements.includes(customElement)) {
          focusElement(customElement)
          return
        }
      }
      focusElement(firstFocusable)
    }, 100)

    const handleKeyDown = (e: KeyboardEvent) => {
      // Gestion d'Escape
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onEscape?.()
        return
      }

      // Gestion de Tab pour le focus trap
      if (e.key === 'Tab') {
        const currentFocusableElements = getFocusableElements()
        const currentIndex = currentFocusableElements.indexOf(document.activeElement as HTMLElement)
        
        if (e.shiftKey) {
          // Shift+Tab - aller vers l'arrière
          if (currentIndex <= 0) {
            e.preventDefault()
            focusElement(currentFocusableElements[currentFocusableElements.length - 1])
          }
        } else {
          // Tab - aller vers l'avant
          if (currentIndex >= currentFocusableElements.length - 1) {
            e.preventDefault()
            focusElement(currentFocusableElements[0])
          }
        }
      }

      // Gestion des flèches pour navigation alternative (optionnel)
      if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault()
        const currentFocusableElements = getFocusableElements()
        const currentIndex = currentFocusableElements.indexOf(document.activeElement as HTMLElement)
        const nextIndex = (currentIndex + 1) % currentFocusableElements.length
        focusElement(currentFocusableElements[nextIndex])
      }
      
      if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault()
        const currentFocusableElements = getFocusableElements()
        const currentIndex = currentFocusableElements.indexOf(document.activeElement as HTMLElement)
        const prevIndex = currentIndex <= 0 ? currentFocusableElements.length - 1 : currentIndex - 1
        focusElement(currentFocusableElements[prevIndex])
      }
    }

    // Attacher les événements
    document.addEventListener('keydown', handleKeyDown, true)
    
    // Empêcher le scroll sur le body pendant que la modale est ouverte
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.overflow = ''
      clearTimeout(timer)
    }
  }, [isActive, onEscape, restoreFocus, initialFocus, getFocusableElements, focusElement])

  return containerRef
}
