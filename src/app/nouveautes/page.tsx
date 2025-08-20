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

        <CollapsibleCard title={`v${APP_VERSION} — Améliorations UX/UI Coach`} defaultOpen>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li><strong>Page &quot;Tous les Athlètes&quot;</strong> : Badges dynamiques actif/inactif avec couleurs distinctives</li>
            <li><strong>Icônes objectifs</strong> : Badges Target avec couleurs spécifiques (bleu, orange, rouge, jaune)</li>
            <li><strong>Cohérence visuelle</strong> : Harmonisation des couleurs entre filtres et badges</li>
            <li><strong>Layout optimisé</strong> : Cartes plus compactes, informations mieux organisées</li>
            <li><strong>Types TypeScript</strong> : Interface AthleteData et types explicites pour la robustesse</li>
            <li><strong>Pull Request</strong> : Système de gestion des versions amélioré</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="v1.8.4 — Modules Coach Complets" defaultOpen={false}>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li><strong>Pages manquantes</strong> : /coach/programmes, /coach/rapports, /coach/all-athletes créées</li>
            <li><strong>Navigation corrigée</strong> : Distinction &quot;Mes Athlètes&quot; vs &quot;Tous les Athlètes&quot;</li>
            <li><strong>Hook useAllAthletes</strong> : Récupération de tous les athlètes avec filtres</li>
            <li><strong>Filtres avancés</strong> : Par statut coach, objectif, recherche en temps réel</li>
            <li><strong>Statistiques dynamiques</strong> : Compteurs actifs/inactifs, avec/sans coach</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="v1.8.3 — Gestion d&apos;Erreurs Firebase" defaultOpen={false}>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li><strong>Système centralisé</strong> : Mapping complet des erreurs Firebase vers messages utilisateur</li>
            <li><strong>Retry automatique</strong> : Gestion intelligente des erreurs récupérables</li>
            <li><strong>Composants réutilisables</strong> : FirebaseErrorDisplay pour affichage uniforme</li>
            <li><strong>Hooks intégrés</strong> : useFirebaseError dans tous les modules critiques</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="v1.8.2 — Pagination Complète" defaultOpen={false}>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li><strong>Pagination Firestore</strong> : Entraînements et Mesures avec bouton &quot;Charger plus&quot;</li>
            <li><strong>Performance optimisée</strong> : Chargement progressif sur toutes les listes longues</li>
            <li><strong>Correction boucle infinie</strong> : useEffect stabilisé dans usePaginatedData</li>
            <li><strong>Interface utilisateur</strong> : États de chargement et gestion d&apos;erreurs</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="v1.8.1 — Corrections &amp; Stabilisation" defaultOpen={false}>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li><strong>Erreur usePaginatedData</strong> : Fonction manquante ajoutée</li>
            <li><strong>Boucle infinie React</strong> : useCallback pour stabiliser les fonctions</li>
            <li><strong>Firebase manquant</strong> : Dépendance installée</li>
            <li><strong>Page diète</strong> : Récupération des repas corrigée</li>
            <li><strong>TypeScript</strong> : Toutes les erreurs résolues</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="v1.8.0 — Pagination Firestore" defaultOpen={false}>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li><strong>Hook générique</strong> : usePaginatedData implémenté</li>
            <li><strong>Hooks spécifiques</strong> : usePaginatedRepas, usePaginatedEntrainements, etc.</li>
            <li><strong>Interface utilisateur</strong> : Boutons &quot;Charger plus&quot; et états de chargement</li>
            <li><strong>Optimisation performance</strong> : Chargement progressif des données</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="v1.7.0 — Données de Test" defaultOpen={false}>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li><strong>Scripts de génération</strong> : Utilisateurs coach/athlète réalistes</li>
            <li><strong>Données complètes</strong> : Repas, entraînements, mesures, journal</li>
            <li><strong>Tests automatisés</strong> : Batterie de tests fonctionnels</li>
            <li><strong>Environnement de test</strong> : 8 utilisateurs avec données variées</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="v1.6.0 — Interface Coach Améliorée" defaultOpen={false}>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li><strong>Dashboard coach</strong> : Métriques et statistiques en temps réel</li>
            <li><strong>Page &quot;Mes Athlètes&quot;</strong> : Filtres et gestion des relations</li>
            <li><strong>Navigation optimisée</strong> : UX améliorée pour les coachs</li>
            <li><strong>Statistiques réelles</strong> : Données dynamiques depuis Firestore</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="v1.5.0 — Système d&apos;Invitations" defaultOpen={false}>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li><strong>Système d&apos;invitations</strong> : Génération de codes uniques</li>
            <li><strong>Interface coach</strong> : Invitation d&apos;athlètes</li>
            <li><strong>Interface athlète</strong> : Rejoindre un coach</li>
            <li><strong>Sécurité Firestore</strong> : Règles d&apos;accès configurées</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="v1.4.0 — Tests &amp; Qualité" defaultOpen={false}>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li><strong>Vitest Setup</strong> : Configuration testing moderne</li>
            <li><strong>Tests calculs métier</strong> : BMR/TDEE/MET précision</li>
            <li><strong>CI/CD avec tests</strong> : GitHub Actions quality workflow</li>
            <li><strong>Tests hooks critiques</strong> : useAuth, useFirestore</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="v1.3.0 — Améliorations précédentes" defaultOpen={false}>
          <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
            <li>Recherche aliments plus intelligente (fuzzy matching, synonymes FR)</li>
            <li>Résultats de recherche plus lisibles (fond moins transparent)</li>
            <li>Historique paginé (Journal et Entraînements) avec taille de page (10/20/50)</li>
            <li>Accès rapide &quot;Comptes de test&quot; depuis le Guide</li>
          </ul>
        </CollapsibleCard>

        <CollapsibleCard title="v1.2.0 — Fonctionnalités de base" defaultOpen={false}>
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
            Consultez le <Link href="/guide" className="underline decoration-dotted">Guide</Link> pour une vue d&apos;ensemble des modules et des bonnes pratiques.
          </p>
        </CollapsibleCard>
      </div>
    </MainLayout>
  )
}


