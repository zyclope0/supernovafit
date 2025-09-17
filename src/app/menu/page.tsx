'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  BookOpen, 
  Trophy, 
  User, 
  Download, 
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell,
  Sparkles,
  BarChart3,
  Users,
  ArrowLeft
} from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'
import toast from 'react-hot-toast'

interface MenuSection {
  title: string
  items: MenuItem[]
}

interface MenuItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  href?: string
  action?: () => void
  badge?: string
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

export default function MenuPage() {
  const router = useRouter()
  const { userProfile, signOut } = useAuth()
  const { isInstallable, installApp } = usePWA()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      toast.success('Déconnexion réussie')
      router.push('/')
    } catch {
      toast.error('Erreur lors de la déconnexion')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleInstallPWA = async () => {
    try {
      await installApp()
      toast.success('Application installée ! 🎉')
    } catch {
      toast.error('Erreur lors de l&apos;installation')
    }
  }

  const menuSections: MenuSection[] = [
    {
      title: 'Suivi & Progression',
      items: [
        {
          id: 'journal',
          label: 'Journal',
          description: 'Humeur, énergie, notes',
          icon: BookOpen,
          href: '/journal'
        },
        {
          id: 'challenges',
          label: 'Challenges',
          description: 'Défis et récompenses',
          icon: Trophy,
          href: '/challenges',
          badge: 'Nouveau'
        },
        {
          id: 'export',
          label: 'Mes Données',
          description: 'Exporter mes statistiques',
          icon: BarChart3,
          href: '/export'
        }
      ]
    },
    {
      title: 'Compte & Paramètres',
      items: [
        {
          id: 'profile',
          label: 'Mon Profil',
          description: 'Informations personnelles',
          icon: User,
          href: '/profil'
        },
        {
          id: 'notifications',
          label: 'Notifications',
          description: 'Rappels et alertes',
          icon: Bell,
          href: '/notifications'
        }
      ]
    }
  ]

  // Ajouter l'installation PWA si disponible
  if (isInstallable) {
    menuSections[1].items.push({
      id: 'install',
      label: 'Installer l\'app',
      description: 'Accès rapide depuis l\'écran d\'accueil',
      icon: Download,
      action: handleInstallPWA,
      color: 'primary'
    })
  }

  // Ajouter section coach si applicable
  if (userProfile?.role === 'coach') {
    menuSections.unshift({
      title: 'Mode Coach',
      items: [
        {
          id: 'coach-dashboard',
          label: 'Dashboard Coach',
          description: 'Gérer mes athlètes',
          icon: Users,
          href: '/coach',
          color: 'success'
        }
      ]
    })
  }

  const getItemColor = (color: string = 'default') => {
    switch (color) {
      case 'primary':
        return 'text-blue-400 bg-blue-500/10'
      case 'success':
        return 'text-green-400 bg-green-500/10'
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/10'
      case 'danger':
        return 'text-red-400 bg-red-500/10'
      default:
        return 'text-white/80 bg-white/5'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-space pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          
          <h1 className="text-xl font-bold text-white">Menu</h1>
          
          <div className="w-16" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Info Card */}
        <div className="glass-effect rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                {userProfile?.nom || 'Utilisateur'}
              </h2>
              <p className="text-sm text-white/60">
                {userProfile?.role === 'coach' ? 'Coach' : 'Athlète'} • 
                {userProfile?.objectif || 'Aucun objectif'}
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider px-2">
              {section.title}
            </h3>
            
            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon
                const colorClasses = getItemColor(item.color)
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.action) {
                        item.action()
                      } else if (item.href) {
                        router.push(item.href)
                      }
                    }}
                    className="w-full glass-effect rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-white/60 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-white/40" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Aide et Support */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider px-2">
            Support
          </h3>
          
          <div className="space-y-2">
            <button
              onClick={() => router.push('/guide')}
              className="w-full glass-effect rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white/80" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-white">Guide d&apos;utilisation</span>
                  <p className="text-sm text-white/60 mt-1">
                    Comment utiliser l&apos;application
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </button>
          </div>
        </div>

        {/* Déconnexion */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full glass-effect rounded-xl p-4 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 bg-red-500/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <span className="font-medium text-red-400">
                {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
              </span>
            </div>
          </button>
        </div>

        {/* Version Info */}
        <div className="text-center text-white/40 text-sm py-4">
          SuperNovaFit v1.10.0 • Mobile-First UX
        </div>
      </div>
    </div>
  )
}
