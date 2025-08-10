'use client'

import Link from 'next/link'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { APP_VERSION, APP_RELEASE_DATE } from '@/lib/constants'

export default function NouveautesPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl md:text-2xl font-bold neon-text">Nouveautés</h1>
          <span className="text-xs text-white/60">v{APP_VERSION} · {APP_RELEASE_DATE}</span>
        </div>

        <CollapsibleCard title={`v${APP_VERSION} — Améliorations récentes`} defaultOpen>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li>SEO: favicon + Open Graph dans <code>layout.tsx</code></li>
            <li>Robots/Sitemap: ajout de <code>/robots.txt</code> et <code>/sitemap.xml</code></li>
            <li>Navigation: lien discret vers le Guide depuis la Sidebar</li>
            <li>Accessibilité: <code>aria-label</code> sur boutons (menu mobile, sections repliables)</li>
            <li>Commentaires Coach: affichage contextuel par module et badge 24h dans la Sidebar</li>
            <li>Diète: sections repliables et rendu conditionnel des graphiques pour réduire le JS initial</li>
            <li>Perf: imports dynamiques (charts, modales), images via <code>next/image</code></li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="Historique" defaultOpen={false}>
          <p className="text-sm text-white/70">
            Consultez le <Link href="/guide" className="underline decoration-dotted">Guide</Link> pour une vue d’ensemble des modules et des bonnes pratiques.
          </p>
        </CollapsibleCard>
      </div>
    </div>
  )
}


