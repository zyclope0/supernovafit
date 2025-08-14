'use client'

import { useState } from 'react'
import { Aliment } from '@/types'
import { useFavoris } from '@/hooks/useFirestore'
import { Star, Heart, Search, Plus } from 'lucide-react'

interface FavoritesFoodListProps {
  onSelectFood: (aliment: Omit<Aliment, 'id'>) => void
  onClose?: () => void
}

export default function FavoritesFoodList({ onSelectFood, onClose }: FavoritesFoodListProps) {
  const { favoris, loading } = useFavoris()
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrer les favoris selon la recherche
  const filteredFavoris = favoris.filter(aliment =>
    aliment.nom.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectAliment = (aliment: Aliment) => {
    // Créer un nouvel aliment basé sur le favori (sans l'id)
    const { id, ...alimentData } = aliment
    void id
    onSelectFood({
      ...alimentData,
      quantite: 100, // Quantité par défaut
    })
    if (onClose) onClose()
  }

  if (loading) {
    return (
      <div className="glass-effect p-6 rounded-xl border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Star className="h-5 w-5 text-neon-purple" />
          <h3 className="text-lg font-semibold text-white">Mes Favoris</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <Star className="h-5 w-5 text-neon-purple" />
        <h3 className="text-lg font-semibold text-white">Mes Favoris</h3>
        <span className="text-sm text-muted-foreground">({favoris.length})</span>
      </div>

      {/* Barre de recherche dans les favoris */}
      {favoris.length > 5 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans vos favoris..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
          />
        </div>
      )}

      {/* Liste des favoris */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredFavoris.length === 0 ? (
          <div className="text-center py-8">
            {favoris.length === 0 ? (
              <div className="text-muted-foreground">
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun favori encore</p>
                <p className="text-xs mt-1">Utilisez ⭐ pour ajouter des aliments à vos favoris</p>
              </div>
            ) : (
              <div className="text-muted-foreground">
                <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun résultat pour &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>
        ) : (
          filteredFavoris.map((aliment) => (
            <div 
              key={aliment.id}
              onClick={() => handleSelectAliment(aliment)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-white group-hover:text-neon-purple transition-colors">
                    {aliment.nom}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{aliment.macros?.kcal || 0} kcal</span>
                    <span>P: {aliment.macros?.prot || 0}g</span>
                    <span>G: {aliment.macros?.glucides || 0}g</span>
                    <span>L: {aliment.macros?.lipides || 0}g</span>
                    {aliment.unite && <span>({aliment.unite})</span>}
                  </div>
                </div>
                <Plus className="h-4 w-4 text-neon-purple opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions rapides */}
      {favoris.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-muted-foreground text-center">
            💡 Astuce : Cliquez sur un favori pour l&apos;ajouter rapidement
          </div>
        </div>
      )}
    </div>
  )
}