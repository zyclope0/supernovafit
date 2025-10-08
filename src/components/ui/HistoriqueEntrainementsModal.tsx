'use client';

import { Entrainement } from '@/types';
import { useState, useMemo, useRef } from 'react';
import {
  Calendar,
  TrendingUp,
  BarChart3,
  Eye,
  Filter,
  Clock,
} from 'lucide-react';
import { timestampToDateString } from '@/lib/dateUtils';
import { useCoachCommentsByModule } from '@/hooks/useFirestore';
import TrainingDetailModal from './TrainingDetailModal';
import StandardModal from './StandardModal';

interface HistoriqueEntrainementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTrainings: Entrainement[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onEditTraining?: (training: Entrainement) => void;
}

export default function HistoriqueEntrainementsModal({
  isOpen,
  onClose,
  allTrainings,
  currentDate,
  onDateChange,
  onEditTraining,
}: HistoriqueEntrainementsModalProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'stats' | 'list'>(
    'calendar',
  );
  const [selectedTraining, setSelectedTraining] = useState<Entrainement | null>(
    null,
  );
  const [showTrainingDetail, setShowTrainingDetail] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('');
  const { comments: trainingComments } =
    useCoachCommentsByModule('entrainements');
  const commentedTrainingIds = useMemo(
    () =>
      new Set(
        (trainingComments || [])
          .map((c) => (c as { training_id?: string }).training_id)
          .filter(Boolean),
      ),
    [trainingComments],
  );
  // Removed closeBtnRef as it's no longer needed
  const dayRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const getLast30Days = () => {
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last30Days = getLast30Days();

  const getStatsForDate = (date: string) => {
    const dayTrainings = allTrainings.filter(
      (t) => timestampToDateString(t.date) === date,
    );
    const totalMinutes = dayTrainings.reduce(
      (sum, t) => sum + (t.duree || 0),
      0,
    );
    const totalCalories = dayTrainings.reduce(
      (sum, t) => sum + (t.calories || 0),
      0,
    );
    const count = dayTrainings.length;
    return { totalMinutes, totalCalories, count };
  };

  const globalStats = last30Days.reduce(
    (acc, date) => {
      const stats = getStatsForDate(date);
      if (stats.count > 0) {
        acc.totalDays++;
        acc.totalSessions += stats.count;
        acc.totalMinutes += stats.totalMinutes;
        acc.totalCalories += stats.totalCalories;
      }
      return acc;
    },
    { totalDays: 0, totalSessions: 0, totalMinutes: 0, totalCalories: 0 },
  );

  const handleDateClick = (date: string) => {
    if (viewMode === 'calendar') {
      // En mode calendrier, sélectionner la date change le filtre
      setDateFilter(date);
    } else {
      // En mode stats/liste, sélectionner la date change la date globale et ferme
      onDateChange(date);
      onClose();
    }
  };

  const handleTrainingClick = (training: Entrainement) => {
    setSelectedTraining(training);
    setShowTrainingDetail(true);
  };

  const handleEditTraining = () => {
    if (selectedTraining && onEditTraining) {
      onEditTraining(selectedTraining);
      setShowTrainingDetail(false);
      onClose();
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
  const formatFullDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  const isToday = (date: string) =>
    date === new Date().toISOString().split('T')[0];
  const isCurrentDate = (date: string) => date === currentDate;

  // Note: Focus trap et gestion Escape maintenant gérés par useFocusTrap

  const handleGridKey = (e: React.KeyboardEvent, idx: number) => {
    const cols = 7;
    let next = idx;
    if (e.key === 'ArrowRight') next = Math.min(last30Days.length - 1, idx + 1);
    else if (e.key === 'ArrowLeft') next = Math.max(0, idx - 1);
    else if (e.key === 'ArrowDown')
      next = Math.min(last30Days.length - 1, idx + cols);
    else if (e.key === 'ArrowUp') next = Math.max(0, idx - cols);
    else return;
    e.preventDefault();
    dayRefs.current[next]?.focus();
  };

  if (!isOpen) return null;

  const headerContent = (
    <div className="flex bg-white/5 rounded-lg p-1">
      <button
        onClick={() => setViewMode('calendar')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-white'}`}
      >
        <Calendar className="h-4 w-4" />
      </button>
      <button
        onClick={() => setViewMode('stats')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'stats' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-white'}`}
      >
        <BarChart3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-white'}`}
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Historique Entraînements"
      icon={<Calendar className="h-6 w-6 text-neon-cyan" />}
      headerContent={headerContent}
      maxWidth="4xl"
      height="90vh"
      className="flex flex-col"
    >
      <div className="p-6 flex-1 overflow-y-auto">
        {/* Filtre par date (affiché seulement en mode calendrier) */}
        {viewMode === 'calendar' && (
          <div className="mb-4 flex items-center gap-3">
            <Filter className="h-4 w-4 text-neon-cyan" />
            <span className="text-sm text-muted-foreground">
              Cliquez sur une date pour filtrer :
            </span>
            {dateFilter && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-neon-cyan">
                  Filtré : {new Date(dateFilter).toLocaleDateString('fr-FR')}
                </span>
                <button
                  onClick={() => setDateFilter('')}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  ✖ Effacer
                </button>
              </div>
            )}
          </div>
        )}

        {viewMode === 'calendar' ? (
          <>
            <h2 className="text-lg font-medium text-white mb-4">
              30 derniers jours
            </h2>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {last30Days.map((date, idx) => {
                const stats = getStatsForDate(date);
                const hasData = stats.count > 0;
                const dayTrainings = allTrainings.filter(
                  (t) => timestampToDateString(t.date) === date,
                );
                const hasCoachComments = dayTrainings.some((t) =>
                  commentedTrainingIds.has(t.id),
                );
                const isFiltered = dateFilter === date;
                return (
                  <button
                    key={date}
                    onClick={() => handleDateClick(date)}
                    onKeyDown={(e) => handleGridKey(e, idx)}
                    ref={(el) => {
                      dayRefs.current[idx] = el;
                    }}
                    className={`relative aspect-square p-2 rounded-lg text-center transition-all hover:scale-105 ${
                      isFiltered
                        ? 'bg-neon-purple/30 border-2 border-neon-purple text-neon-purple'
                        : isCurrentDate(date)
                          ? 'bg-neon-cyan/30 border-2 border-neon-cyan text-neon-cyan'
                          : hasData
                            ? 'bg-neon-green/20 border border-neon-green/30 text-white hover:bg-neon-green/30'
                            : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'
                    } ${isToday(date) ? 'ring-2 ring-yellow-400/50' : ''}`}
                    role="gridcell"
                    aria-selected={isFiltered}
                    aria-label={`${formatFullDate(date)}${hasData ? `, ${stats.count} séances, ${stats.totalMinutes} minutes` : ', aucune donnée'}`}
                  >
                    <div className="text-xs font-medium">
                      {formatDate(date)}
                    </div>
                    {hasData && (
                      <div className="text-[10px] mt-1">
                        <div>{stats.totalMinutes} min</div>
                        <div className="opacity-75">{stats.count} séances</div>
                      </div>
                    )}
                    {hasCoachComments && (
                      <span
                        className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neon-pink shadow"
                        title="Commentaire coach"
                      ></span>
                    )}
                    {isToday(date) && (
                      <div className="text-xs text-yellow-400 font-bold">•</div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neon-green/20 border border-neon-green/30 rounded"></div>
                <span className="text-muted-foreground">
                  Données disponibles
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neon-purple/30 border-2 border-neon-purple rounded"></div>
                <span className="text-muted-foreground">Date filtrée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neon-cyan/30 border-2 border-neon-cyan rounded"></div>
                <span className="text-muted-foreground">Date sélectionnée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neon-pink/30 border border-neon-pink/50 rounded"></div>
                <span className="text-muted-foreground">
                  Commentaires coach
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400/20 border border-yellow-400 rounded"></div>
                <span className="text-muted-foreground">Aujourd&apos;hui</span>
              </div>
            </div>

            {/* Liste des entraînements filtrés */}
            {dateFilter &&
              (() => {
                const filteredTrainings = allTrainings.filter(
                  (t) => timestampToDateString(t.date) === dateFilter,
                );
                return (
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-neon-purple" />
                      Entraînements du{' '}
                      {new Date(dateFilter).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </h3>
                    {filteredTrainings.length > 0 ? (
                      <div className="space-y-2">
                        {filteredTrainings.map((training) => (
                          <button
                            key={training.id}
                            onClick={() => handleTrainingClick(training)}
                            className="w-full glass-effect p-3 rounded-lg text-left hover:bg-white/5 transition-colors border border-white/10 hover:border-neon-purple/30"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">
                                  {training.type === 'cardio'
                                    ? '🏃'
                                    : training.type === 'musculation'
                                      ? '💪'
                                      : '⚡'}
                                </span>
                                <div>
                                  <div className="font-medium text-white capitalize">
                                    {training.type}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {training.duree} min •{' '}
                                    {training.calories || 0} kcal
                                  </div>
                                </div>
                              </div>
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Aucun entraînement ce jour-là.
                      </p>
                    )}
                  </div>
                );
              })()}
          </>
        ) : viewMode === 'stats' ? (
          <>
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-neon-cyan" />
              Statistiques 30 jours
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass-effect p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-neon-green">
                  {globalStats.totalDays}
                </div>
                <div className="text-sm text-muted-foreground">
                  Jours actifs
                </div>
              </div>
              <div className="glass-effect p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-neon-cyan">
                  {globalStats.totalSessions}
                </div>
                <div className="text-sm text-muted-foreground">Séances</div>
              </div>
              <div className="glass-effect p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-neon-purple">
                  {globalStats.totalMinutes}
                </div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
              <div className="glass-effect p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-neon-pink">
                  {globalStats.totalCalories}
                </div>
                <div className="text-sm text-muted-foreground">Calories</div>
              </div>
            </div>
            <div className="space-y-2">
              {last30Days
                .slice(-7)
                .reverse()
                .map((date) => {
                  const stats = getStatsForDate(date);
                  return (
                    <div
                      key={date}
                      className={`glass-effect p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${isCurrentDate(date) ? 'border border-neon-cyan/30' : ''}`}
                      onClick={() => handleDateClick(date)}
                    >
                      <div>
                        <div className="font-medium text-white">
                          {formatFullDate(date)}
                        </div>
                        {isToday(date) && (
                          <div className="text-xs text-yellow-400">
                            Aujourd&apos;hui
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <div className="text-white font-medium">
                            {stats.totalMinutes} min
                          </div>
                          <div className="text-muted-foreground">
                            {stats.count} séances
                          </div>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        ) : (
          /* Mode Liste */
          <>
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-neon-cyan" />
              Tous les entraînements
            </h2>
            <div className="space-y-2">
              {allTrainings.slice(0, 50).map((training) => {
                const trainingType =
                  training.type === 'cardio'
                    ? '🏃'
                    : training.type === 'musculation'
                      ? '💪'
                      : '⚡';
                const hasComments = commentedTrainingIds.has(training.id);
                return (
                  <button
                    key={training.id}
                    onClick={() => handleTrainingClick(training)}
                    className="w-full glass-effect p-4 rounded-lg text-left hover:bg-white/5 transition-colors border border-white/10 hover:border-neon-cyan/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{trainingType}</span>
                        <div>
                          <div className="font-medium text-white capitalize">
                            {training.type}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(
                              timestampToDateString(training.date),
                            ).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-neon-green">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {training.duree} min
                          </div>
                          <div className="text-neon-pink">
                            <TrendingUp className="h-4 w-4 inline mr-1" />
                            {training.calories || 0} kcal
                          </div>
                          {training.distance && (
                            <div className="text-neon-cyan">
                              {training.distance} km
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasComments && (
                          <span
                            className="w-2 h-2 rounded-full bg-neon-pink"
                            title="Commentaire coach"
                          ></span>
                        )}
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {allTrainings.length > 50 && (
              <p className="text-center text-muted-foreground text-sm mt-4">
                Affichage des 50 derniers entraînements
              </p>
            )}
          </>
        )}
      </div>

      {/* Modal détail d'entraînement */}
      <TrainingDetailModal
        isOpen={showTrainingDetail}
        onClose={() => setShowTrainingDetail(false)}
        training={selectedTraining}
        onEdit={onEditTraining ? handleEditTraining : undefined}
      />
    </StandardModal>
  );
}
