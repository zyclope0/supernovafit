/**
 * Challenge Tracking - Training
 *
 * Calculs de progression pour les challenges entraînement
 * Fonctions pures testables isolément
 *
 * @module challengeTracking/training
 * @created 23.10.2025
 * @quality Pure functions - 100% testable
 */

import type { Entrainement } from '@/types';
import { timestampToDateString } from '@/lib/dateUtils';
import type { DateBounds } from './utils';
import {
  getTodayBounds,
  getWeekBounds,
  isDateInBounds,
  daysBetween,
} from './utils';

/**
 * Calcule le nombre d'entraînements aujourd'hui
 *
 * Pour challenge "5 Workouts par Semaine"
 *
 * @param entrainements - Tous les entraînements
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Nombre d'entraînements aujourd'hui
 *
 * @example
 * ```typescript
 * const count = countTodayTrainings(entrainements); // 2
 * ```
 */
export function countTodayTrainings(
  entrainements: Entrainement[],
  referenceDate: Date = new Date(),
): number {
  const bounds = getTodayBounds(referenceDate);

  return entrainements.filter((training) => {
    const trainingDate = new Date(timestampToDateString(training.date));
    return isDateInBounds(trainingDate, bounds);
  }).length;
}

/**
 * Calcule le nombre d'entraînements cette semaine
 *
 * Pour challenge "5 Workouts par Semaine"
 *
 * @param entrainements - Tous les entraînements
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Nombre d'entraînements cette semaine
 *
 * @example
 * ```typescript
 * const count = countWeekTrainings(entrainements); // 5
 * ```
 */
export function countWeekTrainings(
  entrainements: Entrainement[],
  referenceDate: Date = new Date(),
): number {
  const bounds = getWeekBounds(referenceDate);

  return entrainements.filter((training) => {
    const trainingDate = new Date(timestampToDateString(training.date));
    return isDateInBounds(trainingDate, bounds);
  }).length;
}

/**
 * Calcule le temps total d'entraînement cette semaine (en minutes)
 *
 * Pour challenge "10h d'Entraînement en un Mois"
 *
 * @param entrainements - Tous les entraînements
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Temps total en minutes
 *
 * @example
 * ```typescript
 * const minutes = calculateWeekTrainingTime(entrainements); // 300 minutes (5h)
 * ```
 */
export function calculateWeekTrainingTime(
  entrainements: Entrainement[],
  referenceDate: Date = new Date(),
): number {
  const bounds = getWeekBounds(referenceDate);

  return entrainements
    .filter((training) => {
      const trainingDate = new Date(timestampToDateString(training.date));
      return isDateInBounds(trainingDate, bounds);
    })
    .reduce((total, training) => total + (training.duree || 0), 0);
}

/**
 * Calcule le volume total d'entraînement cette semaine (séries × reps × poids)
 *
 * Pour challenge "Volume Monstre" (50,000 kg en une semaine)
 *
 * @param entrainements - Tous les entraînements
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Volume total en kg
 *
 * @example
 * ```typescript
 * const volume = calculateWeekTrainingVolume(entrainements); // 35,000 kg
 * ```
 */
export function calculateWeekTrainingVolume(
  entrainements: Entrainement[],
  referenceDate: Date = new Date(),
): number {
  const bounds = getWeekBounds(referenceDate);

  return entrainements
    .filter((training) => {
      const trainingDate = new Date(timestampToDateString(training.date));
      return (
        isDateInBounds(trainingDate, bounds) && training.type === 'musculation'
      );
    })
    .reduce((total, training) => {
      const exerciceVolume = (training.exercices || []).reduce((sum, ex) => {
        const exVolume = (ex.series || []).reduce((seriesSum, serie) => {
          const reps = serie.reps || 0;
          const poids = serie.poids || 0;
          return seriesSum + reps * poids;
        }, 0);
        return sum + exVolume;
      }, 0);
      return total + exerciceVolume;
    }, 0);
}

/**
 * Calcule le nombre de jours consécutifs avec au moins 1 entraînement
 *
 * Pour challenge "Warrior Streak" (30 jours consécutifs)
 *
 * @param entrainements - Tous les entraînements (triés par date)
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Nombre de jours consécutifs
 *
 * @example
 * ```typescript
 * const streak = calculateTrainingStreak(entrainements); // 15 jours
 * ```
 */
export function calculateTrainingStreak(
  entrainements: Entrainement[],
  referenceDate: Date = new Date(),
): number {
  if (entrainements.length === 0) return 0;

  // Trier les entraînements par date (plus récent en premier)
  const sorted = [...entrainements].sort((a, b) => {
    const dateA = new Date(timestampToDateString(a.date));
    const dateB = new Date(timestampToDateString(b.date));
    return dateB.getTime() - dateA.getTime();
  });

  // Obtenir les dates uniques d'entraînement
  const uniqueDates: Date[] = [];
  const seenDateStrings = new Set<string>();

  for (const training of sorted) {
    const dateStr = timestampToDateString(training.date);
    if (!seenDateStrings.has(dateStr)) {
      seenDateStrings.add(dateStr);
      uniqueDates.push(new Date(dateStr));
    }
  }

  if (uniqueDates.length === 0) return 0;

  // Vérifier si l'utilisateur a entraîné aujourd'hui ou hier
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const latestDate = uniqueDates[0];
  latestDate.setHours(0, 0, 0, 0);

  const daysSinceLatest = daysBetween(latestDate, today);

  // Si le dernier entraînement est > 1 jour, la streak est cassée
  if (daysSinceLatest > 1) {
    return 0;
  }

  // Compter la streak
  let streak = 1;
  let currentDate = new Date(latestDate);

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = uniqueDates[i];
    prevDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);

    if (prevDate.getTime() === expectedDate.getTime()) {
      streak++;
      currentDate = prevDate;
    } else {
      break; // Streak cassée
    }
  }

  return streak;
}

/**
 * Filtre les entraînements cardio dans une période
 *
 * @param entrainements - Tous les entraînements
 * @param bounds - Période à filtrer
 * @returns Entraînements cardio filtrés
 */
export function filterCardioTrainings(
  entrainements: Entrainement[],
  bounds: DateBounds,
): Entrainement[] {
  return entrainements.filter((training) => {
    const trainingDate = new Date(timestampToDateString(training.date));
    return isDateInBounds(trainingDate, bounds) && training.type === 'cardio';
  });
}

/**
 * Filtre les entraînements musculation dans une période
 *
 * @param entrainements - Tous les entraînements
 * @param bounds - Période à filtrer
 * @returns Entraînements musculation filtrés
 */
export function filterStrengthTrainings(
  entrainements: Entrainement[],
  bounds: DateBounds,
): Entrainement[] {
  return entrainements.filter((training) => {
    const trainingDate = new Date(timestampToDateString(training.date));
    return (
      isDateInBounds(trainingDate, bounds) && training.type === 'musculation'
    );
  });
}
