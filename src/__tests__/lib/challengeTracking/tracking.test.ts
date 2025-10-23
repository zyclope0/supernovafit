/**
 * Tests - Challenge Tracking & Mesures
 *
 * Tests unitaires pour les calculs de progression tracking/mesures
 * Couverture: 100% des fonctions et edge cases
 *
 * @vitest-environment jsdom
 * @created 23.10.2025
 */

import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import type { Mesure, JournalEntry } from '@/types';
import {
  countWeekWeighIns,
  countWeekJournalEntries,
  calculateWeighInStreak,
  calculateJournalStreak,
  hasTodayWeighIn,
  hasTodayJournalEntry,
} from '@/lib/challengeTracking/tracking';

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

/**
 * Crée une entrée journal mock
 */
function createMockJournal(date: Date, notes: string = 'Test'): JournalEntry {
  return {
    id: `journal-${Math.random()}`,
    user_id: 'test-user',
    date: createTimestamp(date),
    notes,
    energie: 5,
    humeur: 5,
    motivation: 5,
  };
}

// ========================================
// Tests countWeekWeighIns
// ========================================

describe('countWeekWeighIns', () => {
  it('doit compter les jours avec pesée cette semaine', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0); // Mercredi
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 13, 8, 0, 0), 75), // Lundi
      createMockMesure(new Date(2025, 0, 14, 8, 0, 0), 75.2), // Mardi
      createMockMesure(new Date(2025, 0, 15, 8, 0, 0), 75.5), // Mercredi
      // Jeudi manquant
      createMockMesure(new Date(2025, 0, 17, 8, 0, 0), 75.8), // Vendredi
    ];

    const count = countWeekWeighIns(mesures, today);
    expect(count).toBe(4); // Lundi, Mardi, Mercredi, Vendredi
  });

  it('doit ignorer les mesures sans poids', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 15, 8, 0, 0), 75),
      {
        ...createMockMesure(new Date(2025, 0, 15, 9, 0, 0), 0),
        poids: undefined,
      },
    ];

    const count = countWeekWeighIns(mesures, today);
    expect(count).toBe(1); // Seulement la mesure avec poids
  });

  it('doit ignorer les mesures avec poids zéro', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 15, 8, 0, 0), 75),
      createMockMesure(new Date(2025, 0, 14, 8, 0, 0), 0),
    ];

    const count = countWeekWeighIns(mesures, today);
    expect(count).toBe(1);
  });

  it('doit compter un jour une seule fois même avec plusieurs mesures', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 15, 8, 0, 0), 75),
      createMockMesure(new Date(2025, 0, 15, 12, 0, 0), 75.2),
      createMockMesure(new Date(2025, 0, 15, 18, 0, 0), 75.5),
    ];

    const count = countWeekWeighIns(mesures, today);
    expect(count).toBe(1); // Un seul jour
  });

  it('doit retourner 0 si aucune mesure', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const count = countWeekWeighIns([], today);
    expect(count).toBe(0);
  });
});

// ========================================
// Tests countWeekJournalEntries
// ========================================

describe('countWeekJournalEntries', () => {
  it('doit compter les jours avec journal cette semaine', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entries: JournalEntry[] = [
      createMockJournal(new Date(2025, 0, 13, 8, 0, 0)),
      createMockJournal(new Date(2025, 0, 14, 8, 0, 0)),
      createMockJournal(new Date(2025, 0, 15, 8, 0, 0)),
    ];

    const count = countWeekJournalEntries(entries, today);
    expect(count).toBe(3);
  });

  it('doit compter un jour une seule fois même avec plusieurs entrées', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entries: JournalEntry[] = [
      createMockJournal(new Date(2025, 0, 15, 8, 0, 0)),
      createMockJournal(new Date(2025, 0, 15, 12, 0, 0)),
    ];

    const count = countWeekJournalEntries(entries, today);
    expect(count).toBe(1);
  });

  it('doit retourner 0 si aucune entrée', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const count = countWeekJournalEntries([], today);
    expect(count).toBe(0);
  });
});

// ========================================
// Tests calculateWeighInStreak
// ========================================

describe('calculateWeighInStreak', () => {
  it('doit calculer la streak si pesée aujourd\'hui', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 15, 8, 0, 0), 75), // Aujourd'hui
      createMockMesure(new Date(2025, 0, 14, 8, 0, 0), 75.1), // Hier
      createMockMesure(new Date(2025, 0, 13, 8, 0, 0), 75.2), // Avant-hier
    ];

    const streak = calculateWeighInStreak(mesures, today);
    expect(streak).toBe(3);
  });

  it('doit calculer la streak si pesée hier (tolérance)', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 14, 8, 0, 0), 75), // Hier
      createMockMesure(new Date(2025, 0, 13, 8, 0, 0), 75.1), // Avant-hier
    ];

    const streak = calculateWeighInStreak(mesures, today);
    expect(streak).toBe(2);
  });

  it('doit retourner 0 si dernière pesée > 1 jour', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 13, 8, 0, 0), 75), // Il y a 2 jours
      createMockMesure(new Date(2025, 0, 12, 8, 0, 0), 75.1),
    ];

    const streak = calculateWeighInStreak(mesures, today);
    expect(streak).toBe(0);
  });

  it('doit s\'arrêter si un jour est manquant', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 15, 8, 0, 0), 75), // Aujourd'hui
      createMockMesure(new Date(2025, 0, 14, 8, 0, 0), 75.1), // Hier
      // Manque le 13
      createMockMesure(new Date(2025, 0, 12, 8, 0, 0), 75.2),
    ];

    const streak = calculateWeighInStreak(mesures, today);
    expect(streak).toBe(2); // Seulement 15 et 14
  });

  it('doit ignorer les mesures sans poids', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 15, 8, 0, 0), 75),
      {
        ...createMockMesure(new Date(2025, 0, 14, 8, 0, 0), 0),
        poids: undefined,
      },
    ];

    const streak = calculateWeighInStreak(mesures, today);
    expect(streak).toBe(1); // Seulement le 15 compte (mesure sans poids ignorée)
  });

  it('doit retourner 0 si aucune mesure', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const streak = calculateWeighInStreak([], today);
    expect(streak).toBe(0);
  });
});

// ========================================
// Tests calculateJournalStreak
// ========================================

describe('calculateJournalStreak', () => {
  it('doit calculer la streak si entrée aujourd\'hui', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entries: JournalEntry[] = [
      createMockJournal(new Date(2025, 0, 15, 8, 0, 0)),
      createMockJournal(new Date(2025, 0, 14, 8, 0, 0)),
      createMockJournal(new Date(2025, 0, 13, 8, 0, 0)),
    ];

    const streak = calculateJournalStreak(entries, today);
    expect(streak).toBe(3);
  });

  it('doit calculer la streak si entrée hier (tolérance)', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entries: JournalEntry[] = [
      createMockJournal(new Date(2025, 0, 14, 8, 0, 0)),
      createMockJournal(new Date(2025, 0, 13, 8, 0, 0)),
    ];

    const streak = calculateJournalStreak(entries, today);
    expect(streak).toBe(2);
  });

  it('doit retourner 0 si dernière entrée > 1 jour', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entries: JournalEntry[] = [
      createMockJournal(new Date(2025, 0, 13, 8, 0, 0)),
      createMockJournal(new Date(2025, 0, 12, 8, 0, 0)),
    ];

    const streak = calculateJournalStreak(entries, today);
    expect(streak).toBe(0);
  });

  it('doit s\'arrêter si un jour est manquant', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entries: JournalEntry[] = [
      createMockJournal(new Date(2025, 0, 15, 8, 0, 0)),
      createMockJournal(new Date(2025, 0, 14, 8, 0, 0)),
      // Manque le 13
      createMockJournal(new Date(2025, 0, 12, 8, 0, 0)),
    ];

    const streak = calculateJournalStreak(entries, today);
    expect(streak).toBe(2);
  });

  it('doit retourner 0 si aucune entrée', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const streak = calculateJournalStreak([], today);
    expect(streak).toBe(0);
  });
});

// ========================================
// Tests hasTodayWeighIn
// ========================================

describe('hasTodayWeighIn', () => {
  it('doit retourner true si pesée aujourd\'hui', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 15, 8, 0, 0), 75),
    ];

    const has = hasTodayWeighIn(mesures, today);
    expect(has).toBe(true);
  });

  it('doit retourner false si pesée hier', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const mesures: Mesure[] = [
      createMockMesure(new Date(2025, 0, 14, 8, 0, 0), 75),
    ];

    const has = hasTodayWeighIn(mesures, today);
    expect(has).toBe(false);
  });

  it('doit ignorer les mesures sans poids', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const mesures: Mesure[] = [
      {
        ...createMockMesure(new Date(2025, 0, 15, 8, 0, 0), 0),
        poids: undefined,
      },
    ];

    const has = hasTodayWeighIn(mesures, today);
    expect(has).toBe(false);
  });

  it('doit retourner false si aucune mesure', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const has = hasTodayWeighIn([], today);
    expect(has).toBe(false);
  });
});

// ========================================
// Tests hasTodayJournalEntry
// ========================================

describe('hasTodayJournalEntry', () => {
  it('doit retourner true si entrée aujourd\'hui', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entries: JournalEntry[] = [
      createMockJournal(new Date(2025, 0, 15, 8, 0, 0)),
    ];

    const has = hasTodayJournalEntry(entries, today);
    expect(has).toBe(true);
  });

  it('doit retourner false si entrée hier', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const entries: JournalEntry[] = [
      createMockJournal(new Date(2025, 0, 14, 8, 0, 0)),
    ];

    const has = hasTodayJournalEntry(entries, today);
    expect(has).toBe(false);
  });

  it('doit retourner false si aucune entrée', () => {
    const today = new Date(2025, 0, 15, 12, 0, 0);
    const has = hasTodayJournalEntry([], today);
    expect(has).toBe(false);
  });
});

