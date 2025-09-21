'use client'

import React, { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRepas, useEntrainements, useMesures, useJournal } from '@/hooks/useFirestore'
import { useEnergyBalance } from '@/hooks/useEnergyBalance'
// calculateTDEE supprimé - maintenant dans useEnergyBalance
import { formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Zap,
  Heart,
  Activity,
  Scale,
  Utensils,
  Dumbbell,
  BookOpen,
  ChevronRight,
  Plus,
  BarChart3,
  PieChart,
  Bell,
  Star,
  Timer,
  Users
} from 'lucide-react'

// Lazy load des graphiques pour optimiser le bundle
const CaloriesChart = dynamic(() => import('@/components/ui/CaloriesChart'), { ssr: false })
const CaloriesInOutChart = dynamic(() => import('@/components/ui/CaloriesInOutChart'), { ssr: false })
const MacrosChart = dynamic(() => import('@/components/ui/MacrosChart'), { ssr: false })
const WeightIMCChart = dynamic(() => import('@/components/charts/WeightIMCChart'), { ssr: false })

interface DesktopDashboardProps {
  className?: string
}

interface QuickStat {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  color: 'purple' | 'cyan' | 'green' | 'pink' | 'orange' | 'blue'
  icon: React.ElementType
}

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ElementType
  color: string
  onClick: () => void
}

interface RecentActivity {
  id: string
  type: 'meal' | 'training' | 'measure' | 'journal'
  title: string
  subtitle: string
  time: string
  icon: React.ElementType
  color: string
}

export default function DesktopDashboard({ className }: DesktopDashboardProps) {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const { repas } = useRepas()
  const { entrainements } = useEntrainements()
  const { mesures } = useMesures()
  const { entries: journalEntries } = useJournal()

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')

  // Calculs des données selon la période sélectionnée
  const today = new Date().toISOString().split('T')[0]
  const weekStart = new Date()
  const dayOfWeek = weekStart.getDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Dimanche = 6 jours, autres = jour - 1
  weekStart.setDate(weekStart.getDate() - daysToSubtract)
  const weekStartStr = weekStart.toISOString().split('T')[0]
  
  const monthStart = new Date()
  monthStart.setDate(1)
  const monthStartStr = monthStart.toISOString().split('T')[0]

  // Calculer les dates selon la période
  const getDateRange = () => {
    switch (selectedPeriod) {
      case 'today':
        return { start: today, label: 'aujourd\'hui' }
      case 'week':
        return { start: weekStartStr, label: 'cette semaine' }
      case 'month':
        return { start: monthStartStr, label: 'ce mois' }
      default:
        return { start: today, label: 'aujourd\'hui' }
    }
  }

  const { start: periodStart, label: periodLabel } = getDateRange()

  // Données selon la période sélectionnée
  const periodMeals = selectedPeriod === 'today' 
    ? repas.filter(r => r.date === today)
    : repas.filter(r => r.date >= periodStart)

  // Entraînements selon la période
  const periodTrainings = selectedPeriod === 'today'
    ? entrainements.filter(e => e.date === today)
    : entrainements.filter(e => e.date >= periodStart)

  // Calculer les jours de la période
  const periodDays = selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 7 : 30

  // Hook centralisé pour tous les calculs énergétiques
  const energyBalance = useEnergyBalance({
    userProfile,
    repas: periodMeals,
    entrainements: periodTrainings,
    periodDays
  })

  // Garder aussi les données du jour pour certains calculs
  const todayMeals = repas.filter(r => r.date === today)
  const todayStats = todayMeals.reduce((total, meal) => ({
    calories: total.calories + (meal.macros?.kcal || 0),
    proteins: total.proteins + (meal.macros?.prot || 0),
    carbs: total.carbs + (meal.macros?.glucides || 0),
    fats: total.fats + (meal.macros?.lipides || 0),
  }), { calories: 0, proteins: 0, carbs: 0, fats: 0 })

  const thisWeekTrainings = entrainements.filter(e => e.date >= weekStartStr)

  // Dernier poids et tendance
  const sortedMeasures = mesures
    .filter(m => m.poids)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  const latestWeight = sortedMeasures[0]
  const previousWeight = sortedMeasures[1]
  const weightTrend = latestWeight && previousWeight 
    ? latestWeight.poids! > previousWeight.poids! ? 'up' : latestWeight.poids! < previousWeight.poids! ? 'down' : 'stable'
    : 'stable'

  // Humeur moyenne de la semaine
  const thisWeekJournal = journalEntries.filter(e => e.date >= weekStartStr)
  const avgMood = thisWeekJournal.length > 0 
    ? thisWeekJournal.reduce((sum, e) => sum + (e.humeur || 3), 0) / thisWeekJournal.length
    : 3

  // TDEE et calculs centralisés via le hook useEnergyBalance
  const { baseTDEE, adjustedTDEE, correctionFactor, avgDailySportCalories, periodStats, adjustedTrainings } = energyBalance
  const estimatedTDEE = adjustedTDEE
  
  // Debug pour vérifier les calculs centralisés
  if (userProfile && energyBalance.rawSportCalories > 0) {
    console.log('🔍 TDEE Debug (centralisé):', {
      period: selectedPeriod,
      baseTDEE,
      rawSportCalories: energyBalance.rawSportCalories,
      avgDailySportCalories: Math.round(avgDailySportCalories),
      correctionFactor,
      adjustedTDEE,
      difference: adjustedTDEE - baseTDEE
    })
  }
  // const bmr = userProfile ? calculateBMR(userProfile) : (latestWeight?.poids ? Math.round(latestWeight.poids * 22) : 1600)

  // Stats rapides pour la grille principale
  const quickStats: QuickStat[] = [
    {
      label: `Calories ${periodLabel}`,
      value: formatNumber(periodStats.calories),
      unit: 'kcal',
      trend: periodStats.calories > (estimatedTDEE || 2000) * 0.8 ? 'up' : 'down',
      trendValue: selectedPeriod === 'today' 
        ? `${Math.round((periodStats.calories / (estimatedTDEE || 2000)) * 100)}%`
        : `${formatNumber(periodStats.calories)} total`,
      color: 'green',
      icon: Zap
    },
    {
      label: `Protéines ${periodLabel}`,
      value: formatNumber(periodStats.proteins),
      unit: 'g',
      trend: 'stable',
      color: 'cyan',
      icon: Activity
    },
    {
      label: 'Poids actuel',
      value: latestWeight?.poids || '--',
      unit: 'kg',
      trend: weightTrend,
      trendValue: previousWeight ? `${Math.abs(latestWeight!.poids! - previousWeight.poids!).toFixed(1)}kg` : undefined,
      color: 'purple',
      icon: Scale
    },
    {
      label: selectedPeriod === 'today' ? 'Séances aujourd\'hui' : `Séances ${periodLabel}`,
      value: periodTrainings.length,
      unit: selectedPeriod === 'today' ? '' : selectedPeriod === 'week' ? '/7' : '',
      trend: periodTrainings.length >= (selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 3 : 8) ? 'up' : 'down',
      color: 'orange',
      icon: Dumbbell
    },
    {
      label: `Calories brûlées ${periodLabel}`,
      value: formatNumber(energyBalance.rawSportCalories),
      unit: 'kcal',
      trend: 'up',
      color: 'pink',
      icon: Heart
    },
    {
      label: 'Humeur moyenne',
      value: avgMood.toFixed(1),
      unit: '/5',
      trend: avgMood >= 4 ? 'up' : avgMood >= 3 ? 'stable' : 'down',
      color: 'blue',
      icon: BookOpen
    }
  ]

  // Actions rapides avec navigation optimisée
  const quickActions: QuickAction[] = [
    {
      id: 'add-meal',
      label: 'Ajouter Repas',
      description: 'Enregistrer un nouveau repas',
      icon: Utensils,
      color: 'from-orange-500 to-red-500',
      onClick: () => {
        router.push('/diete')
        toast.success('Redirection vers la diète')
      }
    },
    {
      id: 'add-training',
      label: 'Nouvel Entraînement',
      description: 'Enregistrer une séance',
      icon: Dumbbell,
      color: 'from-blue-500 to-purple-500',
      onClick: () => {
        router.push('/entrainements')
        toast.success('Redirection vers les entraînements')
      }
    },
    {
      id: 'add-measure',
      label: 'Prendre Mesures',
      description: 'Poids, tour de taille...',
      icon: Scale,
      color: 'from-green-500 to-teal-500',
      onClick: () => {
        router.push('/mesures')
        toast.success('Redirection vers les mesures')
      }
    },
    {
      id: 'journal-entry',
      label: 'Journal',
      description: 'Humeur, énergie, notes',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      onClick: () => {
        router.push('/journal')
        toast.success('Redirection vers le journal')
      }
    }
  ]

  // Activité récente
  const recentActivity: RecentActivity[] = useMemo(() => {
    const activities: RecentActivity[] = []

    // Derniers repas
    const recentMeals = repas
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 2)
    
    recentMeals.forEach(meal => {
      activities.push({
        id: `meal-${meal.id}`,
        type: 'meal',
        title: `Repas ${meal.repas}`,
        subtitle: `${meal.macros?.kcal || 0} kcal`,
        time: new Date(meal.date).toLocaleDateString('fr-FR'),
        icon: Utensils,
        color: 'text-orange-400'
      })
    })

    // Derniers entraînements
    const recentTrainings = entrainements
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 2)
    
    recentTrainings.forEach(training => {
      activities.push({
        id: `training-${training.id}`,
        type: 'training',
        title: training.type || 'Entraînement',
        subtitle: `${training.duree || 0} min • ${training.calories || 0} kcal`,
        time: new Date(training.date).toLocaleDateString('fr-FR'),
        icon: Dumbbell,
        color: 'text-blue-400'
      })
    })

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)
  }, [repas, entrainements])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header avec bienvenue et période */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bonjour {userProfile?.nom || user?.email?.split('@')[0]} ! 👋
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        {/* Sélecteur de période */}
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
          {[
            { key: 'today', label: 'Aujourd\'hui' },
            { key: 'week', label: 'Semaine' },
            { key: 'month', label: 'Mois' }
          ].map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as 'today' | 'week' | 'month')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                selectedPeriod === period.key
                  ? "bg-neon-purple/20 text-neon-purple"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Layout flexbox plus robuste */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Colonne principale - 70% sur desktop */}
        <div className="xl:flex-1 xl:w-0 space-y-6">
          {/* Stats rapides - 6 colonnes sur desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  "glass-effect p-3 lg:p-4 rounded-lg lg:rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer",
                  stat.color === 'purple' && 'border-neon-purple/20 bg-neon-purple/5',
                  stat.color === 'cyan' && 'border-neon-cyan/20 bg-neon-cyan/5',
                  stat.color === 'green' && 'border-neon-green/20 bg-neon-green/5',
                  stat.color === 'pink' && 'border-neon-pink/20 bg-neon-pink/5',
                  stat.color === 'orange' && 'border-orange-500/20 bg-orange-500/5',
                  stat.color === 'blue' && 'border-blue-500/20 bg-blue-500/5'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <stat.icon className={cn(
                    "h-5 w-5",
                    stat.color === 'purple' && 'text-neon-purple',
                    stat.color === 'cyan' && 'text-neon-cyan',
                    stat.color === 'green' && 'text-neon-green',
                    stat.color === 'pink' && 'text-neon-pink',
                    stat.color === 'orange' && 'text-orange-400',
                    stat.color === 'blue' && 'text-blue-400'
                  )} />
                  {stat.trend && (
                    <div className="flex items-center gap-1">
                      {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-400" />}
                      {stat.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-400" />}
                      {stat.trendValue && (
                        <span className="text-xs text-white/60">{stat.trendValue}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className={cn(
                  "text-lg lg:text-xl font-bold mb-1",
                  stat.color === 'purple' && 'text-neon-purple',
                  stat.color === 'cyan' && 'text-neon-cyan',
                  stat.color === 'green' && 'text-neon-green',
                  stat.color === 'pink' && 'text-neon-pink',
                  stat.color === 'orange' && 'text-orange-400',
                  stat.color === 'blue' && 'text-blue-400'
                )}>
                  {stat.value}{stat.unit}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Section graphiques - Layout hybride optimisé */}
          <div className="space-y-6">
            {/* Graphique principal - Pleine largeur */}
            <div className="glass-effect p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Balance Énergétique ({periodLabel})</h3>
                <Activity className="h-5 w-5 text-neon-pink" />
              </div>
              <div className="h-96">
                <CaloriesInOutChart 
                  repas={periodMeals} 
                  entrainements={adjustedTrainings} 
                  days={periodDays} 
                  tdee={baseTDEE}
                  title={`Calories In/Out (${periodLabel.toLowerCase()})`}
                />
              </div>
            </div>

            {/* Graphiques secondaires - 2 colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique calories */}
              <div className="glass-effect p-6 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Évolution Calories</h3>
                  <BarChart3 className="h-5 w-5 text-neon-green" />
                </div>
                <div className="h-96">
                {periodMeals.length > 0 ? (
                  <CaloriesChart repas={periodMeals} days={selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 7 : 30} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">Aucune donnée nutritionnelle</p>
                      <p className="text-sm text-muted-foreground">
                        Commencez à ajouter des repas pour suivre vos calories
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Graphique macros */}
              <div className="glass-effect p-6 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Répartition Macros</h3>
                  <PieChart className="h-5 w-5 text-neon-cyan" />
                </div>
                <div className="h-72">
                {periodStats.calories > 0 ? (
                  <MacrosChart macros={{
                    kcal: periodStats.calories,
                    prot: periodStats.proteins,
                    glucides: periodStats.carbs,
                    lipides: periodStats.fats
                  }} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <PieChart className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">Aucun repas aujourd&apos;hui</p>
                      <p className="text-sm text-muted-foreground">
                        Ajoutez des repas pour voir la répartition des macros
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Graphique poids & IMC - Optimisé pour desktop */}
            <div className="glass-effect p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Évolution Poids & IMC {periodLabel}
                </h3>
                <TrendingUp className="h-5 w-5 text-neon-purple" />
              </div>
              <div className="h-80">
                <WeightIMCChart mesures={mesures} period={selectedPeriod} />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar droite - 30% sur desktop */}
        <div className="xl:w-80 xl:flex-shrink-0 space-y-6">
          {/* Section coach en haut de la sidebar */}
          {user && userProfile?.role === 'sportif' && userProfile?.ownerCoachId && (
            <div className="glass-effect p-4 rounded-lg border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-neon-green" />
                <span className="text-sm text-white">
                  Lié à un coach
                </span>
              </div>
              <button
                onClick={() => {
                  toast('Pour changer de coach, contactez votre coach actuel', {
                    icon: '💡',
                    duration: 4000
                  })
                }}
                className="text-xs text-muted-foreground hover:text-white transition-colors"
              >
                Changer
              </button>
            </div>
          )}
          {/* Actions rapides */}
          <div className="glass-effect p-4 lg:p-6 rounded-lg lg:rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Actions Rapides</h3>
              <Plus className="h-5 w-5 text-neon-purple" />
            </div>
            <div className="space-y-3">
              {quickActions.map(action => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className={cn(
                    "w-full p-4 rounded-lg border border-white/10 bg-gradient-to-r",
                    action.color,
                    "text-white font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">{action.label}</div>
                      <div className="text-xs opacity-90">{action.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          <div className="glass-effect p-4 lg:p-6 rounded-lg lg:rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Activité Récente</h3>
              <Clock className="h-5 w-5 text-neon-cyan" />
            </div>
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    activity.type === 'meal' && 'bg-orange-500/20',
                    activity.type === 'training' && 'bg-blue-500/20',
                    activity.type === 'measure' && 'bg-green-500/20',
                    activity.type === 'journal' && 'bg-purple-500/20'
                  )}>
                    <activity.icon className={cn("h-4 w-4", activity.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {activity.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {activity.subtitle}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Objectifs de la période */}
          <div className="glass-effect p-4 lg:p-6 rounded-lg lg:rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Objectifs {selectedPeriod === 'today' ? 'du Jour' : selectedPeriod === 'week' ? 'de la Semaine' : 'du Mois'}
              </h3>
              <Target className="h-5 w-5 text-neon-green" />
            </div>
            <div className="space-y-4">
              {/* Objectif calories */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">Calories</span>
                    {userProfile && energyBalance.rawSportCalories > 0 && (
                      <span className="text-xs px-2 py-1 bg-neon-purple/20 text-neon-purple rounded-full" title={`Correction sport: ${Math.round(avgDailySportCalories)}kcal/j × ${correctionFactor}`}>
                        Ajusté sport ({Math.round(adjustedTDEE - baseTDEE)}kcal)
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-neon-green">
                    {formatNumber(selectedPeriod === 'today' ? todayStats.calories : periodStats.calories)} / {formatNumber(estimatedTDEE || 2000)}
                  </span>
                </div>
                <div className="w-full bg-space-700 rounded-full h-2">
                  <div 
                    className="bg-neon-green h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((selectedPeriod === 'today' ? todayStats.calories : periodStats.calories) / (estimatedTDEE || 2000)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Objectif protéines */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white">Protéines</span>
                  <span className="text-sm text-neon-cyan">
                    {formatNumber(selectedPeriod === 'today' ? todayStats.proteins : periodStats.proteins)} / {Math.round((latestWeight?.poids || 70) * 1.6)}g
                  </span>
                </div>
                <div className="w-full bg-space-700 rounded-full h-2">
                  <div 
                    className="bg-neon-cyan h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((selectedPeriod === 'today' ? todayStats.proteins : periodStats.proteins) / Math.round((latestWeight?.poids || 70) * 1.6)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Objectif entraînements selon période */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white">Entraînements</span>
                  <span className="text-sm text-neon-purple">
                    {adjustedTrainings.length} / {selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 4 : 12} {periodLabel}
                  </span>
                </div>
                <div className="w-full bg-space-700 rounded-full h-2">
                  <div 
                    className="bg-neon-purple h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((adjustedTrainings.length / (selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 4 : 12)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications/Alertes */}
          <div className="glass-effect p-4 lg:p-6 rounded-lg lg:rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <Bell className="h-5 w-5 text-neon-pink" />
            </div>
            <div className="space-y-3">
              {todayStats.calories < (estimatedTDEE || 2000) * 0.5 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">
                      Calories faibles aujourd&apos;hui
                    </span>
                  </div>
                </div>
              )}
              
              {thisWeekTrainings.length === 0 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-blue-400">
                      Aucun entraînement cette semaine
                    </span>
                  </div>
                </div>
              )}

              {avgMood < 3 && thisWeekJournal.length > 0 && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-purple-400">
                      Humeur en baisse cette semaine
                    </span>
                  </div>
                </div>
              )}
              
              {todayStats.calories === 0 && repas.length === 0 && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400">
                      Commencez votre suivi nutrition !
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
