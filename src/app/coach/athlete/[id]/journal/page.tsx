'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import MainLayout from '@/components/layout/MainLayout'
import { ArrowLeft, MessageCircle, BookOpen, Smile, Battery, Brain } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, addDoc, serverTimestamp, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { JournalEntry } from '@/types'
import CollapsibleCard from '@/components/ui/CollapsibleCard'

type AthleteLite = { id: string; nom?: string; email?: string }

export default function CoachAthleteJournalPage() {
  const { user } = useAuth()
  const params = useParams()
  const athleteId = params.id as string
  
  const [athlete, setAthlete] = useState<AthleteLite | null>(null)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (!athleteId || !user) return

    // Récupérer les infos de l'athlète
    const fetchAthlete = async () => {
      try {
        const athleteDoc = await getDoc(doc(db, 'users', athleteId))
        if (athleteDoc.exists()) {
          setAthlete({ id: athleteDoc.id, ...athleteDoc.data() })
        }
      } catch (error) {
        console.error("Erreur récupération athlète:", error)
      }
    }

    fetchAthlete()

    // Écouter les 30 dernières entrées du journal
    const q = query(
      collection(db, 'journal'),
      where('user_id', '==', athleteId),
      orderBy('date', 'desc'),
      limit(30)
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as JournalEntry[]
        setJournalEntries(data)
        setLoading(false)
      },
      (error) => {
        console.error('Erreur récupération journal:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [athleteId, user])

  // Ajouter un commentaire coach
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedEntry) return

    setSubmittingComment(true)
    try {
      await addDoc(collection(db, 'coach_comments'), {
        coach_id: user?.uid,
        athlete_id: athleteId,
        module: 'journal',
        entry_id: selectedEntry.id,
        date: selectedEntry.date,
        comment: newComment,
        created_at: serverTimestamp()
      })

      toast.success("Commentaire ajouté")
      setNewComment('')
      setShowCommentModal(false)
      setSelectedEntry(null)
    } catch (error) {
      console.error("Erreur ajout commentaire:", error)
      toast.error("Erreur lors de l'ajout du commentaire")
    } finally {
      setSubmittingComment(false)
    }
  }

  // Calculer les moyennes
  const calculateAverages = () => {
    if (journalEntries.length === 0) return { humeur: 0, energie: 0, motivation: 0 }
    
    const totals = journalEntries.reduce((acc, entry) => ({
      humeur: acc.humeur + (entry.humeur || 0),
      energie: acc.energie + (entry.energie || 0),
      motivation: acc.motivation + (entry.motivation || 0)
    }), { humeur: 0, energie: 0, motivation: 0 })

    return {
      humeur: Math.round(totals.humeur / journalEntries.length * 10) / 10,
      energie: Math.round(totals.energie / journalEntries.length * 10) / 10,
      motivation: Math.round(totals.motivation / journalEntries.length * 10) / 10
    }
  }

  const averages = calculateAverages()

  if (loading || !athlete) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/coach"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Journal de {athlete.nom}</h1>
              <p className="text-gray-400">Suivi bien-être et motivation</p>
            </div>
          </div>
        </div>

        {/* Moyennes sur 30 jours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <Smile className="w-8 h-8 text-neon-purple" />
              <div>
                <p className="text-sm text-gray-400">Humeur moyenne</p>
                <p className="text-2xl font-bold text-white">{averages.humeur}/10</p>
              </div>
            </div>
          </div>
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <Battery className="w-8 h-8 text-neon-green" />
              <div>
                <p className="text-sm text-gray-400">Énergie moyenne</p>
                <p className="text-2xl font-bold text-white">{averages.energie}/10</p>
              </div>
            </div>
          </div>
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-neon-cyan" />
              <div>
                <p className="text-sm text-gray-400">Motivation moyenne</p>
                <p className="text-2xl font-bold text-white">{averages.motivation}/10</p>
              </div>
            </div>
          </div>
        </div>

        {/* Entrées du journal */}
        <CollapsibleCard title="Historique du journal" defaultOpen>
          {journalEntries.length === 0 ? (
            <div className="glass-effect rounded-xl p-12 border border-white/10 text-center">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune entrée de journal</p>
            </div>
          ) : (
            journalEntries.map((entry) => (
              <div 
                key={entry.id} 
                className="glass-effect rounded-xl p-6 border border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </h3>
                      {/* Badges retirés: non typés sur JournalEntry */}
                    </div>
                    
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Humeur</p>
                        <p className="text-lg font-semibold text-neon-purple">{entry.humeur || '-'}/10</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Énergie</p>
                        <p className="text-lg font-semibold text-neon-green">{entry.energie || '-'}/10</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Motivation</p>
                        <p className="text-lg font-semibold text-neon-cyan">{entry.motivation || '-'}/10</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Sommeil</p>
                        <p className="text-lg font-semibold text-blue-400">{entry.sommeil_duree ?? '-'}h</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Stress</p>
                        <p className="text-lg font-semibold text-orange-400">{entry.stress || '-'}/10</p>
                      </div>
                      {/* Faim retiré: champ non typé */}
                    </div>

                    {entry.note && (
                      <p className="text-sm text-gray-300 italic mb-3">
                        &quot;{entry.note}&quot;
                      </p>
                    )}

                    {/* Objectifs retirés ici (non présents dans JournalEntry) */}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedEntry(entry)
                      setShowCommentModal(true)
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ml-4"
                    title="Ajouter un commentaire"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))
          )}
        </CollapsibleCard>

        {/* Modal de commentaire */}
        {showCommentModal && selectedEntry && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-effect rounded-2xl p-6 border border-white/10 max-w-lg w-full">
              <h3 className="text-xl font-semibold text-white mb-2">
                Commenter l&apos;entrée du journal
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {new Date(selectedEntry.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Vos observations sur l&apos;état de votre athlète..."
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                         text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple
                         resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowCommentModal(false)
                    setSelectedEntry(null)
                    setNewComment('')
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="flex-1 btn-primary"
                >
                  {submittingComment ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
