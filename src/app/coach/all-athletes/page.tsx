'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAllAthletes } from '@/hooks/useFirestore'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { Users, Search, UserCheck, UserX, Mail, Calendar, Filter, Target, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

type FilterType = 'all' | 'with-coach' | 'without-coach'
type ObjectifType = 'all' | 'maintien' | 'prise_masse' | 'seche' | 'performance'

// Type pour les athlètes dans la page
interface AthleteData {
  id: string
  nom?: string
  email?: string
  objectif?: string
  dernier_acces?: unknown
  ownerCoachId?: string
  date_invitation?: unknown
  role?: string
}

export default function AllAthletesPage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const { athletes, loading } = useAllAthletes()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [objectifFilter, setObjectifFilter] = useState<ObjectifType>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null)

  useEffect(() => {
    if (userProfile && userProfile.role !== 'coach') {
      toast.error("Accès réservé aux coachs")
      router.push('/')
    }
  }, [userProfile, router])

  // Fonction pour déterminer si un athlète est actif (7 jours)
  const isAthleteActive = (dernierAcces: unknown) => {
    if (!dernierAcces) return false
    
    const lastAccess = typeof dernierAcces === 'object' && dernierAcces && 'seconds' in (dernierAcces as Record<string, unknown>)
      ? new Date((dernierAcces as { seconds: number }).seconds * 1000)
      : new Date(dernierAcces as string | number | Date)
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return lastAccess > sevenDaysAgo
  }

  // Fonction pour formater la date d'invitation
  const formatInvitationDate = (dateInvitation: unknown) => {
    if (!dateInvitation) return 'Non disponible'
    
    const date = typeof dateInvitation === 'object' && dateInvitation && 'seconds' in (dateInvitation as Record<string, unknown>)
      ? new Date((dateInvitation as { seconds: number }).seconds * 1000)
      : new Date(dateInvitation as string | number | Date)
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Fonction pour formater la dernière activité
  const formatLastActivity = (dernierAcces: unknown) => {
    if (!dernierAcces) return 'Jamais'
    
    const lastAccess = typeof dernierAcces === 'object' && dernierAcces && 'seconds' in (dernierAcces as Record<string, unknown>)
      ? new Date((dernierAcces as { seconds: number }).seconds * 1000)
      : new Date(dernierAcces as string | number | Date)
    
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Aujourd\'hui'
    if (diffInDays === 1) return 'Hier'
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`
    return lastAccess.toLocaleDateString('fr-FR')
  }

  // Filtrer les athlètes selon la recherche et les filtres
  const filteredAthletes = athletes.filter((athlete: AthleteData) => {
    const matchesSearch = athlete.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    // Filtre par statut coach
    const matchesCoachFilter = filterType === 'all' || 
      (filterType === 'with-coach' && athlete.ownerCoachId) ||
      (filterType === 'without-coach' && !athlete.ownerCoachId)

    if (!matchesCoachFilter) return false

    // Filtre par objectif
    const matchesObjectifFilter = objectifFilter === 'all' || athlete.objectif === objectifFilter

    return matchesObjectifFilter
  })

  // Statistiques
  const stats = {
    total: athletes.length,
    withCoach: athletes.filter((a: AthleteData) => a.ownerCoachId).length,
    withoutCoach: athletes.filter((a: AthleteData) => !a.ownerCoachId).length,
    active: athletes.filter((a: AthleteData) => isAthleteActive(a.dernier_acces)).length,
    inactive: athletes.filter((a: AthleteData) => !isAthleteActive(a.dernier_acces)).length
  }

  const handleInvite = (athleteId: string) => {
    setSelectedAthlete(athleteId)
    setShowInviteModal(true)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="glass-effect p-6 rounded-xl border border-white/10">
            <div className="animate-pulse">
              <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tous les Athlètes</h1>
            <p className="text-muted-foreground">
              Gérez et invitez des athlètes à rejoindre votre équipe
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-8 h-8 text-neon-purple" />
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-neon-purple" />
            </div>
          </div>
          
          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avec Coach</p>
                <p className="text-2xl font-bold text-neon-green">{stats.withCoach}</p>
              </div>
              <UserCheck className="w-8 h-8 text-neon-green" />
            </div>
          </div>
          
          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sans Coach</p>
                <p className="text-2xl font-bold text-neon-cyan">{stats.withoutCoach}</p>
              </div>
              <UserX className="w-8 h-8 text-neon-cyan" />
            </div>
          </div>

          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold text-neon-green">{stats.active}</p>
              </div>
              <Clock className="w-8 h-8 text-neon-green" />
            </div>
          </div>

          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactifs</p>
                <p className="text-2xl font-bold text-gray-400">{stats.inactive}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="glass-effect p-6 rounded-xl border border-white/10">
          <div className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="all-athletes-search" className="sr-only">
                Rechercher un athlète
              </label>
              <input
                id="all-athletes-search"
                type="text"
                placeholder="Rechercher un athlète..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Rechercher un athlète"
                role="searchbox"
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-neon-purple"
              />
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-2">
              {/* Filtre par statut coach */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Coach:</span>
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-neon-purple text-white'
                      : 'bg-white/5 text-muted-foreground hover:text-white'
                  }`}
                >
                  Tous ({stats.total})
                </button>
                <button
                  onClick={() => setFilterType('with-coach')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'with-coach'
                      ? 'bg-neon-green text-white'
                      : 'bg-white/5 text-muted-foreground hover:text-white'
                  }`}
                >
                  Avec Coach ({stats.withCoach})
                </button>
                <button
                  onClick={() => setFilterType('without-coach')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'without-coach'
                      ? 'bg-neon-cyan text-white'
                      : 'bg-white/5 text-muted-foreground hover:text-white'
                  }`}
                >
                  Sans Coach ({stats.withoutCoach})
                </button>
              </div>

              {/* Filtre par objectif */}
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Objectif:</span>
                <button
                  onClick={() => setObjectifFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    objectifFilter === 'all'
                      ? 'bg-neon-purple text-white'
                      : 'bg-white/5 text-muted-foreground hover:text-white'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setObjectifFilter('maintien')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    objectifFilter === 'maintien'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-muted-foreground hover:text-white'
                  }`}
                >
                  Maintien
                </button>
                <button
                  onClick={() => setObjectifFilter('prise_masse')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    objectifFilter === 'prise_masse'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/5 text-muted-foreground hover:text-white'
                  }`}
                >
                  Prise de masse
                </button>
                <button
                  onClick={() => setObjectifFilter('seche')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    objectifFilter === 'seche'
                      ? 'bg-red-500 text-white'
                      : 'bg-white/5 text-muted-foreground hover:text-white'
                  }`}
                >
                  Sèche
                </button>
                <button
                  onClick={() => setObjectifFilter('performance')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    objectifFilter === 'performance'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white/5 text-muted-foreground hover:text-white'
                  }`}
                >
                  Performance
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des athlètes */}
        <div className="space-y-4">
          {filteredAthletes.length === 0 ? (
            <div className="glass-effect p-8 rounded-xl border border-white/10 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Aucun athlète trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Aucun athlète ne correspond à votre recherche.' : 'Aucun athlète disponible.'}
              </p>
            </div>
          ) : (
                                      filteredAthletes.map((athlete: AthleteData) => (
               <div
                 key={athlete.id}
                className="glass-effect rounded-xl p-6 border border-white/10 hover:border-neon-purple/50 
                         transition-all hover:transform hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{athlete.nom || 'Utilisateur'}</h3>
                      {athlete.ownerCoachId ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-neon-green/20 text-neon-green flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Avec Coach
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-neon-cyan/20 text-neon-cyan flex items-center gap-1">
                          <UserX className="w-3 h-3" />
                          Sans Coach
                        </span>
                      )}
                      {/* Badge actif/inactif dynamique */}
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                        isAthleteActive(athlete.dernier_acces)
                          ? 'bg-neon-green/20 text-neon-green'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {isAthleteActive(athlete.dernier_acces) ? 'Actif' : 'Inactif'}
                      </span>
                      {/* Icône objectif avec couleur distinctive */}
                      {athlete.objectif && (
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                          athlete.objectif === 'maintien' ? 'bg-blue-500/20 text-blue-400' :
                          athlete.objectif === 'prise_masse' ? 'bg-orange-500/20 text-orange-400' :
                          athlete.objectif === 'seche' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          <Target className="w-3 h-3" />
                          {athlete.objectif === 'prise_masse' ? 'Prise de masse' :
                           athlete.objectif === 'seche' ? 'Sèche' :
                           athlete.objectif === 'performance' ? 'Performance' :
                           'Maintien'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{athlete.email}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {!athlete.ownerCoachId && (
                      <button
                        onClick={() => handleInvite(athlete.id)}
                        className="px-3 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 
                                 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Mail className="w-4 h-4" />
                        Inviter
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/coach/athlete/${athlete.id}`)}
                      className="px-3 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 
                               transition-colors flex items-center gap-2 text-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      Voir Profil
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Dernière activité: {formatLastActivity(athlete.dernier_acces)}</span>
                  </div>
                  {athlete.date_invitation !== undefined && athlete.date_invitation !== null && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Coach depuis: {formatInvitationDate(athlete.date_invitation)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal d'invitation (à implémenter) */}
        {showInviteModal && selectedAthlete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-effect p-6 rounded-xl border border-white/10 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">Inviter un athlète</h3>
              <p className="text-muted-foreground mb-4">
                Cette fonctionnalité sera bientôt disponible.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
