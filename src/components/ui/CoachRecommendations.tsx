'use client'

import { CoachDietPlan } from '@/types'
import { ChefHat, Clock, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface CoachRecommendationsProps {
  plan: CoachDietPlan | null
  loading: boolean
}

export default function CoachRecommendations({ plan, loading }: CoachRecommendationsProps) {
  const [open, setOpen] = useState(false)
  
  if (loading) {
    return (
      <div className="glass-effect rounded-xl p-4 border border-white/10 mb-6">
        <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-neon-purple" />
            <h2 className="text-lg font-semibold text-white">Recommandations Coach</h2>
          </div>
          {open ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4 text-white" />}
        </button>
        {open && <p className="text-gray-400 mt-4">Chargement des recommandations...</p>}
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="glass-effect rounded-xl p-4 border border-white/10 mb-6">
        <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-neon-purple" />
            <h2 className="text-lg font-semibold text-white">Recommandations Coach</h2>
          </div>
          {open ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4 text-white" />}
        </button>
        {open && (
          <p className="text-gray-400 mt-4">Aucune recommandation disponible pour le moment.</p>
        )}
      </div>
    )
  }

  const mealTypes = [
    { key: 'petit_dej', label: 'Petit Déjeuner', icon: '🌅' },
    { key: 'collation_matin', label: 'Collation Matin', icon: '☕' },
    { key: 'dejeuner', label: 'Déjeuner', icon: '🍽️' },
    { key: 'collation_apres_midi', label: 'Collation Après-midi', icon: '🍎' },
    { key: 'diner', label: 'Dîner', icon: '🌙' },
    { key: 'collation_soir', label: 'Collation Soir', icon: '🌃' }
  ]

  return (
    <div className="glass-effect rounded-xl p-4 border border-white/10 mb-6">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChefHat className="w-5 h-5 text-neon-purple" />
          <h2 className="text-lg font-semibold text-white">Recommandations Coach</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Plan du {new Date(plan.date_creation).toLocaleDateString('fr-FR')}</span>
          </div>
          {open ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4 text-white" />}
        </div>
      </button>

      {!open ? null : (
        <div className="mt-6">
          {/* Notes générales */}
          {plan.notes_generales && (
            <div className="bg-neon-purple/10 border border-neon-purple/20 rounded-lg p-4 mb-6">
              <h3 className="text-neon-purple font-medium mb-2">📝 Notes Générales</h3>
              <p className="text-gray-300 text-sm whitespace-pre-wrap line-clamp-3">{plan.notes_generales}</p>
            </div>
          )}

          {/* Recommandations par repas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mealTypes.map(({ key, label, icon }) => {
              const content = plan[key as keyof typeof plan] as string
              return content ? (
                <div key={key} className="bg-white/5 rounded-lg p-4 border border-white/5">
                  <h3 className="text-neon-cyan font-medium mb-2 flex items-center space-x-2">
                    <span>{icon}</span>
                    <span>{label}</span>
                  </h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed line-clamp-3">{content}</p>
                </div>
              ) : null
            })}
          </div>

          {/* Aucune recommandation si toutes vides */}
          {!mealTypes.some(({ key }) => plan[key as keyof typeof plan] as string) && (
            <p className="text-gray-400 text-center py-4">
              Le plan existe mais aucune recommandation spécifique n&apos;a été ajoutée.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
