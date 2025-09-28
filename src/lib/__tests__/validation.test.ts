/**
 * Tests pour validation.ts
 * Tests complets des schémas Zod SuperNovaFit
 */

import { describe, it, expect } from 'vitest';
import {
  macrosSchema,
  alimentSchema,
  repasSchema,
  entrainementSchema,
  mesureSchema,
  formatZodError,
} from '../validation';

describe('validation schemas', () => {
  describe('macrosSchema', () => {
    it('devrait valider des macros correctes', () => {
      const validMacros = {
        kcal: 250,
        prot: 15,
        glucides: 30,
        lipides: 10,
      };

      const result = macrosSchema.safeParse(validMacros);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter des calories négatives', () => {
      const invalidMacros = {
        kcal: -100,
        prot: 15,
        glucides: 30,
        lipides: 10,
      };

      const result = macrosSchema.safeParse(invalidMacros);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('négatives');
      }
    });

    it('devrait rejeter des calories trop élevées', () => {
      const invalidMacros = {
        kcal: 15000,
        prot: 15,
        glucides: 30,
        lipides: 10,
      };

      const result = macrosSchema.safeParse(invalidMacros);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('trop élevées');
      }
    });

    it('devrait rejeter des valeurs infinies', () => {
      const invalidMacros = {
        kcal: Infinity,
        prot: 15,
        glucides: 30,
        lipides: 10,
      };

      const result = macrosSchema.safeParse(invalidMacros);
      expect(result.success).toBe(false);
    });

    it('devrait valider les limites des protéines', () => {
      // Limite haute
      const highProtein = {
        kcal: 250,
        prot: 1500, // Trop élevé
        glucides: 30,
        lipides: 10,
      };

      const result = macrosSchema.safeParse(highProtein);
      expect(result.success).toBe(false);
    });

    it('devrait valider les limites des glucides', () => {
      const highCarbs = {
        kcal: 250,
        prot: 15,
        glucides: 2500, // Trop élevé
        lipides: 10,
      };

      const result = macrosSchema.safeParse(highCarbs);
      expect(result.success).toBe(false);
    });

    it('devrait valider les limites des lipides', () => {
      const highFat = {
        kcal: 250,
        prot: 15,
        glucides: 30,
        lipides: 600, // Trop élevé
      };

      const result = macrosSchema.safeParse(highFat);
      expect(result.success).toBe(false);
    });
  });

  describe('alimentSchema', () => {
    const validAliment = {
      id: 'aliment-123',
      nom: 'Pomme',
      quantite: 150,
      unite: 'g',
      macros: {
        kcal: 80,
        prot: 0.3,
        glucides: 20,
        lipides: 0.2,
      },
    };

    it('devrait valider un aliment correct', () => {
      const result = alimentSchema.safeParse(validAliment);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un ID vide', () => {
      const invalidAliment = { ...validAliment, id: '' };
      const result = alimentSchema.safeParse(invalidAliment);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter un nom trop long', () => {
      const invalidAliment = {
        ...validAliment,
        nom: 'A'.repeat(101), // Trop long
      };
      const result = alimentSchema.safeParse(invalidAliment);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter une quantité trop faible', () => {
      const invalidAliment = { ...validAliment, quantite: 0.05 };
      const result = alimentSchema.safeParse(invalidAliment);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter une quantité trop élevée', () => {
      const invalidAliment = { ...validAliment, quantite: 15000 };
      const result = alimentSchema.safeParse(invalidAliment);
      expect(result.success).toBe(false);
    });

    it('devrait valider avec macros_base optionnel', () => {
      const alimentWithBase = {
        ...validAliment,
        macros_base: {
          kcal: 52,
          prot: 0.2,
          glucides: 13,
          lipides: 0.1,
        },
      };
      const result = alimentSchema.safeParse(alimentWithBase);
      expect(result.success).toBe(true);
    });
  });

  describe('repasSchema', () => {
    const validRepas = {
      user_id: 'user-123',
      date: '2025-01-14',
      repas: 'dejeuner', // Correct field name
      aliments: [
        {
          id: 'aliment-123',
          nom: 'Pomme',
          quantite: 150,
          unite: 'g',
          macros: {
            kcal: 80,
            prot: 0.3,
            glucides: 20,
            lipides: 0.2,
          },
        },
      ],
      macros: {
        // Required field
        kcal: 80,
        prot: 0.3,
        glucides: 20,
        lipides: 0.2,
      },
    };

    it('devrait valider un repas correct', () => {
      const result = repasSchema.safeParse(validRepas);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un format de date invalide', () => {
      const invalidRepas = { ...validRepas, date: '14/01/2025' };
      const result = repasSchema.safeParse(invalidRepas);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter une date trop ancienne', () => {
      const invalidRepas = { ...validRepas, date: '2019-12-31' };
      const result = repasSchema.safeParse(invalidRepas);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter une date trop future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 5);
      const invalidRepas = {
        ...validRepas,
        date: tomorrow.toISOString().split('T')[0],
      };
      const result = repasSchema.safeParse(invalidRepas);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter un type de repas invalide', () => {
      const invalidRepas = { ...validRepas, repas: 'gouter' }; // Non valide
      const result = repasSchema.safeParse(invalidRepas);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter un repas sans aliments', () => {
      const invalidRepas = { ...validRepas, aliments: [] };
      const result = repasSchema.safeParse(invalidRepas);
      expect(result.success).toBe(false);
    });
  });

  describe('entrainementSchema', () => {
    const validEntrainement = {
      user_id: 'user-123',
      date: '2025-01-14',
      type: 'course',
      duree: 45,
      source: 'manuel',
      calories: 350,
      commentaire: 'Bonne session',
    };

    it('devrait valider un entraînement correct', () => {
      const result = entrainementSchema.safeParse(validEntrainement);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter une durée négative', () => {
      const invalidEntrainement = { ...validEntrainement, duree: -10 };
      const result = entrainementSchema.safeParse(invalidEntrainement);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter une durée trop longue', () => {
      const invalidEntrainement = { ...validEntrainement, duree: 1500 }; // > 1440 min (24h)
      const result = entrainementSchema.safeParse(invalidEntrainement);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter un type invalide', () => {
      const invalidEntrainement = { ...validEntrainement, type: 'invalid' };
      const result = entrainementSchema.safeParse(invalidEntrainement);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter une source invalide', () => {
      const invalidEntrainement = { ...validEntrainement, source: 'unknown' };
      const result = entrainementSchema.safeParse(invalidEntrainement);
      expect(result.success).toBe(false);
    });

    it('devrait valider avec des champs optionnels', () => {
      const minimalEntrainement = {
        user_id: 'user-123',
        date: '2025-01-14',
        type: 'course',
        duree: 45,
        source: 'manuel', // Required field
      };
      const result = entrainementSchema.safeParse(minimalEntrainement);
      expect(result.success).toBe(true);
    });
  });

  describe('mesureSchema', () => {
    const validMesure = {
      user_id: 'user-123',
      date: '2025-01-14',
      poids: 75.5,
      tour_taille: 85,
      tour_hanches: 95,
    };

    it('devrait valider une mesure correcte', () => {
      const result = mesureSchema.safeParse(validMesure);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un poids négatif', () => {
      const invalidMesure = { ...validMesure, poids: -5 };
      const result = mesureSchema.safeParse(invalidMesure);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter un poids trop élevé', () => {
      const invalidMesure = { ...validMesure, poids: 500 };
      const result = mesureSchema.safeParse(invalidMesure);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter un tour de taille trop faible', () => {
      const invalidMesure = { ...validMesure, tour_taille: 30 };
      const result = mesureSchema.safeParse(invalidMesure);
      expect(result.success).toBe(false);
    });

    it('devrait rejeter un tour de hanches trop faible', () => {
      const invalidMesure = { ...validMesure, tour_hanches: 40 };
      const result = mesureSchema.safeParse(invalidMesure);
      expect(result.success).toBe(false);
    });

    it('devrait valider avec seulement les champs requis', () => {
      const minimalMesure = {
        user_id: 'user-123',
        date: '2025-01-14',
      };
      const result = mesureSchema.safeParse(minimalMesure);
      expect(result.success).toBe(true);
    });
  });

  describe('formatZodError', () => {
    it('devrait formater les erreurs Zod correctement', () => {
      const invalidMacros = {
        kcal: -100,
        prot: 'invalid', // Type incorrect
        glucides: 30,
        lipides: 10,
      };

      const result = macrosSchema.safeParse(invalidMacros);
      expect(result.success).toBe(false);

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(Array.isArray(formatted)).toBe(true);
        expect(formatted.length).toBeGreaterThan(0);
        expect(formatted[0]).toContain(':'); // Format "field : message"
      }
    });

    it('devrait gérer les erreurs sans path', () => {
      // Simuler une erreur sans path spécifique
      const invalidData = null;
      const result = macrosSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(Array.isArray(formatted)).toBe(true);
      }
    });

    it('devrait gérer les erreurs multiples', () => {
      const invalidMacros = {
        kcal: -100, // Erreur 1
        prot: 2000, // Erreur 2
        glucides: -50, // Erreur 3
        lipides: 10,
      };

      const result = macrosSchema.safeParse(invalidMacros);
      expect(result.success).toBe(false);

      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(formatted.length).toBeGreaterThan(1);
      }
    });
  });

  describe('Edge cases et intégration', () => {
    it('devrait gérer les valeurs limites', () => {
      const limitMacros = {
        kcal: 0, // Limite basse
        prot: 1000, // Limite haute
        glucides: 2000, // Limite haute
        lipides: 500, // Limite haute
      };

      const result = macrosSchema.safeParse(limitMacros);
      expect(result.success).toBe(true);
    });

    it('devrait gérer les types de données incorrects', () => {
      const wrongTypes = {
        kcal: '250', // String au lieu de number
        prot: null,
        glucides: undefined,
        lipides: 'text',
      };

      const result = macrosSchema.safeParse(wrongTypes);
      expect(result.success).toBe(false);
    });

    it('devrait valider des données complexes imbriquées', () => {
      const complexRepas = {
        user_id: 'user-123',
        date: '2025-01-14',
        repas: 'dejeuner',
        aliments: [
          {
            id: 'aliment-1',
            nom: 'Riz complet',
            quantite: 100,
            unite: 'g',
            macros: {
              kcal: 350,
              prot: 8,
              glucides: 70,
              lipides: 2,
            },
          },
          {
            id: 'aliment-2',
            nom: 'Poulet grillé',
            quantite: 150,
            unite: 'g',
            macros: {
              kcal: 240,
              prot: 45,
              glucides: 0,
              lipides: 5,
            },
          },
        ],
        macros: {
          kcal: 590,
          prot: 53,
          glucides: 70,
          lipides: 7,
        },
      };

      const result = repasSchema.safeParse(complexRepas);
      expect(result.success).toBe(true);
    });
  });
});
