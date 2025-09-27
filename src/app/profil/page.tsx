'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/hooks/useAuth'
import ProfileForm from '@/components/ui/ProfileForm'
import { User as UserIcon, TrendingUp, Target, Activity, Calculator } from 'lucide-react'
import { calculateTDEE } from '@/lib/userCalculations'
import type { User as UserProfile } from '@/types'
import AuthGuard from '@/components/auth/AuthGuard'
import ProfilProgressHeader from '@/components/profil/ProfilProgressHeader'
import ProfilCardClickable from '@/components/ui/ProfilCardClickable'

export default function ProfilPage() {
  const { userProfile } = useAuth()
  const [updatedProfile, setUpdatedProfile] = useState(userProfile)

  const handleProfileUpdate = (profile: UserProfile) => {
    setUpdatedProfile(profile)
  }

  // Calcul de la complétude du profil
  const calculateProfileCompleteness = () => {
    const profile = updatedProfile || userProfile
    if (!profile) return 0
    
    const fields = ['nom', 'age', 'sexe', 'taille', 'poids_initial', 'objectif', 'niveau_activite']
    const completedFields = fields.filter(field => profile[field as keyof typeof profile])
    return Math.round((completedFields.length / fields.length) * 100)
  }

  const completeness = calculateProfileCompleteness()
  const currentProfile = (updatedProfile || userProfile) as UserProfile | null

  // Données pour le ProgressHeader - Seulement la complétude avec progression
  const progressItems = [
    {
      icon: <UserIcon className="h-4 w-4" />,
      label: 'Complétude',
      data: {
        current: completeness,
        target: 100,
        unit: '%'
      },
      color: 'purple' as const
    }
  ]

  const generateSmartAdvice = () => {
    if (completeness < 50) {
      return "Complétez votre profil pour des recommandations personnalisées"
    }
    if (completeness < 100) {
      return "Quelques informations manquantes pour optimiser vos calculs"
    }
    return "Profil complet ! Vos données sont optimisées pour des recommandations précises"
  }

  return (
    <AuthGuard>
      <MainLayout>
        <div className="container mx-auto p-4 space-y-6">
          {/* ProgressHeader standardisé */}
          <ProfilProgressHeader
            title="PROFIL"
            emoji="👤"
            period="today"
            onPeriodChange={() => {}}
            items={progressItems}
            advice={generateSmartAdvice()}
          />

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

        {/* Vue d'ensemble avec ClickableCards */}
        {completeness > 50 && currentProfile && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <ProfilCardClickable
              data={{
                icon: <UserIcon className="h-4 w-4" />,
                label: 'Âge',
                value: currentProfile.age ? `${currentProfile.age} ans` : 'Non défini',
                color: 'purple'
              }}
              onView={() => {}}
              onEdit={() => {}}
              showActions={false}
            />
            
            <ProfilCardClickable
              data={{
                icon: <Target className="h-4 w-4" />,
                label: 'Objectif',
                value: currentProfile.objectif ? {
                  'maintien': '🎯 Maintien',
                  'prise_masse': '💪 Prise de masse',
                  'seche': '🔥 Sèche',
                  'performance': '⚡ Performance'
                }[currentProfile.objectif] : '❌ Non défini',
                color: currentProfile.objectif ? 'green' : 'red'
              }}
              onView={() => {}}
              onEdit={() => {}}
              showActions={false}
            />
            
            <ProfilCardClickable
              data={{
                icon: <Activity className="h-4 w-4" />,
                label: 'Activité',
                value: currentProfile.niveau_activite ? {
                  'sedentaire': '🪑 Sédentaire',
                  'leger': '🚶 Léger',
                  'modere': '🏃 Modéré',
                  'intense': '💪 Intense',
                  'tres_intense': '🔥 Très intense'
                }[currentProfile.niveau_activite] : '❌ Non défini',
                color: currentProfile.niveau_activite ? 'cyan' : 'red'
              }}
              onView={() => {}}
              onEdit={() => {}}
              showActions={false}
            />
            
            <ProfilCardClickable
              data={{
                icon: <Calculator className="h-4 w-4" />,
                label: 'IMC',
                value: currentProfile.taille && currentProfile.poids_initial ? 
                  (() => {
                    const imc = currentProfile.poids_initial / Math.pow(currentProfile.taille / 100, 2)
                    return `${imc.toFixed(1)}`
                  })() 
                  : '❌ Non calculé',
                color: (currentProfile.taille && currentProfile.poids_initial) ? 'pink' : 'red'
              }}
              onView={() => {}}
              onEdit={() => {}}
              showActions={false}
            />

            <ProfilCardClickable
              data={{
                icon: <TrendingUp className="h-4 w-4" />,
                label: 'TDEE',
                value: (() => {
                  const tdee = calculateTDEE(currentProfile)
                  return tdee ? `${tdee} kcal/j` : '❌ Non calculé'
                })(),
                color: calculateTDEE(currentProfile) ? 'green' : 'red'
              }}
              onView={() => {}}
              onEdit={() => {}}
              showActions={false}
            />
          </div>
        )}

        {/* Formulaire de profil */}
        {currentProfile ? (
          <ProfileForm 
            userProfile={currentProfile}
            onUpdate={handleProfileUpdate}
          />
        ) : (
          <div className="glass-effect p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-cyan border-t-transparent"></div>
            </div>
          </div>
        )}
      </div>
      </MainLayout>
    </AuthGuard>
  )
}