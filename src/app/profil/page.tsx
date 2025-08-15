'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/hooks/useAuth'
import ProfileForm from '@/components/ui/ProfileForm'
import { User, Settings, TrendingUp } from 'lucide-react'
import { calculateTDEE } from '@/lib/userCalculations'
import type { User as UserProfile } from '@/types'

export default function ProfilPage() {
  const { user, userProfile, loading } = useAuth()
  const [updatedProfile, setUpdatedProfile] = useState(userProfile)

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

  if (!user || !userProfile) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="glass-effect p-6 rounded-lg border border-white/10 text-center">
            <h1 className="text-xl font-semibold text-white mb-4">Accès refusé</h1>
            <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette page.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const handleProfileUpdate = (profile: UserProfile) => {
    setUpdatedProfile(profile)
  }

  // Calcul de la complétude du profil
  const calculateProfileCompleteness = () => {
    const profile = updatedProfile || userProfile
    const fields = ['nom', 'age', 'sexe', 'taille', 'poids_initial', 'objectif', 'niveau_activite']
    const completedFields = fields.filter(field => profile[field as keyof typeof profile])
    return Math.round((completedFields.length / fields.length) * 100)
  }

  const completeness = calculateProfileCompleteness()
  const currentProfile = updatedProfile || userProfile

  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Mon Profil</h1>
            <p className="text-muted-foreground">
              Configurez vos informations personnelles pour des recommandations personnalisées
            </p>
          </div>
          
          {/* Indicateur de complétude */}
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Profil complété</div>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-space-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-neon-cyan to-neon-green h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <span className="text-sm font-medium text-neon-cyan">{completeness}%</span>
            </div>
          </div>
        </div>

        {/* Alerte profil incomplet */}
        {completeness < 100 && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              <div>
                <h3 className="text-white font-medium">Complétez votre profil</h3>
                <p className="text-sm text-yellow-400/80">
                  Un profil complet nous permet de calculer vos besoins caloriques et de personnaliser vos recommandations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vue d'ensemble rapide */}
        {completeness > 50 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-neon-purple" />
                <span className="text-sm text-muted-foreground">Âge</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {currentProfile.age ? `${currentProfile.age} ans` : 'Non défini'}
              </div>
            </div>
            
            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-neon-green" />
                <span className="text-sm text-muted-foreground">Objectif</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {currentProfile.objectif ? {
                  'maintien': '🎯 Maintien',
                  'prise_masse': '💪 Prise de masse',
                  'seche': '🔥 Sèche',
                  'performance': '⚡ Performance'
                }[currentProfile.objectif] : 'Non défini'}
              </div>
            </div>
            
            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-neon-cyan" />
                <span className="text-sm text-muted-foreground">Activité</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {currentProfile.niveau_activite ? {
                  'sedentaire': '🪑 Sédentaire',
                  'leger': '🚶 Léger',
                  'modere': '🏃 Modéré',
                  'intense': '💪 Intense',
                  'tres_intense': '🔥 Très intense'
                }[currentProfile.niveau_activite] : 'Non défini'}
              </div>
            </div>
            
            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-neon-pink" />
                <span className="text-sm text-muted-foreground">IMC</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {currentProfile.taille && currentProfile.poids_initial ? 
                  (() => {
                    const imc = currentProfile.poids_initial / Math.pow(currentProfile.taille / 100, 2)
                    return `${imc.toFixed(1)}`
                  })() 
                  : 'Non calculé'
                }
              </div>
            </div>

            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-neon-green" />
                <span className="text-sm text-muted-foreground">TDEE</span>
              </div>
              <div className="text-lg font-semibold text-white">
                {(() => {
                  const tdee = calculateTDEE(currentProfile)
                  return tdee ? `${tdee} kcal/j` : 'Non calculé'
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de profil */}
        <ProfileForm 
          userProfile={currentProfile}
          onUpdate={handleProfileUpdate}
        />
      </div>
    </MainLayout>
  )
}