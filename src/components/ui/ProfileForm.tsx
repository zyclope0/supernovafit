'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Save, User as UserIcon, Target, Activity, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileFormProps {
  userProfile: User
  onUpdate: (profile: User) => void
}

export default function ProfileForm({ userProfile, onUpdate }: ProfileFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<Partial<User>>({
    nom: userProfile.nom || '',
    age: userProfile.age || undefined,
    sexe: userProfile.sexe || undefined,
    taille: userProfile.taille || undefined,
    poids_initial: userProfile.poids_initial || undefined,
    objectif: userProfile.objectif || 'maintien',
    niveau_activite: userProfile.niveau_activite || 'modere',
    unite_poids: userProfile.unite_poids || 'kg',
    unite_taille: userProfile.unite_taille || 'cm',
    langue: userProfile.langue || 'fr'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    
    try {
      const updatedProfile = {
        ...formData,
        profil_complete: true,
        updated_at: new Date()
      }

      // Filtrer les valeurs undefined
      const filteredData = Object.fromEntries(
        Object.entries(updatedProfile).filter(([_, value]) => value !== undefined)
      )

      await updateDoc(doc(db, 'users', user.uid), filteredData)
      
      onUpdate({ ...userProfile, ...filteredData } as User)
      toast.success('✅ Profil mis à jour avec succès !')
      
    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      toast.error('❌ Erreur lors de la mise à jour')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof User, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Calcul BMR (Basal Metabolic Rate) selon formule Mifflin-St Jeor
  const calculateBMR = () => {
    if (!formData.age || !formData.taille || !formData.poids_initial || !formData.sexe) return null
    
    const bmr = formData.sexe === 'M' 
      ? (10 * formData.poids_initial) + (6.25 * formData.taille) - (5 * formData.age) + 5
      : (10 * formData.poids_initial) + (6.25 * formData.taille) - (5 * formData.age) - 161
    
    return Math.round(bmr)
  }

  // Calcul TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = () => {
    const bmr = calculateBMR()
    if (!bmr || !formData.niveau_activite) return null

    const activityMultipliers = {
      sedentaire: 1.2,
      leger: 1.375,
      modere: 1.55,
      intense: 1.725,
      tres_intense: 1.9
    }

    return Math.round(bmr * activityMultipliers[formData.niveau_activite])
  }

  return (
    <div className="glass-effect p-6 rounded-lg border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <UserIcon className="h-6 w-6 text-neon-cyan" />
        <h2 className="text-xl font-semibold text-white">Profil Utilisateur</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-neon-purple" />
            Informations personnelles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Nom</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white focus:outline-none focus:border-neon-cyan select-dark"
                placeholder="Votre nom"
              />
            </div>
            
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Âge</label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleChange('age', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white focus:outline-none focus:border-neon-cyan select-dark"
                placeholder="25"
                min="10"
                max="120"
              />
            </div>
            
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Sexe</label>
              <select
                value={formData.sexe || ''}
                onChange={(e) => handleChange('sexe', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white focus:outline-none focus:border-neon-cyan select-dark"
              >
                <option value="">Non spécifié</option>
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Taille ({formData.unite_taille})
              </label>
              <input
                type="number"
                value={formData.taille || ''}
                onChange={(e) => handleChange('taille', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white focus:outline-none focus:border-neon-cyan select-dark"
                placeholder="175"
                min="100"
                max="250"
              />
            </div>
            
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Poids initial ({formData.unite_poids})
              </label>
              <input
                type="number"
                value={formData.poids_initial || ''}
                onChange={(e) => handleChange('poids_initial', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white focus:outline-none focus:border-neon-cyan select-dark"
                placeholder="70"
                min="30"
                max="300"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Objectifs */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-neon-green" />
            Objectifs
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Objectif principal</label>
              <select
                value={formData.objectif}
                onChange={(e) => handleChange('objectif', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white focus:outline-none focus:border-neon-cyan select-dark"
              >
                <option value="maintien">🎯 Maintien du poids</option>
                <option value="prise_masse">💪 Prise de masse</option>
                <option value="seche">🔥 Sèche / Perte de poids</option>
                <option value="performance">⚡ Performance sportive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Niveau d'activité</label>
              <select
                value={formData.niveau_activite}
                onChange={(e) => handleChange('niveau_activite', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white focus:outline-none focus:border-neon-cyan select-dark"
              >
                <option value="sedentaire">🪑 Sédentaire (bureau, peu d'exercice)</option>
                <option value="leger">🚶 Léger (1-3 jours/semaine)</option>
                <option value="modere">🏃 Modéré (3-5 jours/semaine)</option>
                <option value="intense">💪 Intense (6-7 jours/semaine)</option>
                <option value="tres_intense">🔥 Très intense (2x/jour, athlète)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Préférences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-neon-pink" />
            Préférences
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Unité de poids</label>
              <select
                value={formData.unite_poids}
                onChange={(e) => handleChange('unite_poids', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white focus:outline-none focus:border-neon-cyan select-dark"
              >
                <option value="kg">Kilogrammes (kg)</option>
                <option value="lbs">Livres (lbs)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Unité de taille</label>
              <select
                value={formData.unite_taille}
                onChange={(e) => handleChange('unite_taille', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white focus:outline-none focus:border-neon-cyan select-dark"
              >
                <option value="cm">Centimètres (cm)</option>
                <option value="ft">Pieds (ft)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Langue</label>
              <select
                value={formData.langue}
                onChange={(e) => handleChange('langue', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded text-white focus:outline-none focus:border-neon-cyan select-dark"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calculs automatiques */}
        {formData.age && formData.taille && formData.poids_initial && formData.sexe && (
          <div className="bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/20 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-neon-cyan" />
              Calculs personnalisés
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Métabolisme de base (BMR) :</span>
                <span className="text-neon-cyan font-medium ml-2">{calculateBMR()} kcal/jour</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dépense énergétique (TDEE) :</span>
                <span className="text-neon-green font-medium ml-2">{calculateTDEE()} kcal/jour</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ces valeurs seront utilisées pour personnaliser vos recommandations caloriques
            </p>
          </div>
        )}

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-medium rounded-lg hover:from-neon-cyan/80 hover:to-neon-purple/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? 'Enregistrement...' : 'Sauvegarder le profil'}
          </button>
        </div>
      </form>
    </div>
  )
}