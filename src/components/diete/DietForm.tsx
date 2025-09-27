'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { OpenFoodFactsProduct, MealType, Aliment, Macros } from '@/types'
import { getMealName, generateId } from '@/lib/utils'
import { repasSchema, validateData } from '@/lib/validation'
// useFavoris géré par FavoritesFoodList
import FoodSearch from '../ui/FoodSearch'
import ManualFoodForm from '../ui/ManualFoodForm'
import FavoritesFoodList from '../ui/FavoritesFoodList'
import { Search, Edit3, Star, Plus, Trash2, AlertCircle } from 'lucide-react'
import FormModal from '../ui/FormModal'

interface DietFormProps {
  mealType: MealType
  onSubmit: (aliments: Aliment[], macros: Macros) => void
  onCancel: () => void
  existingAliments?: Aliment[]
  isEditing?: boolean
  isSubmitting?: boolean
}

// Tabs pour organiser le contenu
const TABS = [
  { id: 'search', label: 'Recherche', icon: Search },
  { id: 'manual', label: 'Manuel', icon: Edit3 },
  { id: 'favorites', label: 'Favoris', icon: Star },
  { id: 'summary', label: 'Mon Repas', icon: Plus }
]

export default function DietForm({ 
  mealType, 
  onSubmit, 
  onCancel, 
  existingAliments, 
  isEditing, 
  isSubmitting 
}: DietFormProps) {
  const [aliments, setAliments] = useState<Aliment[]>(existingAliments || [])
  const [activeTab, setActiveTab] = useState<'search' | 'manual' | 'favorites' | 'summary'>('search')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  // FavoritesFoodList gère ses propres favoris

  // Ajouter un aliment depuis Open Food Facts
  const handleAddProduct = (product: OpenFoodFactsProduct) => {
    // Les macros_base sont pour 100g (valeurs de référence)
    const macrosBase = {
      kcal: product.nutriments.energy_100g,
      prot: product.nutriments.proteins_100g,
      glucides: product.nutriments.carbohydrates_100g,
      lipides: product.nutriments.fat_100g,
    }
    
    // Les macros sont calculés pour la quantité actuelle (100g par défaut)
    const ratio = 100 / 100 // = 1 pour 100g
    const macros = {
      kcal: macrosBase.kcal * ratio,
      prot: macrosBase.prot * ratio,
      glucides: macrosBase.glucides * ratio,
      lipides: macrosBase.lipides * ratio,
    }
    
    const newAliment: Aliment = {
      id: generateId(),
      nom: product.product_name,
      quantite: 100,
      unite: 'g',
      openfoodfacts_id: product.code,
      macros,
      macros_base: macrosBase
    }
    
    setAliments(prev => [...prev, newAliment])
    setActiveTab('summary') // Aller directement à "Mon Repas"
    toast.success(`${product.product_name} ajouté !`)
  }

  // Ajouter un aliment manuel
  const handleAddManual = (aliment: Aliment) => {
    setAliments(prev => [...prev, aliment])
    setActiveTab('summary') // Aller directement à "Mon Repas"
    toast.success(`${aliment.nom} ajouté !`)
  }

  // Ajouter depuis les favoris
  const handleAddFromFavorites = (aliment: Omit<Aliment, 'id'>) => {
    const newAliment = { ...aliment, id: generateId() }
    setAliments(prev => [...prev, newAliment])
    setActiveTab('summary') // Aller directement à "Mon Repas"
    toast.success(`${aliment.nom} ajouté depuis les favoris !`)
  }

  // Supprimer un aliment
  const handleRemoveAliment = (alimentId: string) => {
    setAliments(prev => prev.filter(a => a.id !== alimentId))
    toast.success('Aliment supprimé')
  }

  // Modifier la quantité d'un aliment
  const handleUpdateQuantity = (alimentId: string, newQuantity: number) => {
    setAliments(prev => prev.map(a => {
      if (a.id === alimentId) {
        // Les macros_base sont pour 100g, donc on calcule le ratio par rapport à 100g
        const ratio = newQuantity / 100
        return {
          ...a,
          quantite: newQuantity,
          macros: {
            kcal: (a.macros_base?.kcal || 0) * ratio,
            prot: (a.macros_base?.prot || 0) * ratio,
            glucides: (a.macros_base?.glucides || 0) * ratio,
            lipides: (a.macros_base?.lipides || 0) * ratio,
          }
        }
      }
      return a
    }))
  }

  // Calculer les macros totales
  const totalMacros = aliments.reduce((acc, aliment) => ({
    kcal: acc.kcal + (aliment.macros?.kcal || 0),
    prot: acc.prot + (aliment.macros?.prot || 0),
    glucides: acc.glucides + (aliment.macros?.glucides || 0),
    lipides: acc.lipides + (aliment.macros?.lipides || 0),
  }), { kcal: 0, prot: 0, glucides: 0, lipides: 0 })

  // Validation et soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (aliments.length === 0) {
      toast.error('Ajoutez au moins un aliment')
      return
    }

    // Validation effectuée
    
    // Validation avec Zod - créer un objet Repas complet
    const repasData = {
      user_id: 'temp', // Sera remplacé par le hook
      date: new Date().toISOString().split('T')[0], // Sera remplacé par le hook
      repas: mealType,
      aliments: aliments.map(a => ({
        id: a.id,
        nom: a.nom,
        quantite: a.quantite,
        unite: a.unite,
        macros: a.macros
      })),
      macros: totalMacros
    }
    
    const validationResult = validateData(repasSchema, repasData)

    if (!validationResult.success) {
      setValidationErrors(validationResult.errors || ['Erreur de validation'])
      toast.error('Erreurs de validation détectées')
      return
    }

    setValidationErrors([])
    onSubmit(aliments, totalMacros)
  }

  // Contenu des tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-neon-cyan" />
              Recherche Open Food Facts
            </h3>
            <div className="flex-1">
              <FoodSearch onSelectProduct={handleAddProduct} />
            </div>
          </div>
        )

      case 'manual':
        return (
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Edit3 className="h-5 w-5 text-neon-green" />
              Saisie manuelle
            </h3>
            <div className="flex-1">
              <ManualFoodForm onSubmit={handleAddManual} onCancel={() => {}} />
            </div>
          </div>
        )

      case 'favorites':
        return (
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-neon-yellow" />
              Mes favoris
            </h3>
            <div className="flex-1">
              <FavoritesFoodList 
                onSelectFood={handleAddFromFavorites}
              />
            </div>
          </div>
        )

      case 'summary':
        return (
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Plus className="h-5 w-5 text-neon-purple" />
              Mon Repas
            </h3>
            
            {/* Liste des aliments */}
            <div className="flex-1 overflow-y-auto">
            {aliments.length > 0 ? (
              <div className="space-y-3">
                {aliments.map((aliment) => (
                  <div key={aliment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-white">{aliment.nom}</div>
                      <div className="text-sm text-gray-400">
                        {aliment.quantite}{aliment.unite} • {Math.round(aliment.macros?.kcal || 0)} kcal
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={aliment.quantite}
                        onChange={(e) => handleUpdateQuantity(aliment.id, parseFloat(e.target.value) || 1)}
                        className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                      />
                      <button
                        onClick={() => handleRemoveAliment(aliment.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Macros totales */}
                <div className="mt-4 p-4 bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 rounded-lg border border-neon-purple/20">
                  <h4 className="text-sm font-semibold text-neon-purple mb-2">Macros totales</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Calories:</span>
                      <span className="ml-2 font-semibold text-neon-green">{Math.round(totalMacros.kcal)} kcal</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Protéines:</span>
                      <span className="ml-2 font-semibold text-neon-cyan">{Math.round(totalMacros.prot)}g</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Glucides:</span>
                      <span className="ml-2 font-semibold text-neon-yellow">{Math.round(totalMacros.glucides)}g</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Lipides:</span>
                      <span className="ml-2 font-semibold text-neon-pink">{Math.round(totalMacros.lipides)}g</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Plus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">Votre repas est vide</p>
                <p className="text-sm mb-4">Ajoutez des aliments depuis les autres onglets</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setActiveTab('search')}
                    className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded text-sm hover:bg-neon-cyan/30 transition-colors"
                  >
                    Rechercher
                  </button>
                  <button
                    onClick={() => setActiveTab('manual')}
                    className="px-3 py-1 bg-neon-green/20 text-neon-green rounded text-sm hover:bg-neon-green/30 transition-colors"
                  >
                    Saisir
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <FormModal
      title={`${isEditing ? 'Modifier' : 'Ajouter'} ${getMealName(mealType)}`}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as 'search' | 'manual' | 'favorites' | 'summary')}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? 'Modifier' : 'Enregistrer'}
    >
      {/* Erreurs de validation */}
      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">Erreurs de validation</span>
          </div>
          <ul className="text-sm text-red-300 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Contenu du tab actif */}
      {renderTabContent()}
    </FormModal>
  )
}
