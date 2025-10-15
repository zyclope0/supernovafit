'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useCoachAthletes } from './useFirestore';

interface AthleteStats {
  calories_jour: number;
  proteines_jour: number;
  entrainements_semaine: number;
  poids_actuel: number;
  variation_poids: number;
  variation_perf: number;
  derniere_activite?: Date;
  objectif_atteint?: boolean;
}

interface Athlete {
  id: string;
  nom: string;
  email: string;
  objectif?: string;
  dernier_acces?: Date | string;
  stats?: AthleteStats;
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  title: string;
  message: string;
  athleteId?: string;
  athleteName?: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface TeamStats {
  totalXP: number;
  challengesCompleted: number;
  totalWorkouts: number;
  totalCalories: number;
  averageProgress: number;
  activeAthletes: number;
  totalAthletes: number;
  weeklyGoal: number;
  monthlyGoal: number;
}

export function useCoachAnalytics() {
  const { user } = useAuth();
  const { athletes: coachAthletes, loading: athletesLoading } =
    useCoachAthletes();
  const [analyticsData, setAnalyticsData] = useState<{
    athletes: Athlete[];
    alerts: Alert[];
    teamStats: TeamStats;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || athletesLoading) {
      setLoading(true);
      return;
    }

    const generateAnalyticsData = async () => {
      try {
        setLoading(true);

        // Simuler des données enrichies pour les athlètes (stables basées sur l'ID)
        const enrichedAthletes: Athlete[] = coachAthletes.map(
          (athlete, index) => {
            // Générer des stats stables basées sur l'ID de l'athlète pour éviter les changements aléatoires
            const seed =
              athlete.id.charCodeAt(0) +
              athlete.id.charCodeAt(athlete.id.length - 1);
            const stableRandom = (seed % 100) / 100; // Valeur entre 0 et 1 basée sur l'ID

            const baseStats = {
              calories_jour: Math.round(
                1800 + index * 200 + stableRandom * 400,
              ),
              proteines_jour: Math.round(120 + index * 20 + stableRandom * 40),
              entrainements_semaine: 3 + Math.floor(stableRandom * 4),
              poids_actuel:
                Math.round((70 + index * 5 + stableRandom * 10) * 10) / 10,
              variation_poids: Math.round((-2 + stableRandom * 4) * 10) / 10,
              variation_perf: Math.round((-10 + stableRandom * 30) * 10) / 10,
              derniere_activite: new Date(
                Date.now() - stableRandom * 7 * 24 * 60 * 60 * 1000,
              ),
              objectif_atteint: stableRandom > 0.3,
            };

            return {
              ...athlete,
              stats: baseStats,
            };
          },
        );

        // Générer des alertes automatiques
        const alerts: Alert[] = [];

        enrichedAthletes.forEach((athlete) => {
          if (athlete.stats) {
            // Alerte si inactif > 7 jours
            if (athlete.stats.derniere_activite) {
              const daysSinceActivity = Math.floor(
                (Date.now() - athlete.stats.derniere_activite.getTime()) /
                  (1000 * 60 * 60 * 24),
              );

              if (daysSinceActivity > 7) {
                alerts.push({
                  id: `inactive-${athlete.id}`,
                  type: 'warning',
                  title: 'Athlète inactif',
                  message: `${athlete.nom} n'a pas été actif depuis ${daysSinceActivity} jours`,
                  athleteId: athlete.id,
                  athleteName: athlete.nom,
                  timestamp: new Date(),
                  action: {
                    label: 'Envoyer un message',
                    onClick: () =>
                      console.log(`Envoyer message à ${athlete.nom}`),
                  },
                });
              }
            }

            // Alerte si objectif non atteint
            if (!athlete.stats.objectif_atteint) {
              alerts.push({
                id: `goal-${athlete.id}`,
                type: 'info',
                title: 'Objectif non atteint',
                message: `${athlete.nom} n'a pas atteint son objectif cette semaine`,
                athleteId: athlete.id,
                athleteName: athlete.nom,
                timestamp: new Date(),
                action: {
                  label: 'Voir le détail',
                  onClick: () => console.log(`Voir détail ${athlete.nom}`),
                },
              });
            }

            // Alerte si performance en baisse
            if (athlete.stats.variation_perf < -5) {
              alerts.push({
                id: `performance-${athlete.id}`,
                type: 'error',
                title: 'Performance en baisse',
                message: `${athlete.nom} montre une baisse de performance de ${Math.abs(athlete.stats.variation_perf).toFixed(1)}%`,
                athleteId: athlete.id,
                athleteName: athlete.nom,
                timestamp: new Date(),
                action: {
                  label: 'Analyser',
                  onClick: () => console.log(`Analyser ${athlete.nom}`),
                },
              });
            }
          }
        });

        // Calculer les statistiques d'équipe
        const totalXP = enrichedAthletes.reduce(
          (sum, athlete) =>
            sum + (athlete.stats?.entrainements_semaine || 0) * 50,
          0,
        );
        const challengesCompleted = enrichedAthletes.filter(
          (a) => a.stats?.objectif_atteint,
        ).length;
        const totalWorkouts = enrichedAthletes.reduce(
          (sum, athlete) => sum + (athlete.stats?.entrainements_semaine || 0),
          0,
        );
        const totalCalories = enrichedAthletes.reduce(
          (sum, athlete) => sum + (athlete.stats?.calories_jour || 0),
          0,
        );
        const averageProgress =
          enrichedAthletes.reduce(
            (sum, athlete) => sum + (athlete.stats?.variation_perf || 0),
            0,
          ) / enrichedAthletes.length;
        const activeAthletes = enrichedAthletes.filter((athlete) => {
          if (!athlete.stats?.derniere_activite) return false;
          const daysSinceActivity = Math.floor(
            (Date.now() - athlete.stats.derniere_activite.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          return daysSinceActivity <= 1;
        }).length;

        const teamStats: TeamStats = {
          totalXP,
          challengesCompleted,
          totalWorkouts,
          totalCalories,
          averageProgress: Math.max(0, averageProgress),
          activeAthletes,
          totalAthletes: enrichedAthletes.length,
          weeklyGoal: enrichedAthletes.length * 4, // 4 entraînements par athlète par semaine
          monthlyGoal: enrichedAthletes.length * 8, // 8 challenges par athlète par mois
        };

        setAnalyticsData({
          athletes: enrichedAthletes,
          alerts,
          teamStats,
        });
        setLoading(false);
      } catch (error) {
        console.error('❌ COACH ANALYTICS - Erreur génération données:', error);
        setLoading(false);
      }
    };

    generateAnalyticsData();
  }, [user, coachAthletes, athletesLoading]);

  return {
    analyticsData,
    loading,
    refreshAnalytics: () => {
      // Forcer le rechargement des données
      setAnalyticsData(null);
      setLoading(true);
    },
  };
}
