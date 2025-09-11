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
        <CollapsibleCard title={`v${APP_VERSION} — 🎨 Interface Athlète Révolutionnée`} defaultOpen>
          <div className="space-y-3">
            <div className="bg-neon-purple/10 p-3 rounded-lg border border-neon-purple/20">
              <h2 className="font-semibold text-neon-purple mb-2">🎨 Interface Athlète Modernisée</h2>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Dashboards compacts</strong> : Statistiques clés visibles en un coup d&apos;œil sur toutes les pages</li>
                <li><strong>Boutons flottants</strong> : Actions principales accessibles en un clic depuis n&apos;importe où</li>
                <li><strong>Navigation simplifiée</strong> : Headers épurés, actions déplacées dans l&apos;interface</li>
                <li><strong>Design cohérent</strong> : Même philosophie UX appliquée sur Journal, Diète, Entraînements et Mesures</li>
              </ul>
            </div>
            
            <div className="bg-neon-cyan/10 p-3 rounded-lg border border-neon-cyan/20">
              <h2 className="font-semibold text-neon-cyan mb-2">📊 Journal de Progression Révolutionné</h2>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Dashboard motivationnel</strong> : Humeur, énergie, jours de suivi et objectifs avec barres de progression</li>
                <li><strong>Cartes d&apos;entrées modernisées</strong> : Design épuré avec actions cachées au survol</li>
                <li><strong>Barre d&apos;outils optimisée</strong> : Navigation par date avec bouton &quot;Aujourd&apos;hui&quot; rapide</li>
                <li><strong>Raccourcis clavier</strong> : Ctrl+N pour nouvelle entrée, avec aide contextuelle dismissible</li>
              </ul>
            </div>

            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <h2 className="font-semibold text-emerald-400 mb-2">🍽️ Diète & Nutrition Améliorée</h2>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Dashboard nutritionnel</strong> : Calories, protéines, repas et objectif avec indicateurs visuels</li>
                <li><strong>Ajout de repas simplifié</strong> : Bouton flottant pour saisie rapide</li>
                <li><strong>Historique optimisé</strong> : Navigation par date avec accès direct à aujourd&apos;hui</li>
                <li><strong>Interface épurée</strong> : Menu-type déplacé en version desktop uniquement</li>
              </ul>
            </div>

            <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
              <h2 className="font-semibold text-orange-400 mb-2">🏃‍♂️ Entraînements & Performance</h2>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Dashboard performance</strong> : Séances, durée, calories et durée moyenne avec métriques claires</li>
                <li><strong>Import Garmin accessible</strong> : Bouton dédié dans la barre d&apos;outils</li>
                <li><strong>Historique complet</strong> : Navigation temporelle avec vue d&apos;ensemble</li>
                <li><strong>Actions centralisées</strong> : Graphiques et import regroupés logiquement</li>
              </ul>
            </div>

            <div className="bg-pink-500/10 p-3 rounded-lg border border-pink-500/20">
              <h2 className="font-semibold text-pink-400 mb-2">📏 Mesures Corporelles Optimisées</h2>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Dashboard toujours visible</strong> : Statistiques corporelles accessibles en permanence</li>
                <li><strong>Validation intelligente</strong> : Protection contre les mesures vides (sauf tour de taille)</li>
                <li><strong>Graphiques contextuels</strong> : Titre &quot;Graphiques d&apos;évolution&quot; affiché uniquement quand nécessaire</li>
                <li><strong>Interface cohérente</strong> : Même logique UX que les autres pages athlète</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <h2 className="font-semibold text-blue-400 mb-2">🎯 Expérience Utilisateur Unifiée</h2>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Philosophie UX cohérente</strong> : Même approche ergonomique sur toutes les pages</li>
                <li><strong>Raccourcis clavier</strong> : Ctrl+N disponible partout avec aide contextuelle</li>
                <li><strong>Navigation intuitive</strong> : Actions principales toujours accessibles</li>
                <li><strong>Design responsive</strong> : Adaptation parfaite mobile et desktop</li>
              </ul>
            </div>
          </div>
        </CollapsibleCard>

        {/* VERSION PRÉCÉDENTE */}
        <CollapsibleCard title="v1.9.4 — ⚡ Performance & Sécurité" defaultOpen={false}>
          <div className="space-y-3">
            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <h4 className="font-semibold text-emerald-400 mb-2">⚡ Images Ultra-Rapides</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Chargement instantané</strong> : Images optimisées automatiquement en AVIF et WebP</li>
                <li><strong>Économie de données</strong> : Réduction de 20 à 50% de la taille des images</li>
                <li><strong>Adaptation intelligente</strong> : Taille automatique selon votre appareil</li>
                <li><strong>Effet de transition</strong> : Chargement progressif avec effet de flou élégant</li>
              </ul>
            </div>
            
            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold text-blue-400 mb-2">🔒 Sécurité Renforcée</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>0 vulnérabilité</strong> : Toutes les failles de sécurité corrigées</li>
                <li><strong>Dépendances à jour</strong> : Bibliothèques mises à jour vers les versions sécurisées</li>
                <li><strong>Export plus fiable</strong> : Génération PDF/Excel plus stable et rapide</li>
                <li><strong>Code nettoyé</strong> : Suppression du code inutile pour plus de performance</li>
              </ul>
            </div>

            <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
              <h4 className="font-semibold text-purple-400 mb-2">🚀 Performance Générale</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Page Export 35% plus rapide</strong> : Chargement optimisé de 602KB à 388KB</li>
                <li><strong>Application plus fluide</strong> : Suppression du code mort et optimisations</li>
                <li><strong>Maintenance améliorée</strong> : Code plus propre pour de futures mises à jour</li>
                <li><strong>Stabilité accrue</strong> : Tests renforcés et détection d&apos;erreurs améliorée</li>
              </ul>
            </div>
          </div>
        </CollapsibleCard>

        {/* MISES À JOUR TECHNIQUES */}
        <CollapsibleCard title="🔧 Mises à Jour Techniques" defaultOpen={false}>
          <div className="space-y-3">
            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <h4 className="font-semibold text-emerald-400 mb-2">🔒 Audit Sécurité Complet</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>0 vulnérabilités npm</strong> : jsPDF 2.5.1→3.0.2, xlsx→exceljs migration</li>
                <li><strong>Dépendances nettoyées</strong> : 15 packages inutiles supprimés (-439KB)</li>
                <li><strong>Code mort supprimé</strong> : 10 fichiers et 20 exports non utilisés éliminés</li>
                <li><strong>ESLint production</strong> : Détection d&apos;erreurs activée en build</li>
                <li><strong>TypeScript strict</strong> : 100% des erreurs de type corrigées</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold text-blue-400 mb-2">⚡ Optimisations Performance</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Bundle export -35%</strong> : 602KB → 388KB grâce au code splitting</li>
                <li><strong>Images AVIF/WebP</strong> : Formats modernes activés automatiquement</li>
                <li><strong>Lazy loading intelligent</strong> : Composant OptimizedImage créé</li>
                <li><strong>Device sizes optimisées</strong> : Adaptation automatique mobile/desktop</li>
                <li><strong>Build time amélioré</strong> : Compilation plus rapide et stable</li>
              </ul>
            </div>

            <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
              <h4 className="font-semibold text-green-400 mb-2">✅ Tests & Qualité</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li><strong>Tests useFirestore résolus</strong> : Approche unitaire pour éviter les problèmes de mémoire</li>
                <li><strong>23 tests passent</strong> : Couverture complète des fonctions métier</li>
                <li><strong>Tests rapides</strong> : Exécution en 2.84s vs 30s+ avant</li>
                <li><strong>Validation des données</strong> : Tests de structure, calculs et formats</li>
                <li><strong>CI/CD robuste</strong> : Workflows GitHub Actions optimisés</li>
              </ul>
            </div>

          </div>
        </CollapsibleCard>

        <CollapsibleCard title="v1.9.2 — 🎨 Interface Moderne & Export de Données" defaultOpen={false}>
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

        <CollapsibleCard title="📚 Guide &amp; Support" defaultOpen={false}>
          <p className="text-sm text-white/70">
            Consultez le <Link href="/guide" className="underline decoration-dotted text-neon-purple hover:text-neon-purple/80">Guide</Link> pour une vue d&apos;ensemble des modules et des bonnes pratiques d&apos;utilisation.
          </p>
        </CollapsibleCard>
      </div>
    </MainLayout>
  )
}


