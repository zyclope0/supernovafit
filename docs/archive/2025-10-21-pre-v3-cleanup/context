# 🚀 SUPERNOVAFIT - CONTEXTE PROJET COMPLET V3

**Date**: 21 Octobre 2025 | **Version**: 3.0.0 | **Score Qualité**: 9.6/10 🏆

> **📌 Objectif**: Contexte complet et à jour basé sur l'état réel du code et de la base de données  
> **🎯 Audience**: Développeurs, IA, Nouveaux contributeurs

---

## 📊 **MÉTRIQUES PROJET RÉELLES**

### **Code Source**

```yaml
Total fichiers src/: 227
├── Pages (app/): 30 routes
├── Components: 121 composants
├── Hooks: 20 hooks personnalisés
├── Lib/Utils: 36 fichiers utilitaires
├── Tests: 14 fichiers de tests
└── Types: 3 fichiers TypeScript

Total lignes de code: ~45,000
Langages: TypeScript (100%), CSS (Tailwind)
```

### **Documentation**

```yaml
Total docs/: 156 fichiers Markdown
├── Technical: 40 docs
├── Guides: 12 guides
├── Testing: 8 docs
├── Context: 3 contextes AI
├── Security: 3 analyses
├── Audits: 14 rapports
└── Archive: 69 docs historiques
```

### **Performance Actuelle**

```yaml
Build Time: 10.3s
Bundle Size: 110KB (gzip)
Tests: 308 tests (100% passants)
Coverage: 4.49%
Lighthouse: 95+ (mobile)
```

---

## 🏗️ **ARCHITECTURE TECHNIQUE**

### **Stack Principal**

```typescript
// Frontend
Framework: "Next.js 15.1.0" (App Router + SSR)
Language: "TypeScript 5.3.3" (strict mode)
UI: "Tailwind CSS 3.4" + Glassmorphism
State: React Hooks + Context API
Forms: React Hook Form + Zod
Charts: Recharts (dynamic imports)

// Backend (BaaS)
Database: Firestore (NoSQL, temps réel)
Auth: Firebase Auth (Email/Password)
Storage: Firebase Storage (images, imports)
Functions: Cloud Functions (optionnel)

// DevOps
Hosting: Firebase Hosting + Cloud Run
CI/CD: GitHub Actions (quality + deploy)
Monitoring: Sentry (error tracking)
Analytics: Firebase Analytics
```

### **Dépendances Clés**

```json
{
  "next": "15.1.0",
  "react": "19.0.0",
  "firebase": "12.1.0",
  "typescript": "5.3.3",
  "tailwindcss": "3.4.17",
  "recharts": "2.15.0",
  "date-fns": "4.1.0",
  "zod": "3.24.1",
  "react-hook-form": "7.54.2"
}
```

---

## 📁 **STRUCTURE CODE DÉTAILLÉE**

### **`src/app/` - 30 Routes (App Router)**

```
app/
├── page.tsx                    # Dashboard principal (3 variantes)
├── auth/                       # Authentification
│   └── page.tsx               # Login/Register
├── diete/                      # Module Nutrition
│   └── page.tsx               # 504 repas test (31/07→22/10/2025)
├── entrainements/             # Module Training
│   └── page.tsx               # 35 entraînements test
├── mesures/                   # Module Mesures
│   └── page.tsx               # 24 mesures test
├── journal/                   # Module Bien-être
│   └── page.tsx               # 59 entrées test
├── challenges/                # Gamification
│   └── page.tsx               # 50 challenges
├── profil/                    # Profil utilisateur
│   └── page.tsx               # Settings + calculs BMR/TDEE
├── export/                    # Export données
│   └── page.tsx               # CSV/PDF export
├── coach/                     # Mode Coach (7 routes)
│   ├── page.tsx              # Dashboard coach
│   ├── all-athletes/         # Liste athlètes
│   ├── athlete/[id]/         # Détail athlète (5 routes)
│   │   ├── page.tsx
│   │   ├── diete/
│   │   ├── entrainements/
│   │   ├── journal/
│   │   ├── mesures/
│   │   └── plan-diete/
│   ├── programmes/
│   └── rapports/
├── admin/                     # Administration
├── create-coach/             # Création compte coach
├── guide/                    # Guide utilisateur
├── menu/                     # Menu navigation
├── nouveautes/               # Release notes
└── legal/                    # Pages légales
    ├── privacy/
    ├── terms/
    └── cookies/
```

### **`src/components/` - 121 Composants**

```
components/
├── ui/ (45 composants)        # Design System
│   ├── StandardModal.tsx      # Modal standardisée
│   ├── ProgressHeader.tsx     # Header métriques + conseils
│   ├── ClickableCard.tsx      # Cards actions séparées
│   ├── HealthIndicator.tsx    # Zones couleur OMS
│   ├── TrainingFormModal.tsx
│   ├── MealFormModal.tsx
│   ├── PerformanceChart.tsx   # ✅ Fixé (Timestamp→string)
│   ├── HeartRateChart.tsx     # ✅ Fixé (Timestamp→string)
│   ├── TrainingVolumeChart.tsx # ✅ Fixé (Timestamp→string)
│   └── ...
├── mobile/ (8 composants)     # Mobile-specific
│   ├── MobileDashboard.tsx    # <xl breakpoint
│   ├── BottomNav.tsx          # Navigation principale
│   ├── FloatingActionButton.tsx
│   └── ...
├── desktop/ (2 composants)    # Desktop-specific
│   └── DesktopDashboard.tsx   # ≥xl breakpoint
├── layout/ (4 composants)     # Layout
│   ├── MainLayout.tsx         # Layout principal
│   ├── Sidebar.tsx
│   ├── Breadcrumbs.tsx        # ✅ Fixé (overflow mobile)
│   └── Header.tsx
├── charts/ (6 composants)     # Graphiques
│   ├── WeightIMCChart.tsx
│   ├── MesuresCharts.tsx
│   └── ...
├── diete/ (12 composants)     # Module Diète
│   ├── DietProgressHeader.tsx
│   ├── SmartSuggestions.tsx
│   ├── NutritionAnalytics.tsx
│   └── ...
├── entrainements/ (8 composants) # Module Training
│   ├── TrainingProgressHeader.tsx
│   ├── TrainingCalendar.tsx
│   └── ...
├── journal/ (6 composants)    # Module Journal
│   ├── JournalWellnessHeader.tsx
│   ├── JournalForm.tsx
│   └── ...
├── mesures/ (4 composants)    # Module Mesures
│   ├── MesuresProgressHeader.tsx
│   └── ...
├── challenges/ (5 composants) # Module Challenges
│   ├── ChallengesProgressHeaderSimple.tsx
│   └── ...
├── coach/ (12 composants)     # Mode Coach
│   ├── CoachDashboard.tsx
│   ├── CoachCommentForm.tsx
│   └── ...
└── profile/ (9 composants)    # Profil
    ├── ProfileForm.tsx
    └── ...
```

### **`src/hooks/` - 20 Hooks**

```typescript
hooks/
├── useAuth.ts                 # Auth + user profile
├── useFirestore.ts            # Firestore CRUD + real-time
├── useEntrainements.ts        # Training data
├── useRepas.ts                # Meals data
├── useMesures.ts              # Measurements data
├── useJournal.ts              # Journal entries
├── useChallenges.ts           # Challenges tracking
├── useEnergyBalance.ts        # Energy calculations
├── useCoachComments.ts        # Coach feedback
├── useNotifications.ts        # FCM + push notifications
├── useOpenFoodFacts.ts        # Food database API
├── usePaginatedEntrainements.ts # Pagination 30 items
└── ...
```

### **`src/lib/` - 36 Utilitaires**

```typescript
lib/
├── firebase.ts                # Firebase config + init
├── dateUtils.ts               # ✅ timestampToDateString (Timestamp→"YYYY-MM-DD")
├── calculations.ts            # BMR, TDEE, MET formulas
├── userCalculations.ts        # User-specific calculations
├── validation.ts              # Zod schemas
├── nutritional-database.ts    # Base données nutritionnelle (500+ aliments)
├── badges.ts                  # Système badges/achievements
├── garminParser.ts            # TCX/GPX parsing
├── openFoodFactsAPI.ts        # Open Food Facts client
├── exportUtils.ts             # CSV/PDF export
└── ...
```

---

## 🗄️ **MODÈLE DONNÉES FIRESTORE**

### **Collections Principales**

```typescript
// 👤 users/{userId}
{
  id: string;
  role: 'coach' | 'sportif';
  nom: string;
  email: string;
  genre?: 'homme' | 'femme';
  date_naissance?: Date;
  taille?: number;
  poids_actuel?: number;
  objectif?: 'maintien' | 'perte' | 'prise_masse';
  niveau_activite?: 'sedentaire' | 'leger' | 'modere' | 'actif' | 'tres_actif';
  ownerCoachId?: string;       // Si athlète lié à un coach
  athletes?: string[];          // Si coach avec athlètes
  created_at: Timestamp;
}

// 🍽️ repas/{repasId} - ✅ 504 repas test
{
  user_id: string;
  date: Timestamp;              // ✅ 12:00:00 UTC+2 (CRITIQUE!)
  repas: 'petit_dej' | 'collation_matin' | 'dejeuner' |
         'collation_apres_midi' | 'diner' | 'collation_soir';
  aliments: Array<{
    id: string;
    nom: string;
    nom_lower: string;          // ✅ Ajouté (search lowercase)
    quantite: number;
    unite: string;
    user_id: string;            // ✅ Ajouté
    created_at: Timestamp;      // ✅ Ajouté
    macros: { kcal, prot, glucides, lipides };
    macros_base: { kcal, prot, glucides, lipides }; // ✅ Ajouté (pour 100g)
    openfoodfacts_id?: string;
  }>;
  macros: { kcal, prot, glucides, lipides };
  created_at: Timestamp;
}

// 🏋️ entrainements/{entrainementId} - ✅ 35 entraînements test
{
  user_id: string;
  date: Timestamp;              // ✅ 12:00:00 UTC+2
  type: 'cardio' | 'musculation'; // ✅ lowercase (CRITIQUE!)
  duree: number;                // minutes
  calories: number;
  source: 'manuel' | 'garmin';
  commentaire?: string;

  // ✅ Champs universels (ajoutés 21/10/2025)
  effort_percu?: number;        // 1-10
  fatigue_avant?: number;       // 1-10
  fatigue_apres?: number;       // 1-10
  fc_min?: number;              // BPM
  fc_max?: number;              // BPM
  fc_moyenne?: number;          // BPM

  // ✅ Champs spécifiques Cardio
  distance?: number;            // km
  vitesse_moy?: number;         // km/h
  cadence_moy?: number;         // rpm
  elevation_gain?: number;      // m

  // ✅ Champs spécifiques Musculation
  puissance_moy?: number;       // W
  exercices?: Array<{...}>;

  created_at: Timestamp;
}

// 📏 mesures/{mesureId} - ✅ 24 mesures test
{
  user_id: string;
  date: Timestamp;              // ✅ 12:00:00 UTC+2
  poids?: number;               // kg
  taille?: number;              // cm
  imc?: number;                 // calculé
  masse_grasse?: number;        // %
  tour_taille?: number;         // cm
  tour_hanches?: number;        // cm
  tour_bras?: number;           // cm
  tour_cuisses?: number;        // cm
  created_at: Timestamp;
}

// 📓 journal/{entryId} - ✅ 59 entrées test
{
  user_id: string;
  date: Timestamp;              // ✅ 12:00:00 UTC+2
  humeur: number;               // 1-10
  energie: number;              // 1-10
  sommeil?: number;             // heures
  stress?: number;              // 1-10
  note?: string;
  created_at: Timestamp;
}

// 💬 coach_comments/{commentId} - ✅ 6 commentaires test
{
  coach_id: string;
  athlete_id: string;
  module: 'diete' | 'entrainements' | 'journal' | 'mesures';
  date?: string;                // Pour diète (YYYY-MM-DD)
  training_id?: string;         // Pour entraînements
  entry_id?: string;            // Pour journal
  mesure_id?: string;           // Pour mesures
  comment: string;
  read_by_athlete?: boolean;
  created_at: Timestamp;
}

// 📋 coach_diet_plans/{planId} - ✅ 1 plan test
{
  coach_id: string;
  athlete_id: string;
  date_creation: Timestamp;
  petit_dej?: string;
  collation_matin?: string;
  dejeuner?: string;
  collation_apres_midi?: string;
  diner?: string;
  collation_soir?: string;
  notes_generales?: string;
}
```

### **Indexes Firestore (config/firestore.indexes.json)**

```json
{
  "indexes": [
    {
      "collectionGroup": "repas",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "entrainements",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "coach_comments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "athlete_id", "order": "ASCENDING" },
        { "fieldPath": "module", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 🔧 **POINTS CRITIQUES & LEÇONS APPRISES**

### **1. Dates Firestore = Timestamp à 12:00:00 (CRITIQUE!)**

```typescript
// ❌ FAUX
const date = new Date("2025-10-21");
firestore.collection("repas").add({ date: date.toISOString() }); // String!

// ✅ CORRECT
import { Timestamp } from "firebase/firestore";
const date = new Date("2025-10-21");
date.setHours(12, 0, 0, 0); // ⚠️ CRITIQUE: toujours 12:00:00!
firestore.collection("repas").add({ date: Timestamp.fromDate(date) });
```

**Raison**: Normalisation timezone + comparaisons de dates fiables.

### **2. Conversion Timestamp → String pour Recharts**

```typescript
// ❌ FAUX (cause "Invalid time value")
.map((e) => ({
  date: e.date, // Timestamp Firestore!
  ...
}))

// ✅ CORRECT
import { timestampToDateString } from '@/lib/dateUtils';

.map((e) => {
  const dateStr = timestampToDateString(e.date); // "YYYY-MM-DD"

  // Vérifier validité
  if (isNaN(new Date(dateStr).getTime())) {
    console.warn('Invalid date:', dateStr);
    return null;
  }

  return {
    date: dateStr, // ✅ String ISO
    ...
  };
})
.filter((d) => d !== null);
```

### **3. Type Entraînement = lowercase (CRITIQUE!)**

```typescript
// ❌ FAUX
{
  type: "Cardio";
} // PascalCase
{
  type: "Musculation";
} // PascalCase

// ✅ CORRECT
{
  type: "cardio";
} // lowercase
{
  type: "musculation";
} // lowercase
```

**Impact**: Filtres, comparaisons, affichage UI.

### **4. Champs Conditionnels (NE PAS utiliser undefined)**

```typescript
// ❌ FAUX
const trainingData = {
  type: "musculation",
  distance: undefined, // ❌ Firestore refuse undefined!
  vitesse_moy: undefined,
};

// ✅ CORRECT
const trainingData = {
  type: "musculation",
  // Omettre complètement distance/vitesse_moy
};

if (type === "cardio") {
  trainingData.distance = 10;
  trainingData.vitesse_moy = 12;
}
```

### **5. Scripts Utilitaires Exclus du Build**

```json
// tsconfig.json
{
  "exclude": [
    "node_modules",
    "scripts/**/*" // ✅ Exclure scripts/ du build Next.js
  ]
}
```

**Raison**: `firebase-admin` (backend) n'est pas disponible dans le build frontend.

---

## 🚀 **COMMANDES ESSENTIELLES**

```bash
# Développement
npm run dev              # Dev server (localhost:3000)
npm run build            # Build production (10.3s)
npm run typecheck        # TypeScript strict
npm run lint             # ESLint + Prettier

# Tests
npm test                 # Vitest (308 tests)
npm run test:coverage    # Coverage (4.49%)
npm run test:e2e         # Playwright E2E

# Scripts Utilitaires
node scripts/run-populate.js              # Peupler données test
npx ts-node scripts/verify-dates.ts       # Vérifier dates Firestore
npx ts-node scripts/check-firestore-data.ts # Diagnostic structure

# Firebase
firebase deploy --only firestore:rules    # Déployer règles
firebase deploy --only hosting            # Déployer hosting
```

---

## 📚 **DOCUMENTATION ESSENTIELLE**

### **Point d'Entrée**

- `docs/context/PROJECT_CONTEXT_V3.md` (ce fichier)
- `docs/context/ai_context_summary.md` (contexte AI v2.1)
- `README.md` (overview projet)

### **Documentation Technique**

- `docs/CONTEXTE_TECHNIQUE_COMPLET.md` (architecture détaillée)
- `docs/technical/UI_UX_INDUSTRIALIZATION_COMPLETE.md` (Design System)
- `docs/technical/DASHBOARDS_ARCHITECTURE.md` (3 dashboards)
- `docs/technical/DEPLOYMENT_WORKFLOW_CURRENT.md` (CI/CD)

### **Guides Pratiques**

- `docs/GUIDE_POPULATION_DONNEES_TEST.md` (population données)
- `docs/guides/GUIDE_PRATIQUE_TESTING_CICD.md` (tests)
- `docs/guides/TEST_USERS_SUMMARY.md` (credentials Firebase)

### **Résolution Problèmes**

- `docs/DATA_POPULATION_FINAL_REPORT.md` (population données complète)
- `docs/DATA_FORMAT_FIXES.md` (structure repas)
- `docs/DATA_TRAINING_STRUCTURE_FIX.md` (structure entraînements)
- `docs/DATA_DATES_FIX.md` (dates 2024→2025)
- `docs/FIRESTORE_RULES_DATE_FIX.md` (règles Firestore)

---

## 🎯 **USERS TEST ACTIFS**

```yaml
Test User (Athlète):
  UID: VBSTkEAy1OWptNJmUbIjFFz62Zg1
  Email: test@supernovafit.app
  Password: Test1234!
  Données:
    - 504 repas (31/07/2025 → 22/10/2025)
    - 35 entraînements (3-4/semaine)
    - 24 mesures (tous les 3-4j)
    - 59 entrées journal
    - Progression: 99kg → 89kg (-10kg)

Test Coach:
  UID: QwpCZpdwXURc3pB2m8K51h4S6ff1
  Email: coach@supernovafit.app
  Password: Coach1234!
  Athlètes: 1 (Test User ci-dessus)
  Données:
    - 6 commentaires
    - 1 plan diète actif
```

---

## ✅ **ÉTAT ACTUEL (21 Oct 2025)**

| Aspect                | Status | Détails                                   |
| --------------------- | ------ | ----------------------------------------- |
| **Build CI/CD**       | ✅ OK  | Scripts exclus, typecheck passe           |
| **Données Test**      | ✅ OK  | 622 docs (dates 2025, structure complète) |
| **Graphiques**        | ✅ OK  | Timestamp→string fixé (3 composants)      |
| **Mobile Responsive** | ✅ OK  | Overflow fixé (header + breadcrumb)       |
| **FCM Notifications** | ✅ OK  | VAPID déployé + fallback Opera GX         |
| **Tests**             | ✅ OK  | 308/308 passants (4.49% coverage)         |
| **Performance**       | ✅ OK  | Build 10.3s, Bundle 110KB                 |
| **Sécurité**          | ✅ OK  | 0 vulnérabilité, Rate limiting actif      |

---

## 🔮 **PROCHAINES PRIORITÉS**

1. **Coverage 25%** : Tests UI components
2. **Bundle 100KB** : Optimisations supplémentaires
3. **CDN Setup** : Performance globale
4. **Tests E2E automatisés** : GitHub Actions
5. **Monitoring ML** : Détection anomalies

---

**SuperNovaFit v3.0.0** © 2025 — Excellence Technique 9.6/10 🏆

_Contexte basé sur analyse réelle du code (227 fichiers) et de la base de données (622 documents test)_
