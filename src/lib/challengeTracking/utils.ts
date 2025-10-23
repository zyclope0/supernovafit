/**
 * Challenge Tracking Utilities
 *
 * Fonctions utilitaires pour le calcul de bornes temporelles
 * utilisées dans le tracking des challenges
 *
 * @module challengeTracking/utils
 * @created 23.10.2025
 * @quality Pure functions - 100% testable
 */

/**
 * Interface pour les bornes temporelles
 */
export interface DateBounds {
  start: Date;
  end: Date;
}

/**
 * Calcule le début et la fin de la semaine courante
 *
 * Semaine = Lundi 00:00:00 → Dimanche 23:59:59
 *
 * @param date - Date de référence (défaut: maintenant)
 * @returns { start, end } - Bornes de la semaine
 *
 * @example
 * ```typescript
 * const { start, end } = getWeekBounds();
 * // start: Lundi 00:00:00
 * // end: Dimanche 23:59:59
 * ```
 */
export function getWeekBounds(date: Date = new Date()): DateBounds {
  const now = new Date(date);
  const dayOfWeek = now.getDay();

  // Calcul jours à soustraire (Dimanche = 0 → 6 jours, Lundi = 1 → 0 jours)
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Début de semaine (Lundi 00:00:00)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);

  // Fin de semaine (Dimanche 23:59:59)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    start: startOfWeek,
    end: endOfWeek,
  };
}

/**
 * Calcule le début et la fin du jour courant
 *
 * @param date - Date de référence (défaut: maintenant)
 * @returns { start, end } - Bornes du jour
 *
 * @example
 * ```typescript
 * const { start, end } = getTodayBounds();
 * // start: Aujourd'hui 00:00:00
 * // end: Aujourd'hui 23:59:59
 * ```
 */
export function getTodayBounds(date: Date = new Date()): DateBounds {
  const now = new Date(date);

  // Début du jour (00:00:00)
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  // Fin du jour (23:59:59.999)
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    start: startOfDay,
    end: endOfDay,
  };
}

/**
 * Calcule le début et la fin du mois courant
 *
 * @param date - Date de référence (défaut: maintenant)
 * @returns { start, end } - Bornes du mois
 *
 * @example
 * ```typescript
 * const { start, end } = getMonthBounds();
 * // start: 1er du mois 00:00:00
 * // end: Dernier jour 23:59:59
 * ```
 */
export function getMonthBounds(date: Date = new Date()): DateBounds {
  const now = new Date(date);

  // Début du mois (1er jour à 00:00:00)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Fin du mois (dernier jour à 23:59:59)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return {
    start: startOfMonth,
    end: endOfMonth,
  };
}

/**
 * Calcule les bornes pour N semaines en arrière
 *
 * @param weeksBack - Nombre de semaines à remonter (1-52)
 * @param referenceDate - Date de référence (défaut: maintenant)
 * @returns { start, end } - Bornes de la période
 *
 * @example
 * ```typescript
 * const { start, end } = getWeeksBackBounds(4);
 * // Bornes des 4 dernières semaines
 * ```
 */
export function getWeeksBackBounds(
  weeksBack: number,
  referenceDate: Date = new Date(),
): DateBounds {
  if (weeksBack < 1 || weeksBack > 52) {
    throw new Error('weeksBack must be between 1 and 52');
  }

  const { start: currentWeekStart } = getWeekBounds(referenceDate);

  // Début = N semaines en arrière
  const start = new Date(currentWeekStart);
  start.setDate(currentWeekStart.getDate() - (weeksBack - 1) * 7);

  // Fin = fin de la semaine courante
  const { end } = getWeekBounds(referenceDate);

  return { start, end };
}

/**
 * Vérifie si une date est dans une période donnée
 *
 * @param date - Date à tester
 * @param bounds - Bornes de la période
 * @returns true si la date est dans la période
 *
 * @example
 * ```typescript
 * const isInWeek = isDateInBounds(myDate, getWeekBounds());
 * ```
 */
export function isDateInBounds(date: Date, bounds: DateBounds): boolean {
  return date >= bounds.start && date <= bounds.end;
}

/**
 * Compte le nombre de jours entre deux dates
 *
 * @param start - Date de début
 * @param end - Date de fin
 * @returns Nombre de jours (arrondi)
 *
 * @example
 * ```typescript
 * const days = daysBetween(start, end); // 7
 * ```
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / msPerDay);
}

/**
 * Obtient toutes les dates d'une période (un jour par date)
 *
 * @param bounds - Bornes de la période
 * @returns Array de dates (00:00:00 de chaque jour)
 *
 * @example
 * ```typescript
 * const weekDates = getDatesInBounds(getWeekBounds());
 * // [Lundi, Mardi, ..., Dimanche]
 * ```
 */
export function getDatesInBounds(bounds: DateBounds): Date[] {
  const dates: Date[] = [];
  const current = new Date(bounds.start);
  current.setHours(0, 0, 0, 0);

  while (current <= bounds.end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
