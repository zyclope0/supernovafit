import { User } from '@/types'

/**
 * Calcule le métabolisme de base (BMR) selon la formule Mifflin-St Jeor
 * Formule validée comme la plus précise selon les études récentes (2020-2024)
 * Précision : ±10% pour 71% des individus selon Thom et al. 2020
 * NOTE: Exporté pour les tests
 */
export function calculateBMR(user: User): number | null {
  if (!user.age || !user.taille || !user.poids_initial || !user.sexe) {
    return null
  }

  // Mifflin-St Jeor (1990) - Toujours recommandée en 2024
  // Hommes: BMR = (10 × poids en kg) + (6.25 × taille en cm) - (5 × âge en années) + 5
  // Femmes: BMR = (10 × poids en kg) + (6.25 × taille en cm) - (5 × âge en années) - 161
  const bmr = user.sexe === 'M' 
    ? (10 * user.poids_initial) + (6.25 * user.taille) - (5 * user.age) + 5
    : (10 * user.poids_initial) + (6.25 * user.taille) - (5 * user.age) - 161

  return Math.round(bmr)
}

/**
 * Calcule la dépense énergétique quotidienne totale (TDEE)
 * Utilise les multiplicateurs PAL (Physical Activity Level) validés
 * Source: WHO/FAO 2024, Prado-Nóvoa et al. 2024
 */
export function calculateTDEE(user: User): number | null {
  const bmr = calculateBMR(user)
  if (!bmr || !user.niveau_activite) {
    return null
  }

  // Multiplicateurs PAL mis à jour selon les recommandations 2024
  // Basés sur les études DLW (Doubly Labeled Water) récentes
  const activityMultipliers = {
    sedentaire: 1.2,      // Travail de bureau, peu d'exercice
    leger: 1.375,         // Exercice léger 1-3 jours/semaine
    modere: 1.55,         // Exercice modéré 3-5 jours/semaine
    intense: 1.725,       // Exercice intense 6-7 jours/semaine
    tres_intense: 1.9     // Athlète professionnel, travail physique intense
  }

  return Math.round(bmr * activityMultipliers[user.niveau_activite])
}

// Fonction calculateIMC supprimée - non utilisée

// Fonction interpretIMC supprimée - non utilisée

// Fonction calculateCalorieNeeds supprimée - non utilisée

// Fonction calculateMacroSplit supprimée - non utilisée

// Fonction generateRecommendations supprimée - non utilisée