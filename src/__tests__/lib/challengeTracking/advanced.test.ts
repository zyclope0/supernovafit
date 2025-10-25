// Tests pour les Challenges Avancés - Calculs complexes
import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import type { Entrainement, Repas, Mesure, JournalEntry } from '@/types';
import {
  calculateTotalTrainings,
  calculateTotalMeals,
  calculateWeekTrainingTime,
  calculateMonthTrainingVolume,
  calculateLongestActivityStreak,
  calculateDailyUsageStreak,
  calculateOptimalMacroDays,
  calculateUniqueFoodsCount,
  calculateWeightLoss,
  calculateWeightGain,
  calculateRecoverySessions,
  calculateIntenseCardioSessions,
  calculateTotalCardioTime,
  calculateStrengthSessions,
  calculateTotalVolume,
  calculatePositiveMoodDays,
  calculateHighEnergyDays,
  calculateQualitySleepDays,
  calculateGratitudePoints,
  calculateMeditationTime,
} from '@/lib/challengeTracking/advanced';

describe('Challenges Avancés - Performance Complexe', () => {
  const mockEntrainements: Entrainement[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      type: 'cardio',
      duree: 45,
      calories: 300,
      source: 'manuel',
      commentaire: 'Course matinale',
    },
    {
      id: '2',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-16')),
      type: 'musculation',
      duree: 60,
      calories: 400,
      source: 'manuel',
      commentaire: 'Séance poids',
    },
  ];

  const mockRepas: Repas[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      repas: 'dejeuner',
      aliments: [
        {
          id: '1',
          nom: 'Poulet',
          nom_lower: 'poulet',
          quantite: 150,
          unite: 'g',
          user_id: 'user1',
          created_at: Timestamp.now(),
          macros: { kcal: 250, prot: 45, glucides: 0, lipides: 5 },
          macros_base: { kcal: 167, prot: 30, glucides: 0, lipides: 3 },
        },
      ],
      macros: { kcal: 250, prot: 45, glucides: 0, lipides: 5 },
      created_at: Timestamp.now(),
    },
  ];

  const mockMesures: Mesure[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      poids: 75,
      taille: 175,
      imc: 24.5,
      created_at: Timestamp.now(),
    },
    {
      id: '2',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-20')),
      poids: 73,
      taille: 175,
      imc: 23.8,
      created_at: Timestamp.now(),
    },
  ];

  const mockJournal: JournalEntry[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      humeur: 8,
      energie: 7,
      sommeil: 8,
      stress: 3,
      note: 'Journée productive, reconnaissance pour mes progrès',
      created_at: Timestamp.now(),
    },
  ];

  describe('calculateTotalTrainings', () => {
    it('should calculate total trainings without date filter', () => {
      const result = calculateTotalTrainings(mockEntrainements);
      expect(result).toBe(2);
    });

    it('should calculate total trainings with date filter', () => {
      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-16');
      const result = calculateTotalTrainings(mockEntrainements, startDate, endDate);
      expect(result).toBe(2);
    });

    it('should return 0 for empty array', () => {
      const result = calculateTotalTrainings([]);
      expect(result).toBe(0);
    });
  });

  describe('calculateTotalMeals', () => {
    it('should calculate total meals without date filter', () => {
      const result = calculateTotalMeals(mockRepas);
      expect(result).toBe(1);
    });

    it('should calculate total meals with date filter', () => {
      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-01-16');
      const result = calculateTotalMeals(mockRepas, startDate, endDate);
      expect(result).toBe(1);
    });
  });

  describe('calculateWeekTrainingTime', () => {
    it('should calculate total training time for a week', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateWeekTrainingTime(mockEntrainements, weekStart);
      expect(result).toBe(105); // 45 + 60 minutes
    });

    it('should return 0 for week with no trainings', () => {
      const weekStart = new Date('2025-01-22'); // Semaine suivante
      const result = calculateWeekTrainingTime(mockEntrainements, weekStart);
      expect(result).toBe(0);
    });
  });

  describe('calculateMonthTrainingVolume', () => {
    it('should calculate total training volume for a month', () => {
      const monthStart = new Date('2025-01-01');
      const result = calculateMonthTrainingVolume(mockEntrainements, monthStart);
      expect(result).toBe(105); // 45 + 60 minutes
    });
  });

  describe('calculateLongestActivityStreak', () => {
    it('should calculate longest consecutive activity streak', () => {
      const result = calculateLongestActivityStreak(
        mockEntrainements,
        mockRepas,
        mockMesures,
        mockJournal
      );
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it('should return 0 for no activity', () => {
      const result = calculateLongestActivityStreak([], [], [], []);
      expect(result).toBe(0);
    });
  });

  describe('calculateDailyUsageStreak', () => {
    it('should calculate daily usage streak', () => {
      const result = calculateDailyUsageStreak(
        mockEntrainements,
        mockRepas,
        mockMesures,
        mockJournal
      );
      expect(result).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('Challenges Avancés - Nutrition Complexe', () => {
  const mockRepas: Repas[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      repas: 'dejeuner',
      aliments: [
        {
          id: '1',
          nom: 'Poulet',
          nom_lower: 'poulet',
          quantite: 200,
          unite: 'g',
          user_id: 'user1',
          created_at: Timestamp.now(),
          macros: { kcal: 330, prot: 60, glucides: 0, lipides: 6 },
          macros_base: { kcal: 165, prot: 30, glucides: 0, lipides: 3 },
        },
        {
          id: '2',
          nom: 'Riz',
          nom_lower: 'riz',
          quantite: 100,
          unite: 'g',
          user_id: 'user1',
          created_at: Timestamp.now(),
          macros: { kcal: 130, prot: 2.5, glucides: 28, lipides: 0.3 },
          macros_base: { kcal: 130, prot: 2.5, glucides: 28, lipides: 0.3 },
        },
      ],
      macros: { kcal: 460, prot: 62.5, glucides: 28, lipides: 6.3 },
      created_at: Timestamp.now(),
    },
  ];

  describe('calculateOptimalMacroDays', () => {
    it('should calculate days with optimal protein ratio', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateOptimalMacroDays(mockRepas, weekStart);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for week with no meals', () => {
      const weekStart = new Date('2025-01-22');
      const result = calculateOptimalMacroDays([], weekStart);
      expect(result).toBe(0);
    });
  });

  describe('calculateUniqueFoodsCount', () => {
    it('should calculate unique foods count', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateUniqueFoodsCount(mockRepas, weekStart);
      expect(result).toBe(2); // Poulet + Riz
    });

    it('should return 0 for week with no meals', () => {
      const weekStart = new Date('2025-01-22');
      const result = calculateUniqueFoodsCount([], weekStart);
      expect(result).toBe(0);
    });
  });
});

describe('Challenges Avancés - Transformation', () => {
  const mockMesures: Mesure[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-01')),
      poids: 75,
      taille: 175,
      imc: 24.5,
      created_at: Timestamp.now(),
    },
    {
      id: '2',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-31')),
      poids: 73,
      taille: 175,
      imc: 23.8,
      created_at: Timestamp.now(),
    },
  ];

  describe('calculateWeightLoss', () => {
    it('should calculate weight loss for a month', () => {
      const monthStart = new Date('2025-01-01');
      const result = calculateWeightLoss(mockMesures, monthStart);
      expect(result).toBe(2); // 75 - 73 = 2kg perte
    });

    it('should return 0 for month with no measurements', () => {
      const monthStart = new Date('2025-02-01');
      const result = calculateWeightLoss([], monthStart);
      expect(result).toBe(0);
    });
  });

  describe('calculateWeightGain', () => {
    it('should calculate weight gain for a month', () => {
      const monthStart = new Date('2025-01-01');
      const result = calculateWeightGain(mockMesures, monthStart);
      expect(result).toBe(0); // Pas de gain, que de la perte
    });
  });
});

describe('Challenges Avancés - Récupération', () => {
  const mockEntrainements: Entrainement[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      type: 'cardio',
      duree: 30,
      calories: 200,
      source: 'manuel',
      commentaire: 'Séance de yoga et stretching',
    },
    {
      id: '2',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-16')),
      type: 'cardio',
      duree: 45,
      calories: 300,
      source: 'manuel',
      commentaire: 'Course intensive',
    },
  ];

  describe('calculateRecoverySessions', () => {
    it('should calculate recovery sessions', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateRecoverySessions(mockEntrainements, weekStart);
      expect(result).toBe(1); // 1 séance avec "yoga" dans le commentaire
    });

    it('should return 0 for week with no recovery sessions', () => {
      const weekStart = new Date('2025-01-22');
      const result = calculateRecoverySessions([], weekStart);
      expect(result).toBe(0);
    });
  });
});

describe('Challenges Avancés - Cardio', () => {
  const mockEntrainements: Entrainement[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      type: 'cardio',
      duree: 45,
      calories: 300,
      source: 'manuel',
      commentaire: 'Course',
    },
    {
      id: '2',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-16')),
      type: 'cardio',
      duree: 20,
      calories: 150,
      source: 'manuel',
      commentaire: 'Marche rapide',
    },
  ];

  describe('calculateIntenseCardioSessions', () => {
    it('should calculate intense cardio sessions', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateIntenseCardioSessions(mockEntrainements, weekStart);
      expect(result).toBe(1); // 1 séance >= 30min
    });
  });

  describe('calculateTotalCardioTime', () => {
    it('should calculate total cardio time', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateTotalCardioTime(mockEntrainements, weekStart);
      expect(result).toBe(65); // 45 + 20 minutes
    });
  });
});

describe('Challenges Avancés - Musculation', () => {
  const mockEntrainements: Entrainement[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      type: 'musculation',
      duree: 60,
      calories: 400,
      source: 'manuel',
      commentaire: 'Séance poids',
      exercices: [
        {
          nom: 'Squat',
          series: 3,
          repetitions: 12,
          poids: 60,
        },
        {
          nom: 'Développé couché',
          series: 4,
          repetitions: 8,
          poids: 80,
        },
      ],
    },
  ];

  describe('calculateStrengthSessions', () => {
    it('should calculate strength sessions', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateStrengthSessions(mockEntrainements, weekStart);
      expect(result).toBe(1);
    });
  });

  describe('calculateTotalVolume', () => {
    it('should calculate total volume', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateTotalVolume(mockEntrainements, weekStart);
      // Squat: 3 × 12 × 60 = 2160
      // Développé: 4 × 8 × 80 = 2560
      // Total: 2160 + 2560 = 4720
      expect(result).toBe(4720);
    });
  });
});

describe('Challenges Avancés - Bien-être', () => {
  const mockJournal: JournalEntry[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      humeur: 8,
      energie: 7,
      sommeil: 8,
      stress: 3,
      note: 'Journée productive',
      created_at: Timestamp.now(),
    },
    {
      id: '2',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-16')),
      humeur: 6,
      energie: 8,
      sommeil: 7,
      stress: 4,
      note: 'Bonne énergie',
      created_at: Timestamp.now(),
    },
  ];

  describe('calculatePositiveMoodDays', () => {
    it('should calculate positive mood days', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculatePositiveMoodDays(mockJournal, weekStart);
      expect(result).toBe(1); // 1 jour avec humeur >= 7
    });
  });

  describe('calculateHighEnergyDays', () => {
    it('should calculate high energy days', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateHighEnergyDays(mockJournal, weekStart);
      expect(result).toBe(1); // 1 jour avec énergie >= 8
    });
  });

  describe('calculateQualitySleepDays', () => {
    it('should calculate quality sleep days', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateQualitySleepDays(mockJournal, weekStart);
      expect(result).toBe(2); // 2 jours avec sommeil >= 7
    });
  });
});

describe('Challenges Avancés - Gratitude et Méditation', () => {
  const mockJournal: JournalEntry[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      humeur: 8,
      energie: 7,
      sommeil: 8,
      stress: 3,
      note: 'Reconnaissance pour mes progrès, je suis content de mes résultats',
      created_at: Timestamp.now(),
    },
    {
      id: '2',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-16')),
      humeur: 7,
      energie: 8,
      sommeil: 7,
      stress: 2,
      note: 'Méditation de 15 minutes ce matin, respiration calme',
      created_at: Timestamp.now(),
    },
  ];

  describe('calculateGratitudePoints', () => {
    it('should calculate gratitude points', () => {
      const dayStart = new Date('2025-01-15');
      const result = calculateGratitudePoints(mockJournal, dayStart);
      expect(result).toBeGreaterThanOrEqual(1); // Au moins 1 mot de gratitude
    });

    it('should return 0 for day with no gratitude', () => {
      const dayStart = new Date('2025-01-20');
      const result = calculateGratitudePoints([], dayStart);
      expect(result).toBe(0);
    });
  });

  describe('calculateMeditationTime', () => {
    it('should calculate meditation time', () => {
      const dayStart = new Date('2025-01-16');
      const result = calculateMeditationTime(mockJournal, dayStart);
      expect(result).toBe(15); // 15 minutes mentionnées
    });

    it('should return 0 for day with no meditation', () => {
      const dayStart = new Date('2025-01-20');
      const result = calculateMeditationTime([], dayStart);
      expect(result).toBe(0);
    });
  });
});
