'use client';

import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  useChallenges,
  useAchievements,
  useUserProgress,
} from '@/hooks/useChallenges';
import { useChallengeTracker } from '@/hooks/useChallengeTracker';
import {
  isChallengeImplemented,
  isChallengeImplementable,
  getUnimplementationReason,
  getChallengeStats,
  // getTrackableChallengeDefinitions // Supprimé avec les outils de test
} from '@/lib/challengeImplementation';
import {
  CHALLENGE_DEFINITIONS,
  createChallengeFromDefinition,
  filterChallengesByCategory,
  searchChallenges,
  CHALLENGE_CATEGORIES,
} from '@/lib/challenges';
import AchievementCard from '@/components/ui/AchievementCard';
import ProgressBar from '@/components/ui/ProgressBar';
import { CardSkeleton } from '@/components/ui/Skeletons';
import { Plus, Trophy, Target, Star, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ChallengesProgressHeader from '@/components/challenges/ChallengesProgressHeaderSimple';
import ChallengeCardClickable from '@/components/ui/ChallengeCardClickable';
import ChallengeDetailModal from '@/components/ui/ChallengeDetailModal';

export default function ChallengesPage() {
  const { user } = useAuth();
  const {
    challenges,
    loading: challengesLoading,
    addChallenge,
    updateChallenge,
    deleteChallenge,
  } = useChallenges();
  const { achievements, loading: achievementsLoading } = useAchievements();
  const { progress, loading: progressLoading } = useUserProgress();

  // Activer le suivi automatique des challenges
  useChallengeTracker();

  const [activeTab, setActiveTab] = useState<
    'challenges' | 'achievements' | 'progress'
  >('challenges');
  const [filter, setFilter] = useState<
    'all' | 'active' | 'completed' | 'expired'
  >('all');
  const [showAddChallenge, setShowAddChallenge] = useState(false);

  // État pour la période (cohérent avec autres pages)
  const [challengesPeriod, setChallengesPeriod] = useState<
    'today' | 'week' | 'month'
  >('week');

  // États pour les nouveaux composants industrialisés
  const [selectedChallenge, setSelectedChallenge] = useState<
    (typeof challenges)[0] | null
  >(null);
  const [showChallengeDetail, setShowChallengeDetail] = useState(false);

  // États pour les filtres simplifiés (cohérent avec autres pages)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrer les challenges disponibles (simplifié)
  const availableChallenges = useMemo(() => {
    let filtered = CHALLENGE_DEFINITIONS;

    // Recherche textuelle
    if (searchQuery) {
      filtered = searchChallenges(filtered, searchQuery);
    }

    // Filtre par catégorie uniquement
    if (selectedCategory !== 'all') {
      filtered = filterChallengesByCategory(filtered, selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Filtrer les challenges actifs
  const filteredChallenges = challenges.filter((challenge) => {
    if (filter === 'all') return true;
    return challenge.status === filter;
  });

  // Grouper les challenges par catégorie
  const challengesByCategory = filteredChallenges.reduce(
    (acc, challenge) => {
      if (!acc[challenge.category]) {
        acc[challenge.category] = [];
      }
      acc[challenge.category].push(challenge);
      return acc;
    },
    {} as Record<string, typeof challenges>,
  );

  // Grouper les achievements par rareté
  const achievementsByRarity = achievements.reduce(
    (acc, achievement) => {
      if (!acc[achievement.rarity]) {
        acc[achievement.rarity] = [];
      }
      acc[achievement.rarity].push(achievement);
      return acc;
    },
    {} as Record<string, typeof achievements>,
  );

  const handleAddChallenge = async (
    definition: (typeof CHALLENGE_DEFINITIONS)[0],
  ) => {
    if (!user) return;

    const challengeData = createChallengeFromDefinition(definition, user.uid);
    const result = await addChallenge(challengeData);

    if (result.success) {
      toast.success(`Challenge "${definition.title}" ajouté !`);
      setShowAddChallenge(false);
    } else {
      toast.error("Erreur lors de l'ajout du challenge");
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    const result = await updateChallenge(challengeId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    if (result.success) {
      toast.success('Challenge terminé ! 🎉');
    } else {
      toast.error('Erreur lors de la finalisation du challenge');
    }
  };

  const handlePauseChallenge = async (challengeId: string) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    const newStatus = challenge.status === 'paused' ? 'active' : 'paused';
    const result = await updateChallenge(challengeId, { status: newStatus });

    if (result.success) {
      toast.success(
        newStatus === 'paused' ? 'Challenge mis en pause' : 'Challenge repris',
      );
    } else {
      toast.error('Erreur lors de la mise à jour du challenge');
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce challenge ?')) return;

    const result = await deleteChallenge(challengeId);

    if (result.success) {
      toast.success('Challenge supprimé');
      setShowChallengeDetail(false);
      setSelectedChallenge(null);
    } else {
      toast.error('Erreur lors de la suppression du challenge');
    }
  };

  // Handlers pour les nouveaux composants industrialisés
  const handleChallengeView = (challenge: (typeof challenges)[0]) => {
    setSelectedChallenge(challenge);
    setShowChallengeDetail(true);
  };

  const handleChallengeDelete = () => {
    if (selectedChallenge) {
      handleDeleteChallenge(selectedChallenge.id);
    }
  };

  const handleChallengeComplete = () => {
    if (selectedChallenge) {
      handleCompleteChallenge(selectedChallenge.id);
      setShowChallengeDetail(false);
      setSelectedChallenge(null);
    }
  };

  const handleChallengePause = () => {
    if (selectedChallenge) {
      handlePauseChallenge(selectedChallenge.id);
      setShowChallengeDetail(false);
      setSelectedChallenge(null);
    }
  };

  const handleChallengeResume = () => {
    if (selectedChallenge) {
      handlePauseChallenge(selectedChallenge.id); // Même fonction pour pause/resume
      setShowChallengeDetail(false);
      setSelectedChallenge(null);
    }
  };

  // Fonctions pour les filtres
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all';

  if (challengesLoading || achievementsLoading || progressLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header industrialisé */}
        <ChallengesProgressHeader
          title="CHALLENGES"
          emoji="🏆"
          period={challengesPeriod}
          onPeriodChange={(period) =>
            setChallengesPeriod(period as 'today' | 'week' | 'month')
          }
          stats={{
            activeChallenges: challenges.filter((c) => c.status === 'active')
              .length,
            completedChallenges: challenges.filter(
              (c) => c.status === 'completed',
            ).length,
            totalAchievements: achievements.length,
            userLevel: progress?.level,
            userXP: progress?.currentLevelXP,
            nextLevelXP: progress?.nextLevelXP,
          }}
        />

        {/* Bouton d'ajout de challenge */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddChallenge(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouveau Challenge
          </button>
        </div>

        {/* Statistiques d'implémentation */}
        <div className="glass-effect rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3">
            📊 État d&apos;implémentation
          </h3>
          {(() => {
            const stats = getChallengeStats();
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-cyan">
                    {stats.total}
                  </div>
                  <div className="text-white/60">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-green">
                    {stats.implemented}
                  </div>
                  <div className="text-white/60">Fonctionnels</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {stats.implementable - stats.implemented}
                  </div>
                  <div className="text-white/60">À développer</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {stats.unimplementable}
                  </div>
                  <div className="text-white/60">Non faisables</div>
                </div>
              </div>
            );
          })()}
          <div className="mt-3 text-center text-white/70 text-sm">
            <span className="text-neon-green font-semibold">
              {getChallengeStats().implementedPercentage}%
            </span>{' '}
            des challenges implémentables sont fonctionnels
          </div>
        </div>

        {/* Message si pas connecté */}
        {!user && (
          <div className="glass-effect p-6 lg:p-8 rounded-xl border border-white/20 text-center">
            <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Challenges & Récompenses
            </h3>
            <p className="text-white/70 mb-4">
              Connectez-vous pour accéder aux challenges, débloquer des
              achievements et suivre votre progression !
            </p>
            <button
              onClick={() => (window.location.href = '/auth')}
              className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-lg hover:from-neon-purple/80 hover:to-neon-cyan/80 transition-all duration-200 transform hover:scale-105"
            >
              Se connecter
            </button>
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
              {(['all', 'active', 'completed', 'expired'] as const).map(
                (filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      filter === filterType
                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {filterType === 'all'
                      ? 'Tous'
                      : filterType === 'active'
                        ? 'Actifs'
                        : filterType === 'completed'
                          ? 'Terminés'
                          : 'Expirés'}
                  </button>
                ),
              )}
            </div>

            {/* Challenges by Category */}
            {Object.keys(challengesByCategory).length === 0 ? (
              <div className="glass-effect rounded-xl p-4 sm:p-6 lg:p-8 border border-white/20 text-center">
                <Target className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Aucun challenge
                </h3>
                <p className="text-white/70 mb-4">
                  Commencez votre aventure en ajoutant votre premier challenge !
                </p>
                <button
                  onClick={() => setShowAddChallenge(true)}
                  className="px-4 py-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-white rounded-lg hover:from-neon-cyan/80 hover:to-neon-purple/80 transition-all duration-200 transform hover:scale-105"
                >
                  Ajouter un challenge
                </button>
              </div>
            ) : (
              Object.entries(challengesByCategory).map(
                ([category, categoryChallenges]) => (
                  <div key={category} className="space-y-4">
                    <h2 className="text-xl font-bold text-white capitalize">
                      {category === 'daily'
                        ? '📅 Quotidien'
                        : category === 'weekly'
                          ? '📊 Hebdomadaire'
                          : category === 'monthly'
                            ? '🗓️ Mensuel'
                            : '⭐ Spéciaux'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryChallenges.map((challenge) => (
                        <ChallengeCardClickable
                          key={challenge.id}
                          challenge={challenge}
                          onView={() => handleChallengeView(challenge)}
                          onDelete={() => handleChallengeView(challenge)} // Ouvre la modal pour confirmer
                          onComplete={() =>
                            handleCompleteChallenge(challenge.id)
                          }
                          onPause={() => handlePauseChallenge(challenge.id)}
                          onResume={() => handlePauseChallenge(challenge.id)}
                        />
                      ))}
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {Object.keys(achievementsByRarity).length === 0 ? (
              <div className="glass-effect rounded-xl p-4 sm:p-6 lg:p-8 border border-white/20 text-center">
                <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Aucun achievement
                </h3>
                <p className="text-white/70">
                  Complétez des challenges pour débloquer des achievements !
                </p>
              </div>
            ) : (
              Object.entries(achievementsByRarity).map(
                ([rarity, rarityAchievements]) => (
                  <div key={rarity} className="space-y-4">
                    <h2 className="text-xl font-bold text-white capitalize">
                      {rarity === 'common'
                        ? '⭐ Communs'
                        : rarity === 'rare'
                          ? '💎 Rares'
                          : rarity === 'epic'
                            ? '👑 Épiques'
                            : '🌟 Légendaires'}
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
                ),
              )
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
                <h2 className="text-xl sm:text-2xl font-bold text-white flex-1 min-w-0">
                  Ajouter un challenge
                </h2>
                <button
                  onClick={() => {
                    setShowAddChallenge(false);
                    resetFilters();
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
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Catégorie
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      >
                        {CHALLENGE_CATEGORIES.map((category) => (
                          <option
                            key={category.value}
                            value={category.value}
                            className="bg-gray-800"
                          >
                            {category.icon} {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtres simplifiés - Cohérent avec autres pages */}
                  </div>
                )}
              </div>

              {/* Résultats */}
              <div className="mb-4">
                <p className="text-white/70">
                  {availableChallenges.length} challenge
                  {availableChallenges.length > 1 ? 's' : ''} trouvé
                  {availableChallenges.length > 1 ? 's' : ''}
                  {hasActiveFilters && ' avec les filtres appliqués'}
                </p>
              </div>

              {/* Grille des challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableChallenges.map((definition, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg transition-all group ${
                      isChallengeImplementable(definition.title)
                        ? 'border-white/20 hover:border-white/40 cursor-pointer hover:bg-white/5'
                        : 'border-red-400/30 bg-red-400/5 cursor-not-allowed opacity-60'
                    }`}
                    onClick={() => {
                      if (isChallengeImplementable(definition.title)) {
                        handleAddChallenge(definition);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-2xl group-hover:scale-110 transition-transform">
                        {definition.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                          {definition.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              definition.difficulty === 'easy'
                                ? 'text-green-400 bg-green-400/20'
                                : definition.difficulty === 'medium'
                                  ? 'text-yellow-400 bg-yellow-400/20'
                                  : definition.difficulty === 'hard'
                                    ? 'text-orange-400 bg-orange-400/20'
                                    : 'text-purple-400 bg-purple-400/20'
                            }`}
                          >
                            {definition.difficulty}
                          </span>
                          {isChallengeImplemented(definition.title) ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/20">
                              ✅ Fonctionnel
                            </span>
                          ) : isChallengeImplementable(definition.title) ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium text-yellow-400 bg-yellow-400/20">
                              🔧 À développer
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium text-red-400 bg-red-400/20">
                              ❌ Non faisable
                            </span>
                          )}
                          <span className="text-xs text-white/70">
                            {definition.xpReward} XP
                          </span>
                          <span className="text-xs text-white/50">•</span>
                          <span className="text-xs text-white/50 capitalize">
                            {definition.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {definition.description}
                    </p>
                    {!isChallengeImplementable(definition.title) && (
                      <div className="mt-3 p-2 bg-red-400/10 border border-red-400/20 rounded text-xs text-red-300">
                        <strong>Non implémentable :</strong>{' '}
                        {getUnimplementationReason(definition.title)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {availableChallenges.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Aucun challenge trouvé
                  </h3>
                  <p className="text-white/70 mb-4">
                    Essayez de modifier vos critères de recherche
                  </p>
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

        {/* Modal de détail du challenge */}
        <ChallengeDetailModal
          isOpen={showChallengeDetail}
          onClose={() => {
            setShowChallengeDetail(false);
            setSelectedChallenge(null);
          }}
          challenge={selectedChallenge}
          onDelete={handleChallengeDelete}
          onComplete={handleChallengeComplete}
          onPause={handleChallengePause}
          onResume={handleChallengeResume}
        />
      </div>
    </MainLayout>
  );
}
