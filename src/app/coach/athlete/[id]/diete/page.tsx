'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import MainLayout from '@/components/layout/MainLayout'
import { ArrowLeft, Calendar, Plus, Edit2, MessageCircle, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Repas } from '@/types'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import dynamic from 'next/dynamic'

// Optimisation : Charts dynamiques groupés
const ChartsSection = dynamic(() => import('@/components/charts/CoachDieteCharts'), { 
  ssr: false,
  loading: () => (
    <div className="glass-effect rounded-xl p-6 border border-white/10 h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple"></div>
    </div>
  )
})

export default function CoachAthleteDietePage() {
  const { userProfile, user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const athleteId = params.id as string
  
  const [athlete, setAthlete] = useState<any>(null)
  const [repas, setRepas] = useState<Repas[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    // Vérifier que l'utilisateur est bien un coach
    if (userProfile && userProfile.role !== 'coach') {
      toast.error("Accès réservé aux coachs")
      router.push('/')
      return
    }

    if (!athleteId || !user) return

    // Récupérer les infos de l'athlète
    const fetchAthlete = async () => {
      try {
        const athleteDoc = await getDoc(doc(db, 'users', athleteId))
        if (athleteDoc.exists()) {
          setAthlete({ id: athleteDoc.id, ...athleteDoc.data() })
        } else {
          toast.error("Utilisateur non trouvé")
          router.push('/coach')
        }
      } catch (error) {
        console.error("Erreur récupération athlète:", error)
        toast.error("Erreur de chargement")
      }
    }

    fetchAthlete()

    // Écouter les repas de l'athlète (sans orderBy pour éviter les problèmes d'index)
    const q = query(
      collection(db, 'repas'),
      where('user_id', '==', athleteId),
      where('date', '==', selectedDate)
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const repasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Repas[]
        
        setRepas(repasData)
        setLoading(false)
      },
      (error) => {
        console.error('Erreur récupération repas:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userProfile, router, athleteId, user, selectedDate])

  // Calculer les totaux à partir des aliments (structure réelle)
  const totals = repas.reduce((acc, meal) => {
    if (meal.aliments) {
      meal.aliments.forEach(aliment => {
        acc.calories += Number(aliment.macros?.kcal) || 0
        acc.proteines += Number(aliment.macros?.prot) || 0
        acc.glucides += Number(aliment.macros?.glucides) || 0
        acc.lipides += Number(aliment.macros?.lipides) || 0
      })
    }
    return acc
  }, { calories: 0, proteines: 0, glucides: 0, lipides: 0 })

  // Ajouter un commentaire coach
  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      await addDoc(collection(db, 'coach_comments'), {
        coach_id: user?.uid,
        athlete_id: athleteId,
        module: 'diete',
        date: selectedDate,
        comment: newComment,
        created_at: serverTimestamp()
      })

      toast.success("Commentaire ajouté")
      setNewComment('')
      setShowCommentModal(false)
    } catch (error) {
      console.error("Erreur ajout commentaire:", error)
      toast.error("Erreur lors de l'ajout du commentaire")
    } finally {
      setSubmittingComment(false)
    }
  }

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
              <h1 className="text-3xl font-bold text-white">Diète de {athlete.nom}</h1>
              <p className="text-gray-400">Suivi nutritionnel • {athlete.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/coach/athlete/${athleteId}/plan-diete`}
              className="btn-secondary flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              Plan Diète
            </Link>
            <button 
              onClick={() => setShowCommentModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Ajouter un commentaire
            </button>
          </div>
        </div>

        {/* Sélecteur de date */}
        <div className="glass-effect rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-neon-purple" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-44 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white 
                       focus:outline-none focus:border-neon-purple"
            />
            <span className="text-gray-400 text-sm">
              {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </span>
          </div>
        </div>

        {/* Résumé nutritionnel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Calories</p>
            <p className="text-3xl font-bold text-white">{Math.round(totals.calories)}</p>
            <p className="text-xs text-neon-green mt-1">kcal</p>
          </div>
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Protéines</p>
            <p className="text-3xl font-bold text-white">{Math.round(totals.proteines * 10) / 10}</p>
            <p className="text-xs text-neon-cyan mt-1">grammes</p>
          </div>
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Glucides</p>
            <p className="text-3xl font-bold text-white">{Math.round(totals.glucides * 10) / 10}</p>
            <p className="text-xs text-neon-purple mt-1">grammes</p>
          </div>
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Lipides</p>
            <p className="text-3xl font-bold text-white">{Math.round(totals.lipides * 10) / 10}</p>
            <p className="text-xs text-neon-pink mt-1">grammes</p>
          </div>
        </div>

        {/* Liste des repas */}
        <div className="space-y-4">
          {[ 
            { type: 'petit_dej', label: 'Petit Déjeuner' },
            { type: 'dejeuner', label: 'Déjeuner' },
            { type: 'collation_apres_midi', label: 'Collation Après-midi' },
            { type: 'collation_soir', label: 'Collation Soir' },
            { type: 'diner', label: 'Dîner' }
          ].map(({ type, label }) => {
            const mealData = repas.find(r => r.repas === type)
            
            return (
              <CollapsibleCard key={type} title={label} defaultOpen={false}>
                {mealData ? (
                  <div className="space-y-3">
                    {mealData.aliments?.map((aliment, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white">{aliment.nom}</p>
                          <p className="text-xs text-gray-400">{aliment.quantite}g</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-neon-green">{Math.round(Number(aliment.macros?.kcal) || 0)} kcal</p>
                          <p className="text-xs text-gray-400">
                            P: {Math.round((Number(aliment.macros?.prot) || 0) * 10) / 10}g • G: {Math.round((Number(aliment.macros?.glucides) || 0) * 10) / 10}g • L: {Math.round((Number(aliment.macros?.lipides) || 0) * 10) / 10}g
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-sm text-gray-400">
                        Total : <span className="text-white">{Math.round(
                          mealData.aliments?.reduce((sum, aliment) => sum + (Number(aliment.macros?.kcal) || 0), 0) || 0
                        )} kcal</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun repas enregistré</p>
                )}
              </CollapsibleCard>
            )
          })}
        </div>

        {/* Modal de commentaire */}
        {showCommentModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-effect rounded-2xl p-6 border border-white/10 max-w-lg w-full">
              <h3 className="text-xl font-semibold text-white mb-4">
                Ajouter un commentaire
              </h3>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Votre commentaire sur la diète du jour..."
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                         text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple
                         resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowCommentModal(false)}
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
