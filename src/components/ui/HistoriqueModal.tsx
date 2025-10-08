'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { Calendar, TrendingUp, BarChart3, Eye } from 'lucide-react';
import { useCoachCommentsByModule, useRepas } from '@/hooks/useFirestore';
import { Repas } from '@/types'; // Importer les types Repas et Macros
import StandardModal from './StandardModal';
import { timestampToDateString } from '@/lib/dateUtils';

interface HistoriqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  onDateChange: (date: string) => void;
}

interface GlobalStats {
  totalDays: number;
  totalCalories: number;
  totalMeals: number;
  averageCaloriesPerDay: number;
}

export default function HistoriqueModal({
  isOpen,
  onClose,
  currentDate,
  onDateChange,
}: HistoriqueModalProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'stats'>('calendar');
  const { comments: dieteComments } = useCoachCommentsByModule('diete');
  const commentedDates = useMemo(
    () =>
      new Set(
        (dieteComments || [])
          .map((c) => (c as { date?: string }).date)
          .filter(Boolean),
      ),
    [dieteComments],
  );
  // Removed closeBtnRef as it's no longer needed
  const dayRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const { repas: allRepas, loading: repasLoading } = useRepas(); // Charger tous les repas

  // Générer les 30 derniers jours (ou plus selon les données chargées)
  const getLast30Days = useCallback(() => {
    // Si allRepas est vide ou en chargement, on utilise les 30 derniers jours par défaut
    if (repasLoading && allRepas.length === 0) {
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
      }
      return days;
    } else if (allRepas.length > 0) {
      // Sinon, on prend toutes les dates uniques des repas chargés, triées
      // Convertir les dates (qui peuvent être des Timestamps) en strings
      const uniqueDates = Array.from(
        new Set(allRepas.map((r: Repas) => timestampToDateString(r.date))),
      );
      return uniqueDates.sort((a: string, b: string) => b.localeCompare(a));
    }
    return [];
  }, [allRepas, repasLoading]); // Ajout de allRepas et repasLoading comme dépendances

  const last30Days = useMemo(() => getLast30Days(), [getLast30Days]);

  // Calculer les stats par jour
  const getStatsForDate = (date: string) => {
    const dayMeals = allRepas.filter(
      (r: Repas) => timestampToDateString(r.date) === date,
    );
    const totalCalories = dayMeals.reduce(
      (sum: number, meal: Repas) => sum + (meal.macros?.kcal || 0),
      0,
    );
    const totalProteins = dayMeals.reduce(
      (sum: number, meal: Repas) => sum + (meal.macros?.prot || 0),
      0,
    );
    const mealsCount = dayMeals.length;

    return { totalCalories, totalProteins, mealsCount, meals: dayMeals };
  };

  // Calculer les stats globales des 30 derniers jours
  const globalStats: GlobalStats = last30Days.reduce(
    (acc: GlobalStats, dateStr: string) => {
      const stats = getStatsForDate(dateStr);
      if (stats.mealsCount > 0) {
        acc.totalDays++;
        acc.totalCalories += stats.totalCalories;
        acc.totalMeals += stats.mealsCount;
        acc.averageCaloriesPerDay = acc.totalCalories / acc.totalDays;
      }
      return acc;
    },
    { totalDays: 0, totalCalories: 0, totalMeals: 0, averageCaloriesPerDay: 0 },
  );

  const handleDateClick = (date: string) => {
    onDateChange(date);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isToday = (date: string) => {
    return date === new Date().toISOString().split('T')[0];
  };

  const isCurrentDate = (date: string) => {
    return date === currentDate;
  };

  // Accessibilité: focus initial + Esc pour fermer
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
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          viewMode === 'calendar'
            ? 'bg-neon-cyan/20 text-neon-cyan'
            : 'text-muted-foreground hover:text-white'
        }`}
      >
        <Calendar className="h-4 w-4" />
      </button>
      <button
        onClick={() => setViewMode('stats')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          viewMode === 'stats'
            ? 'bg-neon-cyan/20 text-neon-cyan'
            : 'text-muted-foreground hover:text-white'
        }`}
      >
        <BarChart3 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Historique Nutrition"
      icon={<Calendar className="h-6 w-6 text-neon-cyan" />}
      headerContent={headerContent}
      maxWidth="4xl"
      height="90vh"
      className="flex flex-col"
    >
      <div className="p-6 flex-1 overflow-y-auto">
        {viewMode === 'calendar' ? (
          <>
            {/* Vue Calendrier */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-4">
                30 derniers jours
              </h3>
              <div
                className="grid grid-cols-7 gap-2"
                role="grid"
                aria-label="Calendrier des 30 derniers jours"
              >
                {last30Days.map((date: string, idx: number) => {
                  const stats = getStatsForDate(date);
                  const hasData = stats.mealsCount > 0;
                  const hasCoachComments = commentedDates.has(date);

                  return (
                    <button
                      key={date}
                      onClick={() => handleDateClick(date)}
                      onKeyDown={(e) => handleGridKey(e, idx)}
                      ref={(el) => {
                        dayRefs.current[idx] = el;
                      }}
                      className={`
                          relative aspect-square p-2 rounded-lg text-center transition-all hover:scale-105
                          ${
                            isCurrentDate(date)
                              ? 'bg-neon-cyan/30 border-2 border-neon-cyan text-neon-cyan'
                              : hasData
                                ? 'bg-neon-green/20 border border-neon-green/30 text-white hover:bg-neon-green/30'
                                : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'
                          }
                          ${isToday(date) ? 'ring-2 ring-yellow-400/50' : ''}
                        `}
                      role="gridcell"
                      aria-selected={isCurrentDate(date)}
                      aria-label={`${formatFullDate(date)}${hasData ? `, ${stats.totalCalories} kilocalories, ${stats.mealsCount} repas` : ', aucune donnée'}`}
                      title={
                        hasData
                          ? `${stats.totalCalories} kcal • ${stats.mealsCount} repas`
                          : 'Aucune donnée'
                      }
                    >
                      <div className="text-xs font-medium">
                        {formatDate(date)}
                      </div>
                      {hasData && (
                        <div className="text-xs mt-1">
                          <div>{stats.totalCalories}</div>
                          <div className="text-xs opacity-75">
                            {stats.mealsCount}repas
                          </div>
                        </div>
                      )}
                      {hasCoachComments && (
                        <span
                          className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neon-pink shadow"
                          title="Commentaire coach"
                        ></span>
                      )}
                      {isToday(date) && (
                        <div className="text-xs text-yellow-400 font-bold">
                          •
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Légende */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neon-green/20 border border-neon-green/30 rounded"></div>
                <span className="text-muted-foreground">
                  Données disponibles
                </span>
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

            {repasLoading && allRepas.length > 0 && (
              <div className="flex justify-center mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-neon-cyan"></div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Vue Statistiques */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-neon-cyan" />
                  Statistiques des 30 derniers jours
                </h3>

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
                      {globalStats.totalMeals}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total repas
                    </div>
                  </div>
                  <div className="glass-effect p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-neon-purple">
                      {Math.round(globalStats.totalCalories)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total kcal
                    </div>
                  </div>
                  <div className="glass-effect p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-neon-pink">
                      {Math.round(globalStats.averageCaloriesPerDay)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Moyenne/jour
                    </div>
                  </div>
                </div>
              </div>

              {/* Détail par jour récent */}
              <div>
                <h4 className="text-md font-medium text-white mb-3">
                  Détail des 7 derniers jours
                </h4>
                <div className="space-y-2">
                  {last30Days
                    .slice(-7)
                    .reverse()
                    .map((date: string) => {
                      const stats = getStatsForDate(date);

                      return (
                        <div
                          key={date}
                          className={`
                            glass-effect p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors
                            ${isCurrentDate(date) ? 'border border-neon-cyan/30' : ''}
                          `}
                          onClick={() => handleDateClick(date)}
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium text-white">
                                {formatFullDate(date)}
                              </div>
                              {isToday(date) && (
                                <div className="text-xs text-yellow-400">
                                  Aujourd&apos;hui
                                </div>
                              )}
                              {isCurrentDate(date) && !isToday(date) && (
                                <div className="text-xs text-neon-cyan">
                                  Sélectionné
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-right">
                              <div className="text-white font-medium">
                                {stats.totalCalories} kcal
                              </div>
                              <div className="text-muted-foreground">
                                {stats.mealsCount} repas
                              </div>
                            </div>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </StandardModal>
  );
}
