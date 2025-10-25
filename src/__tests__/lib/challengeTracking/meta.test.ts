// Tests pour les Meta-Challenges - Challenges dépendants
import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import type { Challenge, Entrainement, Repas, Mesure, JournalEntry } from '@/types';
import {
  calculateUserLevel,
  calculateCompletedChallenges,
  calculatePerfectChallenges,
  calculateUniqueBadges,
  calculateTransformationScore,
  calculateBalanceScore,
  calculateDailyConsistencyStreak,
  calculateMasterStreak,
  calculateAthleteScore,
  calculateEnduranceScore,
  calculateWellnessScore,
  calculateZenScore,
  calculateEvolutionScore,
  calculateHealthDefenderScore,
} from '@/lib/challengeTracking/meta';

describe('Meta-Challenges - Performance Globale', () => {
  describe('calculateUserLevel', () => {
    it('should calculate user level based on XP', () => {
      expect(calculateUserLevel(0)).toBe(1);
      expect(calculateUserLevel(99)).toBe(1);
      expect(calculateUserLevel(100)).toBe(2);
      expect(calculateUserLevel(199)).toBe(2);
      expect(calculateUserLevel(200)).toBe(3);
      expect(calculateUserLevel(1900)).toBe(20);
    });
  });

  describe('calculateCompletedChallenges', () => {
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        user_id: 'user1',
        type: 'nutrition',
        title: 'Challenge 1',
        description: 'Test',
        icon: '🥗',
        category: 'weekly',
        target: 7,
        unit: 'jours',
        current: 7,
        status: 'completed',
        startDate: '',
        endDate: '',
        xpReward: 100,
        isRepeatable: true,
        difficulty: 'medium',
        created_at: Timestamp.now(),
      },
      {
        id: '2',
        user_id: 'user1',
        type: 'training',
        title: 'Challenge 2',
        description: 'Test',
        icon: '💪',
        category: 'weekly',
        target: 5,
        unit: 'jours',
        current: 3,
        status: 'active',
        startDate: '',
        endDate: '',
        xpReward: 80,
        isRepeatable: true,
        difficulty: 'medium',
        created_at: Timestamp.now(),
      },
    ];

    it('should calculate completed challenges', () => {
      const result = calculateCompletedChallenges(mockChallenges);
      expect(result).toBe(1);
    });

    it('should return 0 for no completed challenges', () => {
      const activeChallenges = mockChallenges.map(c => ({ ...c, status: 'active' as const }));
      const result = calculateCompletedChallenges(activeChallenges);
      expect(result).toBe(0);
    });
  });

  describe('calculatePerfectChallenges', () => {
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        user_id: 'user1',
        type: 'nutrition',
        title: 'Perfect Challenge',
        description: 'Test',
        icon: '🥗',
        category: 'weekly',
        target: 7,
        unit: 'jours',
        current: 7, // Perfect: current === target
        status: 'completed',
        startDate: '',
        endDate: '',
        xpReward: 100,
        isRepeatable: true,
        difficulty: 'medium',
        created_at: Timestamp.now(),
      },
      {
        id: '2',
        user_id: 'user1',
        type: 'training',
        title: 'Imperfect Challenge',
        description: 'Test',
        icon: '💪',
        category: 'weekly',
        target: 5,
        unit: 'jours',
        current: 3, // Not perfect: current < target
        status: 'completed',
        startDate: '',
        endDate: '',
        xpReward: 80,
        isRepeatable: true,
        difficulty: 'medium',
        created_at: Timestamp.now(),
      },
    ];

    it('should calculate perfect challenges', () => {
      const result = calculatePerfectChallenges(mockChallenges);
      expect(result).toBe(1);
    });
  });

  describe('calculateUniqueBadges', () => {
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        user_id: 'user1',
        type: 'nutrition',
        title: 'Nutrition Challenge',
        description: 'Test',
        icon: '🥗',
        category: 'weekly',
        target: 7,
        unit: 'jours',
        current: 7,
        status: 'completed',
        startDate: '',
        endDate: '',
        xpReward: 100,
        isRepeatable: true,
        difficulty: 'medium',
        created_at: Timestamp.now(),
      },
      {
        id: '2',
        user_id: 'user1',
        type: 'training',
        title: 'Training Challenge',
        description: 'Test',
        icon: '💪',
        category: 'weekly',
        target: 5,
        unit: 'jours',
        current: 5,
        status: 'completed',
        startDate: '',
        endDate: '',
        xpReward: 80,
        isRepeatable: true,
        difficulty: 'medium',
        created_at: Timestamp.now(),
      },
      {
        id: '3',
        user_id: 'user1',
        type: 'nutrition', // Duplicate type
        title: 'Another Nutrition Challenge',
        description: 'Test',
        icon: '🥗',
        category: 'weekly',
        target: 3,
        unit: 'jours',
        current: 3,
        status: 'completed',
        startDate: '',
        endDate: '',
        xpReward: 50,
        isRepeatable: true,
        difficulty: 'easy',
        created_at: Timestamp.now(),
      },
    ];

    it('should calculate unique badge types', () => {
      const result = calculateUniqueBadges(mockChallenges);
      expect(result).toBe(2); // nutrition + training (duplicate nutrition doesn't count)
    });
  });
});

describe('Meta-Challenges - Transformation Complète', () => {
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

  const mockEntrainements: Entrainement[] = Array.from({ length: 20 }, (_, i) => ({
    id: `entrainement-${i}`,
    user_id: 'user1',
    date: Timestamp.fromDate(new Date(`2025-01-${i + 1}`)),
    type: 'cardio',
    duree: 30,
    calories: 200,
    source: 'manuel',
    commentaire: 'Test',
  }));

  const mockRepas: Repas[] = Array.from({ length: 25 }, (_, i) => ({
    id: `repas-${i}`,
    user_id: 'user1',
    date: Timestamp.fromDate(new Date(`2025-01-${i + 1}`)),
    repas: 'dejeuner',
    aliments: [
      {
        id: `aliment-${i}`,
        nom: `Aliment ${i}`,
        nom_lower: `aliment ${i}`,
        quantite: 100,
        unite: 'g',
        user_id: 'user1',
        created_at: Timestamp.now(),
        macros: { kcal: 200, prot: 20, glucides: 30, lipides: 10 },
        macros_base: { kcal: 200, prot: 20, glucides: 30, lipides: 10 },
      },
    ],
    macros: { kcal: 200, prot: 20, glucides: 30, lipides: 10 },
    created_at: Timestamp.now(),
  }));

  describe('calculateTransformationScore', () => {
    it('should calculate transformation score', () => {
      const monthStart = new Date('2025-01-01');
      const result = calculateTransformationScore(mockMesures, mockEntrainements, mockRepas, monthStart);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('should return 0 for no data', () => {
      const monthStart = new Date('2025-01-01');
      const result = calculateTransformationScore([], [], [], monthStart);
      expect(result).toBe(0);
    });
  });

  describe('calculateBalanceScore', () => {
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
    ];

    it('should calculate balance score', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateBalanceScore(mockRepas, mockEntrainements, mockJournal, weekStart);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(6);
    });
  });
});

describe('Meta-Challenges - Consistance', () => {
  const mockEntrainements: Entrainement[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      type: 'cardio',
      duree: 30,
      calories: 200,
      source: 'manuel',
      commentaire: 'Test',
    },
    {
      id: '2',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-16')),
      type: 'musculation',
      duree: 45,
      calories: 300,
      source: 'manuel',
      commentaire: 'Test',
    },
  ];

  const mockRepas: Repas[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      repas: 'dejeuner',
      aliments: [],
      macros: { kcal: 200, prot: 20, glucides: 30, lipides: 10 },
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
      note: 'Journée productive',
      created_at: Timestamp.now(),
    },
  ];

  describe('calculateDailyConsistencyStreak', () => {
    it('should calculate daily consistency streak', () => {
      const result = calculateDailyConsistencyStreak(mockEntrainements, mockRepas, mockJournal);
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it('should return 0 for no activity', () => {
      const result = calculateDailyConsistencyStreak([], [], []);
      expect(result).toBe(0);
    });
  });

  describe('calculateMasterStreak', () => {
    it('should calculate master streak', () => {
      const result = calculateMasterStreak(mockEntrainements, mockRepas, mockJournal);
      expect(result).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('Meta-Challenges - Performance Spécialisée', () => {
  const mockEntrainements: Entrainement[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      type: 'cardio',
      duree: 45,
      calories: 300,
      source: 'manuel',
      commentaire: 'Course intensive',
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
      exercices: [
        {
          nom: 'Squat',
          series: 3,
          repetitions: 12,
          poids: 60,
        },
      ],
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
          quantite: 200,
          unite: 'g',
          user_id: 'user1',
          created_at: Timestamp.now(),
          macros: { kcal: 330, prot: 60, glucides: 0, lipides: 6 },
          macros_base: { kcal: 165, prot: 30, glucides: 0, lipides: 3 },
        },
      ],
      macros: { kcal: 330, prot: 60, glucides: 0, lipides: 6 },
      created_at: Timestamp.now(),
    },
  ];

  describe('calculateAthleteScore', () => {
    it('should calculate athlete score', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateAthleteScore(mockEntrainements, mockRepas, weekStart);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(9);
    });
  });

  describe('calculateEnduranceScore', () => {
    const mockJournal: JournalEntry[] = [
      {
        id: '1',
        user_id: 'user1',
        date: Timestamp.fromDate(new Date('2025-01-15')),
        humeur: 8,
        energie: 7,
        sommeil: 8,
        stress: 3,
        note: 'Séance de yoga et stretching',
        created_at: Timestamp.now(),
      },
    ];

    it('should calculate endurance score', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateEnduranceScore(mockEntrainements, mockJournal, weekStart);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(4);
    });
  });
});

describe('Meta-Challenges - Bien-être Global', () => {
  const mockJournal: JournalEntry[] = [
    {
      id: '1',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-15')),
      humeur: 8,
      energie: 8,
      sommeil: 8,
      stress: 2,
      note: 'Journée parfaite',
      created_at: Timestamp.now(),
    },
    {
      id: '2',
      user_id: 'user1',
      date: Timestamp.fromDate(new Date('2025-01-16')),
      humeur: 7,
      energie: 7,
      sommeil: 7,
      stress: 3,
      note: 'Bonne journée',
      created_at: Timestamp.now(),
    },
  ];

  describe('calculateWellnessScore', () => {
    it('should calculate wellness score', () => {
      const weekStart = new Date('2025-01-15');
      const result = calculateWellnessScore(mockJournal, weekStart);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(6);
    });
  });

  describe('calculateZenScore', () => {
    const zenJournal: JournalEntry[] = [
      {
        id: '1',
        user_id: 'user1',
        date: Timestamp.fromDate(new Date('2025-01-15')),
        humeur: 8,
        energie: 8,
        sommeil: 8,
        stress: 1,
        note: 'Méditation de 20 minutes ce matin, reconnaissance pour mes progrès',
        created_at: Timestamp.now(),
      },
    ];

    it('should calculate zen score', () => {
      const dayStart = new Date('2025-01-15');
      const result = calculateZenScore(zenJournal, dayStart);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(6);
    });
  });
});

describe('Meta-Challenges - Développement Personnel', () => {
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

  const mockEntrainements: Entrainement[] = Array.from({ length: 15 }, (_, i) => ({
    id: `entrainement-${i}`,
    user_id: 'user1',
    date: Timestamp.fromDate(new Date(`2025-01-${i + 1}`)),
    type: 'cardio',
    duree: 30,
    calories: 200,
    source: 'manuel',
    commentaire: 'Test',
  }));

  const mockRepas: Repas[] = Array.from({ length: 20 }, (_, i) => ({
    id: `repas-${i}`,
    user_id: 'user1',
    date: Timestamp.fromDate(new Date(`2025-01-${i + 1}`)),
    repas: 'dejeuner',
    aliments: [
      {
        id: `aliment-${i}`,
        nom: `Aliment ${i}`,
        nom_lower: `aliment ${i}`,
        quantite: 100,
        unite: 'g',
        user_id: 'user1',
        created_at: Timestamp.now(),
        macros: { kcal: 200, prot: 20, glucides: 30, lipides: 10 },
        macros_base: { kcal: 200, prot: 20, glucides: 30, lipides: 10 },
      },
    ],
    macros: { kcal: 200, prot: 20, glucides: 30, lipides: 10 },
    created_at: Timestamp.now(),
  }));

  const mockJournal: JournalEntry[] = Array.from({ length: 20 }, (_, i) => ({
    id: `journal-${i}`,
    user_id: 'user1',
    date: Timestamp.fromDate(new Date(`2025-01-${i + 1}`)),
    humeur: 7 + (i % 3),
    energie: 7 + (i % 2),
    sommeil: 7 + (i % 2),
    stress: 3 - (i % 2),
    note: `Jour ${i + 1}`,
    created_at: Timestamp.now(),
  }));

  const mockChallenges: Challenge[] = Array.from({ length: 10 }, (_, i) => ({
    id: `challenge-${i}`,
    user_id: 'user1',
    type: 'nutrition',
    title: `Challenge ${i}`,
    description: 'Test',
    icon: '🥗',
    category: 'weekly',
    target: 7,
    unit: 'jours',
    current: 7,
    status: 'completed',
    startDate: '',
    endDate: '',
    xpReward: 100,
    isRepeatable: true,
    difficulty: 'medium',
    created_at: Timestamp.now(),
  }));

  describe('calculateEvolutionScore', () => {
    it('should calculate evolution score', () => {
      const monthStart = new Date('2025-01-01');
      const result = calculateEvolutionScore(mockMesures, mockEntrainements, mockRepas, mockJournal, monthStart);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(9);
    });
  });

  describe('calculateHealthDefenderScore', () => {
    it('should calculate health defender score', () => {
      const result = calculateHealthDefenderScore(mockEntrainements, mockRepas, mockJournal, mockChallenges);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(9);
    });
  });
});
