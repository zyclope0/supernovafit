'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { OpenFoodFactsProduct, MealType, Aliment, Macros } from '@/types'
// calculateMacros import removed - not used
import { getMealName, generateId } from '@/lib/utils'
import { repasSchema, validateData } from '@/lib/validation'
import { useFavoris } from '@/hooks/useFirestore'
import FoodSearch from './FoodSearch'
import ManualFoodForm from './ManualFoodForm'
import FavoritesFoodList from './FavoritesFoodList'
import { Plus, Trash2, X, Edit3, Search, AlertCircle, Star } from 'lucide-react'

interface MealFormProps {
  mealType: MealType
  onSubmit: (aliments: Aliment[], macros: Macros) => void
  onCancel: () => void
  existingAliments?: Aliment[] // Pour l'édition
  isEditing?: boolean // Mode édition
  isSubmitting?: boolean // État de chargement
}

export default function MealForm({ mealType, onSubmit, onCancel, existingAliments, isEditing, isSubmitting }: MealFormProps) {
  const [aliments, setAliments] = useState<Aliment[]>(existingAliments || [])
  const [isAddingFood, setIsAddingFood] = useState(false)
  const [addMode, setAddMode] = useState<'search' | 'manual' | 'favorites' | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [hasValidated, setHasValidated] = useState(false)
  
  const { favoris, addToFavoris, isFavori } = useFavoris()

  // Ajouter un aliment depuis Open Food Facts
  const handleAddProduct = (product: OpenFoodFactsProduct) => {
    const newAliment: Aliment = {
      id: generateId(),
      nom: product.product_name,
      quantite: 100, // Par défaut 100g
      unite: 'g',
      openfoodfacts_id: product.code,
      macros: {
        kcal: product.nutriments.energy_100g,
        prot: product.nutriments.proteins_100g,
        glucides: product.nutriments.carbohydrates_100g,
        lipides: product.nutriments.fat_100g,
      },
      // Stocker les valeurs de base pour 100g
      macros_base: {
        kcal: product.nutriments.energy_100g,
        prot: product.nutriments.proteins_100g,
        glucides: product.nutriments.carbohydrates_100g,
        lipides: product.nutriments.fat_100g,
      }
    }
    
    setAliments([...aliments, newAliment])
    setIsAddingFood(false)
    setAddMode(null)
  }
  
  // Ajouter un aliment manuellement
  const handleAddManualFood = (aliment: Aliment) => {
    setAliments([...aliments, aliment])
    setIsAddingFood(false)
    setAddMode(null)
  }

  // Mettre à jour la quantité d'un aliment
  const updateQuantity = (id: string, quantite: number) => {
    setAliments(aliments.map(aliment => {
      if (aliment.id === id && aliment.macros_base) {
        // Recalculer les macros selon la nouvelle quantité en utilisant les valeurs de base
        const factor = quantite / 100
        return {
          ...aliment,
          quantite,
          macros: {
            kcal: Math.round(aliment.macros_base.kcal * factor),
            prot: Math.round(aliment.macros_base.prot * factor * 10) / 10,
            glucides: Math.round(aliment.macros_base.glucides * factor * 10) / 10,
            lipides: Math.round(aliment.macros_base.lipides * factor * 10) / 10,
          }
        }
      }
      return aliment
    }))
  }

  // Supprimer un aliment
  const removeAliment = (id: string) => {
    setAliments(aliments.filter(a => a.id !== id))
  }

  // Ajouter aux favoris
  const handleAddToFavoris = async (aliment: Aliment) => {
    const alimentData: Omit<Aliment, 'id'> = { ...aliment }
    // Retirer id du payload favoris
    delete (alimentData as { id?: string }).id
    const result = await addToFavoris(alimentData)
    
    if (result.success) {
      toast.success(`${aliment.nom} ajouté aux favoris !`)
    } else {
      toast.error(result.error || 'Erreur')
    }
  }

  // Ajouter depuis les favoris
  const handleAddFromFavoris = (alimentData: Omit<Aliment, 'id'>) => {
    const newAliment: Aliment = {
      ...alimentData,
      id: generateId()
    }
    setAliments([...aliments, newAliment])
    setIsAddingFood(false)
    setAddMode(null)
  }

  // Calculer les macros totales (utiliser directement les valeurs calculées dans aliments)
  const calculateTotalMacros = (): Macros => {
    return aliments.reduce((total, aliment) => {
      if (aliment.macros) {
        return {
          kcal: total.kcal + aliment.macros.kcal,
          prot: total.prot + aliment.macros.prot,
          glucides: total.glucides + aliment.macros.glucides,
          lipides: total.lipides + aliment.macros.lipides,
        }
      }
      return total
    }, { kcal: 0, prot: 0, glucides: 0, lipides: 0 })
  }

  const handleSubmit = () => {
    setHasValidated(true)
    const totalMacros = calculateTotalMacros()
    
    // Validation avec Zod (création d'objet temporaire pour validation)
    const repasForValidation = {
      user_id: 'temp',
      date: new Date().toISOString().split('T')[0],
      repas: mealType,
      aliments,
      macros: totalMacros
    }
    
    const validation = validateData(repasSchema, repasForValidation)
    
    if (!validation.success && validation.errors) {
      setValidationErrors(validation.errors)
      toast.error(`Données invalides : ${validation.errors[0]}`)
      return
    }
    
    setValidationErrors([])
    onSubmit(aliments, totalMacros)
  }

  const totalMacros = calculateTotalMacros()

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {isEditing ? 'Modifier le repas' : 'Ajouter un repas'} - {getMealName(mealType)}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Liste des aliments */}
      <div className="space-y-3 mb-6">
        {aliments.map((aliment) => (
          <div key={aliment.id} className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-white">{aliment.nom}</h4>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={aliment.quantite}
                      onChange={(e) => updateQuantity(aliment.id, Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-white/10 border border-white/10 rounded text-white text-sm"
                      min="1"
                    />
                    <span className="text-sm text-muted-foreground">{aliment.unite}</span>
                    
                    {/* Boutons portions rapides */}
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => updateQuantity(aliment.id, Math.max(1, Math.round(aliment.quantite * 0.5)))}
                        className="px-2 py-1 bg-neon-purple/20 hover:bg-neon-purple/30 border border-neon-purple/30 rounded text-neon-purple text-xs font-medium transition-colors"
                        title="Diviser la portion par 2"
                      >
                        1/2
                      </button>
                      <button
                        onClick={() => updateQuantity(aliment.id, aliment.quantite + 25)}
                        className="px-2 py-1 bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/30 rounded text-neon-green text-xs font-medium transition-colors"
                        title="Ajouter 25g/ml"
                      >
                        +25
                      </button>
                      <button
                        onClick={() => updateQuantity(aliment.id, aliment.quantite * 2)}
                        className="px-2 py-1 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/30 rounded text-neon-cyan text-xs font-medium transition-colors"
                        title="Doubler la portion"
                      >
                        2x
                      </button>
                    </div>
                  </div>
                  {aliment.macros && (
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{aliment.macros.kcal} kcal</span>
                      <span>P: {aliment.macros.prot}g</span>
                      <span>G: {aliment.macros.glucides}g</span>
                      <span>L: {aliment.macros.lipides}g</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {/* Bouton ajouter aux favoris */}
                {!isFavori(aliment) && (
                  <button
                    onClick={() => handleAddToFavoris(aliment)}
                    className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    title="Ajouter aux favoris"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                {isFavori(aliment) && (
                  <div className="p-2 text-yellow-400" title="Dans vos favoris">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                )}
                <button
                  onClick={() => removeAliment(aliment.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {aliments.length === 0 && !isAddingFood && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun aliment ajouté pour ce repas
          </div>
        )}
      </div>

      {/* Ajouter un aliment */}
      {isAddingFood ? (
        <div className="mb-6 space-y-3">
          {/* Choix du mode d'ajout */}
          {!addMode && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Comment ajouter un aliment ?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Favoris en premier si disponibles */}
                {favoris.length > 0 && (
                  <button
                    onClick={() => setAddMode('favorites')}
                    className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <div className="text-left">
                        <div className="font-medium text-white">Mes Favoris</div>
                        <div className="text-sm text-muted-foreground">{favoris.length} aliment{favoris.length > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </button>
                )}
                <button
                  onClick={() => setAddMode('search')}
                  className="p-4 bg-neon-green/10 border border-neon-green/20 rounded-lg hover:bg-neon-green/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-neon-green" />
                    <div className="text-left">
                      <div className="font-medium text-white">Rechercher</div>
                      <div className="text-sm text-muted-foreground">Open Food Facts</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setAddMode('manual')}
                  className="p-4 bg-neon-purple/10 border border-neon-purple/20 rounded-lg hover:bg-neon-purple/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Edit3 className="h-5 w-5 text-neon-purple" />
                    <div className="text-left">
                      <div className="font-medium text-white">Saisie manuelle</div>
                      <div className="text-sm text-muted-foreground">Vos recettes</div>
                    </div>
                  </div>
                </button>
              </div>
              <button
                onClick={() => setIsAddingFood(false)}
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
          
          {/* Mode favoris */}
          {addMode === 'favorites' && (
            <div>
              <FavoritesFoodList 
                onSelectFood={handleAddFromFavoris}
                onClose={() => setAddMode(null)}
              />
              <button
                onClick={() => setAddMode(null)}
                className="mt-3 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                ← Retour au choix
              </button>
            </div>
          )}
          
          {/* Mode recherche */}
          {addMode === 'search' && (
            <div>
              <FoodSearch onSelectProduct={handleAddProduct} autoFocus />
              <button
                onClick={() => {
                  setAddMode(null)
                  setIsAddingFood(false)
                }}
                className="mt-2 text-sm text-muted-foreground hover:text-white"
              >
                Annuler
              </button>
            </div>
          )}
          
          {/* Mode manuel */}
          {addMode === 'manual' && (
            <ManualFoodForm 
              onSubmit={handleAddManualFood}
              onCancel={() => {
                setAddMode(null)
                setIsAddingFood(false)
              }}
            />
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsAddingFood(true)}
          className="w-full mb-6 px-4 py-3 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Ajouter un aliment
        </button>
      )}

      {/* Erreurs de validation */}
      {hasValidated && validationErrors.length > 0 && (
        <div className="glass-effect p-4 rounded-lg border border-red-500/20 bg-red-500/5 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="text-red-400 font-medium">Erreurs de validation :</h4>
              <ul className="text-sm text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Résumé des macros */}
      {aliments.length > 0 && (
        <div className="border-t border-white/10 pt-4 mb-6">
          <h3 className="text-sm font-medium text-white mb-3">Total du repas</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-green">{totalMacros.kcal}</div>
              <div className="text-xs text-muted-foreground">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-cyan">{totalMacros.prot}g</div>
              <div className="text-xs text-muted-foreground">Protéines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-pink">{totalMacros.glucides}g</div>
              <div className="text-xs text-muted-foreground">Glucides</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-purple">{totalMacros.lipides}g</div>
              <div className="text-xs text-muted-foreground">Lipides</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={aliments.length === 0 || isSubmitting}
          className="flex-1 px-4 py-3 bg-neon-cyan/20 text-neon-cyan rounded-lg font-medium hover:bg-neon-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
          )}
          {isSubmitting 
            ? 'Enregistrement...' 
            : (isEditing ? 'Mettre à jour' : 'Enregistrer le repas')
          }
        </button>
      </div>
    </div>
  )
} 