'use client'

import { JournalEntry } from '@/types'
import { useState, useMemo, useRef } from 'react'
import { X, Calendar, BarChart3, Eye } from 'lucide-react'
import { useCoachCommentsByModule } from '@/hooks/useFirestore'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface HistoriqueJournalModalProps {
  isOpen: boolean
  onClose: () => void
  allEntries: JournalEntry[]
  currentDate: string
  onDateChange: (date: string) => void
}

export default function HistoriqueJournalModal({ isOpen, onClose, allEntries, currentDate, onDateChange }: HistoriqueJournalModalProps) {
  const focusTrapRef = useFocusTrap(isOpen, onClose, true, 'button[aria-label="Fermer"]')
  const [viewMode, setViewMode] = useState<'calendar' | 'stats'>('calendar')
  const { comments: journalComments } = useCoachCommentsByModule('journal')
  const commentedEntryDates = useMemo(() => new Set((journalComments || []).map((c) => (c as { date?: string }).date).filter(Boolean)), [journalComments])
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const dayRefs = useRef<Array<HTMLButtonElement | null>>([])

  const getLast30Days = () => {
    const days: string[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().split('T')[0])
    }
    return days
  }

  const last30Days = getLast30Days()

  const getStatsForDate = (date: string) => {
    const dayEntries = allEntries.filter(e => e.date === date)
    const count = dayEntries.length
    const avgHumeur = count > 0 ? Math.round((dayEntries.reduce((s, e) => s + (e.humeur || 0), 0) / count) * 10) / 10 : 0
    const avgEnergie = count > 0 ? Math.round((dayEntries.reduce((s, e) => s + (e.energie || 0), 0) / count) * 10) / 10 : 0
    return { count, avgHumeur, avgEnergie }
  }

  const globalStats = last30Days.reduce((acc, date) => {
    const s = getStatsForDate(date)
    if (s.count > 0) {
      acc.totalDays++
      acc.totalEntries += s.count
      acc.avgHumeurSum += s.avgHumeur
      acc.avgEnergieSum += s.avgEnergie
    }
    return acc
  }, { totalDays: 0, totalEntries: 0, avgHumeurSum: 0, avgEnergieSum: 0 })

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  const formatFullDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const isToday = (d: string) => d === new Date().toISOString().split('T')[0]
  const isCurrent = (d: string) => d === currentDate

  // Note: Focus trap et gestion Escape maintenant gérés par useFocusTrap

  const handleGridKey = (e: React.KeyboardEvent, idx: number) => {
    const cols = 7
    let next = idx
    if (e.key === 'ArrowRight') next = Math.min(last30Days.length - 1, idx + 1)
    else if (e.key === 'ArrowLeft') next = Math.max(0, idx - 1)
    else if (e.key === 'ArrowDown') next = Math.min(last30Days.length - 1, idx + cols)
    else if (e.key === 'ArrowUp') next = Math.max(0, idx - cols)
    else return
    e.preventDefault()
    dayRefs.current[next]?.focus()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={focusTrapRef} className="glass-effect rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-neon-green" />
            <h1 className="text-xl font-semibold text-white">Historique Journal</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white/5 rounded-lg p-1">
              <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-neon-green/20 text-neon-green' : 'text-muted-foreground hover:text-white'}`}>
                <Calendar className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('stats')} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'stats' ? 'bg-neon-green/20 text-neon-green' : 'text-muted-foreground hover:text-white'}`}>
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white transition-colors" ref={closeBtnRef}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {viewMode === 'calendar' ? (
            <>
              <h2 className="text-lg font-medium text-white mb-4">30 derniers jours</h2>
              <div className="grid grid-cols-7 gap-2 mb-6" role="grid" aria-label="Calendrier des 30 derniers jours">
                {last30Days.map((date, idx) => {
                  const s = getStatsForDate(date)
                  const hasData = s.count > 0
                  const hasCoachComments = commentedEntryDates.has(date)
                  return (
                    <button key={date} onClick={() => { onDateChange(date); onClose() }}
                      onKeyDown={(e) => handleGridKey(e, idx)}
                      ref={(el) => { dayRefs.current[idx] = el }}
                      className={`relative aspect-square p-2 rounded-lg text-center transition-all hover:scale-105 ${isCurrent(date) ? 'bg-neon-green/30 border-2 border-neon-green text-neon-green' : hasData ? 'bg-neon-green/20 border border-neon-green/30 text-white hover:bg-neon-green/30' : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'} ${isToday(date) ? 'ring-2 ring-yellow-400/50' : ''}`}
                      role="gridcell" aria-selected={isCurrent(date)} aria-label={`${formatFullDate(date)}${hasData ? `, ${s.count} entrées, humeur ${s.avgHumeur}` : ', aucune donnée'}`}
                    >
                      <div className="text-xs font-medium">{formatDate(date)}</div>
                      {hasData && (
                        <div className="text-[10px] mt-1">
                          <div>{s.avgHumeur || '-'} 😊</div>
                          <div className="opacity-75">{s.count} entrée(s)</div>
                        </div>
                      )}
                      {hasCoachComments && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neon-pink shadow" title="Commentaire coach"></span>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass-effect-high p-4 rounded-lg text-center glass-hover"><div className="text-2xl font-bold text-neon-green">{globalStats.totalDays}</div><div className="text-sm text-accessible-secondary">Jours actifs</div></div>
                <div className="glass-effect-high p-4 rounded-lg text-center glass-hover"><div className="text-2xl font-bold text-neon-cyan">{globalStats.totalEntries}</div><div className="text-sm text-accessible-secondary">Entrées</div></div>
                <div className="glass-effect-high p-4 rounded-lg text-center glass-hover"><div className="text-2xl font-bold text-neon-purple">{globalStats.totalDays > 0 ? Math.round((globalStats.avgHumeurSum / globalStats.totalDays) * 10) / 10 : 0}</div><div className="text-sm text-accessible-secondary">Humeur moy</div></div>
                <div className="glass-effect-high p-4 rounded-lg text-center glass-hover"><div className="text-2xl font-bold text-neon-pink">{globalStats.totalDays > 0 ? Math.round((globalStats.avgEnergieSum / globalStats.totalDays) * 10) / 10 : 0}</div><div className="text-sm text-accessible-secondary">Énergie moy</div></div>
              </div>
              <div className="space-y-2">
                {last30Days.slice(-7).reverse().map(date => {
                  const s = getStatsForDate(date)
                  return (
                    <div key={date} className={`glass-effect p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${isCurrent(date) ? 'border border-neon-green/30' : ''}`} onClick={() => { onDateChange(date); onClose() }}>
                      <div>
                        <div className="font-medium text-white">{formatFullDate(date)}</div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <div className="text-white font-medium">{s.count} entrée(s)</div>
                          <div className="text-muted-foreground">Humeur {s.avgHumeur || '-'} / Énergie {s.avgEnergie || '-'}</div>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-neon-pink/30 border border-neon-pink/50 rounded"></div><span className="text-muted-foreground">Commentaires coach</span></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


