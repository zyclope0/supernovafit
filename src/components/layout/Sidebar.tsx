'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { APP_VERSION } from '@/lib/constants'
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  ScaleIcon,
  BookOpenIcon,
  UserGroupIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  SparklesIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChartPieIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrophyIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Diète', href: '/diete', icon: ChartBarIcon },
  { name: 'Entraînements', href: '/entrainements', icon: CalendarIcon },
  { name: 'Mesures', href: '/mesures', icon: ScaleIcon },
  { name: 'Journal', href: '/journal', icon: BookOpenIcon },
  { name: 'Challenges', href: '/challenges', icon: TrophyIcon },
  { name: 'Guide', href: '/guide', icon: QuestionMarkCircleIcon },
  { name: 'Export', href: '/export', icon: DocumentTextIcon },
]

const publicNavigation = [
  { name: 'Accueil', href: '/', icon: HomeIcon },
  { name: 'Guide', href: '/guide', icon: BookOpenIcon },
  { name: 'Nouveautés', href: '/nouveautes', icon: SparklesIcon },
]

const coachNavigation = [
  { name: 'Dashboard', href: '/coach', icon: HomeIcon },
  { name: 'Mes Athlètes', href: '/coach/mes-athletes', icon: UserGroupIcon },
  { name: 'Tous les Athlètes', href: '/coach/all-athletes', icon: UsersIcon },
  { name: 'Programmes', href: '/coach/programmes', icon: ClipboardDocumentListIcon },
  { name: 'Rapports', href: '/coach/rapports', icon: ChartPieIcon },
]

const authNavigation = [
  { name: 'Profil', href: '/profil', icon: CogIcon },
  { name: 'Nouveautés', href: '/nouveautes', icon: SparklesIcon },
]

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const { user, userProfile, loading, signOut } = useAuth()
  const isCoach = userProfile?.role === 'coach'

  // Détection du type d'appareil et gestion responsive
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      
      // Sur mobile : sidebar fermée par défaut
      // Sur desktop : sidebar ouverte par défaut
      if (mobile) {
        setSidebarOpen(false)
        setSidebarCollapsed(false)
      } else {
        setSidebarOpen(true)
        // Récupérer l'état de la sidebar depuis localStorage
        const savedState = localStorage.getItem('sidebarCollapsed')
        if (savedState !== null) {
          setSidebarCollapsed(JSON.parse(savedState))
        }
      }
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Sauvegarder l'état de la sidebar dans localStorage
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed))
    }
  }, [sidebarCollapsed, isMobile])

  // Navigation clavier pour la sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen && isMobile) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, isMobile])

  const handleSignOut = async () => {
    try {
      const result = await signOut()
      if (result.success) {
        // Rediriger vers la page d'accueil après déconnexion
        window.location.href = '/'
      } else {
        console.error('Erreur lors de la déconnexion:', result.error)
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const currentNavigation = isCoach ? coachNavigation : navigation
  const displayNavigation = user ? currentNavigation : publicNavigation

  return (
    <>
      {/* Bouton d'ouverture (mobile uniquement) */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200 focus-accessible"
          aria-label="Ouvrir le menu latéral"
          aria-expanded={sidebarOpen}
          aria-controls="main-nav"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      )}

      {/* Overlay (mobile uniquement) */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        id="main-nav"
        className={`
          fixed top-0 left-0 h-full bg-space-900/95 backdrop-blur-xl border-r border-white/10 z-50
          transition-all duration-300 ease-in-out
          ${isMobile 
            ? `w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `${sidebarCollapsed ? 'w-16' : 'w-64'}`
          }
        `}
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">SuperNovaFit</h1>
                  <p className="text-xs text-accessible">Plateforme Fitness</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              {/* Bouton collapse/expand (desktop uniquement) */}
              {!isMobile && (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-all duration-200 focus-accessible"
                  aria-label={sidebarCollapsed ? "Développer la sidebar" : "Réduire la sidebar"}
                >
                  {sidebarCollapsed ? (
                    <ChevronRightIcon className="h-5 w-5" />
                  ) : (
                    <ChevronLeftIcon className="h-5 w-5" />
                  )}
                </button>
              )}
              
              {/* Bouton fermer (mobile uniquement) */}
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-all duration-200 focus-accessible"
                  aria-label="Fermer le menu latéral"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2" role="menubar">
            {!loading && displayNavigation.map((item) => {
            // Pour le mode coach, éviter la double surbrillance
            const isActive = user && userProfile?.role === 'coach' 
              ? pathname === item.href && !(item.name === 'Mes Athlètes' && pathname === '/coach')
              : pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  nav-accessible
                  ${isActive 
                    ? 'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30 glow-purple text-white' 
                    : 'text-accessible hover:text-white hover:bg-white/5 hover:glow-cyan'
                  }
                `}
                onClick={() => isMobile && setSidebarOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (isMobile) setSidebarOpen(false)
                  }
                }}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className={`
                  transition-colors duration-200
                  ${sidebarCollapsed ? 'h-5 w-5' : 'mr-3 h-5 w-5'}
                  ${isActive ? 'text-neon-purple' : 'text-accessible group-hover:text-neon-cyan'}
                `} aria-hidden="true" />
                {!sidebarCollapsed && (
                  <span className="flex-1 flex items-center justify-between">
                    <span>{item.name}</span>
                  </span>
                )}
              </Link>
            )
          })}
          </nav>

          {/* Navigation d'authentification */}
          <div className="px-4 py-4 border-t border-white/10">
            <nav className="space-y-2" role="menubar">
              {!loading && user && authNavigation.map((item) => {
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      nav-accessible
                      ${isActive 
                        ? 'bg-gradient-to-r from-neon-green/20 to-neon-green/10 border border-neon-green/30 text-white' 
                        : 'text-accessible hover:text-white hover:bg-white/5 hover:glow-green'
                      }
                    `}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if (isMobile) setSidebarOpen(false)
                      }
                    }}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className={`
                      transition-colors duration-200
                      ${sidebarCollapsed ? 'h-5 w-5' : 'mr-3 h-5 w-5'}
                      ${isActive ? 'text-neon-green' : 'text-accessible group-hover:text-neon-green'}
                    `} aria-hidden="true" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
              
              {/* Bouton de connexion/déconnexion */}
              {!loading && user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-accessible hover:text-white hover:bg-white/5 focus-accessible"
                  aria-label="Se déconnecter"
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSignOut()
                    }
                  }}
                  title={sidebarCollapsed ? "Se déconnecter" : undefined}
                >
                  <ArrowRightOnRectangleIcon className={`
                    transition-colors duration-200 text-accessible group-hover:text-red-400
                    ${sidebarCollapsed ? 'h-5 w-5' : 'mr-3 h-5 w-5'}
                  `} aria-hidden="true" />
                  {!sidebarCollapsed && <span>Se déconnecter</span>}
                </button>
              ) : !loading ? (
                <Link
                  href="/auth"
                  className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-accessible hover:text-white hover:bg-white/5 focus-accessible"
                  aria-label="Se connecter"
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      if (isMobile) setSidebarOpen(false)
                    }
                  }}
                  title={sidebarCollapsed ? "Se connecter" : undefined}
                >
                  <ArrowRightOnRectangleIcon className={`
                    transition-colors duration-200 text-accessible group-hover:text-neon-green
                    ${sidebarCollapsed ? 'h-5 w-5' : 'mr-3 h-5 w-5'}
                  `} aria-hidden="true" />
                  {!sidebarCollapsed && <span>Se connecter</span>}
                </Link>
              ) : null}
            </nav>
            
            {/* Informations de version et liens */}
            {!sidebarCollapsed && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-xs text-accessible text-center space-y-2">
                  <div>Version {APP_VERSION}</div>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    <Link href="/legal/privacy" className="text-accessible hover:text-neon-cyan transition-colors">
                      Confidentialité
                    </Link>
                    <span className="text-white/30">·</span>
                    <Link href="/legal/cookies" className="text-accessible hover:text-neon-cyan transition-colors">
                      Cookies
                    </Link>
                    <span className="text-white/30">·</span>
                    <Link href="/legal/terms" className="text-accessible hover:text-neon-cyan transition-colors">
                      CGU
                    </Link>
                  </div>
                  <div className="text-white/40">Thème Espace 🚀</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 