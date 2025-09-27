'use client'

import Link from 'next/link'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import MainLayout from '@/components/layout/MainLayout'
import { Calendar, Smartphone, BarChart3, Shield, Zap, Users, Target, FileText } from 'lucide-react'

export default function NouveautesPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">SuperNovaFit v2.0</h1>
          <p className="text-lg text-gray-300">Interface entièrement repensée pour une expérience optimale</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Janvier 2025</span>
          </div>
        </div>

        {/* Version 2.0 - Refonte complète */}
        <CollapsibleCard title="v2.0.0 — Refonte complète de l'interface" defaultOpen>
          <div className="space-y-4">
            
            {/* Interface unifiée */}
            <div className="bg-neon-purple/10 p-4 rounded-lg border border-neon-purple/20">
              <h3 className="font-semibold text-neon-purple mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Interface unifiée
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-2">
                <li>Design cohérent sur toutes les pages (Journal, Diète, Entraînements, Mesures, Challenges)</li>
                <li>Composants standardisés pour une navigation intuitive</li>
                <li>Modals harmonisées avec cadre blanc et effets de transparence</li>
                <li>Boutons d&apos;action flottants (FAB) pour un accès rapide aux fonctions principales</li>
              </ul>
            </div>

            {/* Performance améliorée */}
            <div className="bg-neon-green/10 p-4 rounded-lg border border-neon-green/20">
              <h3 className="font-semibold text-neon-green mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-2">
                <li>Chargement 44% plus rapide (Bundle optimisé de 395KB à 221KB)</li>
                <li>Temps de construction réduit de 30% (30s à 21s)</li>
                <li>Interface responsive optimisée pour mobile et desktop</li>
                <li>Navigation fluide entre les sections</li>
              </ul>
            </div>

            {/* Accessibilité */}
            <div className="bg-neon-cyan/10 p-4 rounded-lg border border-neon-cyan/20">
              <h3 className="font-semibold text-neon-cyan mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Accessibilité
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-2">
                <li>Conformité WCAG 2.1 AAA (95% des critères respectés)</li>
                <li>Navigation clavier complète (Tab, Escape, Entrée)</li>
                <li>Annonces vocales pour les actions importantes</li>
                <li>Contraste optimisé pour tous les utilisateurs</li>
                <li>Support des lecteurs d&apos;écran</li>
              </ul>
            </div>

            {/* Système de badges */}
            <div className="bg-neon-yellow/10 p-4 rounded-lg border border-neon-yellow/20">
              <h3 className="font-semibold text-neon-yellow mb-3 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Système de badges
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-2">
                <li>17 badges disponibles pour motiver votre progression</li>
                <li>Attribution automatique basée sur vos actions</li>
                <li>Categories : Série, Performance, Objectifs, Spéciaux</li>
                <li>Système de niveaux avec points d&apos;expérience</li>
                <li>Notifications pour les nouveaux badges obtenus</li>
              </ul>
            </div>

            {/* Pages améliorées */}
            <div className="bg-neon-pink/10 p-4 rounded-lg border border-neon-pink/20">
              <h3 className="font-semibold text-neon-pink mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pages améliorées
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-2">
                <li><strong>Journal</strong> : Interface épurée avec entrées compactes et historique optimisé</li>
                <li><strong>Diète</strong> : Barres de progression visuelles et conseils nutritionnels intelligents</li>
                <li><strong>Entraînements</strong> : Formulaires en modal et suivi de performance amélioré</li>
                <li><strong>Mesures</strong> : Indicateurs de santé avec zones de référence médicales</li>
                <li><strong>Challenges</strong> : Système de gamification complet avec progression visuelle</li>
              </ul>
            </div>

            {/* Fonctionnalités techniques */}
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <h3 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Fonctionnalités techniques
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-2">
                <li>Code optimisé et maintenable (0 erreur ESLint)</li>
                <li>Composants réutilisables pour une cohérence parfaite</li>
                <li>Synchronisation temps réel avec Firebase</li>
                <li>Gestion d&apos;erreurs robuste avec notifications utilisateur</li>
                <li>Tests automatisés pour garantir la stabilité</li>
              </ul>
            </div>

          </div>
        </CollapsibleCard>

        {/* Versions précédentes - Historique complet */}
        <CollapsibleCard title="Versions précédentes" defaultOpen={false}>
          <div className="space-y-4">
            
            {/* v1.13.0 */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-3">v1.13.0 — ⚡ Optimisations Dashboard & Diète</h4>
              <div className="space-y-3">
                <div className="bg-neon-green/10 p-3 rounded-lg border border-neon-green/20">
                  <h5 className="font-semibold text-neon-green mb-2">⚡ Centralisation Énergétique</h5>
                  <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                    <li><strong>Hook useEnergyBalance</strong> : Calculs TDEE/sport centralisés pour cohérence absolue</li>
                    <li><strong>Pondération sport</strong> : Correction double comptage selon niveau activité (facteur 0.1-0.9)</li>
                    <li><strong>Tests complets</strong> : 4 scénarios de validation pour fiabilité</li>
                    <li><strong>Performance</strong> : Suppression de 45 lignes de code dupliqué</li>
                  </ul>
                </div>
                <div className="bg-neon-cyan/10 p-3 rounded-lg border border-neon-cyan/20">
                  <h5 className="font-semibold text-neon-cyan mb-2">📅 Correction Calcul Semaine</h5>
                  <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                    <li><strong>Standard français</strong> : Semaine lundi→dimanche (ISO 8601)</li>
                    <li><strong>4 fichiers corrigés</strong> : Dashboard, Mobile, Entrainements, Challenges</li>
                    <li><strong>Mode semaine fonctionnel</strong> : Données complètes 7 jours</li>
                    <li><strong>Impact UX</strong> : Plus de graphiques vides le dimanche</li>
                  </ul>
                </div>
                <div className="bg-neon-purple/10 p-3 rounded-lg border border-neon-purple/20">
                  <h5 className="font-semibold text-neon-purple mb-2">📊 Page Diète Révolutionnaire</h5>
                  <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                    <li><strong>Header macros</strong> : 4 barres progression + conseils intelligents + toggle période</li>
                    <li><strong>Sections collapsibles</strong> : Réduction 60% hauteur page, charge cognitive optimisée</li>
                    <li><strong>Analyse evidence-based</strong> : 5 insights scientifiques (timing, régularité, protéines, tendances, diversité)</li>
                    <li><strong>UX coach optimisée</strong> : Suppression double clic, intégration directe</li>
                    <li><strong>Objectifs adaptatifs</strong> : Multiplication automatique selon période (jour/semaine)</li>
                  </ul>
                </div>
                <div className="bg-neon-yellow/10 p-3 rounded-lg border border-neon-yellow/20">
                  <h5 className="font-semibold text-neon-yellow mb-2">📈 Graphiques Motivationnels</h5>
                  <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                    <li><strong>Domaines dynamiques</strong> : Y-axis adapté aux données utilisateur pour amplifier progrès</li>
                    <li><strong>Statistiques motivantes</strong> : Changement total, pourcentage, tendance récente</li>
                    <li><strong>Adaptation période</strong> : Filtrage données selon sélection (aujourd&apos;hui/semaine/mois)</li>
                    <li><strong>Visual feedback</strong> : Dots plus gros, couleurs motivantes, marges asymétriques</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* v1.12.0 */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">v1.12.0 — 🖥️ Interface Desktop</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Optimisation interface desktop avec navigation améliorée</li>
                <li>Layout responsive pour écrans larges</li>
                <li>Améliorations ergonomiques pour utilisation au bureau</li>
              </ul>
            </div>

            {/* v1.11.0 */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">v1.11.0 — 📱 Interface Mobile</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Interface mobile-first optimisée</li>
                <li>Navigation tactile améliorée</li>
                <li>Performance mobile optimisée</li>
              </ul>
            </div>

            {/* v1.9.4 */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">v1.9.4 — ⚡ Performance & Sécurité</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Optimisations de performance majeures</li>
                <li>Renforcement de la sécurité</li>
                <li>Corrections de bugs critiques</li>
              </ul>
            </div>

            {/* v1.9.2 */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">v1.9.2 — 🎨 Interface Moderne & Export de Données</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Nouveau design moderne avec thème espace</li>
                <li>Système d&apos;export de données complet</li>
                <li>Améliorations visuelles majeures</li>
              </ul>
            </div>

            {/* v1.9.1 */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">v1.9.1 — 🎨 Interface Coach Améliorée</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Interface coach repensée</li>
                <li>Fonctionnalités de suivi améliorées</li>
                <li>Communication coach-athlète optimisée</li>
              </ul>
            </div>

            {/* v1.8.4 */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">v1.8.4 — 📊 Gestion Complète des Athlètes</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Gestion complète des profils athlètes</li>
                <li>Suivi détaillé des performances</li>
                <li>Tableaux de bord personnalisés</li>
              </ul>
            </div>

            {/* v1.8.3 */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">v1.8.3 — 🛡️ Gestion d&apos;Erreurs Améliorée</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Système de gestion d&apos;erreurs robuste</li>
                <li>Notifications utilisateur améliorées</li>
                <li>Récupération automatique d&apos;erreurs</li>
              </ul>
            </div>

            {/* v1.8.2 */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">v1.8.2 — ⚡ Performance Optimisée</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Optimisations de vitesse de chargement</li>
                <li>Amélioration de la réactivité</li>
                <li>Bundle size réduit</li>
              </ul>
            </div>

            {/* v1.7.0 */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">v1.7.0 — 🧪 Environnement de Test</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Mise en place des tests automatisés</li>
                <li>Environnement de développement optimisé</li>
                <li>Tests de régression implémentés</li>
              </ul>
            </div>

            {/* v1.6.0 */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">v1.6.0 — 🎯 Interface Coach</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Interface coach dédiée</li>
                <li>Outils de suivi des athlètes</li>
                <li>Communication intégrée</li>
              </ul>
            </div>

            {/* v1.5.0 */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">v1.5.0 — 🤝 Système d&apos;Invitations</h4>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Système d&apos;invitation coach-athlète</li>
                <li>Gestion des relations</li>
                <li>Workflow d&apos;onboarding</li>
              </ul>
            </div>

          </div>
        </CollapsibleCard>

        {/* Navigation rapide */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Découvrir les nouvelles fonctionnalités
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link 
              href="/journal" 
              className="p-3 bg-neon-purple/10 hover:bg-neon-purple/20 rounded-lg border border-neon-purple/20 transition-colors text-center"
            >
              <div className="text-2xl mb-1">📝</div>
              <div className="text-sm font-medium text-white">Journal</div>
            </Link>
            <Link 
              href="/diete" 
              className="p-3 bg-neon-green/10 hover:bg-neon-green/20 rounded-lg border border-neon-green/20 transition-colors text-center"
            >
              <div className="text-2xl mb-1">🍎</div>
              <div className="text-sm font-medium text-white">Diète</div>
            </Link>
            <Link 
              href="/entrainements" 
              className="p-3 bg-neon-cyan/10 hover:bg-neon-cyan/20 rounded-lg border border-neon-cyan/20 transition-colors text-center"
            >
              <div className="text-2xl mb-1">💪</div>
              <div className="text-sm font-medium text-white">Entraînements</div>
            </Link>
            <Link 
              href="/challenges" 
              className="p-3 bg-neon-yellow/10 hover:bg-neon-yellow/20 rounded-lg border border-neon-yellow/20 transition-colors text-center"
            >
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-medium text-white">Challenges</div>
            </Link>
          </div>
        </div>

        {/* Note de version */}
        <div className="text-center text-sm text-gray-400">
          <p>SuperNovaFit v2.0.0 - Interface entièrement repensée pour votre bien-être</p>
          <p className="mt-1">Pour toute question ou suggestion, contactez votre coach.</p>
        </div>

      </div>
    </MainLayout>
  )
}