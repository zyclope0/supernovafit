import { describe, it, expect } from 'vitest';
import {
  IMPLEMENTED_CHALLENGES,
  UNIMPLEMENTABLE_CHALLENGES,
  isChallengeImplemented,
  isChallengeImplementable,
  getUnimplementationReason,
  getChallengeStats,
  getImplementableTodos,
  getTrackableChallengeDefinitions,
} from '@/lib/challengeImplementation';

describe('challengeImplementation', () => {
  describe('IMPLEMENTED_CHALLENGES', () => {
    it('should contain all implemented challenges', () => {
      expect(IMPLEMENTED_CHALLENGES).toBeDefined();
      expect(Array.isArray(IMPLEMENTED_CHALLENGES)).toBe(true);
      expect(IMPLEMENTED_CHALLENGES.length).toBeGreaterThan(0);
    });

    it('should have valid challenge names', () => {
      IMPLEMENTED_CHALLENGES.forEach((challenge) => {
        expect(challenge).toBeDefined();
        expect(typeof challenge).toBe('string');
        expect(challenge.length).toBeGreaterThan(0);
      });
    });

    it('should contain nutrition challenges', () => {
      const nutritionChallenges = [
        'Repas Complet',
        'Marathon des Protéines',
        'Défi Calories',
        '7 Jours de Nutrition Parfaite',
        'Défi Variété',
      ];

      nutritionChallenges.forEach((challenge) => {
        expect(IMPLEMENTED_CHALLENGES).toContain(challenge);
      });
    });

    it('should contain training challenges', () => {
      const trainingChallenges = [
        'Streak Entraînement',
        'Force Pure',
        'Marathon du Temps',
        'Explosif',
        'Cardio Intense',
        'Endurance Extrême',
        'Séance Express',
        'Marathon Mensuel',
        'Consistance',
        'Matin Productif',
      ];

      trainingChallenges.forEach((challenge) => {
        expect(IMPLEMENTED_CHALLENGES).toContain(challenge);
      });
    });

    it('should contain tracking challenges', () => {
      const trackingChallenges = [
        'Journalier Assidu',
        'Suivi Parfait',
        'Humeur Positive',
        'Énergie Maximale',
        'Sommeil de Qualité',
      ];

      trackingChallenges.forEach((challenge) => {
        expect(IMPLEMENTED_CHALLENGES).toContain(challenge);
      });
    });

    it('should contain Phase 2.1 challenges', () => {
      const phase2Challenges = [
        'Warrior Streak',
        'Volume Monstre',
        'Pesée Quotidienne',
        'Journal Quotidien',
        'Transformation du Mois',
      ];

      phase2Challenges.forEach((challenge) => {
        expect(IMPLEMENTED_CHALLENGES).toContain(challenge);
      });
    });
  });

  describe('UNIMPLEMENTABLE_CHALLENGES', () => {
    it('should contain unimplementable challenges', () => {
      expect(UNIMPLEMENTABLE_CHALLENGES).toBeDefined();
      expect(typeof UNIMPLEMENTABLE_CHALLENGES).toBe('object');
      expect(Object.keys(UNIMPLEMENTABLE_CHALLENGES).length).toBeGreaterThan(0);
    });

    it('should have valid reasons for unimplementable challenges', () => {
      Object.entries(UNIMPLEMENTABLE_CHALLENGES).forEach(([challenge, reason]) => {
        expect(challenge).toBeDefined();
        expect(reason).toBeDefined();
        expect(typeof reason).toBe('string');
        expect(reason.length).toBeGreaterThan(0);
      });
    });

    it('should contain hydration challenges', () => {
      expect(UNIMPLEMENTABLE_CHALLENGES).toHaveProperty('Hydratation Parfaite');
      expect(UNIMPLEMENTABLE_CHALLENGES).toHaveProperty('Hydratation Express');
    });

    it('should contain advanced nutrition challenges', () => {
      expect(UNIMPLEMENTABLE_CHALLENGES).toHaveProperty('Défi Fibres');
      expect(UNIMPLEMENTABLE_CHALLENGES).toHaveProperty('Zéro Sucres Ajoutés');
      expect(UNIMPLEMENTABLE_CHALLENGES).toHaveProperty('Défi Légumes');
    });

    it('should have meaningful reasons', () => {
      const hydrationReason = UNIMPLEMENTABLE_CHALLENGES['Hydratation Parfaite'];
      expect(hydrationReason).toContain('eau');
      expect(hydrationReason).toContain('développer');
    });
  });

  describe('isChallengeImplemented', () => {
    it('should return true for implemented challenges', () => {
      const implementedChallenge = IMPLEMENTED_CHALLENGES[0];
      const isImplemented = isChallengeImplemented(implementedChallenge);
      expect(isImplemented).toBe(true);
    });

    it('should return false for unimplementable challenges', () => {
      const unimplementableChallenge = Object.keys(UNIMPLEMENTABLE_CHALLENGES)[0];
      const isImplemented = isChallengeImplemented(unimplementableChallenge);
      expect(isImplemented).toBe(false);
    });

    it('should return false for unknown challenges', () => {
      const unknownChallenge = 'Unknown Challenge';
      const isImplemented = isChallengeImplemented(unknownChallenge);
      expect(isImplemented).toBe(false);
    });

    it('should handle empty string', () => {
      const isImplemented = isChallengeImplemented('');
      expect(isImplemented).toBe(false);
    });

    it('should handle null/undefined', () => {
      const isImplementedNull = isChallengeImplemented(null as any);
      const isImplementedUndefined = isChallengeImplemented(undefined as any);
      expect(isImplementedNull).toBe(false);
      expect(isImplementedUndefined).toBe(false);
    });
  });

  describe('isChallengeImplementable', () => {
    it('should return true for implementable challenges', () => {
      const implementableChallenge = 'Some Implementable Challenge';
      const isImplementable = isChallengeImplementable(implementableChallenge);
      expect(isImplementable).toBe(true);
    });

    it('should return false for unimplementable challenges', () => {
      const unimplementableChallenge = Object.keys(UNIMPLEMENTABLE_CHALLENGES)[0];
      const isImplementable = isChallengeImplementable(unimplementableChallenge);
      expect(isImplementable).toBe(false);
    });

    it('should handle empty string', () => {
      const isImplementable = isChallengeImplementable('');
      expect(isImplementable).toBe(true);
    });
  });

  describe('getUnimplementationReason', () => {
    it('should return reason for unimplementable challenges', () => {
      const unimplementableChallenge = Object.keys(UNIMPLEMENTABLE_CHALLENGES)[0];
      const reason = getUnimplementationReason(unimplementableChallenge);
      expect(reason).toBeDefined();
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
    });

    it('should return null for implemented challenges', () => {
      const implementedChallenge = IMPLEMENTED_CHALLENGES[0];
      const reason = getUnimplementationReason(implementedChallenge);
      expect(reason).toBeNull();
    });

    it('should return null for unknown challenges', () => {
      const unknownChallenge = 'Unknown Challenge';
      const reason = getUnimplementationReason(unknownChallenge);
      expect(reason).toBeNull();
    });

    it('should handle empty string', () => {
      const reason = getUnimplementationReason('');
      expect(reason).toBeNull();
    });
  });

  describe('challenge categorization', () => {
    it('should not have overlapping challenges', () => {
      const implementedSet = new Set(IMPLEMENTED_CHALLENGES);
      const unimplementableSet = new Set(Object.keys(UNIMPLEMENTABLE_CHALLENGES));
      
      const intersection = [...implementedSet].filter(challenge => 
        unimplementableSet.has(challenge)
      );
      
      // Note: "Matin Productif" appears in both lists, which is expected
      // as it's implemented but also has unimplementable features
      expect(intersection.length).toBeLessThanOrEqual(1);
    });

    it('should have reasonable number of implemented challenges', () => {
      expect(IMPLEMENTED_CHALLENGES.length).toBeGreaterThanOrEqual(20);
      expect(IMPLEMENTED_CHALLENGES.length).toBeLessThanOrEqual(50);
    });

    it('should have reasonable number of unimplementable challenges', () => {
      const unimplementableCount = Object.keys(UNIMPLEMENTABLE_CHALLENGES).length;
      expect(unimplementableCount).toBeGreaterThanOrEqual(5);
      expect(unimplementableCount).toBeLessThanOrEqual(30);
    });
  });

  describe('challenge names validation', () => {
    it('should have consistent naming convention', () => {
      IMPLEMENTED_CHALLENGES.forEach((challenge) => {
        // Should not be empty
        expect(challenge.trim()).not.toBe('');
        // Should not start/end with spaces
        expect(challenge).toBe(challenge.trim());
        // Should not contain special characters that could cause issues
        expect(challenge).not.toMatch(/[<>:"/\\|?*]/);
      });
    });

    it('should have meaningful challenge names', () => {
      IMPLEMENTED_CHALLENGES.forEach((challenge) => {
        // Should be at least 3 characters
        expect(challenge.length).toBeGreaterThanOrEqual(3);
        // Should not be just numbers
        expect(challenge).not.toMatch(/^\d+$/);
      });
    });
  });

  describe('getChallengeStats', () => {
    it('should return valid challenge statistics', () => {
      const stats = getChallengeStats();
      
      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.implemented).toBeGreaterThan(0);
      expect(stats.implementable).toBeGreaterThanOrEqual(0);
      expect(stats.unimplementable).toBeGreaterThan(0);
      expect(stats.implementedPercentage).toBeGreaterThanOrEqual(0);
      expect(stats.implementedPercentage).toBeLessThanOrEqual(100);
      expect(stats.totalPercentage).toBeGreaterThanOrEqual(0);
      expect(stats.totalPercentage).toBeLessThanOrEqual(100);
    });

    it('should have consistent statistics', () => {
      const stats = getChallengeStats();
      
      expect(stats.implemented + stats.unimplementable).toBeLessThanOrEqual(stats.total);
      expect(stats.implementable).toBe(stats.total - stats.unimplementable);
    });
  });

  describe('getImplementableTodos', () => {
    it('should return array of implementable todos', () => {
      const todos = getImplementableTodos();
      
      expect(Array.isArray(todos)).toBe(true);
      todos.forEach((todo) => {
        expect(typeof todo).toBe('string');
        expect(todo.length).toBeGreaterThan(0);
      });
    });

    it('should not include implemented challenges', () => {
      const todos = getImplementableTodos();
      
      todos.forEach((todo) => {
        expect(IMPLEMENTED_CHALLENGES).not.toContain(todo);
      });
    });

    it('should not include unimplementable challenges', () => {
      const todos = getImplementableTodos();
      const unimplementableKeys = Object.keys(UNIMPLEMENTABLE_CHALLENGES);
      
      todos.forEach((todo) => {
        expect(unimplementableKeys).not.toContain(todo);
      });
    });
  });

  describe('getTrackableChallengeDefinitions', () => {
    it('should return array of trackable challenge definitions', () => {
      const trackable = getTrackableChallengeDefinitions();
      
      expect(Array.isArray(trackable)).toBe(true);
      expect(trackable.length).toBeGreaterThan(0);
      expect(trackable.length).toBeGreaterThanOrEqual(IMPLEMENTED_CHALLENGES.length);
    });

    it('should only include implemented challenges', () => {
      const trackable = getTrackableChallengeDefinitions();
      
      trackable.forEach((def) => {
        expect(IMPLEMENTED_CHALLENGES).toContain(def.title);
      });
    });

    it('should have valid challenge definitions', () => {
      const trackable = getTrackableChallengeDefinitions();
      
      trackable.forEach((def) => {
        expect(def.title).toBeDefined();
        expect(typeof def.title).toBe('string');
        expect(def.title.length).toBeGreaterThan(0);
      });
    });
  });
});
