'use client'

import MainLayout from '@/components/layout/MainLayout'

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-4 p-4">
        <h1 className="text-xl font-bold neon-text">Conditions d’utilisation</h1>
        <div className="glass-effect p-4 rounded-xl border border-white/10 text-sm text-white/80">
          <p>SuperNovaFit est fourni pour un usage personnel (1 athlète + 1 coach). En utilisant l’app, vous acceptez ces conditions.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Responsabilité: vous restez responsable des données saisies.</li>
            <li>Sécurité: ne partagez pas vos identifiants.</li>
            <li>Contenu: respect des droits d’auteur pour les images uploadées.</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}


