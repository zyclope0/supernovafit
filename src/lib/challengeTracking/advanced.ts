// Challenges Avancés - Calculs complexes et dépendances multiples
// import { Timestamp } from 'firebase/firestore'; // Temporarily unused
import type { Entrainement, Repas, Mesure, JournalEntry } from '@/types';
import {
  getWeekBounds,
  getTodayBounds,
  getMonthBounds,
  isDateInBounds,
} from './utils';

// ===== CHALLENGES DE PERFORMANCE COMPLEXE =====

/**
 * Challenge: "Machine à Entraînement" - 50 entraînements complétés
 * Calcul: Total d'entraînements sur toute la période
 */
export function calculateTotalTrainings(
  entrainements: Entrainement[],
  startDate?: Date,
  endDate?: Date,
): number {
  if (!startDate || !endDate) {
    return entrainements.length;
  }

  return entrainements.filter((entrainement) => {
    const entrainementDate = entrainement.date.toDate();
    return entrainementDate >= startDate && entrainementDate <= endDate;
  }).length;
}

/**
 * Challenge: "Nutritionniste" - 500 repas trackés
 * Calcul: Total de repas sur toute la période
 */
export function calculateTotalMeals(
  repas: Repas[],
  startDate?: Date,
  endDate?: Date,
): number {
  if (!startDate || !endDate) {
    return repas.length;
  }

  return repas.filter((repas) => {
    const repasDate = repas.date.toDate();
    return repasDate >= startDate && repasDate <= endDate;
  }).length;
}

/**
 * Challenge: "Marathon du Temps" - 20h d'entraînement en une semaine
 * Calcul: Somme des durées d'entraînements sur une semaine
 */
export function calculateWeekTrainingTime(
  entrainements: Entrainement[],
  weekStart: Date,
): number {
  const weekBounds = getWeekBounds(weekStart);

  return entrainements
    .filter((entrainement) => {
      const entrainementDate = entrainement.date.toDate();
      return isDateInBounds(entrainementDate, weekBounds);
    })
    .reduce((total, entrainement) => total + (entrainement.duree || 0), 0);
}

/**
 * Challenge: "Volume Monstre" - 1000 minutes d'entraînement en un mois
 * Calcul: Somme des durées d'entraînements sur un mois
 */
export function calculateMonthTrainingVolume(
  entrainements: Entrainement[],
  monthStart: Date,
): number {
  const monthBounds = getMonthBounds(monthStart);

  return entrainements
    .filter((entrainement) => {
      const entrainementDate = entrainement.date.toDate();
      return isDateInBounds(entrainementDate, monthBounds);
    })
    .reduce((total, entrainement) => total + (entrainement.duree || 0), 0);
}

// ===== CHALLENGES DE STREAK COMPLEXE =====

/**
 * Challenge: "Streak Master" - 30 jours d'activité consécutifs
 * Calcul: Plus longue séquence de jours avec au moins une activité
 */
export function calculateLongestActivityStreak(
  entrainements: Entrainement[],
  repas: Repas[],
  mesures: Mesure[],
  journal: JournalEntry[],
): number {
  // Créer un Set de toutes les dates avec activité
  const activityDates = new Set<string>();

  [...entrainements, ...repas, ...mesures, ...journal].forEach((item) => {
    const date =
      typeof item.date === 'string' ? new Date(item.date) : item.date.toDate();
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
 * Challenge: "Consistance Parfaite" - 14 jours d'utilisation consécutifs
 * Calcul: Streak de connexion quotidienne (basé sur toute activité)
 */
export function calculateDailyUsageStreak(
  entrainements: Entrainement[],
  repas: Repas[],
  mesures: Mesure[],
  journal: JournalEntry[],
): number {
  return calculateLongestActivityStreak(entrainements, repas, mesures, journal);
}

// ===== CHALLENGES DE PERFORMANCE NUTRITIONNELLE =====

/**
 * Challenge: "Défi Équilibre" - Ratio macros optimal pendant 7 jours
 * Calcul: Pourcentage de jours avec ratio protéines optimal (25-35%)
 */
export function calculateOptimalMacroDays(
  repas: Repas[],
  weekStart: Date,
): number {
  const weekBounds = getWeekBounds(weekStart);
  const weekRepas = repas.filter((repas) => {
    const repasDate = repas.date.toDate();
    return isDateInBounds(repasDate, weekBounds);
  });

  // Grouper par jour
  const dailyRepas = new Map<string, Repas[]>();
  weekRepas.forEach((repas) => {
    const dateStr = repas.date.toDate().toISOString().split('T')[0];
    if (!dailyRepas.has(dateStr)) {
      dailyRepas.set(dateStr, []);
    }
    dailyRepas.get(dateStr)!.push(repas);
  });

  let optimalDays = 0;

  dailyRepas.forEach((dayRepas) => {
    // Calculer les macros totaux du jour
    const totalMacros = dayRepas.reduce(
      (acc, repas) => ({
        kcal: acc.kcal + repas.macros.kcal,
        prot: acc.prot + repas.macros.prot,
        glucides: acc.glucides + repas.macros.glucides,
        lipides: acc.lipides + repas.macros.lipides,
      }),
      { kcal: 0, prot: 0, glucides: 0, lipides: 0 },
    );

    // Calculer le ratio protéines (kcal protéines / kcal totales)
    const proteinKcal = totalMacros.prot * 4; // 1g protéine = 4kcal
    const totalKcal = totalMacros.kcal;

    if (totalKcal > 0) {
      const proteinRatio = (proteinKcal / totalKcal) * 100;
      // Ratio optimal: 25-35% de protéines
      if (proteinRatio >= 25 && proteinRatio <= 35) {
        optimalDays++;
      }
    }
  });

  return optimalDays;
}

/**
 * Challenge: "Défi Variété" - 20 aliments différents en une semaine
 * Calcul: Nombre d'aliments uniques consommés
 */
export function calculateUniqueFoodsCount(
  repas: Repas[],
  weekStart: Date,
): number {
  const weekBounds = getWeekBounds(weekStart);
  const weekRepas = repas.filter((repas) => {
    const repasDate = repas.date.toDate();
    return isDateInBounds(repasDate, weekBounds);
  });

  const uniqueFoods = new Set<string>();

  weekRepas.forEach((repas) => {
    repas.aliments.forEach((aliment) => {
      uniqueFoods.add(aliment.nom_lower);
    });
  });

  return uniqueFoods.size;
}

// ===== CHALLENGES DE TRANSFORMATION =====

/**
 * Challenge: "Transformation du Mois" - Perte de 2kg en un mois
 * Calcul: Différence de poids entre début et fin de mois
 */
export function calculateWeightLoss(
  mesures: Mesure[],
  monthStart: Date,
): number {
  const monthBounds = getMonthBounds(monthStart);
  const monthMesures = mesures
    .filter((mesure) => {
      const mesureDate =
        typeof mesure.date === 'string'
          ? new Date(mesure.date)
          : (mesure.date as any).toDate();
      return isDateInBounds(mesureDate, monthBounds);
    })
    .sort((a, b) => {
      const dateA =
        typeof a.date === 'string'
          ? new Date(a.date)
          : (a.date as any).toDate();
      const dateB =
        typeof b.date === 'string'
          ? new Date(b.date)
          : (b.date as any).toDate();
      return dateA.getTime() - dateB.getTime();
    });

  if (monthMesures.length < 2) return 0;

  const firstWeight = monthMesures[0].poids || 0;
  const lastWeight = monthMesures[monthMesures.length - 1].poids || 0;

  return firstWeight - lastWeight; // Positif = perte de poids
}

/**
 * Challenge: "Gain de Masse" - Prise de 1kg en un mois
 * Calcul: Différence de poids positive
 */
export function calculateWeightGain(
  mesures: Mesure[],
  monthStart: Date,
): number {
  const weightLoss = calculateWeightLoss(mesures, monthStart);
  return Math.max(0, -weightLoss); // Négatif de la perte = gain
}

// ===== CHALLENGES DE RÉCUPÉRATION =====

/**
 * Challenge: "Récupération Active" - 3 séances de yoga/stretching par semaine
 * Calcul: Nombre de séances de récupération (détection par commentaire)
 */
export function calculateRecoverySessions(
  entrainements: Entrainement[],
  weekStart: Date,
): number {
  const weekBounds = getWeekBounds(weekStart);
  const weekEntrainements = entrainements.filter((entrainement) => {
    const entrainementDate = entrainement.date.toDate();
    return isDateInBounds(entrainementDate, weekBounds);
  });

  // Détecter les séances de récupération par mots-clés dans le commentaire
  const recoveryKeywords = [
    'yoga',
    'stretching',
    'récupération',
    'relaxation',
    'méditation',
  ];

  return weekEntrainements.filter((entrainement) => {
    const commentaire = (entrainement.commentaire || '').toLowerCase();
    return recoveryKeywords.some((keyword) => commentaire.includes(keyword));
  }).length;
}

// ===== CHALLENGES DE PERFORMANCE CARDIO =====

/**
 * Challenge: "Cardio Intense" - 5 séances cardio > 30min en une semaine
 * Calcul: Nombre de séances cardio longues
 */
export function calculateIntenseCardioSessions(
  entrainements: Entrainement[],
  weekStart: Date,
): number {
  const weekBounds = getWeekBounds(weekStart);
  const weekEntrainements = entrainements.filter((entrainement) => {
    const entrainementDate = entrainement.date.toDate();
    return isDateInBounds(entrainementDate, weekBounds);
  });

  return weekEntrainements.filter(
    (entrainement) =>
      entrainement.type === 'cardio' && (entrainement.duree || 0) >= 30,
  ).length;
}

/**
 * Challenge: "Endurance Extrême" - 2h de cardio en une semaine
 * Calcul: Temps total de cardio
 */
export function calculateTotalCardioTime(
  entrainements: Entrainement[],
  weekStart: Date,
): number {
  const weekBounds = getWeekBounds(weekStart);
  const weekEntrainements = entrainements.filter((entrainement) => {
    const entrainementDate = entrainement.date.toDate();
    return isDateInBounds(entrainementDate, weekBounds);
  });

  return weekEntrainements
    .filter((entrainement) => entrainement.type === 'cardio')
    .reduce((total, entrainement) => total + (entrainement.duree || 0), 0);
}

// ===== CHALLENGES DE PERFORMANCE MUSCULATION =====

/**
 * Challenge: "Force Pure" - 10 séances de musculation en une semaine
 * Calcul: Nombre de séances de musculation
 */
export function calculateStrengthSessions(
  entrainements: Entrainement[],
  weekStart: Date,
): number {
  const weekBounds = getWeekBounds(weekStart);
  const weekEntrainements = entrainements.filter((entrainement) => {
    const entrainementDate = entrainement.date.toDate();
    return isDateInBounds(entrainementDate, weekBounds);
  });

  return weekEntrainements.filter(
    (entrainement) => entrainement.type === 'musculation',
  ).length;
}

/**
 * Challenge: "Volume Monstre" - 1000kg soulevés en une semaine
 * Calcul: Volume total (séries × répétitions × poids)
 */
export function calculateTotalVolume(
  entrainements: Entrainement[],
  weekStart: Date,
): number {
  const weekBounds = getWeekBounds(weekStart);
  const weekEntrainements = entrainements.filter((entrainement) => {
    const entrainementDate = entrainement.date.toDate();
    return isDateInBounds(entrainementDate, weekBounds);
  });

  return weekEntrainements
    .filter((entrainement) => entrainement.type === 'musculation')
    .reduce((total, entrainement) => {
      if (!entrainement.exercices) return total;

      return (
        total +
        entrainement.exercices.reduce((exerciseTotal, exercice) => {
          return (
            exerciseTotal +
            exercice.series * exercice.repetitions * (exercice.poids || 0)
          );
        }, 0)
      );
    }, 0);
}

// ===== CHALLENGES DE BIEN-ÊTRE =====

/**
 * Challenge: "Humeur Positive" - 5 jours avec humeur 7+ en une semaine
 * Calcul: Nombre de jours avec humeur élevée
 */
export function calculatePositiveMoodDays(
  journal: JournalEntry[],
  weekStart: Date,
): number {
  const weekBounds = getWeekBounds(weekStart);
  const weekJournal = journal.filter((entry) => {
    const entryDate = entry.date.toDate();
    return isDateInBounds(entryDate, weekBounds);
  });

  return weekJournal.filter((entry) => entry.humeur >= 7).length;
}

/**
 * Challenge: "Énergie Maximale" - 3 jours avec énergie 8+ en une semaine
 * Calcul: Nombre de jours avec énergie élevée
 */
export function calculateHighEnergyDays(
  journal: JournalEntry[],
  weekStart: Date,
): number {
  const weekBounds = getWeekBounds(weekStart);
  const weekJournal = journal.filter((entry) => {
    const entryDate = entry.date.toDate();
    return isDateInBounds(entryDate, weekBounds);
  });

  return weekJournal.filter((entry) => entry.energie >= 8).length;
}

/**
 * Challenge: "Sommeil de Qualité" - 5 jours avec sommeil 7+ en une semaine
 * Calcul: Nombre de jours avec sommeil de qualité
 */
export function calculateQualitySleepDays(
  journal: JournalEntry[],
  weekStart: Date,
): number {
  const weekBounds = getWeekBounds(weekStart);
  const weekJournal = journal.filter((entry) => {
    const entryDate = entry.date.toDate();
    return isDateInBounds(entryDate, weekBounds);
  });

  return weekJournal.filter((entry) => (entry.sommeil || 0) >= 7).length;
}

// ===== CHALLENGES DE GRATITUDE =====

/**
 * Challenge: "Gratitude" - 3 points de gratitude dans le journal
 * Calcul: Analyse du contenu textuel pour détecter la gratitude
 */
export function calculateGratitudePoints(
  journal: JournalEntry[],
  dayStart: Date,
): number {
  const dayBounds = getTodayBounds(dayStart);
  const dayJournal = journal.filter((entry) => {
    const entryDate = entry.date.toDate();
    return isDateInBounds(entryDate, dayBounds);
  });

  let gratitudePoints = 0;

  dayJournal.forEach((entry) => {
    if (entry.note) {
      const note = entry.note.toLowerCase();
      // Mots-clés de gratitude
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

      gratitudeKeywords.forEach((keyword) => {
        if (note.includes(keyword)) {
          gratitudePoints++;
        }
      });
    }
  });

  return Math.min(gratitudePoints, 3); // Max 3 points par jour
}

// ===== CHALLENGES DE MÉDITATION =====

/**
 * Challenge: "Méditation" - 10 minutes de méditation
 * Calcul: Détection par mot-clé dans le journal
 */
export function calculateMeditationTime(
  journal: JournalEntry[],
  dayStart: Date,
): number {
  const dayBounds = getTodayBounds(dayStart);
  const dayJournal = journal.filter((entry) => {
    const entryDate = entry.date.toDate();
    return isDateInBounds(entryDate, dayBounds);
  });

  let meditationTime = 0;

  dayJournal.forEach((entry) => {
    if (entry.note) {
      const note = entry.note.toLowerCase();
      // Détecter les mentions de méditation
      const meditationKeywords = [
        'méditation',
        'méditer',
        'mindfulness',
        'respiration',
        'calme',
      ];

      if (meditationKeywords.some((keyword) => note.includes(keyword))) {
        // Extraire le temps mentionné (regex simple)
        const timeMatch = note.match(/(\d+)\s*(min|minute|minutes)/);
        if (timeMatch) {
          meditationTime += parseInt(timeMatch[1]);
        } else {
          // Par défaut, 10 minutes si mentionné sans durée
          meditationTime += 10;
        }
      }
    }
  });

  return Math.min(meditationTime, 60); // Max 60 minutes par jour
}
