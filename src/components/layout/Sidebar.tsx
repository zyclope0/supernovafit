'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCoachCommentsByModule } from '@/hooks/useFirestore'
import {
  HomeIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ScaleIcon,
  BookOpenIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  RocketLaunchIcon,
  BugAntIcon,
  UserIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

// Navigation pour les utilisateurs normaux (sportifs)
const userNavigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Diète', href: '/diete', icon: ChartBarIcon },
  { name: 'Entraînements', href: '/entrainements', icon: CalendarDaysIcon },
  { name: 'Mesures', href: '/mesures', icon: ScaleIcon },
  { name: 'Journal', href: '/journal', icon: BookOpenIcon },
  { name: 'Mon Profil', href: '/profil', icon: UserIcon },
]

// Navigation spécifique pour les coachs
const coachNavigation = [
  { name: 'Tableau de bord', href: '/coach', icon: HomeIcon },
  { name: 'Mes Athlètes', href: '/coach', icon: UsersIcon },
  { name: 'Programmes', href: '/coach/programmes', icon: CalendarDaysIcon },
  { name: 'Rapports', href: '/coach/rapports', icon: ChartBarIcon },
  { name: 'Invitations', href: '/coach/invitations', icon: UserIcon },
]

const authNavigation = [
  { name: 'Authentification', href: '/auth', icon: CogIcon },
]

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { userProfile } = useAuth()
  
  // Badges nouveaux commentaires (dernieres 24h) pour l'athlète
  const isCoach = userProfile?.role === 'coach'
  const dieteC = useCoachCommentsByModule(!isCoach ? 'diete' : 'diete')
  const entrC = useCoachCommentsByModule(!isCoach ? 'entrainements' : 'entrainements')
  const journC = useCoachCommentsByModule(!isCoach ? 'journal' : 'journal')
  const mesC = useCoachCommentsByModule(!isCoach ? 'mesures' : 'mesures')
  const now = new Date().getTime()
  const isNewAndUnread = (c: any) => {
    if (c?.read_by_athlete === true) return false
    const created = c?.created_at?.toDate?.() || (c?.created_at ? new Date(c.created_at) : null)
    if (!created) return false
    return now - created.getTime() <= 24 * 60 * 60 * 1000
  }
  const newCounts = {
    diete: dieteC.comments?.filter(isNewAndUnread).length || 0,
    entrainements: entrC.comments?.filter(isNewAndUnread).length || 0,
    journal: journC.comments?.filter(isNewAndUnread).length || 0,
    mesures: mesC.comments?.filter(isNewAndUnread).length || 0,
  }
  
  // Choisir la navigation selon le rôle de l'utilisateur
  const navigation = userProfile?.role === 'coach' ? coachNavigation : userNavigation

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="glass-effect p-2 rounded-lg glow-purple"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        glass-effect border-r border-white/10
      `}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <RocketLaunchIcon className="h-8 w-8 text-neon-purple animate-pulse-glow" />
              <div>
                <h1 className="text-xl font-bold neon-text">SuperNovaFit</h1>
                <p className="text-xs text-muted-foreground">Plateforme Fitness</p>
              </div>
            </div>
            <button
              type="button"
              className="lg:hidden p-1 rounded-md text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              // Pour le mode coach, éviter la double surbrillance
              const isActive = userProfile?.role === 'coach' 
                ? pathname === item.href && !(item.name === 'Mes Athlètes' && pathname === '/coach')
                : pathname === item.href
                
              const badgeCount = !isCoach ? (
                item.name === 'Diète' ? newCounts.diete :
                item.name === 'Entraînements' ? newCounts.entrainements :
                item.name === 'Journal' ? newCounts.journal :
                item.name === 'Mesures' ? newCounts.mesures : 0
              ) : 0

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30 glow-purple text-white' 
                      : 'text-muted-foreground hover:text-white hover:bg-white/5 hover:glow-cyan'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`
                    mr-3 h-5 w-5 transition-colors duration-200
                    ${isActive ? 'text-neon-purple' : 'text-muted-foreground group-hover:text-neon-cyan'}
                  `} />
                  <span className="flex-1 flex items-center justify-between">
                    <span>{item.name}</span>
                    {badgeCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-5 px-1 text-[10px] font-semibold rounded-full bg-neon-pink/30 text-neon-pink border border-neon-pink/40">
                        {badgeCount}
                      </span>
                    )}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Auth Section */}
          <div className="px-4 pb-4">
            {authNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 border border-neon-green/30 glow-cyan text-white' 
                      : 'text-muted-foreground hover:text-white hover:bg-white/5 hover:glow-green'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`
                    mr-2 h-4 w-4 transition-colors duration-200
                    ${isActive ? 'text-neon-green' : 'text-muted-foreground group-hover:text-neon-green'}
                  `} />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="text-xs text-muted-foreground text-center">
              <p>Version 1.0.0</p>
              <p className="mt-1">Thème Espace 🚀</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 