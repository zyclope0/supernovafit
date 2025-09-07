'use client'

import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import MainLayout from '@/components/layout/MainLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import MealForm from '@/components/ui/MealForm'
import { useAuth } from '@/hooks/useAuth'
import { useRepas, useAthleteDietPlan, useCoachCommentsByModule } from '@/hooks/useFirestore'
import { MealType, Aliment, Macros } from '@/types'
// formatNumber removed - not used
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { IconButton } from '@/components/ui/IconButton'
import dynamic from 'next/dynamic'
const MacrosChart = dynamic(() => import('@/components/ui/MacrosChart'), { ssr: false })
import MenuTypesModal from '@/components/ui/MenuTypesModal'
const HistoriqueModal = dynamic(() => import('@/components/ui/HistoriqueModal'), { ssr: false })
import CoachRecommendations from '@/components/ui/CoachRecommendations'
import ModuleComments from '@/components/ui/ModuleComments'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { CardSkeleton, ChartSkeleton, ListSkeleton } from '@/components/ui/Skeletons'

import React from 'react'

function MealCard({ 
  mealName, 
  mealIcon, 
  time,
  mealType,
  aliments = [],
  macros,
  onAddMeal,
  onDelete,
  mealId,
  collapsible = true
}: { 
  mealName: string
  mealIcon: string
  time: string
  mealType: MealType
  aliments?: Aliment[]
  macros?: Macros
  onAddMeal: () => void
  onDelete?: (id: string) => void
  mealId?: string
  collapsible?: boolean
}) {
  const hasFood = aliments.length > 0
  const [open, setOpen] = useState(!collapsible ? true : hasFood)
  const detailsId = `meal-details-${mealId || mealType}`

  return (
    <div className="glass-effect p-4 rounded-lg glass-hover hover:glow-cyan transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{mealIcon}</span>
          <div>
            <h4 className="font-medium text-white">{mealName}</h4>
            <p className="text-sm text-accessible-secondary">{time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {macros && (
            <span className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs">
              {Math.round(macros.kcal)} kcal
            </span>
          )}
          {hasFood && (
            <span className="px-2 py-1 bg-white/5 text-white/70 rounded text-xs">
              {aliments.length} aliments
            </span>
          )}
          {collapsible && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={open ? 'Réduire' : 'Développer'}
              aria-expanded={open}
              aria-controls={detailsId}
            >
              {open ? (
                <ChevronDown className="w-4 h-4 text-white" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white" />
              )}
            </button>
          )}
          {hasFood && onDelete && mealId && (
            <IconButton
              icon={Trash2}
              label="Supprimer le repas"
              onClick={() => onDelete(mealId)}
              variant="danger"
              size="sm"
            />
          )}
          <button 
            onClick={onAddMeal}
            className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-lg text-sm font-medium hover:bg-neon-purple/30 transition-colors"
          >
            {hasFood ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
      
      {/* Résumé compact toujours visible */}
      {macros && (
        <div className="flex flex-wrap gap-4 text-xs text-accessible-tertiary py-2 border-t border-white/10">
          <span className="text-neon-green">{Math.round(macros.kcal)} kcal</span>
          <span>P: {macros.prot.toFixed(1)}g</span>
          <span>G: {macros.glucides.toFixed(1)}g</span>
          <span>L: {macros.lipides.toFixed(1)}g</span>
        </div>
      )}

      {/* Détails repliables */}
      {open && (
        <div id={detailsId} className="space-y-2 mt-2">
          {hasFood ? (
            <>
              <div className="space-y-1">
                {aliments.slice(0, 6).map((aliment, index) => (
                  <div key={index} className="text-sm text-accessible-secondary">
                    • {aliment.nom} ({aliment.quantite}{aliment.unite})
                  </div>
                ))}
                {aliments.length > 6 && (
                  <div className="text-sm text-accessible-tertiary">
                    • +{aliments.length - 6} autres aliments
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Aucun aliment ajouté</div>
          )}
        </div>
      )}
    </div>
  )
}

const MealCardMemo = React.memo(MealCard)

import type { Repas } from '@/types'
function DailySummary({ todayMeals }: { todayMeals: Repas[] }) {
  // Calculer les totaux du jour
  const totals = todayMeals.reduce((acc, meal) => {
    if (meal.macros) {
      return {
        kcal: acc.kcal + meal.macros.kcal,
        prot: acc.prot + meal.macros.prot,
        glucides: acc.glucides + meal.macros.glucides,
        lipides: acc.lipides + meal.macros.lipides
      }
    }
    return acc
  }, { kcal: 0, prot: 0, glucides: 0, lipides: 0 })

  // Objectifs (à personnaliser plus tard)
  const objectives = {
    kcal: 2200,
    prot: 150,
    glucides: 275,
    lipides: 98
  }

  const getPercentage = (value: number, objective: number) => 
    Math.min(Math.round((value / objective) * 100), 100)

  const remaining = {
    kcal: Math.max(0, objectives.kcal - Math.round(totals.kcal)),
    prot: Math.max(0, objectives.prot - totals.prot),
    glucides: Math.max(0, objectives.glucides - totals.glucides),
    lipides: Math.max(0, objectives.lipides - totals.lipides),
  }

  return (
    <div className="glass-effect-high p-6 rounded-xl glass-hover">
      <h3 className="text-lg font-semibold text-white mb-4">Résumé du jour</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-neon-green">{totals.kcal}</div>
          <div className="text-sm text-muted-foreground">Calories</div>
          <div className="text-xs text-muted-foreground">/ {objectives.kcal} objectif</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-neon-cyan">{totals.prot.toFixed(1)}g</div>
          <div className="text-sm text-muted-foreground">Protéines</div>
          <div className="text-xs text-muted-foreground">/ {objectives.prot}g objectif</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-neon-pink">{totals.glucides.toFixed(1)}g</div>
          <div className="text-sm text-muted-foreground">Glucides</div>
          <div className="text-xs text-muted-foreground">/ {objectives.glucides}g objectif</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-neon-purple">{totals.lipides.toFixed(1)}g</div>
          <div className="text-sm text-muted-foreground">Lipides</div>
          <div className="text-xs text-muted-foreground">/ {objectives.lipides}g objectif</div>
        </div>
      </div>

      {/* Barres de progression */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Calories</span>
            <span className="text-neon-green">{getPercentage(totals.kcal, objectives.kcal)}% • reste {remaining.kcal} kcal</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-neon-green to-neon-cyan h-2 rounded-full transition-all duration-500" 
              style={{width: `${getPercentage(totals.kcal, objectives.kcal)}%`}}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Protéines</span>
            <span className="text-neon-cyan">{getPercentage(totals.prot, objectives.prot)}% • reste {Math.max(0, (objectives.prot - totals.prot)).toFixed(1)}g</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-neon-cyan to-neon-purple h-2 rounded-full transition-all duration-500" 
              style={{width: `${getPercentage(totals.prot, objectives.prot)}%`}}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Glucides</span>
            <span className="text-neon-pink">{getPercentage(totals.glucides, objectives.glucides)}% • reste {Math.max(0, (objectives.glucides - totals.glucides)).toFixed(1)}g</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-neon-pink to-neon-purple h-2 rounded-full transition-all duration-500" 
              style={{width: `${getPercentage(totals.glucides, objectives.glucides)}%`}}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Lipides</span>
            <span className="text-neon-purple">{getPercentage(totals.lipides, objectives.lipides)}% • reste {Math.max(0, (objectives.lipides - totals.lipides)).toFixed(1)}g</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-neon-purple to-neon-cyan h-2 rounded-full transition-all duration-500" 
              style={{width: `${getPercentage(totals.lipides, objectives.lipides)}%`}}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DietePage() {
  const { user } = useAuth()
  const { repas, loading: repasLoading, addRepas, updateRepas, deleteRepas } = useRepas() // Pour les opérations CRUD et données
  const { currentPlan, loading: planLoading } = useAthleteDietPlan()
  const [selectedDate, setSelectedDate] = useState('')
  const { comments: dieteComments, loading: commentsLoading } = useCoachCommentsByModule('diete', selectedDate)
  const [showMealForm, setShowMealForm] = useState<MealType | null>(null)
  const [editingMeal, setEditingMeal] = useState<string | null>(null) // ID du repas en édition
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMenuTypes, setShowMenuTypes] = useState(false)
  const [showHistorique, setShowHistorique] = useState(false)

  // Initialiser selectedDate côté client pour éviter hydration mismatch
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date().toISOString().split('T')[0])
    }
  }, [selectedDate])

  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const meals: { type: MealType; name: string; icon: string; time: string }[] = [
    { type: 'petit_dej', name: 'Petit-déjeuner', icon: '🌅', time: '7h30' },
    { type: 'collation_matin', name: 'Collation matin', icon: '☕', time: '10h00' },
    { type: 'dejeuner', name: 'Déjeuner', icon: '🍽️', time: '12h30' },
    { type: 'collation_apres_midi', name: 'Collation après-midi', icon: '🍎', time: '16h00' },
    { type: 'diner', name: 'Dîner', icon: '🌙', time: '19h30' },
    { type: 'collation_soir', name: 'Collation soir', icon: '🌃', time: '21h30' }
  ]

  // Filtrer les repas du jour sélectionné
  const todayMeals = useMemo(() => repas.filter((r: Repas) => r.date === selectedDate), [repas, selectedDate])

  // Gérer l'ajout ou la modification d'un repas
  const handleAddMeal = async (mealType: MealType, aliments: Aliment[], macros: Macros) => {
    if (!user || isSubmitting) {
      if (!user) console.error('❌ Utilisateur non connecté')
      return
    }

    setIsSubmitting(true)
    try {
      const repasData = {
        user_id: user.uid,
        date: selectedDate,
        repas: mealType,
        aliments,
        macros
      }

      let result
      
      if (editingMeal) {
        // Mode édition : mettre à jour le repas existant
        result = await updateRepas(editingMeal, repasData)
      } else {
        // Mode création : ajouter un nouveau repas
        result = await addRepas(repasData)
      }

      if (result.success) {
        toast.success(editingMeal ? 'Repas modifié avec succès !' : 'Repas enregistré avec succès !')
        setShowMealForm(null)
        setEditingMeal(null)
      } else {
        toast.error(`Erreur lors de ${editingMeal ? 'la mise à jour' : 'l\'enregistrement'} : ${result.error}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Gérer la suppression d'un repas
  const handleDeleteMeal = async (mealId: string) => {
    if (!user) return
    
    // Toast de confirmation avec boutons
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-white font-medium">
          Supprimer ce repas ?
        </p>
        <p className="text-sm text-gray-300">
          Cette action est irréversible
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            Annuler
          </button>
          <IconButton
            icon={Trash2}
            label="Confirmer la suppression"
            onClick={async () => {
              toast.dismiss(t.id)
              const result = await deleteRepas(mealId)
              if (result.success) {
                toast.success('Repas supprimé !')
              } else {
                toast.error(`Erreur lors de la suppression : ${result.error}`)
              }
            }}
            variant="danger"
            size="sm"
          />
        </div>
      </div>
    ), {
      duration: 10000,
      style: {
        background: 'rgba(15, 23, 42, 0.98)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        minWidth: '300px',
      }
    })
  }

  // Appliquer un template de menu
  const handleApplyTemplate = async (templateMeals: Array<{ repas: MealType; aliments: Aliment[]; macros: Macros }>) => {
    if (!user) return

    try {
      for (const templateMeal of templateMeals) {
        const repasData = {
          user_id: user.uid,
          date: selectedDate,
          repas: templateMeal.repas,
          aliments: templateMeal.aliments,
          macros: templateMeal.macros
        }
        
        await addRepas(repasData)
      }
      
      toast.success(`Template appliqué ! ${templateMeals.length} repas ajoutés.`)
    } catch {
      toast.error('Erreur lors de l\'application du template')
    }
  }

  // Loading state pendant initialisation selectedDate
  if (!selectedDate) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Diète"
          subtitle={`Suivi nutritionnel - ${today}`}
          icon={ChartBarIcon}
          actions={
            <div className="flex space-x-3">
            <button 
              onClick={() => setShowMenuTypes(true)}
              className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors"
            >
              Menu-type
            </button>
            <button 
              onClick={() => setShowHistorique(true)}
              className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg font-medium hover:bg-neon-cyan/30 transition-colors"
            >
              Historique
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-44 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:border-neon-purple focus:outline-none"
            />
            </div>
          }
        />

        {/* Message si non connecté */}
        {!user && (
          <div className="glass-effect p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-yellow-400">
              Connectez-vous pour enregistrer vos repas et suivre votre nutrition !
            </p>
          </div>
        )}

        {/* Recommandations Coach */}
        {planLoading ? (
          <CardSkeleton />
        ) : (
          <CoachRecommendations plan={currentPlan} loading={planLoading} />
        )}

        {/* Messages du Coach pour cette date (rétractable fermé par défaut) */}
        <CollapsibleCard title="Messages du Coach" defaultOpen={false} counter={dieteComments?.length || 0}>
          {commentsLoading ? (
            <ListSkeleton items={3} />
          ) : (
            <ModuleComments comments={dieteComments} loading={commentsLoading} />
          )}
        </CollapsibleCard>

        {/* Résumé du jour */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {repasLoading ? (
            <>
              <CardSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <DailySummary todayMeals={todayMeals} />
              {todayMeals.length > 0 && (
              <MacrosChart 
                macros={todayMeals.reduce((total: Macros, meal: Repas) => ({
                  kcal: total.kcal + (meal.macros?.kcal || 0),
                  prot: total.prot + (meal.macros?.prot || 0),
                  glucides: total.glucides + (meal.macros?.glucides || 0),
                  lipides: total.lipides + (meal.macros?.lipides || 0),
                }), { kcal: 0, prot: 0, glucides: 0, lipides: 0 })}
                title="Répartition du jour"
              />
              )}
            </>
          )}
        </div>

        {/* Formulaire d'ajout/édition de repas */}
        {showMealForm && (
          <MealForm 
            mealType={showMealForm}
            onSubmit={(aliments, macros) => handleAddMeal(showMealForm, aliments, macros)}
            onCancel={() => {
              setShowMealForm(null)
              setEditingMeal(null)
            }}
            existingAliments={editingMeal ? todayMeals.find((m: Repas) => m.id === editingMeal)?.aliments : undefined}
            isEditing={!!editingMeal}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Liste des repas */}
        {!showMealForm && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Repas du jour</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meals.map((meal) => {
                // Récupérer TOUS les repas de ce type
                const mealsOfType = todayMeals.filter((m: Repas) => m.repas === meal.type)
                
                // Prendre le plus récent (dernier dans la journée)
                const mealData = mealsOfType.length > 0 
                  ? mealsOfType[mealsOfType.length - 1]
                  : null
                
                // Combiner tous les aliments et macros si plusieurs repas
                const combinedAliments = mealsOfType.flatMap((m: Repas) => m.aliments || [])
                const combinedMacros = mealsOfType.reduce((total: Macros, m: Repas) => ({
                  kcal: total.kcal + (m.macros?.kcal || 0),
                  prot: total.prot + (m.macros?.prot || 0),
                  glucides: total.glucides + (m.macros?.glucides || 0),
                  lipides: total.lipides + (m.macros?.lipides || 0),
                }), { kcal: 0, prot: 0, glucides: 0, lipides: 0 })
                
                return (
                  <CollapsibleCard key={meal.type} title={`${meal.icon} ${meal.name}`} defaultOpen={true}>
                    <MealCardMemo 
                      mealName={meal.name}
                      mealIcon={meal.icon}
                      time={meal.time}
                      mealType={meal.type}
                      aliments={mealsOfType.length > 1 ? combinedAliments : mealData?.aliments}
                      macros={mealsOfType.length > 1 ? combinedMacros : mealData?.macros}
                      onAddMeal={() => {
                        setShowMealForm(meal.type)
                        setEditingMeal(mealData?.id || null)
                      }}
                      onDelete={mealsOfType.length === 1 ? handleDeleteMeal : undefined}
                      mealId={mealsOfType.length === 1 ? mealData?.id : undefined}
                      collapsible={false}
                    />
                  </CollapsibleCard>
                )
              })}
            </div>
          </div>
        )}

        {/* Modals */}
        <MenuTypesModal
          isOpen={showMenuTypes}
          onClose={() => setShowMenuTypes(false)}
          todayMeals={todayMeals}
          onApplyTemplate={handleApplyTemplate}
        />

        <HistoriqueModal
          isOpen={showHistorique}
          onClose={() => setShowHistorique(false)}
          currentDate={selectedDate}
          onDateChange={(d) => setSelectedDate(d)}
        />

        <HistoriqueSection allRepas={repas} loading={repasLoading} />
      </div>
    </MainLayout>
  )
} 

function HistoriqueSection({ allRepas, loading }: { allRepas: Repas[], loading: boolean }) {
  const sorted = [...allRepas].sort((a, b) => b.date.localeCompare(a.date))
  
  if (sorted.length === 0 && !loading) return null

  return (
    <CollapsibleCard title="Historique des repas" defaultOpen={false}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs text-accessible-secondary">{sorted.length} repas affichés</div>
        </div>
        <div className="divide-y divide-white/10">
          {sorted.map((r) => (
            <div key={r.id} className="py-2 flex items-center justify-between">
              <div className="text-sm text-white">
                {new Date(r.date).toLocaleDateString('fr-FR')}
              </div>
              <div className="text-xs text-muted-foreground">
                {r.aliments?.length || 0} aliments • {Math.round(r.macros?.kcal || 0)} kcal
              </div>
              <a
                href={`?date=${r.date}`}
                className="ml-3 px-2 py-1 text-xs bg-white/10 text-white rounded hover:bg-white/10"
                aria-label={`Voir le jour ${new Date(r.date).toLocaleDateString('fr-FR')}`}
              >
                Voir
              </a>
            </div>
          ))}
        </div>
        {loading && sorted.length > 0 && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-neon-cyan"></div>
          </div>
        )}
      </div>
    </CollapsibleCard>
  )
}