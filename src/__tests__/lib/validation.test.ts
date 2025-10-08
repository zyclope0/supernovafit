import { describe, it, expect } from 'vitest';
import {
  repasSchema,
  entrainementSchema,
  mesureSchema,
  journalSchema as journalEntrySchema, // ← CORRECTION : utiliser le vrai schema
  userSchema, // ← CORRECTION : importer le vrai userSchema
} from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('repasSchema', () => {
    it('should validate correct repas data', () => {
      const validRepas = {
        user_id: 'test-user',
        date: '2025-01-15',
        repas: 'dejeuner',
        aliments: [
          {
            id: 'aliment-1', // ← CORRECTION : id requis
            nom: 'Poulet',
            quantite: 150,
            unite: 'g',
            macros: {     // ← CORRECTION : macros dans un objet
              kcal: 250,  // ← CORRECTION : kcal (pas calories)
              prot: 45,   // ← CORRECTION : prot (pas proteines)
              glucides: 0,
              lipides: 5,
            },
          },
        ],
        macros: {         // ← CORRECTION : macros totaux requis
          kcal: 250,
          prot: 45,
          glucides: 0,
          lipides: 5,
        },
      };

      const result = repasSchema.safeParse(validRepas);
      expect(result.success).toBe(true);
    });

    it('should reject invalid repas type', () => {
      const invalidRepas = {
        user_id: 'test-user',
        date: '2025-01-15',
        repas: 'invalid-type',
        aliments: [],
      };

      const result = repasSchema.safeParse(invalidRepas);
      expect(result.success).toBe(false);
    });

    it('should reject empty aliments array', () => {
      const invalidRepas = {
        user_id: 'test-user',
        date: '2025-01-15',
        repas: 'dejeuner',
        aliments: [],
      };

      const result = repasSchema.safeParse(invalidRepas);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const invalidRepas = {
        user_id: 'test-user',
        date: 'invalid-date',
        repas: 'dejeuner',
        aliments: [
          {
            nom: 'Poulet',
            quantite: 150,
            unite: 'g',
            calories: 250,
            proteines: 45,
            glucides: 0,
            lipides: 5,
          },
        ],
      };

      const result = repasSchema.safeParse(invalidRepas);
      expect(result.success).toBe(false);
    });
  });

  describe('entrainementSchema', () => {
    it('should validate correct entrainement data', () => {
      const validEntrainement = {
        user_id: 'test-user',
        date: '2025-01-15',
        type: 'cardio',
        duree: 45,
        source: 'manuel',
        commentaire: 'Course matinale',
        calories: 300,
      };

      const result = entrainementSchema.safeParse(validEntrainement);
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const invalidEntrainement = {
        user_id: 'test-user',
        date: '2025-01-15',
        type: 'invalid-type',
        duree: 45,
        source: 'manuel',
      };

      const result = entrainementSchema.safeParse(invalidEntrainement);
      expect(result.success).toBe(false);
    });

    it('should reject invalid source', () => {
      const invalidEntrainement = {
        user_id: 'test-user',
        date: '2025-01-15',
        type: 'cardio',
        duree: 45,
        source: 'invalid-source',
      };

      const result = entrainementSchema.safeParse(invalidEntrainement);
      expect(result.success).toBe(false);
    });

    it('should reject negative duration', () => {
      const invalidEntrainement = {
        user_id: 'test-user',
        date: '2025-01-15',
        type: 'cardio',
        duree: -10,
        source: 'manuel',
      };

      const result = entrainementSchema.safeParse(invalidEntrainement);
      expect(result.success).toBe(false);
    });

    it('should reject duration over 24 hours', () => {
      const invalidEntrainement = {
        user_id: 'test-user',
        date: '2025-01-15',
        type: 'cardio',
        duree: 1500, // 25 hours
        source: 'manuel',
      };

      const result = entrainementSchema.safeParse(invalidEntrainement);
      expect(result.success).toBe(false);
    });
  });

  describe('mesureSchema', () => {
    it('should validate correct mesure data', () => {
      const validMesure = {
        user_id: 'test-user',
        date: '2025-01-15',
        poids: 75.5,
        taille: 175,
        tour_taille: 85,
      };

      const result = mesureSchema.safeParse(validMesure);
      expect(result.success).toBe(true);
    });

    it('should reject weight below minimum', () => {
      const invalidMesure = {
        user_id: 'test-user',
        date: '2025-01-15',
        poids: 15, // Below 20kg minimum
      };

      const result = mesureSchema.safeParse(invalidMesure);
      expect(result.success).toBe(false);
    });

    it('should reject weight above maximum', () => {
      const invalidMesure = {
        user_id: 'test-user',
        date: '2025-01-15',
        poids: 350, // Above 300kg maximum
      };

      const result = mesureSchema.safeParse(invalidMesure);
      expect(result.success).toBe(false);
    });

    it('should reject height below minimum', () => {
      const invalidMesure = {
        user_id: 'test-user',
        date: '2025-01-15',
        taille: 80, // Below 100cm minimum
      };

      const result = mesureSchema.safeParse(invalidMesure);
      expect(result.success).toBe(false);
    });

    it('should reject height above maximum', () => {
      const invalidMesure = {
        user_id: 'test-user',
        date: '2025-01-15',
        taille: 260, // Above 250cm maximum
      };

      const result = mesureSchema.safeParse(invalidMesure);
      expect(result.success).toBe(false);
    });

    it('should reject waist measurement below minimum', () => {
      const invalidMesure = {
        user_id: 'test-user',
        date: '2025-01-15',
        tour_taille: 25, // Below 30cm minimum
      };

      const result = mesureSchema.safeParse(invalidMesure);
      expect(result.success).toBe(false);
    });

    it('should accept optional measurements', () => {
      const validMesure = {
        user_id: 'test-user',
        date: '2025-01-15',
        // Only required fields
      };

      const result = mesureSchema.safeParse(validMesure);
      expect(result.success).toBe(true);
    });
  });

  describe('journalEntrySchema', () => {
    it('should validate correct journal entry data', () => {
      const validEntry = {
        user_id: 'test-user',
        date: '2025-01-15',
        note: 'Great day!',
        humeur: 8, // ← CORRECTION : number 1-10 (pas string)
        fatigue: 2,
        motivation: 5,
        energie: 4,
        sommeil_duree: 8,
        sommeil_qualite: 4,
        stress: 1,
      };

      const result = journalEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should reject invalid mood', () => {
      const invalidEntry = {
        user_id: 'test-user',
        date: '2025-01-15',
        humeur: 11, // ← CORRECTION : number hors range (max=10)
      };

      const result = journalEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should reject negative fatigue', () => {
      const invalidEntry = {
        user_id: 'test-user',
        date: '2025-01-15',
        fatigue: 0, // ← CORRECTION : fatigue min=1, pas 0
      };

      const result = journalEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should reject fatigue above 10', () => { // ← CORRECTION : titre
      const invalidEntry = {
        user_id: 'test-user',
        date: '2025-01-15',
        fatigue: 11, // ← CORRECTION : fatigue max=10, pas 5
      };

      const result = journalEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should reject negative sleep duration', () => {
      const invalidEntry = {
        user_id: 'test-user',
        date: '2025-01-15',
        sommeil_duree: -1,
      };

      const result = journalEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should reject sleep duration above 24 hours', () => {
      const invalidEntry = {
        user_id: 'test-user',
        date: '2025-01-15',
        sommeil_duree: 25,
      };

      const result = journalEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const validEntry = {
        user_id: 'test-user',
        date: '2025-01-15',
        // Only required fields
      };

      const result = journalEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });
  });

  describe('userSchema', () => {
    it('should validate correct user data', () => {
      const validUser = {
        id: 'test-user',
        email: 'test@example.com',
        role: 'sportif',
        nom: 'Doe',
        prenom: 'John',
        displayName: 'John Doe',
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalidUser = {
        id: 'test-user',
        email: 'test@example.com',
        role: 'invalid-role',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        id: 'test-user',
        email: 'invalid-email',
        role: 'sportif',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should accept coach role', () => {
      const validUser = {
        id: 'test-coach',
        email: 'coach@example.com',
        role: 'coach',
        nom: 'Coach',
        prenom: 'Jane',
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });
  });
});
