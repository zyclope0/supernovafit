/**
 * Utilitaires pour le formatage des nombres
 */

/**
 * Arrondit un nombre avec un nombre spécifique de décimales
 */
export function roundNumber(value: number, decimals: number = 1): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Formate un nombre pour l'affichage avec un nombre spécifique de décimales
 */
export function formatNumber(value: number, decimals: number = 1): string {
  const rounded = roundNumber(value, decimals);
  return rounded.toString();
}

/**
 * Formate un pourcentage avec un nombre spécifique de décimales
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  const rounded = roundNumber(value, decimals);
  return `${rounded}%`;
}

/**
 * Formate un nombre avec des séparateurs de milliers
 */
export function formatNumberWithSeparators(
  value: number,
  decimals: number = 0,
): string {
  const rounded = roundNumber(value, decimals);
  return rounded.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formate une valeur de poids (kg)
 */
export function formatWeight(value: number): string {
  return `${formatNumber(value, 1)} kg`;
}

/**
 * Formate une valeur de calories
 */
export function formatCalories(value: number): string {
  return `${formatNumberWithSeparators(Math.round(value), 0)} kcal`;
}

/**
 * Formate une valeur de protéines (g)
 */
export function formatProteins(value: number): string {
  return `${formatNumber(Math.round(value), 0)}g`;
}

/**
 * Formate une valeur de variation de performance
 */
export function formatPerformanceVariation(value: number): string {
  const rounded = roundNumber(value, 1);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

/**
 * Formate une valeur de variation de poids
 */
export function formatWeightVariation(value: number): string {
  const rounded = roundNumber(value, 1);
  return `${rounded > 0 ? '+' : ''}${rounded} kg`;
}
