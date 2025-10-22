/**
 * Chart Data Transformers - Pure Functions
 *
 * Ce module contient des fonctions pures pour transformer les données Firestore
 * en données compatibles avec Recharts. L'extraction de cette logique permet:
 * - Un coverage de code réel (80%+ vs 0% avec mocks Recharts)
 * - Des tests unitaires rapides (pas de render React)
 * - Code réutilisable dans différents contextes
 * - Maintenance simplifiée (logique métier isolée)
 *
 * @module chartDataTransformers
 */

import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { timestampToDateString } from './dateUtils';
import type { Mesure, Entrainement } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface MesuresChartData {
  date: string; // ISO string (YYYY-MM-DD)
  poids: number | null;
  imc: number | null;
  masse_grasse: number | null;
  masse_musculaire: number | null;
  tour_taille: number | null;
  tour_hanches: number | null;
  tour_bras: number | null;
  tour_cuisses: number | null;
  tour_cou: number | null;
  tour_poitrine: number | null;
}

export interface MesuresDomains {
  weight: [number, number];
  imc: [number, number];
  composition: [number, number];
  mensurations: [number, number];
}

export interface MesuresChartResult {
  data: MesuresChartData[];
  domains: MesuresDomains;
}

export interface HeartRateChartData {
  date: string; // ISO string (YYYY-MM-DD)
  fc_moyenne: number | null;
  fc_max: number | null;
  fc_min: number | null;
  type: 'cardio' | 'musculation';
}

export interface PerformanceChartData {
  date: string; // ISO string (YYYY-MM-DD)
  type: 'cardio' | 'musculation';
  duree: number;
  fc_moyenne?: number;
  vitesse?: number;
  distance?: number;
  calories_per_min: number | null;
  value: number; // Valeur de la métrique sélectionnée
}

export interface TrainingVolumeChartData {
  week: string; // "S42" format
  fullDate: string; // "21/10" format
  seances: number;
  duree: number; // minutes
  calories: number;
}

// ============================================================================
// MESURES CHARTS DATA
// ============================================================================

/**
 * Prépare les données des mesures pour les graphiques Recharts
 *
 * @param mesures - Liste des mesures Firestore
 * @returns Données formatées + domains motivationnels
 *
 * @example
 * ```ts
 * const { data, domains } = prepareMesuresChartData(mesures);
 * <LineChart data={data}>
 *   <YAxis domain={domains.weight} />
 * </LineChart>
 * ```
 */
export function prepareMesuresChartData(mesures: Mesure[]): MesuresChartResult {
  // Filtrer et transformer les données
  const data = mesures
    .filter((m) => m.date) // ⚠️ Filtrer mesures sans date
    .slice()
    .reverse() // Du plus ancien au plus récent
    .map((mesure): MesuresChartData | null => {
      // ⚠️ CRITIQUE: Convertir Timestamp → String ISO
      const dateStr = timestampToDateString(mesure.date);

      // ⚠️ Valider la date convertie
      if (isNaN(new Date(dateStr).getTime())) {
        console.warn('Invalid date in prepareMesuresChartData:', {
          original: mesure.date,
          converted: dateStr,
        });
        return null;
      }

      return {
        date: dateStr, // ✅ String ISO (YYYY-MM-DD)
        poids: mesure.poids ?? null,
        imc: mesure.imc ?? null,
        masse_grasse: mesure.masse_grasse ?? null,
        masse_musculaire: mesure.masse_musculaire ?? null,
        tour_taille: mesure.tour_taille ?? null,
        tour_hanches: mesure.tour_hanches ?? null,
        tour_bras: mesure.tour_bras ?? null,
        tour_cuisses: mesure.tour_cuisses ?? null,
        tour_cou: mesure.tour_cou ?? null,
        tour_poitrine: mesure.tour_poitrine ?? null,
      };
    })
    .filter((d): d is MesuresChartData => d !== null); // ⚠️ Filtrer dates invalides

  // Calculer domains motivationnels
  const domains = calculateMesuresDomains(data);

  return { data, domains };
}

/**
 * Calcule les domains motivationnels pour les graphiques de mesures
 * @internal
 */
function calculateMesuresDomains(data: MesuresChartData[]): MesuresDomains {
  const weights = data.map((d) => d.poids).filter(Boolean) as number[];
  const imcs = data.map((d) => d.imc).filter(Boolean) as number[];
  const masseGrasse = data
    .map((d) => d.masse_grasse)
    .filter(Boolean) as number[];
  const masseMusculaire = data
    .map((d) => d.masse_musculaire)
    .filter(Boolean) as number[];
  const tourTaille = data.map((d) => d.tour_taille).filter(Boolean) as number[];
  const tourHanches = data
    .map((d) => d.tour_hanches)
    .filter(Boolean) as number[];
  const tourBras = data.map((d) => d.tour_bras).filter(Boolean) as number[];
  const tourCuisses = data
    .map((d) => d.tour_cuisses)
    .filter(Boolean) as number[];

  return {
    weight: getMotivationalDomain(weights, true),
    imc: getMotivationalDomain(imcs, true),
    composition: [
      0,
      Math.max(50, Math.max(...masseGrasse, ...masseMusculaire, 0) + 5),
    ],
    mensurations: getMotivationalDomain(
      [...tourTaille, ...tourHanches, ...tourBras, ...tourCuisses],
      true,
    ),
  };
}

/**
 * Calcule un domain "motivationnel" pour un graphique
 * @internal
 *
 * @param values - Valeurs numériques
 * @param isLossGood - Si true, focus sur les pertes (poids, tour de taille)
 *                     Si false, focus sur les gains (masse musculaire)
 * @returns Tuple [min, max] pour le domain
 */
function getMotivationalDomain(
  values: number[],
  isLossGood = true,
): [number, number] {
  if (values.length === 0) return [0, 100];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (isLossGood) {
    // Pour poids, tour de taille, etc. : Focus sur les pertes
    return [
      Math.max(0, min - Math.max(2, range * 0.3)), // Plus d'espace en bas
      max + Math.max(1, range * 0.1), // Moins d'espace en haut
    ];
  } else {
    // Pour masse musculaire : Focus sur les gains
    return [
      Math.max(0, min - Math.max(1, range * 0.1)), // Moins d'espace en bas
      max + Math.max(2, range * 0.3), // Plus d'espace en haut
    ];
  }
}

// ============================================================================
// HEART RATE CHART DATA
// ============================================================================

/**
 * Prépare les données de fréquence cardiaque pour Recharts
 *
 * @param entrainements - Liste des entraînements Firestore
 * @returns Données FC triées par date (ancien → récent)
 *
 * @example
 * ```ts
 * const hrData = prepareHeartRateChartData(entrainements);
 * <AreaChart data={hrData}>
 *   <Area dataKey="fc_moyenne" />
 * </AreaChart>
 * ```
 */
export function prepareHeartRateChartData(
  entrainements: Entrainement[],
): HeartRateChartData[] {
  return (
    entrainements
      // Filtrer seulement entraînements avec données FC
      .filter((e) => e.date && (e.fc_moyenne || e.fc_max || e.fc_min))
      .map((e): HeartRateChartData | null => {
        const dateStr = timestampToDateString(e.date);

        // ✅ Vérifier que la date convertie est valide
        if (isNaN(new Date(dateStr).getTime())) {
          console.warn('Invalid date in prepareHeartRateChartData:', {
            original: e.date,
            converted: dateStr,
          });
          return null;
        }

        return {
          date: dateStr, // ✅ String ISO
          fc_moyenne: e.fc_moyenne ?? null,
          fc_max: e.fc_max ?? null,
          fc_min: e.fc_min ?? null,
          type: e.type,
        };
      })
      .filter((d): d is HeartRateChartData => d !== null) // ✅ Filtrer dates invalides
      // Trier par date (ancien → récent)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  );
}

// ============================================================================
// PERFORMANCE CHART DATA
// ============================================================================

/**
 * Prépare les données de performance pour Recharts
 *
 * @param entrainements - Liste des entraînements Firestore
 * @param metric - Métrique à afficher ('vitesse', 'distance', 'calories_per_min')
 * @returns Données de performance triées par date
 *
 * @example
 * ```ts
 * const perfData = preparePerformanceChartData(entrainements, 'vitesse');
 * <LineChart data={perfData}>
 *   <Line dataKey="value" />
 * </LineChart>
 * ```
 */
export function preparePerformanceChartData(
  entrainements: Entrainement[],
  metric: 'vitesse' | 'calories_per_min' | 'distance',
): PerformanceChartData[] {
  return (
    entrainements
      // Filtrer selon la métrique
      .filter((e) => {
        if (!e.date) return false;

        switch (metric) {
          case 'vitesse':
            return e.vitesse_moy && e.vitesse_moy > 0;
          case 'calories_per_min':
            return e.calories && e.calories > 0 && e.duree > 0;
          case 'distance':
            return e.distance && e.distance > 0;
          default:
            return false;
        }
      })
      .map((e): PerformanceChartData | null => {
        const dateStr = timestampToDateString(e.date);

        // ✅ Vérifier date valide
        if (isNaN(new Date(dateStr).getTime())) {
          console.warn('Invalid date in preparePerformanceChartData:', {
            original: e.date,
            converted: dateStr,
          });
          return null;
        }

        // Calculer calories/min si nécessaire
        const caloriesPerMin =
          e.calories && e.duree > 0
            ? Math.round((e.calories / e.duree) * 10) / 10
            : null;

        // Déterminer la valeur selon la métrique
        const value =
          metric === 'vitesse'
            ? e.vitesse_moy
            : metric === 'calories_per_min'
              ? caloriesPerMin
              : metric === 'distance'
                ? e.distance
                : 0;

        return {
          date: dateStr,
          type: e.type,
          duree: e.duree,
          fc_moyenne: e.fc_moyenne,
          vitesse: e.vitesse_moy,
          distance: e.distance,
          calories_per_min: caloriesPerMin,
          value: value ?? 0,
        };
      })
      .filter((d): d is PerformanceChartData => d !== null)
      // Filtrer valeurs nulles/invalides
      .filter(
        (d) => d.value != null && typeof d.value === 'number' && d.value > 0,
      )
      // Trier par date
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  );
}

// ============================================================================
// TRAINING VOLUME CHART DATA
// ============================================================================

/**
 * Prépare les données de volume d'entraînement par semaine
 *
 * @param entrainements - Liste des entraînements Firestore
 * @param weeks - Nombre de semaines à afficher
 * @returns Données hebdomadaires agrégées (séances, durée, calories)
 *
 * @example
 * ```ts
 * const volumeData = prepareTrainingVolumeData(entrainements, 12);
 * <ComposedChart data={volumeData}>
 *   <Bar dataKey="duree" />
 *   <Line dataKey="calories" />
 * </ComposedChart>
 * ```
 */
export function prepareTrainingVolumeData(
  entrainements: Entrainement[],
  weeks: number,
): TrainingVolumeChartData[] {
  const data: TrainingVolumeChartData[] = [];
  const today = new Date();

  // Générer les données pour les X dernières semaines
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 }); // Lundi
    const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 }); // Dimanche

    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

    // Filtrer les entraînements de cette semaine
    const weekTrainings = entrainements.filter((e) => {
      if (!e.date) return false; // ✅ Vérifier date valide
      const dateStr = timestampToDateString(e.date);
      return dateStr >= weekStartStr && dateStr <= weekEndStr;
    });

    const totalDuration = weekTrainings.reduce((sum, e) => sum + e.duree, 0);
    const totalCalories = weekTrainings.reduce(
      (sum, e) => sum + (e.calories || 0),
      0,
    );

    data.push({
      week: format(weekStart, "'S'w", { locale: fr }), // "S42"
      fullDate: format(weekStart, 'dd/MM', { locale: fr }), // "21/10"
      seances: weekTrainings.length,
      duree: totalDuration,
      calories: totalCalories,
    });
  }

  return data;
}

// ============================================================================
// HELPER: CALCULATE AVERAGE DURATION
// ============================================================================

/**
 * Calcule la durée moyenne d'entraînement par semaine
 *
 * @param volumeData - Données de volume d'entraînement
 * @returns Durée moyenne en minutes (arrondie)
 */
export function calculateAverageDuration(
  volumeData: TrainingVolumeChartData[],
): number {
  if (volumeData.length === 0) return 0;
  const total = volumeData.reduce((sum, d) => sum + d.duree, 0);
  return Math.round(total / volumeData.length);
}
