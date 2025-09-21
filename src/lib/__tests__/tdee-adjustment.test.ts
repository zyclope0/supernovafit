import { describe, it, expect } from 'vitest'
import { getSportCorrectionFactor, calculateAdjustedTDEE, calculateTDEE } from '../userCalculations'
import type { User } from '@/types'

describe('TDEE Sport Adjustment', () => {
  const mockUser: User = {
    id: 'test',
    nom: 'Test User',
    email: 'test@test.com',
    age: 30,
    sexe: 'M',
    taille: 175,
    poids_initial: 70,
    niveau_activite: 'modere',
    objectif: 'maintien',
    role: 'sportif'
  }

  describe('getSportCorrectionFactor', () => {
    it('should return correct factors for each activity level', () => {
      expect(getSportCorrectionFactor('sedentaire')).toBe(0.9)
      expect(getSportCorrectionFactor('leger')).toBe(0.7)
      expect(getSportCorrectionFactor('modere')).toBe(0.5)
      expect(getSportCorrectionFactor('intense')).toBe(0.3)
      expect(getSportCorrectionFactor('tres_intense')).toBe(0.1)
      expect(getSportCorrectionFactor('unknown')).toBe(0.7) // default
    })
  })

  describe('calculateAdjustedTDEE', () => {
    it('should calculate correct adjusted TDEE for moderate user', () => {
      const sportCalories = 500 // Course 1h
      const baseTDEE = calculateTDEE(mockUser) // Calculer la vraie valeur
      const adjustedTDEE = calculateAdjustedTDEE(mockUser, sportCalories)
      
      expect(adjustedTDEE).toBeGreaterThan(baseTDEE!) // Plus que TDEE de base
      expect(adjustedTDEE).toBeLessThan(baseTDEE! + sportCalories) // Moins que TDEE + sport complet
      
      // Correction : 500 * 0.5 = 250 kcal bonus
      const expectedAdjusted = baseTDEE! + Math.round(sportCalories * 0.5)
      expect(adjustedTDEE).toBe(expectedAdjusted)
    })

    it('should add high sport bonus for sedentary user', () => {
      const sedentaryUser = { ...mockUser, niveau_activite: 'sedentaire' }
      const sportCalories = 600
      const baseTDEE = calculateTDEE(sedentaryUser)
      const adjustedTDEE = calculateAdjustedTDEE(sedentaryUser, sportCalories)
      
      // Sédentaire : 90% du sport compte (600 * 0.9 = 540)
      const expectedAdjusted = baseTDEE! + Math.round(sportCalories * 0.9)
      expect(adjustedTDEE).toBe(expectedAdjusted)
    })

    it('should add minimal bonus for very intense user', () => {
      const intenseUser = { ...mockUser, niveau_activite: 'tres_intense' }
      const sportCalories = 800
      const baseTDEE = calculateTDEE(intenseUser)
      const adjustedTDEE = calculateAdjustedTDEE(intenseUser, sportCalories)
      
      // Très intense : 10% du sport compte (800 * 0.1 = 80)
      const expectedAdjusted = baseTDEE! + Math.round(sportCalories * 0.1)
      expect(adjustedTDEE).toBe(expectedAdjusted)
    })
  })
})
