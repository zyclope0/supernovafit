import { useMemo } from 'react'
import { User, Repas, Entrainement } from '@/types'
import { calculateTDEE, calculateAdjustedTDEE, getSportCorrectionFactor } from '@/lib/userCalculations'

export interface EnergyBalanceData {
  // TDEE
  baseTDEE: number
  adjustedTDEE: number
  correctionFactor: number
  
  // Calories sport
  rawSportCalories: number
  adjustedSportCalories: number
  avgDailySportCalories: number
  
  // Entraînements pondérés (pour graphiques)
  adjustedTrainings: Entrainement[]
  
  // Stats période
  periodStats: {
    calories: number
    proteins: number
    carbs: number
    fats: number
  }
  
  // Bilan énergétique
  energyBalance: number
  isDeficit: boolean
}

interface UseEnergyBalanceParams {
  userProfile: User | null
  repas: Repas[]
  entrainements: Entrainement[]
  periodDays: number
}

/**
 * Hook centralisé pour tous les calculs énergétiques
 * Garantit la cohérence des calculs TDEE + sport à travers l'app
 */
export function useEnergyBalance({
  userProfile,
  repas,
  entrainements,
  periodDays
}: UseEnergyBalanceParams): EnergyBalanceData {
  
  return useMemo(() => {
    // TDEE de base
    const baseTDEE = userProfile ? calculateTDEE(userProfile) : 2000
    
    // Calories sport brutes
    const rawSportCalories = entrainements.reduce((total, t) => total + (t.calories || 0), 0)
    const avgDailySportCalories = rawSportCalories / periodDays
    
    // Facteur de correction
    const correctionFactor = userProfile ? getSportCorrectionFactor(userProfile.niveau_activite) : 0.7
    
    // TDEE ajusté (avec pondération)
    const adjustedTDEE = userProfile ? calculateAdjustedTDEE(userProfile, avgDailySportCalories) : baseTDEE
    
    // Calories sport pondérées
    const adjustedSportCalories = Math.round(rawSportCalories * correctionFactor)
    
    // Entraînements avec calories pondérées (pour graphiques)
    const adjustedTrainings: Entrainement[] = entrainements.map(training => ({
      ...training,
      calories: Math.round((training.calories || 0) * correctionFactor)
    }))
    
    // Stats nutrition période
    const periodStats = repas.reduce((total, meal) => ({
      calories: total.calories + (meal.macros?.kcal || 0),
      proteins: total.proteins + (meal.macros?.prot || 0),
      carbs: total.carbs + (meal.macros?.glucides || 0),
      fats: total.fats + (meal.macros?.lipides || 0),
    }), { calories: 0, proteins: 0, carbs: 0, fats: 0 })
    
    // Bilan énergétique
    const energyBalance = periodStats.calories - adjustedTDEE
    const isDeficit = energyBalance < 0
    
    return {
      baseTDEE: baseTDEE || 2000,
      adjustedTDEE,
      correctionFactor,
      rawSportCalories,
      adjustedSportCalories,
      avgDailySportCalories,
      adjustedTrainings,
      periodStats,
      energyBalance,
      isDeficit
    }
  }, [userProfile, repas, entrainements, periodDays])
}
