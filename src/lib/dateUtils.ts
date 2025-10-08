/**
 * Utilitaires pour la conversion des dates
 * Centralise la conversion entre string et Timestamp Firestore
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Convertit une date string (YYYY-MM-DD) en Timestamp Firestore
 * @param dateString - Date au format string YYYY-MM-DD
 * @returns Timestamp Firestore
 */
export function dateToTimestamp(dateString: string | undefined): Timestamp {
  if (!dateString) {
    return Timestamp.now();
  }

  // Parse la date string et ajoute l'heure locale (midi pour éviter les problèmes de timezone)
  const date = new Date(dateString + 'T12:00:00');

  // Vérifier que la date est valide
  if (isNaN(date.getTime())) {
    console.warn(
      `Date invalide: ${dateString}, utilisation de la date actuelle`,
    );
    return Timestamp.now();
  }

  return Timestamp.fromDate(date);
}

/**
 * Convertit un Timestamp Firestore en string date (YYYY-MM-DD)
 * @param timestamp - Timestamp Firestore
 * @returns Date au format string YYYY-MM-DD
 */
export function timestampToDateString(
  timestamp: Timestamp | string | undefined,
): string {
  if (!timestamp) {
    return new Date().toISOString().split('T')[0];
  }

  // Si c'est déjà une string, la retourner
  if (typeof timestamp === 'string') {
    return timestamp;
  }

  // Convertir le Timestamp en Date
  const date = timestamp.toDate();

  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    console.warn('Invalid Timestamp detected:', timestamp);
    return new Date().toISOString().split('T')[0];
  }

  // Formater en YYYY-MM-DD
  return date.toISOString().split('T')[0];
}

/**
 * Vérifie si une valeur est un Timestamp Firestore
 * @param value - Valeur à vérifier
 * @returns true si c'est un Timestamp
 */
export function isTimestamp(value: unknown): value is Timestamp {
  return (
    value instanceof Timestamp ||
    (!!value &&
      typeof value === 'object' &&
      'toDate' in value &&
      'seconds' in value &&
      typeof (value as Record<string, unknown>).toDate === 'function' &&
      typeof (value as Record<string, unknown>).seconds === 'number')
  );
}

/**
 * Fonction de comparaison pour trier par date (Timestamp ou string)
 * Utiliser avec Array.sort()
 * @param order 'desc' pour plus récent en premier, 'asc' pour plus ancien en premier
 * @example
 * entrainements.sort(compareDates('desc')) // Plus récent en premier
 * mesures.sort(compareDates('asc')) // Plus ancien en premier
 */
export function compareDates<
  T extends { date: Timestamp | string | undefined },
>(order: 'asc' | 'desc' = 'desc') {
  return (a: T, b: T) => {
    try {
      const dateA = timestampToDateString(a.date);
      const dateB = timestampToDateString(b.date);

      // Vérifier que les dates sont valides
      if (dateA === 'Invalid Date' || dateB === 'Invalid Date') {
        console.warn('Invalid date in comparison:', { dateA, dateB, a, b });
        return 0;
      }

      return order === 'desc'
        ? dateB.localeCompare(dateA)
        : dateA.localeCompare(dateB);
    } catch (error) {
      console.error('Error in compareDates:', error, { a, b });
      return 0;
    }
  };
}
