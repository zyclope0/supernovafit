/**
 * Challenge Tracking - Transformations Corporelles
 *
 * Calculs de progression pour les challenges de transformation physique
 * Fonctions pures testables isolément
 *
 * @module challengeTracking/transformations
 * @created 23.10.2025
 * @quality Pure functions - 100% testable
 */

import type { Mesure } from '@/types';
import { timestampToDateString } from '@/lib/dateUtils';
import { getMonthBounds, daysBetween } from './utils';

/**
 * Calcule la perte de poids sur le mois en cours
 *
 * Pour challenge "Transformation du Mois" (-2kg en 30 jours)
 *
 * @param mesures - Toutes les mesures de l'utilisateur
 * @param referenceDate - Date de référence (défaut: aujourd'hui)
 * @returns Perte de poids en kg (négatif = gain)
 *
 * @example
 * ```typescript
 * const loss = calculateMonthWeightLoss(mesures); // -2.5 kg
 * ```
 */
export function calculateMonthWeightLoss(
  mesures: Mesure[],
  referenceDate: Date = new Date(),
): number {
  const bounds = getMonthBounds(referenceDate);

  // Filtrer seulement les mesures avec poids du mois
  const monthMesures = mesures
    .filter((m) => {
      if (!m.poids || m.poids <= 0) return false;
      const mesureDate = new Date(timestampToDateString(m.date));
      return mesureDate >= bounds.start && mesureDate <= bounds.end;
    })
    .sort((a, b) => {
      const dateA = new Date(timestampToDateString(a.date));
      const dateB = new Date(timestampToDateString(b.date));
      return dateA.getTime() - dateB.getTime(); // Ordre croissant
    });

  if (monthMesures.length < 2) return 0; // Besoin de 2 mesures minimum

  const firstWeight = monthMesures[0].poids || 0;
  const lastWeight = monthMesures[monthMesures.length - 1].poids || 0;

  // Perte = poids_initial - poids_final (positif si perte)
  return Number((firstWeight - lastWeight).toFixed(2));
}

/**
 * Calcule la perte de poids sur une période personnalisée
 *
 * @param mesures - Toutes les mesures de l'utilisateur
 * @param startDate - Date de début
 * @param endDate - Date de fin
 * @returns Perte de poids en kg (négatif = gain)
 *
 * @example
 * ```typescript
 * const start = new Date('2025-10-01');
 * const end = new Date('2025-10-31');
 * const loss = calculateWeightLoss(mesures, start, end); // -1.8 kg
 * ```
 */
export function calculateWeightLoss(
  mesures: Mesure[],
  startDate: Date,
  endDate: Date,
): number {
  // Normaliser les dates à 00:00:00 pour comparaisons
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Filtrer seulement les mesures avec poids dans la période
  const periodMesures = mesures
    .filter((m) => {
      if (!m.poids || m.poids <= 0) return false;
      const mesureDate = new Date(timestampToDateString(m.date));
      mesureDate.setHours(12, 0, 0, 0); // Normaliser à 12:00:00
      return mesureDate >= start && mesureDate <= end;
    })
    .sort((a, b) => {
      const dateA = new Date(timestampToDateString(a.date));
      const dateB = new Date(timestampToDateString(b.date));
      return dateA.getTime() - dateB.getTime(); // Ordre croissant
    });

  if (periodMesures.length < 2) return 0; // Besoin de 2 mesures minimum

  const firstWeight = periodMesures[0].poids || 0;
  const lastWeight = periodMesures[periodMesures.length - 1].poids || 0;

  // Perte = poids_initial - poids_final (positif si perte)
  return Number((firstWeight - lastWeight).toFixed(2));
}

/**
 * Calcule le pourcentage de progression vers un objectif de perte de poids
 *
 * @param mesures - Toutes les mesures de l'utilisateur
 * @param targetLoss - Objectif de perte en kg (positif)
 * @param startDate - Date de début
 * @param endDate - Date de fin
 * @returns Pourcentage de progression (0-100+)
 *
 * @example
 * ```typescript
 * const progress = calculateWeightLossProgress(mesures, 2.0, startDate, endDate);
 * // Perdu 1.5kg sur 2kg objectif → 75%
 * ```
 */
export function calculateWeightLossProgress(
  mesures: Mesure[],
  targetLoss: number,
  startDate: Date,
  endDate: Date,
): number {
  const actualLoss = calculateWeightLoss(mesures, startDate, endDate);

  if (targetLoss <= 0) return 0;

  const progress = (actualLoss / targetLoss) * 100;
  return Math.max(0, Math.min(100, Math.round(progress))); // Clamp 0-100
}

/**
 * Vérifie si l'utilisateur a atteint son objectif de perte de poids
 *
 * @param mesures - Toutes les mesures de l'utilisateur
 * @param targetLoss - Objectif de perte en kg (positif)
 * @param startDate - Date de début
 * @param endDate - Date de fin
 * @returns True si objectif atteint
 *
 * @example
 * ```typescript
 * const achieved = hasAchievedWeightLossGoal(mesures, 2.0, startDate, endDate);
 * // Perdu 2.3kg sur 2kg objectif → true
 * ```
 */
export function hasAchievedWeightLossGoal(
  mesures: Mesure[],
  targetLoss: number,
  startDate: Date,
  endDate: Date,
): boolean {
  const actualLoss = calculateWeightLoss(mesures, startDate, endDate);
  return actualLoss >= targetLoss;
}

/**
 * Calcule la vitesse moyenne de perte de poids (kg/semaine)
 *
 * @param mesures - Toutes les mesures de l'utilisateur
 * @param startDate - Date de début
 * @param endDate - Date de fin
 * @returns Vitesse en kg/semaine
 *
 * @example
 * ```typescript
 * const rate = calculateWeightLossRate(mesures, startDate, endDate);
 * // -2kg en 4 semaines → 0.5 kg/semaine
 * ```
 */
export function calculateWeightLossRate(
  mesures: Mesure[],
  startDate: Date,
  endDate: Date,
): number {
  const loss = calculateWeightLoss(mesures, startDate, endDate);
  const days = daysBetween(startDate, endDate);

  if (days < 7) return 0; // Minimum 1 semaine

  const weeks = days / 7;
  return Number((loss / weeks).toFixed(2));
}
