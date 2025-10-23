/**
 * Tests - Challenge Tracking Training
 *
 * Tests unitaires pour les calculs de progression entraînement
 * Couverture: 100% des fonctions et edge cases
 *
 * @vitest-environment jsdom
 * @created 23.10.2025
 */

import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import type { Entrainement } from '@/types';
import {
  countTodayTrainings,
  countWeekTrainings,
  calculateWeekTrainingTime,
  calculateWeekTrainingVolume,
  calculateTrainingStreak,
  filterCardioTrainings,
  filterStrengthTrainings,
} from '@/lib/challengeTracking/training';
import { getWeekBounds } from '@/lib/challengeTracking/utils';

// ========================================
// Helpers
// ========================================

/**
 * Crée un Timestamp Firestore à partir d'une date
 */
function createTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

/**
 * Crée un entraînement cardio mock
 */
function createMockCardio(date: Date, duree: number = 60): Entrainement {
  return {
    id: `cardio-${Math.random()}`,
    user_id: 'test-user',
    date: createTimestamp(date),
    type: 'cardio' as const,
    duree,
    calories: 500,
  };
}

/**
 * Crée un entraînement musculation mock
 */
function createMockMusculation(
  date: Date,
  duree: number = 60,
  exercices: Array<{
    nom: string;
    series: Array<{ reps: number; poids: number }>;
  }> = [],
): Entrainement {
  return {
    id: `musculation-${Math.random()}`,
    user_id: 'test-user',
    date: createTimestamp(date),
    type: 'musculation' as const,
    duree,
    calories: 300,
    exercices: exercices.map((ex) => ({
      nom: ex.nom,
      series: ex.series.map((s) => ({
        reps: s.reps,
        poids: s.poids,
        completed: true,
      })),
    })),
  };
}

// ========================================
// Tests countTodayTrainings
// ========================================

describe('countTodayTrainings', () => {
  it('doit compter les entraînements du jour', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 15, 8, 0, 0)),
      createMockMusculation(new Date(2025, 0, 15, 18, 0, 0)),
    ];

    const count = countTodayTrainings(entrainements, today);
    expect(count).toBe(2);
  });

  it('doit ignorer les entraînements d\'hier', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 14, 8, 0, 0)),
      createMockCardio(new Date(2025, 0, 15, 12, 0, 0)),
    ];

    const count = countTodayTrainings(entrainements, today);
    expect(count).toBe(1);
  });

  it('doit retourner 0 si aucun entraînement', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const count = countTodayTrainings([], today);
    expect(count).toBe(0);
  });
});

// ========================================
// Tests countWeekTrainings
// ========================================

describe('countWeekTrainings', () => {
  it('doit compter les entraînements cette semaine', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0); // Mercredi
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 13, 8, 0, 0)), // Lundi
      createMockMusculation(new Date(2025, 0, 14, 8, 0, 0)), // Mardi
      createMockCardio(new Date(2025, 0, 15, 8, 0, 0)), // Mercredi
      createMockMusculation(new Date(2025, 0, 16, 8, 0, 0)), // Jeudi
      createMockCardio(new Date(2025, 0, 17, 8, 0, 0)), // Vendredi
    ];

    const count = countWeekTrainings(entrainements, today);
    expect(count).toBe(5);
  });

  it('doit ignorer les entraînements de la semaine précédente', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 12, 8, 0, 0)), // Dimanche précédent
      createMockCardio(new Date(2025, 0, 15, 8, 0, 0)), // Mercredi
    ];

    const count = countWeekTrainings(entrainements, today);
    expect(count).toBe(1);
  });

  it('doit retourner 0 si aucun entraînement', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const count = countWeekTrainings([], today);
    expect(count).toBe(0);
  });
});

// ========================================
// Tests calculateWeekTrainingTime
// ========================================

describe('calculateWeekTrainingTime', () => {
  it('doit calculer le temps total cette semaine', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 13, 8, 0, 0), 60),
      createMockMusculation(new Date(2025, 0, 14, 8, 0, 0), 90),
      createMockCardio(new Date(2025, 0, 15, 8, 0, 0), 45),
    ];

    const time = calculateWeekTrainingTime(entrainements, today);
    expect(time).toBe(195); // 60 + 90 + 45 = 195 minutes
  });

  it('doit gérer les entraînements sans durée', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 15, 8, 0, 0), 60),
      {
        ...createMockCardio(new Date(2025, 0, 15, 12, 0, 0)),
        duree: undefined,
      },
    ];

    const time = calculateWeekTrainingTime(entrainements, today);
    expect(time).toBe(60);
  });

  it('doit retourner 0 si aucun entraînement', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const time = calculateWeekTrainingTime([], today);
    expect(time).toBe(0);
  });
});

// ========================================
// Tests calculateWeekTrainingVolume
// ========================================

describe('calculateWeekTrainingVolume', () => {
  it('doit calculer le volume total de musculation cette semaine', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockMusculation(new Date(2025, 0, 13, 8, 0, 0), 60, [
        {
          nom: 'Squat',
          series: [
            { reps: 10, poids: 100 }, // 1000 kg
            { reps: 8, poids: 120 }, // 960 kg
          ],
        },
      ]),
      createMockMusculation(new Date(2025, 0, 15, 8, 0, 0), 60, [
        {
          nom: 'Bench Press',
          series: [
            { reps: 10, poids: 80 }, // 800 kg
          ],
        },
      ]),
    ];

    const volume = calculateWeekTrainingVolume(entrainements, today);
    expect(volume).toBe(2760); // 1000 + 960 + 800 = 2760 kg
  });

  it('doit ignorer les entraînements cardio', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 15, 8, 0, 0), 60),
      createMockMusculation(new Date(2025, 0, 15, 10, 0, 0), 60, [
        {
          nom: 'Squat',
          series: [{ reps: 10, poids: 100 }],
        },
      ]),
    ];

    const volume = calculateWeekTrainingVolume(entrainements, today);
    expect(volume).toBe(1000); // Seulement le squat
  });

  it('doit gérer les entraînements sans exercices', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockMusculation(new Date(2025, 0, 15, 8, 0, 0), 60, []),
    ];

    const volume = calculateWeekTrainingVolume(entrainements, today);
    expect(volume).toBe(0);
  });

  it('doit retourner 0 si aucun entraînement', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const volume = calculateWeekTrainingVolume([], today);
    expect(volume).toBe(0);
  });
});

// ========================================
// Tests calculateTrainingStreak
// ========================================

describe('calculateTrainingStreak', () => {
  it('doit calculer la streak si entraînement aujourd\'hui', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 15, 8, 0, 0)), // Aujourd'hui
      createMockCardio(new Date(2025, 0, 14, 8, 0, 0)), // Hier
      createMockCardio(new Date(2025, 0, 13, 8, 0, 0)), // Avant-hier
    ];

    const streak = calculateTrainingStreak(entrainements, today);
    expect(streak).toBe(3);
  });

  it('doit calculer la streak si entraînement hier (tolérance)', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 14, 8, 0, 0)), // Hier
      createMockCardio(new Date(2025, 0, 13, 8, 0, 0)), // Avant-hier
    ];

    const streak = calculateTrainingStreak(entrainements, today);
    expect(streak).toBe(2);
  });

  it('doit retourner 0 si dernier entraînement > 1 jour', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 13, 8, 0, 0)), // Il y a 2 jours
      createMockCardio(new Date(2025, 0, 12, 8, 0, 0)),
    ];

    const streak = calculateTrainingStreak(entrainements, today);
    expect(streak).toBe(0);
  });

  it('doit s\'arrêter si un jour est manquant', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 15, 8, 0, 0)), // Aujourd'hui
      createMockCardio(new Date(2025, 0, 14, 8, 0, 0)), // Hier
      // Manque le 13
      createMockCardio(new Date(2025, 0, 12, 8, 0, 0)),
    ];

    const streak = calculateTrainingStreak(entrainements, today);
    expect(streak).toBe(2); // Seulement 15 et 14
  });

  it('doit gérer plusieurs entraînements par jour', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 15, 8, 0, 0)),
      createMockMusculation(new Date(2025, 0, 15, 18, 0, 0)),
      createMockCardio(new Date(2025, 0, 14, 8, 0, 0)),
    ];

    const streak = calculateTrainingStreak(entrainements, today);
    expect(streak).toBe(2); // 2 jours distincts
  });

  it('doit retourner 0 si aucun entraînement', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const streak = calculateTrainingStreak([], today);
    expect(streak).toBe(0);
  });
});

// ========================================
// Tests filterCardioTrainings
// ========================================

describe('filterCardioTrainings', () => {
  it('doit filtrer seulement les entraînements cardio', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const bounds = getWeekBounds(today);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 15, 8, 0, 0)),
      createMockMusculation(new Date(2025, 0, 15, 10, 0, 0)),
      createMockCardio(new Date(2025, 0, 15, 18, 0, 0)),
    ];

    const cardio = filterCardioTrainings(entrainements, bounds);
    expect(cardio).toHaveLength(2);
    expect(cardio.every((e) => e.type === 'cardio')).toBe(true);
  });

  it('doit respecter les limites de date', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const bounds = getWeekBounds(today);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 12, 8, 0, 0)), // Semaine précédente
      createMockCardio(new Date(2025, 0, 15, 8, 0, 0)), // Cette semaine
    ];

    const cardio = filterCardioTrainings(entrainements, bounds);
    expect(cardio).toHaveLength(1);
  });
});

// ========================================
// Tests filterStrengthTrainings
// ========================================

describe('filterStrengthTrainings', () => {
  it('doit filtrer seulement les entraînements musculation', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const bounds = getWeekBounds(today);
    const entrainements: Entrainement[] = [
      createMockCardio(new Date(2025, 0, 15, 8, 0, 0)),
      createMockMusculation(new Date(2025, 0, 15, 10, 0, 0)),
      createMockMusculation(new Date(2025, 0, 15, 18, 0, 0)),
    ];

    const musculation = filterStrengthTrainings(entrainements, bounds);
    expect(musculation).toHaveLength(2);
    expect(musculation.every((e) => e.type === 'musculation')).toBe(true);
  });

  it('doit respecter les limites de date', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const bounds = getWeekBounds(today);
    const entrainements: Entrainement[] = [
      createMockMusculation(new Date(2025, 0, 12, 8, 0, 0)), // Semaine précédente
      createMockMusculation(new Date(2025, 0, 15, 8, 0, 0)), // Cette semaine
    ];

    const musculation = filterStrengthTrainings(entrainements, bounds);
    expect(musculation).toHaveLength(1);
  });
});

