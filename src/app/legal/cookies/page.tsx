'use client'

import MainLayout from '@/components/layout/MainLayout'

export default function CookiesPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-4 p-4">
        <h1 className="text-xl font-bold neon-text">Cookies</h1>
        <div className="glass-effect p-4 rounded-xl border border-white/10 text-sm text-white/80">
          <p>Nous utilisons des cookies techniques pour le bon fonctionnement et éventuellement des cookies analytiques (optionnels).</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Essentiels: sessions d’authentification Firebase.</li>
            <li>Mesure d’audience: Google Analytics (si activé).</li>
            <li>Gestion: vous pouvez effacer/contôler les cookies via votre navigateur.</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}


