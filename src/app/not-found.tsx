'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-space flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-4xl font-bold text-white">404</h1>
        <h2 className="text-xl text-white/80">Page non trouvée</h2>
        <p className="text-white/60">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-lg hover:from-neon-purple/80 hover:to-neon-cyan/80 transition-all duration-200 transform hover:scale-105"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </div>
    </div>
  )
}
