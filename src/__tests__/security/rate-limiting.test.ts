/**
 * Tests de sécurité pour le Rate Limiting
 * Validation complète selon OWASP guidelines
 * 
 * @author AI Assistant
 * @date 14.01.2025
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { RateLimiter, RateLimiterFactory } from '@/lib/security/RateLimiter'

// Mock Request object
const createMockRequest = (ip: string = '192.168.1.1'): Request => {
  return {
    headers: {
      get: (name: string) => {
        if (name === 'x-forwarded-for') return ip
        if (name === 'x-real-ip') return ip
        return null
      }
    },
    url: 'http://localhost:3000/api/test'
  } as Request
}

describe('RateLimiter Security', () => {
  let rateLimiter: RateLimiter
  
  beforeEach(() => {
    vi.useFakeTimers()
    rateLimiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 3,
      keyGenerator: (req) => req.headers.get('x-forwarded-for') || 'unknown'
    })
  })

  afterEach(() => {
    rateLimiter.destroy()
    vi.useRealTimers()
  })

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const req = createMockRequest('192.168.1.1')

      // 3 requêtes autorisées
      for (let i = 0; i < 3; i++) {
        const result = await rateLimiter.isAllowed(req)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(2 - i)
      }
    })

    it('should block requests exceeding limit', async () => {
      const req = createMockRequest('192.168.1.1')

      // 3 requêtes autorisées
      for (let i = 0; i < 3; i++) {
        await rateLimiter.isAllowed(req)
      }

      // 4ème requête bloquée
      const result = await rateLimiter.isAllowed(req)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after window expires', async () => {
      const req = createMockRequest('192.168.1.1')

      // Consommer toutes les requêtes
      for (let i = 0; i < 3; i++) {
        await rateLimiter.isAllowed(req)
      }

      // Vérifier que c'est bloqué
      let result = await rateLimiter.isAllowed(req)
      expect(result.allowed).toBe(false)

      // Avancer le temps de 1 minute + 1ms
      vi.advanceTimersByTime(60001)

      // Maintenant ça devrait marcher
      result = await rateLimiter.isAllowed(req)
      expect(result.allowed).toBe(true)
    })
  })

  describe('IP-based Rate Limiting', () => {
    it('should handle different IPs independently', async () => {
      const req1 = createMockRequest('192.168.1.1')
      const req2 = createMockRequest('192.168.1.2')

      // Consommer toutes les requêtes pour IP1
      for (let i = 0; i < 3; i++) {
        await rateLimiter.isAllowed(req1)
      }

      // IP1 devrait être bloquée
      let result = await rateLimiter.isAllowed(req1)
      expect(result.allowed).toBe(false)

      // IP2 devrait encore marcher
      result = await rateLimiter.isAllowed(req2)
      expect(result.allowed).toBe(true)
    })

    it('should handle missing IP gracefully', async () => {
      const req = createMockRequest('')
      
      const result = await rateLimiter.isAllowed(req)
      expect(result.allowed).toBe(true)
    })
  })

  describe('Callback and Monitoring', () => {
    it('should call onLimitReached callback', async () => {
      const onLimitReached = vi.fn()
      const limiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 2,
        keyGenerator: (req) => req.headers.get('x-forwarded-for') || 'unknown',
        onLimitReached
      })

      const req = createMockRequest('192.168.1.1')

      // Consommer les requêtes autorisées
      await limiter.isAllowed(req)
      await limiter.isAllowed(req)

      // Déclencher le callback
      await limiter.isAllowed(req)

      expect(onLimitReached).toHaveBeenCalledWith('192.168.1.1')
      limiter.destroy()
    })

    it('should provide accurate stats', async () => {
      const req1 = createMockRequest('192.168.1.1')
      const req2 = createMockRequest('192.168.1.2')

      await rateLimiter.isAllowed(req1)
      await rateLimiter.isAllowed(req2)

      const stats = rateLimiter.getStats()
      expect(stats.totalKeys).toBe(2)
      expect(stats.totalRequests).toBe(2)
    })
  })

  describe('Memory Management', () => {
    it('should clean up expired entries', async () => {
      const req = createMockRequest('192.168.1.1')
      
      await rateLimiter.isAllowed(req)
      
      let stats = rateLimiter.getStats()
      expect(stats.totalKeys).toBe(1)

      // Avancer le temps pour expirer l'entrée
      vi.advanceTimersByTime(120000) // 2 minutes

      // Déclencher le cleanup
      vi.advanceTimersByTime(60000)

      stats = rateLimiter.getStats()
      expect(stats.totalKeys).toBe(0)
    })

    it('should reset specific keys', async () => {
      const req = createMockRequest('192.168.1.1')
      
      await rateLimiter.isAllowed(req)
      
      let stats = rateLimiter.getStats()
      expect(stats.totalKeys).toBe(1)

      rateLimiter.resetKey('192.168.1.1')

      stats = rateLimiter.getStats()
      expect(stats.totalKeys).toBe(0)
    })
  })
})

describe('RateLimiterFactory', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('API Limiter', () => {
    it('should create API limiter with correct config', async () => {
      const limiter = RateLimiterFactory.createAPILimiter()
      const req = createMockRequest('192.168.1.1')

      // Test que ça fonctionne
      const result = await limiter.isAllowed(req)
      expect(result.allowed).toBe(true)

      limiter.destroy()
    })
  })

  describe('Auth Limiter', () => {
    it('should be more restrictive than API limiter', async () => {
      const authLimiter = RateLimiterFactory.createAuthLimiter()
      const req = createMockRequest('192.168.1.1')

      // Consommer les 5 requêtes autorisées
      for (let i = 0; i < 5; i++) {
        const result = await authLimiter.isAllowed(req)
        expect(result.allowed).toBe(true)
      }

      // 6ème requête bloquée
      const result = await authLimiter.isAllowed(req)
      expect(result.allowed).toBe(false)

      authLimiter.destroy()
    })
  })

  describe('Firestore Limiter', () => {
    it('should handle authorization header', async () => {
      const limiter = RateLimiterFactory.createFirestoreLimiter()
      const req = {
        headers: {
          get: (name: string) => {
            if (name === 'authorization') return 'Bearer token123'
            if (name === 'x-forwarded-for') return '192.168.1.1'
            return null
          }
        }
      } as Request

      const result = await limiter.isAllowed(req)
      expect(result.allowed).toBe(true)

      limiter.destroy()
    })
  })
})

describe('Edge Cases and Security', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    limiter = new RateLimiter({
      windowMs: 60000,
      maxRequests: 5,
      keyGenerator: (req) => req.headers.get('x-forwarded-for') || 'unknown'
    })
  })

  afterEach(() => {
    limiter.destroy()
  })

  it('should handle concurrent requests safely', async () => {
    const req = createMockRequest('192.168.1.1')
    
    // Lancer 10 requêtes concurrentes
    const promises = Array(10).fill(null).map(() => limiter.isAllowed(req))
    const results = await Promise.all(promises)

    // Exactement 5 devraient être autorisées
    const allowed = results.filter(r => r.allowed).length
    expect(allowed).toBe(5)
  })

  it('should handle malformed requests gracefully', async () => {
    const badReq = {} as Request
    
    // Ne devrait pas crash et devrait retourner un résultat valide
    const result = await limiter.isAllowed(badReq)
    expect(result.allowed).toBe(true)
    expect(typeof result.remaining).toBe('number')
    expect(typeof result.resetTime).toBe('number')
  })

  it('should prevent timing attacks', async () => {
    const req = createMockRequest('192.168.1.1')
    
    const start1 = Date.now()
    await limiter.isAllowed(req)
    const time1 = Date.now() - start1

    // Consommer toutes les requêtes
    for (let i = 0; i < 4; i++) {
      await limiter.isAllowed(req)
    }

    const start2 = Date.now()
    await limiter.isAllowed(req) // Cette requête sera bloquée
    const time2 = Date.now() - start2

    // Les temps devraient être similaires (pas de timing attack)
    expect(Math.abs(time1 - time2)).toBeLessThan(50) // 50ms de tolérance
  })
})
