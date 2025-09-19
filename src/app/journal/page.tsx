'use client'

import { useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/hooks/useAuth'
import { useJournal, useBadges, usePhotosLibres, useObjectifs, useCoachCommentsByModule } from '@/hooks/useFirestore'
import { Plus, Edit3, Trash2, Award, Target } from 'lucide-react'
import { JournalEntry } from '@/types'
import toast from 'react-hot-toast'
import JournalForm from '@/components/ui/JournalForm'
import dynamic from 'next/dynamic'
const PhotosLibresGallery = dynamic(() => import('@/components/ui/PhotosLibresGallery'), { ssr: false })
import ModuleComments from '@/components/ui/ModuleComments'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { CardSkeleton, ListSkeleton, ProfileSkeleton } from '@/components/ui/Skeletons'
const HistoriqueJournalModal = dynamic(() => import('@/components/ui/HistoriqueJournalModal'), { ssr: false })
import { calculateUserData, checkNewBadges } from '@/lib/badges'
import type { PhotoProgression } from '@/types'

// Émojis pour les différents niveaux
const EMOJI_LEVELS = {
  1: '😞', 2: '😔', 3: '😐', 4: '🙂', 5: '😊',
  6: '😄', 7: '😁', 8: '🤩', 9: '😍', 10: '🚀'
}

const METEO_EMOJI = {
  soleil: '☀️',
  nuage: '☁️', 
  pluie: '🌧️',
  orage: '⛈️',
  neige: '❄️'
}


import React from 'react'

function PaginatedEntries({ entries, onEdit, onDelete }: { entries: JournalEntry[]; onEdit: (e: JournalEntry) => void; onDelete: (e: JournalEntry) => void }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize))
  const start = (page - 1) * pageSize
  const pageItems = entries
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(start, start + pageSize)

  useEffect(() => { setPage(1) }, [entries.length])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{entries.length} entrées • Page {page}/{totalPages}</div>
        <label className="text-xs text-muted-foreground flex items-center gap-2">
          Par page
          <select
            aria-label="Taille de page"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4">
        {pageItems.map((entry) => (
          <EntryCardMemo key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-xs text-muted-foreground">{start + 1}–{Math.min(entries.length, start + pageSize)}</span>
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  )
}

function EntryCard({ entry, onEdit, onDelete }: {
  entry: JournalEntry
  onEdit: (entry: JournalEntry) => void
  onDelete: (entry: JournalEntry) => void
}) {
  const { comments: entryComments, loading: commentsLoading } = useCoachCommentsByModule('journal', undefined, entry.id)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    if (date.toDateString() === today) return "Aujourd&apos;hui"
    if (date.toDateString() === yesterday) return "Hier"
    
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    })
  }

  return (
    <div className="glass-effect p-5 rounded-xl border border-white/10 hover:border-neon-cyan/40 transition-all duration-300 hover:shadow-xl hover:shadow-neon-cyan/20 group">
      {/* Header avec date et météo */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-semibold text-white text-base">{formatDate(entry.date)}</span>
            {entry.meteo && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                {METEO_EMOJI[entry.meteo]} <span className="capitalize">{entry.meteo}</span>
              </span>
            )}
          </div>
        </div>
        
        {/* Actions avec meilleur design */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 hover:bg-neon-cyan/20 rounded-lg transition-all duration-200 group/btn"
            title="Modifier"
          >
            <Edit3 className="h-4 w-4 text-neon-cyan group-hover/btn:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => onDelete(entry)}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 group/btn"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4 text-red-400 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Indicateurs avec design amélioré */}
      <div className="flex flex-wrap gap-2 mb-4">
        {entry.humeur && (
          <div className="flex items-center gap-2 px-3 py-2 bg-neon-green/10 rounded-lg border border-neon-green/20">
            <span className="text-lg">{EMOJI_LEVELS[entry.humeur]}</span>
            <span className="text-sm text-neon-green font-semibold">{entry.humeur}/10</span>
            <span className="text-xs text-muted-foreground">Humeur</span>
          </div>
        )}
        {entry.energie && (
          <div className="flex items-center gap-2 px-3 py-2 bg-neon-cyan/10 rounded-lg border border-neon-cyan/20">
            <span className="text-lg">⚡</span>
            <span className="text-sm text-neon-cyan font-semibold">{entry.energie}/10</span>
            <span className="text-xs text-muted-foreground">Énergie</span>
          </div>
        )}
        {entry.sommeil_qualite && (
          <div className="flex items-center gap-2 px-3 py-2 bg-neon-purple/10 rounded-lg border border-neon-purple/20">
            <span className="text-lg">😴</span>
            <span className="text-sm text-neon-purple font-semibold">{entry.sommeil_qualite}/10</span>
            <span className="text-xs text-muted-foreground">Sommeil</span>
          </div>
        )}
        {entry.stress && (
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <span className="text-lg">😰</span>
            <span className="text-sm text-orange-400 font-semibold">{entry.stress}/10</span>
            <span className="text-xs text-muted-foreground">Stress</span>
          </div>
        )}
      </div>

      {/* Note avec design amélioré */}
      {entry.note && (
        <div className="bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 rounded-lg p-4 mb-4 border-l-4 border-neon-cyan/50">
          <p className="text-sm text-white/95 leading-relaxed line-clamp-3">{entry.note}</p>
        </div>
      )}

      {/* Activités avec design amélioré */}
      {entry.activites_annexes && entry.activites_annexes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {entry.activites_annexes.slice(0, 4).map((activite, index) => (
            <span key={index} className="px-3 py-1.5 bg-neon-purple/15 text-neon-purple text-sm rounded-full border border-neon-purple/30 font-medium">
              {activite}
            </span>
          ))}
          {entry.activites_annexes.length > 4 && (
            <span className="px-3 py-1.5 bg-white/10 text-white/70 text-sm rounded-full border border-white/20">
              +{entry.activites_annexes.length - 4}
            </span>
          )}
        </div>
      )}
      
      {/* Commentaires du coach pour cette entrée */}
      <ModuleComments comments={entryComments} loading={commentsLoading} compact />
    </div>
  )
}

const EntryCardMemo = React.memo(EntryCard)

export default function JournalPage() {
  const { user } = useAuth()
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useJournal()
  const { badges, loading: badgesLoading, addBadge } = useBadges()
  const { photos } = usePhotosLibres()
  const { objectifs, loading: objectifsLoading, addObjectif, updateProgression } = useObjectifs()
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showHistory, setShowHistory] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const { comments: journalComments, loading: journalCommentsLoading } = useCoachCommentsByModule('journal', selectedDate)

  // Objectifs prédéfinis simples
  const OBJECTIFS_PREDEFINIS = [
    { titre: "🔥 Streak 7 jours", description: "Tenir un journal 7 jours d'affilée", cible: 7, type: "journal" as const },
    { titre: "😊 Bonne humeur", description: "Humeur >7 pendant 5 jours", cible: 5, type: "humeur" as const },
    { titre: "💪 Actif", description: "3 entraînements cette semaine", cible: 3, type: "entrainement" as const }
  ]

  // 🚀 Optimisation Performance - Issue #7
  const objectifsActifs = useMemo(() => 
    objectifs.filter(o => o.statut === 'actif'), 
    [objectifs]
  )
  
  const objectifsAccomplis = useMemo(() => 
    objectifs.filter(o => o.statut === 'accompli').slice(0, 3), 
    [objectifs]
  )

  // Date d'aujourd&apos;hui
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = entries.find(e => e.date === today)

  // Calculer les stats
  const recentEntries = entries.slice(0, 7) // 7 derniers jours
  const avgHumeur = recentEntries.filter(e => e.humeur).length > 0 
    ? Math.round(recentEntries.reduce((sum, e) => sum + (e.humeur || 0), 0) / recentEntries.filter(e => e.humeur).length)
    : 0
  const avgEnergie = recentEntries.filter(e => e.energie).length > 0
    ? Math.round(recentEntries.reduce((sum, e) => sum + (e.energie || 0), 0) / recentEntries.filter(e => e.energie).length)
    : 0

  // Vérifier les nouveaux badges automatiquement
  useEffect(() => {
    if (!user || loading || badgesLoading || entries.length === 0) return

    const userData = calculateUserData(entries, photos as unknown as PhotoProgression[])
    const existingBadgeIds = badges.map(b => b.nom)
    const newBadges = checkNewBadges(userData, existingBadgeIds)

    // Débloquer les nouveaux badges
    newBadges.forEach(async (badgeDefinition) => {
      const result = await addBadge({
        type: badgeDefinition.type,
        nom: badgeDefinition.nom,
        description: badgeDefinition.description,
        icone: badgeDefinition.icone,
        condition: badgeDefinition.condition
      })

      if (result.success) {
        toast.success(`🏆 Nouveau badge débloqué : ${badgeDefinition.nom}`, {
          duration: 4000,
        })
      }
    })
  }, [entries, photos, badges, user, loading, badgesLoading, addBadge])

  // Calculer et mettre à jour la progression des objectifs automatiquement
  useEffect(() => {
    if (!user || objectifsLoading || objectifs.length === 0 || entries.length === 0) return

    objectifs.filter(obj => obj.statut === 'actif').forEach(async (objectif) => {
      let nouvelleProg = 0

      const cibleValue = (objectif as { cible?: number; cible_valeur?: number }).cible ?? (objectif as { cible?: number; cible_valeur?: number }).cible_valeur ?? 1

      if (objectif.type === 'journal') {
        // Calculer le streak actuel pour les objectifs de journal
        const sortedEntries = entries.sort((a, b) => b.date.localeCompare(a.date))
        let streak = 0
        const currentDate = new Date()

        for (const entry of sortedEntries) {
          const entryDate = new Date(entry.date + 'T00:00:00')
          const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysDiff === streak) streak++
          else break
        }
        nouvelleProg = Math.min((streak / cibleValue) * 100, 100)
      } else if ((objectif as { type?: string }).type === 'humeur') {
        // Calculer les jours récents avec bonne humeur (>7)
        const recentGoodMoodDays = entries.filter(entry => {
          const entryDate = new Date(entry.date)
          const fiveDaysAgo = new Date()
          fiveDaysAgo.setDate(fiveDaysAgo.getDate() - cibleValue)
          return entryDate >= fiveDaysAgo && entry.humeur && entry.humeur > 7
        }).length
        nouvelleProg = Math.min((recentGoodMoodDays / cibleValue) * 100, 100)
      } else if (objectif.type === 'entrainement') {
        // À connecter aux entraînements plus tard
        nouvelleProg = 0
      }
      // Mettre à jour seulement si la progression a changé
      if (Math.round(nouvelleProg) !== Math.round(objectif.progression)) {
        const result = await updateProgression(objectif.id, nouvelleProg)
        
        if (result.success && nouvelleProg >= 100) {
          toast.success(`🎯 Objectif "${objectif.titre}" atteint !`, {
            duration: 4000,
          })
        }
      }
    })
  }, [entries, objectifs, user, objectifsLoading, updateProgression])

  const handleNewEntry = () => {
    setEditingEntry(null)
    setShowForm(true)
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setShowForm(true)
  }

  const handleDelete = async (entry: JournalEntry) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) return

    const result = await deleteEntry(entry.id)
    if (result.success) {
      toast.success('Entrée supprimée')
    } else {
      toast.error(`Erreur : ${result.error}`)
    }
  }

  // Raccourcis clavier pour améliorer l'UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n' && !showForm) {
        e.preventDefault()
        handleNewEntry()
      }
      if (e.key === 'Escape' && showForm) {
        setShowForm(false)
        setEditingEntry(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showForm])

  const handleSubmit = async (entryData: Omit<JournalEntry, 'id'>) => {
    if (!user || isSubmitting) return { success: false, error: 'Non connecté' }

    setIsSubmitting(true)
    try {
      let result
      if (editingEntry) {
        // Pour l'update, ne pas inclure user_id/created_at/updated_at (gérés côté hook)
        const updateData: Record<string, unknown> = { ...entryData }
        delete (updateData as { user_id?: unknown }).user_id
        delete (updateData as { created_at?: unknown }).created_at
        delete (updateData as { updated_at?: unknown }).updated_at
        result = await updateEntry(editingEntry.id, updateData as Partial<Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>>)
      } else {
        result = await addEntry({ ...entryData, user_id: user.uid })
      }

      if (result.success) {
        toast.success(editingEntry ? 'Entrée modifiée avec succès !' : 'Entrée ajoutée avec succès !')
        setShowForm(false)
        setEditingEntry(null)
        // Mettre à jour la date sélectionnée pour les photos
        setSelectedDate(entryData.date)
      } else {
        toast.error(`Erreur : ${result.error}`)
      }
      return result
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-white/20 rounded w-64"></div>
              <div className="h-4 bg-white/20 rounded w-48"></div>
            </div>
            <div className="h-10 bg-white/20 rounded w-32"></div>
          </div>
          
          {/* Content skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <ListSkeleton items={3} />
            </div>
            <div className="space-y-4">
              <ProfileSkeleton />
              <CardSkeleton />
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold neon-text">Journal & Motivation</h1>
            <p className="text-muted-foreground">Votre espace personnel de suivi</p>
          </div>
          {/* Bouton compact pour desktop */}
          <button
            onClick={handleNewEntry}
            className="hidden md:flex px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-all duration-200 transform hover:scale-105 items-center gap-2"
            title="Ajouter une nouvelle entrée (raccourci: Ctrl+N)"
          >
            <Plus className="h-4 w-4" />
            {todayEntry ? 'Modifier aujourd\'hui' : 'Nouvelle entrée'}
          </button>
        </div>

        {/* Dashboard compact avec stats essentielles */}
        {user && entries.length > 0 && (
          <div className="glass-effect p-6 rounded-xl border border-white/10 bg-gradient-to-r from-neon-purple/5 to-neon-cyan/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {avgHumeur > 0 && (
                <div className="text-center p-3 rounded-lg bg-neon-green/10 border border-neon-green/20">
                  <div className="text-2xl font-bold text-neon-green">{avgHumeur}</div>
                  <div className="text-xs text-muted-foreground">Humeur</div>
                  <div className="w-full bg-space-700 rounded-full h-1 mt-2">
                    <div 
                      className="bg-neon-green h-1 rounded-full transition-all duration-500"
                      style={{ width: `${(avgHumeur / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {avgEnergie > 0 && (
                <div className="text-center p-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
                  <div className="text-2xl font-bold text-neon-cyan">{avgEnergie}</div>
                  <div className="text-xs text-muted-foreground">Énergie</div>
                  <div className="w-full bg-space-700 rounded-full h-1 mt-2">
                    <div 
                      className="bg-neon-cyan h-1 rounded-full transition-all duration-500"
                      style={{ width: `${(avgEnergie / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="text-center p-3 rounded-lg bg-neon-purple/10 border border-neon-purple/20">
                <div className="text-2xl font-bold text-neon-purple">{entries.length}</div>
                <div className="text-xs text-muted-foreground">Jours</div>
                <div className="text-xs text-neon-purple mt-1">Streak actuel</div>
              </div>
              {objectifsActifs.length > 0 && (
                <div className="text-center p-3 rounded-lg bg-neon-pink/10 border border-neon-pink/20">
                  <div className="text-2xl font-bold text-neon-pink">{objectifsActifs.length}</div>
                  <div className="text-xs text-muted-foreground">Objectifs</div>
                  <div className="text-xs text-neon-pink mt-1">En cours</div>
                </div>
              )}
            </div>
            
            {/* Hint compact */}
            {showHint && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t border-white/10">
                <span>💡 Raccourci: Ctrl+N pour ajouter une entrée</span>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-muted-foreground hover:text-white transition-colors ml-2"
                  title="Masquer ce hint"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* Barre outils date améliorée */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">📅 Date sélectionnée :</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/20 transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDate(today)}
                className="px-3 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg text-sm hover:bg-neon-cyan/30 transition-colors font-medium"
              >
                Aujourd&apos;hui
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors font-medium"
              >
                📊 Historique complet
              </button>
            </div>
          </div>
        </div>

        {/* Message si pas connecté */}
        {!user && (
          <div className="glass-effect p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-yellow-400">
              Connectez-vous pour accéder à votre journal personnel !
            </p>
          </div>
        )}

        {user && (
          <>
            {/* Messages du Coach pour cette date (rétractable fermé par défaut) */}
            <CollapsibleCard title="Messages du Coach" defaultOpen={false} counter={journalComments?.length || 0}>
              <ModuleComments comments={journalComments} loading={journalCommentsLoading} />
            </CollapsibleCard>


            {/* Badges obtenus */}
            {badgesLoading ? (
              <CardSkeleton />
            ) : badges.length > 0 && (
              <div className="glass-effect p-6 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-neon-purple" />
                  <h3 className="text-lg font-semibold text-white">Badges obtenus</h3>
                  <span className="text-sm text-muted-foreground">({badges.length})</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {badges.slice(0, 8).map((badge) => (
                    <div key={badge.id} className="text-center p-3 rounded-lg bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 border border-neon-purple/20">
                      <div className="text-2xl mb-1">{badge.icone}</div>
                      <div className="text-xs font-medium text-white">{badge.nom}</div>
                      <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
                    </div>
                  ))}
                </div>
                {badges.length > 8 && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    +{badges.length - 8} autres badges...
                  </p>
                )}
              </div>
            )}

            {/* Objectifs */}
            {objectifsLoading ? (
              <CardSkeleton />
            ) : (
              <div className="glass-effect p-6 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-neon-cyan" />
                    <h3 className="text-lg font-semibold text-white">Mes Objectifs</h3>
                    <span className="text-sm text-muted-foreground">({objectifs.filter(o => o.statut === 'actif').length} actifs)</span>
                  </div>
                </div>

              {/* Objectifs actifs */}
              <div className="space-y-3 mb-4">
                {objectifsActifs.map((objectif) => (
                  <div key={objectif.id} className="p-3 rounded-lg bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{objectif.titre}</h4>
                      <span className="text-xs text-neon-cyan">{Math.round(objectif.progression)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{objectif.description}</p>
                    <div className="w-full bg-space-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-neon-cyan to-neon-purple h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(objectif.progression, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Objectifs prédéfinis à ajouter */}
              {objectifs.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">Commencez avec ces objectifs :</p>
                  {OBJECTIFS_PREDEFINIS.map((obj, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-space-700/50 border border-white/10">
                      <div>
                        <h4 className="font-medium text-white">{obj.titre}</h4>
                        <p className="text-xs text-muted-foreground">{obj.description}</p>
                      </div>
                      <button
                        onClick={async () => {
                          const result = await addObjectif(obj)
                          if (result.success) {
                            toast.success(`Objectif "${obj.titre}" ajouté !`)
                          }
                        }}
                        className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded text-xs hover:bg-neon-cyan/30 transition-colors"
                      >
                        Ajouter
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Objectifs complétés */}
              {objectifsAccomplis.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-muted-foreground mb-2">✅ Objectifs atteints :</p>
                  <div className="flex flex-wrap gap-2">
                    {objectifsAccomplis.map((objectif) => (
                      <span key={objectif.id} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        {objectif.titre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              </div>
            )}

            {/* Corrélations simples */}
            {entries.length >= 3 && (
              <CollapsibleCard title="Corrélations (7 derniers jours)" defaultOpen={false}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Corrélation Humeur vs Énergie */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-neon-green/10 to-neon-cyan/10 border border-neon-green/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">😊 Humeur → ⚡ Énergie</span>
                      <span className="text-xs text-neon-green">
                        {(() => {
                          const recent = entries.slice(0, 7).filter(e => e.humeur && e.energie)
                          if (recent.length < 2) return "N/A"
                          const avgHumeur = recent.reduce((sum, e) => sum + (e.humeur || 0), 0) / recent.length
                          const avgEnergie = recent.reduce((sum, e) => sum + (e.energie || 0), 0) / recent.length
                          const correlation = avgHumeur > 7 && avgEnergie > 7 ? "Positive ✓" : 
                                            avgHumeur < 5 && avgEnergie < 5 ? "Cohérente ✓" : "Variable"
                          return correlation
                        })()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        const recent = entries.slice(0, 7).filter(e => e.humeur && e.energie)
                        if (recent.length < 2) return "Pas assez de données"
                        const avgHumeur = Math.round(recent.reduce((sum, e) => sum + (e.humeur || 0), 0) / recent.length)
                        const avgEnergie = Math.round(recent.reduce((sum, e) => sum + (e.energie || 0), 0) / recent.length)
                        return `Humeur moy: ${avgHumeur}/10, Énergie moy: ${avgEnergie}/10`
                      })()}
                    </p>
                  </div>

                  {/* Corrélation Motivation vs Humeur */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 border border-neon-purple/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">💪 Motivation → 😊 Humeur</span>
                      <span className="text-xs text-neon-purple">
                        {(() => {
                          const recent = entries.slice(0, 7).filter(e => e.motivation && e.humeur)
                          if (recent.length < 2) return "N/A"
                          const avgMotivation = recent.reduce((sum, e) => sum + (e.motivation || 0), 0) / recent.length
                          const avgHumeur = recent.reduce((sum, e) => sum + (e.humeur || 0), 0) / recent.length
                          const correlation = avgMotivation > 7 && avgHumeur > 7 ? "Positive ✓" : 
                                            avgMotivation < 5 && avgHumeur < 5 ? "Cohérente ✓" : "Variable"
                          return correlation
                        })()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        const recent = entries.slice(0, 7).filter(e => e.motivation && e.humeur)
                        if (recent.length < 2) return "Pas assez de données"
                        const avgMotivation = Math.round(recent.reduce((sum, e) => sum + (e.motivation || 0), 0) / recent.length)
                        const avgHumeur = Math.round(recent.reduce((sum, e) => sum + (e.humeur || 0), 0) / recent.length)
                        return `Motivation moy: ${avgMotivation}/10, Humeur moy: ${avgHumeur}/10`
                      })()}
                    </p>
                  </div>

                  {/* Tendance générale */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">📈 Tendance générale</span>
                      <span className="text-xs text-neon-cyan">
                        {(() => {
                          const recent = entries.slice(0, 7).filter(e => e.humeur)
                          if (recent.length < 3) return "N/A"
                          const first3 = recent.slice(-3).reduce((sum, e) => sum + (e.humeur || 0), 0) / 3
                          const last3 = recent.slice(0, 3).reduce((sum, e) => sum + (e.humeur || 0), 0) / 3
                          const trend = last3 > first3 + 0.5 ? "↗️ Amélioration" : 
                                       last3 < first3 - 0.5 ? "↘️ Baisse" : "→ Stable"
                          return trend
                        })()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Évolution sur les 7 derniers jours
                    </p>
                  </div>
                </div>

                {/* Conseil simple */}
                {(() => {
                  const recent = entries.slice(0, 7).filter(e => e.humeur && e.energie && e.motivation)
                  if (recent.length < 3) return null
                  
                  const avgHumeur = recent.reduce((sum, e) => sum + (e.humeur || 0), 0) / recent.length
                  const avgEnergie = recent.reduce((sum, e) => sum + (e.energie || 0), 0) / recent.length
                  const avgMotivation = recent.reduce((sum, e) => sum + (e.motivation || 0), 0) / recent.length
                  
                  let conseil = ""
                  if (avgHumeur < 6) conseil = "💡 Conseil : Prenez du temps pour vous détendre"
                  else if (avgEnergie < 6) conseil = "💡 Conseil : Vérifiez votre sommeil et hydratation"
                  else if (avgMotivation < 6) conseil = "💡 Conseil : Fixez-vous de petits objectifs atteignables"
                  else conseil = "✨ Excellent ! Vous êtes sur la bonne voie"
                  
                  return (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-neon-cyan">{conseil}</p>
                    </div>
                  )
                })()}
              </CollapsibleCard>
            )}

            {/* Formulaire de saisie */}
            {showForm && (
              <JournalForm
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                existingEntry={editingEntry}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Section Photos du jour */}
            <div className="glass-effect p-6 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  📷 Photos du jour
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-44 px-3 py-1 bg-white/5 border border-white/10 rounded text-white text-sm focus:border-neon-purple focus:outline-none"
                  />
                  <button
                    onClick={() => setShowPhotos(!showPhotos)}
                    className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded text-sm hover:bg-neon-purple/30 transition-colors"
                  >
                    {showPhotos ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
              </div>
              
              {showPhotos && (
                <PhotosLibresGallery date={selectedDate} />
              )}
            </div>

            {/* Historique des entrées */}
            {entries.length === 0 ? (
              <div className="glass-effect p-6 rounded-xl border border-white/10">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h2 className="text-xl font-semibold text-white mb-2">Votre journal vous attend</h2>
                  <p className="text-muted-foreground mb-4">
                    Commencez à suivre votre humeur, votre énergie et vos notes quotidiennes
                  </p>
                  <button
                    onClick={handleNewEntry}
                    className="px-6 py-3 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors"
                  >
                    Créer ma première entrée
                  </button>
                </div>
              </div>
            ) : (
              <CollapsibleCard title="Historique" defaultOpen={false}>
                <PaginatedEntries entries={entries.filter(e => e.date === selectedDate)} onEdit={handleEdit} onDelete={handleDelete} />
              </CollapsibleCard>
            )}
          </>
        )}
      </div>
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
  )
} 