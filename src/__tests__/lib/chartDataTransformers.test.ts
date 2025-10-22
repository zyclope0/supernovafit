import { describe, it, expect, beforeAll, vi } from 'vitest';
import {
  prepareMesuresChartData,
  prepareHeartRateChartData,
  preparePerformanceChartData,
  prepareTrainingVolumeData,
  calculateAverageDuration,
  type TrainingVolumeChartData,
} from '@/lib/chartDataTransformers';
import type { Mesure, Entrainement } from '@/types';

let Timestamp: any;

beforeAll(async () => {
  const firestore =
    await vi.importActual<typeof import('firebase/firestore')>(
      'firebase/firestore',
    );
  Timestamp = firestore.Timestamp;
});

// ============================================================================
// HELPERS
// ============================================================================

const createMockMesure = (date: Date, overrides?: Partial<Mesure>): Mesure => ({
  id: `mesure-${date.toISOString()}`,
  user_id: 'test-user-id',
  date: Timestamp.fromDate(date),
  poids: 75,
  imc: 24.5,
  created_at: Timestamp.now(),
  ...overrides,
});

const createMockEntrainement = (
  date: Date,
  overrides?: Partial<Entrainement>,
): Entrainement => ({
  id: `entrainement-${date.toISOString()}`,
  user_id: 'test-user-id',
  date: Timestamp.fromDate(date),
  type: 'cardio',
  duree: 60,
  calories: 500,
  source: 'manuel',
  created_at: Timestamp.now(),
  ...overrides,
});

// ============================================================================
// MESURES CHART DATA
// ============================================================================

describe('prepareMesuresChartData', () => {
  it('should convert Timestamps to ISO strings', () => {
    const input = [
      createMockMesure(new Date('2025-10-21'), { poids: 75, imc: 24.5 }),
    ];

    const result = prepareMesuresChartData(input);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].date).toBe('2025-10-21');
    expect(result.data[0].poids).toBe(75);
    expect(result.data[0].imc).toBe(24.5);
  });

  it('should filter out mesures without date', () => {
    const input = [
      createMockMesure(new Date('2025-10-21'), { poids: 75 }),
      { ...createMockMesure(new Date('2025-10-22'), { poids: 80 }), date: null as any },
    ];

    const result = prepareMesuresChartData(input);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].poids).toBe(75);
  });

  it('should handle mesures without date field', () => {
    const validDate = new Date('2025-10-21');
    // ⚠️ Mesure sans date (undefined)
    const mesureWithoutDate = {
      ...createMockMesure(validDate, { poids: 80 }),
      date: undefined as any, // Pas de date
    };

    const input = [
      createMockMesure(validDate, { poids: 75 }),
      mesureWithoutDate,
    ];

    const result = prepareMesuresChartData(input);

    // Seul le valid doit être présent (filter date)
    expect(result.data).toHaveLength(1);
    expect(result.data[0].poids).toBe(75);
  });

  it('should handle missing optional fields', () => {
    const input = [
      {
        ...createMockMesure(new Date('2025-10-21'), { poids: 75 }),
        imc: undefined, // ⚠️ Explicitement undefined
      },
    ];

    const result = prepareMesuresChartData(input);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].poids).toBe(75);
    expect(result.data[0].imc).toBeNull();
  });

  it('should reverse data order (oldest first)', () => {
    const input = [
      createMockMesure(new Date('2025-10-23'), { poids: 77 }),
      createMockMesure(new Date('2025-10-21'), { poids: 75 }),
      createMockMesure(new Date('2025-10-22'), { poids: 76 }),
    ];

    const result = prepareMesuresChartData(input);

    // L'ordre après reverse() devrait être le même que l'input
    // car slice().reverse() inverse l'array d'origine
    expect(result.data[0].date).toBe('2025-10-22'); // 3ème input inversé = 1er
    expect(result.data[1].date).toBe('2025-10-21'); // 2ème input inversé = 2ème
    expect(result.data[2].date).toBe('2025-10-23'); // 1er input inversé = 3ème
  });

  it('should calculate motivational domains', () => {
    const input = [
      createMockMesure(new Date('2025-10-21'), { poids: 75, imc: 24.5 }),
      createMockMesure(new Date('2025-10-22'), { poids: 76, imc: 24.8 }),
    ];

    const result = prepareMesuresChartData(input);

    expect(result.domains).toBeDefined();
    expect(result.domains.weight).toHaveLength(2);
    expect(result.domains.imc).toHaveLength(2);
    expect(result.domains.weight[0]).toBeLessThan(75); // Min avec padding
    expect(result.domains.weight[1]).toBeGreaterThan(76); // Max avec padding
  });

  it('should handle all mensurations fields', () => {
    const input = [
      createMockMesure(new Date('2025-10-21'), {
        tour_taille: 80,
        tour_hanches: 90,
        tour_bras: 30,
        tour_cuisses: 50,
        tour_cou: 35,
        tour_poitrine: 100,
      }),
    ];

    const result = prepareMesuresChartData(input);

    expect(result.data[0].tour_taille).toBe(80);
    expect(result.data[0].tour_hanches).toBe(90);
    expect(result.data[0].tour_bras).toBe(30);
    expect(result.data[0].tour_cuisses).toBe(50);
    expect(result.data[0].tour_cou).toBe(35);
    expect(result.data[0].tour_poitrine).toBe(100);
  });

  it('should handle empty array', () => {
    const result = prepareMesuresChartData([]);

    expect(result.data).toHaveLength(0);
    expect(result.domains.weight).toEqual([0, 100]);
  });
});

// ============================================================================
// HEART RATE CHART DATA
// ============================================================================

describe('prepareHeartRateChartData', () => {
  it('should filter entrainements with HR data', () => {
    const input = [
      createMockEntrainement(new Date('2025-10-21'), { fc_moyenne: 150 }),
      createMockEntrainement(new Date('2025-10-22'), { fc_moyenne: undefined }),
    ];

    const result = prepareHeartRateChartData(input);

    expect(result).toHaveLength(1);
    expect(result[0].fc_moyenne).toBe(150);
  });

  it('should include entrainements with any FC field', () => {
    const input = [
      createMockEntrainement(new Date('2025-10-21'), {
        fc_moyenne: undefined,
        fc_max: 180,
      }),
      createMockEntrainement(new Date('2025-10-22'), {
        fc_moyenne: undefined,
        fc_min: 120,
      }),
    ];

    const result = prepareHeartRateChartData(input);

    expect(result).toHaveLength(2);
    expect(result[0].fc_max).toBe(180);
    expect(result[1].fc_min).toBe(120);
  });

  it('should convert dates to ISO strings', () => {
    const input = [
      createMockEntrainement(new Date('2025-10-21'), { fc_moyenne: 150 }),
    ];

    const result = prepareHeartRateChartData(input);

    expect(result[0].date).toBe('2025-10-21');
  });

  it('should sort by date (oldest first)', () => {
    const input = [
      createMockEntrainement(new Date('2025-10-23'), { fc_moyenne: 152 }),
      createMockEntrainement(new Date('2025-10-21'), { fc_moyenne: 150 }),
      createMockEntrainement(new Date('2025-10-22'), { fc_moyenne: 151 }),
    ];

    const result = prepareHeartRateChartData(input);

    expect(result[0].date).toBe('2025-10-21');
    expect(result[1].date).toBe('2025-10-22');
    expect(result[2].date).toBe('2025-10-23');
  });

  it('should filter entrainements without date', () => {
    const validDate = new Date('2025-10-21');
    // ⚠️ Entraînement sans date (undefined)
    const entrainementWithoutDate = {
      ...createMockEntrainement(validDate, { fc_moyenne: 151 }),
      date: undefined as any, // Pas de date
    };

    const input = [
      createMockEntrainement(validDate, { fc_moyenne: 150 }),
      entrainementWithoutDate,
    ];

    const result = prepareHeartRateChartData(input);

    expect(result).toHaveLength(1);
    expect(result[0].fc_moyenne).toBe(150);
  });

  it('should preserve training type', () => {
    const input = [
      createMockEntrainement(new Date('2025-10-21'), {
        fc_moyenne: 150,
        type: 'cardio',
      }),
      createMockEntrainement(new Date('2025-10-22'), {
        fc_moyenne: 140,
        type: 'musculation',
      }),
    ];

    const result = prepareHeartRateChartData(input);

    expect(result[0].type).toBe('cardio');
    expect(result[1].type).toBe('musculation');
  });

  it('should handle empty array', () => {
    const result = prepareHeartRateChartData([]);
    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// PERFORMANCE CHART DATA
// ============================================================================

describe('preparePerformanceChartData', () => {
  describe('metric: vitesse', () => {
    it('should filter entrainements with vitesse_moy > 0', () => {
      const input = [
        createMockEntrainement(new Date('2025-10-21'), { vitesse_moy: 12 }),
        createMockEntrainement(new Date('2025-10-22'), { vitesse_moy: 0 }),
        createMockEntrainement(new Date('2025-10-23'), {
          vitesse_moy: undefined,
        }),
      ];

      const result = preparePerformanceChartData(input, 'vitesse');

      expect(result).toHaveLength(1);
      expect(result[0].vitesse).toBe(12);
    });

    it('should set value to vitesse_moy', () => {
      const input = [
        createMockEntrainement(new Date('2025-10-21'), { vitesse_moy: 12.5 }),
      ];

      const result = preparePerformanceChartData(input, 'vitesse');

      expect(result[0].value).toBe(12.5);
    });
  });

  describe('metric: distance', () => {
    it('should filter entrainements with distance > 0', () => {
      const input = [
        createMockEntrainement(new Date('2025-10-21'), { distance: 10 }),
        createMockEntrainement(new Date('2025-10-22'), { distance: 0 }),
        createMockEntrainement(new Date('2025-10-23'), { distance: undefined }),
      ];

      const result = preparePerformanceChartData(input, 'distance');

      expect(result).toHaveLength(1);
      expect(result[0].distance).toBe(10);
    });

    it('should set value to distance', () => {
      const input = [
        createMockEntrainement(new Date('2025-10-21'), { distance: 10.5 }),
      ];

      const result = preparePerformanceChartData(input, 'distance');

      expect(result[0].value).toBe(10.5);
    });
  });

  describe('metric: calories_per_min', () => {
    it('should calculate calories per minute', () => {
      const input = [
        createMockEntrainement(new Date('2025-10-21'), {
          calories: 500,
          duree: 60,
        }),
      ];

      const result = preparePerformanceChartData(input, 'calories_per_min');

      expect(result[0].calories_per_min).toBe(8.3); // 500/60 = 8.333... arrondi à 8.3
      expect(result[0].value).toBe(8.3);
    });

    it('should filter entrainements with calories <= 0', () => {
      const input = [
        createMockEntrainement(new Date('2025-10-21'), {
          calories: 500,
          duree: 60,
        }),
        createMockEntrainement(new Date('2025-10-22'), {
          calories: 0,
          duree: 60,
        }),
        createMockEntrainement(new Date('2025-10-23'), {
          calories: undefined,
          duree: 60,
        }),
      ];

      const result = preparePerformanceChartData(input, 'calories_per_min');

      expect(result).toHaveLength(1);
    });

    it('should filter entrainements with duree <= 0', () => {
      const input = [
        createMockEntrainement(new Date('2025-10-21'), {
          calories: 500,
          duree: 60,
        }),
        createMockEntrainement(new Date('2025-10-22'), {
          calories: 500,
          duree: 0,
        }),
      ];

      const result = preparePerformanceChartData(input, 'calories_per_min');

      expect(result).toHaveLength(1);
    });
  });

  it('should sort by date', () => {
    const input = [
      createMockEntrainement(new Date('2025-10-23'), { vitesse_moy: 14 }),
      createMockEntrainement(new Date('2025-10-21'), { vitesse_moy: 12 }),
      createMockEntrainement(new Date('2025-10-22'), { vitesse_moy: 13 }),
    ];

    const result = preparePerformanceChartData(input, 'vitesse');

    expect(result[0].date).toBe('2025-10-21');
    expect(result[1].date).toBe('2025-10-22');
    expect(result[2].date).toBe('2025-10-23');
  });

  it('should include all relevant fields', () => {
    const input = [
      createMockEntrainement(new Date('2025-10-21'), {
        vitesse_moy: 12,
        distance: 10,
        calories: 500,
        duree: 60,
        fc_moyenne: 150,
        type: 'cardio',
      }),
    ];

    const result = preparePerformanceChartData(input, 'vitesse');

    expect(result[0].type).toBe('cardio');
    expect(result[0].duree).toBe(60);
    expect(result[0].fc_moyenne).toBe(150);
    expect(result[0].vitesse).toBe(12);
    expect(result[0].distance).toBe(10);
  });

  it('should handle empty array', () => {
    const result = preparePerformanceChartData([], 'vitesse');
    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// TRAINING VOLUME CHART DATA
// ============================================================================

describe('prepareTrainingVolumeData', () => {
  it('should generate data for specified weeks', () => {
    const input = [
      createMockEntrainement(new Date('2025-10-21'), { duree: 60 }),
    ];

    const result = prepareTrainingVolumeData(input, 4);

    expect(result).toHaveLength(4);
    expect(result[0].week).toMatch(/^S\d+$/); // Format "S42"
    expect(result[0].fullDate).toMatch(/^\d{2}\/\d{2}$/); // Format "21/10"
  });

  it('should aggregate trainings by week', () => {
    // Créer 3 entraînements dans la même semaine
    const today = new Date();
    const input = [
      createMockEntrainement(today, { duree: 60, calories: 500 }),
      createMockEntrainement(today, { duree: 45, calories: 400 }),
      createMockEntrainement(today, { duree: 30, calories: 300 }),
    ];

    const result = prepareTrainingVolumeData(input, 1);

    // Semaine courante devrait avoir 3 séances
    const currentWeek = result[result.length - 1]; // Dernière semaine générée
    expect(currentWeek.seances).toBe(3);
    expect(currentWeek.duree).toBe(135); // 60 + 45 + 30
    expect(currentWeek.calories).toBe(1200); // 500 + 400 + 300
  });

  it('should handle weeks with no trainings', () => {
    const result = prepareTrainingVolumeData([], 2);

    expect(result).toHaveLength(2);
    expect(result[0].seances).toBe(0);
    expect(result[0].duree).toBe(0);
    expect(result[0].calories).toBe(0);
  });

  it('should filter entrainements without date', () => {
    const input = [
      createMockEntrainement(new Date(), { duree: 60 }),
      { ...createMockEntrainement(new Date(), { duree: 45 }), date: null as any },
    ];

    const result = prepareTrainingVolumeData(input, 1);

    const currentWeek = result[result.length - 1];
    expect(currentWeek.seances).toBe(1); // Seul le valid
  });

  it('should handle large number of weeks', () => {
    const result = prepareTrainingVolumeData([], 52);
    expect(result).toHaveLength(52);
  });
});

// ============================================================================
// HELPER: CALCULATE AVERAGE DURATION
// ============================================================================

describe('calculateAverageDuration', () => {
  it('should calculate average duration', () => {
    const data: TrainingVolumeChartData[] = [
      { week: 'S1', fullDate: '01/01', seances: 3, duree: 120, calories: 1000 },
      { week: 'S2', fullDate: '08/01', seances: 2, duree: 90, calories: 800 },
      { week: 'S3', fullDate: '15/01', seances: 4, duree: 150, calories: 1200 },
    ];

    const result = calculateAverageDuration(data);

    // (120 + 90 + 150) / 3 = 120
    expect(result).toBe(120);
  });

  it('should return 0 for empty array', () => {
    const result = calculateAverageDuration([]);
    expect(result).toBe(0);
  });

  it('should round to nearest integer', () => {
    const data: TrainingVolumeChartData[] = [
      { week: 'S1', fullDate: '01/01', seances: 3, duree: 100, calories: 1000 },
      { week: 'S2', fullDate: '08/01', seances: 2, duree: 90, calories: 800 },
    ];

    const result = calculateAverageDuration(data);

    // (100 + 90) / 2 = 95
    expect(result).toBe(95);
  });
});

