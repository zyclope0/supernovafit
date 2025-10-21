'use client';

import MainLayout from '@/components/layout/MainLayout';
import type { ComponentType } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Rocket,
  ChefHat,
  Dumbbell,
  Ruler,
  MessageCircle,
  Shield,
  Link as LinkIcon,
  Monitor,
  Smartphone,
  Zap,
  Users,
  Settings,
} from 'lucide-react';
import { APP_VERSION } from '@/lib/constants';

export default function GuidePage() {
  const Section = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: ComponentType<{ className?: string }>;
    children: React.ReactNode;
  }) => (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-neon-cyan" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="text-sm text-muted-foreground space-y-2">{children}</div>
    </div>
  );

  const Pill = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10"
    >
      {label}
    </Link>
  );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-effect p-6 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-6 w-6 text-neon-purple flex-shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold neon-text truncate">
                Guide Complet SuperNovaFit v{APP_VERSION}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Guide complet avec toutes les fonctionnalités : Desktop & Mobile,
              Templates rapides, Dashboards adaptatifs
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
            <Link
              href="/nouveautes"
              className="px-3 py-2 rounded-lg bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 text-sm"
            >
              Nouveautés v{APP_VERSION}
            </Link>
            <Link
              href="/auth#comptes-de-test"
              className="px-3 py-2 rounded-lg bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 text-sm"
            >
              Comptes de test
            </Link>
          </div>
        </div>

        {/* Présentation générale */}
        <Section title="Présentation" icon={Rocket}>
          <p>
            SuperNovaFit est une application de suivi 1:1 pensée pour un{' '}
            <strong className="text-white">sportif</strong> et son{' '}
            <strong className="text-white">coach</strong>. Le sportif enregistre
            son alimentation, ses entraînements, ses mesures et son journal; le
            coach dépose des
            <strong className="text-white"> recommandations</strong> et des{' '}
            <strong className="text-white">commentaires contextuels</strong> sur
            les éléments clés.
          </p>
          <ul className="list-disc list-inside">
            <li>
              <span className="text-white">Sportif</span>: ajoute des données
              (repas, séances, mesures, entrées de journal), suit sa progression
              et ses objectifs.
            </li>
            <li>
              <span className="text-white">Coach</span>: commente par
              date/élément, propose des plans et suit l’adhérence (historique,
              graphiques).
            </li>
          </ul>
        </Section>

        {/* Interface Adaptive */}
        <Section
          title="🖥️📱 Interface Adaptive Desktop & Mobile"
          icon={Monitor}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neon-purple/10 p-3 rounded-lg border border-neon-purple/20">
              <h3 className="font-semibold text-neon-purple mb-2 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Desktop (≥1280px)
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>Layout professionnel</strong> : Sidebar riche 320px +
                  contenu principal
                </li>
                <li>
                  <strong>6 stats temps réel</strong> : Calories, protéines,
                  poids, séances, brûlées, humeur
                </li>
                <li>
                  <strong>4 graphiques HD</strong> : Balance énergétique,
                  calories, macros, poids & IMC
                </li>
                <li>
                  <strong>Sélecteur période</strong> :
                  Aujourd&apos;hui/Semaine/Mois fonctionnel
                </li>
                <li>
                  <strong>Actions rapides</strong> : Navigation directe avec
                  feedback toast
                </li>
              </ul>
            </div>
            <div className="bg-neon-cyan/10 p-3 rounded-lg border border-neon-cyan/20">
              <h3 className="font-semibold text-neon-cyan mb-2 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile (&lt;1280px)
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>Bottom Navigation</strong> : Navigation principale
                  toujours accessible
                </li>
                <li>
                  <strong>FAB Contextuel</strong> : Bouton flottant intelligent
                  par page
                </li>
                <li>
                  <strong>Templates rapides</strong> : Repas 30s, entraînements
                  45s, poids instantané
                </li>
                <li>
                  <strong>Widgets configurables</strong> : Dashboard avec
                  données temps réel
                </li>
                <li>
                  <strong>Interactions tactiles</strong> : Swipe, zoom, pan sur
                  graphiques
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Démarrage rapide */}
        <Section title="🚀 Démarrage rapide" icon={Rocket}>
          <ul className="list-disc list-inside">
            <li>
              Connectez‑vous avec un des{' '}
              <strong className="text-white">comptes de test</strong> sur la
              page{' '}
              <Link href="/auth" className="text-neon-cyan underline">
                /auth
              </Link>
              .
            </li>
            <li>
              <strong>Desktop</strong> : Sidebar gauche avec navigation complète
              et stats temps réel
            </li>
            <li>
              <strong>Mobile</strong> : Bottom Navigation + FAB pour actions
              rapides contextuelles
            </li>
            <li>
              Les <strong className="text-white">messages du coach</strong>{' '}
              s&apos;affichent dans chaque module, à la date ou sur
              l&apos;élément concerné.
            </li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <Pill href="/" label="Dashboard" />
            <Pill href="/diete" label="Diète" />
            <Pill href="/entrainements" label="Entraînements" />
            <Pill href="/mesures" label="Mesures" />
            <Pill href="/journal" label="Journal" />
          </div>
        </Section>

        {/* Templates Ultra-Rapides */}
        <Section title="⚡ Templates Ultra-Rapides (Mobile)" icon={Zap}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
              <h3 className="font-semibold text-orange-400 mb-2">
                🍽️ Repas Express (30s)
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Templates prédéfinis par type de repas</li>
                <li>Favoris et portions rapides</li>
                <li>Recherche Open Food Facts intégrée</li>
                <li>Macros calculées automatiquement</li>
              </ul>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <h3 className="font-semibold text-blue-400 mb-2">
                🏃 Entraînements (45s)
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Types d&apos;activité prédéfinis</li>
                <li>Calcul automatique calories (MET)</li>
                <li>Durée et intensité rapides</li>
                <li>Import Garmin TCX/GPX</li>
              </ul>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
              <h3 className="font-semibold text-green-400 mb-2">
                ⚖️ Poids Instantané (15s)
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Saisie poids avec suggestions</li>
                <li>Calcul automatique IMC</li>
                <li>Tendance visuelle immédiate</li>
                <li>Historique graphique</li>
              </ul>
            </div>
            <div className="bg-pink-500/10 p-3 rounded-lg border border-pink-500/20">
              <h3 className="font-semibold text-pink-400 mb-2">
                💭 Journal Rapide (20s)
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>Sliders tactiles humeur/énergie</li>
                <li>Sommeil et stress rapides</li>
                <li>Notes vocales ou texte</li>
                <li>Corrélations automatiques</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Comptes de test */}
        <div id="comptes-de-test" className="-mt-4" />
        <Section title="Comptes de test" icon={BookOpen}>
          <div className="text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-white font-medium">Coach</div>
                <div className="text-white/80 text-xs">
                  Email: coach@supernovafit.com
                </div>
                <div className="text-white/80 text-xs">
                  Mot de passe: Coach123!
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-white font-medium">Athlète</div>
                <div className="text-white/80 text-xs">
                  Email: test@supernovafit.com
                </div>
                <div className="text-white/80 text-xs">
                  Mot de passe: Test123!
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Diète */}
        <Section title="🍽️ Diète & Nutrition" icon={ChefHat}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-orange-400 mb-2">
                Fonctionnalités Core
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>6 types de repas</strong> : Petit-déj, collations,
                  déjeuner, dîner
                </li>
                <li>
                  <strong>Open Food Facts</strong> : 2M+ aliments avec recherche
                  fuzzy
                </li>
                <li>
                  <strong>Saisie manuelle</strong> : Aliments personnalisés avec
                  macros
                </li>
                <li>
                  <strong>Menu-types</strong> : Templates prédéfinis pour saisie
                  rapide
                </li>
                <li>
                  <strong>Favoris & portions</strong> : Accès rapide aux
                  aliments fréquents
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-orange-400 mb-2">
                Analytics & Coach
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>Macros temps réel</strong> : Protéines, glucides,
                  lipides, calories
                </li>
                <li>
                  <strong>Barres de progression</strong> : Objectifs vs consommé
                </li>
                <li>
                  <strong>Historique 30j</strong> : Pagination et filtrages
                  avancés
                </li>
                <li>
                  <strong>Commentaires coach</strong> : Messages datés
                  contextuels
                </li>
                <li>
                  <strong>Plans diète</strong> : Recommandations personnalisées
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-2 text-xs">
            Raccourcis: <Pill href="/diete" label="Diète" />
          </div>
        </Section>

        {/* Entraînements */}
        <Section title="🏃 Entraînements" icon={Dumbbell}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">
                Saisie & Import
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>Types d&apos;activité</strong> : Course, vélo, muscu,
                  natation, etc.
                </li>
                <li>
                  <strong>Calcul MET</strong> : Calories automatiques selon
                  intensité
                </li>
                <li>
                  <strong>Import Garmin</strong> : Fichiers TCX/GPX avec
                  dédoublonnage
                </li>
                <li>
                  <strong>Fréquence cardiaque</strong> : Zones et intensité
                </li>
                <li>
                  <strong>Templates rapides</strong> : Séances prédéfinies
                  (mobile)
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">
                Analytics & Suivi
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>4 graphiques</strong> : Volume, calories, répartition,
                  évolution
                </li>
                <li>
                  <strong>Historique 30j</strong> : Filtrages et indicateurs
                  coach
                </li>
                <li>
                  <strong>Statistiques</strong> : Séances/semaine, calories
                  brûlées
                </li>
                <li>
                  <strong>Commentaires coach</strong> : Par séance avec
                  notifications
                </li>
                <li>
                  <strong>Tendances</strong> : Progression et régularité
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-2 text-xs">
            Raccourcis: <Pill href="/entrainements" label="Entraînements" />
          </div>
        </Section>

        {/* Mesures */}
        <Section title="⚖️ Mesures & Photos" icon={Ruler}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-green-400 mb-2">
                Mesures Corporelles
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>Poids & IMC</strong> : Calcul automatique avec
                  tendances
                </li>
                <li>
                  <strong>Composition</strong> : Masse grasse, masse musculaire
                </li>
                <li>
                  <strong>Mensurations</strong> : Tour de taille, hanches, bras,
                  etc.
                </li>
                <li>
                  <strong>Saisie rapide</strong> : Templates mobile 15 secondes
                </li>
                <li>
                  <strong>Graphiques HD</strong> : Évolution multi-axes
                  (desktop)
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-green-400 mb-2">
                Photos & Progression
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>Upload sécurisé</strong> : Firebase Storage optimisé
                </li>
                <li>
                  <strong>Catégories</strong> : Face, profil, dos, détails
                </li>
                <li>
                  <strong>Comparaisons</strong> : Avant/Après automatiques
                </li>
                <li>
                  <strong>Galerie</strong> : Historique visuel progression
                </li>
                <li>
                  <strong>Commentaires coach</strong> : Feedback contextualisé
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-2 text-xs">
            Raccourcis: <Pill href="/mesures" label="Mesures" />
          </div>
        </Section>

        {/* Journal */}
        <Section title="📖 Journal & Motivation" icon={BookOpen}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">
                Tracking Quotidien
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>5 métriques</strong> : Humeur, énergie, sommeil,
                  stress, motivation
                </li>
                <li>
                  <strong>Sliders tactiles</strong> : Saisie rapide mobile
                  intuitive
                </li>
                <li>
                  <strong>Notes libres</strong> : Texte, vocal, photos
                  contextuelles
                </li>
                <li>
                  <strong>Corrélations</strong> : Analyse tendances 7 jours
                </li>
                <li>
                  <strong>Templates</strong> : Journal rapide 20 secondes
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">
                Gamification
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>50+ challenges</strong> : Objectifs personnalisés
                </li>
                <li>
                  <strong>Badges automatiques</strong> : Récompenses progression
                </li>
                <li>
                  <strong>Streaks</strong> : Séries de réussites
                </li>
                <li>
                  <strong>Objectifs SMART</strong> : Spécifiques, mesurables
                </li>
                <li>
                  <strong>Coach feedback</strong> : Encouragements personnalisés
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-2 text-xs">
            Raccourcis: <Pill href="/journal" label="Journal" />
          </div>
        </Section>

        {/* Mode Coach */}
        <Section title="👨‍🏫 Mode Coach" icon={Users}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-neon-cyan mb-2">
                Dashboard Coach
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>Vue athlètes</strong> : Liste complète avec statuts
                </li>
                <li>
                  <strong>Métriques temps réel</strong> : Adherence, progression
                </li>
                <li>
                  <strong>Alertes</strong> : Notifications manques de données
                </li>
                <li>
                  <strong>Rapports</strong> : Synthèses hebdomadaires/mensuelles
                </li>
                <li>
                  <strong>Planning</strong> : Programmes d&apos;entraînement
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-neon-cyan mb-2">
                Outils Coach
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>Commentaires contextuels</strong> : Par module, date,
                  élément
                </li>
                <li>
                  <strong>Plans diète</strong> : 6 repas personnalisés
                </li>
                <li>
                  <strong>Recommandations</strong> : Macros, calories, objectifs
                </li>
                <li>
                  <strong>Invitations</strong> : Système coach → athlète
                </li>
                <li>
                  <strong>Historique complet</strong> : Accès toutes données
                  athlète
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-2 text-xs">
            Raccourcis: <Pill href="/coach" label="Dashboard Coach" />
          </div>
        </Section>

        {/* Commentaires coach */}
        <Section title="Commentaires du coach" icon={MessageCircle}>
          <p>
            Les commentaires sont{' '}
            <strong className="text-white">contextuels</strong> et s’affichent
            directement dans le module concerné (diète par date, entraînement
            par séance, journal par entrée, mesures par mesure). Vous pouvez{' '}
            <strong className="text-white">marquer comme lu</strong> chaque
            message.
          </p>
        </Section>

        {/* Fonctionnalités Avancées */}
        <Section title="⚙️ Fonctionnalités Avancées" icon={Settings}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-neon-green mb-2">
                Calculs Automatiques
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>BMR/TDEE</strong> : Métabolisme basal et dépense
                  énergétique
                </li>
                <li>
                  <strong>Calcul MET</strong> : Calories brûlées selon activité
                </li>
                <li>
                  <strong>IMC & composition</strong> : Indices corporels
                  automatiques
                </li>
                <li>
                  <strong>Macros personnalisés</strong> : Recommandations selon
                  profil
                </li>
                <li>
                  <strong>Balance énergétique</strong> : Consommé vs dépensé
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-neon-green mb-2">
                PWA & Performance
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>PWA complète</strong> : Installation, offline,
                  notifications
                </li>
                <li>
                  <strong>Bundle optimisé</strong> : 221KB First Load JS
                </li>
                <li>
                  <strong>Lazy loading</strong> : Graphiques et modales
                  dynamiques
                </li>
                <li>
                  <strong>Service Worker</strong> : Cache intelligent et mise à
                  jour
                </li>
                <li>
                  <strong>Responsive design</strong> : Mobile-first avec
                  breakpoints
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Sécurité & Accès */}
        <Section title="🔒 Sécurité & Accès" icon={Shield}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-red-400 mb-2">
                Authentification
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>Firebase Auth</strong> : Email/password sécurisé
                </li>
                <li>
                  <strong>AuthGuard</strong> : Protection routes automatique
                </li>
                <li>
                  <strong>Sessions</strong> : Gestion tokens et refresh
                </li>
                <li>
                  <strong>Rôles</strong> : Coach vs Sportif avec permissions
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-red-400 mb-2">
                Données & Storage
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                <li>
                  <strong>Firestore Rules</strong> : Least privilege par user_id
                </li>
                <li>
                  <strong>Storage sécurisé</strong> : Photos avec URLs signées
                </li>
                <li>
                  <strong>Validation</strong> : Zod sur tous formulaires
                </li>
                <li>
                  <strong>Monitoring</strong> : Sentry pour erreurs production
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Liens utiles */}
        <Section title="🔗 Liens utiles" icon={LinkIcon}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-neon-purple mb-2">
                Navigation Principale
              </h3>
              <div className="flex flex-wrap gap-2">
                <Pill href="/auth" label="Authentification" />
                <Pill href="/" label="Dashboard" />
                <Pill href="/profil" label="Profil" />
                <Pill href="/menu" label="Menu Mobile" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-neon-cyan mb-2">
                Modules Core
              </h3>
              <div className="flex flex-wrap gap-2">
                <Pill href="/diete" label="Diète" />
                <Pill href="/entrainements" label="Entraînements" />
                <Pill href="/mesures" label="Mesures" />
                <Pill href="/journal" label="Journal" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-neon-green mb-2">
                Fonctionnalités
              </h3>
              <div className="flex flex-wrap gap-2">
                <Pill href="/coach" label="Mode Coach" />
                <Pill href="/challenges" label="Challenges" />
                <Pill href="/export" label="Export Données" />
                <Pill href="/nouveautes" label="Nouveautés" />
              </div>
            </div>
          </div>
        </Section>
      </div>
    </MainLayout>
  );
}
