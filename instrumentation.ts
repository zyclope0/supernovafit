// This file is used to configure Sentry's error and performance monitoring.
// It runs when your Next.js app starts up (both server and edge runtime).
// Only use this file if you're using Next.js 13.4+ with the app router.

export async function register() {
  // Only initialize Sentry on the server/edge runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export async function onRequestError(error: unknown) {
  try {
    const Sentry = await import('@sentry/nextjs')
    // Prefer the dedicated helper when available
    // Fallback to captureException for older SDKs
    if ('captureRequestError' in Sentry && typeof Sentry.captureRequestError === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Sentry.captureRequestError(error, {} as any, {} as any)
    } else if (typeof Sentry.captureException === 'function') {
      Sentry.captureException(error)
    }
  } catch {
    // Swallow to avoid breaking request pipeline in case of import issues
  }
}
