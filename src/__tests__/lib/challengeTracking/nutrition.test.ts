/**
 * Tests - Challenge Tracking Nutrition
 *
 * Tests unitaires pour les calculs de progression nutrition
 * Couverture: 100% des fonctions et edge cases
 *
 * @vitest-environment jsdom
 * @created 23.10.2025
 */

import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import type { Repas, Mesure } from '@/types';
import {
  countTodayMeals,
  countPerfectNutritionDays,
  countProteinGoalDays,
  calculateProteinGoal,
} from '@/lib/challengeTracking/nutrition';

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
 * Crée un repas mock
 */
function createMockRepas(date: Date, proteines: number = 30): Repas {
  return {
    id: `repas-${Math.random()}`,
    user_id: 'test-user',
    date: createTimestamp(date),
    type: 'petit-dejeuner' as const,
    aliments: [],
    macros: {
      cal: 500,
      prot: proteines,
      carbs: 50,
      fat: 20,
    },
  };
}

/**
 * Crée une mesure mock
 */
function createMockMesure(date: Date, poids: number): Mesure {
  return {
    id: `mesure-${Math.random()}`,
    user_id: 'test-user',
    date: createTimestamp(date),
    poids,
  };
}

// ========================================
// Tests countTodayMeals
// ========================================

describe('countTodayMeals', () => {
  it('doit compter les repas du jour', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const repas: Repas[] = [
      createMockRepas(new Date(2025, 0, 15, 8, 0, 0)),
      createMockRepas(new Date(2025, 0, 15, 12, 0, 0)),
      createMockRepas(new Date(2025, 0, 15, 19, 0, 0)),
    ];

    const count = countTodayMeals(repas, today);
    expect(count).toBe(3);
  });

  it('doit ignorer les repas d\'hier', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const repas: Repas[] = [
      createMockRepas(new Date(2025, 0, 14, 8, 0, 0)),
      createMockRepas(new Date(2025, 0, 15, 12, 0, 0)),
    ];

    const count = countTodayMeals(repas, today);
    expect(count).toBe(1);
  });

  it('doit ignorer les repas de demain', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const repas: Repas[] = [
      createMockRepas(new Date(2025, 0, 15, 12, 0, 0)),
      createMockRepas(new Date(2025, 0, 16, 8, 0, 0)),
    ];

    const count = countTodayMeals(repas, today);
    expect(count).toBe(1);
  });

  it('doit retourner 0 si aucun repas', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const count = countTodayMeals([], today);
    expect(count).toBe(0);
  });

  it('doit gérer les repas à minuit', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const repas: Repas[] = [
      createMockRepas(new Date(2025, 0, 15, 0, 0, 0)),
      createMockRepas(new Date(2025, 0, 15, 23, 59, 59)),
    ];

    const count = countTodayMeals(repas, today);
    expect(count).toBe(2);
  });
});

// ========================================
// Tests countPerfectNutritionDays
// ========================================

describe('countPerfectNutritionDays', () => {
  it('doit compter les jours avec 3+ repas cette semaine', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0); // Mercredi
    const repas: Repas[] = [
      // Lundi: 3 repas ✓
      createMockRepas(new Date(2025, 0, 13, 8, 0, 0)),
      createMockRepas(new Date(2025, 0, 13, 12, 0, 0)),
      createMockRepas(new Date(2025, 0, 13, 19, 0, 0)),
      // Mardi: 2 repas ✗
      createMockRepas(new Date(2025, 0, 14, 8, 0, 0)),
      createMockRepas(new Date(2025, 0, 14, 12, 0, 0)),
      // Mercredi: 4 repas ✓
      createMockRepas(new Date(2025, 0, 15, 8, 0, 0)),
      createMockRepas(new Date(2025, 0, 15, 10, 0, 0)),
      createMockRepas(new Date(2025, 0, 15, 12, 0, 0)),
      createMockRepas(new Date(2025, 0, 15, 19, 0, 0)),
    ];

    const count = countPerfectNutritionDays(repas, 3, today);
    expect(count).toBe(2); // Lundi + Mercredi
  });

  it('doit accepter un seuil personnalisé', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const repas: Repas[] = [
      createMockRepas(new Date(2025, 0, 15, 8, 0, 0)),
      createMockRepas(new Date(2025, 0, 15, 12, 0, 0)),
    ];

    const count = countPerfectNutritionDays(repas, 2, today);
    expect(count).toBe(1);
  });

  it('doit retourner 0 si aucun repas', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const count = countPerfectNutritionDays([], 3, today);
    expect(count).toBe(0);
  });

  it('doit compter toute la semaine (lundi à dimanche)', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0); // Mercredi
    const repas: Repas[] = [
      // Dimanche précédent (semaine précédente)
      createMockRepas(new Date(2025, 0, 12, 8, 0, 0)),
      createMockRepas(new Date(2025, 0, 12, 12, 0, 0)),
      createMockRepas(new Date(2025, 0, 12, 19, 0, 0)),
      // Lundi (cette semaine) ✓
      createMockRepas(new Date(2025, 0, 13, 8, 0, 0)),
      createMockRepas(new Date(2025, 0, 13, 12, 0, 0)),
      createMockRepas(new Date(2025, 0, 13, 19, 0, 0)),
    ];

    const count = countPerfectNutritionDays(repas, 3, today);
    expect(count).toBe(1); // Seulement lundi de cette semaine
  });
});

// ========================================
// Tests countProteinGoalDays
// ========================================

describe('countProteinGoalDays', () => {
  it('doit compter les jours où l\'objectif protéines est atteint', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0); // Mercredi
    const repas: Repas[] = [
      // Lundi: 160g protéines ✓
      createMockRepas(new Date(2025, 0, 13, 8, 0, 0), 60),
      createMockRepas(new Date(2025, 0, 13, 12, 0, 0), 50),
      createMockRepas(new Date(2025, 0, 13, 19, 0, 0), 50),
      // Mardi: 100g protéines ✗
      createMockRepas(new Date(2025, 0, 14, 8, 0, 0), 50),
      createMockRepas(new Date(2025, 0, 14, 12, 0, 0), 50),
      // Mercredi: 150g protéines ✓ (juste assez)
      createMockRepas(new Date(2025, 0, 15, 8, 0, 0), 50),
      createMockRepas(new Date(2025, 0, 15, 12, 0, 0), 50),
      createMockRepas(new Date(2025, 0, 15, 19, 0, 0), 50),
    ];

    const count = countProteinGoalDays(repas, 150, today);
    expect(count).toBe(2); // Lundi + Mercredi
  });

  it('doit gérer les repas sans macros', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const repas: Repas[] = [
      {
        ...createMockRepas(new Date(2025, 0, 15, 8, 0, 0)),
        macros: undefined,
      },
      createMockRepas(new Date(2025, 0, 15, 12, 0, 0), 150),
    ];

    const count = countProteinGoalDays(repas, 150, today);
    expect(count).toBe(1); // Seulement le 2e repas compte
  });

  it('doit retourner 0 si aucun jour n\'atteint l\'objectif', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const repas: Repas[] = [
      createMockRepas(new Date(2025, 0, 15, 8, 0, 0), 30),
      createMockRepas(new Date(2025, 0, 15, 12, 0, 0), 30),
    ];

    const count = countProteinGoalDays(repas, 150, today);
    expect(count).toBe(0);
  });

  it('doit retourner 0 si aucun repas', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const count = countProteinGoalDays([], 150, today);
    expect(count).toBe(0);
  });
});

// ========================================
// Tests calculateProteinGoal
// ========================================

describe('calculateProteinGoal', () => {
  it('doit calculer l\'objectif basé sur le poids le plus récent', () => {
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 10), 70),
      createMockMesure(new Date(2025, 0, 15), 75), // Plus récent
      createMockMesure(new Date(2025, 0, 12), 72),
    ];

    const goal = calculateProteinGoal(mesures);
    expect(goal).toBe(120); // 75kg × 1.6 = 120g
  });

  it('doit utiliser le poids par défaut si aucune mesure', () => {
    const goal = calculateProteinGoal([]);
    expect(goal).toBe(112); // 70kg (défaut) × 1.6 = 112g
  });

  it('doit accepter un poids par défaut personnalisé', () => {
    const goal = calculateProteinGoal([], 80);
    expect(goal).toBe(128); // 80kg × 1.6 = 128g
  });

  it('doit ignorer les mesures sans poids', () => {
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 15), 75),
      {
        ...createMockMesure(new Date(2025, 0, 16), 0),
        poids: undefined,
      },
    ];

    const goal = calculateProteinGoal(mesures);
    expect(goal).toBe(120); // Utilise la mesure du 15 (75kg)
  });

  it('doit ignorer les mesures avec poids zéro ou négatif', () => {
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 15), 75),
      createMockMesure(new Date(2025, 0, 16), 0),
      createMockMesure(new Date(2025, 0, 17), -5),
    ];

    const goal = calculateProteinGoal(mesures);
    expect(goal).toBe(120); // Utilise 75kg
  });

  it('doit arrondir le résultat', () => {
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 15), 77.5),
    ];

    const goal = calculateProteinGoal(mesures);
    expect(goal).toBe(124); // 77.5 × 1.6 = 124
  });
});

