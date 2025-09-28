/**
 * Service de calcul automatique des calories brûlées
 * Basé sur les formules métaboliques standard et les données Garmin
 *
 * Références scientifiques :
 * - Compendium of Physical Activities 2024 (Herrmann et al., 2024)
 * - Formule standard : Calories = MET × Poids (kg) × Temps (heures)
 * - 1 MET = 3.5 ml O₂/kg/min (standard international)
 *
 * Note: Les MET peuvent être ajustés selon l'âge et le sexe pour plus de précision
 * en utilisant la formule Harris-Benedict pour calculer le RMR réel
 */

export interface CalorieCalculationData {
  type: string;
  duree: number; // minutes
  fc_moyenne?: number;
  fc_max_theorique?: number; // 220 - age
  distance?: number; // km
  vitesse_moy?: number; // km/h
  poids_utilisateur?: number; // kg
  age?: number;
  sexe?: 'M' | 'F';
}

// UserProfile supprimé - non utilisé (différent du UserProfile des types/index.ts)

/**
 * MET (Metabolic Equivalent of Task) par type d&apos;activité
 * Source: Compendium of Physical Activities 2024 Update
 * Valeurs validées pour adultes 19-59 ans
 * 82% des valeurs sont maintenant mesurées (vs estimées)
 */
const MET_VALUES = {
  // Cardio
  course: {
    base: 8.0, // course modérée 8 km/h
    vitesse_factor: 0.8, // +0.8 MET par km/h supplémentaire
    min: 6.0,
    max: 16.0,
  },
  cardio: {
    base: 6.0,
    fc_factor: true, // utilise FC pour ajuster
    min: 4.0,
    max: 12.0,
  },

  // Cyclisme
  cyclisme: {
    base: 7.5, // cyclisme modéré 16-19 km/h
    vitesse_factor: 0.5,
    min: 4.0,
    max: 16.0,
  },

  // Natation
  natation: {
    base: 10.0, // natation modérée
    min: 6.0,
    max: 14.0,
  },

  // Musculation
  musculation: {
    base: 6.0, // musculation générale
    intensite_factor: true,
    min: 3.0,
    max: 8.0,
  },

  // HIIT
  hiit: {
    base: 12.0, // HIIT intense
    min: 8.0,
    max: 16.0,
  },

  // Yoga
  yoga: {
    base: 3.0, // yoga hatha
    min: 2.0,
    max: 4.0,
  },

  // Autres
  autre: {
    base: 5.0,
    min: 2.0,
    max: 12.0,
  },
};

/**
 * Calcule la FC max théorique selon l'âge
 */
function calculateMaxHR(age: number): number {
  return Math.round(220 - age);
}

/**
 * Calcule le pourcentage de FC max
 */
function calculateHRPercentage(fc_moyenne: number, fc_max: number): number {
  return Math.min(100, Math.max(50, (fc_moyenne / fc_max) * 100));
}

/**
 * Ajuste le MET selon la fréquence cardiaque
 */
function adjustMETByHeartRate(baseMET: number, hrPercentage: number): number {
  // Zones d'intensité basées sur %FC max
  if (hrPercentage < 60) return baseMET * 0.5; // Zone 1: Récupération
  if (hrPercentage < 70) return baseMET * 0.7; // Zone 2: Aérobie légère
  if (hrPercentage < 80) return baseMET * 1.0; // Zone 3: Aérobie modérée
  if (hrPercentage < 90) return baseMET * 1.3; // Zone 4: Seuil anaérobie
  return baseMET * 1.6; // Zone 5: VO2 max
}

/**
 * Ajuste le MET selon la vitesse (course/cyclisme)
 */
function adjustMETBySpeed(
  baseMET: number,
  vitesse: number,
  type: string,
): number {
  const metData = MET_VALUES[type as keyof typeof MET_VALUES];
  if (!('vitesse_factor' in metData)) return baseMET;

  let vitesseRef = 8; // km/h pour course
  if (type === 'cyclisme') vitesseRef = 16;

  const speedDiff = Math.max(0, vitesse - vitesseRef);
  const adjustedMET =
    baseMET +
    speedDiff *
      (metData as unknown as { vitesse_factor: number }).vitesse_factor;

  return Math.min(metData.max, Math.max(metData.min, adjustedMET));
}

/**
 * Formule principale de calcul des calories
 * Calories = MET × Poids (kg) × Temps (heures)
 */
function calculateCalories(data: CalorieCalculationData): number {
  const {
    type,
    duree,
    fc_moyenne,
    distance,
    vitesse_moy,
    poids_utilisateur = 70,
    age = 30,
    sexe = 'M',
  } = data;

  // 1. Récupérer le MET de base pour l'activité
  const metData = MET_VALUES[type as keyof typeof MET_VALUES];
  if (!metData) {
    // Type non reconnu, utiliser "autre"
    return calculateCalories({ ...data, type: 'autre' });
  }

  let met = metData.base;

  // 2. Ajustements selon les données disponibles

  // Ajustement par fréquence cardiaque
  if (fc_moyenne && age) {
    const fcMax = calculateMaxHR(age);
    const hrPercentage = calculateHRPercentage(fc_moyenne, fcMax);
    if (
      (metData as unknown as { fc_factor?: boolean }).fc_factor ||
      type === 'cardio'
    ) {
      met = adjustMETByHeartRate(met, hrPercentage);
    }
  }

  // Ajustement par vitesse (priorité à vitesse_moy si fournie)
  const vitesse =
    vitesse_moy || (distance && duree > 0 ? (distance * 60) / duree : 0);
  if (vitesse > 0 && (type === 'course' || type === 'cyclisme')) {
    met = adjustMETBySpeed(met, vitesse, type);
  }

  // 3. Facteur sexe (femmes brûlent ~10% moins en moyenne)
  // Basé sur les différences de masse musculaire et métabolisme de base
  const genderFactor = sexe === 'F' ? 0.9 : 1.0;

  // 4. Calcul final
  const tempsHeures = duree / 60;
  const calories = met * poids_utilisateur * tempsHeures * genderFactor;

  return Math.round(calories);
}

// Fonction calculateCaloriesByRPE supprimée - non utilisée

/**
 * Propose un calcul de calories intelligent
 * Combine plusieurs méthodes selon les données disponibles
 */
export function smartCalorieCalculation(data: CalorieCalculationData): {
  calories: number;
  method: string;
  confidence: 'high' | 'medium' | 'low';
} {
  const { fc_moyenne, distance, vitesse_moy, duree, age, type } = data;

  // Méthode 1: FC + Type + Durée (haute confiance)
  if (fc_moyenne && age && duree) {
    return {
      calories: calculateCalories(data),
      method: 'FC + MET + Durée',
      confidence: 'high',
    };
  }

  // Méthode 2: Vitesse/Distance + Type + Durée (confiance moyenne)
  if (
    (vitesse_moy || distance) &&
    duree &&
    (type === 'course' || type === 'cyclisme')
  ) {
    return {
      calories: calculateCalories(data),
      method: 'Vitesse + MET + Durée',
      confidence: 'medium',
    };
  }

  // Méthode 3: Type + Durée seulement (confiance faible)
  return {
    calories: calculateCalories(data),
    method: 'MET + Durée (estimation)',
    confidence: 'low',
  };
}

/**
 * Retourne des estimations rapides pour l'UI
 */
export function getQuickCalorieEstimate(
  type: string,
  duree: number,
  poids?: number,
): number {
  const metData = MET_VALUES[type as keyof typeof MET_VALUES];
  if (!metData) return 0;

  const poidsUtilise = poids || 70; // kg - fallback si pas fourni
  const tempsHeures = duree / 60;
  return Math.round(metData.base * poidsUtilise * tempsHeures);
}
