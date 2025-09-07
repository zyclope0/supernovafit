/**
 * Tests pour inviteUtils
 * Tests simples pour les utilitaires d'invitations
 */

import { describe, it, expect } from 'vitest'
import { 
  generateInviteCode,
  calculateExpirationDate,
  validateInviteCode
} from '../inviteUtils'

describe('inviteUtils', () => {
  describe('generateInviteCode', () => {
    it('devrait générer un code d\'invitation', () => {
      const code = generateInviteCode()
      expect(code).toBeDefined()
      expect(typeof code).toBe('string')
      expect(code.length).toBeGreaterThan(0)
    })

    it('devrait générer des codes différents à chaque appel', () => {
      const code1 = generateInviteCode()
      const code2 = generateInviteCode()
      expect(code1).not.toBe(code2)
    })

    it('devrait générer un code avec le bon format', () => {
      const code = generateInviteCode()
      // Le code devrait contenir des caractères alphanumériques et des tirets
      expect(code).toMatch(/^[A-Z0-9-]+$/)
    })
  })

  describe('calculateExpirationDate', () => {
    it('devrait calculer une date d\'expiration', () => {
      const expirationDate = calculateExpirationDate()
      expect(expirationDate).toBeInstanceOf(Date)
      expect(expirationDate.getTime()).toBeGreaterThan(Date.now())
    })

    it('devrait calculer une date d\'expiration (72h)', () => {
      const expirationDate = calculateExpirationDate()
      const expectedTime = Date.now() + (72 * 60 * 60 * 1000)
      
      // Tolérance de 1 seconde pour les différences de timing
      expect(Math.abs(expirationDate.getTime() - expectedTime)).toBeLessThan(1000)
    })

    it('devrait utiliser 72 heures par défaut', () => {
      const defaultExpiration = calculateExpirationDate()
      const secondExpiration = calculateExpirationDate()
      
      // Les deux devraient être similaires (à quelques millisecondes près)
      expect(Math.abs(defaultExpiration.getTime() - secondExpiration.getTime())).toBeLessThan(1000)
    })
  })

  describe('validateInviteCode', () => {
    it('devrait valider un code d\'invitation correct', () => {
      const validCodes = [
        'ABC234',
        'XYZ789',
        'TEST23'
      ]
      
      validCodes.forEach(code => {
        const isValid = validateInviteCode(code)
        expect(isValid).toBe(true)
      })
    })

    it('devrait rejeter un code d\'invitation vide', () => {
      const isValid = validateInviteCode('')
      expect(isValid).toBe(false)
    })

    it('devrait rejeter un code d\'invitation null ou undefined', () => {
      expect(validateInviteCode(null as unknown as string)).toBe(false)
      expect(validateInviteCode(undefined as unknown as string)).toBe(false)
    })

    it('devrait rejeter un code trop court', () => {
      const shortCode = 'AB'
      const isValid = validateInviteCode(shortCode)
      expect(isValid).toBe(false)
    })

    it('devrait rejeter un code avec des caractères invalides', () => {
      const invalidCodes = [
        'abc-123', // minuscules
        'ABC@123', // caractères spéciaux
        'ABC 123'  // espaces
      ]
      
      invalidCodes.forEach(code => {
        const isValid = validateInviteCode(code)
        expect(isValid).toBe(false)
      })
    })
  })
})
