'use client'

import { useState } from 'react'
import { X, Clock, Star, Plus, Utensils } from 'lucide-react'
import { MealType, Aliment, Macros } from '@/types'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface QuickMealTemplate {
  id: string
  name: string
  description: string
  emoji: string
  mealType: MealType
  aliments: Aliment[]
  macros: Macros
  prepTime: string
  category: 'petit-dej' | 'collation' | 'principal' | 'post-workout'
}

interface QuickMealModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: QuickMealTemplate) => void
  className?: string
}

const QUICK_MEAL_TEMPLATES: QuickMealTemplate[] = [
  // Petit-déjeuner
  {
    id: 'protein-breakfast',
    name: 'Petit-dej Protéiné',
    description: 'Œufs + Avoine + Fruits',
    emoji: '🍳',
    mealType: 'petit_dej',
    aliments: [
      { nom: 'Œufs entiers', quantite: 2, unite: 'unités', kcal_100g: 155, prot_100g: 13, glucides_100g: 1.1, lipides_100g: 11 },
      { nom: 'Flocons d\'avoine', quantite: 50, unite: 'g', kcal_100g: 389, prot_100g: 17, glucides_100g: 66, lipides_100g: 7 },
      { nom: 'Banane', quantite: 1, unite: 'unité', kcal_100g: 89, prot_100g: 1.1, glucides_100g: 23, lipides_100g: 0.3 }
    ],
    macros: { kcal: 504, prot: 28, glucides: 45, lipides: 18 },
    prepTime: '10 min',
    category: 'petit-dej'
  },
  {
    id: 'quick-breakfast',
    name: 'Express Matin',
    description: 'Yaourt + Granola + Miel',
    emoji: '🥣',
    mealType: 'petit_dej',
    aliments: [
      { nom: 'Yaourt grec 0%', quantite: 150, unite: 'g', kcal_100g: 59, prot_100g: 10, glucides_100g: 3.6, lipides_100g: 0.4 },
      { nom: 'Granola maison', quantite: 30, unite: 'g', kcal_100g: 471, prot_100g: 11, glucides_100g: 48, lipides_100g: 26 },
      { nom: 'Miel', quantite: 15, unite: 'g', kcal_100g: 304, prot_100g: 0.3, glucides_100g: 82, lipides_100g: 0 }
    ],
    macros: { kcal: 275, prot: 18, glucides: 31, lipides: 8 },
    prepTime: '2 min',
    category: 'petit-dej'
  },

  // Collations
  {
    id: 'protein-snack',
    name: 'Collation Protéinée',
    description: 'Fromage blanc + Noix',
    emoji: '🥜',
    mealType: 'collation_matin',
    aliments: [
      { nom: 'Fromage blanc 0%', quantite: 100, unite: 'g', kcal_100g: 47, prot_100g: 8, glucides_100g: 4, lipides_100g: 0.2 },
      { nom: 'Amandes', quantite: 20, unite: 'g', kcal_100g: 579, prot_100g: 21, glucides_100g: 22, lipides_100g: 50 }
    ],
    macros: { kcal: 163, prot: 12, glucides: 8, lipides: 10 },
    prepTime: '1 min',
    category: 'collation'
  },
  {
    id: 'fruit-snack',
    name: 'Collation Fruits',
    description: 'Pomme + Beurre d\'amande',
    emoji: '🍎',
    mealType: 'collation_apres_midi',
    aliments: [
      { nom: 'Pomme', quantite: 150, unite: 'g', kcal_100g: 52, prot_100g: 0.3, glucides_100g: 14, lipides_100g: 0.2 },
      { nom: 'Beurre d\'amande', quantite: 15, unite: 'g', kcal_100g: 614, prot_100g: 25, glucides_100g: 6, lipides_100g: 56 }
    ],
    macros: { kcal: 170, prot: 4, glucides: 22, lipides: 9 },
    prepTime: '1 min',
    category: 'collation'
  },

  // Repas principaux
  {
    id: 'chicken-rice',
    name: 'Poulet-Riz Express',
    description: 'Blanc de poulet + Riz + Légumes',
    emoji: '🍗',
    mealType: 'dejeuner',
    aliments: [
      { nom: 'Blanc de poulet', quantite: 150, unite: 'g', kcal_100g: 165, prot_100g: 31, glucides_100g: 0, lipides_100g: 3.6 },
      { nom: 'Riz complet cuit', quantite: 100, unite: 'g', kcal_100g: 111, prot_100g: 2.6, glucides_100g: 23, lipides_100g: 0.9 },
      { nom: 'Brocolis', quantite: 100, unite: 'g', kcal_100g: 25, prot_100g: 3, glucides_100g: 4, lipides_100g: 0.4 }
    ],
    macros: { kcal: 384, prot: 50, glucides: 27, lipides: 7 },
    prepTime: '15 min',
    category: 'principal'
  },
  {
    id: 'salmon-quinoa',
    name: 'Saumon-Quinoa',
    description: 'Saumon + Quinoa + Salade',
    emoji: '🐟',
    mealType: 'diner',
    aliments: [
      { nom: 'Saumon', quantite: 120, unite: 'g', kcal_100g: 208, prot_100g: 25, glucides_100g: 0, lipides_100g: 12 },
      { nom: 'Quinoa cuit', quantite: 80, unite: 'g', kcal_100g: 120, prot_100g: 4.4, glucides_100g: 22, lipides_100g: 1.9 },
      { nom: 'Salade verte', quantite: 50, unite: 'g', kcal_100g: 15, prot_100g: 1.4, glucides_100g: 2.9, lipides_100g: 0.2 }
    ],
    macros: { kcal: 353, prot: 34, glucides: 20, lipides: 16 },
    prepTime: '20 min',
    category: 'principal'
  },

  // Post-workout
  {
    id: 'post-workout',
    name: 'Post-Entraînement',
    description: 'Shake protéiné + Banane',
    emoji: '💪',
    mealType: 'collation_apres_midi',
    aliments: [
      { nom: 'Whey protéine', quantite: 30, unite: 'g', kcal_100g: 380, prot_100g: 80, glucides_100g: 5, lipides_100g: 2 },
      { nom: 'Banane', quantite: 120, unite: 'g', kcal_100g: 89, prot_100g: 1.1, glucides_100g: 23, lipides_100g: 0.3 },
      { nom: 'Lait d\'amande', quantite: 200, unite: 'ml', kcal_100g: 17, prot_100g: 0.6, glucides_100g: 0.3, lipides_100g: 1.1 }
    ],
    macros: { kcal: 255, prot: 26, glucides: 30, lipides: 3 },
    prepTime: '2 min',
    category: 'post-workout'
  }
]

export default function QuickMealModal({ 
  isOpen, 
  onClose, 
  onSelectTemplate,
  className 
}: QuickMealModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const categories = [
    { id: 'all', label: 'Tous', emoji: '🍽️' },
    { id: 'petit-dej', label: 'Matin', emoji: '🌅' },
    { id: 'collation', label: 'Collation', emoji: '🍎' },
    { id: 'principal', label: 'Principal', emoji: '🍗' },
    { id: 'post-workout', label: 'Post-Sport', emoji: '💪' }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? QUICK_MEAL_TEMPLATES 
    : QUICK_MEAL_TEMPLATES.filter(t => t.category === selectedCategory)

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId)
      } else {
        newFavorites.add(templateId)
      }
      return newFavorites
    })
  }

  const handleSelectTemplate = (template: QuickMealTemplate) => {
    onSelectTemplate(template)
    toast.success(`Template "${template.name}" sélectionné !`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-black/95 backdrop-blur-xl',
        'border-t border-white/10',
        'rounded-t-3xl',
        'max-h-[80vh] overflow-hidden',
        'transform transition-all duration-300 ease-out',
        isOpen ? 'translate-y-0' : 'translate-y-full',
        className
      )}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center gap-3">
            <Utensils className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">
              Repas Rapides
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Categories */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all',
                  selectedCategory === category.id
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                )}
              >
                <span>{category.emoji}</span>
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="px-6 pb-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 gap-3">
            {filteredTemplates.map((template) => {
              const isFavorite = favorites.has(template.id)
              
              return (
                <div
                  key={template.id}
                  className="glass-effect rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-2xl">{template.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1">
                            {template.name}
                          </h3>
                          <p className="text-sm text-white/60 mb-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-white/50">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {template.prepTime}
                            </div>
                            <div>{template.macros.kcal} kcal</div>
                            <div>P: {template.macros.prot}g</div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleFavorite(template.id)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          isFavorite 
                            ? 'text-yellow-400 bg-yellow-500/10' 
                            : 'text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10'
                        )}
                      >
                        <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                      </button>
                    </div>

                    {/* Macros Summary */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">
                          {template.macros.prot}g
                        </div>
                        <div className="text-xs text-white/60">Protéines</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-cyan-400">
                          {template.macros.glucides}g
                        </div>
                        <div className="text-xs text-white/60">Glucides</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">
                          {template.macros.lipides}g
                        </div>
                        <div className="text-xs text-white/60">Lipides</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => onSelectTemplate(template)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter ce repas
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">Aucun template dans cette catégorie</p>
            </div>
          )}
        </div>

        {/* Safe area for iPhone */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </>
  )
}
