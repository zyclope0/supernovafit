/**
 * Challenge Tracking - Index
 *
 * Point d'entrée pour toutes les fonctions de calcul de progression
 * Architecture modulaire pour testabilité maximale
 *
 * @module challengeTracking
 * @created 23.10.2025
 * @quality Pure functions - 100% testable
 */

// ========================================
// Utilitaires de dates
// ========================================
export * from './utils';

// ========================================
// Calculs Nutrition
// ========================================
export {
  countTodayMeals,
  countPerfectNutritionDays,
  countProteinGoalDays,
  calculateProteinGoal,
} from './nutrition';

// ========================================
// Calculs Entraînement
// ========================================
export {
  countTodayTrainings,
  countWeekTrainings,
  calculateWeekTrainingTime,
  calculateWeekTrainingVolume,
  calculateTrainingStreak,
  filterCardioTrainings,
  filterStrengthTrainings,
} from './training';

// ========================================
// Calculs Tracking & Mesures
// ========================================
export {
  countWeekWeighIns,
  countWeekJournalEntries,
  calculateWeighInStreak,
  calculateJournalStreak,
  hasTodayWeighIn,
  hasTodayJournalEntry,
} from './tracking';
