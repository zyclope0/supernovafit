'use client'

import React from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
// import { useRepas, useEntrainements, useMesures } from '@/hooks/useFirestore'
import dynamic from 'next/dynamic'
import InviteCodeInput from '@/components/ui/InviteCodeInput'
import { Users, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
const MobileDashboard = dynamic(() => import('@/components/mobile/MobileDashboard'), { ssr: false })
const DesktopDashboard = dynamic(() => import('@/components/desktop/DesktopDashboard'), { ssr: false })

// Composants du dashboard (non utilisés avec DesktopDashboard)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ProgressChart() {
  return null
}

// Page d'accueil pour les utilisateurs non connectés
function LandingPage() {
  const features = [
    {
      icon: '📊',
      title: 'Suivi Nutritionnel',
      description: 'Enregistrez vos repas et suivez vos macronutriments avec précision'
    },
    {
      icon: '💪',
      title: 'Entraînements',
      description: 'Planifiez et suivez vos séances d&apos;entraînement personnalisées'
    },
    {
      icon: '📏',
      title: 'Mesures Corporelles',
      description: 'Surveillez votre progression avec des graphiques détaillés'
    },
    {
      icon: '📈',
      title: 'Analyses Avancées',
      description: 'Graphiques et rapports pour optimiser vos performances'
    },
    {
      icon: '👥',
      title: 'Coaching Personnalisé',
      description: 'Connectez-vous avec des coaches certifiés pour un suivi expert'
    },
    {
      icon: '📱',
      title: 'Interface Moderne',
      description: 'Design responsive et accessible sur tous vos appareils'
    }
  ]

  const stats = [
    { value: '10K+', label: 'Utilisateurs actifs' },
    { value: '50K+', label: 'Repas enregistrés' },
    { value: '95%', label: 'Satisfaction client' },
    { value: '24/7', label: 'Support disponible' }
  ]

  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                SuperNovaFit
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Votre plateforme complète de fitness et nutrition pour atteindre vos objectifs
            </p>
            <p className="text-lg text-accessible max-w-2xl mx-auto">
              Suivez votre alimentation, planifiez vos entraînements et connectez-vous avec des coaches certifiés pour maximiser vos résultats.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="inline-flex items-center px-4 sm:px-6 lg:px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-semibold rounded-lg hover:from-neon-cyan/80 hover:to-neon-purple/80 transition-all duration-200 transform hover:scale-105"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center px-4 sm:px-6 lg:px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              Découvrir le guide
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="glass-effect p-6 rounded-lg border border-white/10 text-center">
              <div className="text-2xl md:text-3xl font-bold text-neon-cyan mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Fonctionnalités */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Fonctionnalités Principales</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour transformer votre approche du fitness et de la nutrition
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="glass-effect p-6 rounded-lg border border-white/10 hover:border-neon-cyan/30 transition-all duration-200">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="glass-effect p-4 sm:p-6 lg:p-8 rounded-xl border border-neon-cyan/20 bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Prêt à transformer votre vie ?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Rejoignez des milliers d&apos;utilisateurs qui ont déjà atteint leurs objectifs avec SuperNovaFit
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center px-4 sm:px-6 lg:px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-semibold rounded-lg hover:from-neon-cyan/80 hover:to-neon-purple/80 transition-all duration-200 transform hover:scale-105"
          >
            Créer mon compte gratuitement
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}

export default function Dashboard() {
  const { user, userProfile, loading } = useAuth()
  // Variables non utilisées avec DesktopDashboard (données gérées dans le composant)
  // const { repas, loading: repasLoading } = useRepas()
  // const { entrainements, loading: trainingsLoading } = useEntrainements()
  // const { mesures, loading: measuresLoading } = useMesures()
  // const today = new Date().toISOString().split('T')[0]
  // const todayStats = { kcal: 0, prot: 0, glucides: 0, lipides: 0 }
  // const thisWeekTrainings = 0
  // const estimatedTDEE = 2000

  // Si pas d'utilisateur connecté, afficher la page d'accueil
  if (!loading && !user) {
    return <LandingPage />
  }

  // Si en cours de chargement, afficher un spinner
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-cyan border-t-transparent"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Mobile Dashboard */}
        <div className="block xl:hidden">
          <MobileDashboard />
        </div>
        
        {/* Desktop Dashboard - Nouveau composant optimisé */}
        <div className="hidden xl:block">
          <DesktopDashboard />
        </div>

        {/* Section invitation coach (pour les athlètes) - Visible sur toutes les tailles */}
        {user && userProfile?.role === 'sportif' && !userProfile?.ownerCoachId && (
          <div className="glass-effect p-6 rounded-xl border border-neon-purple/20 bg-neon-purple/5">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-neon-purple mb-2">Rejoindre un Coach</h3>
              <p className="text-muted-foreground">
                Entrez le code d&apos;invitation de votre coach pour bénéficier d&apos;un suivi personnalisé
              </p>
            </div>
            <InviteCodeInput 
              onSuccess={() => {
                toast.success('Vous êtes maintenant connecté à votre coach !')
                window.location.reload()
              }}
            />
          </div>
        )}

        {/* Affichage discret si déjà un coach */}
        {user && userProfile?.role === 'sportif' && userProfile?.ownerCoachId && (
          <div className="glass-effect p-3 rounded-lg border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-neon-green" />
              <span className="text-sm text-white">
                Vous êtes lié à un coach
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
              Changer de coach
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
} 