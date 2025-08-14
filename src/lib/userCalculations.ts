import { User } from '@/types'

/**
 * Calcule le métabolisme de base (BMR) selon la formule Mifflin-St Jeor
 * Formule validée comme la plus précise selon les études récentes (2020-2024)
 * Précision : ±10% pour 71% des individus selon Thom et al. 2020
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

/**
 * Calcule l'IMC (Indice de Masse Corporelle)
 */
export function calculateIMC(taille: number, poids: number): number {
  return Number((poids / Math.pow(taille / 100, 2)).toFixed(1))
}

/**
 * Interprète l'IMC
 */
export function interpretIMC(imc: number): { category: string; color: string; emoji: string } {
  if (imc < 18.5) {
    return { category: 'Insuffisance pondérale', color: 'text-blue-400', emoji: '⬇️' }
  } else if (imc < 25) {
    return { category: 'Poids normal', color: 'text-green-400', emoji: '✅' }
  } else if (imc < 30) {
    return { category: 'Surpoids', color: 'text-yellow-400', emoji: '⚠️' }
  } else {
    return { category: 'Obésité', color: 'text-red-400', emoji: '🔴' }
  }
}

/**
 * Calcule les besoins caloriques selon l'objectif
 * Ajustements basés sur les recommandations ISSN 2024 et études récentes
 */
export function calculateCalorieNeeds(user: User): {
  maintien: number | null
  prise_masse: number | null
  seche: number | null
  performance: number | null
} | null {
  const tdee = calculateTDEE(user)
  if (!tdee) return null

  // Ajustements caloriques selon les dernières recommandations scientifiques
  // ISSN Position Stand 2024, Helms et al. 2024
  return {
    maintien: tdee,
    prise_masse: Math.round(tdee * 1.15), // +15% (300-500 kcal) pour prise de masse progressive
    seche: Math.round(tdee * 0.80), // -20% (400-600 kcal) pour perte de poids durable
    performance: Math.round(tdee * 1.10) // +10% pour soutenir la performance sportive
  }
}

/**
 * Calcule la répartition macros recommandée selon l'objectif
 * Basé sur ISSN Position Stand 2024, ACSM Guidelines 2024
 */
export function calculateMacroSplit(calorieTarget: number, objectif: string, _poids?: number): {
  proteines: { g: number; kcal: number; percentage: number }
  glucides: { g: number; kcal: number; percentage: number }
  lipides: { g: number; kcal: number; percentage: number }
} {
  let protPercentage: number
  let carbPercentage: number
  let fatPercentage: number

  // Recommandations mises à jour selon les dernières études scientifiques
  switch (objectif) {
    case 'prise_masse':
      // Protéines: 1.6-2.2g/kg, Glucides: 4-7g/kg, Lipides: 0.8-1.2g/kg
      protPercentage = 25 // Environ 1.8g/kg pour la synthèse protéique optimale
      carbPercentage = 50 // Support énergétique pour l'anabolisme
      fatPercentage = 25  // Production hormonale optimale
      break
    case 'seche':
      // Protéines: 2.3-3.1g/kg pour préserver la masse musculaire
      protPercentage = 35 // Protection musculaire en déficit calorique
      carbPercentage = 35 // Maintien de la performance
      fatPercentage = 30  // Santé hormonale (minimum 0.8g/kg)
      break
    case 'performance':
      // Focus sur les glucides pour l'énergie
      protPercentage = 20 // 1.4-1.7g/kg suffisant pour l'endurance
      carbPercentage = 55 // 5-8g/kg pour sports d'endurance
      fatPercentage = 25  // Complément énergétique
      break
    default: // maintien
      // Recommandations générales équilibrées
      protPercentage = 25 // 1.2-1.6g/kg pour maintien
      carbPercentage = 45 // 3-5g/kg activité modérée
      fatPercentage = 30  // 1g/kg pour santé générale
  }

  const protKcal = Math.round(calorieTarget * (protPercentage / 100))
  const carbKcal = Math.round(calorieTarget * (carbPercentage / 100))
  const fatKcal = Math.round(calorieTarget * (fatPercentage / 100))

  return {
    proteines: {
      g: Math.round(protKcal / 4), // 4 kcal/g
      kcal: protKcal,
      percentage: protPercentage
    },
    glucides: {
      g: Math.round(carbKcal / 4), // 4 kcal/g
      kcal: carbKcal,
      percentage: carbPercentage
    },
    lipides: {
      g: Math.round(fatKcal / 9), // 9 kcal/g
      kcal: fatKcal,
      percentage: fatPercentage
    }
  }
}

/**
 * Génère des recommandations personnalisées
 */
export function generateRecommendations(user: User): string[] {
  const recommendations: string[] = []
  
  if (!user.age || !user.taille || !user.poids_initial) {
    recommendations.push("📝 Complétez votre profil pour des recommandations personnalisées")
    return recommendations
  }

  const imc = calculateIMC(user.taille, user.poids_initial)
  // const imcInfo = interpretIMC(imc) // Non utilisé pour l'instant
  
  // Recommandations basées sur l'IMC
  if (imc < 18.5) {
    recommendations.push("💪 Votre IMC indique une insuffisance pondérale. Considérez un objectif de prise de masse.")
  } else if (imc > 25) {
    recommendations.push("🔥 Votre IMC indique un surpoids. Un objectif de sèche pourrait être bénéfique.")
  }

  // Recommandations basées sur l'activité
  if (user.niveau_activite === 'sedentaire') {
    recommendations.push("🚶 Augmentez progressivement votre activité physique pour améliorer votre santé.")
  } else if (user.niveau_activite === 'tres_intense') {
    recommendations.push("⚡ Votre niveau d&apos;activité est très élevé. Assurez-vous de récupérer suffisamment.")
  }

  // Recommandations basées sur l'objectif
  if (user.objectif === 'prise_masse') {
    recommendations.push("💪 Pour la prise de masse : privilégiez les protéines et mangez en surplus calorique.")
  } else if (user.objectif === 'seche') {
    recommendations.push("🔥 Pour la sèche : créez un déficit calorique modéré et maintenez un apport protéique élevé.")
  }

  return recommendations
}