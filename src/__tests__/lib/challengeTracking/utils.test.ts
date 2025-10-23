/**
 * Tests unitaires pour les utilitaires de tracking challenges
 * 
 * @module tests/lib/challengeTracking/utils
 * @created 23.10.2025
 */

import { describe, it, expect } from 'vitest';
import {
  getWeekBounds,
  getTodayBounds,
  getMonthBounds,
  getWeeksBackBounds,
  isDateInBounds,
  daysBetween,
  getDatesInBounds,
} from '@/lib/challengeTracking/utils';

describe('getWeekBounds', () => {
  it('should return Monday 00:00 to Sunday 23:59', () => {
    // Test avec un mercredi (24 Oct 2025)
    const wednesday = new Date('2025-10-24T15:30:00.000Z');
    const { start, end } = getWeekBounds(wednesday);

    // Devrait retourner lundi 20 Oct et dimanche 26 Oct
    expect(start.getDay()).toBe(1); // Lundi
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);

    expect(end.getDay()).toBe(0); // Dimanche
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
  });

  it('should handle Sunday correctly', () => {
    // Dimanche = début de semaine suivante
    const sunday = new Date('2025-10-26T10:00:00.000Z');
    const { start } = getWeekBounds(sunday);

    expect(start.getDay()).toBe(1); // Lundi

    // Start devrait être 6 jours avant
    expect(daysBetween(start, sunday)).toBe(6);
  });

  it('should handle Monday correctly', () => {
    const monday = new Date('2025-10-20T10:00:00.000Z');
    const { start } = getWeekBounds(monday);

    expect(start.getDay()).toBe(1); // Lundi
    expect(start.getDate()).toBe(monday.getDate()); // Même jour
  });

  it('should return 7 days span', () => {
    const anyDate = new Date('2025-10-23T12:00:00.000Z');
    const { start, end } = getWeekBounds(anyDate);

    // Durée = 6.99... jours (arrondi à 6)
    const days = daysBetween(start, end);
    expect(days).toBeGreaterThanOrEqual(6);
    expect(days).toBeLessThanOrEqual(7);
  });
});

describe('getTodayBounds', () => {
  it('should return 00:00 to 23:59 of the same day', () => {
    const date = new Date('2025-10-23T15:30:45.123Z');
    const { start, end } = getTodayBounds(date);

    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(9); // October = 9
    expect(start.getDate()).toBe(23);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);

    expect(end.getFullYear()).toBe(2025);
    expect(end.getMonth()).toBe(9);
    expect(end.getDate()).toBe(23);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getMilliseconds()).toBe(999);
  });

  it('should handle midnight correctly', () => {
    const midnight = new Date('2025-10-23T00:00:00.000Z');
    const { start, end } = getTodayBounds(midnight);

    // Start devrait être 00:00 du jour local
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    // End devrait être 23:59 du même jour
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });

  it('should handle end of day correctly', () => {
    const endOfDay = new Date('2025-10-23T23:59:59.999Z');
    const { start, end } = getTodayBounds(endOfDay);

    // Start = 00:00 du jour
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    // End = 23:59 du jour
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });
});

describe('getMonthBounds', () => {
  it('should return first day 00:00 to last day 23:59', () => {
    const date = new Date('2025-10-15T15:30:00.000Z');
    const { start, end } = getMonthBounds(date);

    expect(start.getDate()).toBe(1); // 1er jour
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);

    expect(end.getDate()).toBe(31); // Octobre a 31 jours
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
  });

  it('should handle February (28 days)', () => {
    const feb = new Date('2025-02-15T12:00:00.000Z');
    const { start, end } = getMonthBounds(feb);

    expect(start.getDate()).toBe(1);
    expect(end.getDate()).toBe(28); // 2025 n'est pas bissextile
  });

  it('should handle February (29 days) in leap year', () => {
    const feb2024 = new Date('2024-02-15T12:00:00.000Z');
    const { end } = getMonthBounds(feb2024);

    expect(end.getDate()).toBe(29); // 2024 est bissextile
  });

  it('should handle December correctly', () => {
    const dec = new Date('2025-12-15T12:00:00.000Z');
    const { start, end } = getMonthBounds(dec);

    expect(start.getMonth()).toBe(11); // Décembre
    expect(end.getMonth()).toBe(11);
    expect(end.getDate()).toBe(31);
  });
});

describe('getWeeksBackBounds', () => {
  it('should return bounds for N weeks back', () => {
    const reference = new Date('2025-10-23T12:00:00.000Z'); // Mercredi
    const { start, end } = getWeeksBackBounds(4, reference);

    // Start = 4 semaines en arrière (début de semaine)
    expect(start.getDay()).toBe(1); // Lundi

    // End = fin de la semaine courante
    expect(end.getDay()).toBe(0); // Dimanche

    // Durée totale = 4 semaines (28 jours)
    expect(daysBetween(start, end)).toBeGreaterThanOrEqual(27);
    expect(daysBetween(start, end)).toBeLessThanOrEqual(28);
  });

  it('should throw error for invalid weeksBack < 1', () => {
    expect(() => getWeeksBackBounds(0)).toThrow('weeksBack must be between 1 and 52');
  });

  it('should throw error for invalid weeksBack > 52', () => {
    expect(() => getWeeksBackBounds(53)).toThrow('weeksBack must be between 1 and 52');
  });

  it('should handle 1 week back (current week)', () => {
    const reference = new Date('2025-10-23T12:00:00.000Z');
    const { start, end } = getWeeksBackBounds(1, reference);

    // Devrait être identique à getWeekBounds
    const currentWeek = getWeekBounds(reference);
    expect(start.getTime()).toBe(currentWeek.start.getTime());
    expect(end.getTime()).toBe(currentWeek.end.getTime());
  });
});

describe('isDateInBounds', () => {
  it('should return true for date within bounds', () => {
    const bounds = {
      start: new Date('2025-10-20T00:00:00.000Z'),
      end: new Date('2025-10-26T23:59:59.999Z'),
    };
    const dateInside = new Date('2025-10-23T12:00:00.000Z');

    expect(isDateInBounds(dateInside, bounds)).toBe(true);
  });

  it('should return false for date before bounds', () => {
    const bounds = {
      start: new Date('2025-10-20T00:00:00.000Z'),
      end: new Date('2025-10-26T23:59:59.999Z'),
    };
    const dateBefore = new Date('2025-10-19T23:59:59.999Z');

    expect(isDateInBounds(dateBefore, bounds)).toBe(false);
  });

  it('should return false for date after bounds', () => {
    const bounds = {
      start: new Date('2025-10-20T00:00:00.000Z'),
      end: new Date('2025-10-26T23:59:59.999Z'),
    };
    const dateAfter = new Date('2025-10-27T00:00:00.000Z');

    expect(isDateInBounds(dateAfter, bounds)).toBe(false);
  });

  it('should return true for date equal to start', () => {
    const bounds = {
      start: new Date('2025-10-20T00:00:00.000Z'),
      end: new Date('2025-10-26T23:59:59.999Z'),
    };
    const dateAtStart = new Date('2025-10-20T00:00:00.000Z');

    expect(isDateInBounds(dateAtStart, bounds)).toBe(true);
  });

  it('should return true for date equal to end', () => {
    const bounds = {
      start: new Date('2025-10-20T00:00:00.000Z'),
      end: new Date('2025-10-26T23:59:59.999Z'),
    };
    const dateAtEnd = new Date('2025-10-26T23:59:59.999Z');

    expect(isDateInBounds(dateAtEnd, bounds)).toBe(true);
  });
});

describe('daysBetween', () => {
  it('should return 0 for same date', () => {
    const date = new Date('2025-10-23T12:00:00.000Z');
    expect(daysBetween(date, date)).toBe(0);
  });

  it('should return 1 for next day', () => {
    const start = new Date('2025-10-23T12:00:00.000Z');
    const end = new Date('2025-10-24T12:00:00.000Z');
    expect(daysBetween(start, end)).toBe(1);
  });

  it('should return 7 for one week', () => {
    const start = new Date('2025-10-20T00:00:00.000Z');
    const end = new Date('2025-10-27T00:00:00.000Z');
    expect(daysBetween(start, end)).toBe(7);
  });

  it('should handle partial days (floor)', () => {
    const start = new Date('2025-10-23T12:00:00.000Z');
    const end = new Date('2025-10-24T06:00:00.000Z');
    expect(daysBetween(start, end)).toBe(0); // < 24h = 0 jours
  });

  it('should handle negative duration', () => {
    const start = new Date('2025-10-24T12:00:00.000Z');
    const end = new Date('2025-10-23T12:00:00.000Z');
    expect(daysBetween(start, end)).toBe(-1);
  });
});

describe('getDatesInBounds', () => {
  it('should return all dates in a week', () => {
    const bounds = getWeekBounds(new Date('2025-10-23T12:00:00.000Z'));
    const dates = getDatesInBounds(bounds);

    expect(dates).toHaveLength(7); // 7 jours dans une semaine
    expect(dates[0].getDay()).toBe(1); // Lundi
    expect(dates[6].getDay()).toBe(0); // Dimanche
  });

  it('should return all dates with 00:00:00 time', () => {
    const bounds = getTodayBounds(new Date('2025-10-23T15:30:00.000Z'));
    const dates = getDatesInBounds(bounds);

    expect(dates).toHaveLength(1);
    expect(dates[0].getHours()).toBe(0);
    expect(dates[0].getMinutes()).toBe(0);
    expect(dates[0].getSeconds()).toBe(0);
  });

  it('should return consecutive dates', () => {
    // Utiliser des dates locales pour éviter problèmes timezone
    const start = new Date(2025, 9, 20, 0, 0, 0, 0); // 20 Oct 2025 00:00
    const end = new Date(2025, 9, 22, 23, 59, 59, 999); // 22 Oct 2025 23:59
    const bounds = { start, end };
    const dates = getDatesInBounds(bounds);

    expect(dates).toHaveLength(3);
    expect(dates[0].getDate()).toBe(20);
    expect(dates[1].getDate()).toBe(21);
    expect(dates[2].getDate()).toBe(22);
  });

  it('should handle single day bounds', () => {
    const bounds = getTodayBounds(new Date('2025-10-23T12:00:00.000Z'));
    const dates = getDatesInBounds(bounds);

    expect(dates).toHaveLength(1);
    expect(dates[0].getDate()).toBe(23);
  });

  it('should handle month bounds', () => {
    const bounds = getMonthBounds(new Date('2025-10-15T12:00:00.000Z'));
    const dates = getDatesInBounds(bounds);

    expect(dates).toHaveLength(31); // Octobre a 31 jours
    expect(dates[0].getDate()).toBe(1);
    expect(dates[30].getDate()).toBe(31);
  });
});

describe('Edge cases', () => {
  it('should handle year transitions', () => {
    const dec31 = new Date('2025-12-31T23:59:59.999Z');
    const { start } = getWeekBounds(dec31);

    expect(start.getFullYear()).toBe(2025);
    // End peut être en 2026 si le dimanche tombe le 4 janvier
  });

  it('should handle leap year February', () => {
    const feb29_2024 = new Date('2024-02-29T12:00:00.000Z');
    const { end } = getMonthBounds(feb29_2024);

    expect(end.getDate()).toBe(29);
  });

  it('should handle timezone-independent calculations', () => {
    // Tests devraient passer quelle que soit la timezone locale
    const utcDate = new Date('2025-10-23T12:00:00.000Z');
    const bounds = getWeekBounds(utcDate);

    expect(bounds.start).toBeInstanceOf(Date);
    expect(bounds.end).toBeInstanceOf(Date);
    expect(bounds.end.getTime()).toBeGreaterThan(bounds.start.getTime());
  });
});

