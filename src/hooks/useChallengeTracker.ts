'use client';

import { useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  useRepas,
  useEntrainements,
  useJournal,
  useMesures,
} from './useFirestore';
import { timestampToDateString } from '@/lib/dateUtils';
import { useChallenges } from './useChallenges';

/**
 * Hook pour automatiser la mise à jour des challenges
 * Surveille les données utilisateur et met à jour les challenges automatiquement
 */
export function useChallengeTracker() {
  const { user } = useAuth();
  const { repas } = useRepas();
  const { entrainements } = useEntrainements();
  const { entries: journalEntries } = useJournal();
  const { mesures } = useMesures();
  const { challenges, updateChallenge } = useChallenges();

  // Calculer le début et la fin de la semaine courante
  const getWeekBounds = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Dimanche = 6 jours, autres = jour - 1
    startOfWeek.setDate(now.getDate() - daysToSubtract); // Lundi
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Samedi
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  };

  // Calculer le début et la fin du jour courant
  const getTodayBounds = () => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
  };

  // Mettre à jour les challenges d'entraînement
  useEffect(() => {
    if (!user || !entrainements || challenges.length === 0) return;

    const { startOfWeek, endOfWeek } = getWeekBounds();

    // Filtrer les entraînements de cette semaine
    const thisWeekTrainings = entrainements.filter((training) => {
      const trainingDate = new Date(timestampToDateString(training.date));
      return trainingDate >= startOfWeek && trainingDate <= endOfWeek;
    });

    // Filtrer les séances de musculation de cette semaine
    const thisWeekMusculation = thisWeekTrainings.filter(
      (training) =>
        training.type?.toLowerCase().includes('musculation') ||
        training.type?.toLowerCase().includes('force') ||
        training.type?.toLowerCase().includes('renforcement') ||
        training.type?.toLowerCase().includes('muscu') ||
        training.type?.toLowerCase().includes('strength') ||
        training.type?.toLowerCase().includes('weight'),
    );

    console.log('🏋️ Challenge Tracker - Entraînements:', {
      totalTrainings: entrainements.length,
      thisWeekTrainings: thisWeekTrainings.length,
      thisWeekMusculation: thisWeekMusculation.length,
      musculationTypes: thisWeekMusculation.map((t) => t.type),
      activeChallenges: challenges.filter((c) => c.status === 'active').length,
      weekBounds: {
        startOfWeek: startOfWeek.toISOString(),
        endOfWeek: endOfWeek.toISOString(),
      },
    });

    // Mettre à jour le challenge "Force Pure"
    const forcePureChallenge = challenges.find(
      (c) => c.title === 'Force Pure' && c.status === 'active',
    );

    if (
      forcePureChallenge &&
      thisWeekMusculation.length !== forcePureChallenge.current
    ) {
      console.log('🔄 Tentative mise à jour Force Pure:', {
        challengeId: forcePureChallenge.id,
        oldCurrent: forcePureChallenge.current,
        newCurrent: thisWeekMusculation.length,
        userId: user.uid,
      });

      updateChallenge(forcePureChallenge.id, {
        current: thisWeekMusculation.length,
      }).catch((error) => {
        console.log('❌ Erreur mise à jour Force Pure:', error);
      });
    }

    // Mettre à jour d'autres challenges d'entraînement
    const streakChallenge = challenges.find(
      (c) => c.title === 'Streak Entraînement' && c.status === 'active',
    );

    if (
      streakChallenge &&
      thisWeekTrainings.length !== streakChallenge.current
    ) {
      console.log('🔄 Tentative mise à jour Streak Entraînement:', {
        challengeId: streakChallenge.id,
        oldCurrent: streakChallenge.current,
        newCurrent: thisWeekTrainings.length,
        userId: user.uid,
      });

      updateChallenge(streakChallenge.id, {
        current: thisWeekTrainings.length,
      }).catch((error) => {
        console.log('❌ Erreur mise à jour Streak Entraînement:', error);
      });
    }

    // Mettre à jour challenge "Défi Calories" (calories brûlées cette semaine)
    const thisWeekCaloriesBurned = thisWeekTrainings.reduce(
      (total, training) => total + (training.calories || 0),
      0,
    );

    const caloriesChallengeChallenge = challenges.find(
      (c) => c.title === 'Défi Calories' && c.status === 'active',
    );

    if (
      caloriesChallengeChallenge &&
      thisWeekCaloriesBurned !== caloriesChallengeChallenge.current
    ) {
      console.log('🔄 Tentative mise à jour Défi Calories:', {
        challengeId: caloriesChallengeChallenge.id,
        oldCurrent: caloriesChallengeChallenge.current,
        newCurrent: thisWeekCaloriesBurned,
        userId: user.uid,
      });

      updateChallenge(caloriesChallengeChallenge.id, {
        current: thisWeekCaloriesBurned,
      }).catch((error) => {
        console.log('❌ Erreur mise à jour Défi Calories:', error);
      });
    }
  }, [user, entrainements, challenges, updateChallenge]);

  // Mettre à jour les challenges de nutrition
  useEffect(() => {
    if (!user || !repas || challenges.length === 0) return;

    const { startOfDay, endOfDay } = getTodayBounds();

    // Repas d'aujourd'hui
    const todayMeals = repas.filter((meal) => {
      const mealDate = new Date(timestampToDateString(meal.date));
      return mealDate >= startOfDay && mealDate <= endOfDay;
    });

    console.log('🍽️ Challenge Tracker - Nutrition:', {
      totalMeals: repas.length,
      todayMeals: todayMeals.length,
      todayMealTypes: todayMeals.map((m) => m.repas),
      dayBounds: {
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
      },
    });

    // Mettre à jour challenge "Repas Complet" (3 repas aujourd'hui)
    const repasCompletChallenge = challenges.find(
      (c) => c.title === 'Repas Complet' && c.status === 'active',
    );

    if (
      repasCompletChallenge &&
      todayMeals.length !== repasCompletChallenge.current
    ) {
      console.log('🔄 Tentative mise à jour Repas Complet:', {
        challengeId: repasCompletChallenge.id,
        oldCurrent: repasCompletChallenge.current,
        newCurrent: todayMeals.length,
        userId: user.uid,
      });

      updateChallenge(repasCompletChallenge.id, {
        current: todayMeals.length,
      }).catch((error) => {
        console.log('❌ Erreur mise à jour Repas Complet:', error);
      });
    }
  }, [user, repas, challenges, updateChallenge]);

  // Mettre à jour les challenges de protéines (nouvelle logique)
  useEffect(() => {
    if (!user || !repas || challenges.length === 0) return;

    // Calculer les jours de la semaine où l'objectif protéines a été atteint
    const { startOfWeek, endOfWeek } = getWeekBounds();

    // Obtenir le poids pour calculer l'objectif protéines
    const latestWeight = mesures
      .filter((m) => m.poids)
      .sort(
        (a, b) =>
          new Date(timestampToDateString(b.date)).getTime() -
          new Date(timestampToDateString(a.date)).getTime(),
      )[0];

    const userWeight = latestWeight?.poids || 70; // Valeur par défaut si pas de poids
    const proteinGoal = Math.round(userWeight * 1.6); // 1.6g par kg de poids

    let proteinGoalDays = 0;

    // Vérifier chaque jour de la semaine
    for (
      let d = new Date(startOfWeek);
      d <= endOfWeek;
      d.setDate(d.getDate() + 1)
    ) {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayMeals = repas.filter((meal) => {
        const mealDate = new Date(timestampToDateString(meal.date));
        return mealDate >= dayStart && mealDate <= dayEnd;
      });

      const dayProteins = dayMeals.reduce(
        (total, meal) => total + (meal.macros?.prot || 0),
        0,
      );

      console.log(
        `🔍 Jour ${d.toISOString().split('T')[0]}: ${dayMeals.length} repas, ${Math.round(dayProteins)}g protéines (objectif: ${proteinGoal}g)`,
      );

      if (dayProteins >= proteinGoal) {
        proteinGoalDays++;
      }
    }

    console.log('💪 Challenge Tracker - Protéines:', {
      proteinGoal,
      userWeight,
      proteinGoalDays,
      weekBounds: {
        startOfWeek: startOfWeek.toISOString(),
        endOfWeek: endOfWeek.toISOString(),
      },
    });

    // Mettre à jour challenge "Marathon des Protéines"
    const proteinMarathonChallenge = challenges.find(
      (c) => c.title === 'Marathon des Protéines' && c.status === 'active',
    );

    if (
      proteinMarathonChallenge &&
      proteinGoalDays !== proteinMarathonChallenge.current
    ) {
      console.log('🔄 Tentative mise à jour Marathon des Protéines:', {
        challengeId: proteinMarathonChallenge.id,
        oldCurrent: proteinMarathonChallenge.current,
        newCurrent: proteinGoalDays,
        userId: user.uid,
      });

      updateChallenge(proteinMarathonChallenge.id, {
        current: proteinGoalDays,
      }).catch((error) => {
        console.log('❌ Erreur mise à jour Marathon des Protéines:', error);
      });
    }
  }, [user, repas, mesures, challenges, updateChallenge]);

  // Mettre à jour les challenges d'entraînement avancés
  useEffect(() => {
    if (!user || !entrainements || challenges.length === 0) return;

    const { startOfWeek, endOfWeek } = getWeekBounds();
    const { startOfDay, endOfDay } = getTodayBounds();

    const thisWeekTrainings = entrainements.filter((training) => {
      const trainingDate = new Date(timestampToDateString(training.date));
      return trainingDate >= startOfWeek && trainingDate <= endOfWeek;
    });

    const todayTrainings = entrainements.filter((training) => {
      const trainingDate = new Date(timestampToDateString(training.date));
      return trainingDate >= startOfDay && trainingDate <= endOfDay;
    });

    // 1. "7 Jours de Nutrition Parfaite" - 3 repas/jour pendant 7 jours
    const nutritionPerfecteChallenge = challenges.find(
      (c) =>
        c.title === '7 Jours de Nutrition Parfaite' && c.status === 'active',
    );
    if (nutritionPerfecteChallenge) {
      let perfectDays = 0;
      for (
        let d = new Date(startOfWeek);
        d <= endOfWeek;
        d.setDate(d.getDate() + 1)
      ) {
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        const dayMeals = repas.filter((meal) => {
          const mealDate = new Date(timestampToDateString(meal.date));
          return mealDate >= dayStart && mealDate <= dayEnd;
        });

        if (dayMeals.length >= 3) perfectDays++;
      }

      if (perfectDays !== nutritionPerfecteChallenge.current) {
        updateChallenge(nutritionPerfecteChallenge.id, {
          current: perfectDays,
        }).catch(console.error);
      }
    }

    // 2. "Marathon du Temps" - 5h entraînement/semaine (300min)
    const marathonTempsChallenge = challenges.find(
      (c) => c.title === 'Marathon du Temps' && c.status === 'active',
    );
    if (marathonTempsChallenge) {
      const totalMinutes = thisWeekTrainings.reduce(
        (total, training) => total + (training.duree || 0),
        0,
      );
      if (totalMinutes !== marathonTempsChallenge.current) {
        updateChallenge(marathonTempsChallenge.id, {
          current: totalMinutes,
        }).catch(console.error);
      }
    }

    // 3. "Explosif" - 1 entraînement > 2h (120min)
    const explosifChallenge = challenges.find(
      (c) => c.title === 'Explosif' && c.status === 'active',
    );
    if (explosifChallenge) {
      const longTrainings = todayTrainings.filter(
        (training) => (training.duree || 0) > 120,
      ).length;
      if (longTrainings !== explosifChallenge.current) {
        updateChallenge(explosifChallenge.id, { current: longTrainings }).catch(
          console.error,
        );
      }
    }

    // 4. "Cardio Intense" - 500 kcal en une séance
    const cardioIntenseChallenge = challenges.find(
      (c) => c.title === 'Cardio Intense' && c.status === 'active',
    );
    if (cardioIntenseChallenge) {
      const intenseSessions = todayTrainings.filter(
        (training) => (training.calories || 0) >= 500,
      ).length;
      if (intenseSessions !== cardioIntenseChallenge.current) {
        updateChallenge(cardioIntenseChallenge.id, {
          current: intenseSessions,
        }).catch(console.error);
      }
    }

    // 5. "Endurance Extrême" - 1 séance > 90min
    const enduranceChallenge = challenges.find(
      (c) => c.title === 'Endurance Extrême' && c.status === 'active',
    );
    if (enduranceChallenge) {
      const enduranceSessions = todayTrainings.filter(
        (training) => (training.duree || 0) > 90,
      ).length;
      if (enduranceSessions !== enduranceChallenge.current) {
        updateChallenge(enduranceChallenge.id, {
          current: enduranceSessions,
        }).catch(console.error);
      }
    }

    // 6. "Séance Express" - 30min exercice aujourd'hui
    const seanceExpressChallenge = challenges.find(
      (c) => c.title === 'Séance Express' && c.status === 'active',
    );
    if (seanceExpressChallenge) {
      const totalTodayMinutes = todayTrainings.reduce(
        (total, training) => total + (training.duree || 0),
        0,
      );
      const expressCompleted = totalTodayMinutes >= 30 ? 1 : 0;
      if (expressCompleted !== seanceExpressChallenge.current) {
        updateChallenge(seanceExpressChallenge.id, {
          current: expressCompleted,
        }).catch(console.error);
      }
    }

    // 7. "Marathon Mensuel" - 20h entraînement/mois (1200min)
    const marathonMensuelChallenge = challenges.find(
      (c) => c.title === 'Marathon Mensuel' && c.status === 'active',
    );
    if (marathonMensuelChallenge) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthTrainings = entrainements.filter((training) => {
        const trainingDate = new Date(timestampToDateString(training.date));
        return trainingDate >= startOfMonth;
      });

      const totalMonthMinutes = monthTrainings.reduce(
        (total, training) => total + (training.duree || 0),
        0,
      );
      if (totalMonthMinutes !== marathonMensuelChallenge.current) {
        updateChallenge(marathonMensuelChallenge.id, {
          current: totalMonthMinutes,
        }).catch(console.error);
      }
    }
  }, [user, entrainements, challenges, updateChallenge, repas]);

  // Mettre à jour les challenges de journal
  useEffect(() => {
    if (!user || !journalEntries || challenges.length === 0) return;

    const { startOfWeek, endOfWeek } = getWeekBounds();

    // Entrées de journal de cette semaine
    const thisWeekEntries = journalEntries.filter((entry) => {
      const entryDate = new Date(timestampToDateString(entry.date));
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    });

    console.log('📔 Challenge Tracker - Journal:', {
      totalEntries: journalEntries.length,
      thisWeekEntries: thisWeekEntries.length,
      weekBounds: {
        startOfWeek: startOfWeek.toISOString(),
        endOfWeek: endOfWeek.toISOString(),
      },
    });

    // Mettre à jour challenge "Journalier Assidu"
    const journalChallenge = challenges.find(
      (c) => c.title === 'Journalier Assidu' && c.status === 'active',
    );

    if (
      journalChallenge &&
      thisWeekEntries.length !== journalChallenge.current
    ) {
      console.log('🔄 Tentative mise à jour Journalier Assidu:', {
        challengeId: journalChallenge.id,
        oldCurrent: journalChallenge.current,
        newCurrent: thisWeekEntries.length,
        userId: user.uid,
      });

      updateChallenge(journalChallenge.id, {
        current: thisWeekEntries.length,
      }).catch((error) => {
        console.log('❌ Erreur mise à jour Journalier Assidu:', error);
      });
    }

    // Challenges de journal avancés
    // const { startOfDay, endOfDay } = getTodayBounds() // Temporairement désactivé

    // 8. "Suivi Parfait" - 3 mesures cette semaine
    const suiviParfaitChallenge = challenges.find(
      (c) => c.title === 'Suivi Parfait' && c.status === 'active',
    );
    if (suiviParfaitChallenge && mesures) {
      const thisWeekMesures = mesures.filter((mesure) => {
        const mesureDate = new Date(timestampToDateString(mesure.date));
        return mesureDate >= startOfWeek && mesureDate <= endOfWeek;
      });

      if (thisWeekMesures.length !== suiviParfaitChallenge.current) {
        updateChallenge(suiviParfaitChallenge.id, {
          current: thisWeekMesures.length,
        }).catch(console.error);
      }
    }

    // 9. "Humeur Positive" - Humeur 7+ pendant 5 jours
    const humeurPositiveChallenge = challenges.find(
      (c) => c.title === 'Humeur Positive' && c.status === 'active',
    );
    if (humeurPositiveChallenge) {
      let positiveDays = 0;
      for (
        let d = new Date(startOfWeek);
        d <= endOfWeek;
        d.setDate(d.getDate() + 1)
      ) {
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        const dayEntries = journalEntries.filter((entry) => {
          const entryDate = new Date(timestampToDateString(entry.date));
          return (
            entryDate >= dayStart &&
            entryDate <= dayEnd &&
            (entry.humeur || 0) >= 7
          );
        });

        if (dayEntries.length > 0) positiveDays++;
      }

      if (positiveDays !== humeurPositiveChallenge.current) {
        updateChallenge(humeurPositiveChallenge.id, {
          current: positiveDays,
        }).catch(console.error);
      }
    }

    // 10. "Énergie Maximale" - Énergie 8+ pendant 3 jours
    const energieMaximaleChallenge = challenges.find(
      (c) => c.title === 'Énergie Maximale' && c.status === 'active',
    );
    if (energieMaximaleChallenge) {
      let energyDays = 0;
      for (
        let d = new Date(startOfWeek);
        d <= endOfWeek;
        d.setDate(d.getDate() + 1)
      ) {
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        const dayEntries = journalEntries.filter((entry) => {
          const entryDate = new Date(timestampToDateString(entry.date));
          return (
            entryDate >= dayStart &&
            entryDate <= dayEnd &&
            (entry.energie || 0) >= 8
          );
        });

        if (dayEntries.length > 0) energyDays++;
      }

      if (energyDays !== energieMaximaleChallenge.current) {
        updateChallenge(energieMaximaleChallenge.id, {
          current: energyDays,
        }).catch(console.error);
      }
    }

    // 11. "Sommeil de Qualité" - Sommeil 7+ pendant 5 jours
    const sommeilQualiteChallenge = challenges.find(
      (c) => c.title === 'Sommeil de Qualité' && c.status === 'active',
    );
    if (sommeilQualiteChallenge) {
      let sleepDays = 0;
      for (
        let d = new Date(startOfWeek);
        d <= endOfWeek;
        d.setDate(d.getDate() + 1)
      ) {
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        const dayEntries = journalEntries.filter((entry) => {
          const entryDate = new Date(timestampToDateString(entry.date));
          return (
            entryDate >= dayStart &&
            entryDate <= dayEnd &&
            (entry.sommeil_duree || 0) >= 7
          );
        });

        if (dayEntries.length > 0) sleepDays++;
      }

      if (sleepDays !== sommeilQualiteChallenge.current) {
        updateChallenge(sommeilQualiteChallenge.id, {
          current: sleepDays,
        }).catch(console.error);
      }
    }

    // ===== NOUVEAUX CHALLENGES IMPLÉMENTÉS =====

    // 1. Défi Variété - 5 types d'entraînements différents
    const defiVarieteChallenge = challenges.find(
      (c) => c.title === 'Défi Variété' && c.status === 'active',
    );
    if (defiVarieteChallenge) {
      const uniqueTypes = new Set(
        entrainements.map((e) => e.type).filter(Boolean),
      );
      const uniqueTypesCount = uniqueTypes.size;

      if (uniqueTypesCount !== defiVarieteChallenge.current) {
        updateChallenge(defiVarieteChallenge.id, {
          current: uniqueTypesCount,
        }).catch(console.error);
      }
    }

    // 2. Consistance - Entraînements 3x/semaine pendant 4 semaines
    const consistanceChallenge = challenges.find(
      (c) => c.title === 'Consistance' && c.status === 'active',
    );
    if (consistanceChallenge) {
      const { startOfWeek } = getWeekBounds();
      const fourWeeksAgo = new Date(startOfWeek);
      fourWeeksAgo.setDate(startOfWeek.getDate() - 21); // 3 semaines en arrière

      let consistentWeeks = 0;
      for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
        const weekStart = new Date(fourWeeksAgo);
        weekStart.setDate(fourWeeksAgo.getDate() + weekOffset * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weekTrainings = entrainements.filter((e) => {
          const trainingDate = new Date(timestampToDateString(e.date));
          return trainingDate >= weekStart && trainingDate <= weekEnd;
        });

        if (weekTrainings.length >= 3) {
          consistentWeeks++;
        }
      }

      if (consistentWeeks !== consistanceChallenge.current) {
        updateChallenge(consistanceChallenge.id, {
          current: consistentWeeks,
        }).catch(console.error);
      }
    }

    // 3. Récupération - 1 jour de repos entre entraînements intenses
    const recuperationChallenge = challenges.find(
      (c) => c.title === 'Récupération' && c.status === 'active',
    );
    if (recuperationChallenge) {
      const { startOfWeek } = getWeekBounds();
      const twoWeeksAgo = new Date(startOfWeek);
      twoWeeksAgo.setDate(startOfWeek.getDate() - 7); // 1 semaine en arrière

      let recoveryWeeks = 0;
      for (let weekOffset = 0; weekOffset < 2; weekOffset++) {
        const weekStart = new Date(twoWeeksAgo);
        weekStart.setDate(twoWeeksAgo.getDate() + weekOffset * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weekTrainings = entrainements
          .filter((e) => {
            const trainingDate = new Date(timestampToDateString(e.date));
            return trainingDate >= weekStart && trainingDate <= weekEnd;
          })
          .sort(
            (a, b) =>
              new Date(timestampToDateString(a.date)).getTime() -
              new Date(timestampToDateString(b.date)).getTime(),
          );

        // Vérifier qu'il y a au moins 1 jour entre les entraînements intenses
        let hasRecovery = true;
        for (let i = 1; i < weekTrainings.length; i++) {
          const prevDate = new Date(
            timestampToDateString(weekTrainings[i - 1].date),
          );
          const currDate = new Date(
            timestampToDateString(weekTrainings[i].date),
          );
          const daysDiff = Math.floor(
            (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          // Si entraînement intense (durée > 45min ou calories > 300)
          const isIntense =
            (weekTrainings[i - 1].duree || 0) > 45 ||
            (weekTrainings[i - 1].calories || 0) > 300;
          if (isIntense && daysDiff < 1) {
            hasRecovery = false;
            break;
          }
        }

        if (hasRecovery && weekTrainings.length > 0) {
          recoveryWeeks++;
        }
      }

      if (recoveryWeeks !== recuperationChallenge.current) {
        updateChallenge(recuperationChallenge.id, {
          current: recoveryWeeks,
        }).catch(console.error);
      }
    }

    // 4. Matin Productif - Entraînements avant 10h
    const matinProductifChallenge = challenges.find(
      (c) => c.title === 'Matin Productif' && c.status === 'active',
    );
    if (matinProductifChallenge) {
      const { startOfWeek } = getWeekBounds();
      const twoWeeksAgo = new Date(startOfWeek);
      twoWeeksAgo.setDate(startOfWeek.getDate() - 7); // 1 semaine en arrière

      const morningTrainings = entrainements
        .filter((e) => {
          const trainingDate = new Date(timestampToDateString(e.date));
          return trainingDate >= twoWeeksAgo && trainingDate <= new Date();
        })
        .filter((e) => {
          // Vérifier si l'entraînement était avant 10h
          // Note: On assume que les entraînements créés avant 10h sont des entraînements matinaux
          // Utiliser la date de l'entraînement avec une heure par défaut de 9h (matin)
          const trainingDate = new Date(
            timestampToDateString(e.date) + 'T09:00:00',
          );
          return trainingDate.getHours() < 10;
        });

      if (morningTrainings.length !== matinProductifChallenge.current) {
        updateChallenge(matinProductifChallenge.id, {
          current: morningTrainings.length,
        }).catch(console.error);
      }
    }
  }, [
    user,
    journalEntries,
    mesures,
    challenges,
    entrainements,
    updateChallenge,
  ]);

  return {
    // Retourner des méthodes utilitaires si nécessaire
    getWeekBounds,
    getTodayBounds,
  };
}
