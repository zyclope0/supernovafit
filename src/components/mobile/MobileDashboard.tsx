'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Target,
  Activity,
  Utensils,
  Scale,
  Heart,
  Trophy,
  Zap,
} from 'lucide-react';
import DashboardWidget from './DashboardWidget';
import { useAuth } from '@/hooks/useAuth';
import {
  useRepas,
  useEntrainements,
  useMesures,
  useJournal,
} from '@/hooks/useFirestore';
import { calculateTDEE, calculateAdjustedTDEE } from '@/lib/userCalculations';
import { cn } from '@/lib/utils';
import { timestampToDateString } from '@/lib/dateUtils';

interface WidgetConfig {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  size: 'small' | 'medium' | 'large';
  priority: number;
  enabled: boolean;
}

interface MobileDashboardProps {
  className?: string;
}

export default function MobileDashboard({ className }: MobileDashboardProps) {
  const { userProfile } = useAuth();
  const { repas } = useRepas();
  const { entrainements } = useEntrainements();
  const { mesures } = useMesures();
  const { entries: journalEntries } = useJournal();

  const [widgetSizes, setWidgetSizes] = useState<
    Record<string, 'small' | 'medium' | 'large'>
  >({
    'calories-today': 'medium',
    'weight-trend': 'medium',
    'training-week': 'small',
    'mood-today': 'small',
    'goals-progress': 'large',
    'quick-stats': 'medium',
  });

  // Données du jour
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = repas.filter(
    (r) => timestampToDateString(r.date) === today,
  );
  const todayStats = todayMeals.reduce(
    (total, meal) => ({
      calories: total.calories + (meal.macros?.kcal || 0),
      proteins: total.proteins + (meal.macros?.prot || 0),
      carbs: total.carbs + (meal.macros?.glucides || 0),
      fats: total.fats + (meal.macros?.lipides || 0),
    }),
    { calories: 0, proteins: 0, carbs: 0, fats: 0 },
  );

  // Entraînements de la semaine
  const weekStart = new Date();
  const dayOfWeek = weekStart.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Dimanche = 6 jours, autres = jour - 1
  weekStart.setDate(weekStart.getDate() - daysToSubtract);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const thisWeekTrainings = entrainements.filter(
    (e) => timestampToDateString(e.date) >= weekStartStr,
  );

  // Dernier poids
  const latestWeight = mesures
    .filter((m) => m.poids)
    .sort((a, b) => {
      const dateA = timestampToDateString(a.date);
      const dateB = timestampToDateString(b.date);
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })[0];

  // Humeur du jour
  const todayMood = journalEntries.find(
    (e) => timestampToDateString(e.date) === today,
  );

  // Calculer calories d'entraînement de la semaine pour ajustement
  const weekCaloriesBurned = thisWeekTrainings.reduce(
    (total, training) => total + (training.calories || 0),
    0,
  );

  // TDEE ajusté pour éviter le double comptage avec les entraînements
  // Utiliser la moyenne quotidienne pour l'ajustement (pas le total de la période)
  const avgDailySportCalories = weekCaloriesBurned / 7;
  const baseTDEE = userProfile
    ? calculateTDEE(userProfile)
    : latestWeight?.poids
      ? Math.round(latestWeight.poids * 22 * 1.55)
      : 2000;
  const adjustedTDEE = userProfile
    ? calculateAdjustedTDEE(userProfile, avgDailySportCalories)
    : baseTDEE;
  const estimatedTDEE = adjustedTDEE || baseTDEE;

  const handleToggleSize = (widgetId: string) => {
    setWidgetSizes((prev) => {
      const current = prev[widgetId] || 'medium';
      const next =
        current === 'small'
          ? 'medium'
          : current === 'medium'
            ? 'large'
            : 'small';
      return { ...prev, [widgetId]: next };
    });
  };

  const widgets: WidgetConfig[] = [
    {
      id: 'calories-today',
      title: "Calories Aujourd'hui",
      subtitle: `${Math.round(todayStats.calories)} / ${estimatedTDEE} kcal`,
      icon: Utensils,
      size: widgetSizes['calories-today'],
      priority: 1,
      enabled: true,
    },
    {
      id: 'training-week',
      title: 'Entraînements',
      subtitle: `${thisWeekTrainings.length} cette semaine`,
      icon: Activity,
      size: widgetSizes['training-week'],
      priority: 2,
      enabled: true,
    },
    {
      id: 'weight-trend',
      title: 'Poids Actuel',
      subtitle: latestWeight ? `${latestWeight.poids}kg` : 'Non renseigné',
      icon: Scale,
      size: widgetSizes['weight-trend'],
      priority: 3,
      enabled: true,
    },
    {
      id: 'mood-today',
      title: 'Humeur',
      subtitle: todayMood?.humeur ? `${todayMood.humeur}/10` : 'Non renseigné',
      icon: Heart,
      size: widgetSizes['mood-today'],
      priority: 4,
      enabled: true,
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Calories Progress */}
        <div className="glass-effect rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Utensils className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-white/60">Calories</span>
          </div>
          <div className="text-xl font-bold text-white mb-1">
            {Math.round(todayStats.calories)}
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (todayStats.calories / (estimatedTDEE || 2000)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Protein Progress */}
        <div className="glass-effect rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-white/60">Protéines</span>
          </div>
          <div className="text-xl font-bold text-white mb-1">
            {Math.round(todayStats.proteins)}g
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (todayStats.proteins / (latestWeight?.poids ? Math.round(latestWeight.poids * 1.6) : 112)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Weekly Training */}
        <div className="glass-effect rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-xs text-white/60">Séances</span>
          </div>
          <div className="text-xl font-bold text-white mb-1">
            {thisWeekTrainings.length}
          </div>
          <div className="text-xs text-white/60">cette semaine</div>
        </div>

        {/* Current Weight */}
        <div className="glass-effect rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Scale className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-white/60">Poids</span>
          </div>
          <div className="text-xl font-bold text-white mb-1">
            {latestWeight ? `${latestWeight.poids}kg` : '-'}
          </div>
          {latestWeight && (
            <div className="text-xs text-white/60">
              {new Date(
                timestampToDateString(latestWeight.date),
              ).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}
            </div>
          )}
        </div>
      </div>

      {/* Today's Goals */}
      <div className="glass-effect rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Objectifs du Jour</h2>
        </div>

        <div className="space-y-3">
          {/* Calories Goal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Utensils className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <div className="font-medium text-white">Calories</div>
                <div className="text-sm text-white/60">
                  {Math.round(todayStats.calories)} / {estimatedTDEE} kcal
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-400">
                {Math.round(
                  (todayStats.calories / (estimatedTDEE || 2000)) * 100,
                )}
                %
              </div>
              <div className="w-16 bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (todayStats.calories / (estimatedTDEE || 2000)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Protein Goal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-white">Protéines</div>
                <div className="text-sm text-white/60">
                  {Math.round(todayStats.proteins)} /{' '}
                  {latestWeight?.poids
                    ? Math.round(latestWeight.poids * 1.6)
                    : 112}
                  g
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-400">
                {Math.round(
                  (todayStats.proteins /
                    (latestWeight?.poids
                      ? Math.round(latestWeight.poids * 1.6)
                      : 112)) *
                    100,
                )}
                %
              </div>
              <div className="w-16 bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (todayStats.proteins / (latestWeight?.poids ? Math.round(latestWeight.poids * 1.6) : 112)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Training Goal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <div className="font-medium text-white">Entraînements</div>
                <div className="text-sm text-white/60">
                  {thisWeekTrainings.length} / 4 cette semaine
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-400">
                {Math.round((thisWeekTrainings.length / 4) * 100)}%
              </div>
              <div className="w-16 bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (thisWeekTrainings.length / 4) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="glass-effect rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">
            Résumé d&apos;Aujourd&apos;hui
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Meals Count */}
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {todayMeals.length}
            </div>
            <div className="text-sm text-white/60">Repas</div>
            <div className="text-xs text-white/40">enregistrés</div>
          </div>

          {/* Today's Training */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {
                entrainements.filter(
                  (e) => timestampToDateString(e.date) === today,
                ).length
              }
            </div>
            <div className="text-sm text-white/60">Séance</div>
            <div className="text-xs text-white/40">aujourd&apos;hui</div>
          </div>

          {/* Mood Today */}
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-400 mb-1">
              {todayMood?.humeur ? `${todayMood.humeur}/10` : '-'}
            </div>
            <div className="text-sm text-white/60">Humeur</div>
            <div className="text-xs text-white/40">du jour</div>
          </div>

          {/* Energy Today */}
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {todayMood?.energie ? `${todayMood.energie}/10` : '-'}
            </div>
            <div className="text-sm text-white/60">Énergie</div>
            <div className="text-xs text-white/40">ressentie</div>
          </div>
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="glass-effect rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <h2 className="text-lg font-bold text-white">Tendances 7 Jours</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Calories Trend */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                Calories moyennes
              </span>
              <span className="text-lg font-bold text-orange-400">
                {Math.round(
                  repas
                    .filter((r) => {
                      const dateStr = timestampToDateString(r.date);
                      const sevenDaysAgo = new Date(
                        Date.now() - 7 * 24 * 60 * 60 * 1000,
                      );
                      return new Date(dateStr) >= sevenDaysAgo;
                    })
                    .reduce((sum, r) => sum + (r.macros?.kcal || 0), 0) / 7,
                )}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full w-3/4" />
            </div>
          </div>

          {/* Training Frequency */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                Fréquence sport
              </span>
              <span className="text-lg font-bold text-blue-400">
                {thisWeekTrainings.length}/7
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${(thisWeekTrainings.length / 7) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Card */}
      <div className="glass-effect rounded-xl p-4 border border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Motivation</h2>
        </div>

        <div className="text-center">
          <div className="text-3xl mb-2">🚀</div>
          <p className="text-white/80 text-sm leading-relaxed">
            {todayStats.calories > (estimatedTDEE || 2000) * 0.8
              ? 'Excellent ! Vous êtes sur la bonne voie aujourd&apos;hui !'
              : todayMeals.length > 0
                ? 'Continuez comme ça ! Quelques repas de plus pour atteindre vos objectifs.'
                : 'C&apos;est le moment parfait pour commencer votre journée nutritionnelle !'}
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => (window.location.href = '/diete')}
          className="glass-effect rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105"
        >
          <div className="text-center">
            <Utensils className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="font-medium text-white mb-1">Ajouter Repas</div>
            <div className="text-xs text-white/60">Saisie rapide</div>
          </div>
        </button>

        <button
          onClick={() => (window.location.href = '/entrainements')}
          className="glass-effect rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105"
        >
          <div className="text-center">
            <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="font-medium text-white mb-1">Entraînement</div>
            <div className="text-xs text-white/60">Nouvelle séance</div>
          </div>
        </button>

        <button
          onClick={() => (window.location.href = '/mesures')}
          className="glass-effect rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105"
        >
          <div className="text-center">
            <Scale className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="font-medium text-white mb-1">Peser</div>
            <div className="text-xs text-white/60">Suivi poids</div>
          </div>
        </button>

        <button
          onClick={() => (window.location.href = '/journal')}
          className="glass-effect rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105"
        >
          <div className="text-center">
            <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <div className="font-medium text-white mb-1">Humeur</div>
            <div className="text-xs text-white/60">Journal rapide</div>
          </div>
        </button>
      </div>

      {/* Widgets Configurables */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Widgets Configurables
          </h3>
          <button
            onClick={() => {
              // TODO: Implémenter modal de configuration widgets
              console.log('Configuration widgets demandée');
            }}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Configurer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {widgets
            .filter((w) => w.enabled)
            .map((widget) => (
              <DashboardWidget
                key={widget.id}
                id={widget.id}
                title={widget.title}
                subtitle={widget.subtitle}
                icon={widget.icon}
                size={widget.size}
                onToggleSize={() => handleToggleSize(widget.id)}
                className="glass-effect border border-white/10"
              >
                {/* Contenu fonctionnel selon le widget */}
                {widget.id === 'calories-today' && (
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-neon-green mb-2">
                        {Math.round(todayStats.calories)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        kcal consommées
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-neon-green h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (todayStats.calories / (estimatedTDEE || 2000)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-center mt-2 text-white/60">
                      {Math.round(
                        (todayStats.calories / (estimatedTDEE || 2000)) * 100,
                      )}
                      % de l&apos;objectif
                    </div>
                  </div>
                )}

                {widget.id === 'training-week' && (
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-neon-orange mb-2">
                        {thisWeekTrainings.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        séances cette semaine
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-neon-orange h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (thisWeekTrainings.length / 4) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-center mt-2 text-white/60">
                      Objectif : 4 séances/semaine
                    </div>
                  </div>
                )}

                {widget.id === 'weight-trend' && (
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-neon-purple mb-2">
                        {latestWeight?.poids || '--'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        kg actuel
                      </div>
                    </div>
                    {latestWeight && (
                      <div className="text-xs text-center text-white/60">
                        Dernière mesure :{' '}
                        {new Date(
                          timestampToDateString(latestWeight.date),
                        ).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                )}

                {widget.id === 'mood-today' && (
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-neon-pink mb-2">
                        {todayMood?.humeur || '--'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        /5 humeur
                      </div>
                    </div>
                    {todayMood && (
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-neon-pink h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${((todayMood.humeur || 0) / 5) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                    <div className="text-xs text-center mt-2 text-white/60">
                      {todayMood
                        ? 'Renseigné aujourd&apos;hui'
                        : 'Non renseigné'}
                    </div>
                  </div>
                )}

                {/* Widget par défaut pour les autres */}
                {![
                  'calories-today',
                  'training-week',
                  'weight-trend',
                  'mood-today',
                ].includes(widget.id) && (
                  <div className="text-center py-4">
                    <widget.icon className="w-12 h-12 text-neon-cyan mx-auto mb-2" />
                    <div className="text-sm text-white/80">
                      Widget {widget.title}
                    </div>
                  </div>
                )}
              </DashboardWidget>
            ))}
        </div>
      </div>
    </div>
  );
}
