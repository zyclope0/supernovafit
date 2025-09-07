'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import MainLayout from '@/components/layout/MainLayout'
import TrainingForm from '@/components/ui/TrainingForm'
import TrainingCard from '@/components/ui/TrainingCard'
import dynamic from 'next/dynamic'

// Skeleton loader optimisé pour les graphiques
const ChartSkeleton = () => (
  <div className="glass-effect p-4 rounded-lg border border-white/10 animate-pulse">
    <div className="h-4 bg-white/20 rounded w-1/3 mb-4"></div>
    <div className="h-48 bg-white/10 rounded flex items-center justify-center">
      <div className="text-white/40 text-sm">Chargement du graphique...</div>
    </div>
  </div>
)

// Lazy loading optimisé avec skeleton personnalisé
const TrainingVolumeChart = dynamic(() => import('@/components/ui/TrainingVolumeChart'), { 
  ssr: false,
  loading: () => <ChartSkeleton />
})
const HeartRateChart = dynamic(() => import('@/components/ui/HeartRateChart'), { 
  ssr: false,
  loading: () => <ChartSkeleton />
})
const TrainingTypeChart = dynamic(() => import('@/components/ui/TrainingTypeChart'), { 
  ssr: false,
  loading: () => <ChartSkeleton />
})
const PerformanceChart = dynamic(() => import('@/components/ui/PerformanceChart'), { 
  ssr: false,
  loading: () => <ChartSkeleton />
})
const GarminImport = dynamic(() => import('@/components/ui/GarminImport'), { 
  ssr: false,
  loading: () => (
    <div className="glass-effect p-6 rounded-xl border border-white/10 animate-pulse">
      <div className="h-6 bg-white/20 rounded w-1/2 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-white/10 rounded"></div>
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-10 bg-white/10 rounded"></div>
      </div>
    </div>
  )
})
import { useAuth } from '@/hooks/useAuth'
import { useEntrainements, usePaginatedEntrainements } from '@/hooks/useFirestore'
import { Entrainement } from '@/types'
import { Plus, TrendingUp, Timer, Target, BarChart3, Upload } from 'lucide-react'
// import ModuleComments from '@/components/ui/ModuleComments' // Temporarily disabled
import CollapsibleCard from '@/components/ui/CollapsibleCard'
const HistoriqueEntrainementsModal = dynamic(() => import('@/components/ui/HistoriqueEntrainementsModal'), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass-effect p-6 rounded-xl border border-white/10 animate-pulse max-w-4xl w-full mx-4">
        <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-white/10 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
})

function StatsCard({ title, value, unit, icon, color = "neon-green" }: {
  title: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  color?: string
}) {
  return (
    <div className="glass-effect p-4 rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`text-${color}`}>{icon}</div>
      </div>
      <div className="flex items-baseline">
        <span className={`text-2xl font-bold text-${color}`}>{value}</span>
        {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
      </div>
    </div>
  )
}

export default function EntrainementsPage() {
  const { user } = useAuth()
  const { addEntrainement, updateEntrainement, deleteEntrainement } = useEntrainements() // Pour les opérations CRUD
  const { data: entrainements, loading, hasMore, loadMore } = usePaginatedEntrainements(30) // Charger 30 entraînements par page
  const [showForm, setShowForm] = useState(false)
  const [editingTraining, setEditingTraining] = useState<Entrainement | null>(null)
  const [showCharts, setShowCharts] = useState(false)
  const [showGarminImport, setShowGarminImport] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [dateFilterActive, setDateFilterActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculer les statistiques
  const thisWeekTrainings = entrainements.filter(e => {
    const trainingDate = new Date(e.date)
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    return trainingDate >= weekStart
  })

  const totalMinutes = thisWeekTrainings.reduce((sum, e) => sum + e.duree, 0)
  const totalCalories = thisWeekTrainings.reduce((sum, e) => sum + (e.calories || 0), 0)
  const averageDuration = thisWeekTrainings.length > 0 ? Math.round(totalMinutes / thisWeekTrainings.length) : 0

  // Gestion des actions
  const handleSubmit = async (trainingData: Omit<Entrainement, 'id' | 'user_id'>) => {
    if (!user || isSubmitting) return

    setIsSubmitting(true)
    try {
      let result
      if (editingTraining) {
        result = await updateEntrainement(editingTraining.id, trainingData)
      } else {
        result = await addEntrainement({ ...trainingData, user_id: user.uid })
      }

      if (result.success) {
        toast.success(editingTraining ? 'Entraînement modifié avec succès !' : 'Entraînement ajouté avec succès !')
        setShowForm(false)
        setEditingTraining(null)
      } else {
        toast.error(`Erreur : ${result.error}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (training: Entrainement) => {
    setEditingTraining(training)
    setShowForm(true)
  }

  const handleDelete = async (training: Entrainement) => {
    // Toast de confirmation avec boutons
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-white font-medium">
          Supprimer cet entraînement ?
        </p>
        <p className="text-sm text-gray-300">
          {training.type} - {training.duree} min ({training.date})
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              const result = await deleteEntrainement(training.id)
              if (result.success) {
                toast.success('Entraînement supprimé !')
              } else {
                toast.error(`Erreur : ${result.error}`)
              }
            }}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
          >
            Supprimer
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

  const handleCancel = () => {
    setShowForm(false)
    setEditingTraining(null)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold neon-text">Entraînements</h1>
            <p className="text-muted-foreground">Suivez vos séances et progressez</p>
          </div>
          {!showForm && (
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg font-medium hover:bg-neon-cyan/30 transition-colors"
              >
                <BarChart3 className="h-5 w-5" />
                {showCharts ? 'Masquer graphiques' : 'Voir graphiques'}
              </button>
              <div className="text-sm text-muted-foreground hidden md:block">
                {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                Historique
              </button>
              <button
                onClick={() => setShowGarminImport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors"
              >
                <Upload className="h-5 w-5" />
                Import Garmin
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg font-medium hover:bg-neon-green/30 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Ajouter un entraînement
              </button>
            </div>
          )}
        </div>

        {/* Message si pas connecté */}
        {!user && (
          <div className="glass-effect p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-yellow-400">
              Connectez-vous pour enregistrer vos entraînements et suivre votre progression !
            </p>
          </div>
        )}

        {/* Statistiques */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              title="Cette semaine"
              value={thisWeekTrainings.length}
              unit="séances"
              icon={<TrendingUp className="h-5 w-5" />}
              color="neon-green"
            />
            <StatsCard
              title="Temps total"
              value={Math.floor(totalMinutes / 60)}
              unit={`h ${totalMinutes % 60}min`}
              icon={<Timer className="h-5 w-5" />}
              color="neon-cyan"
            />
            <StatsCard
              title="Calories brûlées"
              value={totalCalories}
              unit="kcal"
              icon={<Target className="h-5 w-5" />}
              color="neon-pink"
            />
            <StatsCard
              title="Durée moyenne"
              value={averageDuration}
              unit="min"
              icon={<Timer className="h-5 w-5" />}
              color="neon-purple"
            />
          </div>
        )}

        {/* Graphiques - Chargement conditionnel pour optimiser les performances */}
        {showCharts && user && entrainements.length > 0 && (
          <div className="space-y-6">
            <CollapsibleCard title="Analyse de vos entraînements" defaultOpen={false}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Les composants sont lazy loadés uniquement quand showCharts=true */}
                <TrainingVolumeChart entrainements={entrainements} weeks={8} />
                <TrainingTypeChart entrainements={entrainements} title="Répartition par type" />
                <HeartRateChart entrainements={entrainements} />
                <PerformanceChart 
                  entrainements={entrainements} 
                  metric="calories_per_min" 
                  title="Intensité d'entraînement" 
                />
              </div>
            </CollapsibleCard>
          </div>
        )}

        {/* Import Garmin */}
        {showGarminImport && user && (
          <GarminImport
            onImport={addEntrainement}
            onClose={() => setShowGarminImport(false)}
            userId={user.uid}
          />
        )}

        {/* Historique 30 jours */}
        {user && (
          <HistoriqueEntrainementsModal
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            allTrainings={entrainements}
            currentDate={selectedDate}
            onDateChange={(date) => { setSelectedDate(date); setDateFilterActive(true) }}
          />
        )}

        {/* Formulaire */}
        {showForm && (
          <TrainingForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            existingTraining={editingTraining || undefined}
            isEditing={!!editingTraining}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Liste des entraînements (par date sélectionnée ou derniers par défaut) */}
        {!showForm && user && (
          <CollapsibleCard title="Historique des entraînements" defaultOpen={true}>
            {loading ? (
              <div className="glass-effect p-6 rounded-xl border border-white/10">
                <div className="animate-pulse">
                  <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                </div>
              </div>
            ) : (() => {
              const trainingsForDate = entrainements.filter(e => e.date === selectedDate)
              if (dateFilterActive) {
                return trainingsForDate.length > 0 ? (
                  <div className="space-y-4">
                    {trainingsForDate.map((training) => (
                      <TrainingCard
                        key={training.id}
                        training={training}
                        onEdit={() => handleEdit(training)}
                        onDelete={() => handleDelete(training)}
                      />
                    ))}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setDateFilterActive(false)}
                        className="text-xs text-muted-foreground hover:text-white"
                        aria-label="Effacer le filtre de date"
                      >
                        Effacer le filtre
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-effect p-8 rounded-xl border border-white/10 text-center">
                    <div className="text-4xl mb-4">💪</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Aucun entraînement ce jour</h3>
                    <p className="text-muted-foreground mb-4">Sélectionnez une autre date ou effacez le filtre pour voir les dernières séances.</p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg font-medium hover:bg-neon-green/30 transition-colors"
                      >
                        Ajouter un entraînement
                      </button>
                      <button
                        onClick={() => setDateFilterActive(false)}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                      >
                        Effacer le filtre
                      </button>
                    </div>
                  </div>
                )
              }
              // Pas de filtre actif: afficher les 3 dernières séances
              const latest = [...entrainements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
              return latest.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground">Dernières séances</div>
                  {latest.map((training) => (
                    <TrainingCard
                      key={training.id}
                      training={training}
                      onEdit={() => handleEdit(training)}
                      onDelete={() => handleDelete(training)}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-effect p-8 rounded-xl border border-white/10 text-center">
                  <div className="text-4xl mb-4">💪</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Aucun entraînement pour l&apos;instant</h3>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg font-medium hover:bg-neon-green/30 transition-colors"
                  >
                    Ajouter un entraînement
                  </button>
                </div>
              )
            })()}
          </CollapsibleCard>
        )}

        {/* Liste simple de tous les entraînements (ordre décroissant) */}
        {user && entrainements.length > 0 && (
          <CollapsibleCard title="Tous les entraînements" defaultOpen={false}>
            <SimpleAllTrainingsList 
              trainings={entrainements} 
              onShowDetail={(t) => { setEditingTraining(t); setShowForm(true) }}
              hasMore={hasMore}
              loadMore={loadMore}
              loading={loading}
            />
          </CollapsibleCard>
        )}
      </div>
    </MainLayout>
  )
}

function SimpleAllTrainingsList({ 
  trainings, 
  onShowDetail, 
  hasMore = false, 
  loadMore, 
  loading = false 
}: { 
  trainings: Entrainement[]; 
  onShowDetail: (t: Entrainement) => void;
  hasMore?: boolean;
  loadMore?: () => Promise<void>;
  loading?: boolean;
}) {
  const sorted = [...trainings].sort((a, b) => b.date.localeCompare(a.date))
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const start = (page - 1) * pageSize
  const pageItems = sorted.slice(start, start + pageSize)

  useEffect(() => {
    // Réinitialiser à la page 1 si la liste change fortement
    setPage(1)
  }, [trainings.length])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{sorted.length} séances • Page {page}/{totalPages}</div>
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
      <div className="divide-y divide-white/10">
        {pageItems.map((t) => (
          <button
            key={t.id}
            onClick={() => onShowDetail(t)}
            className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white capitalize">{t.type}</span>
              <span className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="text-sm text-neon-cyan">{t.duree} min</div>
          </button>
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
            <span className="text-xs text-muted-foreground">{start + 1}–{Math.min(sorted.length, start + pageSize)}</span>
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
      
      {/* Bouton "Charger plus" pour la pagination Firestore */}
      {hasMore && loadMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => loadMore()}
            disabled={loading}
            className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg font-medium hover:bg-neon-green/30 transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Charger plus d\'entraînements'}
          </button>
        </div>
      )}
    </div>
  )
}