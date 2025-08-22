import { useEffect, useCallback } from 'react'
import { useState } from 'react'

interface UseKeyboardNavigationOptions {
  onEscape?: () => void
  onEnter?: () => void
  onSpace?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: (direction: 'forward' | 'backward') => void
  enabled?: boolean
}

export function useKeyboardNavigation({
  onEscape,
  onEnter,
  onSpace,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onTab,
  enabled = true
}: UseKeyboardNavigationOptions = {}) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault()
          onEscape()
        }
        break
        
      case 'Enter':
        if (onEnter) {
          event.preventDefault()
          onEnter()
        }
        break
        
      case ' ':
        if (onSpace) {
          event.preventDefault()
          onSpace()
        }
        break
        
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault()
          onArrowUp()
        }
        break
        
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault()
          onArrowDown()
        }
        break
        
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault()
          onArrowLeft()
        }
        break
        
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault()
          onArrowRight()
        }
        break
        
      case 'Tab':
        if (onTab) {
          const direction = event.shiftKey ? 'backward' : 'forward'
          onTab(direction)
        }
        break
    }
  }, [enabled, onEscape, onEnter, onSpace, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])

  return {
    handleKeyDown
  }
}

// Hook spécialisé pour la navigation dans les listes
export function useListNavigation<T>(
  items: T[],
  onSelect: (item: T, index: number) => void,
  initialIndex = 0
) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)

  const handleArrowUp = useCallback(() => {
    setSelectedIndex(prev => prev > 0 ? prev - 1 : items.length - 1)
  }, [items.length])

  const handleArrowDown = useCallback(() => {
    setSelectedIndex(prev => prev < items.length - 1 ? prev + 1 : 0)
  }, [items.length])

  const handleEnter = useCallback(() => {
    if (items[selectedIndex]) {
      onSelect(items[selectedIndex], selectedIndex)
    }
  }, [items, selectedIndex, onSelect])

  useKeyboardNavigation({
    onArrowUp: handleArrowUp,
    onArrowDown: handleArrowDown,
    onEnter: handleEnter
  })

  return {
    selectedIndex,
    setSelectedIndex
  }
}

// Hook pour la navigation dans les grilles (calendriers, etc.)
export function useGridNavigation(
  rows: number,
  cols: number,
  onSelect: (row: number, col: number) => void,
  initialRow = 0,
  initialCol = 0
) {
  const [currentRow, setCurrentRow] = useState(initialRow)
  const [currentCol, setCurrentCol] = useState(initialCol)

  const handleArrowUp = useCallback(() => {
    setCurrentRow(prev => prev > 0 ? prev - 1 : rows - 1)
  }, [rows])

  const handleArrowDown = useCallback(() => {
    setCurrentRow(prev => prev < rows - 1 ? prev + 1 : 0)
  }, [rows])

  const handleArrowLeft = useCallback(() => {
    setCurrentCol(prev => prev > 0 ? prev - 1 : cols - 1)
  }, [cols])

  const handleArrowRight = useCallback(() => {
    setCurrentCol(prev => prev < cols - 1 ? prev + 1 : 0)
  }, [cols])

  const handleEnter = useCallback(() => {
    onSelect(currentRow, currentCol)
  }, [currentRow, currentCol, onSelect])

  useKeyboardNavigation({
    onArrowUp: handleArrowUp,
    onArrowDown: handleArrowDown,
    onArrowLeft: handleArrowLeft,
    onArrowRight: handleArrowRight,
    onEnter: handleEnter
  })

  return {
    currentRow,
    currentCol,
    setCurrentRow,
    setCurrentCol
  }
}
