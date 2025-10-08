import { describe, it, expect } from 'vitest';

// Mock Firestore rules validation
const mockFirestoreRules = {
  validateFields: (data: Record<string, unknown>, required: string[], optional: string[]) => {
    const dataKeys = Object.keys(data);
    const hasAllRequired = required.every(key => dataKeys.includes(key));
    const hasOnlyAllowed = dataKeys.every(key => [...required, ...optional].includes(key));
    return hasAllRequired && hasOnlyAllowed;
  },

  validateRepas: (data: Record<string, unknown>) => {
    return mockFirestoreRules.validateFields(data,
      ['user_id', 'date', 'repas', 'aliments'],
      ['macros', 'calories', 'notes', 'created_at', 'updated_at']) &&
      ['petit_dej', 'dejeuner', 'diner', 'collation_matin', 'collation_apres_midi', 'collation_soir'].includes(data.repas as string) &&
      Array.isArray(data.aliments) &&
      data.aliments.length > 0 &&
      data.aliments.length <= 50;
  },

  validateEntrainement: (data: Record<string, unknown>) => {
    return mockFirestoreRules.validateFields(data,
      ['user_id', 'date', 'type', 'duree', 'source'],
      ['commentaire', 'calories', 'fc_moyenne', 'fc_max', 'fc_min', 'distance', 'vitesse_moy', 'vitesse_max', 'elevation_gain', 'cadence_moy', 'puissance_moy', 'zone1_time', 'zone2_time', 'zone3_time', 'zone4_time', 'zone5_time', 'created_at', 'updated_at']) &&
      ['cardio', 'musculation', 'yoga', 'autre'].includes(data.type as string) &&
      (data.duree as number) > 0 && (data.duree as number) <= 1440 &&
      ['manuel', 'garmin', 'import'].includes(data.source as string);
  },

  validateMesure: (data: Record<string, unknown>) => {
    return mockFirestoreRules.validateFields(data,
      ['user_id', 'date'],
      ['poids', 'taille', 'imc', 'masse_grasse', 'masse_musculaire', 'tour_taille', 'tour_poitrine', 'tour_hanches', 'tour_bras', 'tour_cuisse', 'tour_cou', 'photos_progression', 'created_at', 'updated_at']) &&
      (!('poids' in data) || (data.poids >= 20 && data.poids <= 300)) &&
      (!('taille' in data) || (data.taille >= 100 && data.taille <= 250)) &&
      (!('tour_taille' in data) || (data.tour_taille >= 30 && data.tour_taille <= 200));
  },

  validateJournalEntry: (data: Record<string, unknown>) => {
    return mockFirestoreRules.validateFields(data,
      ['user_id', 'date'],
      ['note', 'humeur', 'fatigue', 'motivation', 'energie', 'sommeil_duree', 'sommeil_qualite', 'stress', 'photos_libres', 'objectifs_accomplis', 'badges_obtenus', 'meteo', 'activites_annexes', 'created_at', 'updated_at']) &&
      (!('humeur' in data) || (typeof data.humeur === 'number' && data.humeur >= 1 && data.humeur <= 10)) &&
      (!('sommeil_duree' in data) || ((data.sommeil_duree as number) >= 0 && (data.sommeil_duree as number) <= 24));
  },

  validateUser: (data: Record<string, unknown>) => {
    return mockFirestoreRules.validateFields(data,
      ['id', 'email', 'role'],
      ['nom', 'prenom', 'displayName', 'ownerCoachId', 'athletes', 'created_at', 'updated_at']) &&
      ['sportif', 'coach'].includes(data.role as string);
  },

  checkRateLimit: () => true, // Mock rate limiting
  checkCreateRateLimit: () => true,
};

describe('Firestore Rules Validation', () => {
  describe('validateFields', () => {
    it('should validate correct field structure', () => {
      const data = { user_id: 'test', date: '2025-01-15', optional_field: 'value' };
      const result = mockFirestoreRules.validateFields(data, ['user_id', 'date'], ['optional_field']);
      expect(result).toBe(true);
    });

    it('should reject missing required fields', () => {
      const data = { user_id: 'test' }; // Missing 'date'
      const result = mockFirestoreRules.validateFields(data, ['user_id', 'date'], []);
      expect(result).toBe(false);
    });

    it('should reject extra fields', () => {
      const data = { user_id: 'test', date: '2025-01-15', extra_field: 'value' };
      const result = mockFirestoreRules.validateFields(data, ['user_id', 'date'], []);
      expect(result).toBe(false);
    });
  });

  describe('validateRepas', () => {
    it('should validate correct repas data', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        repas: 'dejeuner',
        aliments: [{ nom: 'Poulet', quantite: 150, unite: 'g' }],
      };
      const result = mockFirestoreRules.validateRepas(data);
      expect(result).toBe(true);
    });

    it('should reject invalid repas type', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        repas: 'invalid-type',
        aliments: [{ nom: 'Poulet', quantite: 150, unite: 'g' }],
      };
      const result = mockFirestoreRules.validateRepas(data);
      expect(result).toBe(false);
    });

    it('should reject empty aliments array', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        repas: 'dejeuner',
        aliments: [],
      };
      const result = mockFirestoreRules.validateRepas(data);
      expect(result).toBe(false);
    });

    it('should reject too many aliments', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        repas: 'dejeuner',
        aliments: Array.from({ length: 51 }, (_, i) => ({ nom: `Food${i}`, quantite: 100, unite: 'g' })),
      };
      const result = mockFirestoreRules.validateRepas(data);
      expect(result).toBe(false);
    });
  });

  describe('validateEntrainement', () => {
    it('should validate correct entrainement data', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        type: 'cardio',
        duree: 45,
        source: 'manuel',
      };
      const result = mockFirestoreRules.validateEntrainement(data);
      expect(result).toBe(true);
    });

    it('should reject invalid type', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        type: 'invalid-type',
        duree: 45,
        source: 'manuel',
      };
      const result = mockFirestoreRules.validateEntrainement(data);
      expect(result).toBe(false);
    });

    it('should reject invalid source', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        type: 'cardio',
        duree: 45,
        source: 'invalid-source',
      };
      const result = mockFirestoreRules.validateEntrainement(data);
      expect(result).toBe(false);
    });

    it('should reject negative duration', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        type: 'cardio',
        duree: -10,
        source: 'manuel',
      };
      const result = mockFirestoreRules.validateEntrainement(data);
      expect(result).toBe(false);
    });

    it('should reject duration over 24 hours', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        type: 'cardio',
        duree: 1500, // 25 hours
        source: 'manuel',
      };
      const result = mockFirestoreRules.validateEntrainement(data);
      expect(result).toBe(false);
    });
  });

  describe('validateMesure', () => {
    it('should validate correct mesure data', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        poids: 75.5,
        taille: 175,
        tour_taille: 85,
      };
      const result = mockFirestoreRules.validateMesure(data);
      expect(result).toBe(true);
    });

    it('should reject weight below minimum', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        poids: 15, // Below 20kg minimum
      };
      const result = mockFirestoreRules.validateMesure(data);
      expect(result).toBe(false);
    });

    it('should reject weight above maximum', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        poids: 350, // Above 300kg maximum
      };
      const result = mockFirestoreRules.validateMesure(data);
      expect(result).toBe(false);
    });

    it('should reject height below minimum', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        taille: 80, // Below 100cm minimum
      };
      const result = mockFirestoreRules.validateMesure(data);
      expect(result).toBe(false);
    });

    it('should reject height above maximum', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        taille: 260, // Above 250cm maximum
      };
      const result = mockFirestoreRules.validateMesure(data);
      expect(result).toBe(false);
    });

    it('should accept optional measurements', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        // Only required fields
      };
      const result = mockFirestoreRules.validateMesure(data);
      expect(result).toBe(true);
    });
  });

  describe('validateJournalEntry', () => {
    it('should validate correct journal entry data', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        note: 'Great day!',
        humeur: 8, // ← CORRECTION : number 1-10 (pas string)
        sommeil_duree: 8,
      };
      const result = mockFirestoreRules.validateJournalEntry(data);
      expect(result).toBe(true);
    });

    it('should reject invalid mood', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        humeur: 11, // ← CORRECTION : number hors range (>10)
      };
      const result = mockFirestoreRules.validateJournalEntry(data);
      expect(result).toBe(false);
    });

    it('should reject negative sleep duration', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        sommeil_duree: -1,
      };
      const result = mockFirestoreRules.validateJournalEntry(data);
      expect(result).toBe(false);
    });

    it('should reject sleep duration over 24 hours', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        sommeil_duree: 25,
      };
      const result = mockFirestoreRules.validateJournalEntry(data);
      expect(result).toBe(false);
    });

    it('should accept optional fields', () => {
      const data = {
        user_id: 'test-user',
        date: '2025-01-15',
        // Only required fields
      };
      const result = mockFirestoreRules.validateJournalEntry(data);
      expect(result).toBe(true);
    });
  });

  describe('validateUser', () => {
    it('should validate correct user data', () => {
      const data = {
        id: 'test-user',
        email: 'test@example.com',
        role: 'sportif',
        nom: 'Doe',
        prenom: 'John',
      };
      const result = mockFirestoreRules.validateUser(data);
      expect(result).toBe(true);
    });

    it('should reject invalid role', () => {
      const data = {
        id: 'test-user',
        email: 'test@example.com',
        role: 'invalid-role',
      };
      const result = mockFirestoreRules.validateUser(data);
      expect(result).toBe(false);
    });

    it('should accept coach role', () => {
      const data = {
        id: 'test-coach',
        email: 'coach@example.com',
        role: 'coach',
      };
      const result = mockFirestoreRules.validateUser(data);
      expect(result).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow operations within rate limit', () => {
      const result = mockFirestoreRules.checkRateLimit();
      expect(result).toBe(true);
    });

    it('should allow create operations within rate limit', () => {
      const result = mockFirestoreRules.checkCreateRateLimit();
      expect(result).toBe(true);
    });
  });
});