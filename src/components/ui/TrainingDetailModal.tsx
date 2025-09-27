'use client'

import React from 'react'
import { Entrainement } from '@/types'
import { Timer, Target, Route, Heart, TrendingUp, Zap, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useCoachCommentsByModule } from '@/hooks/useFirestore'
import ModuleComments from './ModuleComments'
import StandardModal from './StandardModal'

interface TrainingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  training: Entrainement | null
  onEdit?: () => void
}

const TRAINING_TYPES = [
  { value: 'cardio', label: 'Cardio', icon: '🏃', color: 'neon-green' },
  { value: 'musculation', label: 'Musculation', icon: '💪', color: 'neon-cyan' },
  { value: 'hiit', label: 'HIIT', icon: '🔥', color: 'neon-pink' },
  { value: 'yoga', label: 'Yoga', icon: '🧘', color: 'neon-purple' },
  { value: 'natation', label: 'Natation', icon: '🏊', color: 'neon-cyan' },
  { value: 'cyclisme', label: 'Cyclisme', icon: '🚴', color: 'neon-green' },
  { value: 'course', label: 'Course à pied', icon: '🏃', color: 'neon-pink' },
  { value: 'autre', label: 'Autre', icon: '⚡', color: 'neon-purple' }
]

export default function TrainingDetailModal({ isOpen, onClose, training, onEdit }: TrainingDetailModalProps) {
  const { comments: trainingComments, loading: commentsLoading } = useCoachCommentsByModule('entrainements', undefined, training?.id)

  if (!isOpen || !training) return null

  const trainingType = TRAINING_TYPES.find(t => t.value === training.type) || TRAINING_TYPES[0]

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEEE d MMMM yyyy', { locale: fr })
    } catch {
      return dateStr
    }
  }

  const getIntensityColor = (effort?: number) => {
    if (!effort) return 'gray-400'
    if (effort <= 3) return 'neon-green'
    if (effort <= 6) return 'neon-yellow'
    if (effort <= 8) return 'neon-pink'
    return 'neon-red'
  }

  const getIntensityLabel = (effort?: number) => {
    if (!effort) return 'Non renseigné'
    if (effort <= 3) return 'Facile'
    if (effort <= 6) return 'Modéré'
    if (effort <= 8) return 'Intense'
    return 'Très intense'
  }

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={trainingType.label}
      subtitle={formatDate(training.date)}
      icon={<span className="text-3xl">{trainingType.icon}</span>}
      onEdit={onEdit}
      editLabel="Modifier"
      maxWidth="4xl"
      height="90vh"
    >
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statistiques principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Métriques principales */}
            <div className="glass-effect p-4 rounded-xl border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                📊 Métriques principales
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="h-6 w-6 text-neon-green" />
                  </div>
                  <div className="text-2xl font-bold text-white">{training.duree}</div>
                  <div className="text-sm text-muted-foreground">minutes</div>
                </div>
                
                {training.calories && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-6 w-6 text-neon-pink" />
                    </div>
                    <div className="text-2xl font-bold text-white">{training.calories}</div>
                    <div className="text-sm text-muted-foreground">kcal</div>
                  </div>
                )}
                
                {training.distance && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Route className="h-6 w-6 text-neon-cyan" />
                    </div>
                    <div className="text-2xl font-bold text-white">{training.distance}</div>
                    <div className="text-sm text-muted-foreground">km</div>
                  </div>
                )}
                
                {training.fc_moyenne && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{training.fc_moyenne}</div>
                    <div className="text-sm text-muted-foreground">bpm moy</div>
                  </div>
                )}
              </div>
            </div>

            {/* Données avancées */}
            {(training.vitesse_moy || training.elevation_gain || training.puissance_moy || training.cadence_moy) && (
              <div className="glass-effect p-4 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  ⚡ Données avancées
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {training.vitesse_moy && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="h-6 w-6 text-neon-yellow" />
                      </div>
                      <div className="text-xl font-bold text-white">{training.vitesse_moy}</div>
                      <div className="text-sm text-muted-foreground">km/h moy</div>
                    </div>
                  )}
                  
                  {training.elevation_gain && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-2xl">⛰️</span>
                      </div>
                      <div className="text-xl font-bold text-white">{training.elevation_gain}</div>
                      <div className="text-sm text-muted-foreground">m D+</div>
                    </div>
                  )}
                  
                  {training.puissance_moy && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Zap className="h-6 w-6 text-neon-purple" />
                      </div>
                      <div className="text-xl font-bold text-white">{training.puissance_moy}</div>
                      <div className="text-sm text-muted-foreground">W moy</div>
                    </div>
                  )}
                  
                  {training.cadence_moy && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="h-6 w-6 text-neon-green" />
                      </div>
                      <div className="text-xl font-bold text-white">{training.cadence_moy}</div>
                      <div className="text-sm text-muted-foreground">spm</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fréquence cardiaque détaillée */}
            {(training.fc_moyenne || training.fc_max || training.fc_min) && (
              <div className="glass-effect p-4 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  ❤️ Fréquence cardiaque
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {training.fc_min && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-neon-cyan">{training.fc_min}</div>
                      <div className="text-sm text-muted-foreground">FC Min</div>
                    </div>
                  )}
                  {training.fc_moyenne && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-neon-green">{training.fc_moyenne}</div>
                      <div className="text-sm text-muted-foreground">FC Moy</div>
                    </div>
                  )}
                  {training.fc_max && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-neon-pink">{training.fc_max}</div>
                      <div className="text-sm text-muted-foreground">FC Max</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Commentaire */}
            {training.commentaire && (
              <div className="glass-effect p-4 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  💭 Notes personnelles
                </h2>
                <div className="text-gray-300 bg-white/5 p-4 rounded-lg italic">
                  &quot;{training.commentaire}&quot;
                </div>
              </div>
            )}
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">
            {/* Ressenti */}
            <div className="glass-effect p-4 rounded-xl border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                🎯 Ressenti
              </h2>
              <div className="space-y-4">
                {training.effort_percu && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Effort perçu</span>
                      <span className={`text-sm font-medium text-${getIntensityColor(training.effort_percu)}`}>
                        {getIntensityLabel(training.effort_percu)}
                      </span>
                    </div>
                    <div className="w-full bg-space-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r from-${getIntensityColor(training.effort_percu)} to-${getIntensityColor(training.effort_percu)}/80`}
                        style={{ width: `${(training.effort_percu / 10) * 100}%` }}
                      />
                    </div>
                    <div className="text-center text-lg font-bold text-white mt-1">
                      {training.effort_percu}/10
                    </div>
                  </div>
                )}
                
                {training.fatigue_avant && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Fatigue avant</span>
                      <span className="text-sm text-neon-cyan">{training.fatigue_avant}/10</span>
                    </div>
                    <div className="w-full bg-space-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-cyan/80"
                        style={{ width: `${(training.fatigue_avant / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {training.fatigue_apres && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Fatigue après</span>
                      <span className="text-sm text-neon-pink">{training.fatigue_apres}/10</span>
                    </div>
                    <div className="w-full bg-space-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-neon-pink to-neon-pink/80"
                        style={{ width: `${(training.fatigue_apres / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informations techniques */}
            <div className="glass-effect p-4 rounded-xl border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                🔧 Informations
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    training.source === 'manuel' 
                      ? 'bg-neon-purple/20 text-neon-purple' 
                      : 'bg-neon-green/20 text-neon-green'
                  }`}>
                    {training.source === 'manuel' ? '✋ Manuel' : '📱 Import'}
                  </span>
                </div>
                
                {training.device && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Appareil</span>
                    <span className="text-white">{training.device}</span>
                  </div>
                )}
                
                {training.garmin_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ID Garmin</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {training.garmin_id.slice(-8)}
                    </span>
                  </div>
                )}
                
                {training.fichier_original && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fichier</span>
                    <span className="text-xs text-muted-foreground">
                      {training.fichier_original}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Zones d'entraînement */}
            {(training.zone1_time || training.zone2_time || training.zone3_time || training.zone4_time || training.zone5_time) && (
              <div className="glass-effect p-4 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  📈 Zones d&apos;entraînement
                </h2>
                <div className="space-y-2">
                  {[
                    { zone: 1, time: training.zone1_time, color: 'neon-green', label: 'Zone 1' },
                    { zone: 2, time: training.zone2_time, color: 'neon-cyan', label: 'Zone 2' },
                    { zone: 3, time: training.zone3_time, color: 'neon-yellow', label: 'Zone 3' },
                    { zone: 4, time: training.zone4_time, color: 'neon-pink', label: 'Zone 4' },
                    { zone: 5, time: training.zone5_time, color: 'neon-red', label: 'Zone 5' },
                  ].map(({ zone, time, color, label }) => 
                    time ? (
                      <div key={zone} className="flex items-center justify-between text-sm">
                        <span className={`text-${color}`}>{label}</span>
                        <span className="text-white">{time} min</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Commentaires du coach */}
        {trainingComments && trainingComments.length > 0 && (
          <div className="mt-6">
            <ModuleComments comments={trainingComments} loading={commentsLoading} />
          </div>
        )}
      </div>
    </StandardModal>
  )
}