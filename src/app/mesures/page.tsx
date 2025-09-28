'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/hooks/useAuth'
import { useMesures, useCoachCommentsByModule, usePaginatedMesures } from '@/hooks/useFirestore'
import { Mesure } from '@/types'
import ModuleComments from '@/components/ui/ModuleComments'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { CardSkeleton, ChartSkeleton, ListSkeleton, TableSkeleton } from '@/components/ui/Skeletons'
import { formatDate } from '@/lib/utils'
import { Plus, BarChart3, Camera } from 'lucide-react'
import dynamic from 'next/dynamic'
import MesuresCardClickable from '@/components/ui/MesuresCardClickable'
import MesuresDetailModal from '@/components/ui/MesuresDetailModal'
import MesuresFormModal from '@/components/ui/MesuresFormModal'
import { useAriaAnnouncer } from '@/hooks/useAriaAnnouncer'
const MesuresCharts = dynamic(() => import('@/components/charts/MesuresCharts'), { ssr: false })
const PhotoUpload = dynamic(() => import('@/components/ui/PhotoUpload'), { ssr: false })



export default function MesuresPage() {
  const { user } = useAuth()
  const { addMesure, updateMesure, deleteMesure, getStats } = useMesures() // Pour les opérations CRUD
  const { data: mesures, loading, hasMore, loadMore } = usePaginatedMesures(30) // Charger 30 mesures par page
  const { comments: mesureComments, loading: commentsLoading } = useCoachCommentsByModule('mesures')
  const { announceSuccess, announceValidationError, announceModalState } = useAriaAnnouncer()
  const [showForm, setShowForm] = useState(false)
  const [editingMesure, setEditingMesure] = useState<Mesure | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)
  
  // États pour les composants industrialisés
  const [selectedMesure, setSelectedMesure] = useState<Mesure | null>(null)
  const [showMesureDetail, setShowMesureDetail] = useState(false)
  // const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week') // Supprimé - pas de sélecteur de période



  // Mesure la plus récente avec des données valides pour les stats
  const lastMesure = mesures.find(m => m.poids || m.taille || m.masse_grasse || m.masse_musculaire || 
                                      m.tour_hanches || m.tour_bras || m.tour_cuisses || 
                                      m.tour_cou || m.tour_poitrine || m.commentaire) || mesures[0]
  const stats = lastMesure ? getStats(lastMesure) : null


  const handleSubmit = async (formData: {
    date: string
    poids: string
    taille: string
    masse_grasse: string
    masse_musculaire: string
    tour_taille: string
    tour_hanches: string
    tour_bras: string
    tour_cuisses: string
    tour_cou: string
    tour_poitrine: string
    commentaire: string
  }) => {
    if (!user) return

    setIsSubmitting(true)
    
    try {
      const mesureData = {
        date: formData.date,
        poids: formData.poids ? parseFloat(formData.poids) : undefined,
        taille: formData.taille ? parseFloat(formData.taille) : undefined,
        masse_grasse: formData.masse_grasse ? parseFloat(formData.masse_grasse) : undefined,
        masse_musculaire: formData.masse_musculaire ? parseFloat(formData.masse_musculaire) : undefined,
        tour_taille: formData.tour_taille ? parseFloat(formData.tour_taille) : undefined,
        tour_hanches: formData.tour_hanches ? parseFloat(formData.tour_hanches) : undefined,
        tour_bras: formData.tour_bras ? parseFloat(formData.tour_bras) : undefined,
        tour_cuisses: formData.tour_cuisses ? parseFloat(formData.tour_cuisses) : undefined,
        tour_cou: formData.tour_cou ? parseFloat(formData.tour_cou) : undefined,
        tour_poitrine: formData.tour_poitrine ? parseFloat(formData.tour_poitrine) : undefined,
        commentaire: formData.commentaire || undefined
      }

      let result
      if (editingMesure) {
        result = await updateMesure(editingMesure.id, mesureData)
      } else {
        result = await addMesure(mesureData)
      }

      if (result.success) {
        const message = editingMesure ? 'Mesure mise à jour !' : 'Mesure ajoutée !'
        toast.success(message)
        announceSuccess(message)
        setShowForm(false)
        setEditingMesure(null)
      } else {
        const errorMessage = result.error || 'Erreur lors de l\'enregistrement'
        toast.error(errorMessage)
        announceValidationError('Mesure', errorMessage)
      }
    } catch {
      toast.error('Erreur inattendue')
      announceValidationError('Mesure', 'Erreur inattendue lors de la sauvegarde')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (mesure: Mesure) => {
    setEditingMesure(mesure)
    setShowForm(true)
    announceModalState(true, 'Modifier la mesure')
  }

  // Handlers pour les composants industrialisés
  const handleMesureView = (mesure: Mesure) => {
    setSelectedMesure(mesure)
    setShowMesureDetail(true)
    announceModalState(true, 'Détails de la mesure')
  }

  const handleMesureEdit = () => {
    if (selectedMesure) {
      setEditingMesure(selectedMesure)
      setShowForm(true)
      setShowMesureDetail(false)
    }
  }

  const handleMesureDelete = () => {
    if (selectedMesure) {
      confirmDelete(selectedMesure.id)
      setShowMesureDetail(false)
    }
  }

  const handleDelete = async (id: string) => {
    const mesure = mesures.find(m => m.id === id)
    if (!mesure) return

    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>Supprimer la mesure du {formatDate(mesure.date)} ?</span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id)
              confirmDelete(id)
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Supprimer
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Annuler
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      style: {
        background: 'rgba(15, 23, 42, 0.98)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        minWidth: '300px',
      }
    })
  }

  // Raccourcis clavier pour améliorer l'UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n' && !showForm) {
        e.preventDefault()
        setEditingMesure(null)
        setShowForm(true)
      }
      if (e.key === 'Escape' && showForm) {
        setShowForm(false)
        setEditingMesure(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showForm])

  const confirmDelete = async (id: string) => {
    const result = await deleteMesure(id)
    if (result.success) {
      toast.success('Mesure supprimée')
    } else {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Boutons d'action */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            {showCharts ? 'Masquer' : 'Graphiques'}
          </button>
          <button
            onClick={() => setShowPhotos(!showPhotos)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-pink/20 text-neon-pink rounded-lg hover:bg-neon-pink/30 transition-colors"
          >
            <Camera className="h-4 w-4" />
            {showPhotos ? 'Masquer' : 'Photos'}
          </button>
        </div>

        {/* Header industrialisé avec métriques */}
        {user && (
          <>
            {/* Header avec métriques importantes et tendances */}
            <div className="glass-effect rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📏</span>
                <h2 className="text-lg font-semibold text-white">MESURES</h2>
              </div>
              
              {/* Métriques principales avec tendances */}
              {mesures.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Poids avec tendance */}
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Poids actuel</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        stats && stats.evolution_poids > 0 ? 'bg-red-500/20 text-red-400' :
                        stats && stats.evolution_poids < 0 ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {stats && stats.evolution_poids > 0 ? '↗️' : stats && stats.evolution_poids < 0 ? '↘️' : '→'}
                        {stats && stats.evolution_poids !== 0 ? Math.abs(stats.evolution_poids).toFixed(1) + 'kg' : 'Stable'}
                      </span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {mesures[0].poids || 0}kg
                    </div>
                    <div className="text-xs text-gray-400">
                      {stats ? `Fourchette: ${stats.poids_ideal_min}-${stats.poids_ideal_max}kg` : 'Ajoutez taille pour calculer IMC'}
                    </div>
                  </div>

                  {/* IMC avec tendance */}
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">IMC</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        stats && stats.imc < 18.5 ? 'bg-blue-500/20 text-blue-400' :
                        stats && stats.imc < 25 ? 'bg-green-500/20 text-green-400' :
                        stats && stats.imc < 30 ? 'bg-yellow-500/20 text-yellow-400' :
                        stats ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {stats ? (
                          stats.imc < 18.5 ? 'Sous-poids' :
                          stats.imc < 25 ? 'Normal' :
                          stats.imc < 30 ? 'Surpoids' : 'Obésité'
                        ) : 'Calcul...'}
                      </span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {stats ? stats.imc.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Dernière mesure: {formatDate(mesures[0].date)}
                    </div>
                  </div>

                  {/* Masse grasse avec tendance */}
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Masse grasse</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        stats && stats.evolution_masse_grasse > 0 ? 'bg-red-500/20 text-red-400' :
                        stats && stats.evolution_masse_grasse < 0 ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {stats && stats.evolution_masse_grasse > 0 ? '↗️' : stats && stats.evolution_masse_grasse < 0 ? '↘️' : '→'}
                        {stats && stats.evolution_masse_grasse !== 0 ? Math.abs(stats.evolution_masse_grasse).toFixed(1) + '%' : 'Stable'}
                      </span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {mesures[0].masse_grasse || 0}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {mesures.length} mesure{mesures.length > 1 ? 's' : ''} enregistrée{mesures.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Conseil intelligent */}
              {stats && (
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-neon-cyan">💡</span>
                    <span>
                      {(() => {
                        const currentWeight = mesures.length > 0 ? (mesures[0].poids || 0) : 0
                        if (currentWeight === 0) {
                          return 'Ajoutez votre poids pour obtenir des conseils personnalisés.'
                        }
                        
                        const weightStatus = currentWeight > stats.poids_ideal_max ? 
                          `Votre poids (${currentWeight}kg) est au-dessus de la fourchette normale (${stats.poids_ideal_min}-${stats.poids_ideal_max}kg).` :
                          currentWeight < stats.poids_ideal_min ?
                          `Votre poids (${currentWeight}kg) est en-dessous de la fourchette normale (${stats.poids_ideal_min}-${stats.poids_ideal_max}kg).` :
                          `Votre poids (${currentWeight}kg) est dans la fourchette normale (${stats.poids_ideal_min}-${stats.poids_ideal_max}kg).`
                        
                        const evolution = stats.evolution_poids > 0 ? 
                          `Vous avez pris ${stats.evolution_poids.toFixed(1)}kg.` : 
                          stats.evolution_poids < 0 ? 
                          `Vous avez perdu ${Math.abs(stats.evolution_poids).toFixed(1)}kg.` : 
                          'Votre poids est stable.'
                        
                        return `${weightStatus} ${evolution}`
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Hint compact */}
            <div className="glass-effect p-3 rounded-lg border border-white/10 mb-6">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>💡 Cliquez sur le bouton flottant pour ajouter une mesure</span>
              </div>
            </div>
          </>
        )}


        {/* Message si non connecté */}
        {!user && (
          <div className="glass-effect p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-yellow-400 text-center">
              Connectez-vous pour accéder à vos mesures corporelles
            </p>
          </div>
        )}

        {user && (
          <>
            {/* Messages du Coach (Mesures) */}
            <CollapsibleCard title="Messages du Coach" defaultOpen={false} counter={mesureComments?.length || 0}>
              {commentsLoading ? (
                <ListSkeleton items={2} />
              ) : (
                <ModuleComments comments={mesureComments} loading={commentsLoading} />
              )}
            </CollapsibleCard>
            
            {/* Statistiques actuelles - toujours affichées si connecté */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : null}

            {/* Graphiques d'évolution */}
            {showCharts && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">📊</div>
                  <h2 className="text-xl font-semibold text-white mb-2">Graphiques d&apos;évolution</h2>
                  <p className="text-muted-foreground">Visualisez vos progrès avec des graphiques détaillés</p>
                </div>
                {loading ? (
                  <ChartSkeleton />
                ) : mesures.length > 0 ? (
                  <MesuresCharts mesures={mesures} />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Aucune donnée</h3>
                    <p className="text-muted-foreground">Ajoutez des mesures pour voir vos graphiques d&apos;évolution</p>
                  </div>
                )}
              </div>
            )}

            {/* Photos de progression */}
            {showPhotos && (loading ? (
              <CardSkeleton />
            ) : (
              <PhotoUpload mesures={mesures} />
            ))}


            {/* Liste des mesures */}
            {loading ? (
              <TableSkeleton rows={6} cols={5} />
            ) : mesures.length === 0 ? (
              <div className="glass-effect p-6 rounded-xl border border-white/10 text-center">
                <div className="text-6xl mb-4">📏</div>
                <h2 className="text-xl font-semibold text-white mb-2">Aucune mesure</h2>
                <p className="text-muted-foreground mb-4">Commencez par ajouter votre première mesure</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors"
                >
                  Ajouter une mesure
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Historique des mesures</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mesures.map((mesure) => (
                    <MesuresCardClickable
                      key={mesure.id}
                      mesure={mesure}
                      onView={() => handleMesureView(mesure)}
                      onEdit={() => handleEdit(mesure)}
                      onDelete={() => handleDelete(mesure.id)}
                      getStats={getStats}
                    />
                  ))}
                </div>
                
                {/* Bouton "Charger plus" pour la pagination Firestore */}
                {hasMore && loadMore && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => loadMore()}
                      disabled={loading}
                      className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Chargement...' : 'Charger plus de mesures'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* FAB (Floating Action Button) pour nouvelle mesure */}
      <button
        onClick={() => {
          setEditingMesure(null)
          setShowForm(true)
        }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-full shadow-2xl hover:shadow-neon-purple/30 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
        title="Ajouter une nouvelle mesure (raccourci: Ctrl+N)"
      >
        <Plus className="h-6 w-6 md:h-7 md:w-7 group-hover:rotate-90 transition-transform duration-300" />
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
      </button>

      {/* Modal de détail des mesures */}
      <MesuresDetailModal
        isOpen={showMesureDetail}
        onClose={() => setShowMesureDetail(false)}
        mesure={selectedMesure}
        getStats={getStats}
        onEdit={handleMesureEdit}
        onDelete={handleMesureDelete}
      />

      {/* Modal de formulaire d'ajout/édition */}
      <MesuresFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingMesure(null)
        }}
        onSubmit={handleSubmit}
        editingMesure={editingMesure}
        isSubmitting={isSubmitting}
      />
    </MainLayout>
  )
} 