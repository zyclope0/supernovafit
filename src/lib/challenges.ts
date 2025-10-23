// Système de Challenges & Gamification pour SuperNovaFit
import type { Challenge, Achievement } from '@/types';

// Définitions des challenges prédéfinis (50 challenges variés)
export const CHALLENGE_DEFINITIONS: Omit<
  Challenge,
  'id' | 'user_id' | 'current' | 'status' | 'created_at' | 'completed_at'
>[] = [
  // ===== NUTRITION CHALLENGES =====
  {
    type: 'nutrition',
    title: '7 Jours de Nutrition Parfaite',
    description:
      'Ajoutez au moins 3 repas par jour pendant 7 jours consécutifs.',
    icon: '🥗',
    category: 'weekly',
    target: 7,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 100,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'nutrition',
    title: 'Marathon des Protéines',
    description: 'Atteignez votre objectif protéines pendant 5 jours.',
    icon: '💪',
    category: 'weekly',
    target: 5,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 80,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'nutrition',
    title: 'Défi Calories',
    description: 'Brûlez 2000 calories en une semaine.',
    icon: '🔥',
    category: 'weekly',
    target: 2000,
    unit: 'kcal',
    startDate: '',
    endDate: '',
    xpReward: 120,
    isRepeatable: true,
    difficulty: 'hard',
  },
  {
    type: 'nutrition',
    title: 'Hydratation Parfaite',
    description: "Buvez 2L d'eau par jour pendant 5 jours.",
    icon: '💧',
    category: 'weekly',
    target: 5,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 60,
    isRepeatable: true,
    difficulty: 'easy',
  },
  {
    type: 'nutrition',
    title: 'Défi Fibres',
    description: 'Consommez 25g de fibres par jour pendant 7 jours.',
    icon: '🌾',
    category: 'weekly',
    target: 7,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 90,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'nutrition',
    title: 'Zéro Sucres Ajoutés',
    description: 'Évitez les sucres ajoutés pendant 3 jours.',
    icon: '🚫',
    category: 'daily',
    target: 3,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 70,
    isRepeatable: true,
    difficulty: 'hard',
  },
  {
    type: 'nutrition',
    title: 'Défi Légumes',
    description: 'Mangez 5 portions de légumes par jour pendant 5 jours.',
    icon: '🥕',
    category: 'weekly',
    target: 5,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 85,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'nutrition',
    title: 'Petit-Déjeuner Royal',
    description: "Prenez un petit-déjeuner équilibré 7 jours d'affilée.",
    icon: '🍳',
    category: 'weekly',
    target: 7,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 75,
    isRepeatable: true,
    difficulty: 'easy',
  },
  {
    type: 'nutrition',
    title: 'Défi Équilibre',
    description: 'Respectez vos macros (protéines, glucides, lipides) 5 jours.',
    icon: '⚖️',
    category: 'weekly',
    target: 5,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 120,
    isRepeatable: true,
    difficulty: 'hard',
  },
  {
    type: 'nutrition',
    title: 'Repas Complet',
    description: "Prenez 3 repas équilibrés aujourd'hui.",
    icon: '🍽️',
    category: 'daily',
    target: 3,
    unit: 'repas',
    startDate: '',
    endDate: '',
    xpReward: 30,
    isRepeatable: true,
    difficulty: 'easy',
  },
  {
    type: 'nutrition',
    title: 'Hydratation Express',
    description: "Buvez 2L d'eau aujourd'hui.",
    icon: '💧',
    category: 'daily',
    target: 2,
    unit: 'litres',
    startDate: '',
    endDate: '',
    xpReward: 35,
    isRepeatable: true,
    difficulty: 'easy',
  },

  // ===== TRAINING CHALLENGES =====
  {
    type: 'training',
    title: 'Streak Entraînement',
    description: '3 entraînements consécutifs cette semaine.',
    icon: '🏃',
    category: 'weekly',
    target: 3,
    unit: 'séances',
    startDate: '',
    endDate: '',
    xpReward: 90,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'training',
    title: 'Marathon du Temps',
    description: "Cumulez 5 heures d'entraînement cette semaine.",
    icon: '⏱️',
    category: 'weekly',
    target: 300,
    unit: 'minutes',
    startDate: '',
    endDate: '',
    xpReward: 150,
    isRepeatable: true,
    difficulty: 'hard',
  },
  {
    type: 'training',
    title: 'Explosif',
    description: '1 entraînement de plus de 2 heures.',
    icon: '💥',
    category: 'daily',
    target: 1,
    unit: 'séance',
    startDate: '',
    endDate: '',
    xpReward: 60,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'training',
    title: 'Cardio Intense',
    description: 'Brûlez 500 calories en une seule séance.',
    icon: '❤️',
    category: 'daily',
    target: 500,
    unit: 'kcal',
    startDate: '',
    endDate: '',
    xpReward: 80,
    isRepeatable: true,
    difficulty: 'hard',
  },
  {
    type: 'training',
    title: 'Force Pure',
    description: '3 séances de musculation cette semaine.',
    icon: '🏋️',
    category: 'weekly',
    target: 3,
    unit: 'séances',
    startDate: '',
    endDate: '',
    xpReward: 100,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'training',
    title: 'Warrior Streak',
    description: 'Entraînez-vous 30 jours consécutifs.',
    icon: '⚔️',
    category: 'monthly',
    target: 30,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 300,
    isRepeatable: true,
    difficulty: 'hard',
  },
  {
    type: 'training',
    title: 'Volume Monstre',
    description: 'Soulevez 50,000 kg en une semaine (total volume).',
    icon: '🦍',
    category: 'weekly',
    target: 50,
    unit: 'milliers kg',
    startDate: '',
    endDate: '',
    xpReward: 200,
    isRepeatable: true,
    difficulty: 'hard',
  },
  {
    type: 'training',
    title: 'Endurance Extrême',
    description: '1 séance de plus de 90 minutes.',
    icon: '🏃‍♂️',
    category: 'daily',
    target: 1,
    unit: 'séance',
    startDate: '',
    endDate: '',
    xpReward: 70,
    isRepeatable: true,
    difficulty: 'hard',
  },
  {
    type: 'training',
    title: 'Défi HIIT',
    description: '2 séances HIIT cette semaine.',
    icon: '⚡',
    category: 'weekly',
    target: 2,
    unit: 'séances',
    startDate: '',
    endDate: '',
    xpReward: 85,
    isRepeatable: true,
    difficulty: 'hard',
  },
  {
    type: 'training',
    title: 'Récupération Active',
    description: '1 séance de yoga ou stretching de 30min.',
    icon: '🧘',
    category: 'daily',
    target: 1,
    unit: 'séance',
    startDate: '',
    endDate: '',
    xpReward: 40,
    isRepeatable: true,
    difficulty: 'easy',
  },
  {
    type: 'training',
    title: 'Variété Sportive',
    description: 'Pratiquez 3 sports différents cette semaine.',
    icon: '🎯',
    category: 'weekly',
    target: 3,
    unit: 'sports',
    startDate: '',
    endDate: '',
    xpReward: 110,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'training',
    title: 'Séance Express',
    description: "Faites au moins 30 minutes d'exercice aujourd'hui.",
    icon: '⚡',
    category: 'daily',
    target: 30,
    unit: 'minutes',
    startDate: '',
    endDate: '',
    xpReward: 40,
    isRepeatable: true,
    difficulty: 'easy',
  },
  {
    type: 'training',
    title: 'Marche Active',
    description: "Faites 10 000 pas aujourd'hui.",
    icon: '🚶',
    category: 'daily',
    target: 10000,
    unit: 'pas',
    startDate: '',
    endDate: '',
    xpReward: 45,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'training',
    title: 'Matin Productif',
    description: 'Entraînez-vous avant 9h pendant 3 jours.',
    icon: '🌅',
    category: 'weekly',
    target: 3,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 80,
    isRepeatable: true,
    difficulty: 'medium',
  },

  // ===== STREAK CHALLENGES =====
  {
    type: 'streak',
    title: 'Journalier Assidu',
    description: "Écrivez dans votre journal 7 jours d'affilée.",
    icon: '📝',
    category: 'weekly',
    target: 7,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 100,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'streak',
    title: 'Suivi Parfait',
    description: 'Ajoutez vos mesures 3 fois cette semaine.',
    icon: '📊',
    category: 'weekly',
    target: 3,
    unit: 'fois',
    startDate: '',
    endDate: '',
    xpReward: 70,
    isRepeatable: true,
    difficulty: 'easy',
  },
  {
    type: 'streak',
    title: 'Pesée Quotidienne',
    description: 'Pesez-vous 7 jours consécutifs.',
    icon: '⚖️',
    category: 'weekly',
    target: 7,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 100,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'streak',
    title: 'Journal Quotidien',
    description: 'Écrivez dans votre journal 7 jours consécutifs.',
    icon: '📓',
    category: 'weekly',
    target: 7,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 100,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'streak',
    title: 'Streak de 30 Jours',
    description: "Connectez-vous et utilisez l'app 30 jours consécutifs.",
    icon: '🔥',
    category: 'monthly',
    target: 30,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 500,
    isRepeatable: true,
    difficulty: 'legendary',
  },
  {
    type: 'streak',
    title: 'Humeur Positive',
    description: 'Évaluez votre humeur à 7+ pendant 5 jours.',
    icon: '😊',
    category: 'weekly',
    target: 5,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 60,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'streak',
    title: 'Énergie Maximale',
    description: 'Évaluez votre énergie à 8+ pendant 3 jours.',
    icon: '⚡',
    category: 'weekly',
    target: 3,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 50,
    isRepeatable: true,
    difficulty: 'easy',
  },
  {
    type: 'streak',
    title: 'Sommeil de Qualité',
    description: 'Évaluez votre sommeil à 7+ pendant 5 jours.',
    icon: '😴',
    category: 'weekly',
    target: 5,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 80,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'streak',
    title: 'Consistance Parfaite',
    description: "Utilisez l'app tous les jours pendant 2 semaines.",
    icon: '📅',
    category: 'monthly',
    target: 14,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 300,
    isRepeatable: true,
    difficulty: 'hard',
  },
  {
    type: 'streak',
    title: 'Gratitude',
    description: 'Écrivez 3 choses positives dans votre journal.',
    icon: '🙏',
    category: 'daily',
    target: 3,
    unit: 'points',
    startDate: '',
    endDate: '',
    xpReward: 25,
    isRepeatable: true,
    difficulty: 'easy',
  },
  {
    type: 'streak',
    title: 'Méditation',
    description: "Méditez 10 minutes aujourd'hui.",
    icon: '🧘‍♀️',
    category: 'daily',
    target: 10,
    unit: 'minutes',
    startDate: '',
    endDate: '',
    xpReward: 30,
    isRepeatable: true,
    difficulty: 'easy',
  },

  // ===== SOCIAL CHALLENGES =====
  {
    type: 'social',
    title: 'Mentor du Mois',
    description: 'Aidez 3 autres utilisateurs avec des conseils.',
    icon: '🤝',
    category: 'monthly',
    target: 3,
    unit: 'conseils',
    startDate: '',
    endDate: '',
    xpReward: 200,
    isRepeatable: true,
    difficulty: 'medium',
  },
  {
    type: 'social',
    title: 'Partage de Progrès',
    description: 'Partagez 5 photos de progression cette semaine.',
    icon: '📸',
    category: 'weekly',
    target: 5,
    unit: 'photos',
    startDate: '',
    endDate: '',
    xpReward: 90,
    isRepeatable: true,
    difficulty: 'easy',
  },
  {
    type: 'social',
    title: 'Ambassadeur',
    description: 'Invitez 2 amis à rejoindre SuperNovaFit.',
    icon: '👥',
    category: 'special',
    target: 2,
    unit: 'amis',
    startDate: '',
    endDate: '',
    xpReward: 300,
    isRepeatable: false,
    difficulty: 'medium',
  },

  // ===== SPECIAL CHALLENGES =====
  {
    type: 'special',
    title: 'Premier Pas',
    description: 'Complétez votre premier challenge.',
    icon: '🎯',
    category: 'special',
    target: 1,
    unit: 'challenge',
    startDate: '',
    endDate: '',
    xpReward: 50,
    isRepeatable: false,
    difficulty: 'easy',
  },
  {
    type: 'special',
    title: 'Collectionneur',
    description: 'Débloquez 5 badges différents.',
    icon: '🏆',
    category: 'special',
    target: 5,
    unit: 'badges',
    startDate: '',
    endDate: '',
    xpReward: 200,
    isRepeatable: false,
    difficulty: 'hard',
  },
  {
    type: 'special',
    title: 'Perfectionniste',
    description: 'Complétez 10 challenges sans échec.',
    icon: '⭐',
    category: 'special',
    target: 10,
    unit: 'challenges',
    startDate: '',
    endDate: '',
    xpReward: 400,
    isRepeatable: false,
    difficulty: 'legendary',
  },
  {
    type: 'special',
    title: 'Explorateur',
    description: "Testez toutes les fonctionnalités de l'app.",
    icon: '🗺️',
    category: 'special',
    target: 1,
    unit: 'exploration',
    startDate: '',
    endDate: '',
    xpReward: 150,
    isRepeatable: false,
    difficulty: 'medium',
  },
  {
    type: 'special',
    title: 'Maître du Temps',
    description: 'Complétez un challenge en moins de 24h.',
    icon: '⏰',
    category: 'special',
    target: 1,
    unit: 'challenge',
    startDate: '',
    endDate: '',
    xpReward: 100,
    isRepeatable: true,
    difficulty: 'hard',
  },
  {
    type: 'special',
    title: 'Légende Vivante',
    description: 'Atteignez le niveau 25.',
    icon: '👑',
    category: 'special',
    target: 25,
    unit: 'niveau',
    startDate: '',
    endDate: '',
    xpReward: 1000,
    isRepeatable: false,
    difficulty: 'legendary',
  },
  {
    type: 'special',
    title: 'Maître Absolu',
    description: 'Complétez 50 challenges au total.',
    icon: '🏅',
    category: 'special',
    target: 50,
    unit: 'challenges',
    startDate: '',
    endDate: '',
    xpReward: 800,
    isRepeatable: false,
    difficulty: 'legendary',
  },
  {
    type: 'special',
    title: 'Défenseur de la Santé',
    description: 'Maintenez un streak de 100 jours.',
    icon: '🛡️',
    category: 'special',
    target: 100,
    unit: 'jours',
    startDate: '',
    endDate: '',
    xpReward: 1200,
    isRepeatable: false,
    difficulty: 'legendary',
  },

  // ===== MONTHLY CHALLENGES =====
  {
    type: 'nutrition',
    title: 'Transformation du Mois',
    description: 'Perdez 2kg ou gagnez 1kg de muscle ce mois.',
    icon: '🔄',
    category: 'monthly',
    target: 1,
    unit: 'transformation',
    startDate: '',
    endDate: '',
    xpReward: 600,
    isRepeatable: true,
    difficulty: 'legendary',
  },
  {
    type: 'training',
    title: 'Marathon Mensuel',
    description: "Cumulez 20 heures d'entraînement ce mois.",
    icon: '🏃‍♀️',
    category: 'monthly',
    target: 1200,
    unit: 'minutes',
    startDate: '',
    endDate: '',
    xpReward: 500,
    isRepeatable: true,
    difficulty: 'legendary',
  },

  // ===== NOUVEAUX CHALLENGES FACILEMENT IMPLÉMENTABLES =====

  // 1. Défi Variété - 5 types d'entraînements différents
  {
    type: 'training',
    title: 'Défi Variété',
    description: "Effectuez 5 types d'entraînements différents en 1 mois.",
    icon: '🎯',
    category: 'monthly',
    target: 5,
    unit: 'types',
    startDate: '',
    endDate: '',
    xpReward: 150,
    isRepeatable: true,
    difficulty: 'medium',
  },

  // 2. Consistance - Entraînements 3x/semaine pendant 4 semaines
  {
    type: 'streak',
    title: 'Consistance',
    description:
      'Entraînez-vous 3 fois par semaine pendant 4 semaines consécutives.',
    icon: '📅',
    category: 'monthly',
    target: 4,
    unit: 'semaines',
    startDate: '',
    endDate: '',
    xpReward: 200,
    isRepeatable: true,
    difficulty: 'hard',
  },

  // 3. Récupération - 1 jour de repos entre entraînements intenses
  {
    type: 'training',
    title: 'Récupération',
    description:
      'Respectez 1 jour de repos entre vos entraînements intenses pendant 2 semaines.',
    icon: '😴',
    category: 'weekly',
    target: 2,
    unit: 'semaines',
    startDate: '',
    endDate: '',
    xpReward: 100,
    isRepeatable: true,
    difficulty: 'medium',
  },

  // 4. Matin Productif - Entraînements avant 10h
  {
    type: 'training',
    title: 'Matin Productif',
    description: 'Effectuez 5 entraînements avant 10h du matin en 2 semaines.',
    icon: '🌅',
    category: 'weekly',
    target: 5,
    unit: 'entraînements',
    startDate: '',
    endDate: '',
    xpReward: 120,
    isRepeatable: true,
    difficulty: 'medium',
  },
];

// Définitions des achievements
export const ACHIEVEMENT_DEFINITIONS: Omit<
  Achievement,
  'id' | 'user_id' | 'unlockedAt' | 'created_at'
>[] = [
  // Achievements Milestone
  {
    type: 'milestone',
    name: '🚀 Débutant',
    description: 'Atteignez le niveau 5',
    icon: '🚀',
    rarity: 'common',
    xpReward: 100,
    condition: 'Niveau 5 atteint',
  },
  {
    type: 'milestone',
    name: '⭐ Athlète Confirmé',
    description: 'Atteignez le niveau 10',
    icon: '⭐',
    rarity: 'rare',
    xpReward: 250,
    condition: 'Niveau 10 atteint',
  },
  {
    type: 'milestone',
    name: '👑 Champion',
    description: 'Atteignez le niveau 20',
    icon: '👑',
    rarity: 'epic',
    xpReward: 500,
    condition: 'Niveau 20 atteint',
  },
  {
    type: 'milestone',
    name: '🏆 Légende',
    description: 'Atteignez le niveau 50',
    icon: '🏆',
    rarity: 'legendary',
    xpReward: 1000,
    condition: 'Niveau 50 atteint',
  },

  // Achievements Streak
  {
    type: 'streak',
    name: '🔥 Streak Master',
    description: 'Maintenez une activité de 30 jours consécutifs',
    icon: '🔥',
    rarity: 'epic',
    xpReward: 300,
    condition: "30 jours d'activité consécutifs",
  },
  {
    type: 'streak',
    name: '📝 Journalier Pro',
    description: '100 entrées dans le journal',
    icon: '📝',
    rarity: 'rare',
    xpReward: 200,
    condition: '100 entrées journal',
  },

  // Achievements Performance
  {
    type: 'performance',
    name: '💪 Machine à Entraînement',
    description: '50 entraînements complétés',
    icon: '💪',
    rarity: 'rare',
    xpReward: 200,
    condition: '50 entraînements',
  },
  {
    type: 'performance',
    name: '🥗 Nutritionniste',
    description: '500 repas trackés',
    icon: '🥗',
    rarity: 'rare',
    xpReward: 200,
    condition: '500 repas trackés',
  },

  // Achievements Spéciaux
  {
    type: 'special',
    name: '🎯 Perfectionniste',
    description: 'Complétez 10 challenges parfaits',
    icon: '🎯',
    rarity: 'epic',
    xpReward: 400,
    condition: '10 challenges complétés',
  },
  {
    type: 'special',
    name: '🌟 Étoile Montante',
    description: 'Gagnez 1000 XP en une semaine',
    icon: '🌟',
    rarity: 'legendary',
    xpReward: 500,
    condition: '1000 XP en 7 jours',
  },
];

// Configuration des niveaux XP
export const XP_LEVELS = [
  { level: 1, xpRequired: 0, xpToNext: 100 },
  { level: 2, xpRequired: 100, xpToNext: 200 },
  { level: 3, xpRequired: 300, xpToNext: 300 },
  { level: 4, xpRequired: 600, xpToNext: 400 },
  { level: 5, xpRequired: 1000, xpToNext: 500 },
  { level: 6, xpRequired: 1500, xpToNext: 600 },
  { level: 7, xpRequired: 2100, xpToNext: 700 },
  { level: 8, xpRequired: 2800, xpToNext: 800 },
  { level: 9, xpRequired: 3600, xpToNext: 900 },
  { level: 10, xpRequired: 4500, xpToNext: 1000 },
  // Niveaux 11-20: +100 XP par niveau
  ...Array.from({ length: 10 }, (_, i) => ({
    level: 11 + i,
    xpRequired: 5500 + i * 1000,
    xpToNext: 1000,
  })),
  // Niveaux 21-50: +200 XP par niveau
  ...Array.from({ length: 30 }, (_, i) => ({
    level: 21 + i,
    xpRequired: 15500 + i * 2000,
    xpToNext: 2000,
  })),
];

// Fonctions utilitaires
export function calculateLevel(totalXP: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
} {
  const levelConfig = XP_LEVELS.find(
    (config) => totalXP < config.xpRequired + config.xpToNext,
  );

  if (!levelConfig) {
    // Niveau maximum
    const maxLevel = XP_LEVELS[XP_LEVELS.length - 1];
    return {
      level: maxLevel.level,
      currentLevelXP: totalXP - maxLevel.xpRequired,
      nextLevelXP: 0,
    };
  }

  return {
    level: levelConfig.level,
    currentLevelXP: totalXP - levelConfig.xpRequired,
    nextLevelXP: levelConfig.xpToNext,
  };
}

export function getDifficultyColor(
  difficulty: Challenge['difficulty'],
): string {
  switch (difficulty) {
    case 'easy':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'hard':
      return 'text-orange-400';
    case 'legendary':
      return 'text-purple-400';
    default:
      return 'text-gray-400';
  }
}

export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-400';
    case 'rare':
      return 'text-blue-400';
    case 'epic':
      return 'text-purple-400';
    case 'legendary':
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
}

export function getProgressPercentage(current: number, target: number): number {
  return Math.min(Math.round((current / target) * 100), 100);
}

// Fonction pour créer un challenge à partir d'une définition
export function createChallengeFromDefinition(
  definition: (typeof CHALLENGE_DEFINITIONS)[0],
  userId: string,
): Omit<Challenge, 'id' | 'created_at' | 'completed_at'> {
  const now = new Date();
  const endDate = new Date(now);

  // Calculer la date de fin selon la catégorie
  switch (definition.category) {
    case 'daily':
      endDate.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      endDate.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      endDate.setMonth(now.getMonth() + 1);
      break;
    case 'special':
      endDate.setMonth(now.getMonth() + 3); // 3 mois pour les spéciaux
      break;
    default:
      endDate.setDate(now.getDate() + 7);
  }

  return {
    ...definition,
    user_id: userId,
    current: 0,
    status: 'active',
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
  };
}

// Fonction pour créer un achievement à partir d'une définition
export function createAchievementFromDefinition(
  definition: (typeof ACHIEVEMENT_DEFINITIONS)[0],
  userId: string,
): Omit<Achievement, 'id' | 'created_at'> {
  return {
    ...definition,
    user_id: userId,
  };
}

// Fonctions de filtrage et recherche
export function filterChallengesByCategory(
  challenges: typeof CHALLENGE_DEFINITIONS,
  category: string,
) {
  return challenges.filter((challenge) => challenge.category === category);
}

export function filterChallengesByDifficulty(
  challenges: typeof CHALLENGE_DEFINITIONS,
  difficulty: string,
) {
  return challenges.filter((challenge) => challenge.difficulty === difficulty);
}

export function filterChallengesByType(
  challenges: typeof CHALLENGE_DEFINITIONS,
  type: string,
) {
  return challenges.filter((challenge) => challenge.type === type);
}

export function searchChallenges(
  challenges: typeof CHALLENGE_DEFINITIONS,
  query: string,
) {
  const lowercaseQuery = query.toLowerCase();
  return challenges.filter(
    (challenge) =>
      challenge.title.toLowerCase().includes(lowercaseQuery) ||
      challenge.description.toLowerCase().includes(lowercaseQuery),
  );
}

// Constantes pour les filtres
export const CHALLENGE_CATEGORIES = [
  { value: 'all', label: 'Tous', icon: '🎯' },
  { value: 'daily', label: 'Quotidien', icon: '📅' },
  { value: 'weekly', label: 'Hebdomadaire', icon: '📊' },
  { value: 'monthly', label: 'Mensuel', icon: '🗓️' },
  { value: 'special', label: 'Spécial', icon: '⭐' },
];

export const CHALLENGE_DIFFICULTIES = [
  { value: 'all', label: 'Toutes', color: 'text-gray-400' },
  { value: 'easy', label: 'Facile', color: 'text-green-400' },
  { value: 'medium', label: 'Moyen', color: 'text-yellow-400' },
  { value: 'hard', label: 'Difficile', color: 'text-orange-400' },
  { value: 'legendary', label: 'Légendaire', color: 'text-purple-400' },
];

export const CHALLENGE_TYPES = [
  { value: 'all', label: 'Tous', icon: '🎯' },
  { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { value: 'training', label: 'Entraînement', icon: '🏃' },
  { value: 'streak', label: 'Régularité', icon: '🔥' },
  { value: 'social', label: 'Social', icon: '👥' },
  { value: 'special', label: 'Spécial', icon: '⭐' },
];
