'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireCoach?: boolean
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  requireCoach = false 
}: AuthGuardProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push('/auth')
        return
      }
      
      if (requireCoach && userProfile?.role !== 'coach') {
        router.push('/')
        return
      }
    }
  }, [user, userProfile, loading, requireAuth, requireCoach, router])

  // Affichage du loading
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

  // Vérification de l'authentification
  if (requireAuth && !user) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="glass-effect p-6 rounded-lg border border-white/10 text-center">
            <h1 className="text-xl font-semibold text-white mb-4">Accès refusé</h1>
            <p className="text-accessible">Vous devez être connecté pour accéder à cette page.</p>
            <button 
              onClick={() => router.push('/auth')}
              className="mt-4 px-4 py-2 bg-neon-cyan text-space-900 rounded-lg hover:bg-neon-cyan/80 transition-colors"
            >
              Se connecter
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Vérification du rôle coach
  if (requireCoach && userProfile?.role !== 'coach') {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="glass-effect p-6 rounded-lg border border-white/10 text-center">
            <h1 className="text-xl font-semibold text-white mb-4">Accès refusé</h1>
            <p className="text-accessible">Cette page est réservée aux coaches.</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-neon-cyan text-space-900 rounded-lg hover:bg-neon-cyan/80 transition-colors"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return <>{children}</>
}
