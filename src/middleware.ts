/**
 * Middleware Next.js pour SuperNovaFit
 * Rate limiting et sécurité multi-couches
 *
 * @author AI Assistant
 * @date 14.01.2025
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterFactory } from '@/lib/security/RateLimiter';

// Instances globales des rate limiters
const apiLimiter = RateLimiterFactory.createAPILimiter();
const authLimiter = RateLimiterFactory.createAuthLimiter();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === DÉSACTIVER RATE LIMITING EN MODE TEST (E2E) ===
  const isTestMode =
    process.env.NODE_ENV === 'test' ||
    request.headers.get('user-agent')?.includes('Playwright');

  try {
    // === PROTECTION DES PAGES AUTHENTIFIÉES ===
    const protectedRoutes = [
      '/diete',
      '/entrainements',
      '/mesures',
      '/journal',
      '/challenges',
      '/profil',
      '/export',
      '/coach',
    ];

    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route),
    );

    if (isProtectedRoute) {
      // Vérifier si l'utilisateur a un token d'authentification
      const hasAuthToken = request.cookies.has('auth_token');

      // DÉSACTIVÉ TEMPORAIREMENT - Cause boucle infinie en production
      // Le cookie côté client n'est pas fiable en SSR
      // TODO: Implémenter vérification Firebase Admin côté serveur
      if (false && !hasAuthToken) {
        // Rediriger vers /auth avec returnUrl
        const url = request.nextUrl.clone();
        url.pathname = '/auth';
        url.searchParams.set('returnUrl', pathname);
        return NextResponse.redirect(url);
      }
    }

    // === RATE LIMITING API (désactivé en mode test) ===
    if (!isTestMode) {
      if (pathname.startsWith('/api/auth/')) {
        // Protection stricte pour l'authentification
        const result = await authLimiter.isAllowed(request);
        if (!result.allowed) {
          return createRateLimitResponse(
            Date.now() + 15 * 60 * 1000,
            'Authentication rate limit exceeded',
          );
        }

        return NextResponse.next();
      } else if (pathname.startsWith('/api/')) {
        // Protection générale pour les API
        const result = await apiLimiter.isAllowed(request);
        if (!result.allowed) {
          return createRateLimitResponse(
            Date.now() + 15 * 60 * 1000,
            'API rate limit exceeded',
          );
        }

        return NextResponse.next();
      }
    }

    // Pour toutes les autres routes, on laisse passer
    return NextResponse.next();
  } catch (error) {
    console.error('[MIDDLEWARE] Error in middleware:', error);

    // En cas d'erreur, on laisse passer (fail-open)
    return NextResponse.next();
  }
}

function createRateLimitResponse(
  resetTime: number,
  message: string,
): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: message,
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
      },
    },
  );
}

// Configuration du middleware
export const config = {
  matcher: [
    /*
     * Match routes API pour le rate limiting
     * + routes protégées pour l'authentification
     */
    '/api/:path*',
    '/diete/:path*',
    '/entrainements/:path*',
    '/mesures/:path*',
    '/journal/:path*',
    '/challenges/:path*',
    '/profil/:path*',
    '/export/:path*',
    '/coach/:path*',
  ],
};

// Note: Pas de cleanup dans Edge Runtime
// Les rate limiters sont nettoyés automatiquement par leur mécanisme interne
