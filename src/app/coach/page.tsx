'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCoachAthletes } from '@/hooks/useFirestore'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { Users, TrendingUp, Calendar, FileText, Award, Plus, Search, Activity, BarChart3, BookOpen, Scale } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// interface AthleteWithStats {
//   id: string
//   nom: string
//   email: string
//   objectif?: string
//   derniere_activite?: Date
//   stats?: {
//     entrainements_semaine: number
//     calories_jour_moyen: number
//     progression_poids?: number
//   }
// }

export default function CoachDashboard() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const { athletes: coachAthletes } = useCoachAthletes()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier que l'utilisateur est bien un coach
    if (userProfile && userProfile.role !== 'coach') {
      toast.error("Accès réservé aux coachs")
      router.push('/')
    }
    if (userProfile) {
      setLoading(false)
    }
  }, [userProfile, router])



  // Filtrer les athlètes
  const filteredAthletes = coachAthletes.filter(athlete => {
    const matchesSearch = athlete.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Statistiques globales
  const stats = {
    totalAthletes: coachAthletes.length,
    athletesActifs: coachAthletes.length, // Tous actifs pour le moment
    progressionMoyenne: 0, // À calculer depuis les vraies données
    tauxReussite: 0 // À calculer depuis les objectifs
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Dashboard Coach
              <span className="ml-3 text-sm text-gray-400 font-normal">
                Gérez vos athlètes et suivez leurs progressions
              </span>
            </h1>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Inviter un athlète
          </button>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Athlètes</p>
                <p className="text-3xl font-bold text-white">{stats.totalAthletes}</p>
                <p className="text-xs text-neon-green mt-1">
                  {stats.athletesActifs} actifs
                </p>
              </div>
              <Users className="w-10 h-10 text-neon-purple opacity-50" />
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Progression Moyenne</p>
                <p className="text-3xl font-bold text-white">
                  +{stats.progressionMoyenne.toFixed(1)}%
                </p>
                <p className="text-xs text-neon-cyan mt-1">
                  Sur 30 jours
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-neon-green opacity-50" />
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Taux de Réussite</p>
                <p className="text-3xl font-bold text-white">{stats.tauxReussite}%</p>
                <p className="text-xs text-neon-pink mt-1">
                  Objectifs atteints
                </p>
              </div>
              <Award className="w-10 h-10 text-neon-pink opacity-50" />
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Programmes Actifs</p>
                <p className="text-3xl font-bold text-white">12</p>
                <p className="text-xs text-neon-purple mt-1">
                  3 nouveaux ce mois
                </p>
              </div>
              <Calendar className="w-10 h-10 text-neon-cyan opacity-50" />
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="glass-effect rounded-xl p-4 border border-white/10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un athlète..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                         text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple"
              />
            </div>
            <div className="text-sm text-gray-400">
              {filteredAthletes.length} athlète{filteredAthletes.length > 1 ? 's' : ''} trouvé{filteredAthletes.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Liste des athlètes */}
        {filteredAthletes.length === 0 ? (
          <div className="glass-effect rounded-xl p-12 border border-white/10 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun athlète trouvé
            </h3>
            <p className="text-gray-400 mb-6">
              Commencez par inviter des athlètes à rejoindre votre équipe
            </p>
            <button className="btn-primary mx-auto">
              <Plus className="w-4 h-4 mr-2" />
              Inviter un athlète
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAthletes.map((athlete) => (
              <div
                key={athlete.id}
                className="glass-effect rounded-xl p-6 border border-white/10 hover:border-neon-purple/50 
                         transition-all hover:transform hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{athlete.nom || 'Utilisateur'}</h3>
                    <p className="text-sm text-gray-400">{athlete.email}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-neon-green/20 text-neon-green">
                    Actif
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Objectif</span>
                    <span className="text-sm text-white">
                      {athlete.objectif === 'prise_masse' ? 'Prise de masse' :
                       athlete.objectif === 'seche' ? 'Sèche' :
                       athlete.objectif === 'performance' ? 'Performance' :
                       'Maintien'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Dernière connexion</span>
                    <span className="text-sm text-white">
                      {athlete.dernier_acces ? 
                        new Date(athlete.dernier_acces.seconds * 1000).toLocaleDateString('fr-FR') :
                        'Jamais'}
                    </span>
                  </div>

                  {/* Actions rapides pour chaque athlète */}
                  <div className="pt-3 border-t border-white/10 flex gap-2">
                    <Link
                      href={`/coach/athlete/${athlete.id}/diete`}
                      className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
                      title="Voir la diète"
                    >
                      <BarChart3 className="w-4 h-4 text-neon-purple mx-auto" />
                    </Link>
                    <Link
                      href={`/coach/athlete/${athlete.id}/entrainements`}
                      className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
                      title="Voir les entraînements"
                    >
                      <Activity className="w-4 h-4 text-neon-cyan mx-auto" />
                    </Link>
                    <Link
                      href={`/coach/athlete/${athlete.id}/journal`}
                      className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
                      title="Voir le journal"
                    >
                      <BookOpen className="w-4 h-4 text-neon-green mx-auto" />
                    </Link>
                    <Link
                      href={`/coach/athlete/${athlete.id}/mesures`}
                      className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
                      title="Voir les mesures"
                    >
                      <Scale className="w-4 h-4 text-neon-purple mx-auto" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/coach/programmes"
            className="glass-effect rounded-xl p-6 border border-white/10 hover:border-neon-purple/50 
                     transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <Calendar className="w-12 h-12 text-neon-purple group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg font-semibold text-white">Programmes</h3>
                <p className="text-sm text-gray-400">Créer et gérer les programmes</p>
              </div>
            </div>
          </Link>

          <Link
            href="/coach/rapports"
            className="glass-effect rounded-xl p-6 border border-white/10 hover:border-neon-cyan/50 
                     transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <FileText className="w-12 h-12 text-neon-cyan group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg font-semibold text-white">Rapports</h3>
                <p className="text-sm text-gray-400">Analyser les progressions</p>
              </div>
            </div>
          </Link>

          <Link
            href="/coach/invitations"
            className="glass-effect rounded-xl p-6 border border-white/10 hover:border-neon-green/50 
                     transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <Plus className="w-12 h-12 text-neon-green group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg font-semibold text-white">Invitations</h3>
                <p className="text-sm text-gray-400">Gérer les invitations</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}
