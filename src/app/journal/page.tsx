'use client';

import { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  useJournal,
  useBadges,
  useObjectifs,
  useCoachCommentsByModule,
} from '@/hooks/useFirestore';
import { Plus } from 'lucide-react';
// Edit3, Trash2 maintenant dans JournalEntryClickable
// Award, Target supprimés car non utilisés
import { JournalEntry } from '@/types';
// PageHeader supprimé - remplacé par JournalWellnessHeader industrialisé
// import StatsDashboard from '@/components/ui/StatsDashboard' // Remplacé par JournalWellnessHeader
import JournalWellnessHeader from '@/components/journal/JournalWellnessHeader';
import JournalEntryClickable from '@/components/ui/JournalEntryClickable';
import JournalEntryCompact from '@/components/ui/JournalEntryCompact';
import JournalDetailModal from '@/components/ui/JournalDetailModal';
import toast from 'react-hot-toast';
import JournalForm from '@/components/journal/JournalForm';
import dynamic from 'next/dynamic';
import ModuleComments from '@/components/ui/ModuleComments';
const CollapsibleCard = dynamic(
  () => import('@/components/ui/CollapsibleCard'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white/10 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    ),
  },
);
import { CardSkeleton } from '@/components/ui/Skeletons';
const HistoriqueJournalModal = dynamic(
  () => import('@/components/ui/HistoriqueJournalModal'),
  { ssr: false },
);
import { calculateUserData, checkNewBadges } from '@/lib/badges';
import type { PhotoProgression } from '@/types';

// EMOJI_LEVELS et METEO_EMOJI maintenant dans JournalEntryClickable

import React from 'react';

export default function JournalPageOptimized() {
  const { user } = useAuth();
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useJournal();
  const {
    badges,
    loading: badgesLoading,
    addBadge,
    clearAllBadges,
  } = useBadges();
  const {
    objectifs,
    loading: objectifsLoading,
    addObjectif,
    deleteObjectif,
  } = useObjectifs();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [showHistory, setShowHistory] = useState(false);
  const [wellnessPeriod, setWellnessPeriod] = useState<
    'today' | 'week' | 'month'
  >('week');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showEntryDetail, setShowEntryDetail] = useState(false);
  const { comments: journalComments, loading: journalCommentsLoading } =
    useCoachCommentsByModule('journal', selectedDate);

  // Objectifs prédéfinis simples
  const OBJECTIFS_PREDEFINIS = [
    {
      titre: '🔥 Streak 7 jours',
      description: "Tenir un journal 7 jours d'affilée",
      cible: 7,
      type: 'journal' as const,
    },
    {
      titre: '😊 Bonne humeur',
      description: 'Humeur >7 pendant 5 jours',
      cible: 5,
      type: 'humeur' as const,
    },
    {
      titre: '💪 Actif',
      description: '3 entraînements cette semaine',
      cible: 3,
      type: 'entrainement' as const,
    },
  ];

  // 🚀 Optimisation Performance - Issue #7
  const objectifsActifs = useMemo(
    () => objectifs.filter((o) => o.statut === 'actif'),
    [objectifs],
  );

  const objectifsAccomplis = useMemo(
    () => objectifs.filter((o) => o.statut === 'accompli').slice(0, 3),
    [objectifs],
  );

  // Date d'aujourd'hui
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find((e) => e.date === today);

  // Calculer les données selon la période sélectionnée
  const getDateRange = () => {
    const now = new Date();
    switch (wellnessPeriod) {
      case 'today':
        return { start: today, label: "aujourd'hui" };
      case 'week':
        const weekStart = new Date();
        const dayOfWeek = weekStart.getDay(); // 0 = dimanche, 1 = lundi, etc.
        // Calculer le lundi de cette semaine (semaine française)
        // Si c'est dimanche (0), on remonte de 6 jours pour arriver au lundi précédent
        // Sinon, on remonte de (dayOfWeek - 1) jours pour arriver au lundi de cette semaine
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        weekStart.setDate(weekStart.getDate() - daysToSubtract);
        weekStart.setHours(0, 0, 0, 0); // Début de journée pour éviter les problèmes de timezone
        return {
          start: weekStart.toISOString().split('T')[0],
          label: 'cette semaine',
        };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          start: monthStart.toISOString().split('T')[0],
          label: 'ce mois',
        };
      default:
        return { start: today, label: "aujourd'hui" };
    }
  };

  const { start: periodStart } = getDateRange();

  // Données selon la période sélectionnée
  const periodEntries =
    wellnessPeriod === 'today'
      ? entries.filter((e) => e.date === today)
      : entries.filter((e) => e.date >= periodStart);

  // Calculer les moyennes pour la période
  const avgHumeur =
    periodEntries.filter((e) => e.humeur).length > 0
      ? Math.round(
          periodEntries.reduce((sum, e) => sum + (e.humeur || 0), 0) /
            periodEntries.filter((e) => e.humeur).length,
        )
      : 0;
  const avgEnergie =
    periodEntries.filter((e) => e.energie).length > 0
      ? Math.round(
          periodEntries.reduce((sum, e) => sum + (e.energie || 0), 0) /
            periodEntries.filter((e) => e.energie).length,
        )
      : 0;
  const avgSommeil =
    periodEntries.filter((e) => e.sommeil_duree).length > 0
      ? Math.round(
          (periodEntries.reduce((sum, e) => sum + (e.sommeil_duree || 0), 0) /
            periodEntries.filter((e) => e.sommeil_duree).length) *
            10,
        ) / 10
      : 0;

  // Stats pour le nouveau header
  const wellnessStats = {
    entries: {
      current: periodEntries.length,
      target:
        wellnessPeriod === 'today' ? 1 : wellnessPeriod === 'week' ? 7 : 30,
      unit: '',
    },
    avgMood: { current: avgHumeur, target: 10, unit: '/10' },
    avgEnergy: { current: avgEnergie, target: 10, unit: '/10' },
    sleepHours: { current: avgSommeil, target: 8, unit: 'h' },
  };

  // Vérifier les nouveaux badges automatiquement (CORRIGÉ - évite les doublons avec localStorage)
  const [badgesChecked, setBadgesChecked] = useState(false);
  const [lastEntriesCount, setLastEntriesCount] = useState(0);
  const [lastObjectifsCount, setLastObjectifsCount] = useState(0);

  // Récupérer l'état depuis localStorage
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const stored = localStorage.getItem(`badges_checked_${user.uid}`);
      setBadgesChecked(stored === 'true');
    }
  }, [user]);

  useEffect(() => {
    // Conditions strictes pour éviter les faux déclenchements
    if (
      !user ||
      loading ||
      badgesLoading ||
      entries.length === 0 ||
      badgesChecked
    )
      return;

    // Attendre que les badges soient vraiment chargés
    if (!badges || !Array.isArray(badges)) return;

    // Vérifier si les données ont vraiment changé
    const currentEntriesCount = entries.length;
    const currentObjectifsCount = objectifs?.length || 0;

    if (
      currentEntriesCount === lastEntriesCount &&
      currentObjectifsCount === lastObjectifsCount
    ) {
      console.log(
        '🔍 Debug badges - Aucun changement détecté, pas de vérification',
      );
      return;
    }

    const userData = calculateUserData(
      entries,
      [] as PhotoProgression[],
      [], // repas - TODO: récupérer via hook
      [], // entrainements - TODO: récupérer via hook
      [], // mesures - TODO: récupérer via hook
      objectifs as unknown as { statut?: string; [key: string]: unknown }[], // objectifs déjà disponibles
    );

    const existingBadgeIds = badges.map((b) => b.nom);
    const newBadges = checkNewBadges(userData, existingBadgeIds);

    if (newBadges.length > 0) {
      console.log(
        '🏆 Nouveaux badges détectés:',
        newBadges.map((b) => b.nom),
      );
    }

    // Débloquer les nouveaux badges SEULEMENT s'il y en a ET qu'ils ne sont pas déjà en cours
    if (newBadges.length > 0) {
      // Éviter les doublons en vérifiant une deuxième fois
      const reallyNewBadges = newBadges.filter(
        (badge) => !existingBadgeIds.includes(badge.nom),
      );

      if (reallyNewBadges.length > 0) {
        const processBadges = async () => {
          for (const badgeDefinition of reallyNewBadges) {
            const result = await addBadge({
              type: badgeDefinition.type,
              nom: badgeDefinition.nom,
              description: badgeDefinition.description,
              icone: badgeDefinition.icone,
              condition: badgeDefinition.condition,
            });

            if (result.success) {
              toast.success(
                `🏆 Nouveau badge débloqué : ${badgeDefinition.nom}`,
                {
                  duration: 4000,
                },
              );
            } else {
              console.error(
                '❌ Erreur attribution badge:',
                badgeDefinition.nom,
                result.error,
              );
            }
          }
        };

        processBadges();
      }
    }

    // Mettre à jour les compteurs
    setLastEntriesCount(currentEntriesCount);
    setLastObjectifsCount(currentObjectifsCount);

    // Marquer comme vérifié dans localStorage pour persister
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(`badges_checked_${user.uid}`, 'true');
      setBadgesChecked(true);
    }
  }, [
    entries,
    badges,
    user,
    loading,
    badgesLoading,
    addBadge,
    objectifs,
    badgesChecked,
    lastEntriesCount,
    lastObjectifsCount,
  ]);

  // Handlers
  const handleNewEntry = () => {
    setEditingEntry(null);
    setShowForm(true);
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleEntryView = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowEntryDetail(true);
  };

  const handleEntryEdit = () => {
    if (selectedEntry) {
      setEditingEntry(selectedEntry);
      setShowForm(true);
      setShowEntryDetail(false);
    }
  };

  const handleDelete = async (entry: JournalEntry) => {
    // UX moderne avec toast au lieu de confirm()
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>Supprimer cette entrée ?</span>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const result = await deleteEntry(entry.id);
                if (result.success) {
                  toast.success('Entrée supprimée !');
                } else {
                  toast.error(`Erreur : ${result.error}`);
                }
              }}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
            >
              Supprimer
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        style: {
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          minWidth: '300px',
        },
      },
    );
  };

  const handleSubmit = async (
    formData: Partial<JournalEntry>,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !user.uid) {
      toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
      return { success: false, error: 'Non connecté' };
    }

    setIsSubmitting(true);
    try {
      let result;
      if (editingEntry) {
        result = await updateEntry(editingEntry.id, formData);
      } else {
        result = await addEntry(
          formData as Omit<JournalEntry, 'id' | 'user_id'>,
        );
      }

      if (result.success) {
        toast.success(editingEntry ? 'Entrée modifiée !' : 'Entrée ajoutée !');
        setShowForm(false);
        setEditingEntry(null);
      } else {
        toast.error(`Erreur : ${result.error}`);
      }
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 bg-white/20 rounded w-64"></div>
              <div className="h-4 bg-white/20 rounded w-48"></div>
            </div>
            <div className="h-10 bg-white/20 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Bouton d'action pour nouvelle entrée */}
        <div className="flex justify-end">
          <button
            onClick={handleNewEntry}
            className="flex items-center gap-2 px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {todayEntry ? "Modifier aujourd'hui" : 'Nouvelle entrée'}
          </button>
        </div>

        {/* Header Bien-être Révolutionnaire (préserve l'esprit Journal) */}
        {user && entries.length > 0 && (
          <JournalWellnessHeader
            entries={wellnessStats.entries}
            avgMood={wellnessStats.avgMood}
            avgEnergy={wellnessStats.avgEnergy}
            sleepHours={wellnessStats.sleepHours}
            period={wellnessPeriod}
            onPeriodChange={setWellnessPeriod}
          />
        )}

        {/* Message si pas connecté */}
        {!user && (
          <div className="glass-effect p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-yellow-400">
              Connectez-vous pour accéder à votre journal personnel !
            </p>
          </div>
        )}

        {/* Layout principal avec sidebar (comme Entraînements) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {user && (
            <>
              {/* Contenu principal */}
              <div className="lg:col-span-3 space-y-4">
                {/* Mes entrées (fusionnée) */}
                <CollapsibleCard title="📝 Mes entrées" defaultOpen={true}>
                  <div className="space-y-3">
                    {(() => {
                      const dayEntry = entries.find(
                        (e) => e.date === selectedDate,
                      );

                      // Si une entrée existe pour la date sélectionnée
                      if (dayEntry) {
                        return (
                          <>
                            {/* Entrée du jour mise en avant */}
                            <div className="relative">
                              <div className="absolute -top-2 -left-2 bg-neon-purple text-white text-xs px-2 py-1 rounded-full font-medium">
                                {selectedDate === today
                                  ? "Aujourd'hui"
                                  : 'Sélectionné'}
                              </div>
                              <JournalEntryClickable
                                entry={dayEntry}
                                onView={() => handleEntryView(dayEntry)}
                                onEdit={() => handleEdit(dayEntry)}
                                onDelete={() => handleDelete(dayEntry)}
                              />
                            </div>

                            {/* Autres entrées compactes (sans l'entrée du jour) */}
                            {entries
                              .filter((entry) => entry.date !== selectedDate)
                              .slice(0, 4)
                              .map((entry) => (
                                <JournalEntryCompact
                                  key={entry.id}
                                  entry={entry}
                                  onView={() => handleEntryView(entry)}
                                  onEdit={() => handleEdit(entry)}
                                  onDelete={() => handleDelete(entry)}
                                />
                              ))}
                          </>
                        );
                      } else {
                        // Aucune entrée pour la date sélectionnée
                        return (
                          <div className="glass-effect p-6 rounded-xl border border-white/10 text-center">
                            <div className="text-4xl mb-4">📝</div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {selectedDate === today
                                ? "Aucune entrée aujourd'hui"
                                : 'Aucune entrée ce jour'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              {selectedDate === today
                                ? 'Comment vous sentez-vous aujourd&apos;hui ?'
                                : 'Sélectionnez une autre date ou créez une entrée'}
                            </p>
                            <button
                              onClick={handleNewEntry}
                              className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors"
                            >
                              ✨ Créer une entrée
                            </button>
                          </div>
                        );
                      }
                    })()}

                    {/* Lien vers l'historique complet */}
                    {entries.length > 5 && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => setShowHistory(true)}
                          className="text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                        >
                          📊 Voir tout l&apos;historique ({entries.length}{' '}
                          entrées)
                        </button>
                      </div>
                    )}
                  </div>
                </CollapsibleCard>

                {/* Messages du Coach (PRIORITÉ 3) */}
                <CollapsibleCard
                  title="💬 Messages du Coach"
                  defaultOpen={false}
                  counter={journalComments?.length || 0}
                >
                  <ModuleComments
                    comments={journalComments}
                    loading={journalCommentsLoading}
                  />
                </CollapsibleCard>
              </div>

              {/* Sidebar droite (SECONDAIRE) */}
              <div className="lg:col-span-1 space-y-4">
                {/* Navigation rapide */}
                <div className="glass-effect p-4 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    ⚡ Navigation rapide
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedDate(today)}
                      className="w-full px-3 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg text-sm hover:bg-neon-cyan/30 transition-all duration-200 transform hover:scale-105 font-medium"
                    >
                      📅 Aujourd&apos;hui
                    </button>
                    <button
                      onClick={() => setShowHistory(true)}
                      className="w-full px-3 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-all duration-200 transform hover:scale-105 font-medium"
                    >
                      📊 Historique complet
                    </button>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/20 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Objectifs (compact) */}
                {objectifsLoading ? (
                  <CardSkeleton />
                ) : (
                  <div className="glass-effect p-4 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        🎯 Objectifs
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        ({objectifsActifs.length})
                      </span>
                    </div>

                    {/* Objectifs actifs (simplifiés) */}
                    <div className="space-y-2">
                      {objectifsActifs.slice(0, 2).map((objectif) => (
                        <div
                          key={objectif.id}
                          className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">
                              {objectif.titre.replace(/🔥|😊|💪/g, '').trim()}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-neon-cyan">
                                {Math.round(objectif.progression)}%
                              </span>
                              <button
                                onClick={async () => {
                                  const result = await deleteObjectif(
                                    objectif.id,
                                  );
                                  if (result.success) {
                                    toast.success('Objectif supprimé !');
                                  } else {
                                    toast.error(`Erreur : ${result.error}`);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 ml-1 text-xs text-red-400 hover:text-red-300 transition-all duration-200"
                                title="Supprimer cet objectif"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <div className="w-full bg-space-700 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-neon-cyan to-neon-purple h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(objectif.progression, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                      {objectifsActifs.length > 2 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{objectifsActifs.length - 2} autres
                        </p>
                      )}
                    </div>

                    {/* Objectifs prédéfinis (simplifiés) */}
                    {objectifs.length === 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground mb-2">
                          Objectifs suggérés :
                        </p>
                        {OBJECTIFS_PREDEFINIS.slice(0, 2).map((obj, index) => (
                          <button
                            key={index}
                            onClick={async () => {
                              const result = await addObjectif(obj);
                              if (result.success) {
                                toast.success(`Objectif ajouté !`);
                              }
                            }}
                            className="w-full text-left p-2 rounded-lg bg-space-700/50 border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <div className="text-sm font-medium text-white">
                              {obj.titre}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {obj.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Objectifs complétés (compact) */}
                    {objectifsAccomplis.length > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-muted-foreground mb-1">
                          ✅ Atteints :
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {objectifsAccomplis.slice(0, 3).map((objectif) => (
                            <span
                              key={objectif.id}
                              className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs"
                            >
                              ✅
                            </span>
                          ))}
                          {objectifsAccomplis.length > 3 && (
                            <span className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs">
                              +{objectifsAccomplis.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Badges (compact sidebar) */}
                {!badgesLoading && badges.length > 0 && (
                  <div className="glass-effect p-4 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        🏆 Badges
                      </h3>
                      <button
                        onClick={async () => {
                          toast(
                            (t) => (
                              <div className="flex items-center gap-3">
                                <span>Supprimer tous les badges ?</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      toast.dismiss(t.id);
                                      const result = await clearAllBadges();
                                      if (result.success) {
                                        toast.success(
                                          `${result.deleted} badges supprimés !`,
                                        );
                                      } else {
                                        toast.error(`Erreur : ${result.error}`);
                                      }
                                    }}
                                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                                  >
                                    Supprimer
                                  </button>
                                  <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              </div>
                            ),
                            {
                              duration: 10000,
                              style: {
                                background: 'rgba(15, 23, 42, 0.98)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                minWidth: '300px',
                              },
                            },
                          );
                        }}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        title="Nettoyer tous les badges"
                      >
                        🧹
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {badges.slice(0, 6).map((badge) => (
                        <div
                          key={badge.id}
                          className="text-center p-2 rounded-lg bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 border border-neon-purple/20"
                        >
                          <div className="text-lg mb-1">{badge.icone}</div>
                          <div className="text-xs font-medium text-white line-clamp-1">
                            {badge.nom.replace(/📝|🔥|😊|💪|📸/g, '').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                    {badges.length > 6 && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        +{badges.length - 6} autres
                      </p>
                    )}
                  </div>
                )}

                {/* Analyse simple (compact) */}
                {entries.length >= 3 && (
                  <div className="glass-effect p-4 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      📈 Analyse
                    </h3>
                    <div className="space-y-2 text-sm">
                      {(() => {
                        const recent = entries.slice(0, 7);
                        const avgHumeur =
                          recent.filter((e) => e.humeur).length > 0
                            ? Math.round(
                                recent.reduce(
                                  (sum, e) => sum + (e.humeur || 0),
                                  0,
                                ) / recent.filter((e) => e.humeur).length,
                              )
                            : 0;
                        const avgEnergie =
                          recent.filter((e) => e.energie).length > 0
                            ? Math.round(
                                recent.reduce(
                                  (sum, e) => sum + (e.energie || 0),
                                  0,
                                ) / recent.filter((e) => e.energie).length,
                              )
                            : 0;

                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                😊 Humeur moy :
                              </span>
                              <span className="text-white font-medium">
                                {avgHumeur}/10
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                ⚡ Énergie moy :
                              </span>
                              <span className="text-white font-medium">
                                {avgEnergie}/10
                              </span>
                            </div>
                            <div className="pt-2 border-t border-white/10">
                              <span className="text-xs text-neon-cyan">
                                {avgHumeur > 7 && avgEnergie > 7
                                  ? '✨ Excellent équilibre !'
                                  : avgHumeur < 5
                                    ? '🌈 Focus sur le bien-être'
                                    : avgEnergie < 5
                                      ? '🌙 Améliorer le sommeil'
                                      : '💫 Continuer les efforts'}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Formulaire de saisie (modal) */}
          {showForm && (
            <JournalForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              existingEntry={editingEntry}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Message si aucune entrée */}
          {!user ? null : entries.length === 0 ? (
            <div className="lg:col-span-4">
              <div className="glass-effect p-6 rounded-xl border border-white/10">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Votre journal vous attend
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Commencez à suivre votre humeur, votre énergie et vos notes
                    quotidiennes
                  </p>
                  <button
                    onClick={handleNewEntry}
                    className="px-6 py-3 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors"
                  >
                    ✨ Créer ma première entrée
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal de détail d'entrée Journal */}
      <JournalDetailModal
        isOpen={showEntryDetail}
        onClose={() => setShowEntryDetail(false)}
        entry={selectedEntry}
        onEdit={handleEntryEdit}
      />

      <HistoriqueJournalModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        allEntries={entries}
        currentDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* FAB (Floating Action Button) pour mobile et desktop */}
      <button
        onClick={handleNewEntry}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-full shadow-2xl hover:shadow-neon-purple/30 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
        title="Ajouter une nouvelle entrée (raccourci: Ctrl+N)"
      >
        <Plus className="h-6 w-6 md:h-7 md:w-7 group-hover:rotate-90 transition-transform duration-300" />
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
      </button>
    </MainLayout>
  );
}
