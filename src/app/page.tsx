'use client'

import React from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRepas, useEntrainements, useMesures } from '@/hooks/useFirestore'
import { formatNumber } from '@/lib/utils'
import dynamic from 'next/dynamic'
const CaloriesChart = dynamic(() => import('@/components/ui/CaloriesChart'), { ssr: false })
const CaloriesInOutChart = dynamic(() => import('@/components/ui/CaloriesInOutChart'), { ssr: false })

// Composants du dashboard
function WelcomeCard({ username }: { username?: string }) {
  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10 glow-purple">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Bonjour {username ? username : ''} ! 👋
          </h1>
          <p className="text-muted-foreground">
            {today}
          </p>
        </div>
        <div className="text-4xl animate-float">
          🚀
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, unit, icon, color = "neon-purple" }: {
  title: string
  value: string | number
  unit?: string
  icon: string
  color?: string
}) {
  return (
    <div className="glass-effect p-4 rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex items-baseline">
        <span className={`text-2xl font-bold text-${color}`}>{value}</span>
        {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
      </div>
    </div>
  )
}

function QuickActions() {
  const actions = [
    { name: 'Ajouter un repas', href: '/diete', icon: '🍽️', color: 'neon-green' },
    { name: 'Enregistrer mesures', href: '/mesures', icon: '📏', color: 'neon-cyan' },
    { name: 'Saisir entraînement', href: '/entrainements', icon: '💪', color: 'neon-pink' },
    { name: 'Journal du jour', href: '/journal', icon: '📝', color: 'neon-purple' }
  ]

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4">Actions rapides</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            aria-label={action.name}
            className="flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
          >
            <span className="text-xl mr-3">{action.icon}</span>
            <span className="text-sm font-medium text-white group-hover:text-neon-cyan transition-colors">
              {action.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ProgressChart({ repas }: { repas: any[] }) {
  return <CaloriesChart repas={repas} days={7} />
}

export default function Dashboard() {
  const { user } = useAuth()
  const { repas, loading: repasLoading } = useRepas()
  const { entrainements, loading: trainingsLoading } = useEntrainements()
  const { mesures, loading: measuresLoading } = useMesures()
  
  // Date d'aujourd&apos;hui (ou dernière date avec des repas)
  const today = new Date().toISOString().split('T')[0]
  const latestMealDate = repas.length > 0 
    ? repas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
    : today
  
  // Utiliser la dernière date avec des repas pour afficher des stats
  const displayDate = repas.some(r => r.date === today) ? today : latestMealDate
  
  // Calculer les stats du jour (ou du dernier jour avec des données)
  const todayMeals = repas.filter(r => r.date === displayDate)
  const todayStats = todayMeals.reduce((total, meal) => ({
    kcal: total.kcal + (meal.macros?.kcal || 0),
    prot: total.prot + (meal.macros?.prot || 0),
    glucides: total.glucides + (meal.macros?.glucides || 0),
    lipides: total.lipides + (meal.macros?.lipides || 0),
  }), { kcal: 0, prot: 0, glucides: 0, lipides: 0 })
  
  // Calculer les entraînements de la semaine
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]
  
  const thisWeekTrainings = entrainements.filter(e => e.date >= weekStartStr).length
  
  // Poids le plus récent
  const latestWeight = mesures
    .filter(m => m.poids)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  // Estimation TDEE simple si profil minimal (poids) disponible
  // Hypothèse: TDEE ~ 30 kcal/kg/jour (approx maint.) si pas d'autres infos
  const estimatedTDEE = latestWeight?.poids ? Math.round(latestWeight.poids * 30) : 0

  // Loading state
  if (repasLoading && trainingsLoading && measuresLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="glass-effect p-6 rounded-xl border border-white/10">
            <div className="animate-pulse">
              <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Carte de bienvenue */}
        <WelcomeCard username={user?.email?.split('@')[0]} />

        {/* Message si pas connecté */}
        {!user && (
          <div className="glass-effect p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-yellow-400">
              Connectez-vous pour voir vos statistiques personnalisées !
            </p>
          </div>
        )}

        {/* Statistiques du jour */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Calories aujourd&apos;hui" 
            value={formatNumber(todayStats.kcal)} 
            unit="kcal" 
            icon="🔥" 
            color="neon-green"
          />
          <StatsCard 
            title="Protéines" 
            value={formatNumber(todayStats.prot)} 
            unit="g" 
            icon="🥩" 
            color="neon-cyan"
          />
          <StatsCard 
            title="Entraînements" 
            value={thisWeekTrainings} 
            unit="cette semaine" 
            icon="💪" 
            color="neon-pink"
          />
          <StatsCard 
            title="Poids actuel" 
            value={latestWeight?.poids ? formatNumber(latestWeight.poids) : '--'} 
            unit="kg" 
            icon="⚖️" 
            color="neon-purple"
          />
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions />
          <ProgressChart repas={repas} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CaloriesInOutChart repas={repas} entrainements={entrainements} days={7} tdee={estimatedTDEE} />
          {/* Placeholder pour futur: humeur/énergie 7j ou objectifs */}
          <div className="glass-effect p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Conseil du jour</h3>
            <p className="text-sm text-muted-foreground">
              Hydratez-vous et visez des protéines à chaque repas pour optimiser la récupération.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 