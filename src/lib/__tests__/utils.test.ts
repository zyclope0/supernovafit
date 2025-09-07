/**
 * Tests pour utils.ts
 * Tests complets des fonctions utilitaires SuperNovaFit
 */

import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatNumber, getMealName, generateId } from '../utils'

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('devrait combiner les classes correctement', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('devrait gérer les classes conditionnelles', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('devrait déduplicuer les classes Tailwind', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2') // Tailwind merge
    })

    it('devrait gérer les valeurs nulles et undefined', () => {
      expect(cn('base', null, undefined, 'end')).toBe('base end')
    })
  })

  describe('formatDate', () => {
    it('devrait formater une date en français', () => {
      const date = new Date('2025-01-14T10:00:00Z')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/14\/01\/2025/)
    })

    it('devrait formater une string date', () => {
      const formatted = formatDate('2025-01-14')
      expect(formatted).toMatch(/14\/01\/2025/)
    })

    it('devrait gérer différents formats de date', () => {
      const dates = [
        '2025-12-25',
        '2025-01-01',
        '2025-06-15'
      ]
      
      dates.forEach(dateStr => {
        const formatted = formatDate(dateStr)
        expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      })
    })
  })

  describe('formatNumber', () => {
    it('devrait formater les nombres avec des espaces', () => {
      expect(formatNumber(1234)).toBe('1 234')
      expect(formatNumber(1234567)).toBe('1 234 567')
      expect(formatNumber(123)).toBe('123') // Pas d'espace pour < 1000
    })

    it('devrait gérer les nombres négatifs', () => {
      expect(formatNumber(-1234)).toBe('-1 234')
    })

    it('devrait gérer zéro et les petits nombres', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(42)).toBe('42')
      expect(formatNumber(999)).toBe('999')
    })
  })

  describe('getMealName', () => {
    it('devrait retourner les noms de repas corrects', () => {
      expect(getMealName('petit_dej')).toBe('Petit-déjeuner')
      expect(getMealName('dejeuner')).toBe('Déjeuner')
      expect(getMealName('diner')).toBe('Dîner')
      expect(getMealName('collation_matin')).toBe('Collation matin')
      expect(getMealName('collation_apres_midi')).toBe('Collation après-midi')
      expect(getMealName('collation_soir')).toBe('Collation soir')
    })

    it('devrait retourner la valeur originale pour les types inconnus', () => {
      expect(getMealName('unknown_meal')).toBe('unknown_meal')
      expect(getMealName('')).toBe('')
    })

    it('devrait gérer les cas non trouvés', () => {
      expect(getMealName('PETIT_DEJ')).toBe('PETIT_DEJ') // Fallback car pas exact match
      expect(getMealName('petit_dej')).toBe('Petit-déjeuner') // Exact match
      expect(getMealName('invalid')).toBe('invalid') // Fallback
    })
  })

  describe('generateId', () => {
    it('devrait générer des IDs uniques', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
    })

    it('devrait générer des IDs avec le bon format', () => {
      const id = generateId()
      
      // Format: timestamp-randomString
      expect(id).toMatch(/^\d+-[a-z0-9]+$/)
      expect(id.split('-')).toHaveLength(2)
    })

    it('devrait générer des IDs avec timestamp croissant', async () => {
      const id1 = generateId()
      // Petit délai pour s'assurer que le timestamp change
      await new Promise(resolve => setTimeout(resolve, 1))
      const id2 = generateId()
      
      const timestamp1 = parseInt(id1.split('-')[0])
      const timestamp2 = parseInt(id2.split('-')[0])
      
      expect(timestamp2).toBeGreaterThanOrEqual(timestamp1)
    })

    it('devrait générer des IDs avec partie aléatoire différente', () => {
      const ids = Array.from({ length: 10 }, () => generateId())
      const randomParts = ids.map(id => id.split('-')[1])
      
      // Vérifier qu'au moins quelques parties aléatoires sont différentes
      const uniqueRandomParts = new Set(randomParts)
      expect(uniqueRandomParts.size).toBeGreaterThan(5)
    })
  })
})

