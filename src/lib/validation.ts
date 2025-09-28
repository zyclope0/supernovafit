import { z } from 'zod';

// Schémas de base
export const macrosSchema = z.object({
  kcal: z
    .number()
    .min(0, 'Les calories ne peuvent pas être négatives')
    .max(10000, 'Les calories semblent trop élevées (max 10000)')
    .finite('Les calories doivent être un nombre valide'),
  prot: z
    .number()
    .min(0, 'Les protéines ne peuvent pas être négatives')
    .max(1000, 'Les protéines semblent trop élevées (max 1000g)')
    .finite('Les protéines doivent être un nombre valide'),
  glucides: z
    .number()
    .min(0, 'Les glucides ne peuvent pas être négatives')
    .max(2000, 'Les glucides semblent trop élevés (max 2000g)')
    .finite('Les glucides doivent être un nombre valide'),
  lipides: z
    .number()
    .min(0, 'Les lipides ne peuvent pas être négatives')
    .max(500, 'Les lipides semblent trop élevés (max 500g)')
    .finite('Les lipides doivent être un nombre valide'),
});

export const alimentSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  nom: z
    .string()
    .min(1, 'Le nom de l&apos;aliment est requis')
    .max(100, 'Le nom est trop long (max 100 caractères)'),
  quantite: z
    .number()
    .min(0.1, "La quantité doit être d'au moins 0.1")
    .max(10000, 'La quantité semble trop élevée (max 10000)')
    .finite('La quantité doit être un nombre valide'),
  unite: z
    .string()
    .min(1, "L'unité est requise")
    .max(20, "L'unité est trop longue"),
  macros: macrosSchema,
  macros_base: macrosSchema.optional(),
});

// Validation repas
export const repasSchema = z.object({
  user_id: z.string().min(1, "L'utilisateur est requis"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .refine((date) => {
      const parsed = new Date(date);
      const today = new Date();
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 1); // Autorise jusqu'à demain
      const minDate = new Date('2020-01-01'); // Pas avant 2020
      return parsed >= minDate && parsed <= maxDate;
    }, 'La date doit être entre 2020 et demain'),
  repas: z.enum(
    [
      'petit_dej',
      'collation_matin',
      'dejeuner',
      'collation_apres_midi',
      'diner',
      'collation_soir',
    ],
    {
      errorMap: () => ({ message: 'Type de repas invalide' }),
    },
  ),
  aliments: z
    .array(alimentSchema)
    .min(1, 'Au moins un aliment est requis')
    .max(50, "Trop d'aliments dans un repas (max 50)"),
  macros: macrosSchema,
});

// Validation entraînement
export const entrainementSchema = z
  .object({
    user_id: z.string().min(1, "L'utilisateur est requis"),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
      .refine((date) => {
        const parsed = new Date(date);
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 1); // Autorise jusqu'à demain
        const minDate = new Date('2020-01-01'); // Pas avant 2020
        return parsed >= minDate && parsed <= maxDate;
      }, 'La date doit être entre 2020 et demain'),
    type: z.enum(
      [
        'cardio',
        'musculation',
        'course',
        'cyclisme',
        'natation',
        'hiit',
        'yoga',
      ],
      {
        errorMap: () => ({ message: "Type d'entraînement invalide" }),
      },
    ),
    duree: z
      .number()
      .min(1, "La durée doit être d'au moins 1 minute")
      .max(1440, 'La durée ne peut pas dépasser 24h (1440 min)')
      .int('La durée doit être un nombre entier de minutes'),
    calories: z
      .number()
      .min(0, 'Les calories ne peuvent pas être négatives')
      .max(10000, 'Les calories semblent trop élevées (max 10000)')
      .optional(),
    source: z.enum(['manuel', 'garmin', 'import'], {
      errorMap: () => ({ message: 'Source invalide' }),
    }),
    commentaire: z
      .string()
      .max(500, 'Le commentaire est trop long (max 500 caractères)')
      .optional(),

    // Données avancées Garmin (optionnelles)
    fc_moyenne: z
      .number()
      .min(30, 'FC moyenne trop basse (min 30 bpm)')
      .max(250, 'FC moyenne trop élevée (max 250 bpm)')
      .int('La FC doit être un nombre entier')
      .optional(),
    fc_max: z
      .number()
      .min(50, 'FC max trop basse (min 50 bpm)')
      .max(250, 'FC max trop élevée (max 250 bpm)')
      .int('La FC doit être un nombre entier')
      .optional(),
    fc_min: z
      .number()
      .min(30, 'FC min trop basse (min 30 bpm)')
      .max(200, 'FC min trop élevée (max 200 bpm)')
      .int('La FC doit être un nombre entier')
      .optional(),
    distance: z
      .number()
      .min(0, 'La distance ne peut pas être négative')
      .max(1000, 'La distance semble trop élevée (max 1000 km)')
      .optional(),
    vitesse_moy: z
      .number()
      .min(0, 'La vitesse ne peut pas être négative')
      .max(150, 'La vitesse semble trop élevée (max 150 km/h)')
      .optional(),
    vitesse_max: z
      .number()
      .min(0, 'La vitesse ne peut pas être négative')
      .max(200, 'La vitesse semble trop élevée (max 200 km/h)')
      .optional(),
    elevation_gain: z
      .number()
      .min(0, 'Le dénivelé ne peut pas être négatif')
      .max(10000, 'Le dénivelé semble trop élevé (max 10000m)')
      .int('Le dénivelé doit être un nombre entier')
      .optional(),
  })
  .refine(
    (data) => {
      // Validation croisée : FC min <= FC moyenne <= FC max
      if (data.fc_min && data.fc_moyenne && data.fc_min > data.fc_moyenne) {
        return false;
      }
      if (data.fc_moyenne && data.fc_max && data.fc_moyenne > data.fc_max) {
        return false;
      }
      if (data.fc_min && data.fc_max && data.fc_min > data.fc_max) {
        return false;
      }
      return true;
    },
    {
      message: 'FC min ≤ FC moyenne ≤ FC max',
      path: ['fc_moyenne'],
    },
  )
  .refine(
    (data) => {
      // Validation croisée : vitesse cohérente avec distance/durée
      if (data.distance && data.duree && data.vitesse_moy) {
        const vitesseCalculee = (data.distance * 60) / data.duree; // km/h
        const ecart =
          Math.abs(vitesseCalculee - data.vitesse_moy) / vitesseCalculee;
        if (ecart > 0.5) {
          // Écart > 50%
          return false;
        }
      }
      return true;
    },
    {
      message:
        'La vitesse moyenne semble incohérente avec la distance et la durée',
      path: ['vitesse_moy'],
    },
  );

// Validation mesures corporelles (pour future use)
export const mesureSchema = z.object({
  user_id: z.string().min(1, "L'utilisateur est requis"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
  poids: z
    .number()
    .min(20, 'Le poids semble trop faible (min 20kg)')
    .max(300, 'Le poids semble trop élevé (max 300kg)')
    .optional(),
  masse_grasse: z
    .number()
    .min(1, 'Le pourcentage de masse grasse semble trop faible')
    .max(60, 'Le pourcentage de masse grasse semble trop élevé')
    .optional(),
  tour_taille: z
    .number()
    .min(40, 'Le tour de taille semble trop faible')
    .max(200, 'Le tour de taille semble trop élevé')
    .optional(),
  tour_hanches: z
    .number()
    .min(50, 'Le tour de hanches semble trop faible')
    .max(200, 'Le tour de hanches semble trop élevé')
    .optional(),
});

// Types inférés pour TypeScript
// Types de validation supprimés - non utilisés

// Fonction helper pour formater les erreurs Zod
export function formatZodError(error: z.ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.length > 0 ? `${err.path.join('.')} : ` : '';
    return `${path}${err.message}`;
  });
}

// Fonction helper pour valider et retourner erreurs formatées
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: formatZodError(error) };
    }
    return { success: false, errors: ['Erreur de validation inconnue'] };
  }
}
