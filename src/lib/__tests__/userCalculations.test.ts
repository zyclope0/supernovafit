/**
 * Tests pour userCalculations
 * Tests critiques pour les calculs métier utilisateur
 */

import { describe, it, expect } from 'vitest'
import { calculateBMR } from '../userCalculations'
import { User } from '@/types'

describe('userCalculations', () => {
  describe('calculateBMR', () => {
    it('devrait calculer le BMR pour un homme', () => {
      const user: Partial<User> = {
        sexe: 'M',
        age: 30,
        poids_initial: 80,
        taille: 180
      }
      const result = calculateBMR(user as User)

      // Formule Mifflin-St Jeor pour homme: (10 × poids) + (6.25 × taille) - (5 × âge) + 5
      const expected = Math.round((10 * 80) + (6.25 * 180) - (5 * 30) + 5)
      expect(result).toBe(expected)
      expect(result).toBe(1780) // Valeur réelle calculée
    })

    it('devrait calculer le BMR pour une femme', () => {
      const user: Partial<User> = {
        sexe: 'F',
        age: 25,
        poids_initial: 65,
        taille: 165
      }
      const result = calculateBMR(user as User)

      // Formule Mifflin-St Jeor pour femme: (10 × poids) + (6.25 × taille) - (5 × âge) - 161
      const expected = Math.round((10 * 65) + (6.25 * 165) - (5 * 25) - 161)
      expect(result).toBe(expected)
      expect(result).toBe(1395) // Valeur réelle calculée
    })

    it('devrait gérer les valeurs limites', () => {
      // Âge minimum
      const youngUser: Partial<User> = {
        sexe: 'M',
        age: 18,
        poids_initial: 70,
        taille: 175
      }
      const youngResult = calculateBMR(youngUser as User)
      expect(youngResult).toBeGreaterThan(0)

      // Âge élevé
      const oldUser: Partial<User> = {
        sexe: 'F',
        age: 80,
        poids_initial: 60,
        taille: 160
      }
      const oldResult = calculateBMR(oldUser as User)
      expect(oldResult).toBeGreaterThan(0)
      expect(oldResult!).toBeLessThan(youngResult!)
    })

    it('devrait gérer les poids extrêmes', () => {
      // Poids faible
      const lightUser: Partial<User> = {
        sexe: 'F',
        age: 30,
        poids_initial: 45,
        taille: 160
      }
      const lightResult = calculateBMR(lightUser as User)
      expect(lightResult).toBeGreaterThan(0)

      // Poids élevé
      const heavyUser: Partial<User> = {
        sexe: 'M',
        age: 30,
        poids_initial: 120,
        taille: 180
      }
      const heavyResult = calculateBMR(heavyUser as User)
      expect(heavyResult!).toBeGreaterThan(lightResult!)
    })

    it('devrait gérer les tailles extrêmes', () => {
      // Taille faible
      const shortUser: Partial<User> = {
        sexe: 'M',
        age: 30,
        poids_initial: 70,
        taille: 150
      }
      const shortResult = calculateBMR(shortUser as User)
      expect(shortResult).toBeGreaterThan(0)

      // Taille élevée
      const tallUser: Partial<User> = {
        sexe: 'M',
        age: 30,
        poids_initial: 70,
        taille: 200
      }
      const tallResult = calculateBMR(tallUser as User)
      expect(tallResult!).toBeGreaterThan(shortResult!)
    })

    it('devrait retourner des nombres cohérents', () => {
      const user: Partial<User> = {
        sexe: 'M',
        age: 30,
        poids_initial: 80,
        taille: 180
      }
      const result = calculateBMR(user as User)

      expect(typeof result).toBe('number')
      expect(Number.isFinite(result)).toBe(true)
      expect(result!).toBeGreaterThan(1000) // BMR minimum réaliste
      expect(result!).toBeLessThan(3000) // BMR maximum réaliste
    })

    it('devrait différencier hommes et femmes', () => {
      const maleUser: Partial<User> = {
        sexe: 'M',
        age: 30,
        poids_initial: 70,
        taille: 170
      }

      const femaleUser: Partial<User> = {
        sexe: 'F',
        age: 30,
        poids_initial: 70,
        taille: 170
      }

      const maleBMR = calculateBMR(maleUser as User)
      const femaleBMR = calculateBMR(femaleUser as User)

      // Le BMR des hommes devrait être plus élevé
      expect(maleBMR!).toBeGreaterThan(femaleBMR!)
      expect(maleBMR! - femaleBMR!).toBe(166) // Différence de 5 + 161 = 166
    })
  })
})
