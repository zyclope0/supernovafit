/**
 * Challenge Tracking - Tracking & Mesures
 *
 * Calculs de progression pour les challenges de suivi et mesures
 * Fonctions pures testables isolément
 *
 * @module challengeTracking/tracking
 * @created 23.10.2025
 * @quality Pure functions - 100% testable
 */

import type { Mesure, JournalEntry } from '@/types';
import { timestampToDateString } from '@/lib/dateUtils';
import {
  getTodayBounds,
  getWeekBounds,
  isDateInBounds,
  getDatesInBounds,
  daysBetween,
} from './utils';

/**
 * Calcule le nombre de jours avec pesée cette semaine
 *
 * Pour challenge "Pesée Quotidienne"
 *
 * @param mesures - Toutes les mesures
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Nombre de jours avec pesée
 *
 * @example
 * ```typescript
 * const days = countWeekWeighIns(mesures); // 6 jours
 * ```
 */
export function countWeekWeighIns(
  mesures: Mesure[],
  referenceDate: Date = new Date(),
): number {
  const bounds = getWeekBounds(referenceDate);
  const dates = getDatesInBounds(bounds);

  let weighInDays = 0;

  for (const date of dates) {
    const dayBounds = getTodayBounds(date);
    const hasWeighIn = mesures.some((mesure) => {
      const mesureDate = new Date(timestampToDateString(mesure.date));
      return (
        isDateInBounds(mesureDate, dayBounds) &&
        mesure.poids &&
        mesure.poids > 0
      );
    });

    if (hasWeighIn) {
      weighInDays++;
    }
  }

  return weighInDays;
}

/**
 * Calcule le nombre de jours avec entrée journal cette semaine
 *
 * Pour challenge "Journal Quotidien"
 *
 * @param entries - Toutes les entrées journal
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Nombre de jours avec journal
 *
 * @example
 * ```typescript
 * const days = countWeekJournalEntries(entries); // 7 jours
 * ```
 */
export function countWeekJournalEntries(
  entries: JournalEntry[],
  referenceDate: Date = new Date(),
): number {
  const bounds = getWeekBounds(referenceDate);
  const dates = getDatesInBounds(bounds);

  let journalDays = 0;

  for (const date of dates) {
    const dayBounds = getTodayBounds(date);
    const hasEntry = entries.some((entry) => {
      const entryDate = new Date(timestampToDateString(entry.date));
      return isDateInBounds(entryDate, dayBounds);
    });

    if (hasEntry) {
      journalDays++;
    }
  }

  return journalDays;
}

/**
 * Calcule le nombre de jours consécutifs avec pesée
 *
 * Pour challenge "Pesée Quotidienne" (streak)
 *
 * @param mesures - Toutes les mesures (triées par date)
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Nombre de jours consécutifs
 *
 * @example
 * ```typescript
 * const streak = calculateWeighInStreak(mesures); // 20 jours
 * ```
 */
export function calculateWeighInStreak(
  mesures: Mesure[],
  referenceDate: Date = new Date(),
): number {
  if (mesures.length === 0) return 0;

  // Filtrer seulement les mesures avec poids
  const validMesures = mesures.filter((m) => m.poids && m.poids > 0);
  if (validMesures.length === 0) return 0;

  // Trier par date (plus récent en premier)
  const sorted = [...validMesures].sort((a, b) => {
    const dateA = new Date(timestampToDateString(a.date));
    const dateB = new Date(timestampToDateString(b.date));
    return dateB.getTime() - dateA.getTime();
  });

  // Obtenir les dates uniques
  const uniqueDates: Date[] = [];
  const seenDateStrings = new Set<string>();

  for (const mesure of sorted) {
    const dateStr = timestampToDateString(mesure.date);
    if (!seenDateStrings.has(dateStr)) {
      seenDateStrings.add(dateStr);
      uniqueDates.push(new Date(dateStr));
    }
  }

  if (uniqueDates.length === 0) return 0;

  // Vérifier si pesée aujourd'hui ou hier
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const latestDate = uniqueDates[0];
  latestDate.setHours(0, 0, 0, 0);

  const daysSinceLatest = daysBetween(latestDate, today);

  // Si la dernière pesée > 1 jour, streak cassée
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
 * Calcule le nombre de jours consécutifs avec entrée journal
 *
 * Pour challenge "Journal Quotidien" (streak)
 *
 * @param entries - Toutes les entrées journal (triées par date)
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Nombre de jours consécutifs
 *
 * @example
 * ```typescript
 * const streak = calculateJournalStreak(entries); // 15 jours
 * ```
 */
export function calculateJournalStreak(
  entries: JournalEntry[],
  referenceDate: Date = new Date(),
): number {
  if (entries.length === 0) return 0;

  // Trier par date (plus récent en premier)
  const sorted = [...entries].sort((a, b) => {
    const dateA = new Date(timestampToDateString(a.date));
    const dateB = new Date(timestampToDateString(b.date));
    return dateB.getTime() - dateA.getTime();
  });

  // Obtenir les dates uniques
  const uniqueDates: Date[] = [];
  const seenDateStrings = new Set<string>();

  for (const entry of sorted) {
    const dateStr = timestampToDateString(entry.date);
    if (!seenDateStrings.has(dateStr)) {
      seenDateStrings.add(dateStr);
      uniqueDates.push(new Date(dateStr));
    }
  }

  if (uniqueDates.length === 0) return 0;

  // Vérifier si entrée aujourd'hui ou hier
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const latestDate = uniqueDates[0];
  latestDate.setHours(0, 0, 0, 0);

  const daysSinceLatest = daysBetween(latestDate, today);

  // Si la dernière entrée > 1 jour, streak cassée
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
 * Vérifie si l'utilisateur a fait une pesée aujourd'hui
 *
 * @param mesures - Toutes les mesures
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns True si pesée aujourd'hui
 */
export function hasTodayWeighIn(
  mesures: Mesure[],
  referenceDate: Date = new Date(),
): boolean {
  const bounds = getTodayBounds(referenceDate);

  return mesures.some((mesure) => {
    const mesureDate = new Date(timestampToDateString(mesure.date));
    return (
      isDateInBounds(mesureDate, bounds) && mesure.poids && mesure.poids > 0
    );
  });
}

/**
 * Vérifie si l'utilisateur a fait une entrée journal aujourd'hui
 *
 * @param entries - Toutes les entrées journal
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns True si entrée aujourd'hui
 */
export function hasTodayJournalEntry(
  entries: JournalEntry[],
  referenceDate: Date = new Date(),
): boolean {
  const bounds = getTodayBounds(referenceDate);

  return entries.some((entry) => {
    const entryDate = new Date(timestampToDateString(entry.date));
    return isDateInBounds(entryDate, bounds);
  });
}
