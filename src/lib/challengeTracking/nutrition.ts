/**
 * Challenge Tracking - Nutrition
 *
 * Calculs de progression pour les challenges nutrition
 * Fonctions pures testables isolément
 *
 * @module challengeTracking/nutrition
 * @created 23.10.2025
 * @quality Pure functions - 100% testable
 */

import type { Repas, Mesure } from '@/types';
import { timestampToDateString } from '@/lib/dateUtils';
import { DateBounds, getTodayBounds, getWeekBounds, isDateInBounds, getDatesInBounds } from './utils';

/**
 * Calcule le nombre de repas aujourd'hui
 *
 * Pour challenge "Repas Complet" (3 repas/jour)
 *
 * @param repas - Tous les repas de l'utilisateur
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Nombre de repas aujourd'hui
 *
 * @example
 * ```typescript
 * const count = countTodayMeals(repas); // 3
 * ```
 */
export function countTodayMeals(repas: Repas[], referenceDate: Date = new Date()): number {
  const bounds = getTodayBounds(referenceDate);

  return repas.filter((meal) => {
    const mealDate = new Date(timestampToDateString(meal.date));
    return isDateInBounds(mealDate, bounds);
  }).length;
}

/**
 * Calcule le nombre de jours avec 3+ repas cette semaine
 *
 * Pour challenge "7 Jours de Nutrition Parfaite"
 *
 * @param repas - Tous les repas de l'utilisateur
 * @param minMealsPerDay - Minimum de repas par jour (défaut: 3)
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Nombre de jours avec 3+ repas
 *
 * @example
 * ```typescript
 * const perfectDays = countPerfectNutritionDays(repas, 3); // 5 jours
 * ```
 */
export function countPerfectNutritionDays(
  repas: Repas[],
  minMealsPerDay: number = 3,
  referenceDate: Date = new Date(),
): number {
  const bounds = getWeekBounds(referenceDate);
  const dates = getDatesInBounds(bounds);

  let perfectDays = 0;

  for (const date of dates) {
    const dayBounds = getTodayBounds(date);
    const dayMeals = repas.filter((meal) => {
      const mealDate = new Date(timestampToDateString(meal.date));
      return isDateInBounds(mealDate, dayBounds);
    });

    if (dayMeals.length >= minMealsPerDay) {
      perfectDays++;
    }
  }

  return perfectDays;
}

/**
 * Calcule le nombre de jours où l'objectif protéines est atteint cette semaine
 *
 * Pour challenge "Marathon des Protéines"
 *
 * @param repas - Tous les repas de l'utilisateur
 * @param proteinGoal - Objectif protéines en grammes
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Nombre de jours objectif atteint
 *
 * @example
 * ```typescript
 * const proteinDays = countProteinGoalDays(repas, 150); // 4 jours
 * ```
 */
export function countProteinGoalDays(
  repas: Repas[],
  proteinGoal: number,
  referenceDate: Date = new Date(),
): number {
  const bounds = getWeekBounds(referenceDate);
  const dates = getDatesInBounds(bounds);

  let goalDays = 0;

  for (const date of dates) {
    const dayBounds = getTodayBounds(date);
    const dayMeals = repas.filter((meal) => {
      const mealDate = new Date(timestampToDateString(meal.date));
      return isDateInBounds(mealDate, dayBounds);
    });

    const dayProteins = dayMeals.reduce(
      (total, meal) => total + (meal.macros?.prot || 0),
      0,
    );

    if (dayProteins >= proteinGoal) {
      goalDays++;
    }
  }

  return goalDays;
}

/**
 * Calcule l'objectif protéines basé sur le poids de l'utilisateur
 *
 * Formule: 1.6g par kg de poids corporel
 *
 * @param mesures - Toutes les mesures de l'utilisateur
 * @param defaultWeight - Poids par défaut si aucune mesure (défaut: 70kg)
 * @returns Objectif protéines en grammes
 *
 * @example
 * ```typescript
 * const goal = calculateProteinGoal(mesures); // 120g pour 75kg
 * ```
 */
export function calculateProteinGoal(mesures: Mesure[], defaultWeight: number = 70): number {
  // Trouver la mesure la plus récente avec un poids
  const latestWeight = mesures
    .filter((m) => m.poids && m.poids > 0)
    .sort((a, b) => {
      const dateA = new Date(timestampToDateString(a.date));
      const dateB = new Date(timestampToDateString(b.date));
      return dateB.getTime() - dateA.getTime();
    })[0];

  const weight = latestWeight?.poids || defaultWeight;
  return Math.round(weight * 1.6); // 1.6g/kg recommandé
}

