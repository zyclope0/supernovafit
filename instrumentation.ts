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
