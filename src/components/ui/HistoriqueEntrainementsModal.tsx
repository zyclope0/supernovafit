'use client'

import { Entrainement } from '@/types'
import { useState, useMemo } from 'react'
import { X, Calendar, TrendingUp, BarChart3, Eye } from 'lucide-react'
import { useCoachCommentsByModule } from '@/hooks/useFirestore'

interface HistoriqueEntrainementsModalProps {
  isOpen: boolean
  onClose: () => void
  allTrainings: Entrainement[]
  currentDate: string
  onDateChange: (date: string) => void
}

export default function HistoriqueEntrainementsModal({ isOpen, onClose, allTrainings, currentDate, onDateChange }: HistoriqueEntrainementsModalProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'stats'>('calendar')
  const { comments: trainingComments } = useCoachCommentsByModule('entrainements')
  const commentedTrainingIds = useMemo(() => new Set((trainingComments || []).map((c: any) => c.training_id).filter(Boolean)), [trainingComments])

  const getLast30Days = () => {
    const days: string[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().split('T')[0])
    }
    return days
  }

  const last30Days = getLast30Days()

  const getStatsForDate = (date: string) => {
    const dayTrainings = allTrainings.filter(t => t.date === date)
    const totalMinutes = dayTrainings.reduce((sum, t) => sum + (t.duree || 0), 0)
    const totalCalories = dayTrainings.reduce((sum, t) => sum + (t.calories || 0), 0)
    const count = dayTrainings.length
    return { totalMinutes, totalCalories, count }
  }

  const globalStats = last30Days.reduce((acc, date) => {
    const stats = getStatsForDate(date)
    if (stats.count > 0) {
      acc.totalDays++
      acc.totalSessions += stats.count
      acc.totalMinutes += stats.totalMinutes
      acc.totalCalories += stats.totalCalories
    }
    return acc
  }, { totalDays: 0, totalSessions: 0, totalMinutes: 0, totalCalories: 0 })

  const handleDateClick = (date: string) => {
    onDateChange(date)
    onClose()
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  const formatFullDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const isToday = (date: string) => date === new Date().toISOString().split('T')[0]
  const isCurrentDate = (date: string) => date === currentDate

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-neon-cyan" />
            <h2 className="text-xl font-semibold text-white">Historique Entraînements</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white/5 rounded-lg p-1">
              <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-white'}`}>
                <Calendar className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('stats')} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'stats' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-white'}`}>
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {viewMode === 'calendar' ? (
            <>
              <h3 className="text-lg font-medium text-white mb-4">30 derniers jours</h3>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {last30Days.map(date => {
                  const stats = getStatsForDate(date)
                  const hasData = stats.count > 0
                  const dayTrainings = allTrainings.filter(t => t.date === date)
                  const hasCoachComments = dayTrainings.some(t => commentedTrainingIds.has(t.id))
                  return (
                    <button key={date} onClick={() => handleDateClick(date)}
                      className={`relative aspect-square p-2 rounded-lg text-center transition-all hover:scale-105 ${isCurrentDate(date) ? 'bg-neon-cyan/30 border-2 border-neon-cyan text-neon-cyan' : hasData ? 'bg-neon-green/20 border border-neon-green/30 text-white hover:bg-neon-green/30' : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'} ${isToday(date) ? 'ring-2 ring-yellow-400/50' : ''}`}>
                      <div className="text-xs font-medium">{formatDate(date)}</div>
                      {hasData && (
                        <div className="text-[10px] mt-1">
                          <div>{stats.totalMinutes} min</div>
                          <div className="opacity-75">{stats.count} séances</div>
                        </div>
                      )}
                      {hasCoachComments && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neon-pink shadow" title="Commentaire coach"></span>
                      )}
                      {isToday(date) && <div className="text-xs text-yellow-400 font-bold">•</div>}
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-neon-green/20 border border-neon-green/30 rounded"></div><span className="text-muted-foreground">Données disponibles</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-neon-cyan/30 border-2 border-neon-cyan rounded"></div><span className="text-muted-foreground">Date sélectionnée</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-neon-pink/30 border border-neon-pink/50 rounded"></div><span className="text-muted-foreground">Commentaires coach</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400/20 border border-yellow-400 rounded"></div><span className="text-muted-foreground">Aujourd'hui</span></div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-neon-cyan" />Statistiques 30 jours</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass-effect p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-neon-green">{globalStats.totalDays}</div>
                  <div className="text-sm text-muted-foreground">Jours actifs</div>
                </div>
                <div className="glass-effect p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-neon-cyan">{globalStats.totalSessions}</div>
                  <div className="text-sm text-muted-foreground">Séances</div>
                </div>
                <div className="glass-effect p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-neon-purple">{globalStats.totalMinutes}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="glass-effect p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-neon-pink">{globalStats.totalCalories}</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>
              </div>
              <div className="space-y-2">
                {last30Days.slice(-7).reverse().map(date => {
                  const stats = getStatsForDate(date)
                  return (
                    <div key={date} className={`glass-effect p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${isCurrentDate(date) ? 'border border-neon-cyan/30' : ''}`} onClick={() => handleDateClick(date)}>
                      <div>
                        <div className="font-medium text-white">{formatFullDate(date)}</div>
                        {isToday(date) && <div className="text-xs text-yellow-400">Aujourd'hui</div>}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <div className="text-white font-medium">{stats.totalMinutes} min</div>
                          <div className="text-muted-foreground">{stats.count} séances</div>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


