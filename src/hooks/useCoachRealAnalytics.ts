'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useCoachAthletes } from './useFirestore';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Interfaces pour typage strict des données Firestore
interface RepasData extends DocumentData {
  user_id: string;
  date: string;
  repas: string;
  macros: {
    kcal: number;
    prot: number;
    glucides: number;
    lipides: number;
  };
  created_at: Timestamp;
}

interface EntrainementData extends DocumentData {
  user_id: string;
  date: string;
  type: string;
  duree: number;
  calories: number;
  created_at: Timestamp;
}

interface MesureData extends DocumentData {
  user_id: string;
  date: string;
  poids: number;
  created_at: Timestamp;
}

interface RealAthleteStats {
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
}

interface RealAthlete {
  id: string;
  nom: string;
  email: string;
  objectif?: string;
  dernier_acces?: Date | string;
  stats?: RealAthleteStats;
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

interface RealAlert {
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
}

interface RealTeamStats {
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
}

export function useCoachRealAnalytics() {
  const { user } = useAuth();
  const { athletes: coachAthletes, loading: athletesLoading } =
    useCoachAthletes();
  const [analyticsData, setAnalyticsData] = useState<{
    athletes: RealAthlete[];
    alerts: RealAlert[];
    teamStats: RealTeamStats;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || athletesLoading) {
      setLoading(true);
      return;
    }

    const generateRealAnalyticsData = async () => {
      try {
        setLoading(true);

        // Récupérer les vraies données pour chaque athlète
        const enrichedAthletes: RealAthlete[] = await Promise.all(
          coachAthletes.map(async (athlete) => {
            const realStats = await getRealAthleteStats(athlete.id);
            const progressionData = await getAthleteProgression(athlete.id);
            const activityData = await getAthleteRecentActivity(athlete.id);
            const goalsData = await getAthleteCurrentGoals(athlete.id);

            return {
              ...athlete,
              stats: realStats,
              progression_poids: progressionData.poids,
              progression_calories: progressionData.calories,
              activite_recente: activityData,
              objectifs_actuels: goalsData,
            };
          }),
        );

        // Générer des alertes basées sur les vraies données
        const realAlerts = generateRealAlerts(enrichedAthletes);

        // Calculer les vraies statistiques d'équipe
        const realTeamStats = calculateRealTeamStats(enrichedAthletes);

        setAnalyticsData({
          athletes: enrichedAthletes,
          alerts: realAlerts,
          teamStats: realTeamStats,
        });

        setLoading(false);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Coach analytics generation error:', error);
        }
        setLoading(false);
      }
    };

    generateRealAnalyticsData();
  }, [user, coachAthletes, athletesLoading]);

  return {
    analyticsData,
    loading,
    refreshAnalytics: () => {
      setAnalyticsData(null);
      setLoading(true);
    },
  };
}

// Fonction pour récupérer les vraies statistiques d'un athlète
async function getRealAthleteStats(
  athleteId: string,
): Promise<RealAthleteStats> {
  const today = new Date().toISOString().split('T')[0];
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  // const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    // Récupérer les repas du jour
    const mealsQuery = query(
      collection(db, 'repas'),
      where('user_id', '==', athleteId),
      where('date', '==', today),
      orderBy('created_at', 'desc'),
    );
    const mealsSnapshot = await getDocs(mealsQuery);
    const todayMeals = mealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as RepasData),
    }));

    // Récupérer les repas de la semaine
    const weekMealsQuery = query(
      collection(db, 'repas'),
      where('user_id', '==', athleteId),
      where('date', '>=', weekStart),
      orderBy('date', 'desc'),
    );
    const weekMealsSnapshot = await getDocs(weekMealsQuery);
    const weekMeals = weekMealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as RepasData),
    }));

    // Récupérer les entraînements de la semaine
    const trainingsQuery = query(
      collection(db, 'entrainements'),
      where('user_id', '==', athleteId),
      where('date', '>=', weekStart),
      orderBy('date', 'desc'),
    );
    const trainingsSnapshot = await getDocs(trainingsQuery);
    const weekTrainings = trainingsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as EntrainementData),
    }));

    // Récupérer les mesures récentes
    const measuresQuery = query(
      collection(db, 'mesures'),
      where('user_id', '==', athleteId),
      orderBy('date', 'desc'),
      limit(2),
    );
    const measuresSnapshot = await getDocs(measuresQuery);
    const recentMeasures = measuresSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as MesureData),
    }));

    // Calculer les statistiques
    const calories_jour = todayMeals.reduce(
      (sum, meal) => sum + (meal.macros?.kcal || 0),
      0,
    );
    const proteines_jour = todayMeals.reduce(
      (sum, meal) => sum + (meal.macros?.prot || 0),
      0,
    );
    const calories_semaine = weekMeals.reduce(
      (sum, meal) => sum + (meal.macros?.kcal || 0),
      0,
    );
    const proteines_semaine = weekMeals.reduce(
      (sum, meal) => sum + (meal.macros?.prot || 0),
      0,
    );
    const calories_brulées_semaine = weekTrainings.reduce(
      (sum, training) => sum + (training.calories || 0),
      0,
    );

    // Calculer les variations
    let variation_poids = 0;
    let poids_actuel = 0;
    if (recentMeasures.length >= 2) {
      poids_actuel = recentMeasures[0].poids || 0;
      const poids_precedent = recentMeasures[1].poids || 0;
      variation_poids = poids_actuel - poids_precedent;
    } else if (recentMeasures.length === 1) {
      poids_actuel = recentMeasures[0].poids || 0;
    }

    // Calculer la variation de performance (basée sur les entraînements)
    let variation_perf = 0;
    if (weekTrainings.length > 0) {
      const totalDuration = weekTrainings.reduce(
        (sum, training) => sum + (training.duree || 0),
        0,
      );
      const totalCalories = weekTrainings.reduce(
        (sum, training) => sum + (training.calories || 0),
        0,
      );
      // Performance basée sur la durée et les calories brûlées
      variation_perf =
        Math.round((totalDuration / 60 + totalCalories / 100) * 10) / 10;
    }

    // Déterminer la dernière activité
    const lastMeal = todayMeals.length > 0 ? new Date() : null;
    const lastTraining =
      weekTrainings.length > 0 ? new Date(weekTrainings[0].date) : null;
    const lastMeasure =
      recentMeasures.length > 0 ? new Date(recentMeasures[0].date) : null;

    const derniere_activite = [lastMeal, lastTraining, lastMeasure]
      .filter(Boolean)
      .sort((a, b) => b!.getTime() - a!.getTime())[0];

    // Calculer les jours actifs de la semaine
    const uniqueDays = new Set(weekTrainings.map((training) => training.date))
      .size;
    const jours_actifs_semaine = uniqueDays;

    return {
      calories_jour: Math.round(calories_jour),
      proteines_jour: Math.round(proteines_jour),
      entrainements_semaine: weekTrainings.length,
      poids_actuel: Math.round(poids_actuel * 10) / 10,
      variation_poids: Math.round(variation_poids * 10) / 10,
      variation_perf: Math.round(variation_perf * 10) / 10,
      derniere_activite: derniere_activite || undefined,
      objectif_atteint: calories_jour >= 1800 && proteines_jour >= 120, // Objectifs par défaut
      repas_comptes_jour: todayMeals.length,
      calories_semaine: Math.round(calories_semaine),
      proteines_semaine: Math.round(proteines_semaine),
      entrainements_total: weekTrainings.length,
      calories_brulées_semaine: Math.round(calories_brulées_semaine),
      jours_actifs_semaine,
      dernier_entrainement: lastTraining || undefined,
      derniere_mesure: lastMeasure || undefined,
      dernier_repas: lastMeal || undefined,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Get athlete stats error:', error);
    }
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      calories_jour: 0,
      proteines_jour: 0,
      entrainements_semaine: 0,
      poids_actuel: 0,
      variation_poids: 0,
      variation_perf: 0,
      derniere_activite: new Date(),
      objectif_atteint: false,
      repas_comptes_jour: 0,
      calories_semaine: 0,
      proteines_semaine: 0,
      entrainements_total: 0,
      calories_brulées_semaine: 0,
      jours_actifs_semaine: 0,
    };
  }
}

// Fonction pour récupérer la progression d'un athlète
async function getAthleteProgression(athleteId: string): Promise<{
  poids: { date: string; poids: number }[];
  calories: { date: string; calories: number }[];
}> {
  try {
    // Récupérer les 30 dernières mesures
    const measuresQuery = query(
      collection(db, 'mesures'),
      where('user_id', '==', athleteId),
      orderBy('date', 'desc'),
      limit(30),
    );
    const measuresSnapshot = await getDocs(measuresQuery);
    const mesures = measuresSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as MesureData),
    }));

    // Récupérer les calories des 30 derniers jours
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const mealsQuery = query(
      collection(db, 'repas'),
      where('user_id', '==', athleteId),
      where('date', '>=', thirtyDaysAgo),
      orderBy('date', 'desc'),
    );
    const mealsSnapshot = await getDocs(mealsQuery);
    const repas = mealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as RepasData),
    }));

    // Grouper les calories par jour
    const caloriesParJour = repas.reduce(
      (acc, meal) => {
        const date = meal.date;
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += meal.macros?.kcal || 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      poids: mesures.map((mesure) => ({
        date: mesure.date,
        poids: mesure.poids || 0,
      })),
      calories: Object.entries(caloriesParJour).map(([date, calories]) => ({
        date,
        calories: Math.round(calories),
      })),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Get athlete progression error:', error);
    }
    return { poids: [], calories: [] };
  }
}

// Fonction pour récupérer l'activité récente d'un athlète
async function getAthleteRecentActivity(athleteId: string): Promise<
  {
    type: string;
    date: Date;
    description: string;
  }[]
> {
  try {
    const activities: { type: string; date: Date; description: string }[] = [];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Récupérer les repas récents
    const mealsQuery = query(
      collection(db, 'repas'),
      where('user_id', '==', athleteId),
      where('created_at', '>=', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('created_at', 'desc'),
      limit(10),
    );
    const mealsSnapshot = await getDocs(mealsQuery);
    mealsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      activities.push({
        type: 'repas',
        date: data.created_at?.toDate() || new Date(),
        description: `${data.repas} - ${data.macros?.kcal || 0} kcal`,
      });
    });

    // Récupérer les entraînements récents
    const trainingsQuery = query(
      collection(db, 'entrainements'),
      where('user_id', '==', athleteId),
      where('created_at', '>=', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('created_at', 'desc'),
      limit(10),
    );
    const trainingsSnapshot = await getDocs(trainingsQuery);
    trainingsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      activities.push({
        type: 'entrainement',
        date: data.created_at?.toDate() || new Date(),
        description: `${data.type} - ${data.duree || 0} min`,
      });
    });

    // Récupérer les mesures récentes
    const measuresQuery = query(
      collection(db, 'mesures'),
      where('user_id', '==', athleteId),
      where('created_at', '>=', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('created_at', 'desc'),
      limit(5),
    );
    const measuresSnapshot = await getDocs(measuresQuery);
    measuresSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      activities.push({
        type: 'mesure',
        date: data.created_at?.toDate() || new Date(),
        description: `Poids: ${data.poids || 0} kg`,
      });
    });

    // Trier par date décroissante et retourner les 15 plus récents
    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 15);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Get athlete recent activity error:', error);
    }
    return [];
  }
}

// Fonction pour récupérer les objectifs actuels d'un athlète
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAthleteCurrentGoals(_athleteId: string): Promise<
  {
    type: string;
    cible: number;
    actuel: number;
    pourcentage: number;
  }[]
> {
  try {
    // Pour l'instant, retourner des objectifs par défaut
    // TODO: Implémenter la récupération des vrais objectifs depuis Firestore
    return [
      {
        type: 'calories',
        cible: 2000,
        actuel: 0, // Sera mis à jour avec les vraies données
        pourcentage: 0,
      },
      {
        type: 'proteines',
        cible: 150,
        actuel: 0,
        pourcentage: 0,
      },
      {
        type: 'entrainements',
        cible: 4,
        actuel: 0,
        pourcentage: 0,
      },
    ];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Get athlete current goals error:', error);
    }
    return [];
  }
}

// Fonction pour générer des alertes basées sur les vraies données
function generateRealAlerts(athletes: RealAthlete[]): RealAlert[] {
  const alerts: RealAlert[] = [];

  athletes.forEach((athlete) => {
    if (!athlete.stats) return;

    const stats = athlete.stats;

    // Alerte si inactif > 3 jours
    if (stats.derniere_activite) {
      const daysSinceActivity = Math.floor(
        (Date.now() - stats.derniere_activite.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysSinceActivity > 3) {
        alerts.push({
          id: `inactive-${athlete.id}`,
          type: 'warning',
          title: 'Athlète inactif',
          message: `${athlete.nom} n'a pas été actif depuis ${daysSinceActivity} jours`,
          athleteId: athlete.id,
          athleteName: athlete.nom,
          timestamp: new Date(),
          severity: daysSinceActivity > 7 ? 'high' : 'medium',
          category: 'activity',
          action: {
            label: 'Envoyer un message',
            onClick: () => {
              // Action placeholder - to be implemented
            },
          },
        });
      }
    }

    // Alerte si objectif nutrition non atteint
    if (stats.calories_jour < 1500 || stats.proteines_jour < 100) {
      alerts.push({
        id: `nutrition-${athlete.id}`,
        type: 'info',
        title: 'Objectif nutrition non atteint',
        message: `${athlete.nom} n'a pas atteint ses objectifs nutritionnels aujourd'hui (${stats.calories_jour} kcal, ${stats.proteines_jour}g protéines)`,
        athleteId: athlete.id,
        athleteName: athlete.nom,
        timestamp: new Date(),
        severity: 'medium',
        category: 'nutrition',
        action: {
          label: 'Voir la nutrition',
          onClick: () => {
            // Action placeholder - to be implemented
          },
        },
      });
    }

    // Alerte si pas d'entraînement cette semaine
    if (stats.entrainements_semaine === 0) {
      alerts.push({
        id: `no-training-${athlete.id}`,
        type: 'warning',
        title: "Pas d'entraînement cette semaine",
        message: `${athlete.nom} n'a pas encore fait d'entraînement cette semaine`,
        athleteId: athlete.id,
        athleteName: athlete.nom,
        timestamp: new Date(),
        severity: 'medium',
        category: 'training',
        action: {
          label: 'Voir les entraînements',
          onClick: () => {
            // Action placeholder - to be implemented
          },
        },
      });
    }

    // Alerte si perte de poids importante
    if (stats.variation_poids < -2) {
      alerts.push({
        id: `weight-loss-${athlete.id}`,
        type: 'info',
        title: 'Perte de poids significative',
        message: `${athlete.nom} a perdu ${Math.abs(stats.variation_poids).toFixed(1)} kg récemment`,
        athleteId: athlete.id,
        athleteName: athlete.nom,
        timestamp: new Date(),
        severity: 'low',
        category: 'measurement',
        action: {
          label: 'Voir les mesures',
          onClick: () => {
            // Action placeholder - to be implemented
          },
        },
      });
    }
  });

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Fonction pour calculer les vraies statistiques d'équipe
function calculateRealTeamStats(athletes: RealAthlete[]): RealTeamStats {
  if (athletes.length === 0) {
    return {
      totalXP: 0,
      challengesCompleted: 0,
      totalWorkouts: 0,
      totalCalories: 0,
      averageProgress: 0,
      activeAthletes: 0,
      totalAthletes: 0,
      weeklyGoal: 0,
      monthlyGoal: 0,
      totalMealsTracked: 0,
      totalMeasurements: 0,
      averageCaloriesPerAthlete: 0,
      averageProteinsPerAthlete: 0,
      mostActiveAthlete: '',
      leastActiveAthlete: '',
      teamStreak: 0,
      completionRate: 0,
    };
  }

  const totalCalories = athletes.reduce(
    (sum, athlete) => sum + (athlete.stats?.calories_jour || 0),
    0,
  );
  const totalProteins = athletes.reduce(
    (sum, athlete) => sum + (athlete.stats?.proteines_jour || 0),
    0,
  );
  const totalWorkouts = athletes.reduce(
    (sum, athlete) => sum + (athlete.stats?.entrainements_semaine || 0),
    0,
  );
  const totalMeals = athletes.reduce(
    (sum, athlete) => sum + (athlete.stats?.repas_comptes_jour || 0),
    0,
  );

  // Calculer les athlètes actifs (activité dans les dernières 24h)
  const now = Date.now();
  const activeAthletes = athletes.filter((athlete) => {
    if (!athlete.stats?.derniere_activite) return false;
    const hoursSinceActivity =
      (now - athlete.stats.derniere_activite.getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity <= 24;
  }).length;

  // Trouver l'athlète le plus actif et le moins actif
  const athleteActivity = athletes
    .map((athlete) => ({
      name: athlete.nom,
      activity:
        (athlete.stats?.entrainements_semaine || 0) +
        (athlete.stats?.repas_comptes_jour || 0),
    }))
    .sort((a, b) => b.activity - a.activity);

  const mostActiveAthlete = athleteActivity[0]?.name || '';
  const leastActiveAthlete =
    athleteActivity[athleteActivity.length - 1]?.name || '';

  // Calculer le taux de complétion (objectifs atteints)
  const athletesWithGoals = athletes.filter(
    (athlete) => athlete.stats?.objectif_atteint,
  ).length;
  const completionRate = Math.round(
    (athletesWithGoals / athletes.length) * 100,
  );

  return {
    totalXP: totalWorkouts * 50 + totalMeals * 10, // Calcul simplifié
    challengesCompleted: athletesWithGoals,
    totalWorkouts,
    totalCalories,
    averageProgress: Math.round(totalCalories / athletes.length),
    activeAthletes,
    totalAthletes: athletes.length,
    weeklyGoal: athletes.length * 4, // 4 entraînements par athlète par semaine
    monthlyGoal: athletes.length * 8, // 8 challenges par athlète par mois
    totalMealsTracked: totalMeals,
    totalMeasurements: athletes.length, // Approximation
    averageCaloriesPerAthlete: Math.round(totalCalories / athletes.length),
    averageProteinsPerAthlete: Math.round(totalProteins / athletes.length),
    mostActiveAthlete,
    leastActiveAthlete,
    teamStreak: Math.min(activeAthletes, 7), // Streak basé sur les athlètes actifs
    completionRate,
  };
}
