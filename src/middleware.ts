/**
 * Middleware Next.js pour SuperNovaFit
 * Rate limiting et sécurité multi-couches
 * 
 * @author AI Assistant
 * @date 14.01.2025
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { RateLimiterFactory } from '@/lib/security/RateLimiter'

// Instances globales des rate limiters
const apiLimiter = RateLimiterFactory.createAPILimiter()
const authLimiter = RateLimiterFactory.createAuthLimiter()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    // Rate limiting différencié par type de route API
    if (pathname.startsWith('/api/auth/')) {
      // Protection stricte pour l'authentification
      const result = await authLimiter.isAllowed(request)
      if (!result.allowed) {
        return createRateLimitResponse(Date.now() + 15 * 60 * 1000, 'Authentication rate limit exceeded')
      }
      
      return NextResponse.next()
      
    } else if (pathname.startsWith('/api/')) {
      // Protection générale pour les API
      const result = await apiLimiter.isAllowed(request)
      if (!result.allowed) {
        return createRateLimitResponse(Date.now() + 15 * 60 * 1000, 'API rate limit exceeded')
      }
      
      return NextResponse.next()
    }

    // Pour toutes les autres routes API, on laisse passer
    return NextResponse.next()
    
  } catch (error) {
    console.error('[MIDDLEWARE] Error in rate limiting:', error)
    
    // En cas d'erreur, on laisse passer (fail-open)
    return NextResponse.next()
  }
}

function createRateLimitResponse(resetTime: number, message: string): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: message,
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
    }),
    { 
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString()
      }
    }
  )
}



// Configuration du middleware
export const config = {
  matcher: [
    /*
     * Match seulement les routes API pour le rate limiting
     * Évite d'intercepter les pages normales
     */
    '/api/:path*'
  ],
}

// Note: Pas de cleanup dans Edge Runtime
// Les rate limiters sont nettoyés automatiquement par leur mécanisme interne
