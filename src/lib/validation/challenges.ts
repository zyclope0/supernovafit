/**
 * Validation Zod pour le système de Challenges
 *
 * Valide toutes les données challenges/achievements avant création/mise à jour Firestore
 * avec messages d'erreur user-friendly et type safety runtime.
 *
 * @module validation/challenges
 * @created 23.10.2025
 * @security CRITICAL - Validation obligatoire avant écriture Firestore
 */

import { z } from 'zod';

// ==================== SCHEMAS CHALLENGES ====================

/**
 * Types valides pour un challenge
 */
export const ChallengeTypeSchema = z.enum(
  ['nutrition', 'training', 'streak', 'social', 'special'],
  {
    errorMap: () => ({ message: 'Le type de challenge est invalide' }),
  },
);

/**
 * Catégories valides pour un challenge
 */
export const ChallengeCategorySchema = z.enum(
  ['daily', 'weekly', 'monthly', 'special'],
  {
    errorMap: () => ({ message: 'La catégorie du challenge est invalide' }),
  },
);

/**
 * Status valides pour un challenge
 */
export const ChallengeStatusSchema = z.enum(
  ['active', 'completed', 'expired', 'paused'],
  {
    errorMap: () => ({ message: 'Le statut du challenge est invalide' }),
  },
);

/**
 * Difficultés valides pour un challenge
 */
export const ChallengeDifficultySchema = z.enum(
  ['easy', 'medium', 'hard', 'legendary'],
  {
    errorMap: () => ({ message: 'La difficulté du challenge est invalide' }),
  },
);

/**
 * Schema de base pour un Challenge (sans refinements)
 */
const BaseChallengeSchema = z
  .object({
    id: z.string().optional(), // Optional for creation
    user_id: z
      .string()
      .min(20, 'ID utilisateur invalide')
      .max(128, 'ID utilisateur trop long'),

    type: ChallengeTypeSchema,

    title: z
      .string()
      .min(3, 'Le titre doit contenir au moins 3 caractères')
      .max(100, 'Le titre ne peut pas dépasser 100 caractères')
      .regex(
        /^[a-zA-Z0-9À-ÿ\s\-'!?.,()]+$/,
        'Le titre contient des caractères invalides',
      ),

    description: z
      .string()
      .min(10, 'La description doit contenir au moins 10 caractères')
      .max(500, 'La description ne peut pas dépasser 500 caractères'),

    icon: z.string().min(1, "L'icône est requise").max(10, 'Icône invalide'),

    category: ChallengeCategorySchema,

    target: z
      .number()
      .int('La cible doit être un nombre entier')
      .positive('La cible doit être un nombre positif')
      .min(1, 'La cible doit être au moins 1')
      .max(10000, 'La cible ne peut pas dépasser 10000'),

    current: z
      .number()
      .int('La progression doit être un nombre entier')
      .nonnegative('La progression ne peut pas être négative'),

    unit: z
      .string()
      .min(1, "L'unité est requise")
      .max(50, "L'unité ne peut pas dépasser 50 caractères"),

    startDate: z
      .string()
      .datetime('La date de début doit être une date ISO valide'),

    endDate: z
      .string()
      .datetime('La date de fin doit être une date ISO valide'),

    status: ChallengeStatusSchema,

    xpReward: z
      .number()
      .int('La récompense XP doit être un nombre entier')
      .nonnegative('La récompense XP ne peut pas être négative')
      .max(10000, 'La récompense XP ne peut pas dépasser 10000'),

    badgeReward: z.string().optional(),

    isRepeatable: z.boolean(),

    difficulty: ChallengeDifficultySchema,

    created_at: z.union([z.date(), z.string().datetime()]).optional(),

    completed_at: z.string().datetime().optional(),
  })
  .strict(); // Refuse les propriétés non déclarées

/**
 * Schema complet pour un Challenge avec validations avancées
 *
 * @validation
 * - user_id: obligatoire, 20-128 caractères
 * - type: enum ['nutrition', 'training', 'streak', 'social', 'special']
 * - title: 3-100 caractères, pas de caractères dangereux
 * - description: 10-500 caractères
 * - target: nombre positif >= 1
 * - current: 0 <= current <= target
 * - xpReward: 0 <= xp <= 10000
 * - startDate/endDate: dates ISO valides, startDate < endDate
 */
export const ChallengeSchema = BaseChallengeSchema.refine(
  (data) => data.current <= data.target,
  {
    message: 'La progression ne peut pas dépasser la cible',
    path: ['current'],
  },
).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: 'La date de début doit être avant la date de fin',
  path: ['endDate'],
});

/**
 * Schema pour création de challenge (sans id, created_at, completed_at)
 */
export const CreateChallengeSchema = BaseChallengeSchema.omit({
  id: true,
  created_at: true,
  completed_at: true,
})
  .refine((data) => data.current <= data.target, {
    message: 'La progression ne peut pas dépasser la cible',
    path: ['current'],
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: 'La date de début doit être avant la date de fin',
    path: ['endDate'],
  });

/**
 * Schema pour mise à jour de challenge (tous les champs optionnels sauf user_id)
 */
export const UpdateChallengeSchema = BaseChallengeSchema.partial().required({
  user_id: true,
});

// ==================== SCHEMAS ACHIEVEMENTS ====================

/**
 * Types valides pour un achievement
 */
export const AchievementTypeSchema = z.enum(
  ['milestone', 'streak', 'performance', 'special'],
  {
    errorMap: () => ({ message: "Le type d'achievement est invalide" }),
  },
);

/**
 * Raretés valides pour un achievement
 */
export const AchievementRaritySchema = z.enum(
  ['common', 'rare', 'epic', 'legendary'],
  {
    errorMap: () => ({ message: "La rareté de l'achievement est invalide" }),
  },
);

/**
 * Schema complet pour un Achievement
 */
export const AchievementSchema = z
  .object({
    id: z.string().optional(),
    user_id: z
      .string()
      .min(20, 'ID utilisateur invalide')
      .max(128, 'ID utilisateur trop long'),

    type: AchievementTypeSchema,

    name: z
      .string()
      .min(3, 'Le nom doit contenir au moins 3 caractères')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères')
      // Accepte lettres, chiffres, accents, espaces, ponctuation ET emojis
      .regex(/^[\w\s\-'!?.,()]+$/, 'Le nom contient des caractères invalides'),

    description: z
      .string()
      .min(10, 'La description doit contenir au moins 10 caractères')
      .max(300, 'La description ne peut pas dépasser 300 caractères'),

    icon: z.string().min(1, "L'icône est requise").max(10, 'Icône invalide'),

    rarity: AchievementRaritySchema,

    xpReward: z
      .number()
      .int('La récompense XP doit être un nombre entier')
      .nonnegative('La récompense XP ne peut pas être négative')
      .max(10000, 'La récompense XP ne peut pas dépasser 10000'),

    condition: z
      .string()
      .min(5, 'La condition doit contenir au moins 5 caractères')
      .max(200, 'La condition ne peut pas dépasser 200 caractères'),

    unlockedAt: z.union([z.date(), z.string().datetime()]).optional(),

    created_at: z.union([z.date(), z.string().datetime()]).optional(),
  })
  .strict();

/**
 * Schema pour création d'achievement
 */
export const CreateAchievementSchema = AchievementSchema.omit({
  id: true,
  unlockedAt: true,
  created_at: true,
});

// ==================== SCHEMA USER PROGRESS ====================

/**
 * Schema pour la progression utilisateur (XP, niveau, etc.)
 */
export const UserProgressSchema = z
  .object({
    user_id: z
      .string()
      .min(20, 'ID utilisateur invalide')
      .max(128, 'ID utilisateur trop long'),

    totalXP: z
      .number()
      .int('Le XP total doit être un nombre entier')
      .nonnegative('Le XP total ne peut pas être négatif')
      .max(1000000, 'Le XP total ne peut pas dépasser 1 000 000'),

    level: z
      .number()
      .int('Le niveau doit être un nombre entier')
      .positive('Le niveau doit être positif')
      .min(1, 'Le niveau minimum est 1')
      .max(50, 'Le niveau maximum est 50'),

    currentLevelXP: z
      .number()
      .int('Le XP du niveau actuel doit être un nombre entier')
      .nonnegative('Le XP du niveau actuel ne peut pas être négatif'),

    nextLevelXP: z
      .number()
      .int('Le XP pour le prochain niveau doit être un nombre entier')
      .nonnegative('Le XP pour le prochain niveau ne peut pas être négatif'),

    totalChallengesCompleted: z
      .number()
      .int('Le nombre de challenges complétés doit être un nombre entier')
      .nonnegative('Le nombre de challenges complétés ne peut pas être négatif')
      .max(1000, 'Le nombre de challenges complétés ne peut pas dépasser 1000'),

    totalAchievementsUnlocked: z
      .number()
      .int("Le nombre d'achievements débloqués doit être un nombre entier")
      .nonnegative(
        "Le nombre d'achievements débloqués ne peut pas être négatif",
      )
      .max(100, "Le nombre d'achievements débloqués ne peut pas dépasser 100"),

    currentStreak: z
      .number()
      .int('Le streak actuel doit être un nombre entier')
      .nonnegative('Le streak actuel ne peut pas être négatif')
      .max(365, 'Le streak actuel ne peut pas dépasser 365 jours'),

    longestStreak: z
      .number()
      .int('Le streak le plus long doit être un nombre entier')
      .nonnegative('Le streak le plus long ne peut pas être négatif')
      .max(365, 'Le streak le plus long ne peut pas dépasser 365 jours'),

    lastActivityDate: z
      .string()
      .datetime("La dernière date d'activité doit être une date ISO valide")
      .optional(),

    created_at: z.union([z.date(), z.string().datetime()]).optional(),

    updated_at: z.union([z.date(), z.string().datetime()]).optional(),
  })
  .strict()
  .refine((data) => data.currentLevelXP <= data.nextLevelXP, {
    message:
      'Le XP du niveau actuel ne peut pas dépasser le XP requis pour le prochain niveau',
    path: ['currentLevelXP'],
  })
  .refine((data) => data.currentStreak <= data.longestStreak, {
    message: 'Le streak actuel ne peut pas dépasser le streak le plus long',
    path: ['currentStreak'],
  });

// ==================== FONCTIONS DE VALIDATION ====================

/**
 * Valide les données d'un challenge avant création
 *
 * @param data - Données du challenge à valider
 * @returns Données validées et typées
 * @throws ZodError avec messages user-friendly
 *
 * @example
 * ```typescript
 * try {
 *   const validChallenge = validateCreateChallenge(challengeData);
 *   await addDoc(collection(db, 'challenges'), validChallenge);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     toast.error(error.errors[0].message);
 *   }
 * }
 * ```
 */
export function validateCreateChallenge(
  data: unknown,
): z.infer<typeof CreateChallengeSchema> {
  return CreateChallengeSchema.parse(data);
}

/**
 * Valide les données d'un challenge avant mise à jour
 *
 * @param data - Données partielles du challenge à valider
 * @returns Données validées et typées
 * @throws ZodError avec messages user-friendly
 */
export function validateUpdateChallenge(
  data: unknown,
): z.infer<typeof UpdateChallengeSchema> {
  return UpdateChallengeSchema.parse(data);
}

/**
 * Valide les données d'un achievement avant création
 *
 * @param data - Données de l'achievement à valider
 * @returns Données validées et typées
 * @throws ZodError avec messages user-friendly
 */
export function validateCreateAchievement(
  data: unknown,
): z.infer<typeof CreateAchievementSchema> {
  return CreateAchievementSchema.parse(data);
}

/**
 * Valide les données de progression utilisateur
 *
 * @param data - Données de progression à valider
 * @returns Données validées et typées
 * @throws ZodError avec messages user-friendly
 */
export function validateUserProgress(
  data: unknown,
): z.infer<typeof UserProgressSchema> {
  return UserProgressSchema.parse(data);
}

/**
 * Valide en mode "safe" (retourne succès/erreur au lieu de throw)
 *
 * @param data - Données à valider
 * @returns { success: true, data } ou { success: false, error }
 *
 * @example
 * ```typescript
 * const result = safeValidateCreateChallenge(challengeData);
 * if (result.success) {
 *   await addDoc(collection(db, 'challenges'), result.data);
 * } else {
 *   toast.error(result.error.errors[0].message);
 * }
 * ```
 */
export function safeValidateCreateChallenge(data: unknown) {
  return CreateChallengeSchema.safeParse(data);
}

export function safeValidateUpdateChallenge(data: unknown) {
  return UpdateChallengeSchema.safeParse(data);
}

export function safeValidateCreateAchievement(data: unknown) {
  return CreateAchievementSchema.safeParse(data);
}

export function safeValidateUserProgress(data: unknown) {
  return UserProgressSchema.safeParse(data);
}

// ==================== HELPERS ====================

/**
 * Extrait les messages d'erreur de validation Zod en format user-friendly
 *
 * @param error - Erreur Zod
 * @returns Array de messages d'erreur
 *
 * @example
 * ```typescript
 * try {
 *   validateCreateChallenge(data);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     const messages = getValidationErrors(error);
 *     toast.error(messages.join(', '));
 *   }
 * }
 * ```
 */
export function getValidationErrors(error: z.ZodError): string[] {
  return error.errors.map((err) => err.message);
}

/**
 * Formate un message d'erreur de validation pour l'utilisateur
 *
 * @param error - Erreur Zod
 * @returns Message d'erreur formaté
 */
export function formatValidationError(error: z.ZodError): string {
  const messages = getValidationErrors(error);
  if (messages.length === 1) {
    return messages[0];
  }
  return `Erreurs de validation : ${messages.join(', ')}`;
}

// ==================== TYPES EXPORTS ====================

/**
 * Type inféré pour un challenge validé
 */
export type ValidatedChallenge = z.infer<typeof ChallengeSchema>;

/**
 * Type inféré pour un challenge à créer
 */
export type ValidatedCreateChallenge = z.infer<typeof CreateChallengeSchema>;

/**
 * Type inféré pour un challenge à mettre à jour
 */
export type ValidatedUpdateChallenge = z.infer<typeof UpdateChallengeSchema>;

/**
 * Type inféré pour un achievement validé
 */
export type ValidatedAchievement = z.infer<typeof AchievementSchema>;

/**
 * Type inféré pour un achievement à créer
 */
export type ValidatedCreateAchievement = z.infer<
  typeof CreateAchievementSchema
>;

/**
 * Type inféré pour la progression utilisateur validée
 */
export type ValidatedUserProgress = z.infer<typeof UserProgressSchema>;
