// Meta-Challenges - Challenges qui dépendent de plusieurs autres challenges
import type {
  Challenge,
  Entrainement,
  Repas,
  Mesure,
  JournalEntry,
} from '@/types';
// import { Timestamp } from 'firebase/firestore'; // Temporarily unused
import {
  calculateTotalTrainings,
  // calculateTotalMeals, // Temporarily unused
  // calculateLongestActivityStreak, // Temporarily unused
  calculateOptimalMacroDays,
  calculateUniqueFoodsCount,
  calculateWeightLoss,
  calculateIntenseCardioSessions,
  calculateStrengthSessions,
  calculatePositiveMoodDays,
  calculateHighEnergyDays,
  calculateQualitySleepDays,
} from './advanced';

// ===== META-CHALLENGES DE PERFORMANCE GLOBALE =====

/**
 * Meta-Challenge: "Légende Vivante" - Niveau 20 atteint
 * Calcul: Basé sur l'XP total accumulé (1000 XP = niveau 20)
 */
export function calculateUserLevel(totalXP: number): number {
  // Formule de niveau basée sur l'XP
  // Niveau 1: 0-99 XP
  // Niveau 2: 100-199 XP
  // Niveau 3: 200-299 XP
  // etc.
  return Math.floor(totalXP / 100) + 1;
}

/**
 * Meta-Challenge: "Maître Absolu" - 10 challenges complétés
 * Calcul: Compte le nombre de challenges complétés
 */
export function calculateCompletedChallenges(challenges: Challenge[]): number {
  return challenges.filter((challenge) => challenge.status === 'completed')
    .length;
}

/**
 * Meta-Challenge: "Perfectionniste" - 10 challenges complétés sans échec
 * Calcul: Compte les challenges complétés avec un taux de succès de 100%
 */
export function calculatePerfectChallenges(challenges: Challenge[]): number {
  return challenges.filter((challenge) => {
    if (challenge.status !== 'completed') return false;

    // Un challenge est "parfait" s'il a été complété en une seule tentative
    // (pas de progression intermédiaire)
    return challenge.current === challenge.target;
  }).length;
}

/**
 * Meta-Challenge: "Collectionneur" - 5 badges différents débloqués
 * Calcul: Compte les types de badges uniques obtenus
 */
export function calculateUniqueBadges(challenges: Challenge[]): number {
  const completedChallenges = challenges.filter(
    (c) => c.status === 'completed',
  );
  const uniqueTypes = new Set(completedChallenges.map((c) => c.type));
  return uniqueTypes.size;
}

// ===== META-CHALLENGES DE TRANSFORMATION COMPLÈTE =====

/**
 * Meta-Challenge: "Transformation Complète" - Perte de poids + Entraînement + Nutrition
 * Calcul: Combine perte de poids, entraînements réguliers et nutrition optimale
 */
export function calculateTransformationScore(
  mesures: Mesure[],
  entrainements: Entrainement[],
  repas: Repas[],
  monthStart: Date,
): number {
  let score = 0;

  // 1. Perte de poids (0-3 points)
  const weightLoss = calculateWeightLoss(mesures, monthStart);
  if (weightLoss >= 2) score += 3;
  else if (weightLoss >= 1) score += 2;
  else if (weightLoss > 0) score += 1;

  // 2. Entraînements réguliers (0-3 points)
  const totalTrainings = calculateTotalTrainings(entrainements);
  if (totalTrainings >= 20) score += 3;
  else if (totalTrainings >= 10) score += 2;
  else if (totalTrainings >= 5) score += 1;

  // 3. Nutrition optimale (0-3 points)
  const optimalDays = calculateOptimalMacroDays(repas, monthStart);
  if (optimalDays >= 20) score += 3;
  else if (optimalDays >= 10) score += 2;
  else if (optimalDays >= 5) score += 1;

  return Math.min(score, 9); // Max 9 points
}

/**
 * Meta-Challenge: "Équilibre Parfait" - Nutrition + Entraînement + Bien-être
 * Calcul: Combine tous les aspects du bien-être
 */
export function calculateBalanceScore(
  repas: Repas[],
  entrainements: Entrainement[],
  journal: JournalEntry[],
  weekStart: Date,
): number {
  let score = 0;

  // 1. Nutrition variée (0-2 points)
  const uniqueFoods = calculateUniqueFoodsCount(repas, weekStart);
  if (uniqueFoods >= 15) score += 2;
  else if (uniqueFoods >= 10) score += 1;

  // 2. Entraînements équilibrés (0-2 points)
  const cardioSessions = calculateIntenseCardioSessions(
    entrainements,
    weekStart,
  );
  const strengthSessions = calculateStrengthSessions(entrainements, weekStart);
  if (cardioSessions >= 2 && strengthSessions >= 2) score += 2;
  else if (cardioSessions >= 1 && strengthSessions >= 1) score += 1;

  // 3. Bien-être mental (0-2 points)
  const positiveMoodDays = calculatePositiveMoodDays(journal, weekStart);
  const highEnergyDays = calculateHighEnergyDays(journal, weekStart);
  const qualitySleepDays = calculateQualitySleepDays(journal, weekStart);

  if (positiveMoodDays >= 5 && highEnergyDays >= 3 && qualitySleepDays >= 5)
    score += 2;
  else if (
    positiveMoodDays >= 3 &&
    highEnergyDays >= 2 &&
    qualitySleepDays >= 3
  )
    score += 1;

  return Math.min(score, 6); // Max 6 points
}

// ===== META-CHALLENGES DE CONSISTANCE =====

/**
 * Meta-Challenge: "Consistance Parfaite" - 14 jours d'activité quotidienne
 * Calcul: Streak d'activité quotidienne (entraînement, repas, ou journal)
 */
export function calculateDailyConsistencyStreak(
  entrainements: Entrainement[],
  repas: Repas[],
  journal: JournalEntry[],
): number {
  // Créer un Set de toutes les dates avec activité
  const activityDates = new Set<string>();

  [...entrainements, ...repas, ...journal].forEach((item) => {
    const date = item.date.toDate();
    const dateStr = date.toISOString().split('T')[0];
    activityDates.add(dateStr);
  });

  // Trier les dates
  const sortedDates = Array.from(activityDates).sort();

  if (sortedDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currentDate = new Date(sortedDates[i]);
    const daysDiff = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Meta-Challenge: "Streak Master" - 30 jours d'activité consécutifs
 * Calcul: Plus longue séquence de jours avec activité
 */
export function calculateMasterStreak(
  entrainements: Entrainement[],
  repas: Repas[],
  journal: JournalEntry[],
): number {
  return calculateDailyConsistencyStreak(entrainements, repas, journal);
}

// ===== META-CHALLENGES DE PERFORMANCE SPÉCIALISÉE =====

/**
 * Meta-Challenge: "Athlète Complet" - Cardio + Musculation + Nutrition
 * Calcul: Combine performance cardio, musculation et nutrition
 */
export function calculateAthleteScore(
  entrainements: Entrainement[],
  repas: Repas[],
  weekStart: Date,
): number {
  let score = 0;

  // 1. Performance cardio (0-3 points)
  const cardioSessions = calculateIntenseCardioSessions(
    entrainements,
    weekStart,
  );
  if (cardioSessions >= 5) score += 3;
  else if (cardioSessions >= 3) score += 2;
  else if (cardioSessions >= 1) score += 1;

  // 2. Performance musculation (0-3 points)
  const strengthSessions = calculateStrengthSessions(entrainements, weekStart);
  if (strengthSessions >= 5) score += 3;
  else if (strengthSessions >= 3) score += 2;
  else if (strengthSessions >= 1) score += 1;

  // 3. Nutrition optimale (0-3 points)
  const optimalDays = calculateOptimalMacroDays(repas, weekStart);
  if (optimalDays >= 5) score += 3;
  else if (optimalDays >= 3) score += 2;
  else if (optimalDays >= 1) score += 1;

  return Math.min(score, 9); // Max 9 points
}

/**
 * Meta-Challenge: "Endurance Extrême" - Cardio long + Récupération
 * Calcul: Combine cardio intense et récupération active
 */
export function calculateEnduranceScore(
  entrainements: Entrainement[],
  journal: JournalEntry[],
  weekStart: Date,
): number {
  let score = 0;

  // 1. Cardio intense (0-2 points)
  const cardioSessions = calculateIntenseCardioSessions(
    entrainements,
    weekStart,
  );
  if (cardioSessions >= 4) score += 2;
  else if (cardioSessions >= 2) score += 1;

  // 2. Récupération active (0-2 points)
  const recoveryKeywords = ['yoga', 'stretching', 'récupération', 'relaxation'];
  const weekEntrainements = entrainements.filter((entrainement) => {
    const entrainementDate = entrainement.date.toDate();
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekStartDate.getDate() + 7);
    return entrainementDate >= weekStartDate && entrainementDate <= weekEndDate;
  });

  const recoverySessions = weekEntrainements.filter((entrainement) => {
    const commentaire = (entrainement.commentaire || '').toLowerCase();
    return recoveryKeywords.some((keyword) => commentaire.includes(keyword));
  }).length;

  if (recoverySessions >= 2) score += 2;
  else if (recoverySessions >= 1) score += 1;

  return Math.min(score, 4); // Max 4 points
}

// ===== META-CHALLENGES DE BIEN-ÊTRE GLOBAL =====

/**
 * Meta-Challenge: "Bien-être Total" - Humeur + Énergie + Sommeil
 * Calcul: Combine tous les aspects du bien-être mental
 */
export function calculateWellnessScore(
  journal: JournalEntry[],
  weekStart: Date,
): number {
  let score = 0;

  // 1. Humeur positive (0-2 points)
  const positiveMoodDays = calculatePositiveMoodDays(journal, weekStart);
  if (positiveMoodDays >= 5) score += 2;
  else if (positiveMoodDays >= 3) score += 1;

  // 2. Énergie élevée (0-2 points)
  const highEnergyDays = calculateHighEnergyDays(journal, weekStart);
  if (highEnergyDays >= 4) score += 2;
  else if (highEnergyDays >= 2) score += 1;

  // 3. Sommeil de qualité (0-2 points)
  const qualitySleepDays = calculateQualitySleepDays(journal, weekStart);
  if (qualitySleepDays >= 5) score += 2;
  else if (qualitySleepDays >= 3) score += 1;

  return Math.min(score, 6); // Max 6 points
}

/**
 * Meta-Challenge: "Zen Master" - Méditation + Gratitude + Équilibre
 * Calcul: Combine méditation, gratitude et équilibre mental
 */
export function calculateZenScore(
  journal: JournalEntry[],
  dayStart: Date,
): number {
  let score = 0;

  // 1. Méditation (0-2 points)
  const meditationKeywords = [
    'méditation',
    'méditer',
    'mindfulness',
    'respiration',
    'calme',
  ];
  const dayJournal = journal.filter((entry) => {
    const entryDate = entry.date.toDate();
    const dayStartDate = new Date(dayStart);
    const dayEndDate = new Date(dayStart);
    dayEndDate.setDate(dayStartDate.getDate() + 1);
    return entryDate >= dayStartDate && entryDate <= dayEndDate;
  });

  let meditationTime = 0;
  dayJournal.forEach((entry) => {
    if (entry.note) {
      const note = entry.note.toLowerCase();
      if (meditationKeywords.some((keyword) => note.includes(keyword))) {
        const timeMatch = note.match(/(\d+)\s*(min|minute|minutes)/);
        if (timeMatch) {
          meditationTime += parseInt(timeMatch[1]);
        } else {
          meditationTime += 10;
        }
      }
    }
  });

  if (meditationTime >= 20) score += 2;
  else if (meditationTime >= 10) score += 1;

  // 2. Gratitude (0-2 points)
  const gratitudeKeywords = [
    'reconnaissant',
    'reconnaissance',
    'gratitude',
    'merci',
    'chanceux',
    'chance',
    'bénédiction',
    'béni',
    'heureux',
    'joie',
    'content',
    'satisfait',
    'fier',
    'accompli',
    'réussi',
    'positif',
  ];

  let gratitudePoints = 0;
  dayJournal.forEach((entry) => {
    if (entry.note) {
      const note = entry.note.toLowerCase();
      gratitudeKeywords.forEach((keyword) => {
        if (note.includes(keyword)) {
          gratitudePoints++;
        }
      });
    }
  });

  if (gratitudePoints >= 3) score += 2;
  else if (gratitudePoints >= 1) score += 1;

  // 3. Équilibre mental (0-2 points)
  const avgMood =
    dayJournal.reduce((sum, entry) => sum + entry.humeur, 0) /
    dayJournal.length;
  const avgEnergy =
    dayJournal.reduce((sum, entry) => sum + entry.energie, 0) /
    dayJournal.length;
  const avgSleep =
    dayJournal.reduce((sum, entry) => sum + (entry.sommeil || 0), 0) /
    dayJournal.length;

  if (avgMood >= 7 && avgEnergy >= 7 && avgSleep >= 7) score += 2;
  else if (avgMood >= 6 && avgEnergy >= 6 && avgSleep >= 6) score += 1;

  return Math.min(score, 6); // Max 6 points
}

// ===== META-CHALLENGES DE DÉVELOPPEMENT PERSONNEL =====

/**
 * Meta-Challenge: "Évolution Continue" - Progression sur tous les fronts
 * Calcul: Combine progression physique, mentale et nutritionnelle
 */
export function calculateEvolutionScore(
  mesures: Mesure[],
  entrainements: Entrainement[],
  repas: Repas[],
  journal: JournalEntry[],
  monthStart: Date,
): number {
  let score = 0;

  // 1. Progression physique (0-3 points)
  const weightLoss = calculateWeightLoss(mesures, monthStart);
  const totalTrainings = calculateTotalTrainings(entrainements);

  if (weightLoss >= 1 && totalTrainings >= 15) score += 3;
  else if (weightLoss >= 0.5 && totalTrainings >= 10) score += 2;
  else if (totalTrainings >= 5) score += 1;

  // 2. Progression nutritionnelle (0-3 points)
  const optimalDays = calculateOptimalMacroDays(repas, monthStart);
  const uniqueFoods = calculateUniqueFoodsCount(repas, monthStart);

  if (optimalDays >= 15 && uniqueFoods >= 20) score += 3;
  else if (optimalDays >= 10 && uniqueFoods >= 15) score += 2;
  else if (optimalDays >= 5 && uniqueFoods >= 10) score += 1;

  // 3. Progression mentale (0-3 points)
  const positiveMoodDays = calculatePositiveMoodDays(journal, monthStart);
  const highEnergyDays = calculateHighEnergyDays(journal, monthStart);

  if (positiveMoodDays >= 15 && highEnergyDays >= 10) score += 3;
  else if (positiveMoodDays >= 10 && highEnergyDays >= 7) score += 2;
  else if (positiveMoodDays >= 5 && highEnergyDays >= 5) score += 1;

  return Math.min(score, 9); // Max 9 points
}

/**
 * Meta-Challenge: "Défenseur de la Santé" - Streak global + Performance
 * Calcul: Combine streak d'activité et performance globale
 */
export function calculateHealthDefenderScore(
  entrainements: Entrainement[],
  repas: Repas[],
  journal: JournalEntry[],
  challenges: Challenge[],
): number {
  let score = 0;

  // 1. Streak d'activité (0-3 points)
  const activityStreak = calculateDailyConsistencyStreak(
    entrainements,
    repas,
    journal,
  );
  if (activityStreak >= 30) score += 3;
  else if (activityStreak >= 14) score += 2;
  else if (activityStreak >= 7) score += 1;

  // 2. Performance globale (0-3 points)
  const completedChallenges = calculateCompletedChallenges(challenges);
  if (completedChallenges >= 20) score += 3;
  else if (completedChallenges >= 10) score += 2;
  else if (completedChallenges >= 5) score += 1;

  // 3. Diversité d'activités (0-3 points)
  const hasTrainings = entrainements.length > 0;
  const hasNutrition = repas.length > 0;
  const hasJournal = journal.length > 0;

  const activityTypes = [hasTrainings, hasNutrition, hasJournal].filter(
    Boolean,
  ).length;
  if (activityTypes === 3) score += 3;
  else if (activityTypes === 2) score += 2;
  else if (activityTypes === 1) score += 1;

  return Math.min(score, 9); // Max 9 points
}
