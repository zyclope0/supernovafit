/**
 * Tests pour firebase-errors
 * Tests simples pour les utilitaires Firebase
 */

import { describe, it, expect } from 'vitest'
import { 
  getFirebaseErrorMessage,
  isFirebaseError,
  FirebaseErrorCode 
} from '../firebase-errors'

describe('firebase-errors', () => {
  describe('getFirebaseErrorMessage', () => {
    it('devrait retourner le message correct pour auth/user-not-found', () => {
      const message = getFirebaseErrorMessage('auth/user-not-found')
      expect(message).toBe('Aucun compte trouvé avec cet email')
    })

    it('devrait retourner le message correct pour auth/wrong-password', () => {
      const message = getFirebaseErrorMessage('auth/wrong-password')
      expect(message).toBe('Mot de passe incorrect')
    })

    it('devrait retourner le message correct pour auth/email-already-in-use', () => {
      const message = getFirebaseErrorMessage('auth/email-already-in-use')
      expect(message).toBe('Cet email est déjà utilisé par un autre compte')
    })

    it('devrait retourner un message par défaut pour un code inconnu', () => {
      const message = getFirebaseErrorMessage('unknown/error' as FirebaseErrorCode)
      expect(message).toBe('Une erreur est survenue. Veuillez réessayer.')
    })

    it('devrait retourner un message par défaut pour undefined', () => {
      const message = getFirebaseErrorMessage(undefined as string)
      expect(message).toBe('Une erreur est survenue. Veuillez réessayer.')
    })
  })

  describe('isFirebaseError', () => {
    it('devrait retourner true pour une erreur Firebase valide', () => {
      const error = {
        code: 'auth/user-not-found',
        message: 'Firebase: Error (auth/user-not-found).'
      }
      expect(isFirebaseError(error)).toBe(true)
    })

    it('devrait retourner false pour une erreur standard', () => {
      const error = new Error('Standard error')
      expect(isFirebaseError(error)).toBe(false)
    })

    it('devrait retourner false pour null', () => {
      expect(isFirebaseError(null)).toBe(false)
    })

    it('devrait retourner false pour undefined', () => {
      expect(isFirebaseError(undefined)).toBe(false)
    })

    it('devrait retourner false pour un objet sans code', () => {
      const error = { message: 'Some error' }
      expect(isFirebaseError(error)).toBe(false)
    })
  })
})
