'use client'

import Link from 'next/link'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { APP_VERSION, APP_RELEASE_DATE } from '@/lib/constants'
import MainLayout from '@/components/layout/MainLayout'

export default function NouveautesPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl md:text-2xl font-bold neon-text">Nouveautés</h1>
          <span className="text-xs text-white/60">v{APP_VERSION} · {APP_RELEASE_DATE}</span>
        </div>

        <CollapsibleCard title={`v${APP_VERSION} — Améliorations récentes`} defaultOpen>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li>Recherche aliments plus intelligente (fuzzy matching, synonymes FR, meilleure pertinence)</li>
            <li>Résultats de recherche plus lisibles (fond moins transparent)</li>
            <li>Historique paginé (Journal et Entraînements) avec taille de page (10/20/50)</li>
            <li>Accès rapide “Comptes de test” depuis le Guide</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="v1.1.0 — Améliorations précédentes" defaultOpen={false}>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li>SEO: favicon + Open Graph</li>
            <li>Robots/Sitemap</li>
            <li>Navigation: lien Guide dans la Sidebar</li>
            <li>Accessibilité: aria-label sur boutons</li>
            <li>Commentaires Coach: affichage contextuel + badge 24h</li>
            <li>Diète: sections rétractables, charts conditionnels</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="Historique" defaultOpen={false}>
          <p className="text-sm text-white/70">
            Consultez le <Link href="/guide" className="underline decoration-dotted">Guide</Link> pour une vue d’ensemble des modules et des bonnes pratiques.
          </p>
        </CollapsibleCard>
      </div>
    </MainLayout>
  )
}


