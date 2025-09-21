'use client'

import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import MainLayout from '@/components/layout/MainLayout'
const MealForm = dynamic(() => import('@/components/ui/MealForm'), { ssr: false })
import { useAuth } from '@/hooks/useAuth'
import { useEnergyBalance } from '@/hooks/useEnergyBalance'
import { calculateTDEE, calculateAdjustedTDEE } from '@/lib/userCalculations'
import { useRepas, useAthleteDietPlan, useCoachCommentsByModule, useEntrainements } from '@/hooks/useFirestore'
import { MealType, Aliment, Macros } from '@/types'
// formatNumber removed - not used
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'
import dynamic from 'next/dynamic'
// MacrosChart supprimé - remplacé par NutritionAnalytics evidence-based
// import SwipeableMealCard from '@/components/mobile/SwipeableMealCard' // TODO: À intégrer
const MenuTypesModal = dynamic(() => import('@/components/ui/MenuTypesModal'), { ssr: false })
const HistoriqueModal = dynamic(() => import('@/components/ui/HistoriqueModal'), { ssr: false })
// CoachRecommendations et ModuleComments remplacés par CoachDietSection optimisé
import CollapsibleCard from '@/components/ui/CollapsibleCard'
// Skeletons supprimés - plus utilisés dans la nouvelle structure
import SmartSuggestions from '@/components/diete/SmartSuggestions'
import type { SmartSuggestion } from '@/lib/nutritional-database'
import PageHeader from '@/components/ui/PageHeader'
import MacroProgressHeader from '@/components/diete/MacroProgressHeader'
import NutritionAnalytics from '@/components/diete/NutritionAnalytics'
import CoachDietSection from '@/components/diete/CoachDietSection'

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{mealIcon}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white truncate">{mealName}</h4>
            <p className="text-sm text-accessible-secondary">{time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {macros && (
            <span className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs whitespace-nowrap">
              {Math.round(macros.kcal)} kcal
            </span>
          )}
          {hasFood && (
            <span className="px-2 py-1 bg-white/5 text-white/70 rounded text-xs whitespace-nowrap">
              {aliments.length} aliments
            </span>
          )}
          {collapsible && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
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
            className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-lg text-sm font-medium hover:bg-neon-purple/30 transition-colors whitespace-nowrap"
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

// MealCardMemo supprimé - plus utilisé

import type { Repas } from '@/types'

export default function DietePage() {
  const { user, userProfile } = useAuth()
  const { repas, addRepas, updateRepas, deleteRepas } = useRepas() // Pour les opérations CRUD et données
  const { entrainements } = useEntrainements() // Pour calculer l'ajustement TDEE
  const { currentPlan, loading: planLoading } = useAthleteDietPlan()
  const [selectedDate, setSelectedDate] = useState('')
  const [macrosPeriod, setMacrosPeriod] = useState<'today' | 'week'>('today')
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

  const meals: { type: MealType; name: string; icon: string; time: string }[] = useMemo(() => [
    { type: 'petit_dej', name: 'Petit-déjeuner', icon: '🌅', time: '7h30' },
    { type: 'collation_matin', name: 'Collation matin', icon: '☕', time: '10h00' },
    { type: 'dejeuner', name: 'Déjeuner', icon: '🍽️', time: '12h30' },
    { type: 'collation_apres_midi', name: 'Collation après-midi', icon: '🍎', time: '16h00' },
    { type: 'diner', name: 'Dîner', icon: '🌙', time: '19h30' },
    { type: 'collation_soir', name: 'Collation soir', icon: '🌃', time: '21h30' }
  ], [])

  // Filtrer les repas du jour sélectionné
  const todayMeals = useMemo(() => repas.filter((r: Repas) => r.date === selectedDate), [repas, selectedDate])

  // Calcul des repas de la semaine pour le mode semaine
  const weekMeals = useMemo(() => {
    if (macrosPeriod !== 'week') return []
    
    const weekStart = new Date(selectedDate)
    const dayOfWeek = weekStart.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Semaine française (lun→dim)
    weekStart.setDate(weekStart.getDate() - daysToSubtract)
    const weekStartStr = weekStart.toISOString().split('T')[0]
    
    return repas.filter((r: Repas) => r.date >= weekStartStr && r.date <= selectedDate)
  }, [repas, selectedDate, macrosPeriod])

  // Repas selon la période sélectionnée
  const periodMeals = macrosPeriod === 'today' ? todayMeals : weekMeals

  // Hook centralisé pour tous les calculs énergétiques
  const energyBalance = useEnergyBalance({
    userProfile,
    repas: periodMeals,
    entrainements: macrosPeriod === 'today' 
      ? entrainements.filter(e => e.date === selectedDate)
      : entrainements.filter(e => {
          const weekStart = new Date(selectedDate)
          const dayOfWeek = weekStart.getDay()
          const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          weekStart.setDate(weekStart.getDate() - daysToSubtract)
          return e.date >= weekStart.toISOString().split('T')[0] && e.date <= selectedDate
        }),
    periodDays: macrosPeriod === 'today' ? 1 : 7
  })

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
  
  // Gérer la suppression d'un repas (temporairement désactivé)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Calculer les macros actuels et cibles pour les suggestions intelligentes
  const currentMacros = useMemo(() => {
    const total = todayMeals.reduce((acc: Macros, meal: Repas) => ({
      kcal: acc.kcal + (meal.macros?.kcal || 0),
      prot: acc.prot + (meal.macros?.prot || 0),
      glucides: acc.glucides + (meal.macros?.glucides || 0),
      lipides: acc.lipides + (meal.macros?.lipides || 0),
    }), { kcal: 0, prot: 0, glucides: 0, lipides: 0 })

    return {
      calories: total.kcal,
      protein: total.prot,
      carbs: total.glucides,
      fat: total.lipides
    }
  }, [todayMeals])

  // Objectifs nutritionnels basés sur le profil utilisateur avec ajustement sport
  const targetMacros = useMemo(() => {
    const estimatedWeight = userProfile?.poids_initial || 70
    
    // Calculer calories d'entraînement du jour pour ajustement
    const todayTrainings = entrainements.filter(e => e.date === selectedDate)
    const todayCaloriesBurned = todayTrainings.reduce((total, training) => total + (training.calories || 0), 0)
    
    // TDEE ajusté pour éviter double comptage (utilise les calories du jour, pas une moyenne)
    const baseTDEE = userProfile ? calculateTDEE(userProfile) : 2000
    const adjustedTDEE = userProfile ? calculateAdjustedTDEE(userProfile, todayCaloriesBurned) : baseTDEE
    const finalTDEE = adjustedTDEE || baseTDEE
    
    const safeTDEE = finalTDEE || 2000 // Fallback si null
    
    return {
      calories: safeTDEE,
      protein: Math.round(estimatedWeight * 1.6), // 1.6g/kg (standard fitness)
      carbs: Math.round(safeTDEE * 0.5 / 4),     // 50% des calories
      fat: Math.round(safeTDEE * 0.25 / 9),      // 25% des calories
      isAdjusted: todayCaloriesBurned > 0 && userProfile
    }
  }, [userProfile, entrainements, selectedDate])

  // Objectif utilisateur par défaut (à récupérer depuis le profil)
  const userGoal: 'weight_loss' | 'muscle_gain' | 'maintenance' = 'maintenance'

  // Calculs des macros actuels selon la période
  const periodMacros = useMemo(() => {
    const totalMacros = periodMeals.reduce((acc: Macros, meal: Repas) => ({
      kcal: acc.kcal + (meal.macros?.kcal || 0),
      prot: acc.prot + (meal.macros?.prot || 0),
      glucides: acc.glucides + (meal.macros?.glucides || 0),
      lipides: acc.lipides + (meal.macros?.lipides || 0)
    }), { kcal: 0, prot: 0, glucides: 0, lipides: 0 })

    // Adapter les objectifs selon la période
    const periodMultiplier = macrosPeriod === 'week' ? 7 : 1
    
    return {
      calories: { 
        current: totalMacros.kcal, 
        target: targetMacros.calories * periodMultiplier, 
        unit: '' 
      },
      proteins: { 
        current: Math.round(totalMacros.prot), 
        target: targetMacros.protein * periodMultiplier, 
        unit: 'g' 
      },
      carbs: { 
        current: Math.round(totalMacros.glucides), 
        target: targetMacros.carbs * periodMultiplier, 
        unit: 'g' 
      },
      fats: { 
        current: Math.round(totalMacros.lipides), 
        target: targetMacros.fat * periodMultiplier, 
        unit: 'g' 
      }
    }
  }, [periodMeals, targetMacros, macrosPeriod])

  // Gérer l'ajout d'un aliment suggéré
  const handleAddSuggestedFood = (suggestion: SmartSuggestion) => {
    // Ouvrir le formulaire de repas avec l'aliment pré-rempli
    setShowMealForm('collation_apres_midi') // Par défaut, ajouter comme collation
    toast.success(`${suggestion.food.name} ajouté à vos suggestions !`)
  }

  // Raccourcis clavier pour améliorer l'UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n' && !showMealForm) {
        e.preventDefault()
        // Ouvrir le formulaire pour le prochain repas manquant
        const nextMeal = meals.find(meal => !todayMeals.some(tm => tm.repas === meal.type))
        if (nextMeal) {
          setShowMealForm(nextMeal.type)
        }
      }
      if (e.key === 'Escape' && showMealForm) {
        setShowMealForm(null)
        setEditingMeal(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showMealForm, todayMeals, meals])

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
        {/* Header standardisé */}
        <PageHeader
          title="Diète & Nutrition"
          description={`Suivi nutritionnel - ${today}`}
          action={{
            label: 'Menu-type',
            onClick: () => setShowMenuTypes(true),
            color: 'purple'
          }}
        />

        {/* Header macros amélioré */}
        {user && (
          <MacroProgressHeader
            calories={periodMacros.calories}
            proteins={periodMacros.proteins}
            carbs={periodMacros.carbs}
            fats={periodMacros.fats}
            period={macrosPeriod}
            onPeriodChange={setMacrosPeriod}
          />
        )}

        {/* SECTION 2: RECOMMANDATIONS COACH (optimisé UX) */}
        <CollapsibleCard 
          title="🏋️ Recommandations Coach"
          defaultOpen={false}
        >
          <CoachDietSection 
            plan={currentPlan}
            planLoading={planLoading}
            comments={dieteComments}
            commentsLoading={commentsLoading}
          />
        </CollapsibleCard>

        {/* SECTION 3: REPAS DU JOUR (toujours ouvert) */}
        <div className="glass-effect p-4 rounded-xl border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              🍽️ REPAS DU JOUR
            </h2>
            <div className="text-xs text-muted-foreground">
              💡 Cliquez pour ajouter des aliments
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm text-muted-foreground whitespace-nowrap">📅 Date :</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/20 transition-all duration-200 flex-1 sm:flex-none"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg text-sm hover:bg-neon-cyan/30 transition-colors font-medium whitespace-nowrap"
              >
                Aujourd&apos;hui
              </button>
              <button
                onClick={() => setShowHistorique(true)}
                className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors font-medium whitespace-nowrap"
              >
                📊 Historique
              </button>
            </div>
          </div>

          {/* Liste des repas */}
          {!showMealForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meals.map((meal) => {
                // Récupérer TOUS les repas de ce type
                const mealsOfType = todayMeals.filter((m: Repas) => m.repas === meal.type)
                
                // Prendre le plus récent (dernier dans la journée)
                const mealData = mealsOfType.length > 0 
                  ? mealsOfType[mealsOfType.length - 1]
                  : undefined

                return (
                  <MealCard
                    key={meal.type}
                    mealName={meal.name}
                    mealIcon={meal.icon}
                    time={meal.time}
                    mealType={meal.type}
                    aliments={mealData?.aliments || []}
                    macros={mealData?.macros}
                    onAddMeal={() => setShowMealForm(meal.type)}
                    onDelete={undefined}
                    mealId={mealData?.id}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: SUGGESTIONS INTELLIGENTES (après action) */}
        <CollapsibleCard 
          title="🧠 Suggestions Intelligentes"
          defaultOpen={false}
        >
          <SmartSuggestions 
            currentMacros={currentMacros}
            targetMacros={targetMacros}
            userGoal={userGoal}
            onAddFood={handleAddSuggestedFood}
          />
        </CollapsibleCard>

        {/* SECTION 4: ÉVOLUTION & TENDANCES (evidence-based) */}
        <CollapsibleCard 
          title="📊 Évolution & Tendances"
          defaultOpen={false}
        >
          <NutritionAnalytics 
            repas={repas}
            userProfile={userProfile}
            selectedDate={selectedDate}
          />
        </CollapsibleCard>


        {/* Message si non connecté */}
        {!user && (
          <div className="glass-effect p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-yellow-400">
              Connectez-vous pour enregistrer vos repas et suivre votre nutrition !
            </p>
          </div>
        )}

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

      </div>
      
      {/* FAB (Floating Action Button) pour ajouter un repas */}
      <button
        onClick={() => setShowMealForm('petit_dej')}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-full shadow-2xl hover:shadow-neon-purple/30 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
        title="Ajouter un repas (raccourci: Ctrl+N)"
      >
        <span className="text-2xl md:text-3xl group-hover:rotate-90 transition-transform duration-300">🍽️</span>
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
      </button>
    </MainLayout>
  )
} 

// HistoriqueSection supprimée - remplacée par HistoriqueModal