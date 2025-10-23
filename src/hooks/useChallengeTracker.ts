'use client';

import { useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  useRepas,
  useEntrainements,
  useJournal,
  useMesures,
} from './useFirestore';
import { useChallenges } from './useChallenges';
import {
  // Nutrition
  countTodayMeals,
  countPerfectNutritionDays,
  countProteinGoalDays,
  calculateProteinGoal,
  // Training
  countWeekTrainings,
  calculateWeekTrainingTime,
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
import { safeValidateUpdateChallenge } from '@/lib/validation/challenges';

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

    // Mise à jour par titre de challenge
    const updates: Array<{ id: string; title: string; current: number }> = [];

    activeChallenges.forEach((challenge) => {
      let newCurrent: number | null = null;

      switch (challenge.title) {
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

    // Mise à jour par titre de challenge
    const updates: Array<{ id: string; title: string; current: number }> = [];

    activeChallenges.forEach((challenge) => {
      let newCurrent: number | null = null;

      switch (challenge.title) {
        case 'Repas Complet':
          newCurrent = todayMealsCount;
          break;
        case '7 Jours de Nutrition Parfaite':
          newCurrent = perfectNutritionDays;
          break;
        case 'Marathon des Protéines':
          newCurrent = proteinGoalDays;
          break;
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

    // Mise à jour par titre de challenge
    const updates: Array<{ id: string; title: string; current: number }> = [];

    activeChallenges.forEach((challenge) => {
      let newCurrent: number | null = null;

      switch (challenge.title) {
        case 'Pesée Quotidienne':
          newCurrent = Math.max(weekWeighIns, weighInStreak);
          break;
        case 'Journal Quotidien':
          newCurrent = Math.max(weekJournalEntries, journalStreak);
          break;
        case 'Transformation du Mois':
          newCurrent = Math.max(0, monthWeightLoss); // Clamp à 0 si gain
          break;
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
}
