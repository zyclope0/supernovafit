import { renderHook } from '@testing-library/react'
import { useEnergyBalance } from '../useEnergyBalance'
import { User, Repas, Entrainement } from '@/types'

// Mock user profile
const mockUser: User = {
  id: 'test-user',
  nom: 'Test User',
  email: 'test@example.com',
  age: 30,
  sexe: 'M',
  taille: 180,
  poids_initial: 80,
  niveau_activite: 'modere'
}

// Mock data
const mockRepas: Repas[] = [
  {
    id: '1',
    user_id: 'test-user',
    date: '2025-09-21',
    repas: 'dejeuner',
    aliments: [],
    macros: { kcal: 500, prot: 30, glucides: 40, lipides: 20 }
  },
  {
    id: '2',
    user_id: 'test-user',
    date: '2025-09-21',
    repas: 'diner',
    aliments: [],
    macros: { kcal: 600, prot: 35, glucides: 50, lipides: 25 }
  }
]

const mockEntrainements: Entrainement[] = [
  {
    id: '1',
    user_id: 'test-user',
    date: '2025-09-21',
    type: 'musculation',
    duree: 60,
    calories: 400,
    intensite: 'modere'
  },
  {
    id: '2',
    user_id: 'test-user',
    date: '2025-09-21',
    type: 'cardio',
    duree: 30,
    calories: 300,
    intensite: 'intense'
  }
]

describe('useEnergyBalance', () => {
  it('should calculate energy balance correctly', () => {
    const { result } = renderHook(() =>
      useEnergyBalance({
        userProfile: mockUser,
        repas: mockRepas,
        entrainements: mockEntrainements,
        periodDays: 1
      })
    )

    const energyData = result.current

    // Test basic calculations
    expect(energyData.periodStats.calories).toBe(1100) // 500 + 600
    expect(energyData.periodStats.proteins).toBe(65) // 30 + 35
    expect(energyData.rawSportCalories).toBe(700) // 400 + 300
    expect(energyData.avgDailySportCalories).toBe(700) // 700 / 1 day

    // Test TDEE calculations
    expect(energyData.baseTDEE).toBeGreaterThan(0)
    expect(energyData.adjustedTDEE).toBeGreaterThan(energyData.baseTDEE)

    // Test sport correction (modere = 0.5 factor)
    expect(energyData.correctionFactor).toBe(0.5)
    expect(energyData.adjustedSportCalories).toBe(350) // 700 * 0.5

    // Test adjusted trainings
    expect(energyData.adjustedTrainings).toHaveLength(2)
    expect(energyData.adjustedTrainings[0].calories).toBe(200) // 400 * 0.5
    expect(energyData.adjustedTrainings[1].calories).toBe(150) // 300 * 0.5

    // Test energy balance
    expect(energyData.energyBalance).toBe(energyData.periodStats.calories - energyData.adjustedTDEE)
    expect(energyData.isDeficit).toBe(energyData.energyBalance < 0)
  })

  it('should handle missing user profile', () => {
    const { result } = renderHook(() =>
      useEnergyBalance({
        userProfile: null,
        repas: mockRepas,
        entrainements: mockEntrainements,
        periodDays: 1
      })
    )

    const energyData = result.current

    // Should use defaults
    expect(energyData.baseTDEE).toBe(2000)
    expect(energyData.adjustedTDEE).toBe(2000)
    expect(energyData.correctionFactor).toBe(0.7) // default
  })

  it('should handle multi-day periods correctly', () => {
    const { result } = renderHook(() =>
      useEnergyBalance({
        userProfile: mockUser,
        repas: mockRepas,
        entrainements: mockEntrainements,
        periodDays: 7 // Week
      })
    )

    const energyData = result.current

    // Average daily sport calories should be divided by period days
    expect(energyData.avgDailySportCalories).toBe(100) // 700 / 7 days
  })

  it('should handle empty data', () => {
    const { result } = renderHook(() =>
      useEnergyBalance({
        userProfile: mockUser,
        repas: [],
        entrainements: [],
        periodDays: 1
      })
    )

    const energyData = result.current

    expect(energyData.periodStats.calories).toBe(0)
    expect(energyData.rawSportCalories).toBe(0)
    expect(energyData.adjustedSportCalories).toBe(0)
    expect(energyData.adjustedTrainings).toHaveLength(0)
  })
})
