'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // Log côté client pour debug production si besoin
    // eslint-disable-next-line no-console
    console.error('App error boundary:', error)
  }, [error])

  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="glass-effect max-w-md w-full p-6 rounded-2xl border border-white/10 text-center">
        <div className="text-5xl mb-3">🛡️</div>
        <h2 className="text-white font-semibold text-lg mb-2">Une erreur est survenue</h2>
        <p className="text-sm text-gray-300 mb-4">Pas d&apos;inquiétude, vous pouvez réessayer.</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}


