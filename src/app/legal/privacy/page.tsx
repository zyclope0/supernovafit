'use client';

import MainLayout from '@/components/layout/MainLayout';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-4 p-4">
        <h1 className="text-xl font-bold neon-text">
          Politique de Confidentialité
        </h1>
        <div className="glass-effect p-4 rounded-xl border border-white/10 text-sm text-white/80">
          <p>
            Ce document décrit l’usage de vos données (Firestore, Storage) dans
            le cadre de SuperNovaFit.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Données collectées: profil, diète, entraînements, mesures,
              journal, photos.
            </li>
            <li>
              Usage: affichage et suivi personnel coach/athlète (1:1),
              améliorations produit.
            </li>
            <li>
              Partage: pas de partage à des tiers hors services Firebase
              nécessaires.
            </li>
            <li>Droits: accès, export et suppression (sur demande).</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
