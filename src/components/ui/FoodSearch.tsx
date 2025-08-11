'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { searchProducts, hasCompleteNutritionalData } from '@/lib/openfoodfacts'
import { OpenFoodFactsProduct } from '@/types'
import { Search, X, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface FoodSearchProps {
  onSelectProduct: (product: OpenFoodFactsProduct) => void
  placeholder?: string
  autoFocus?: boolean
}

export default function FoodSearch({ onSelectProduct, placeholder = "Rechercher un aliment...", autoFocus = false }: FoodSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OpenFoodFactsProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [autoFocus])

  // Debounce optimisé de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch()
      } else {
        setResults([])
        setIsOpen(false)
        setIsLoading(false)
      }
    }, 500) // Augmenté à 500ms pour réduire les requêtes

    return () => clearTimeout(timer)
  }, [query])

  const performSearch = useCallback(async () => {
    if (isLoading) return // Éviter les requêtes multiples
    
    setIsLoading(true)
    try {
      const products = await searchProducts(query, 6) // Moins de résultats pour plus de rapidité
      setResults(products)
      setIsOpen(products.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Erreur recherche:', error)
      setResults([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [query, isLoading])

  const handleSelect = (product: OpenFoodFactsProduct) => {
    onSelectProduct(product)
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const highlight = (text: string) => {
    const tokens = query.trim().split(/\s+/).filter(t => t.length >= 2)
    if (tokens.length === 0) return text
    const regex = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part)
        ? (<mark key={i} className="bg-yellow-400/30 text-white rounded px-0.5">{part}</mark>)
        : (<span key={i}>{part}</span>)
    )
  }

  return (
    <div className="relative w-full">
      {/* Champ de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          ref={inputRef}
          className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none focus:glow-purple transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Résultats */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-space-800/95 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden max-h-96 overflow-y-auto shadow-2xl">
          {results.map((product, index) => {
            const isComplete = hasCompleteNutritionalData(product)
            const isSelected = index === selectedIndex

            return (
              <div
                key={product.code}
                onClick={() => handleSelect(product)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  px-4 py-3 cursor-pointer transition-all
                  ${isSelected 
                    ? 'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20' 
                    : 'hover:bg-white/5'
                  }
                  ${index !== results.length - 1 ? 'border-b border-white/5' : ''}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">
                        {highlight(product.product_name)}
                      </h4>
                      {!isComplete && (
                        <span title="Données nutritionnelles incomplètes">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </span>
                      )}
                    </div>
                    {product.brands && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {highlight(product.brands)}
                      </p>
                    )}
                    {isComplete && (
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{product.nutriments.energy_100g} kcal</span>
                        <span>P: {product.nutriments.proteins_100g}g</span>
                        <span>G: {product.nutriments.carbohydrates_100g}g</span>
                        <span>L: {product.nutriments.fat_100g}g</span>
                      </div>
                    )}
                  </div>
                  {product.image_url && (
                    <div className="relative w-12 h-12 ml-3 overflow-hidden rounded">
                      <Image
                        src={product.image_url}
                        alt={product.product_name}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          // Masquer le conteneur si l'image échoue
                          if (target && target.parentElement) {
                            target.parentElement.classList.add('hidden')
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Message si pas de résultats */}
      {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-space-800/95 backdrop-blur-md border border-white/10 rounded-lg p-4 text-center text-muted-foreground shadow-2xl" aria-live="polite">
          Aucun aliment trouvé pour "{query}"
        </div>
      )}
    </div>
  )
} 