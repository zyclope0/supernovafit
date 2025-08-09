'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/hooks/useAuth'
import { useMesures, useCoachCommentsByModule } from '@/hooks/useFirestore'
import { Mesure } from '@/types'
import ModuleComments from '@/components/ui/ModuleComments'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { formatDate } from '@/lib/utils'
import { Plus, TrendingUp, Scale, Target, Edit3, Trash2, Calculator, BarChart3, Camera } from 'lucide-react'
import dynamic from 'next/dynamic'
const MesuresCharts = dynamic(() => import('@/components/charts/MesuresCharts'), { ssr: false })
import PhotoUpload from '@/components/ui/PhotoUpload'

function StatsCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  evolution,
  color = 'neon-cyan'
}: {
  title: string
  value: string | number
  unit?: string
  icon: any
  evolution?: number
  color?: string
}) {
  return (
    <div className="glass-effect p-4 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 text-${color}`} />
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
        {evolution !== undefined && (
          <div className={`text-xs px-2 py-1 rounded-full ${
            evolution > 0 ? 'bg-red-500/20 text-red-400' :
            evolution < 0 ? 'bg-green-500/20 text-green-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {evolution > 0 ? '+' : ''}{evolution.toFixed(1)}%
          </div>
        )}
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-2xl font-bold text-${color}`}>{value}</span>
        {unit && <span className="text-sm text-muted-foreground mb-1">{unit}</span>}
      </div>
    </div>
  )
}

function MesureCard({ 
  mesure, 
  onEdit, 
  onDelete,
  getStats
}: {
  mesure: Mesure
  onEdit: (mesure: Mesure) => void
  onDelete: (id: string) => void
  getStats: (mesure: Mesure) => any
}) {
  const stats = getStats(mesure)
  
  return (
    <div className="glass-effect p-4 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium text-white">{formatDate(mesure.date)}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(mesure.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(mesure)}
            className="p-2 text-neon-purple hover:bg-neon-purple/20 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(mesure.id)}
            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {mesure.poids && (
          <div className="text-center">
            <div className="text-lg font-semibold text-neon-green">{mesure.poids}</div>
            <div className="text-xs text-muted-foreground">kg</div>
          </div>
        )}
        {stats?.imc && (
          <div className="text-center">
            <div className="text-lg font-semibold text-neon-cyan">{stats.imc}</div>
            <div className="text-xs text-muted-foreground">IMC</div>
          </div>
        )}
        {mesure.masse_grasse && (
          <div className="text-center">
            <div className="text-lg font-semibold text-neon-pink">{mesure.masse_grasse}</div>
            <div className="text-xs text-muted-foreground">% MG</div>
          </div>
        )}
        {mesure.tour_taille && (
          <div className="text-center">
            <div className="text-lg font-semibold text-neon-purple">{mesure.tour_taille}</div>
            <div className="text-xs text-muted-foreground">cm taille</div>
          </div>
        )}
      </div>

      {mesure.commentaire && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-sm text-muted-foreground italic">"{mesure.commentaire}"</p>
        </div>
      )}
    </div>
  )
}

export default function MesuresPage() {
  const { user } = useAuth()
  const { mesures, loading, addMesure, updateMesure, deleteMesure, getStats } = useMesures()
  const { comments: mesureComments, loading: commentsLoading } = useCoachCommentsByModule('mesures')
  const [showForm, setShowForm] = useState(false)
  const [editingMesure, setEditingMesure] = useState<Mesure | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)

  // Données du formulaire
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    poids: '',
    taille: '',
    masse_grasse: '',
    masse_musculaire: '',
    tour_taille: '',
    tour_hanches: '',
    tour_bras: '',
    tour_cuisses: '',
    tour_cou: '',
    tour_poitrine: '',
    commentaire: ''
  })

  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Mesure la plus récente pour les stats
  const lastMesure = mesures[0]
  const stats = lastMesure ? getStats(lastMesure) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    
    try {
      const mesureData = {
        user_id: user.uid,
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
        toast.success(editingMesure ? 'Mesure mise à jour !' : 'Mesure ajoutée !')
        setShowForm(false)
        setEditingMesure(null)
        setFormData({
          date: new Date().toISOString().split('T')[0],
          poids: '', taille: '', masse_grasse: '', masse_musculaire: '',
          tour_taille: '', tour_hanches: '', tour_bras: '', tour_cuisses: '',
          tour_cou: '', tour_poitrine: '', commentaire: ''
        })
      } else {
        toast.error(result.error || 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      toast.error('Erreur inattendue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (mesure: Mesure) => {
    setEditingMesure(mesure)
    setFormData({
      date: mesure.date,
      poids: mesure.poids?.toString() || '',
      taille: mesure.taille?.toString() || '',
      masse_grasse: mesure.masse_grasse?.toString() || '',
      masse_musculaire: mesure.masse_musculaire?.toString() || '',
      tour_taille: mesure.tour_taille?.toString() || '',
      tour_hanches: mesure.tour_hanches?.toString() || '',
      tour_bras: mesure.tour_bras?.toString() || '',
      tour_cuisses: mesure.tour_cuisses?.toString() || '',
      tour_cou: mesure.tour_cou?.toString() || '',
      tour_poitrine: mesure.tour_poitrine?.toString() || '',
      commentaire: mesure.commentaire || ''
    })
    setShowForm(true)
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold neon-text">Mesures Corporelles</h1>
            <p className="text-muted-foreground">{today}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCharts(!showCharts)}
              className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg font-medium hover:bg-neon-cyan/30 transition-colors flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {showCharts ? 'Masquer' : 'Graphiques'}
            </button>
            <button 
              onClick={() => setShowPhotos(!showPhotos)}
              className="px-4 py-2 bg-neon-pink/20 text-neon-pink rounded-lg font-medium hover:bg-neon-pink/30 transition-colors flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              {showPhotos ? 'Masquer' : 'Photos'}
            </button>
            <button 
              onClick={() => {
                setEditingMesure(null)
                setShowForm(true)
              }}
              className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle mesure
            </button>
          </div>
        </div>

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
              <ModuleComments comments={mesureComments} loading={commentsLoading} />
            </CollapsibleCard>
            {/* Statistiques actuelles */}
            {lastMesure && stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                  title="Poids actuel"
                  value={lastMesure.poids || 0}
                  unit="kg"
                  icon={Scale}
                  evolution={stats.evolution_poids}
                  color="neon-green"
                />
                <StatsCard
                  title="IMC"
                  value={stats.imc}
                  icon={Calculator}
                  color="neon-cyan"
                />
                <StatsCard
                  title="Masse grasse"
                  value={lastMesure.masse_grasse || 0}
                  unit="%"
                  icon={TrendingUp}
                  evolution={stats.evolution_masse_grasse}
                  color="neon-pink"
                />
                <StatsCard
                  title="Objectif"
                  value={`${stats.poids_ideal_min}-${stats.poids_ideal_max}`}
                  unit="kg"
                  icon={Target}
                  color="neon-purple"
                />
              </div>
            )}

            {/* Graphiques d'évolution */}
            {showCharts && mesures.length > 0 && (
              <MesuresCharts mesures={mesures} />
            )}

            {/* Photos de progression */}
            {showPhotos && (
              <PhotoUpload mesures={mesures} />
            )}

            {/* Formulaire d'ajout/modification */}
            {showForm && (
              <div className="glass-effect p-6 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">
                  {editingMesure ? 'Modifier la mesure' : 'Nouvelle mesure'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-44 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Poids (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.poids}
                        onChange={(e) => setFormData({ ...formData, poids: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                        placeholder="70.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Taille (cm)</label>
                      <input
                        type="number"
                        value={formData.taille}
                        onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                        placeholder="175"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Masse grasse (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.masse_grasse}
                        onChange={(e) => setFormData({ ...formData, masse_grasse: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                        placeholder="15.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Masse musculaire (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.masse_musculaire}
                        onChange={(e) => setFormData({ ...formData, masse_musculaire: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                        placeholder="40.0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Tour de taille (cm)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.tour_taille}
                        onChange={(e) => setFormData({ ...formData, tour_taille: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Tour de hanches (cm)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.tour_hanches}
                        onChange={(e) => setFormData({ ...formData, tour_hanches: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                        placeholder="95"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Tour de bras (cm)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.tour_bras}
                        onChange={(e) => setFormData({ ...formData, tour_bras: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                        placeholder="35"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Tour de cuisses (cm)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.tour_cuisses}
                        onChange={(e) => setFormData({ ...formData, tour_cuisses: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                        placeholder="60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Commentaire (optionnel)</label>
                    <textarea
                      value={formData.commentaire}
                      onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none resize-none"
                      rows={2}
                      placeholder="Notes sur cette mesure..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-purple"></div>
                          Enregistrement...
                        </>
                      ) : editingMesure ? (
                        'Mettre à jour'
                      ) : (
                        'Enregistrer'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingMesure(null)
                      }}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Liste des mesures */}
            {loading ? (
              <div className="glass-effect p-6 rounded-xl border border-white/10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple mx-auto mb-2"></div>
                <p className="text-muted-foreground">Chargement des mesures...</p>
              </div>
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
                    <MesureCard
                      key={mesure.id}
                      mesure={mesure}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      getStats={getStats}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
} 