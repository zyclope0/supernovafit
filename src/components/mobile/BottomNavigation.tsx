'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  Utensils, 
  Dumbbell, 
  Scale, 
  Plus,
  MoreHorizontal
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  badge?: number
  primary?: boolean
}

interface BottomNavigationProps {
  className?: string
  onFabClick?: () => void
}

export default function BottomNavigation({ 
  className,
  onFabClick 
}: BottomNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Navigation items pour athlètes
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Accueil',
      icon: Home,
      href: '/',
      primary: true
    },
    {
      id: 'diete',
      label: 'Diète',
      icon: Utensils,
      href: '/diete'
    },
    {
      id: 'entrainements',
      label: 'Sport',
      icon: Dumbbell,
      href: '/entrainements'
    },
    {
      id: 'mesures',
      label: 'Mesures',
      icon: Scale,
      href: '/mesures'
    },
    {
      id: 'more',
      label: 'Plus',
      icon: MoreHorizontal,
      href: '/menu'
    }
  ]

  // Auto-hide sur scroll (mobile UX pattern)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false) // Hide when scrolling down
      } else {
        setIsVisible(true) // Show when scrolling up
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Déterminer l'item actif
  const getActiveItem = () => {
    if (pathname === '/') return 'dashboard'
    if (pathname.startsWith('/diete')) return 'diete'
    if (pathname.startsWith('/entrainements')) return 'entrainements'
    if (pathname.startsWith('/mesures')) return 'mesures'
    if (pathname.startsWith('/journal')) return 'more'
    if (pathname.startsWith('/challenges')) return 'more'
    if (pathname.startsWith('/guide')) return 'more'
    if (pathname.startsWith('/menu')) return 'more'
    return 'more'
  }

  const activeItem = getActiveItem()

  const handleNavClick = (item: NavItem) => {
    if (item.id === 'more') {
      // Ouvrir menu contextuel ou naviguer vers page menu
      router.push('/menu')
    } else {
      router.push(item.href)
    }
  }

  // Ne pas afficher si pas connecté
  if (!user) return null

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div 
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-black/90 backdrop-blur-xl border-t border-white/10',
          'transition-transform duration-300 ease-in-out',
          isVisible ? 'translate-y-0' : 'translate-y-full',
          'md:hidden', // Mobile only
          className
        )}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'flex flex-col items-center justify-center',
                  'px-3 py-2 rounded-xl transition-all duration-200',
                  'min-w-[60px] relative',
                  isActive 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-white/60 hover:text-white/80'
                )}
              >
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
                
                {/* Icon */}
                <Icon 
                  className={cn(
                    'w-5 h-5 mb-1',
                    isActive ? 'text-blue-400' : 'text-white/60'
                  )} 
                />
                
                {/* Label */}
                <span className={cn(
                  'text-xs font-medium',
                  isActive ? 'text-blue-400' : 'text-white/60'
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* FAB (Floating Action Button) */}
      <button
        onClick={onFabClick}
        className={cn(
          'fixed bottom-20 right-4 z-50',
          'w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600',
          'text-white rounded-full shadow-2xl',
          'flex items-center justify-center',
          'transition-all duration-300 ease-in-out',
          'hover:scale-110 active:scale-95',
          'md:hidden', // Mobile only
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
        )}
      >
        <Plus className="w-6 h-6" />
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300" />
      </button>

      {/* Safe area padding for mobile */}
      <div className="h-20 md:hidden" />
    </>
  )
}
