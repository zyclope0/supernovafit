/**
 * Tests unitaires pour la validation Zod des challenges
 * 
 * Teste toutes les validations, contraintes et edge cases
 * pour garantir l'intégrité des données challenges/achievements
 * 
 * @module tests/lib/validation/challenges
 * @created 23.10.2025
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  ChallengeSchema,
  CreateChallengeSchema,
  UpdateChallengeSchema,
  AchievementSchema,
  UserProgressSchema,
  validateCreateChallenge,
  safeValidateCreateChallenge,
  getValidationErrors,
  formatValidationError,
} from '@/lib/validation/challenges';

describe('ChallengeSchema', () => {
  const validChallenge = {
    id: 'challenge-123',
    user_id: 'VBSTkEAy1OWptNJmUbIjFFz62Zg1',
    type: 'nutrition' as const,
    title: 'Défi Nutrition',
    description: 'Mangez 5 portions de légumes par jour',
    icon: '🥗',
    category: 'weekly' as const,
    target: 7,
    current: 3,
    unit: 'jours',
    startDate: '2025-10-23T00:00:00.000Z',
    endDate: '2025-10-30T23:59:59.999Z',
    status: 'active' as const,
    xpReward: 100,
    badgeReward: 'nutrition-master',
    isRepeatable: true,
    difficulty: 'medium' as const,
    created_at: '2025-10-23T10:00:00.000Z',
  };

  describe('Validation basique', () => {
    it('should validate a valid challenge', () => {
      expect(() => ChallengeSchema.parse(validChallenge)).not.toThrow();
    });

    it('should accept challenge without optional fields', () => {
      const minimal = {
        ...validChallenge,
        badgeReward: undefined,
        created_at: undefined,
        completed_at: undefined,
      };
      expect(() => ChallengeSchema.parse(minimal)).not.toThrow();
    });
  });

  describe('user_id validation', () => {
    it('should reject empty user_id', () => {
      const invalid = { ...validChallenge, user_id: '' };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('ID utilisateur invalide');
    });

    it('should reject user_id too short', () => {
      const invalid = { ...validChallenge, user_id: 'abc' };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('ID utilisateur invalide');
    });

    it('should reject user_id too long', () => {
      const invalid = { ...validChallenge, user_id: 'a'.repeat(129) };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('ID utilisateur trop long');
    });
  });

  describe('type validation', () => {
    it('should accept all valid types', () => {
      const types = ['nutrition', 'training', 'streak', 'social', 'special'] as const;
      types.forEach((type) => {
        const challenge = { ...validChallenge, type };
        expect(() => ChallengeSchema.parse(challenge)).not.toThrow();
      });
    });

    it('should reject invalid type', () => {
      const invalid = { ...validChallenge, type: 'invalid' };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('Le type de challenge est invalide');
    });
  });

  describe('title validation', () => {
    it('should accept title with 3-100 characters', () => {
      const challenge1 = { ...validChallenge, title: 'ABC' }; // Min
      const challenge2 = { ...validChallenge, title: 'A'.repeat(100) }; // Max
      expect(() => ChallengeSchema.parse(challenge1)).not.toThrow();
      expect(() => ChallengeSchema.parse(challenge2)).not.toThrow();
    });

    it('should reject title too short', () => {
      const invalid = { ...validChallenge, title: 'AB' };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('au moins 3 caractères');
    });

    it('should reject title too long', () => {
      const invalid = { ...validChallenge, title: 'A'.repeat(101) };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('ne peut pas dépasser 100 caractères');
    });

    it('should reject title with invalid characters', () => {
      const invalid = { ...validChallenge, title: '<script>alert("XSS")</script>' };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('caractères invalides');
    });

    it('should accept title with accents and special chars', () => {
      const challenge = { ...validChallenge, title: 'Défi Protéines - C\'est parti!' };
      expect(() => ChallengeSchema.parse(challenge)).not.toThrow();
    });
  });

  describe('target and current validation', () => {
    it('should accept target and current as positive integers', () => {
      const challenge = { ...validChallenge, target: 10, current: 5 };
      expect(() => ChallengeSchema.parse(challenge)).not.toThrow();
    });

    it('should reject target < 1', () => {
      const invalid = { ...validChallenge, target: 0 };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('au moins 1');
    });

    it('should reject target > 10000', () => {
      const invalid = { ...validChallenge, target: 10001 };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('ne peut pas dépasser 10000');
    });

    it('should reject negative current', () => {
      const invalid = { ...validChallenge, current: -1 };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('ne peut pas être négative');
    });

    it('should reject current > target', () => {
      const invalid = { ...validChallenge, target: 5, current: 10 };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('ne peut pas dépasser la cible');
    });

    it('should accept current === target (completed)', () => {
      const challenge = { ...validChallenge, target: 7, current: 7 };
      expect(() => ChallengeSchema.parse(challenge)).not.toThrow();
    });

    it('should reject float target', () => {
      const invalid = { ...validChallenge, target: 5.5 };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('nombre entier');
    });
  });

  describe('date validation', () => {
    it('should accept valid ISO dates', () => {
      expect(() => ChallengeSchema.parse(validChallenge)).not.toThrow();
    });

    it('should reject startDate after endDate', () => {
      const invalid = {
        ...validChallenge,
        startDate: '2025-10-30T00:00:00.000Z',
        endDate: '2025-10-23T00:00:00.000Z',
      };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('doit être avant');
    });

    it('should reject invalid ISO date format', () => {
      const invalid = { ...validChallenge, startDate: '2025-10-23' };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('date ISO valide');
    });

    it('should accept startDate === endDate (edge case)', () => {
      const challenge = {
        ...validChallenge,
        startDate: '2025-10-23T12:00:00.000Z',
        endDate: '2025-10-23T12:00:00.001Z', // 1ms after
      };
      expect(() => ChallengeSchema.parse(challenge)).not.toThrow();
    });
  });

  describe('xpReward validation', () => {
    it('should accept xpReward 0-10000', () => {
      const challenge1 = { ...validChallenge, xpReward: 0 };
      const challenge2 = { ...validChallenge, xpReward: 10000 };
      expect(() => ChallengeSchema.parse(challenge1)).not.toThrow();
      expect(() => ChallengeSchema.parse(challenge2)).not.toThrow();
    });

    it('should reject negative xpReward', () => {
      const invalid = { ...validChallenge, xpReward: -1 };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('ne peut pas être négative');
    });

    it('should reject xpReward > 10000', () => {
      const invalid = { ...validChallenge, xpReward: 10001 };
      expect(() => ChallengeSchema.parse(invalid)).toThrow('ne peut pas dépasser 10000');
    });
  });

  describe('strict mode validation', () => {
    it('should reject unknown fields', () => {
      const invalid = { ...validChallenge, unknownField: 'value' } as any;
      expect(() => ChallengeSchema.parse(invalid)).toThrow();
    });
  });
});

describe('CreateChallengeSchema', () => {
  const validCreate = {
    user_id: 'VBSTkEAy1OWptNJmUbIjFFz62Zg1',
    type: 'nutrition' as const,
    title: 'Défi Nutrition',
    description: 'Mangez 5 portions de légumes par jour',
    icon: '🥗',
    category: 'weekly' as const,
    target: 7,
    current: 0,
    unit: 'jours',
    startDate: '2025-10-23T00:00:00.000Z',
    endDate: '2025-10-30T23:59:59.999Z',
    status: 'active' as const,
    xpReward: 100,
    isRepeatable: true,
    difficulty: 'medium' as const,
  };

  it('should validate valid creation data', () => {
    expect(() => CreateChallengeSchema.parse(validCreate)).not.toThrow();
  });

  it('should omit id, created_at, completed_at', () => {
    const withExtra = {
      ...validCreate,
      id: 'should-be-omitted',
      created_at: '2025-10-23T10:00:00.000Z',
      completed_at: '2025-10-23T11:00:00.000Z',
    } as any;
    
    expect(() => CreateChallengeSchema.parse(withExtra)).toThrow();
  });
});

describe('UpdateChallengeSchema', () => {
  it('should allow partial updates', () => {
    const partialUpdate = {
      user_id: 'VBSTkEAy1OWptNJmUbIjFFz62Zg1',
      current: 5,
    };
    expect(() => UpdateChallengeSchema.parse(partialUpdate)).not.toThrow();
  });

  it('should require user_id', () => {
    const invalid = { current: 5 };
    expect(() => UpdateChallengeSchema.parse(invalid)).toThrow();
  });

  it('should validate updated fields', () => {
    const invalid = {
      user_id: 'VBSTkEAy1OWptNJmUbIjFFz62Zg1',
      current: -5, // Invalid
    };
    expect(() => UpdateChallengeSchema.parse(invalid)).toThrow('ne peut pas être négative');
  });
});

describe('AchievementSchema', () => {
  const validAchievement = {
    id: 'achievement-123',
    user_id: 'VBSTkEAy1OWptNJmUbIjFFz62Zg1',
    type: 'milestone' as const,
    name: '🚀 Débutant',
    description: 'Atteignez le niveau 5',
    icon: '🚀',
    rarity: 'common' as const,
    xpReward: 100,
    condition: 'Niveau 5 atteint',
    created_at: '2025-10-23T10:00:00.000Z',
  };

  it('should validate valid achievement', () => {
    expect(() => AchievementSchema.parse(validAchievement)).not.toThrow();
  });

  it('should reject invalid rarity', () => {
    const invalid = { ...validAchievement, rarity: 'ultra-rare' };
    expect(() => AchievementSchema.parse(invalid)).toThrow('rareté de l\'achievement est invalide');
  });

  it('should accept name with emojis', () => {
    const achievement = { ...validAchievement, name: '🏆 Champion 💪' };
    expect(() => AchievementSchema.parse(achievement)).not.toThrow();
  });
});

describe('UserProgressSchema', () => {
  const validProgress = {
    user_id: 'VBSTkEAy1OWptNJmUbIjFFz62Zg1',
    totalXP: 1500,
    level: 5,
    currentLevelXP: 500,
    nextLevelXP: 1000,
    totalChallengesCompleted: 12,
    totalAchievementsUnlocked: 3,
    currentStreak: 7,
    longestStreak: 15,
    lastActivityDate: '2025-10-23T10:00:00.000Z',
    created_at: '2025-10-01T00:00:00.000Z',
    updated_at: '2025-10-23T10:00:00.000Z',
  };

  it('should validate valid progress', () => {
    expect(() => UserProgressSchema.parse(validProgress)).not.toThrow();
  });

  it('should reject currentLevelXP > nextLevelXP', () => {
    const invalid = {
      ...validProgress,
      currentLevelXP: 1500,
      nextLevelXP: 1000,
    };
    expect(() => UserProgressSchema.parse(invalid)).toThrow('ne peut pas dépasser le XP requis');
  });

  it('should reject currentStreak > longestStreak', () => {
    const invalid = {
      ...validProgress,
      currentStreak: 20,
      longestStreak: 15,
    };
    expect(() => UserProgressSchema.parse(invalid)).toThrow('ne peut pas dépasser le streak le plus long');
  });

  it('should reject negative totalXP', () => {
    const invalid = { ...validProgress, totalXP: -100 };
    expect(() => UserProgressSchema.parse(invalid)).toThrow('ne peut pas être négatif');
  });

  it('should reject level > 50', () => {
    const invalid = { ...validProgress, level: 51 };
    expect(() => UserProgressSchema.parse(invalid)).toThrow('niveau maximum est 50');
  });
});

describe('Validation functions', () => {
  const validCreate = {
    user_id: 'VBSTkEAy1OWptNJmUbIjFFz62Zg1',
    type: 'nutrition' as const,
    title: 'Défi Test',
    description: 'Description test',
    icon: '🎯',
    category: 'daily' as const,
    target: 3,
    current: 0,
    unit: 'repas',
    startDate: '2025-10-23T00:00:00.000Z',
    endDate: '2025-10-23T23:59:59.999Z',
    status: 'active' as const,
    xpReward: 30,
    isRepeatable: true,
    difficulty: 'easy' as const,
  };

  describe('validateCreateChallenge', () => {
    it('should return validated data on success', () => {
      const result = validateCreateChallenge(validCreate);
      expect(result).toEqual(validCreate);
    });

    it('should throw ZodError on validation failure', () => {
      const invalid = { ...validCreate, title: 'AB' }; // Too short
      expect(() => validateCreateChallenge(invalid)).toThrow(z.ZodError);
    });
  });

  describe('safeValidateCreateChallenge', () => {
    it('should return success object on valid data', () => {
      const result = safeValidateCreateChallenge(validCreate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validCreate);
      }
    });

    it('should return error object on invalid data', () => {
      const invalid = { ...validCreate, current: -5 };
      const result = safeValidateCreateChallenge(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });
  });

  describe('getValidationErrors', () => {
    it('should extract error messages from ZodError', () => {
      const invalid = { ...validCreate, title: 'AB', current: -1 };
      try {
        validateCreateChallenge(invalid);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const messages = getValidationErrors(error);
          expect(messages).toBeInstanceOf(Array);
          expect(messages.length).toBeGreaterThan(0);
          expect(messages.some((msg) => msg.includes('3 caractères'))).toBe(true);
        }
      }
    });
  });

  describe('formatValidationError', () => {
    it('should format single error message', () => {
      const invalid = { ...validCreate, current: -1 };
      try {
        validateCreateChallenge(invalid);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formatted = formatValidationError(error);
          expect(formatted).toContain('ne peut pas être négative');
        }
      }
    });

    it('should format multiple error messages', () => {
      const invalid = { ...validCreate, title: 'AB', current: -1, xpReward: -10 };
      try {
        validateCreateChallenge(invalid);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formatted = formatValidationError(error);
          expect(formatted).toContain('Erreurs de validation');
        }
      }
    });
  });
});

describe('Edge cases', () => {
  it('should handle empty object gracefully', () => {
    expect(() => CreateChallengeSchema.parse({})).toThrow();
  });

  it('should handle null values', () => {
    const invalid = {
      user_id: null,
      title: null,
    };
    expect(() => CreateChallengeSchema.parse(invalid)).toThrow();
  });

  it('should handle undefined values correctly', () => {
    const data = {
      user_id: 'VBSTkEAy1OWptNJmUbIjFFz62Zg1',
      type: 'nutrition' as const,
      title: 'Test',
      description: 'Test description',
      icon: '🎯',
      category: 'daily' as const,
      target: 3,
      current: 0,
      unit: 'test',
      startDate: '2025-10-23T00:00:00.000Z',
      endDate: '2025-10-23T23:59:59.999Z',
      status: 'active' as const,
      xpReward: 30,
      badgeReward: undefined, // Optional field
      isRepeatable: true,
      difficulty: 'easy' as const,
    };
    expect(() => CreateChallengeSchema.parse(data)).not.toThrow();
  });

  it('should handle very long strings', () => {
    const invalid = {
      user_id: 'VBSTkEAy1OWptNJmUbIjFFz62Zg1',
      type: 'nutrition' as const,
      title: 'A'.repeat(200), // Way too long
      description: 'Test',
      icon: '🎯',
      category: 'daily' as const,
      target: 3,
      current: 0,
      unit: 'test',
      startDate: '2025-10-23T00:00:00.000Z',
      endDate: '2025-10-23T23:59:59.999Z',
      status: 'active' as const,
      xpReward: 30,
      isRepeatable: true,
      difficulty: 'easy' as const,
    };
    expect(() => CreateChallengeSchema.parse(invalid)).toThrow('ne peut pas dépasser 100');
  });

  it('should handle unicode characters in title', () => {
    const data = {
      user_id: 'VBSTkEAy1OWptNJmUbIjFFz62Zg1',
      type: 'nutrition' as const,
      title: 'Défi 日本語 中文 🎯', // Unicode + emojis
      description: 'Test description',
      icon: '🎯',
      category: 'daily' as const,
      target: 3,
      current: 0,
      unit: 'test',
      startDate: '2025-10-23T00:00:00.000Z',
      endDate: '2025-10-23T23:59:59.999Z',
      status: 'active' as const,
      xpReward: 30,
      isRepeatable: true,
      difficulty: 'easy' as const,
    };
    
    // Should fail because regex doesn't allow Japanese/Chinese chars
    expect(() => CreateChallengeSchema.parse(data)).toThrow('caractères invalides');
  });
});

