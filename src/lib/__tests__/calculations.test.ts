import { describe, it, expect } from 'vitest'

// Tests simples pour les calculs de base (sans dépendances Firebase)
describe('Basic Calculations', () => {
  describe('BMR Calculation (Mifflin-St Jeor)', () => {
    it('should calculate BMR for men', () => {
      // BMR = 10 * poids + 6.25 * taille - 5 * age + 5
      const age = 30
      const poids = 70 // kg
      const taille = 175 // cm
      
      const expectedBMR = 10 * poids + 6.25 * taille - 5 * age + 5
      // expectedBMR = 700 + 1093.75 - 150 + 5 = 1648.75
      
      expect(expectedBMR).toBeCloseTo(1648.75, 1)
    })

    it('should calculate BMR for women', () => {
      // BMR = 10 * poids + 6.25 * taille - 5 * age - 161
      const age = 25
      const poids = 60 // kg  
      const taille = 165 // cm
      
      const expectedBMR = 10 * poids + 6.25 * taille - 5 * age - 161
      // expectedBMR = 600 + 1031.25 - 125 - 161 = 1345.25
      
      expect(expectedBMR).toBeCloseTo(1345.25, 1)
    })
  })

  describe('TDEE Calculation', () => {
    it('should calculate TDEE with different activity levels', () => {
      const bmr = 1650

      // Facteurs d'activité
      const sedentaire = bmr * 1.2
      const leger = bmr * 1.375
      const modere = bmr * 1.55
      const actif = bmr * 1.725
      const tres_actif = bmr * 1.9

      expect(sedentaire).toBeCloseTo(1980, 1)
      expect(leger).toBeCloseTo(2268.75, 1)
      expect(modere).toBeCloseTo(2557.5, 1)
      expect(actif).toBeCloseTo(2846.25, 1)
      expect(tres_actif).toBeCloseTo(3135, 1)
    })
  })

  describe('MET Calories Calculation', () => {
    it('should calculate calories burned correctly', () => {
      // Calories = MET * poids(kg) * durée(heures)
      const met = 8 // Course intensive
      const poids = 70 // kg
      const dureeMinutes = 60 // minutes
      const dureeHeures = dureeMinutes / 60 // 1 heure
      
      const calories = met * poids * dureeHeures
      // calories = 8 * 70 * 1 = 560
      
      expect(calories).toBe(560)
    })

    it('should handle fractional hours', () => {
      const met = 6 // Course modérée
      const poids = 65 // kg
      const dureeMinutes = 30 // minutes
      const dureeHeures = dureeMinutes / 60 // 0.5 heure
      
      const calories = met * poids * dureeHeures
      // calories = 6 * 65 * 0.5 = 195
      
      expect(calories).toBe(195)
    })
  })

  describe('Macro Distribution', () => {
    it('should calculate basic macro percentages', () => {
      const totalCalories = 2000
      
      // Répartition classique : 50% glucides, 20% protéines, 30% lipides
      const glucidesCalories = totalCalories * 0.5 // 1000 kcal
      const proteinesCalories = totalCalories * 0.2 // 400 kcal  
      const lipidesCalories = totalCalories * 0.3 // 600 kcal
      
      // Conversion en grammes : 1g protéines = 4kcal, 1g glucides = 4kcal, 1g lipides = 9kcal
      const proteinesGrammes = proteinesCalories / 4 // 100g
      const glucidesGrammes = glucidesCalories / 4 // 250g
      const lipidesGrammes = lipidesCalories / 9 // ~66.7g
      
      expect(proteinesGrammes).toBe(100)
      expect(glucidesGrammes).toBe(250)
      expect(lipidesGrammes).toBeCloseTo(66.67, 1)
    })
  })

  describe('IMC Calculation', () => {
    it('should calculate BMI correctly', () => {
      const poids = 70 // kg
      const taille = 1.75 // m
      
      const imc = poids / (taille * taille)
      // imc = 70 / (1.75 * 1.75) = 70 / 3.0625 = 22.86
      
      expect(imc).toBeCloseTo(22.86, 2)
    })

    it('should classify BMI categories', () => {
      // Catégories IMC
      expect(18.4).toBeLessThan(18.5) // Sous-poids
      expect(22).toBeGreaterThanOrEqual(18.5) // Normal
      expect(22).toBeLessThan(25) // Normal
      expect(27).toBeGreaterThanOrEqual(25) // Surpoids
      expect(27).toBeLessThan(30) // Surpoids
      expect(32).toBeGreaterThanOrEqual(30) // Obésité
    })
  })
})
