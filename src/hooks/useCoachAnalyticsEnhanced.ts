'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useCoachAthletes } from './useFirestore';
import { useCoachRealAnalytics } from './useCoachRealAnalytics';

interface EnhancedAthleteStats {
  calories_jour: number;
  proteines_jour: number;
  entrainements_semaine: number;
  poids_actuel: number;
  variation_poids: number;
  variation_perf: number;
  derniere_activite?: Date;
  objectif_atteint?: boolean;
  // Nouvelles métriques réelles
  repas_comptes_jour: number;
  calories_semaine: number;
  proteines_semaine: number;
  entrainements_total: number;
  calories_brulées_semaine: number;
  jours_actifs_semaine: number;
  dernier_entrainement?: Date;
  derniere_mesure?: Date;
  dernier_repas?: Date;
  dernier_journal?: Date;
  // Métadonnées sur la source des données
  dataSource: {
    calories_jour: 'real' | 'simulated';
    proteines_jour: 'real' | 'simulated';
    entrainements_semaine: 'real' | 'simulated';
    poids_actuel: 'real' | 'simulated';
    variation_poids: 'real' | 'simulated';
    variation_perf: 'real' | 'simulated';
    derniere_activite: 'real' | 'simulated';
    objectif_atteint: 'real' | 'simulated';
  };
}

interface EnhancedAthlete {
  id: string;
  nom: string;
  email: string;
  objectif?: string;
  dernier_acces?: Date | string;
  stats?: EnhancedAthleteStats;
  // Nouvelles données réelles
  progression_poids: { date: string; poids: number }[];
  progression_calories: { date: string; calories: number }[];
  activite_recente: { type: string; date: Date; description: string }[];
  objectifs_actuels: {
    type: string;
    cible: number;
    actuel: number;
    pourcentage: number;
  }[];
}

interface EnhancedAlert {
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
  // Nouvelles propriétés d'alerte
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'nutrition' | 'training' | 'measurement' | 'activity' | 'goal';
  autoResolve?: boolean;
  data?: Record<string, unknown>;
  // Source des données
  dataSource: 'real' | 'simulated';
}

interface EnhancedTeamStats {
  totalXP: number;
  challengesCompleted: number;
  totalWorkouts: number;
  totalCalories: number;
  averageProgress: number;
  activeAthletes: number;
  totalAthletes: number;
  weeklyGoal: number;
  monthlyGoal: number;
  // Nouvelles statistiques réelles
  totalMealsTracked: number;
  totalMeasurements: number;
  averageCaloriesPerAthlete: number;
  averageProteinsPerAthlete: number;
  mostActiveAthlete: string;
  leastActiveAthlete: string;
  teamStreak: number;
  completionRate: number;
  // Métadonnées sur la source des données
  dataSource: {
    totalXP: 'real' | 'simulated';
    challengesCompleted: 'real' | 'simulated';
    totalWorkouts: 'real' | 'simulated';
    totalCalories: 'real' | 'simulated';
    averageProgress: 'real' | 'simulated';
    activeAthletes: 'real' | 'simulated';
    teamStreak: 'real' | 'simulated';
    completionRate: 'real' | 'simulated';
  };
}

interface ImplementationStatus {
  realDataAvailable: boolean;
  realDataPercentage: number;
  simulatedFeatures: string[];
  missingFeatures: string[];
  recommendations: string[];
}

export function useCoachAnalyticsEnhanced() {
  const { user } = useAuth();
  const { athletes: coachAthletes, loading: athletesLoading } =
    useCoachAthletes();
  const { analyticsData: realData, loading: realDataLoading } =
    useCoachRealAnalytics();

  const [analyticsData, setAnalyticsData] = useState<{
    athletes: EnhancedAthlete[];
    alerts: EnhancedAlert[];
    teamStats: EnhancedTeamStats;
    implementationStatus: ImplementationStatus;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || athletesLoading || realDataLoading) {
      setLoading(true);
      return;
    }

    const generateEnhancedAnalyticsData = async () => {
      try {
        setLoading(true);
        console.log(
          '🔍 COACH ANALYTICS ENHANCED - Génération des données hybrides...',
        );

        // Utiliser les vraies données si disponibles, sinon utiliser les données simulées
        const useRealData = realData && realData.athletes.length > 0;

        let enhancedAthletes: EnhancedAthlete[] = [];
        let enhancedAlerts: EnhancedAlert[] = [];
        let enhancedTeamStats: EnhancedTeamStats;

        if (useRealData) {
          // Utiliser les vraies données avec métadonnées
          enhancedAthletes = realData.athletes.map((athlete) => ({
            ...athlete,
            stats: athlete.stats
              ? {
                  ...athlete.stats,
                  dataSource: {
                    calories_jour: 'real',
                    proteines_jour: 'real',
                    entrainements_semaine: 'real',
                    poids_actuel: 'real',
                    variation_poids: 'real',
                    variation_perf: 'real',
                    derniere_activite: 'real',
                    objectif_atteint: 'real',
                  },
                }
              : undefined,
          }));

          enhancedAlerts = realData.alerts.map((alert) => ({
            ...alert,
            dataSource: 'real' as const,
          }));

          enhancedTeamStats = {
            ...realData.teamStats,
            dataSource: {
              totalXP: 'simulated', // Calculé à partir des vraies données mais logique simplifiée
              challengesCompleted: 'simulated', // Pas de vraie logique de challenges
              totalWorkouts: 'real',
              totalCalories: 'real',
              averageProgress: 'real',
              activeAthletes: 'real',
              teamStreak: 'simulated', // Logique simplifiée
              completionRate: 'simulated', // Basé sur des critères simplifiés
            },
          };
        } else {
          // Utiliser les données simulées avec métadonnées
          enhancedAthletes = coachAthletes.map((athlete, index) => {
            const seed =
              athlete.id.charCodeAt(0) +
              athlete.id.charCodeAt(athlete.id.length - 1);
            const stableRandom = (seed % 100) / 100;

            return {
              ...athlete,
              stats: {
                calories_jour: Math.round(
                  1800 + index * 200 + stableRandom * 400,
                ),
                proteines_jour: Math.round(
                  120 + index * 20 + stableRandom * 40,
                ),
                entrainements_semaine: 3 + Math.floor(stableRandom * 4),
                poids_actuel:
                  Math.round((70 + index * 5 + stableRandom * 10) * 10) / 10,
                variation_poids: Math.round((-2 + stableRandom * 4) * 10) / 10,
                variation_perf: Math.round((-10 + stableRandom * 30) * 10) / 10,
                derniere_activite: new Date(
                  Date.now() - stableRandom * 7 * 24 * 60 * 60 * 1000,
                ),
                objectif_atteint: stableRandom > 0.3,
                repas_comptes_jour: 0,
                calories_semaine: 0,
                proteines_semaine: 0,
                entrainements_total: 0,
                calories_brulées_semaine: 0,
                jours_actifs_semaine: 0,
                dataSource: {
                  calories_jour: 'simulated',
                  proteines_jour: 'simulated',
                  entrainements_semaine: 'simulated',
                  poids_actuel: 'simulated',
                  variation_poids: 'simulated',
                  variation_perf: 'simulated',
                  derniere_activite: 'simulated',
                  objectif_atteint: 'simulated',
                },
              },
              progression_poids: [],
              progression_calories: [],
              activite_recente: [],
              objectifs_actuels: [],
            };
          });

          // Générer des alertes simulées
          enhancedAlerts = generateSimulatedAlerts(enhancedAthletes);

          // Calculer les statistiques d'équipe simulées
          enhancedTeamStats = calculateSimulatedTeamStats(enhancedAthletes);
        }

        // Calculer le statut d'implémentation
        const implementationStatus = calculateImplementationStatus(
          enhancedAthletes,
          enhancedTeamStats,
          useRealData ?? false,
        );

        setAnalyticsData({
          athletes: enhancedAthletes,
          alerts: enhancedAlerts,
          teamStats: enhancedTeamStats,
          implementationStatus,
        });

        console.log(
          '✅ COACH ANALYTICS ENHANCED - Données hybrides générées avec succès',
        );
        setLoading(false);
      } catch (error) {
        console.error(
          '❌ COACH ANALYTICS ENHANCED - Erreur génération données:',
          error,
        );
        setLoading(false);
      }
    };

    generateEnhancedAnalyticsData();
  }, [user, coachAthletes, athletesLoading, realData, realDataLoading]);

  return {
    analyticsData,
    loading,
    refreshAnalytics: () => {
      setAnalyticsData(null);
      setLoading(true);
    },
  };
}

// Fonction pour générer des alertes simulées
function generateSimulatedAlerts(athletes: EnhancedAthlete[]): EnhancedAlert[] {
  const alerts: EnhancedAlert[] = [];

  athletes.forEach((athlete) => {
    if (!athlete.stats) return;

    const stats = athlete.stats;

    // Alerte si inactif > 7 jours
    if (stats.derniere_activite) {
      const daysSinceActivity = Math.floor(
        (Date.now() - stats.derniere_activite.getTime()) /
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
          severity: 'medium',
          category: 'activity',
          dataSource: 'simulated',
          action: {
            label: 'Envoyer un message',
            onClick: () => console.log(`Envoyer message à ${athlete.nom}`),
          },
        });
      }
    }

    // Alerte si objectif non atteint
    if (!stats.objectif_atteint) {
      alerts.push({
        id: `goal-${athlete.id}`,
        type: 'info',
        title: 'Objectif non atteint',
        message: `${athlete.nom} n'a pas atteint son objectif cette semaine`,
        athleteId: athlete.id,
        athleteName: athlete.nom,
        timestamp: new Date(),
        severity: 'low',
        category: 'goal',
        dataSource: 'simulated',
        action: {
          label: 'Voir le détail',
          onClick: () => console.log(`Voir détail ${athlete.nom}`),
        },
      });
    }

    // Alerte si performance en baisse
    if (stats.variation_perf < -5) {
      alerts.push({
        id: `performance-${athlete.id}`,
        type: 'error',
        title: 'Performance en baisse',
        message: `${athlete.nom} montre une baisse de performance de ${Math.abs(stats.variation_perf).toFixed(1)}%`,
        athleteId: athlete.id,
        athleteName: athlete.nom,
        timestamp: new Date(),
        severity: 'high',
        category: 'training',
        dataSource: 'simulated',
        action: {
          label: 'Analyser',
          onClick: () => console.log(`Analyser ${athlete.nom}`),
        },
      });
    }
  });

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Fonction pour calculer les statistiques d'équipe simulées
function calculateSimulatedTeamStats(
  athletes: EnhancedAthlete[],
): EnhancedTeamStats {
  const totalXP = athletes.reduce(
    (sum, athlete) => sum + (athlete.stats?.entrainements_semaine || 0) * 50,
    0,
  );
  const challengesCompleted = athletes.filter(
    (a) => a.stats?.objectif_atteint,
  ).length;
  const totalWorkouts = athletes.reduce(
    (sum, athlete) => sum + (athlete.stats?.entrainements_semaine || 0),
    0,
  );
  const totalCalories = athletes.reduce(
    (sum, athlete) => sum + (athlete.stats?.calories_jour || 0),
    0,
  );
  const averageProgress =
    athletes.reduce(
      (sum, athlete) => sum + (athlete.stats?.variation_perf || 0),
      0,
    ) / athletes.length;
  const activeAthletes = athletes.filter((athlete) => {
    if (!athlete.stats?.derniere_activite) return false;
    const daysSinceActivity = Math.floor(
      (Date.now() - athlete.stats.derniere_activite.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return daysSinceActivity <= 1;
  }).length;

  return {
    totalXP,
    challengesCompleted,
    totalWorkouts,
    totalCalories,
    averageProgress: Math.max(0, averageProgress),
    activeAthletes,
    totalAthletes: athletes.length,
    weeklyGoal: athletes.length * 4,
    monthlyGoal: athletes.length * 8,
    totalMealsTracked: 0,
    totalMeasurements: 0,
    averageCaloriesPerAthlete: Math.round(totalCalories / athletes.length),
    averageProteinsPerAthlete: 0,
    mostActiveAthlete: '',
    leastActiveAthlete: '',
    teamStreak: 0,
    completionRate: 0,
    dataSource: {
      totalXP: 'simulated',
      challengesCompleted: 'simulated',
      totalWorkouts: 'simulated',
      totalCalories: 'simulated',
      averageProgress: 'simulated',
      activeAthletes: 'simulated',
      teamStreak: 'simulated',
      completionRate: 'simulated',
    },
  };
}

// Fonction pour calculer le statut d'implémentation
function calculateImplementationStatus(
  athletes: EnhancedAthlete[],
  teamStats: EnhancedTeamStats,
  realDataAvailable: boolean,
): ImplementationStatus {
  const simulatedFeatures: string[] = [];
  const missingFeatures: string[] = [];
  const recommendations: string[] = [];

  // Analyser les données des athlètes
  if (athletes.length > 0 && athletes[0].stats) {
    const stats = athletes[0].stats;

    if (stats.dataSource.calories_jour === 'simulated') {
      simulatedFeatures.push('Calories quotidiennes');
    }
    if (stats.dataSource.proteines_jour === 'simulated') {
      simulatedFeatures.push('Protéines quotidiennes');
    }
    if (stats.dataSource.entrainements_semaine === 'simulated') {
      simulatedFeatures.push('Entraînements hebdomadaires');
    }
    if (stats.dataSource.poids_actuel === 'simulated') {
      simulatedFeatures.push('Poids actuel');
    }
    if (stats.dataSource.variation_poids === 'simulated') {
      simulatedFeatures.push('Variation de poids');
    }
    if (stats.dataSource.variation_perf === 'simulated') {
      simulatedFeatures.push('Variation de performance');
    }
  }

  // Analyser les statistiques d'équipe
  if (teamStats.dataSource.totalXP === 'simulated') {
    simulatedFeatures.push('Système XP');
  }
  if (teamStats.dataSource.challengesCompleted === 'simulated') {
    simulatedFeatures.push('Challenges complétés');
  }

  // Fonctionnalités manquantes
  missingFeatures.push('Système de notifications push');
  missingFeatures.push('Chat coach-athlète');
  missingFeatures.push("Plans d'entraînement personnalisés");
  missingFeatures.push('Analyses avancées');
  missingFeatures.push('Export de rapports');
  missingFeatures.push('Intégration appareils fitness');

  // Recommandations
  if (!realDataAvailable) {
    recommendations.push(
      'Implémenter la récupération des vraies données Firestore',
    );
    recommendations.push('Ajouter la pagination pour les grandes collections');
    recommendations.push('Optimiser les requêtes Firestore');
  }

  recommendations.push('Créer un système de challenges fonctionnel');
  recommendations.push('Implémenter les notifications push');
  recommendations.push('Ajouter un système de chat');

  const realDataPercentage = realDataAvailable ? 75 : 25;

  return {
    realDataAvailable,
    realDataPercentage,
    simulatedFeatures,
    missingFeatures,
    recommendations,
  };
}
