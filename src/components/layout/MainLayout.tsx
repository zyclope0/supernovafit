'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user, userProfile, loading } = useAuth()
  const isCoach = userProfile?.role === 'coach'

  // Synchroniser avec l'état de la sidebar
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      
      if (!mobile) {
        const savedState = localStorage.getItem('sidebarCollapsed')
        if (savedState !== null) {
          setSidebarCollapsed(JSON.parse(savedState))
        }
      }
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    // Écouter les changements dans localStorage
    const handleStorageChange = () => {
      const savedState = localStorage.getItem('sidebarCollapsed')
      if (savedState !== null) {
        setSidebarCollapsed(JSON.parse(savedState))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <div className="flex h-screen bg-gradient-space">
      <Sidebar />
      
      {/* Main content */}
      <div className={`
        flex-1 transition-all duration-300 ease-in-out
        ${isMobile 
          ? 'ml-0' 
          : sidebarCollapsed 
            ? 'lg:ml-16' 
            : 'lg:ml-64'
        }
      `}>
        {/* Header avec badge Coach/Athlète en haut à droite */}
        {!loading && user && (
          <div className="absolute top-4 right-4 z-40">
            <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-sm text-accessible border border-white/20 shadow-lg">
              {isCoach ? 'Coach' : 'Athlète'}
            </div>
          </div>
        )}
        
        <main id="main-content" className="h-full overflow-y-auto">
          <div className="container mx-auto px-4 py-8 lg:px-8">
            {/* Breadcrumbs Navigation */}
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 