'use client'

import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'
import { BookOpen, Rocket, ChefHat, Dumbbell, Ruler, MessageCircle, Shield, Link as LinkIcon } from 'lucide-react'

export default function GuidePage() {
  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-neon-cyan" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="text-sm text-muted-foreground space-y-2">
        {children}
      </div>
    </div>
  )

  const Pill = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10">
      {label}
    </Link>
  )

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-effect p-6 rounded-xl border border-white/10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-6 w-6 text-neon-purple" />
              <h1 className="text-2xl font-bold neon-text">Guide Complet SuperNovaFit</h1>
            </div>
            <p className="text-sm text-muted-foreground">Tout ce qu’il faut pour bien démarrer et maîtriser l’application (1 sportif + 1 coach).</p>
          </div>
          <Link href="/auth#comptes-de-test" className="px-3 py-2 rounded-lg bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 text-sm">Comptes de test</Link>
        </div>

        {/* Présentation générale */}
        <Section title="Présentation" icon={Rocket}>
          <p>
            SuperNovaFit est une application de suivi 1:1 pensée pour un <strong className="text-white">sportif</strong> et son <strong className="text-white">coach</strong>.
            Le sportif enregistre son alimentation, ses entraînements, ses mesures et son journal; le coach dépose des
            <strong className="text-white"> recommandations</strong> et des <strong className="text-white">commentaires contextuels</strong> sur les éléments clés.
          </p>
          <ul className="list-disc list-inside">
            <li><span className="text-white">Sportif</span>: ajoute des données (repas, séances, mesures, entrées de journal), suit sa progression et ses objectifs.</li>
            <li><span className="text-white">Coach</span>: commente par date/élément, propose des plans et suit l’adhérence (historique, graphiques).</li>
          </ul>
        </Section>

        {/* Démarrage rapide */}
        <Section title="Démarrage rapide" icon={Rocket}>
          <ul className="list-disc list-inside">
            <li>Connectez‑vous avec un des <strong className="text-white">comptes de test</strong> sur la page <Link href="/auth" className="text-neon-cyan underline">/auth</Link>.</li>
            <li>Accédez aux modules via la barre latérale: <span className="text-white">Diète</span>, <span className="text-white">Entraînements</span>, <span className="text-white">Mesures & Photos</span>, <span className="text-white">Journal</span>.</li>
            <li>Les <strong className="text-white">messages du coach</strong> s’affichent dans chaque module, à la date ou sur l’élément concerné.</li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <Pill href="/diete" label="Aller à Diète" />
            <Pill href="/entrainements" label="Aller à Entraînements" />
            <Pill href="/mesures" label="Aller à Mesures" />
            <Pill href="/journal" label="Aller à Journal" />
          </div>
        </Section>

        {/* Comptes de test */}
        <div id="comptes-de-test" className="-mt-4" />
        <Section title="Comptes de test" icon={BookOpen}>
          <div className="text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-white font-medium">Coach</div>
                <div className="text-white/80 text-xs">Email: coach@supernovafit.com</div>
                <div className="text-white/80 text-xs">Mot de passe: Coach123!</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-white font-medium">Athlète</div>
                <div className="text-white/80 text-xs">Email: test@supernovafit.com</div>
                <div className="text-white/80 text-xs">Mot de passe: Test123!</div>
              </div>
            </div>
          </div>
        </Section>

        {/* Diète */}
        <Section title="Diète & Nutrition" icon={ChefHat}>
          <ul className="list-disc list-inside">
            <li>Ajoutez des repas (6 types) avec recherche Open Food Facts ou saisie manuelle.</li>
            <li>Utilisez les <em>menu‑types</em> pour appliquer des modèles en un clic.</li>
            <li>Visualisez les <strong className="text-white">macros</strong> et le <strong className="text-white">résumé du jour</strong> (barres de progression).</li>
            <li>Consultez les <strong className="text-white">recommandations du coach</strong> (texte) et ses <strong className="text-white">messages datés</strong>.</li>
            <li>Historique 30 jours avec pagination; recherche aliments fuzzy; favoris et portions rapides.</li>
          </ul>
          <div className="pt-2 text-xs">Raccourcis: <Pill href="/diete" label="Diète" /></div>
        </Section>

        {/* Entraînements */}
        <Section title="Entraînements" icon={Dumbbell}>
          <ul className="list-disc list-inside">
            <li>Créez/éditez vos séances (type, durée, calories estimées automatiques).</li>
            <li>Importez des activités Garmin (TCX/GPX), dédoublonnage automatique.</li>
            <li>Analysez vos données: volume, répartition, fréquence cardiaque, intensité.</li>
            <li>Historique 30 jours ergonomique avec indicateurs de commentaires coach, filtre par date, “3 dernières séances”.</li>
          </ul>
          <div className="pt-2 text-xs">Raccourcis: <Pill href="/entrainements" label="Entraînements" /></div>
        </Section>

        {/* Mesures */}
        <Section title="Mesures & Photos" icon={Ruler}>
          <ul className="list-disc list-inside">
            <li>Enregistrez poids, IMC, %MG, mensurations. Visualisez l’évolution (graphiques).</li>
            <li>Ajoutez des photos de progression, comparez Avant/Après par catégorie.</li>
            <li>Le coach peut commenter des mesures; les messages apparaissent ici.</li>
            <li>Graphiques: Poids/IMC (double axe), composition corporelle, mensurations multi‑lignes.</li>
          </ul>
          <div className="pt-2 text-xs">Raccourcis: <Pill href="/mesures" label="Mesures" /></div>
        </Section>

        {/* Journal */}
        <Section title="Journal & Motivation" icon={BookOpen}>
          <ul className="list-disc list-inside">
            <li>Notes quotidiennes: humeur, énergie, sommeil, stress, motivation.</li>
            <li>Photos libres (galerie), objectifs simples, badges automatiques.</li>
            <li>Corrélations 7 jours (tendance), historique pratique avec commentaires coach et pagination.</li>
          </ul>
          <div className="pt-2 text-xs">Raccourcis: <Pill href="/journal" label="Journal" /></div>
        </Section>

        {/* Commentaires coach */}
        <Section title="Commentaires du coach" icon={MessageCircle}>
          <p>
            Les commentaires sont <strong className="text-white">contextuels</strong> et s’affichent directement dans le module
            concerné (diète par date, entraînement par séance, journal par entrée, mesures par mesure).
            Vous pouvez <strong className="text-white">marquer comme lu</strong> chaque message.
          </p>
        </Section>

        {/* Sécurité & Accès */}
        <Section title="Sécurité & Accès" icon={Shield}>
          <ul className="list-disc list-inside">
            <li>Authentification Firebase (email/mot de passe, lien magique).</li>
            <li>Règles Firestore « least privilege » adaptées au modèle 1:1 (coach/sportif).</li>
            <li>Stockage sécurisé des photos (Firebase Storage), URLs signées.</li>
          </ul>
        </Section>

        {/* Liens utiles */}
        <Section title="Liens utiles" icon={LinkIcon}>
          <div className="flex flex-wrap gap-2">
            <Pill href="/auth" label="Authentification" />
            <Pill href="/" label="Dashboard" />
            <Pill href="/diete" label="Diète" />
            <Pill href="/entrainements" label="Entraînements" />
            <Pill href="/mesures" label="Mesures" />
            <Pill href="/journal" label="Journal" />
          </div>
        </Section>
      </div>
    </MainLayout>
  )
}


