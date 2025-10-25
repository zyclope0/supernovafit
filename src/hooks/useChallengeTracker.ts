'use client';

import { useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  useRepas,
  useEntrainements,
  useJournal,
  useMesures,
} from './useFirestore';
import { useChallenges } from './useChallenges'; // useUserProgress temporarily disabled
import {
  // Nutrition
  countTodayMeals,
  countPerfectNutritionDays,
  countProteinGoalDays,
  calculateProteinGoal,
  // Training
  countWeekTrainings,
  calculateTrainingStreak,
  calculateWeekTrainingVolume,
  filterStrengthTrainings,
  getWeekBounds,
  // Tracking
  countWeekWeighIns,
  countWeekJournalEntries,
  calculateWeighInStreak,
  calculateJournalStreak,
  // Transformations
  calculateMonthWeightLoss,
} from '@/lib/challengeTracking';

// Import calculateWeekTrainingTime from training.ts (correct signature)
import { calculateWeekTrainingTime } from '@/lib/challengeTracking/training';

// Import challenges avancés (Phase 2.3) - Temporairement désactivé
// import {
//   calculateTotalTrainings,
//   calculateTotalMeals,
//   calculateMonthTrainingVolume,
//   calculateLongestActivityStreak,
//   calculateDailyUsageStreak,
//   calculateOptimalMacroDays,
//   calculateUniqueFoodsCount,
//   calculateWeightLoss,
//   calculateWeightGain,
//   calculateRecoverySessions,
//   calculateIntenseCardioSessions,
//   calculateTotalCardioTime,
//   calculateStrengthSessions,
//   calculateTotalVolume,
//   calculatePositiveMoodDays,
//   calculateHighEnergyDays,
//   calculateQualitySleepDays,
//   calculateGratitudePoints,
//   calculateMeditationTime,
// } from '@/lib/challengeTracking/advanced';
import { safeValidateUpdateChallenge } from '@/lib/validation/challenges';
import {
  sendChallengeCompletedNotification,
  sendChallengeProgressNotification,
  sendChallengeAlmostDoneNotification,
} from '@/lib/notifications/challengeNotifications';

/**
 * Hook pour automatiser la mise à jour des challenges
 *
 * Surveille les données utilisateur et met à jour les challenges automatiquement
 * en utilisant des fonctions pures testées isolément.
 *
 * @refactored Phase 1.4 - 23 Oct 2025
 * @before 775 lignes monolithiques
 * @after ~200 lignes modulaires avec validation Zod
 */
export function useChallengeTracker() {
  const { user } = useAuth();
  const { repas } = useRepas();
  const { entrainements } = useEntrainements();
  const { entries: journalEntries } = useJournal();
  const { mesures } = useMesures();
  const { challenges, updateChallenge } = useChallenges();
  // const { progress } = useUserProgress(); // Temporarily disabled

  // ========================================
  // 🏋️ CHALLENGES ENTRAÎNEMENT
  // ========================================
  useEffect(() => {
    if (!user || !entrainements || challenges.length === 0) return;

    const activeChallenges = challenges.filter((c) => c.status === 'active');
    if (activeChallenges.length === 0) return;

    // Calculer métriques une seule fois
    const weekTrainingsCount = countWeekTrainings(entrainements);
    const weekTrainingTime = calculateWeekTrainingTime(entrainements);
    const trainingStreak = calculateTrainingStreak(entrainements);
    const weekTrainingVolume = calculateWeekTrainingVolume(entrainements);
    const weekBounds = getWeekBounds();
    const weekStrengthCount = filterStrengthTrainings(
      entrainements,
      weekBounds,
    ).length;

    // Nouvelles métriques avancées (temporairement désactivées pour éviter les erreurs TypeScript)
    // const totalTrainings = calculateTotalTrainings(entrainements);
    // const monthTrainingVolume = calculateMonthTrainingVolume(entrainements, new Date());
    // const longestActivityStreak = calculateLongestActivityStreak(entrainements, repas, journalEntries);
    // const dailyUsageStreak = calculateDailyUsageStreak(entrainements, repas, journalEntries);
    // const intenseCardioSessions = calculateIntenseCardioSessions(entrainements, new Date());
    // const totalCardioTime = calculateTotalCardioTime(entrainements, new Date());
    // const strengthSessions = calculateStrengthSessions(entrainements, new Date());
    // const totalVolume = calculateTotalVolume(entrainements, new Date());
    // const recoverySessions = calculateRecoverySessions(entrainements, new Date());

    // Mise à jour par titre de challenge
    const updates: Array<{ id: string; title: string; current: number }> = [];

    activeChallenges.forEach((challenge) => {
      let newCurrent: number | null = null;

      switch (challenge.title) {
        // Challenges existants
        case '5 Workouts par Semaine':
          newCurrent = weekTrainingsCount;
          break;
        case 'Force Pure':
          newCurrent = weekStrengthCount;
          break;
        case 'Warrior Streak':
          newCurrent = trainingStreak;
          break;
        case "10h d'Entraînement en un Mois":
          newCurrent = weekTrainingTime;
          break;
        case 'Volume Monstre':
          newCurrent = Math.round(weekTrainingVolume / 1000); // Convertir en milliers de kg
          break;

        // Nouveaux Challenges Avancés - Performance (temporairement désactivés)
        // case 'Machine à Entraînement':
        //   newCurrent = totalTrainings;
        //   break;
        // case 'Marathon du Temps':
        //   newCurrent = Math.round(weekTrainingTime / 60); // Convertir en heures
        //   break;
        // case 'Volume Monstre Avancé':
        //   newCurrent = Math.round(monthTrainingVolume / 1000); // Convertir en milliers de minutes
        //   break;
        // case 'Streak Master':
        //   newCurrent = longestActivityStreak;
        //   break;
        // case 'Consistance Parfaite':
        //   newCurrent = dailyUsageStreak;
        //   break;

        // Nouveaux Challenges Avancés - Cardio (temporairement désactivés)
        // case 'Cardio Intense':
        //   newCurrent = intenseCardioSessions;
        //   break;
        // case 'Endurance Extrême':
        //   newCurrent = Math.round(totalCardioTime / 60); // Convertir en heures
        //   break;

        // Nouveaux Challenges Avancés - Musculation (temporairement désactivés)
        // case 'Force Pure Avancée':
        //   newCurrent = strengthSessions;
        //   break;
        // case 'Volume Monstre Musculation':
        //   newCurrent = Math.round(totalVolume / 1000); // Convertir en milliers de kg
        //   break;

        // Nouveaux Challenges Avancés - Récupération (temporairement désactivés)
        // case 'Récupération Active':
        //   newCurrent = recoverySessions;
        //   break;

        default:
          break;
      }

      // Mise à jour si changement détecté
      if (newCurrent !== null && newCurrent !== challenge.current) {
        updates.push({
          id: challenge.id,
          title: challenge.title,
          current: newCurrent,
        });
      }
    });

    // Appliquer les mises à jour avec validation Zod
    updates.forEach(({ id, title, current }) => {
      const validation = safeValidateUpdateChallenge({
        user_id: user.uid,
        current,
      });

      if (!validation.success) {
        console.warn(
          `⚠️ Validation échouée pour "${title}":`,
          validation.error,
        );
        return;
      }

      // Récupérer challenge complet pour vérifier completion
      const fullChallenge = challenges.find((c) => c.id === id);
      if (!fullChallenge) return;

      // Vérifier si challenge vient d'être complété
      const wasCompleted = fullChallenge.current >= fullChallenge.target;
      const isNowCompleted = current >= fullChallenge.target;
      const justCompleted = !wasCompleted && isNowCompleted;

      updateChallenge(id, { current })
        .then(() => {
          // 🎉 Envoyer notification si complété
          if (justCompleted) {
            sendChallengeCompletedNotification(fullChallenge);
            console.log(`🎉 Challenge complété: ${title}`);
          }
          // 📈 Notification progression (50%, 75%, 90%)
          else if (isNowCompleted === false) {
            sendChallengeProgressNotification({ ...fullChallenge, current });
          }
          // 🔥 Notification encouragement (presque fini)
          else if (fullChallenge.target - current <= 3) {
            sendChallengeAlmostDoneNotification({ ...fullChallenge, current });
          }
        })
        .catch((error) => {
          console.error(`❌ Erreur mise à jour "${title}":`, error);
        });
    });
  }, [user, entrainements, challenges, updateChallenge]);

  // ========================================
  // 🍽️ CHALLENGES NUTRITION
  // ========================================
  useEffect(() => {
    if (!user || !repas || !mesures || challenges.length === 0) return;

    const activeChallenges = challenges.filter((c) => c.status === 'active');
    if (activeChallenges.length === 0) return;

    // Calculer métriques une seule fois
    const todayMealsCount = countTodayMeals(repas);
    const perfectNutritionDays = countPerfectNutritionDays(repas, 3);
    const proteinGoal = calculateProteinGoal(mesures);
    const proteinGoalDays = countProteinGoalDays(repas, proteinGoal);

    // Nouvelles métriques nutrition avancées (temporairement désactivées)
    // const totalMeals = calculateTotalMeals(repas);
    // const optimalMacroDays = calculateOptimalMacroDays(repas, new Date());
    // const uniqueFoodsCount = calculateUniqueFoodsCount(repas, new Date());

    // Mise à jour par titre de challenge
    const updates: Array<{ id: string; title: string; current: number }> = [];

    activeChallenges.forEach((challenge) => {
      let newCurrent: number | null = null;

      switch (challenge.title) {
        // Challenges existants
        case 'Repas Complet':
          newCurrent = todayMealsCount;
          break;
        case '7 Jours de Nutrition Parfaite':
          newCurrent = perfectNutritionDays;
          break;
        case 'Marathon des Protéines':
          newCurrent = proteinGoalDays;
          break;

        // Nouveaux Challenges Avancés - Nutrition (temporairement désactivés)
        // case 'Nutritionniste':
        //   newCurrent = totalMeals;
        //   break;
        // case 'Défi Équilibre':
        //   newCurrent = optimalMacroDays;
        //   break;
        // case 'Défi Variété':
        //   newCurrent = uniqueFoodsCount;
        //   break;

        default:
          break;
      }

      // Mise à jour si changement détecté
      if (newCurrent !== null && newCurrent !== challenge.current) {
        updates.push({
          id: challenge.id,
          title: challenge.title,
          current: newCurrent,
        });
      }
    });

    // Appliquer les mises à jour avec validation Zod
    updates.forEach(({ id, title, current }) => {
      const validation = safeValidateUpdateChallenge({
        user_id: user.uid,
        current,
      });

      if (!validation.success) {
        console.warn(
          `⚠️ Validation échouée pour "${title}":`,
          validation.error,
        );
        return;
      }

      updateChallenge(id, { current }).catch((error) => {
        console.error(`❌ Erreur mise à jour "${title}":`, error);
      });
    });
  }, [user, repas, mesures, challenges, updateChallenge]);

  // ========================================
  // 📊 CHALLENGES TRACKING (Mesures + Journal)
  // ========================================
  useEffect(() => {
    if (!user || !mesures || !journalEntries || challenges.length === 0) return;

    const activeChallenges = challenges.filter((c) => c.status === 'active');
    if (activeChallenges.length === 0) return;

    // Calculer métriques une seule fois
    const weekWeighIns = countWeekWeighIns(mesures);
    const weighInStreak = calculateWeighInStreak(mesures);
    const weekJournalEntries = countWeekJournalEntries(journalEntries);
    const journalStreak = calculateJournalStreak(journalEntries);
    const monthWeightLoss = calculateMonthWeightLoss(mesures);

    // Nouvelles métriques tracking avancées (temporairement désactivées)
    // const weightLoss = calculateWeightLoss(mesures, new Date());
    // const weightGain = calculateWeightGain(mesures, new Date());
    // const positiveMoodDays = calculatePositiveMoodDays(journalEntries, new Date());
    // const highEnergyDays = calculateHighEnergyDays(journalEntries, new Date());
    // const qualitySleepDays = calculateQualitySleepDays(journalEntries, new Date());
    // const gratitudePoints = calculateGratitudePoints(journalEntries, new Date());
    // const meditationTime = calculateMeditationTime(journalEntries, new Date());

    // Mise à jour par titre de challenge
    const updates: Array<{ id: string; title: string; current: number }> = [];

    activeChallenges.forEach((challenge) => {
      let newCurrent: number | null = null;

      switch (challenge.title) {
        // Challenges existants
        case 'Pesée Quotidienne':
          newCurrent = Math.max(weekWeighIns, weighInStreak);
          break;
        case 'Journal Quotidien':
          newCurrent = Math.max(weekJournalEntries, journalStreak);
          break;
        case 'Transformation du Mois':
          newCurrent = Math.max(0, monthWeightLoss); // Clamp à 0 si gain
          break;

        // Nouveaux Challenges Avancés - Transformation (temporairement désactivés)
        // case 'Perte de Poids':
        //   newCurrent = Math.max(0, weightLoss);
        //   break;
        // case 'Gain de Masse':
        //   newCurrent = Math.max(0, weightGain);
        //   break;

        // Nouveaux Challenges Avancés - Bien-être (temporairement désactivés)
        // case 'Humeur Positive':
        //   newCurrent = positiveMoodDays;
        //   break;
        // case 'Énergie Maximale':
        //   newCurrent = highEnergyDays;
        //   break;
        // case 'Sommeil de Qualité':
        //   newCurrent = qualitySleepDays;
        //   break;
        // case 'Gratitude':
        //   newCurrent = gratitudePoints;
        //   break;
        // case 'Méditation':
        //   newCurrent = Math.round(meditationTime / 10); // Convertir en points (10min = 1 point)
        //   break;

        default:
          break;
      }

      // Mise à jour si changement détecté
      if (newCurrent !== null && newCurrent !== challenge.current) {
        updates.push({
          id: challenge.id,
          title: challenge.title,
          current: newCurrent,
        });
      }
    });

    // Appliquer les mises à jour avec validation Zod
    updates.forEach(({ id, title, current }) => {
      const validation = safeValidateUpdateChallenge({
        user_id: user.uid,
        current,
      });

      if (!validation.success) {
        console.warn(
          `⚠️ Validation échouée pour "${title}":`,
          validation.error,
        );
        return;
      }

      updateChallenge(id, { current }).catch((error) => {
        console.error(`❌ Erreur mise à jour "${title}":`, error);
      });
    });
  }, [user, mesures, journalEntries, challenges, updateChallenge]);

  // ========================================
  // 🏆 META-CHALLENGES (Phase 2.4) - TEMPORAIREMENT DÉSACTIVÉS
  // ========================================
  // useEffect(() => {
  //   // Temporairement désactivé pour éviter les erreurs TypeScript
  //   // Les meta-challenges seront réactivés une fois les types corrigés
  // }, [user, entrainements, repas, mesures, journalEntries, challenges, progress, updateChallenge]);
}
