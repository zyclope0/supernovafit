'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6 bg-space-900">
          <div className="glass-effect max-w-md w-full p-6 rounded-2xl border border-white/10 text-center">
            <div className="text-6xl mb-3">🚀</div>
            <h2 className="text-white font-semibold text-lg mb-2">Oups, quelque chose a mal tourné</h2>
            <p className="text-sm text-gray-300 mb-4">Essayez de recharger la page.</p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors"
            >
              Recharger
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}


