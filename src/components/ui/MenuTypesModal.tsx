'use client'

import { useState } from 'react'
import { Repas, MealType } from '@/types'
import { X, Save, Copy, Trash2, Clock, Star, ChefHat, Edit3, Eye } from 'lucide-react'

interface MenuTypesModalProps {
  isOpen: boolean
  onClose: () => void
  todayMeals: Repas[]
  onApplyTemplate: (templateMeals: Repas[]) => void
}

interface MenuTemplate {
  id: string
  name: string
  description: string
  meals: Repas[]
  totalCalories: number
  createdAt: string
}

export default function MenuTypesModal({ isOpen, onClose, todayMeals, onApplyTemplate }: MenuTypesModalProps) {
  const [templates, setTemplates] = useState<MenuTemplate[]>([
    // Templates par défaut avec repas réels
    {
      id: 'template-1',
      name: 'Journée Équilibrée',
      description: 'Menu équilibré pour une journée type',
      meals: [
        {
          id: 'template-1-breakfast',
          user_id: '',
          date: '',
          repas: 'petit_dej',
          aliments: [
            {
              id: '1',
              nom: 'Flocons d\'avoine',
              quantite: 50,
              unite: 'g',
              macros: { kcal: 180, prot: 6, glucides: 32, lipides: 3 }
            },
            {
              id: '2', 
              nom: 'Banane',
              quantite: 100,
              unite: 'g',
              macros: { kcal: 89, prot: 1, glucides: 23, lipides: 0.3 }
            },
            {
              id: '3',
              nom: 'Lait demi-écrémé',
              quantite: 200,
              unite: 'ml',
              macros: { kcal: 92, prot: 6.8, glucides: 9.6, lipides: 3.2 }
            }
          ],
          macros: { kcal: 361, prot: 13.8, glucides: 64.6, lipides: 6.5 }
        },
        {
          id: 'template-1-lunch',
          user_id: '',
          date: '',
          repas: 'dejeuner',
          aliments: [
            {
              id: '4',
              nom: 'Riz complet cuit',
              quantite: 100,
              unite: 'g',
              macros: { kcal: 112, prot: 2.6, glucides: 22, lipides: 0.9 }
            },
            {
              id: '5',
              nom: 'Blanc de poulet',
              quantite: 120,
              unite: 'g', 
              macros: { kcal: 172, prot: 32, glucides: 0, lipides: 3.6 }
            },
            {
              id: '6',
              nom: 'Brocolis',
              quantite: 150,
              unite: 'g',
              macros: { kcal: 51, prot: 4.2, glucides: 10, lipides: 0.6 }
            }
          ],
          macros: { kcal: 335, prot: 38.8, glucides: 32, lipides: 5.1 }
        },
        {
          id: 'template-1-dinner',
          user_id: '',
          date: '',
          repas: 'diner',
          aliments: [
            {
              id: '7',
              nom: 'Saumon',
              quantite: 100,
              unite: 'g',
              macros: { kcal: 206, prot: 22, glucides: 0, lipides: 12 }
            },
            {
              id: '8',
              nom: 'Quinoa cuit',
              quantite: 80,
              unite: 'g',
              macros: { kcal: 120, prot: 4.4, glucides: 22, lipides: 1.9 }
            },
            {
              id: '9',
              nom: 'Salade verte',
              quantite: 100,
              unite: 'g',
              macros: { kcal: 15, prot: 1.4, glucides: 3, lipides: 0.2 }
            }
          ],
          macros: { kcal: 341, prot: 27.8, glucides: 25, lipides: 14.1 }
        }
      ],
      totalCalories: 1037,
      createdAt: '2025-01-01'
    },
    {
      id: 'template-2', 
      name: 'Journée Sport',
      description: 'Menu riche en protéines pour les jours d\'entraînement',
      meals: [
        {
          id: 'template-2-breakfast',
          user_id: '',
          date: '',
          repas: 'petit_dej',
          aliments: [
            {
              id: '10',
              nom: 'Oeufs brouillés',
              quantite: 120,
              unite: 'g',
              macros: { kcal: 188, prot: 15, glucides: 1, lipides: 13 }
            },
            {
              id: '11',
              nom: 'Pain complet',
              quantite: 60,
              unite: 'g',
              macros: { kcal: 156, prot: 6, glucides: 28, lipides: 2.4 }
            },
            {
              id: '12',
              nom: 'Avocat',
              quantite: 50,
              unite: 'g',
              macros: { kcal: 80, prot: 1, glucides: 4, lipides: 7.5 }
            }
          ],
          macros: { kcal: 424, prot: 22, glucides: 33, lipides: 22.9 }
        },
        {
          id: 'template-2-lunch',
          user_id: '',
          date: '',
          repas: 'dejeuner',
          aliments: [
            {
              id: '13',
              nom: 'Pâtes complètes cuites',
              quantite: 120,
              unite: 'g',
              macros: { kcal: 131, prot: 5, glucides: 25, lipides: 1.1 }
            },
            {
              id: '14',
              nom: 'Thon',
              quantite: 100,
              unite: 'g',
              macros: { kcal: 144, prot: 30, glucides: 0, lipides: 1 }
            },
            {
              id: '15',
              nom: 'Tomates cerises',
              quantite: 100,
              unite: 'g',
              macros: { kcal: 18, prot: 0.9, glucides: 3.9, lipides: 0.2 }
            }
          ],
          macros: { kcal: 293, prot: 35.9, glucides: 28.9, lipides: 2.3 }
        },
        {
          id: 'template-2-snack',
          user_id: '',
          date: '',
          repas: 'collation_matin',
          aliments: [
            {
              id: '16',
              nom: 'Protéine whey',
              quantite: 30,
              unite: 'g',
              macros: { kcal: 113, prot: 24, glucides: 2, lipides: 1 }
            },
            {
              id: '17',
              nom: 'Amandes',
              quantite: 20,
              unite: 'g',
              macros: { kcal: 116, prot: 4.3, glucides: 3.7, lipides: 10 }
            }
          ],
          macros: { kcal: 229, prot: 28.3, glucides: 5.7, lipides: 11 }
        }
      ],
      totalCalories: 946,
      createdAt: '2025-01-01'
    }
  ])
  
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  const [editingTemplate, setEditingTemplate] = useState<MenuTemplate | null>(null)
  const [viewingTemplate, setViewingTemplate] = useState<MenuTemplate | null>(null)

  const todayTotalCalories = todayMeals.reduce((total, meal) => total + (meal.macros?.kcal || 0), 0)

  const handleSaveCurrentDay = () => {
    if (!newTemplateName.trim()) {
      alert('Veuillez entrer un nom pour le template')
      return
    }

    if (todayMeals.length === 0) {
      alert('Aucun repas à sauvegarder pour aujourd\'hui')
      return
    }

    const newTemplate: MenuTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim() || 'Template personnalisé',
      meals: todayMeals.map(meal => ({
        ...meal,
        id: `${meal.id}-template`, // Nouvel ID pour éviter les conflits
        date: '', // Sera rempli lors de l'application
        created_at: undefined, // Sera généré lors de l'application
      })),
      totalCalories: todayTotalCalories,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setTemplates([newTemplate, ...templates])
    setNewTemplateName('')
    setNewTemplateDescription('')
    alert(`Template "${newTemplate.name}" créé avec succès !`)
  }

  const handleApplyTemplate = (template: MenuTemplate) => {
    if (template.meals.length === 0) {
      alert('Ce template ne contient aucun repas')
      return
    }

    const confirmApply = confirm(
      `Appliquer le template "${template.name}" ?\n\n` +
      `Cela ajoutera ${template.meals.length} repas pour aujourd'hui.\n` +
      `Total estimé: ${template.totalCalories} kcal`
    )

    if (confirmApply) {
      onApplyTemplate(template.meals)
      onClose()
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    if (confirm(`Supprimer le template "${template.name}" ?`)) {
      setTemplates(templates.filter(t => t.id !== templateId))
    }
  }

  const handleEditTemplate = (template: MenuTemplate) => {
    setEditingTemplate({ ...template })
  }

  const handleSaveEditedTemplate = () => {
    if (!editingTemplate) return

    // Recalculer les calories totales
    const totalCalories = editingTemplate.meals.reduce((sum, meal) => sum + (meal.macros?.kcal || 0), 0)
    
    const updatedTemplate = {
      ...editingTemplate,
      totalCalories
    }

    setTemplates(templates.map(t => t.id === editingTemplate.id ? updatedTemplate : t))
    setEditingTemplate(null)
    alert(`Template "${updatedTemplate.name}" mis à jour !`)
  }

  const handleViewTemplate = (template: MenuTemplate) => {
    setViewingTemplate(template)
  }

  const getMealTypeName = (mealType: string) => {
    const names = {
      'petit_dej': 'Petit-déjeuner',
      'dejeuner': 'Déjeuner', 
      'diner': 'Dîner',
      'collation': 'Collation'
    }
    return names[mealType as keyof typeof names] || mealType
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ChefHat className="h-6 w-6 text-neon-purple" />
            <h2 className="text-xl font-semibold text-white">Menu-Types</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Sauvegarder journée actuelle */}
          <div className="glass-effect p-4 rounded-lg border border-neon-purple/20 mb-6">
            <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
              <Save className="h-5 w-5 text-neon-purple" />
              Sauvegarder la journée actuelle
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Nom du template
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Ex: Ma journée parfaite"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Description (optionnelle)
                </label>
                <input
                  type="text"
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  placeholder="Ex: Menu équilibré pour les jours calmes"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {todayMeals.length} repas · {todayTotalCalories} kcal total
                </div>
                <button
                  onClick={handleSaveCurrentDay}
                  disabled={!newTemplateName.trim() || todayMeals.length === 0}
                  className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>

          {/* Liste des templates */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Templates disponibles
            </h3>
            
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun template sauvegardé</p>
                <p className="text-sm mt-1">Créez votre premier template en sauvegardant une journée</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="glass-effect p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewTemplate(template)}
                          className="p-1 text-neon-cyan hover:text-cyan-300 transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="p-1 text-neon-purple hover:text-purple-300 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{template.meals.length} repas</span>
                      <span>{template.totalCalories} kcal</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {template.createdAt}
                      </span>
                    </div>

                    <button
                      onClick={() => handleApplyTemplate(template)}
                      className="w-full px-3 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg font-medium hover:bg-neon-cyan/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Appliquer ce template
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de visualisation */}
      {viewingTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="glass-effect rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-neon-cyan" />
                {viewingTemplate.name}
              </h3>
              <button
                onClick={() => setViewingTemplate(null)}
                className="p-2 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <p className="text-muted-foreground mb-4">{viewingTemplate.description}</p>
              <div className="space-y-4">
                {viewingTemplate.meals.map((meal, index) => (
                  <div key={index} className="glass-effect p-4 rounded-lg border border-white/10">
                    <h4 className="font-medium text-white mb-2">{getMealTypeName(meal.repas)}</h4>
                    <div className="space-y-2">
                      {meal.aliments.map((aliment, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-white">{aliment.nom} ({aliment.quantite}{aliment.unite})</span>
                          <span className="text-muted-foreground">{aliment.macros?.kcal ?? 0} kcal</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/10 text-sm">
                      <div className="flex justify-between text-neon-green">
                        <span>Total:</span>
                        <span>{meal.macros.kcal} kcal • {meal.macros.prot}g prot</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex justify-between text-lg font-medium">
                  <span className="text-white">Total journée:</span>
                  <span className="text-neon-green">{viewingTemplate.totalCalories} kcal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="glass-effect rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-neon-purple" />
                Modifier le template
              </h3>
              <button
                onClick={() => setEditingTemplate(null)}
                className="p-2 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Nom du template
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      description: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white">Repas inclus</h4>
                {editingTemplate.meals.map((meal, index) => (
                  <div key={index} className="glass-effect p-4 rounded-lg border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-white">{getMealTypeName(meal.repas)}</h5>
                      <button
                        onClick={() => {
                          const updatedMeals = editingTemplate.meals.filter((_, i) => i !== index)
                          setEditingTemplate({
                            ...editingTemplate,
                            meals: updatedMeals
                          })
                        }}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Supprimer ce repas"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {meal.aliments.length} aliment(s) • {meal.macros.kcal} kcal
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {meal.aliments.map(a => a.nom).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center p-6 border-t border-white/10">
              <div className="text-sm text-muted-foreground">
                {editingTemplate.meals.length} repas • {editingTemplate.meals.reduce((sum, meal) => sum + meal.macros.kcal, 0)} kcal total
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveEditedTemplate}
                  className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}