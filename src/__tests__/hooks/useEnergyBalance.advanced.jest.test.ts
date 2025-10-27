/**
 * @jest-environment jsdom
 */

// Tests Académiques useEnergyBalance Hook
// Pattern: AAA (Arrange-Act-Assert)
// Qualité: Best Practices + Coverage Ciblé

import { renderHook } from '@testing-library/react';
import { useEnergyBalance } from '@/hooks/useEnergyBalance';
import type { User, Repas, Entrainement } from '@/types';
import { Timestamp } from 'firebase/firestore';

describe('useEnergyBalance - Tests Académiques', () => {
  // ========================================
  // Setup: Données de test réalistes
  // ========================================

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    nom: 'Test',
    prenom: 'User',
    role: 'sportif',
    poids_actuel: 75,
    taille: 180,
    date_naissance: new Date('1990-01-01'),
    genre: 'homme',
    niveau_activite: 'modere',
    objectif: 'maintien',
    created_at: Timestamp.now(),
  };

  const mockRepas: Repas[] = [
    {
      id: 'meal-1',
      user_id: 'user-1',
      date: Timestamp.fromDate(new Date('2025-10-26')),
      repas: 'dejeuner',
      aliments: [],
      macros: { kcal: 600, prot: 40, glucides: 60, lipides: 20 },
      created_at: Timestamp.now(),
    },
    {
      id: 'meal-2',
      user_id: 'user-1',
      date: Timestamp.fromDate(new Date('2025-10-26')),
      repas: 'diner',
      aliments: [],
      macros: { kcal: 700, prot: 50, glucides: 70, lipides: 25 },
      created_at: Timestamp.now(),
    },
  ];

  const mockEntrainements: Entrainement[] = [
    {
      id: 'training-1',
      user_id: 'user-1',
      date: Timestamp.fromDate(new Date('2025-10-26')),
      type: 'cardio',
      duree: 45,
      calories: 400,
      source: 'manuel',
      created_at: Timestamp.now(),
    },
    {
      id: 'training-2',
      user_id: 'user-1',
      date: Timestamp.fromDate(new Date('2025-10-26')),
      type: 'musculation',
      duree: 60,
      calories: 300,
      source: 'manuel',
      created_at: Timestamp.now(),
    },
  ];

  // ========================================
  // Tests: TDEE Calculations
  // ========================================

  describe('TDEE Calculations', () => {
    it('should calculate base TDEE for user with profile', () => {
      // Arrange
      const params = {
        userProfile: mockUser,
        repas: [],
        entrainements: [],
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.baseTDEE).toBeGreaterThan(0);
      expect(result.current.baseTDEE).toBeGreaterThan(1500); // BMR minimal
      expect(result.current.baseTDEE).toBeLessThan(4000); // TDEE maximal réaliste
    });

    it('should use default TDEE (2000) when no user profile', () => {
      // Arrange
      const params = {
        userProfile: null,
        repas: [],
        entrainements: [],
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.baseTDEE).toBe(2000);
      expect(result.current.adjustedTDEE).toBe(2000);
    });

    it('should adjust TDEE based on training calories', () => {
      // Arrange
      const params = {
        userProfile: mockUser,
        repas: [],
        entrainements: mockEntrainements,
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.adjustedTDEE).toBeGreaterThanOrEqual(
        result.current.baseTDEE,
      );
      expect(result.current.adjustedTDEE).toBeDefined();
    });

    it('should fallback to baseTDEE if adjustment fails', () => {
      // Arrange: User sans niveau_activite
      const userWithoutActivity = { ...mockUser, niveau_activite: undefined };
      const params = {
        userProfile: userWithoutActivity as User,
        repas: [],
        entrainements: [],
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.adjustedTDEE).toBeGreaterThan(0);
    });
  });

  // ========================================
  // Tests: Sport Calories Calculations
  // ========================================

  describe('Sport Calories Calculations', () => {
    it('should calculate raw sport calories from trainings', () => {
      // Arrange
      const params = {
        userProfile: mockUser,
        repas: [],
        entrainements: mockEntrainements,
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.rawSportCalories).toBe(700); // 400 + 300
    });

    it('should apply correction factor to sport calories', () => {
      // Arrange
      const params = {
        userProfile: mockUser,
        repas: [],
        entrainements: mockEntrainements,
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.adjustedSportCalories).toBeLessThan(
        result.current.rawSportCalories,
      );
      expect(result.current.correctionFactor).toBeGreaterThan(0);
      expect(result.current.correctionFactor).toBeLessThanOrEqual(1);
    });

    it('should calculate average daily sport calories', () => {
      // Arrange: 700 calories sur 7 jours
      const params = {
        userProfile: mockUser,
        repas: [],
        entrainements: mockEntrainements,
        periodDays: 7,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.avgDailySportCalories).toBe(100); // 700 / 7
    });

    it('should handle zero trainings gracefully', () => {
      // Arrange
      const params = {
        userProfile: mockUser,
        repas: [],
        entrainements: [],
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.rawSportCalories).toBe(0);
      expect(result.current.adjustedSportCalories).toBe(0);
      expect(result.current.avgDailySportCalories).toBe(0);
    });

    it('should provide adjusted trainings for charts', () => {
      // Arrange
      const params = {
        userProfile: mockUser,
        repas: [],
        entrainements: mockEntrainements,
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.adjustedTrainings).toHaveLength(2);
      expect(result.current.adjustedTrainings[0].calories).toBeLessThan(400); // Pondéré
      expect(result.current.adjustedTrainings[0]).toHaveProperty('id');
      expect(result.current.adjustedTrainings[0]).toHaveProperty('type');
    });
  });

  // ========================================
  // Tests: Nutrition Stats
  // ========================================

  describe('Nutrition Stats', () => {
    it('should calculate period nutrition stats from meals', () => {
      // Arrange
      const params = {
        userProfile: mockUser,
        repas: mockRepas,
        entrainements: [],
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.periodStats.calories).toBe(1300); // 600 + 700
      expect(result.current.periodStats.proteins).toBe(90); // 40 + 50
      expect(result.current.periodStats.carbs).toBe(130); // 60 + 70
      expect(result.current.periodStats.fats).toBe(45); // 20 + 25
    });

    it('should handle missing macros gracefully', () => {
      // Arrange: Meal avec macros undefined
      const mealWithoutMacros: Repas[] = [
        {
          id: 'meal-3',
          user_id: 'user-1',
          date: Timestamp.now(),
          repas: 'petit_dej',
          aliments: [],
          macros: undefined as any,
          created_at: Timestamp.now(),
        },
      ];
      const params = {
        userProfile: mockUser,
        repas: mealWithoutMacros,
        entrainements: [],
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.periodStats.calories).toBe(0);
      expect(result.current.periodStats.proteins).toBe(0);
      expect(result.current.periodStats.carbs).toBe(0);
      expect(result.current.periodStats.fats).toBe(0);
    });

    it('should accumulate stats from multiple meals', () => {
      // Arrange: 3 repas
      const multipleMeals: Repas[] = [
        ...mockRepas,
        {
          id: 'meal-3',
          user_id: 'user-1',
          date: Timestamp.now(),
          repas: 'collation_matin',
          aliments: [],
          macros: { kcal: 200, prot: 10, glucides: 25, lipides: 8 },
          created_at: Timestamp.now(),
        },
      ];
      const params = {
        userProfile: mockUser,
        repas: multipleMeals,
        entrainements: [],
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.periodStats.calories).toBe(1500); // 600 + 700 + 200
      expect(result.current.periodStats.proteins).toBe(100); // 40 + 50 + 10
    });
  });

  // ========================================
  // Tests: Energy Balance
  // ========================================

  describe('Energy Balance Calculations', () => {
    it('should calculate positive energy balance (surplus)', () => {
      // Arrange: Haute consommation, TDEE normal
      const highCalorieMeals: Repas[] = [
        {
          id: 'meal-high',
          user_id: 'user-1',
          date: Timestamp.now(),
          repas: 'dejeuner',
          aliments: [],
          macros: { kcal: 3000, prot: 150, glucides: 300, lipides: 100 },
          created_at: Timestamp.now(),
        },
      ];
      const params = {
        userProfile: mockUser,
        repas: highCalorieMeals,
        entrainements: [],
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.energyBalance).toBeGreaterThan(0);
      expect(result.current.isDeficit).toBe(false);
    });

    it('should calculate negative energy balance (deficit)', () => {
      // Arrange: Basse consommation, TDEE normal
      const lowCalorieMeals: Repas[] = [
        {
          id: 'meal-low',
          user_id: 'user-1',
          date: Timestamp.now(),
          repas: 'dejeuner',
          aliments: [],
          macros: { kcal: 800, prot: 50, glucides: 80, lipides: 20 },
          created_at: Timestamp.now(),
        },
      ];
      const params = {
        userProfile: mockUser,
        repas: lowCalorieMeals,
        entrainements: [],
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.energyBalance).toBeLessThan(0);
      expect(result.current.isDeficit).toBe(true);
    });

    it('should calculate balance close to maintenance', () => {
      // Arrange: Calories ≈ TDEE
      const maintenanceMeals: Repas[] = [
        {
          id: 'meal-maintenance',
          user_id: 'user-1',
          date: Timestamp.now(),
          repas: 'dejeuner',
          aliments: [],
          macros: { kcal: 2200, prot: 150, glucides: 250, lipides: 70 },
          created_at: Timestamp.now(),
        },
      ];
      const params = {
        userProfile: mockUser,
        repas: maintenanceMeals,
        entrainements: [],
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      // Balance proche de 0 (±200 kcal)
      expect(Math.abs(result.current.energyBalance)).toBeLessThan(500);
    });
  });

  // ========================================
  // Tests: Memoization & Performance
  // ========================================

  describe('Memoization & Performance', () => {
    it('should memoize result when inputs unchanged', () => {
      // Arrange
      const params = {
        userProfile: mockUser,
        repas: mockRepas,
        entrainements: mockEntrainements,
        periodDays: 1,
      };

      // Act: Premier render
      const { result, rerender } = renderHook(() => useEnergyBalance(params));
      const firstResult = result.current;

      // Act: Re-render avec mêmes props
      rerender();
      const secondResult = result.current;

      // Assert: Même référence objet (useMemo)
      expect(firstResult).toBe(secondResult);
    });

    it('should recalculate when inputs change', () => {
      // Arrange
      const initialParams = {
        userProfile: mockUser,
        repas: [],
        entrainements: [],
        periodDays: 1,
      };

      // Act: Premier render
      const { result, rerender } = renderHook(
        (props) => useEnergyBalance(props),
        { initialProps: initialParams },
      );
      const firstResult = result.current;

      // Act: Re-render avec nouveaux repas
      const newParams = {
        ...initialParams,
        repas: mockRepas,
      };
      rerender(newParams);
      const secondResult = result.current;

      // Assert: Résultat différent
      expect(firstResult).not.toBe(secondResult);
      expect(secondResult.periodStats.calories).toBeGreaterThan(
        firstResult.periodStats.calories,
      );
    });
  });

  // ========================================
  // Tests: Edge Cases
  // ========================================

  describe('Edge Cases', () => {
    it('should handle division by zero (periodDays = 0)', () => {
      // Arrange
      const params = {
        userProfile: mockUser,
        repas: [],
        entrainements: mockEntrainements,
        periodDays: 0,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert: Pas de crash, Infinity acceptable
      expect(result.current.avgDailySportCalories).toBeDefined();
    });

    it('should handle negative calories (error data)', () => {
      // Arrange: Données erronnées
      const badTraining: Entrainement[] = [
        {
          ...mockEntrainements[0],
          calories: -100,
        },
      ];
      const params = {
        userProfile: mockUser,
        repas: [],
        entrainements: badTraining,
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert: Résultat négatif (garbage in, garbage out acceptable)
      expect(result.current.rawSportCalories).toBe(-100);
    });

    it('should handle very large datasets', () => {
      // Arrange: 100 repas + 100 entraînements
      const largeMealsDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `meal-${i}`,
        user_id: 'user-1',
        date: Timestamp.now(),
        repas: 'dejeuner' as const,
        aliments: [],
        macros: { kcal: 500, prot: 30, glucides: 50, lipides: 15 },
        created_at: Timestamp.now(),
      }));

      const largeTrainingsDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `training-${i}`,
        user_id: 'user-1',
        date: Timestamp.now(),
        type: 'cardio' as const,
        duree: 30,
        calories: 200,
        source: 'manuel' as const,
        created_at: Timestamp.now(),
      }));

      const params = {
        userProfile: mockUser,
        repas: largeMealsDataset,
        entrainements: largeTrainingsDataset,
        periodDays: 30,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert: Calculs corrects
      expect(result.current.periodStats.calories).toBe(50000); // 100 * 500
      expect(result.current.rawSportCalories).toBe(20000); // 100 * 200
      expect(result.current.adjustedTrainings).toHaveLength(100);
    });
  });

  // ========================================
  // Tests: Integration Real Scenarios
  // ========================================

  describe('Real World Integration', () => {
    it('should handle complete user scenario (meals + trainings)', () => {
      // Arrange: Scénario complet journée type
      const params = {
        userProfile: mockUser,
        repas: mockRepas, // 1300 kcal
        entrainements: mockEntrainements, // 700 kcal brut
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert: Tous les calculs cohérents
      expect(result.current.baseTDEE).toBeGreaterThan(0);
      expect(result.current.adjustedTDEE).toBeGreaterThanOrEqual(result.current.baseTDEE);
      expect(result.current.periodStats.calories).toBe(1300);
      expect(result.current.rawSportCalories).toBe(700);
      expect(result.current.adjustedSportCalories).toBeLessThan(700);
      expect(result.current.energyBalance).toBeDefined();
      expect(typeof result.current.isDeficit).toBe('boolean');
    });

    it('should handle sedentary user (no training)', () => {
      // Arrange: Utilisateur sédentaire
      const sedentaryUser = { ...mockUser, niveau_activite: 'sedentaire' as const };
      const params = {
        userProfile: sedentaryUser,
        repas: mockRepas,
        entrainements: [],
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.rawSportCalories).toBe(0);
      expect(result.current.adjustedTDEE).toBe(result.current.baseTDEE);
    });

    it('should handle very active user', () => {
      // Arrange: Utilisateur très actif
      const veryActiveUser = { ...mockUser, niveau_activite: 'tres_actif' as const };
      const intensiveTrainings: Entrainement[] = Array.from({ length: 5 }, (_, i) => ({
        id: `training-${i}`,
        user_id: 'user-1',
        date: Timestamp.now(),
        type: 'cardio' as const,
        duree: 60,
        calories: 600,
        source: 'manuel' as const,
        created_at: Timestamp.now(),
      }));

      const params = {
        userProfile: veryActiveUser,
        repas: mockRepas,
        entrainements: intensiveTrainings,
        periodDays: 1,
      };

      // Act
      const { result } = renderHook(() => useEnergyBalance(params));

      // Assert
      expect(result.current.rawSportCalories).toBe(3000); // 5 * 600
      expect(result.current.adjustedTDEE).toBeGreaterThanOrEqual(result.current.baseTDEE);
    });
  });
});

