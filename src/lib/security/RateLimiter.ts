/**
 * Rate Limiter pour SuperNovaFit
 * Implémentation multi-couches selon OWASP guidelines
 * 
 * @author AI Assistant
 * @date 14.01.2025
 * @version 1.0.0
 */

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator: (req: Request) => string
  skipSuccessfulRequests?: boolean
  onLimitReached?: (key: string) => void
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
}

export class RateLimiter {
  private store = new Map<string, number[]>()
  private config: RateLimitConfig
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: RateLimitConfig) {
    this.config = config
    this.startCleanup()
  }

  async isAllowed(req: Request): Promise<RateLimitResult> {
    try {
      const key = this.config.keyGenerator(req)
      const now = Date.now()
      const windowStart = now - this.config.windowMs

    // Nettoyer les anciennes requêtes pour cette clé
    const requests = this.store.get(key)?.filter(time => time > windowStart) || []
    
    const allowed = requests.length < this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - requests.length)
    const resetTime = now + this.config.windowMs

    if (!allowed) {
      this.config.onLimitReached?.(key)
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        totalHits: requests.length
      }
    }

    // Ajouter la requête actuelle
    requests.push(now)
    this.store.set(key, requests)

    return {
      allowed: true,
      remaining: remaining - 1,
      resetTime,
      totalHits: requests.length
    }
    } catch (error) {
      // En cas d'erreur, on log et on autorise par défaut (fail-open)
      console.error('[RATE_LIMITER] Error processing request:', error)
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: Date.now() + this.config.windowMs,
        totalHits: 0
      }
    }
  }

  private startCleanup() {
    // Nettoyer le store toutes les minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, requests] of Array.from(this.store.entries())) {
        const validRequests = requests.filter((time: number) => now - time < this.config.windowMs)
        if (validRequests.length === 0) {
          this.store.delete(key)
        } else {
          this.store.set(key, validRequests)
        }
      }
    }, 60000) // Cleanup toutes les minutes
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }

  // Méthodes utilitaires pour monitoring
  getStats() {
    return {
      totalKeys: this.store.size,
      totalRequests: Array.from(this.store.values()).reduce((sum, requests) => sum + requests.length, 0)
    }
  }

  resetKey(key: string) {
    this.store.delete(key)
  }
}

// Factory pour créer des limiteurs pré-configurés
export class RateLimiterFactory {
  static createAPILimiter(): RateLimiter {
    return new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // 100 requêtes par IP
      keyGenerator: (req) => {
        try {
          const ip = req?.headers?.get('x-forwarded-for') || 
                    req?.headers?.get('x-real-ip') || 
                    'unknown'
          return `api:${ip}`
        } catch {
          return 'api:unknown'
        }
      },
      onLimitReached: (key) => {
        console.warn(`[SECURITY] Rate limit exceeded for ${key}`, {
          timestamp: new Date().toISOString(),
          key,
          type: 'api_rate_limit'
        })
      }
    })
  }

  static createAuthLimiter(): RateLimiter {
    return new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // Plus strict pour auth
      keyGenerator: (req) => {
        try {
          const ip = req?.headers?.get('x-forwarded-for') || 
                    req?.headers?.get('x-real-ip') || 
                    'unknown'
          return `auth:${ip}`
        } catch {
          return 'auth:unknown'
        }
      },
      onLimitReached: (key) => {
        console.error(`[SECURITY] Auth rate limit exceeded for ${key}`, {
          timestamp: new Date().toISOString(),
          key,
          type: 'auth_rate_limit',
          severity: 'high'
        })
      }
    })
  }

  static createFirestoreLimiter(): RateLimiter {
    return new RateLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30, // 30 writes par minute par utilisateur
      keyGenerator: (req) => {
        try {
          // Extraire l'user ID du token Firebase si disponible
          const authHeader = req?.headers?.get('authorization')
          if (authHeader) {
            // Ici on pourrait décoder le JWT pour extraire l'UID
            // Pour l'instant on utilise l'IP
            const ip = req?.headers?.get('x-forwarded-for') || 'unknown'
            return `firestore:${ip}`
          }
          return `firestore:anonymous`
        } catch {
          return 'firestore:unknown'
        }
      },
      onLimitReached: (key) => {
        console.warn(`[SECURITY] Firestore rate limit exceeded for ${key}`, {
          timestamp: new Date().toISOString(),
          key,
          type: 'firestore_rate_limit'
        })
      }
    })
  }
}

