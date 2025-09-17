# 🚀 SuperNovaFit — Plateforme Diète & Entraînement

> Application moderne **mobile-first** pour suivre sa diète, ses entraînements, ses mesures et sa motivation, avec un Mode Coach 1:1. Interface révolutionnaire avec navigation tactile, templates ultra-rapides et dashboard adaptatif. Stack: Next.js 15, TypeScript, Firebase, PWA.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20|%20Auth%20|%20Storage-orange)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)
![Mobile](https://img.shields.io/badge/Mobile-First-green)
![CI](https://github.com/<owner>/<repo>/actions/workflows/quality.yml/badge.svg)

## ✨ Modules livrés

### 📱 **Interface Mobile-First Révolutionnaire (v1.11)**
- **Bottom Navigation** : Navigation principale toujours accessible en bas d'écran
- **FAB Contextuel** : Bouton flottant intelligent qui s'adapte à chaque page
- **Templates Ultra-Rapides** : Repas en 30s, entraînements en 45s, poids instantané
- **Dashboard Adaptatif** : Widgets mobiles avec interactions tactiles (zoom, swipe)
- **Quick Actions** : Actions contextuelles selon la page visitée

### 🏃‍♂️ **Modules Core**
- **Dashboard temps réel** : Calories, protéines jour, séances semaine, poids récent avec widgets interactifs
- **Diète & Nutrition** : Recherche Open Food Facts, saisie manuelle, CRUD repas, favoris, historiques 30j, macros, portions rapides, suggestions intelligentes
- **Entraînements** : CRUD complet, calcul calories (MET + FC), import Garmin (TCX/GPX), 4 graphiques, templates rapides
- **Mesures & Photos** : Mesures complètes, IMC, 4 graphiques, upload photos (Storage), galerie, comparaisons
- **Journal & Motivation** : Humeur/énergie/sommeil/stress, notes, badges, objectifs, corrélations, saisie tactile
- **Profil Utilisateur** : Calculs BMR/TDEE/IMC, recommandations macros personnalisées
- **Mode Coach** : Dashboard coach, commentaires contextualisés, plan diète, sections rétractables

## 🧱 Stack technique

- **Frontend** : Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Firebase** : Auth (Email/Password), Firestore, Storage, Analytics
- **PWA** : Service Worker, Manifest, Offline support, Installation
- **Mobile** : Bottom Navigation, FAB, Touch gestures, Responsive design
- **Charts** : Recharts avec interactions tactiles; Form/Validation: React Hook Form + Zod
- **Optimisations** : next/dynamic, next/image (AVIF/WebP), bundle splitting, lazy loading

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

## 🔧 Exemple .env.local

```bash
# Firebase (Public keys)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
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

**Note** : Les fichiers de configuration sont maintenant dans `config/`

## 🚀 Hébergement (Firebase Hosting SSR + GitHub Actions)

### Prérequis GCP/Firebase
- Activer APIs: Cloud Functions, Cloud Run, Cloud Build, Artifact Registry, Firebase Extensions, Compute Engine
- Lier la facturation (plan Blaze)
- IAM (compte de service GitHub Actions):
  - roles/firebasehosting.admin
  - roles/cloudfunctions.admin
  - roles/run.admin
  - roles/artifactregistry.writer
  - roles/iam.serviceAccountUser
  - roles/firebasemods.admin
  - (optionnel) roles/serviceusage.serviceUsageAdmin

### Secrets GitHub (Settings → Actions → Secrets)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_SENTRY_DSN` (DSN de ton projet Sentry)
- `FIREBASE_SERVICE_ACCOUNT_SUPERNOVAFIT_A6FE7` (JSON clé compte de service)

### Workflows fournis
- `.github/workflows/firebase-hosting-merge.yml` (déploiement live sur main)
- `.github/workflows/firebase-hosting-pull-request.yml` (préviews PR)

Les workflows construisent l’app (Node 20), injectent les variables, appliquent une policy de cleanup Artifact Registry, puis déploient Hosting avec l’intégration frameworks.

### Commandes locales utiles
```
# Déployer Hosting (si besoin local)
firebase deploy --only hosting --project supernovafit-a6fe7

# Déployer règles & indexes
firebase deploy --only firestore:rules,firestore:indexes --project supernovafit-a6fe7

# Politique cleanup Artifact Registry (images Cloud Functions)
firebase functions:artifacts:setpolicy --location europe-west1 --days 30 --force --project supernovafit-a6fe7
```

### Domaines
- Canonique: `https://supernovafit-a6fe7.web.app`
- Alias legacy: `https://supernovafit-a6fe7.firebaseapp.com`

## 🗄️ Modèle de données (Firestore)
- `users/{userId}`: { id, role: 'coach'|'sportif', nom, email, ... }
- `repas/{id}`: { user_id, date, repas: 'petit_dej'|'collation_matin'|'dejeuner'|'collation_apres_midi'|'diner'|'collation_soir', aliments[], macros }
- `entrainements/{id}`: { user_id, date, type, duree, calories, ... }
- `mesures/{id}`: { user_id, date, poids, imc, masse_grasse, ... }
- `photos/{id}`: { user_id, date, url, type, mesure_id?, commentaire }
- `journal/{id}`: { user_id, date, note, humeur, energie, ... }
- `coach_comments/{id}`: { coach_id, athlete_id, module, date?, training_id?, entry_id?, mesure_id?, comment, read_by_athlete? }
- `coach_diet_plans/{id}`: { coach_id, athlete_id, date_creation, 6 champs repas, notes_generales }

Indexes: voir `config/firestore.indexes.json` (coach_comments, coach_diet_plans, menus_type).

## 📘 Guide développeur (conventions & scripts)

- Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`
- Conventions: Components PascalCase, hooks `use*`, types via interfaces, pas d’inline comments, validation Zod pour formulaires
- Structure: `src/app` (pages), `src/components` (UI/layout), `src/hooks`, `src/lib`, `src/types`, `src/styles`
- Branches: `feature/*`, commits conventionnels (`feat:`, `fix:`, `docs:`)

## 🧭 Runbook Prod
- Déploiement: via GitHub Actions (merge → prod). En cas d’échec, consulter Actions logs.
- Actifs GCP: Cloud Functions v2, Cloud Run images (Artifact Registry). Nettoyage: `firebase functions:artifacts:setpolicy --location europe-west1 --days 30 --force`.
- Rotation secrets: régénérer la clé du compte de service dans GCP, mettre à jour le secret GitHub.
- Restauration: re-run d’un workflow réussi précédent ou rollback du commit.

## 🧑‍⚖️ Légal
- Privacy Policy, Terms, Cookies: pages `/legal/*` (placeholders) et liens depuis le Guide.

## 🧪 CI Qualité
- Jobs recommandés: lint, typecheck, build sur PR. Badge Actions ajouté en tête.

## 📁 Structure

```
SuperNovaFit/
├── src/                    # Code source
│   ├── app/               # Pages Next.js (App Router)
│   ├── components/        # UI et layout
│   ├── hooks/             # Hooks Firebase (useAuth, useFirestore...)
│   ├── lib/               # firebase.ts, utils, calculs (BMR/TDEE/MET)
│   ├── types/             # Types TypeScript
│   └── styles/            # Tailwind + thèmes
├── docs/                   # 📚 Documentation complète
│   ├── phases/            # Plans Option A (PHASE_1, PHASE_3, etc.)
│   ├── guides/            # Guides pratiques (Testing, Monitoring)
│   ├── context/           # Contexte IA et Recovery
│   ├── legal/             # PRIVACY.md, SECURITY.md
│   └── archive/           # Fichiers historiques
├── config/                 # Configuration Firebase
├── examples/               # Fichiers d'exemple (TCX, GPX)
└── README.md              # Ce fichier
```

## 🧩 Mode Coach — détails

- Commentaires coach par module:
  - Diète: par date
  - Entraînements: par `training_id`
  - Journal: par `entry_id`
  - Mesures: fil global (support `mesure_id` évolutif)
- “Marquer comme lu” (athlète) + règles Firestore dédiées
- Badges “nouveaux commentaires” en sidebar (<24h, non lus)

## ✅ Qualité & Perf (Lighthouse home)

- FCP≈0.44s, LCP≈1.31s, TBT≈0.72s, CLS≈0.08
- Imports dynamiques (charts, modales, import Garmin, PhotoUpload)
- next/image + sizes + preconnect images
- Sections historiques fermées par défaut (moins de JS au mount)

## 🛣️ Roadmap courte (post‑RC)

- PWA (offline de base), invitations coach → athlète, exports PDF/CSV, pagination avancée, optimisations images supplémentaires, tests e2e

---

SuperNovaFit © 2025 — Thème néon/space. Conçu pour un sportif et son coach.
