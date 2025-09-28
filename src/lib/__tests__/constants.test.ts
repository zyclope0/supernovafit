/**
 * Tests pour constants
 * Tests simples pour les constantes de l'application
 */

import { describe, it, expect } from 'vitest';
import {
  APP_NAME,
  APP_VERSION,
  APP_RELEASE_DATE,
  ACTIVITY_LEVELS,
} from '../constants';

describe('constants', () => {
  describe('App constants', () => {
    it("devrait avoir un nom d'application défini", () => {
      expect(APP_NAME).toBeDefined();
      expect(typeof APP_NAME).toBe('string');
      expect(APP_NAME.length).toBeGreaterThan(0);
    });

    it('devrait avoir une version définie', () => {
      expect(APP_VERSION).toBeDefined();
      expect(typeof APP_VERSION).toBe('string');
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/); // Format x.y.z
    });

    it('devrait avoir une date de release définie', () => {
      expect(APP_RELEASE_DATE).toBeDefined();
      expect(typeof APP_RELEASE_DATE).toBe('string');
      expect(APP_RELEASE_DATE.length).toBeGreaterThan(0);
    });
  });

  describe('Activity levels', () => {
    it("devrait avoir des niveaux d'activité définis", () => {
      expect(ACTIVITY_LEVELS).toBeDefined();
      expect(typeof ACTIVITY_LEVELS).toBe('object');
    });

    it("devrait avoir des niveaux d'activité avec des valeurs numériques", () => {
      const levels = Object.values(ACTIVITY_LEVELS);
      levels.forEach((level) => {
        expect(typeof level).toBe('number');
        expect(level).toBeGreaterThan(0);
        expect(level).toBeLessThanOrEqual(2);
      });
    });

    it("devrait avoir au moins 4 niveaux d'activité", () => {
      const levelCount = Object.keys(ACTIVITY_LEVELS).length;
      expect(levelCount).toBeGreaterThanOrEqual(4);
    });
  });
});
