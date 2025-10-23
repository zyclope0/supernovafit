/**
 * Tests - Challenge Tracking Transformations
 *
 * @module challengeTracking/transformations.test
 * @created 23.10.2025
 */

import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import {
  calculateMonthWeightLoss,
  calculateWeightLoss,
  calculateWeightLossProgress,
  hasAchievedWeightLossGoal,
  calculateWeightLossRate,
} from '@/lib/challengeTracking/transformations';
import type { Mesure } from '@/types';

describe('challengeTracking/transformations', () => {
  // Helper pour créer des mesures
  const createMesure = (date: Date, poids: number): Mesure => ({
    id: `mesure-${date.getTime()}`,
    user_id: 'user123',
    date: Timestamp.fromDate(date),
    poids,
    created_at: Timestamp.now(),
  });

  describe('calculateMonthWeightLoss', () => {
    it('doit calculer la perte de poids du mois courant', () => {
      const now = new Date(2025, 9, 15); // 15 Oct 2025
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 90), // 1 Oct: 90kg
        createMesure(new Date(2025, 9, 8), 89), // 8 Oct: 89kg
        createMesure(new Date(2025, 9, 15), 87.5), // 15 Oct: 87.5kg
      ];

      const loss = calculateMonthWeightLoss(mesures, now);
      expect(loss).toBe(2.5); // 90 - 87.5 = 2.5kg perdus
    });

    it('doit retourner 0 si moins de 2 mesures', () => {
      const now = new Date(2025, 9, 15);
      const mesures: Mesure[] = [createMesure(new Date(2025, 9, 1), 90)];

      const loss = calculateMonthWeightLoss(mesures, now);
      expect(loss).toBe(0);
    });

    it('doit ignorer les mesures sans poids', () => {
      const now = new Date(2025, 9, 15);
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 90),
        { ...createMesure(new Date(2025, 9, 8), 0), poids: undefined }, // Sans poids
        createMesure(new Date(2025, 9, 15), 88),
      ];

      const loss = calculateMonthWeightLoss(mesures, now);
      expect(loss).toBe(2); // 90 - 88 = 2kg
    });

    it('doit retourner une valeur négative si gain de poids', () => {
      const now = new Date(2025, 9, 15);
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 85), // 1 Oct: 85kg
        createMesure(new Date(2025, 9, 15), 88), // 15 Oct: 88kg
      ];

      const loss = calculateMonthWeightLoss(mesures, now);
      expect(loss).toBe(-3); // 85 - 88 = -3kg (gain)
    });

    it('doit filtrer les mesures hors du mois', () => {
      const now = new Date(2025, 9, 15); // Octobre 2025
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 8, 25), 95), // Septembre (ignoré)
        createMesure(new Date(2025, 9, 1), 90), // 1 Oct
        createMesure(new Date(2025, 9, 15), 88), // 15 Oct
        createMesure(new Date(2025, 10, 5), 85), // Novembre (ignoré)
      ];

      const loss = calculateMonthWeightLoss(mesures, now);
      expect(loss).toBe(2); // 90 - 88 = 2kg (seulement Octobre)
    });
  });

  describe('calculateWeightLoss', () => {
    it('doit calculer la perte de poids sur une période', () => {
      const startDate = new Date(2025, 9, 1);
      const endDate = new Date(2025, 9, 31);
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 92),
        createMesure(new Date(2025, 9, 15), 90),
        createMesure(new Date(2025, 9, 30), 89),
      ];

      const loss = calculateWeightLoss(mesures, startDate, endDate);
      expect(loss).toBe(3); // 92 - 89 = 3kg
    });

    it('doit retourner 0 si moins de 2 mesures', () => {
      const startDate = new Date(2025, 9, 1);
      const endDate = new Date(2025, 9, 31);
      const mesures: Mesure[] = [createMesure(new Date(2025, 9, 1), 90)];

      const loss = calculateWeightLoss(mesures, startDate, endDate);
      expect(loss).toBe(0);
    });

    it('doit filtrer les mesures hors période', () => {
      const startDate = new Date(2025, 9, 10);
      const endDate = new Date(2025, 9, 20);
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 5), 95), // Avant (ignoré)
        createMesure(new Date(2025, 9, 10), 92), // Début
        createMesure(new Date(2025, 9, 20), 90), // Fin
        createMesure(new Date(2025, 9, 25), 88), // Après (ignoré)
      ];

      const loss = calculateWeightLoss(mesures, startDate, endDate);
      expect(loss).toBe(2); // 92 - 90 = 2kg
    });
  });

  describe('calculateWeightLossProgress', () => {
    it('doit calculer le pourcentage de progression', () => {
      const startDate = new Date(2025, 9, 1);
      const endDate = new Date(2025, 9, 31);
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 90),
        createMesure(new Date(2025, 9, 15), 88.5), // Perdu 1.5kg sur 2kg objectif
      ];

      const progress = calculateWeightLossProgress(mesures, 2.0, startDate, endDate);
      expect(progress).toBe(75); // 1.5/2 * 100 = 75%
    });

    it('doit retourner 100 si objectif dépassé', () => {
      const startDate = new Date(2025, 9, 1);
      const endDate = new Date(2025, 9, 31);
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 90),
        createMesure(new Date(2025, 9, 15), 87), // Perdu 3kg sur 2kg objectif
      ];

      const progress = calculateWeightLossProgress(mesures, 2.0, startDate, endDate);
      expect(progress).toBe(100); // Clampé à 100%
    });

    it('doit retourner 0 si objectif <= 0', () => {
      const startDate = new Date(2025, 9, 1);
      const endDate = new Date(2025, 9, 31);
      const mesures: Mesure[] = [createMesure(new Date(2025, 9, 1), 90)];

      const progress = calculateWeightLossProgress(mesures, 0, startDate, endDate);
      expect(progress).toBe(0);
    });

    it('doit retourner 0 si gain de poids', () => {
      const startDate = new Date(2025, 9, 1);
      const endDate = new Date(2025, 9, 31);
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 85),
        createMesure(new Date(2025, 9, 15), 88), // Gain de 3kg
      ];

      const progress = calculateWeightLossProgress(mesures, 2.0, startDate, endDate);
      expect(progress).toBe(0); // Clampé à 0%
    });
  });

  describe('hasAchievedWeightLossGoal', () => {
    it('doit retourner true si objectif atteint', () => {
      const startDate = new Date(2025, 9, 1);
      const endDate = new Date(2025, 9, 31);
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 90),
        createMesure(new Date(2025, 9, 31), 87.5), // Perdu 2.5kg
      ];

      const achieved = hasAchievedWeightLossGoal(mesures, 2.0, startDate, endDate);
      expect(achieved).toBe(true);
    });

    it('doit retourner false si objectif non atteint', () => {
      const startDate = new Date(2025, 9, 1);
      const endDate = new Date(2025, 9, 31);
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 90),
        createMesure(new Date(2025, 9, 31), 88.5), // Perdu 1.5kg
      ];

      const achieved = hasAchievedWeightLossGoal(mesures, 2.0, startDate, endDate);
      expect(achieved).toBe(false);
    });

    it('doit retourner false si gain de poids', () => {
      const startDate = new Date(2025, 9, 1);
      const endDate = new Date(2025, 9, 31);
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 85),
        createMesure(new Date(2025, 9, 31), 88), // Gain de 3kg
      ];

      const achieved = hasAchievedWeightLossGoal(mesures, 2.0, startDate, endDate);
      expect(achieved).toBe(false);
    });
  });

  describe('calculateWeightLossRate', () => {
    it('doit calculer la vitesse de perte en kg/semaine', () => {
      const startDate = new Date(2025, 9, 1);
      const endDate = new Date(2025, 9, 29); // 28 jours = 4 semaines
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 90),
        createMesure(new Date(2025, 9, 29), 88), // Perdu 2kg en 4 semaines
      ];

      const rate = calculateWeightLossRate(mesures, startDate, endDate);
      expect(rate).toBe(0.5); // 2kg / 4 semaines = 0.5 kg/semaine
    });

    it('doit retourner 0 si période < 7 jours', () => {
      const startDate = new Date(2025, 9, 1);
      const endDate = new Date(2025, 9, 5); // 4 jours
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 90),
        createMesure(new Date(2025, 9, 5), 89),
      ];

      const rate = calculateWeightLossRate(mesures, startDate, endDate);
      expect(rate).toBe(0);
    });

    it('doit gérer les taux de perte rapides', () => {
      const startDate = new Date(2025, 9, 1);
      const endDate = new Date(2025, 9, 15); // 14 jours = 2 semaines
      const mesures: Mesure[] = [
        createMesure(new Date(2025, 9, 1), 95),
        createMesure(new Date(2025, 9, 15), 90), // Perdu 5kg en 2 semaines
      ];

      const rate = calculateWeightLossRate(mesures, startDate, endDate);
      expect(rate).toBe(2.5); // 5kg / 2 semaines = 2.5 kg/semaine
    });
  });
});

