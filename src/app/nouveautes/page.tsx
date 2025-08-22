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

        {/* NOUVELLES FONCTIONNALITÉS UTILISATEUR */}
        <CollapsibleCard title={`v${APP_VERSION} — 🎨 Interface Moderne & Export de Données`} defaultOpen>
          <div className="space-y-3">
            <div className="bg-neon-purple/10 p-3 rounded-lg border border-neon-purple/20">
              <h4 className="font-semibold text-neon-purple mb-2">📊 Export de Données Complet</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Multi-formats</strong> : Export CSV, JSON, Excel et PDF avec graphiques intégrés</li>
                <li><strong>Graphiques professionnels</strong> : Visualisations avancées dans les rapports PDF et Excel</li>
                <li><strong>Filtres personnalisables</strong> : Sélection de période et types de données</li>
                <li><strong>Design professionnel</strong> : Rapports avec mise en page soignée et couleurs de marque</li>
                <li><strong>Statistiques calculées</strong> : Analyses automatiques des données exportées</li>
              </ul>
            </div>
            
            <div className="bg-neon-green/10 p-3 rounded-lg border border-neon-green/20">
              <h4 className="font-semibold text-neon-green mb-2">✨ Interface Glassmorphism</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Design moderne</strong> : Effets de verre et bordures translucides</li>
                <li><strong>Animations fluides</strong> : Transitions et effets hover avancés</li>
                <li><strong>Couleurs de marque</strong> : Palette SuperNovaFit cohérente (neon-purple, neon-cyan)</li>
                <li><strong>Responsive design</strong> : Adaptation parfaite mobile et desktop</li>
                <li><strong>États visuels</strong> : Indicateurs de progression et succès animés</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold text-blue-400 mb-2">🚀 Performance & Stabilité</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Chargement optimisé</strong> : Dashboard qui s&apos;affiche immédiatement</li>
                <li><strong>Pagination intelligente</strong> : Chargement progressif sur toutes les listes</li>
                <li><strong>Gestion d&apos;erreurs robuste</strong> : Messages clairs et retry automatique</li>
                <li><strong>Navigation cohérente</strong> : Sidebar intégrée sur toutes les pages</li>
              </ul>
            </div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="v1.9.1 — 🎨 Interface Coach Améliorée" defaultOpen={false}>
          <div className="space-y-3">
            <div className="bg-neon-purple/10 p-3 rounded-lg border border-neon-purple/20">
              <h4 className="font-semibold text-neon-purple mb-2">✨ Page &quot;Tous les Athlètes&quot; Redesign</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Badges dynamiques</strong> : Reconnaissance immédiate des athlètes actifs (vert) vs inactifs (rouge)</li>
                <li><strong>Icônes objectifs colorées</strong> : Distinction visuelle par type d&apos;objectif (maintien, prise de masse, sèche, performance)</li>
                <li><strong>Layout optimisé</strong> : Cartes plus compactes, informations mieux organisées</li>
                <li><strong>Filtres intelligents</strong> : Recherche par nom, filtrage par statut coach et objectif</li>
              </ul>
            </div>
            
            <div className="bg-neon-green/10 p-3 rounded-lg border border-neon-green/20">
              <h4 className="font-semibold text-neon-green mb-2">🚀 Expérience Utilisateur Améliorée</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Cohérence visuelle</strong> : Couleurs harmonisées dans toute l&apos;interface</li>
                <li><strong>Navigation intuitive</strong> : Distinction claire entre &quot;Mes Athlètes&quot; et &quot;Tous les Athlètes&quot;</li>
                <li><strong>Statistiques en temps réel</strong> : Compteurs dynamiques pour un suivi efficace</li>
                <li><strong>Actions rapides</strong> : Boutons d&apos;invitation et de consultation de profil optimisés</li>
              </ul>
            </div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="v1.8.4 — 📊 Gestion Complète des Athlètes" defaultOpen={false}>
          <div className="space-y-3">
            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold text-blue-400 mb-2">👥 Nouveaux Modules Coach</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Page &quot;Tous les Athlètes&quot;</strong> : Vue d&apos;ensemble complète avec filtres avancés</li>
                <li><strong>Page &quot;Programmes&quot;</strong> : Gestion des programmes d&apos;entraînement (en développement)</li>
                <li><strong>Page &quot;Rapports&quot;</strong> : Analyse et reporting des performances (en développement)</li>
                <li><strong>Navigation restructurée</strong> : Organisation logique des fonctionnalités coach</li>
              </ul>
            </div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="v1.8.3 — 🛡️ Gestion d&apos;Erreurs Améliorée" defaultOpen={false}>
          <div className="space-y-3">
            <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
              <h4 className="font-semibold text-orange-400 mb-2">🔧 Messages d&apos;Erreur Intelligents</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Messages en français</strong> : Erreurs techniques traduites en langage utilisateur</li>
                <li><strong>Retry automatique</strong> : Tentatives de reconnexion automatiques en cas de problème</li>
                <li><strong>Interface d&apos;erreur unifiée</strong> : Affichage cohérent des problèmes sur toutes les pages</li>
                <li><strong>Gestion des timeouts</strong> : Meilleure gestion des connexions lentes</li>
              </ul>
            </div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="v1.8.2 — ⚡ Performance Optimisée" defaultOpen={false}>
          <div className="space-y-3">
            <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
              <h4 className="font-semibold text-green-400 mb-2">📱 Chargement Progressif</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Pagination intelligente</strong> : Chargement par lots des entraînements et mesures</li>
                <li><strong>Bouton &quot;Charger plus&quot;</strong> : Contrôle utilisateur sur le chargement des données</li>
                <li><strong>Performance améliorée</strong> : Temps de chargement réduit sur les listes longues</li>
                <li><strong>États de chargement</strong> : Indicateurs visuels pendant les opérations</li>
              </ul>
            </div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="v1.7.0 — 🧪 Environnement de Test" defaultOpen={false}>
          <div className="space-y-3">
            <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
              <h4 className="font-semibold text-purple-400 mb-2">👨‍💼 Comptes de Démonstration</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>8 utilisateurs de test</strong> : Coachs et athlètes avec données réalistes</li>
                <li><strong>Données variées</strong> : Repas, entraînements, mesures et journal complets</li>
                <li><strong>Accès rapide</strong> : Liens directs vers les comptes de test depuis le Guide</li>
                <li><strong>Environnement stable</strong> : Tests sans impact sur les données de production</li>
              </ul>
            </div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="v1.6.0 — 🎯 Interface Coach" defaultOpen={false}>
          <div className="space-y-3">
            <div className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
              <h4 className="font-semibold text-cyan-400 mb-2">📈 Dashboard Coach</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Métriques en temps réel</strong> : Statistiques dynamiques des athlètes</li>
                <li><strong>Page &quot;Mes Athlètes&quot;</strong> : Gestion des relations coach-athlète</li>
                <li><strong>Statistiques réelles</strong> : Données provenant directement de la base</li>
                <li><strong>Navigation optimisée</strong> : Interface dédiée aux besoins des coachs</li>
              </ul>
            </div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="v1.5.0 — 🤝 Système d&apos;Invitations" defaultOpen={false}>
          <div className="space-y-3">
            <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
              <h4 className="font-semibold text-yellow-400 mb-2">📨 Invitations Coach-Athlète</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Codes d&apos;invitation uniques</strong> : Sécurisation des relations coach-athlète</li>
                <li><strong>Interface coach</strong> : Envoi d&apos;invitations depuis le dashboard</li>
                <li><strong>Interface athlète</strong> : Acceptation d&apos;invitations avec code</li>
                <li><strong>Sécurité renforcée</strong> : Règles d&apos;accès Firestore configurées</li>
              </ul>
            </div>
          </div>
        </CollapsibleCard>

        {/* MISE À JOURS TECHNIQUES (RÉTRACTABLE) */}
        <CollapsibleCard title="🔧 Mises à Jour Techniques" defaultOpen={false}>
          <div className="space-y-4">
            <div className="text-sm text-gray-400 mb-3">
              Ces améliorations techniques améliorent la stabilité et les performances de l&apos;application.
            </div>
            
            <div className="space-y-2">
              <div className="border-l-2 border-gray-600 pl-3">
                <h5 className="text-xs font-semibold text-gray-300">v1.9.2 — Corrections &amp; Stabilisation</h5>
                <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1 mt-1">
                  <li>Correction boucle infinie Firebase avec useMemo</li>
                  <li>Optimisation chargement initial dashboard</li>
                  <li>Stabilisation hooks useFirebaseError</li>
                  <li>Tests temporairement désactivés (problèmes mémoire)</li>
                </ul>
              </div>

              <div className="border-l-2 border-gray-600 pl-3">
                <h5 className="text-xs font-semibold text-gray-300">v1.9.1 — Export de Données</h5>
                <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1 mt-1">
                  <li>Intégration jsPDF, Papa Parse, xlsx</li>
                  <li>Graphiques Chart.js dans exports</li>
                  <li>Hook useExportData centralisé</li>
                  <li>Types TypeScript complets</li>
                </ul>
              </div>
              
              <div className="border-l-2 border-gray-600 pl-3">
                <h5 className="text-xs font-semibold text-gray-300">v1.8.1 — Corrections &amp; Stabilisation</h5>
                <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1 mt-1">
                  <li>Correction boucle infinie React avec useCallback</li>
                  <li>Résolution erreurs TypeScript et dépendances</li>
                  <li>Optimisation des hooks Firebase</li>
                </ul>
              </div>
              
              <div className="border-l-2 border-gray-600 pl-3">
                <h5 className="text-xs font-semibold text-gray-300">v1.8.0 — Pagination Firestore</h5>
                <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1 mt-1">
                  <li>Hook générique usePaginatedData</li>
                  <li>Hooks spécifiques pour chaque module</li>
                  <li>Optimisation des requêtes Firestore</li>
                </ul>
              </div>
              
              <div className="border-l-2 border-gray-600 pl-3">
                <h5 className="text-xs font-semibold text-gray-300">v1.4.0 — Tests &amp; Qualité</h5>
                <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1 mt-1">
                  <li>Configuration Vitest pour tests modernes</li>
                  <li>Tests calculs métier (BMR/TDEE/MET)</li>
                  <li>CI/CD avec GitHub Actions</li>
                  <li>Tests hooks critiques</li>
                </ul>
              </div>
              
              <div className="border-l-2 border-gray-600 pl-3">
                <h5 className="text-xs font-semibold text-gray-300">v1.3.0 — Améliorations Interface</h5>
                <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1 mt-1">
                  <li>Recherche aliments fuzzy matching</li>
                  <li>Pagination côté client (Journal/Entraînements)</li>
                  <li>Optimisation des résultats de recherche</li>
                </ul>
              </div>
              
              <div className="border-l-2 border-gray-600 pl-3">
                <h5 className="text-xs font-semibold text-gray-300">v1.2.0 — Fonctionnalités de Base</h5>
                <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1 mt-1">
                  <li>SEO: favicon + Open Graph</li>
                  <li>Accessibilité: aria-labels</li>
                  <li>Commentaires coach contextuels</li>
                  <li>Sections rétractables diète</li>
                </ul>
              </div>
            </div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="📚 Guide &amp; Support" defaultOpen={false}>
          <p className="text-sm text-white/70">
            Consultez le <Link href="/guide" className="underline decoration-dotted text-neon-purple hover:text-neon-purple/80">Guide</Link> pour une vue d&apos;ensemble des modules et des bonnes pratiques d&apos;utilisation.
          </p>
        </CollapsibleCard>
      </div>
    </MainLayout>
  )
}


