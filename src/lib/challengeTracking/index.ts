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

// ========================================
// Calculs Transformations Corporelles
// ========================================
export {
  calculateMonthWeightLoss,
  calculateWeightLossProgress,
  hasAchievedWeightLossGoal,
  calculateWeightLossRate,
} from './transformations';

// ========================================
// Calculs Challenges Avancés (Phase 2.3)
// ========================================
export {
  // Performance Complexe
  calculateTotalTrainings,
  calculateTotalMeals,
  calculateMonthTrainingVolume,
  calculateLongestActivityStreak,
  calculateDailyUsageStreak,

  // Nutrition Complexe
  calculateOptimalMacroDays,
  calculateUniqueFoodsCount,

  // Transformation
  calculateWeightLoss,
  calculateWeightGain,

  // Récupération
  calculateRecoverySessions,

  // Cardio
  calculateIntenseCardioSessions,
  calculateTotalCardioTime,

  // Musculation
  calculateStrengthSessions,
  calculateTotalVolume,

  // Bien-être
  calculatePositiveMoodDays,
  calculateHighEnergyDays,
  calculateQualitySleepDays,

  // Gratitude & Méditation
  calculateGratitudePoints,
  calculateMeditationTime,
} from './advanced';

// ========================================
// Calculs Meta-Challenges (Phase 2.4)
// ========================================
export {
  // Performance Globale
  calculateUserLevel,
  calculateCompletedChallenges,
  calculatePerfectChallenges,
  calculateUniqueBadges,

  // Transformation Complète
  calculateTransformationScore,
  calculateBalanceScore,

  // Consistance
  calculateDailyConsistencyStreak,
  calculateMasterStreak,

  // Performance Spécialisée
  calculateAthleteScore,
  calculateEnduranceScore,

  // Bien-être Global
  calculateWellnessScore,
  calculateZenScore,

  // Développement Personnel
  calculateEvolutionScore,
  calculateHealthDefenderScore,
} from './meta';
