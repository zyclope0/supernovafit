# 🚀 SuperNovaFit — Plateforme Diète & Entraînement

> Application moderne pour suivre sa diète, ses entraînements, ses mesures et sa motivation, avec un Mode Coach 1:1. Stack: Next.js 14, TypeScript, Firebase, Tailwind.

![Next.js](https://img.shields.io/badge/Next.js-14.2.31-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20|%20Auth%20|%20Storage-orange)

## ✨ Modules livrés

- Dashboard temps réel (calories, protéines jour, séances semaine, poids récent)
- Diète & Nutrition: recherche Open Food Facts, saisie manuelle, CRUD repas, favoris, historiques 30j, macros, portions rapides (1/2, +25, 2x), templates repas
- Entraînements: CRUD complet, calcul calories (MET + FC), import Garmin (TCX/GPX) avec détection doublons, 4 graphiques, historique 30j, liste “Tous les entraînements” cliquable
- Mesures & Photos: mesures complètes, IMC, 4 graphiques, upload photos (Storage), galerie, comparaisons, commentaires coach sur mesures
- Journal & Motivation: humeur/énergie/sommeil/stress/météo, notes, badges, objectifs simples, corrélations, photos libres, historique 30j
- Profil Utilisateur: âge/sexe/taille/poids/objectif/niveau activité; calculs BMR/TDEE/IMC; recommandations macros
- Mode Coach (1:1 simplifié): dashboard coach, commentaires contextualisés (diète/entrainements/journal/mesures), plan diète (texte), sections rétractables, badges “nouveaux coms”, “Marquer comme lu”

## 🧱 Stack technique

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Radix UI, Zustand
- Firebase: Auth (Email/Password), Firestore, Storage, Analytics
- Charts: Recharts; Form/Validation: React Hook Form + Zod; Dates: date-fns
- Optimisations: next/dynamic pour charts/modales, next/image (WebP), preconnect images

## ⚙️ Démarrage

1) Installer
```
npm install
```
2) Variables d’env (copier puis éditer selon votre projet Firebase)
```
cp .env.local.example .env.local
```
3) Dev
```
npm run dev
# http://localhost:3000
```
4) Build/Prod local
```
npm run build && npm run start
```

## 🔐 Firebase (prod)

- Règles & Indexes
```
firebase deploy --only firestore:rules,firestore:indexes --project supernovafit-a6fe7
```
- Storage rules (si utilisé)
```
firebase deploy --only storage --project supernovafit-a6fe7
```

## 🚀 Hébergement

- Vercel (recommandé): importer le repo, définir les `NEXT_PUBLIC_*` Firebase, déployer
- Firebase Hosting (SSR Next.js): `firebase experiments:enable webframeworks`, `firebase init hosting`, puis `firebase deploy`

## 📁 Structure

```
src/
  app/              # Pages Next.js (App Router)
  components/       # UI et layout
  hooks/            # Hooks Firebase (useAuth, useFirestore...)
  lib/              # firebase.ts, utils, calculs (BMR/TDEE/MET)
  types/            # Types TypeScript
  styles/           # Tailwind + thèmes
```

## 🧩 Mode Coach — détails

- Commentaires coach par module:
  - Diète: par date
  - Entraînements: par `training_id`
  - Journal: par `entry_id`
  - Mesures: fil global (support `mesure_id` évolutif)
- “Marquer comme lu” (athlète) + règles Firestore dédiées
- Badges “nouveaux commentaires” en sidebar (<24h, non lus)

## ✅ Qualité & Perf

- ESLint/Typecheck OK; imports dynamiques pour charts/modales lourdes; next/image optimisé; preconnect images; pagination sur grandes listes

## 🛣️ Roadmap courte (post‑RC)

- PWA (offline de base), invitations coach → athlète, exports PDF/CSV, pagination avancée, optimisations images supplémentaires, tests e2e

---

SuperNovaFit © 2025 — Thème néon/space. Conçu pour un sportif et son coach.
