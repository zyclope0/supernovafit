'use client'

import React, { useState, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/hooks/useAuth'
import { useChallenges, useAchievements, useUserProgress } from '@/hooks/useChallenges'
import { 
  CHALLENGE_DEFINITIONS, 
  createChallengeFromDefinition,
  filterChallengesByCategory,
  filterChallengesByDifficulty,
  filterChallengesByType,
  searchChallenges,
  CHALLENGE_CATEGORIES,
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_TYPES
} from '@/lib/challenges'
import ChallengeCard from '@/components/ui/ChallengeCard'
import AchievementCard from '@/components/ui/AchievementCard'
import ProgressBar from '@/components/ui/ProgressBar'
import { CardSkeleton } from '@/components/ui/Skeletons'
import { Plus, Trophy, Target, Star, Search, Filter, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'

export default function ChallengesPage() {
  const { user } = useAuth()
  const { challenges, loading: challengesLoading, addChallenge, updateChallenge, deleteChallenge } = useChallenges()
  const { achievements, loading: achievementsLoading } = useAchievements()
  const { progress, loading: progressLoading } = useUserProgress()
  
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements' | 'progress'>('challenges')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'expired'>('all')
  const [showAddChallenge, setShowAddChallenge] = useState(false)
  
  // États pour les filtres et recherche
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filtrer les challenges disponibles (pour l'ajout)
  const availableChallenges = useMemo(() => {
    let filtered = CHALLENGE_DEFINITIONS

    // Recherche textuelle
    if (searchQuery) {
      filtered = searchChallenges(filtered, searchQuery)
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filterChallengesByCategory(filtered, selectedCategory)
    }

    // Filtre par difficulté
    if (selectedDifficulty !== 'all') {
      filtered = filterChallengesByDifficulty(filtered, selectedDifficulty)
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filterChallengesByType(filtered, selectedType)
    }

    return filtered
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedType])

  // Filtrer les challenges actifs
  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true
    return challenge.status === filter
  })

  // Grouper les challenges par catégorie
  const challengesByCategory = filteredChallenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) {
      acc[challenge.category] = []
    }
    acc[challenge.category].push(challenge)
    return acc
  }, {} as Record<string, typeof challenges>)

  // Grouper les achievements par rareté
  const achievementsByRarity = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.rarity]) {
      acc[achievement.rarity] = []
    }
    acc[achievement.rarity].push(achievement)
    return acc
  }, {} as Record<string, typeof achievements>)

  const handleAddChallenge = async (definition: typeof CHALLENGE_DEFINITIONS[0]) => {
    if (!user) return

    const challengeData = createChallengeFromDefinition(definition, user.uid)
    const result = await addChallenge(challengeData)
    
    if (result.success) {
      toast.success(`Challenge "${definition.title}" ajouté !`)
      setShowAddChallenge(false)
    } else {
      toast.error('Erreur lors de l\'ajout du challenge')
    }
  }

  const handleCompleteChallenge = async (challengeId: string) => {
    const result = await updateChallenge(challengeId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    
    if (result.success) {
      toast.success('Challenge terminé ! 🎉')
    } else {
      toast.error('Erreur lors de la finalisation du challenge')
    }
  }

  const handlePauseChallenge = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId)
    if (!challenge) return

    const newStatus = challenge.status === 'paused' ? 'active' : 'paused'
    const result = await updateChallenge(challengeId, { status: newStatus })
    
    if (result.success) {
      toast.success(newStatus === 'paused' ? 'Challenge mis en pause' : 'Challenge repris')
    } else {
      toast.error('Erreur lors de la mise à jour du challenge')
    }
  }

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce challenge ?')) return

    const result = await deleteChallenge(challengeId)
    
    if (result.success) {
      toast.success('Challenge supprimé')
    } else {
      toast.error('Erreur lors de la suppression du challenge')
    }
  }

  // Fonctions pour les filtres
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedDifficulty('all')
    setSelectedType('all')
  }

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedType !== 'all'

  if (challengesLoading || achievementsLoading || progressLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header standardisé */}
        <PageHeader
          title="🏆 Challenges & Gamification"
          description="Défiez-vous et débloquez des récompenses !"
          action={{
            label: 'Nouveau Challenge',
            onClick: () => setShowAddChallenge(true),
            icon: Plus,
            color: 'purple'
          }}
        />

        {/* Progress Bar Compact */}
        {progress && (
          <div className="glass-effect p-4 sm:p-5 lg:p-6 rounded-xl border border-white/10">
            <ProgressBar progress={progress} compact />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'challenges'
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Target className="w-4 h-4" />
            Challenges
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'achievements'
                ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Achievements
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'progress'
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Star className="w-4 h-4" />
            Progression
          </button>
        </div>

        {/* Content */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'completed', 'expired'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    filter === filterType
                      ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {filterType === 'all' ? 'Tous' : 
                   filterType === 'active' ? 'Actifs' :
                   filterType === 'completed' ? 'Terminés' : 'Expirés'}
                </button>
              ))}
            </div>

            {/* Challenges by Category */}
            {Object.keys(challengesByCategory).length === 0 ? (
              <div className="glass-effect rounded-xl p-4 sm:p-6 lg:p-8 border border-white/20 text-center">
                <Target className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Aucun challenge</h3>
                <p className="text-white/70 mb-4">Commencez votre aventure en ajoutant votre premier challenge !</p>
                <button
                  onClick={() => setShowAddChallenge(true)}
                  className="px-4 py-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-white rounded-lg hover:from-neon-cyan/80 hover:to-neon-purple/80 transition-all duration-200 transform hover:scale-105"
                >
                  Ajouter un challenge
                </button>
              </div>
            ) : (
              Object.entries(challengesByCategory).map(([category, categoryChallenges]) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-xl font-bold text-white capitalize">
                    {category === 'daily' ? '📅 Quotidien' :
                     category === 'weekly' ? '📊 Hebdomadaire' :
                     category === 'monthly' ? '🗓️ Mensuel' : '⭐ Spéciaux'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryChallenges.map((challenge) => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        onComplete={handleCompleteChallenge}
                        onPause={handlePauseChallenge}
                        onDelete={handleDeleteChallenge}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {Object.keys(achievementsByRarity).length === 0 ? (
              <div className="glass-effect rounded-xl p-4 sm:p-6 lg:p-8 border border-white/20 text-center">
                <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Aucun achievement</h3>
                <p className="text-white/70">Complétez des challenges pour débloquer des achievements !</p>
              </div>
            ) : (
              Object.entries(achievementsByRarity).map(([rarity, rarityAchievements]) => (
                <div key={rarity} className="space-y-4">
                  <h2 className="text-xl font-bold text-white capitalize">
                    {rarity === 'common' ? '⭐ Communs' :
                     rarity === 'rare' ? '💎 Rares' :
                     rarity === 'epic' ? '👑 Épiques' : '🌟 Légendaires'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rarityAchievements.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={true}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'progress' && progress && (
          <ProgressBar progress={progress} showDetails />
        )}

        {/* Add Challenge Modal */}
        {showAddChallenge && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-xl p-6 border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex-1 min-w-0">Ajouter un challenge</h2>
                <button
                  onClick={() => {
                    setShowAddChallenge(false)
                    resetFilters()
                  }}
                  className="text-white/70 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Barre de recherche et filtres */}
              <div className="space-y-4 mb-6">
                {/* Barre de recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un challenge..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                  />
                </div>

                {/* Bouton filtres */}
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      showFilters 
                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' 
                        : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/15'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Filtres
                    {hasActiveFilters && (
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    )}
                  </button>

                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Réinitialiser
                    </button>
                  )}
                </div>

                {/* Panneau de filtres */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    {/* Filtre par catégorie */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Catégorie</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      >
                        {CHALLENGE_CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value} className="bg-gray-800">
                            {category.icon} {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtre par difficulté */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Difficulté</label>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      >
                        {CHALLENGE_DIFFICULTIES.map((difficulty) => (
                          <option key={difficulty.value} value={difficulty.value} className="bg-gray-800">
                            {difficulty.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtre par type */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      >
                        {CHALLENGE_TYPES.map((type) => (
                          <option key={type.value} value={type.value} className="bg-gray-800">
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Résultats */}
              <div className="mb-4">
                <p className="text-white/70">
                  {availableChallenges.length} challenge{availableChallenges.length > 1 ? 's' : ''} trouvé{availableChallenges.length > 1 ? 's' : ''}
                  {hasActiveFilters && ' avec les filtres appliqués'}
                </p>
              </div>

              {/* Grille des challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableChallenges.map((definition, index) => (
                  <div
                    key={index}
                    className="p-4 border border-white/20 rounded-lg hover:border-white/40 transition-all cursor-pointer hover:bg-white/5 group"
                    onClick={() => handleAddChallenge(definition)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-2xl group-hover:scale-110 transition-transform">{definition.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                          {definition.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            definition.difficulty === 'easy' ? 'text-green-400 bg-green-400/20' :
                            definition.difficulty === 'medium' ? 'text-yellow-400 bg-yellow-400/20' :
                            definition.difficulty === 'hard' ? 'text-orange-400 bg-orange-400/20' :
                            'text-purple-400 bg-purple-400/20'
                          }`}>
                            {definition.difficulty}
                          </span>
                          <span className="text-xs text-white/70">{definition.xpReward} XP</span>
                          <span className="text-xs text-white/50">•</span>
                          <span className="text-xs text-white/50 capitalize">{definition.category}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{definition.description}</p>
                  </div>
                ))}
              </div>

              {availableChallenges.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Aucun challenge trouvé</h3>
                  <p className="text-white/70 mb-4">Essayez de modifier vos critères de recherche</p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/15 transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
