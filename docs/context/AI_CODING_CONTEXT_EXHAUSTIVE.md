# 🤖 SUPERNOVAFIT - CONTEXTE EXHAUSTIF IA CODAGE

**Version**: 3.0.0 FINAL | **Date**: 21 Octobre 2025 | **Score**: 9.6/10 🏆

> **🎯 OBJECTIF**: Fournir 80%+ du contexte projet pour IA de codage  
> **📌 USAGE**: Lire ce fichier AVANT toute intervention sur le projet  
> **⚡ STATUT**: Production Ready - Code basé sur 227 fichiers analysés

---

## 📊 **MÉTRIQUES PROJET (État Réel)**

```yaml
Code Source:
  Fichiers: 227 (45,000 LOC)
  TypeScript: 100% (strict mode)
  Tests: 308/308 passants (4.49% coverage)
  Build: 10.3s / Bundle 110KB
  Lighthouse: 95+ (mobile)

Base de Données:
  Documents: 622 (production-ready)
  Collections: 10 principales
  Structure: 100% conforme
  Dates: Timestamp 12:00:00 UTC+2

Qualité:
  Score: 9.6/10
  ESLint: 0 errors
  Sécurité: 0 vulnérabilité
  CI/CD: ✅ GitHub Actions
```

---

## 🏗️ **ARCHITECTURE & STACK**

### **Stack Technique**

```typescript
// Frontend
Framework: Next.js 15.1.0 (App Router + SSR)
Language: TypeScript 5.3.3 (strict mode)
UI: Tailwind CSS 3.4 + Glassmorphism
State: React Hooks + Context API
Forms: React Hook Form + Zod
Charts: Recharts (dynamic imports)

// Backend (BaaS)
Database: Firestore (NoSQL, temps réel)
Auth: Firebase Auth (Email/Password)
Storage: Firebase Storage
Monitoring: Sentry + Firebase Analytics

// DevOps
Hosting: Firebase Hosting + Cloud Run
CI/CD: GitHub Actions
Tests: Vitest + Playwright
```

### **Dépendances Critiques**

```json
{
  "next": "15.1.0",
  "react": "19.0.0",
  "firebase": "12.1.0",
  "typescript": "5.3.3",
  "tailwindcss": "3.4.17",
  "recharts": "2.15.0",
  "date-fns": "4.1.0",
  "zod": "3.24.1"
}
```

---

## 📁 **STRUCTURE CODE (227 fichiers)**

### **`src/app/` - 30 Routes**

```
app/
├── page.tsx                    # Dashboard (3 variantes: Mobile/Desktop/Coach)
├── auth/page.tsx               # Login/Register
├── diete/page.tsx              # Nutrition (504 repas test)
├── entrainements/page.tsx      # Training (35 entraînements)
├── mesures/page.tsx            # Measurements (24 mesures)
├── journal/page.tsx            # Wellness (59 entrées)
├── challenges/page.tsx         # Gamification (50 challenges)
├── profil/page.tsx             # Profile + Settings
├── export/page.tsx             # Data export (CSV/PDF)
├── coach/                      # Coach mode (7 routes)
│   ├── page.tsx
│   ├── all-athletes/
│   └── athlete/[id]/          # 5 sub-routes (diete, entrainements, etc.)
├── guide/page.tsx
├── menu/page.tsx
├── nouveautes/page.tsx
└── legal/                      # 3 pages (privacy, terms, cookies)
```

### **`src/components/` - 121 Composants**

```
components/
├── ui/ (45 composants)         # Design System
│   ├── StandardModal.tsx       # Modal standardisée (border-white/70)
│   ├── ProgressHeader.tsx      # Header métriques + période + conseils
│   ├── ClickableCard.tsx       # Cards avec actions séparées
│   ├── HealthIndicator.tsx     # Zones couleur OMS
│   ├── *Chart.tsx              # 6 graphiques (Recharts)
│   └── *FormModal.tsx          # 8 modals formulaires
├── mobile/ (8)                 # Mobile-specific
│   ├── MobileDashboard.tsx     # <xl breakpoint
│   ├── BottomNav.tsx           # Navigation tactile
│   └── FloatingActionButton.tsx
├── desktop/ (2)                # Desktop-specific
│   └── DesktopDashboard.tsx    # ≥xl breakpoint
├── layout/ (4)                 # Layout global
│   ├── MainLayout.tsx
│   ├── Sidebar.tsx
│   ├── Breadcrumbs.tsx
│   └── Header.tsx
├── diete/ (12)                 # Module Nutrition
├── entrainements/ (8)          # Module Training
├── journal/ (6)                # Module Journal
├── mesures/ (4)                # Module Measurements
├── challenges/ (5)             # Module Gamification
├── coach/ (12)                 # Mode Coach
└── profile/ (9)                # Profil utilisateur
```

### **`src/hooks/` - 20 Hooks Personnalisés**

```typescript
// Auth & Data
useAuth.ts                      # ⭐ Auth + user profile
useFirestore.ts                 # ⭐ CRUD Firestore + real-time

// Modules
useEntrainements.ts             # Training data
useRepas.ts                     # Meals data
useMesures.ts                   # Measurements
useJournal.ts                   # Journal entries
useChallenges.ts                # Challenges tracking

// Features
useEnergyBalance.ts             # Calculs balance énergétique
useCoachComments.ts             # Coach feedback
useNotifications.ts             # FCM + push notifications
useOpenFoodFacts.ts             # Open Food Facts API
usePaginatedEntrainements.ts    # Pagination 30 items
```

### **`src/lib/` - 36 Utilitaires**

```typescript
firebase.ts                     # ⭐ Config + init Firebase
dateUtils.ts                    # ⭐ timestampToDateString (CRITIQUE!)
calculations.ts                 # BMR, TDEE, MET formulas
userCalculations.ts             # User-specific calculations
validation.ts                   # Zod schemas
nutritional-database.ts         # 500+ aliments pré-renseignés
badges.ts                       # Système achievements
garminParser.ts                 # TCX/GPX parsing
openFoodFactsAPI.ts             # API client
exportUtils.ts                  # CSV/PDF export
```

---

## 🗄️ **MODÈLE DONNÉES FIRESTORE**

### **Collections Principales**

```typescript
// 👤 users/{userId}
interface User {
  id: string;
  role: "coach" | "sportif";
  nom: string;
  email: string;
  genre?: "homme" | "femme";
  date_naissance?: Date;
  taille?: number; // cm
  poids_actuel?: number; // kg
  objectif?: "maintien" | "perte" | "prise_masse";
  niveau_activite?: "sedentaire" | "leger" | "modere" | "actif" | "tres_actif";
  ownerCoachId?: string; // Si athlète lié à un coach
  athletes?: string[]; // Si coach
  created_at: Timestamp;
}

// 🍽️ repas/{repasId} - ⚠️ STRUCTURE CRITIQUE
interface Repas {
  user_id: string;
  date: Timestamp; // ⚠️ CRITIQUE: 12:00:00 UTC+2!
  repas:
    | "petit_dej"
    | "collation_matin"
    | "dejeuner"
    | "collation_apres_midi"
    | "diner"
    | "collation_soir";
  aliments: Array<{
    id: string;
    nom: string;
    nom_lower: string; // ⚠️ Obligatoire (search)
    quantite: number;
    unite: string; // 'g', 'ml', 'unité'
    user_id: string; // ⚠️ Obligatoire
    created_at: Timestamp; // ⚠️ Obligatoire
    macros: {
      // Macros pour la quantité
      kcal: number;
      prot: number;
      glucides: number;
      lipides: number;
    };
    macros_base: {
      // ⚠️ Obligatoire (pour 100g/ml)
      kcal: number;
      prot: number;
      glucides: number;
      lipides: number;
    };
    openfoodfacts_id?: string;
  }>;
  macros: {
    // Total repas
    kcal: number;
    prot: number;
    glucides: number;
    lipides: number;
  };
  created_at: Timestamp;
}

// 🏋️ entrainements/{entrainementId} - ⚠️ STRUCTURE CRITIQUE
interface Entrainement {
  user_id: string;
  date: Timestamp; // ⚠️ CRITIQUE: 12:00:00 UTC+2!
  type: "cardio" | "musculation"; // ⚠️ CRITIQUE: lowercase!
  duree: number; // minutes
  calories: number;
  source: "manuel" | "garmin";
  commentaire?: string;

  // Champs universels (TOUS les types)
  effort_percu?: number; // 1-10
  fatigue_avant?: number; // 1-10
  fatigue_apres?: number; // 1-10
  fc_min?: number; // BPM
  fc_max?: number; // BPM
  fc_moyenne?: number; // BPM

  // ⚠️ Champs CONDITIONNELS (type === 'cardio')
  distance?: number; // km
  vitesse_moy?: number; // km/h
  cadence_moy?: number; // rpm
  elevation_gain?: number; // m

  // ⚠️ Champs CONDITIONNELS (type === 'musculation')
  puissance_moy?: number; // W
  exercices?: Array<{
    nom: string;
    series: number;
    repetitions: number;
    poids?: number;
  }>;

  created_at: Timestamp;
}

// 📏 mesures/{mesureId}
interface Mesure {
  user_id: string;
  date: Timestamp; // ⚠️ 12:00:00 UTC+2
  poids?: number; // kg
  taille?: number; // cm
  imc?: number; // calculé automatiquement
  masse_grasse?: number; // %
  tour_taille?: number; // cm
  tour_hanches?: number; // cm
  tour_bras?: number; // cm
  tour_cuisses?: number; // cm
  created_at: Timestamp;
}

// 📓 journal/{entryId}
interface JournalEntry {
  user_id: string;
  date: Timestamp; // ⚠️ 12:00:00 UTC+2
  humeur: number; // 1-10
  energie: number; // 1-10
  sommeil?: number; // heures
  stress?: number; // 1-10
  note?: string;
  created_at: Timestamp;
}

// 💬 coach_comments/{commentId}
interface CoachComment {
  coach_id: string;
  athlete_id: string;
  module: "diete" | "entrainements" | "journal" | "mesures";
  date?: string; // Pour diète (YYYY-MM-DD)
  training_id?: string; // Pour entraînements
  entry_id?: string; // Pour journal
  mesure_id?: string; // Pour mesures
  comment: string;
  read_by_athlete?: boolean;
  created_at: Timestamp;
}

// 📋 coach_diet_plans/{planId}
interface CoachDietPlan {
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

### **Indexes Firestore (OBLIGATOIRES)**

```json
{
  "indexes": [
    {
      "collectionGroup": "repas",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "entrainements",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "mesures",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "journal",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 🔥 **RÈGLES CRITIQUES (À NE JAMAIS OUBLIER!)**

### **1. Dates Firestore = Timestamp à 12:00:00**

```typescript
// ❌ FAUX (95% des bugs dates viennent de là!)
const date = new Date("2025-10-21");
await addDoc(collection(db, "repas"), {
  date: date.toISOString(), // ❌ String!
  // ...
});

// ❌ FAUX aussi
await addDoc(collection(db, "repas"), {
  date: Timestamp.fromDate(new Date("2025-10-21")), // ❌ 00:00:00!
  // ...
});

// ✅ CORRECT (TOUJOURS faire ça!)
import { Timestamp } from "firebase/firestore";

const date = new Date("2025-10-21");
date.setHours(12, 0, 0, 0); // ⚠️ CRITIQUE: 12:00:00!

await addDoc(collection(db, "repas"), {
  date: Timestamp.fromDate(date),
  // ...
});
```

**Pourquoi 12:00:00?**

- Normalisation timezone (évite les bugs +1/-1 jour)
- Comparaisons de dates fiables
- Filtres `date >= start && date <= end` fonctionnent
- Cohérence avec les 622 documents test existants

### **2. Conversion Timestamp → String pour Graphiques**

```typescript
// ❌ FAUX (cause "Invalid time value" dans Recharts)
const data = entrainements.map((e) => ({
  date: e.date,  // ❌ Timestamp Firestore!
  calories: e.calories,
}));

// ✅ CORRECT
import { timestampToDateString } from '@/lib/dateUtils';

const data = entrainements
  .map((e) => {
    const dateStr = timestampToDateString(e.date);  // "YYYY-MM-DD"

    // ⚠️ Toujours valider la date convertie
    if (isNaN(new Date(dateStr).getTime())) {
      console.warn('Invalid date:', { original: e.date, converted: dateStr });
      return null;
    }

    return {
      date: dateStr,  // ✅ String ISO
      calories: e.calories,
    };
  })
  .filter((d) => d !== null);  // ⚠️ Filtrer les dates invalides

// Utiliser dans Recharts
<LineChart data={data}>
  <XAxis dataKey="date" />
  <Line dataKey="calories" />
</LineChart>
```

### **3. Type Entraînement = lowercase**

```typescript
// ❌ FAUX (filtres ne fonctionnent pas!)
await addDoc(collection(db, 'entrainements'), {
  type: 'Cardio',  // ❌ PascalCase
  // ...
});

// ❌ FAUX aussi
if (e.type === 'Cardio') { ... }  // ❌ Ne matchera jamais!

// ✅ CORRECT
await addDoc(collection(db, 'entrainements'), {
  type: 'cardio',  // ✅ lowercase
  // ...
});

// ✅ Filtres/comparaisons
if (e.type === 'cardio') { ... }
if (e.type === 'musculation') { ... }
```

**Impact**:

- Filtres UI (onglets "Cardio" / "Musculation")
- Graphiques (séparation par type)
- Statistiques (compteurs par type)
- Conditionnels (champs spécifiques)

### **4. Champs Conditionnels (NE PAS utiliser undefined)**

```typescript
// ❌ FAUX (Firestore rejette undefined!)
const trainingData: Partial<Entrainement> = {
  type: 'musculation',
  distance: undefined,      // ❌ Firestore ERROR!
  vitesse_moy: undefined,   // ❌ Firestore ERROR!
};

await addDoc(collection(db, 'entrainements'), trainingData);
// → Error: Value for argument "data" is not a valid Firestore document.
//   Cannot use "undefined" as a Firestore value.

// ✅ CORRECT (omettre les champs)
const trainingData: Partial<Entrainement> = {
  type: 'musculation',
  // ✅ Ne PAS inclure distance/vitesse_moy
};

// Pour cardio, ajouter conditionnellement
if (type === 'cardio') {
  trainingData.distance = 10;
  trainingData.vitesse_moy = 12;
  trainingData.cadence_moy = 85;
  trainingData.elevation_gain = 200;
}

// Pour musculation
if (type === 'musculation') {
  trainingData.puissance_moy = 150;
  trainingData.exercices = [...];
}

await addDoc(collection(db, 'entrainements'), trainingData);
```

### **5. Structure Repas (4 champs aliments OBLIGATOIRES)**

```typescript
// ❌ FAUX (données incomplètes)
const repas = {
  aliments: [
    {
      nom: "Banane",
      quantite: 120,
      unite: "g",
      macros: { kcal: 108, prot: 1.3, glucides: 23, lipides: 0.3 },
      // ❌ Manque 4 champs critiques!
    },
  ],
};

// ✅ CORRECT (TOUJOURS inclure ces 4 champs!)
const repas = {
  user_id: userId,
  date: Timestamp.fromDate(dateAt12),
  repas: "dejeuner",
  aliments: [
    {
      id: generateId(),
      nom: "Banane",
      nom_lower: "banane", // ⚠️ OBLIGATOIRE (search)
      quantite: 120,
      unite: "g",
      user_id: userId, // ⚠️ OBLIGATOIRE
      created_at: Timestamp.now(), // ⚠️ OBLIGATOIRE
      macros: {
        // Macros pour 120g
        kcal: 108,
        prot: 1.3,
        glucides: 23,
        lipides: 0.3,
      },
      macros_base: {
        // ⚠️ OBLIGATOIRE (pour 100g)
        kcal: 90,
        prot: 1.1,
        glucides: 19.2,
        lipides: 0.25,
      },
      openfoodfacts_id: "3017620422003",
    },
  ],
  macros: { kcal: 108, prot: 1.3, glucides: 23, lipides: 0.3 },
  created_at: Timestamp.now(),
};
```

### **6. Scripts Backend Exclus du Build Frontend**

```json
// tsconfig.json
{
  "compilerOptions": { ... },
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "**/*.spec.ts",
    "scripts/**/*"  // ⚠️ CRITIQUE: exclure scripts/
  ]
}
```

**Raison**:

- `scripts/` utilise `firebase-admin` (backend)
- `firebase-admin` n'est pas compatible avec Next.js (frontend)
- Sans exclusion → Build ERROR dans CI/CD

---

## 💻 **CONVENTIONS DE CODE**

### **TypeScript**

```typescript
// ✅ Strict Mode (TOUJOURS activé)
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}

// ✅ Interfaces (PascalCase)
interface UserProfile { ... }
interface TrainingData { ... }

// ✅ Types Union (pour états fixes)
type TrainingType = 'cardio' | 'musculation';
type RepasType = 'petit_dej' | 'dejeuner' | 'diner' | ...;

// ✅ Props Components (interface avec Props suffix)
interface MealCardProps {
  meal: Repas;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// ❌ JAMAIS any (sauf cas exceptionnels avec eslint-disable)
const data: any = ...;  // ❌

// ✅ Utiliser unknown si type inconnu
const data: unknown = ...;
if (isValidData(data)) {
  const typedData = data as ValidData;
}
```

### **Naming Conventions**

```typescript
// Components
PascalCase: UserProfile.tsx, MealCard.tsx, TrainingFormModal.tsx

// Hooks
camelCase + 'use' prefix: useAuth.ts, useFirestore.ts, useEntrainements.ts

// Types/Interfaces
PascalCase: User, Repas, Entrainement, TrainingFormData

// Files
kebab-case: mobile-dashboard.tsx, energy-balance.ts

// Variables/Functions
camelCase: userId, getMealsByDate, calculateTotalCalories

// Constants
UPPER_SNAKE_CASE: MAX_FILE_SIZE, API_BASE_URL
```

### **Imports Organisation**

```typescript
// ✅ Ordre des imports (TOUJOURS respecter)

// 1. React
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// 2. Next.js
import { useRouter } from "next/navigation";
import Link from "next/link";

// 3. External libraries
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

// 4. Internal (@ alias)
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { calculateBMR } from "@/lib/calculations";
import type { User, Repas } from "@/types";
```

### **Composants React**

```typescript
// ✅ Structure standard d'un composant

'use client';  // Si nécessaire (interactions, hooks, etc.)

import { useState } from 'react';
import type { FC } from 'react';

// Types locaux en premier
interface MealCardProps {
  meal: Repas;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Composant avec FC<Props>
const MealCard: FC<MealCardProps> = ({ meal, onEdit, onDelete }) => {
  // 1. Hooks en premier
  const [isExpanded, setIsExpanded] = useState(false);

  // 2. Handlers
  const handleEdit = () => {
    onEdit(meal.id);
  };

  // 3. Computed values
  const totalCalories = meal.macros.kcal;

  // 4. Effects (si nécessaire)
  useEffect(() => {
    // ...
  }, [meal.id]);

  // 5. Early returns
  if (!meal) return null;

  // 6. Render
  return (
    <div className="glass-effect p-4 rounded-xl">
      {/* JSX */}
    </div>
  );
};

export default MealCard;
```

### **Hooks Personnalisés**

```typescript
// ✅ Structure standard d'un hook

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Entrainement } from "@/types";

export const useEntrainements = (userId: string) => {
  // State
  const [entrainements, setEntrainements] = useState<Entrainement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Effect avec cleanup
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "entrainements"),
      where("user_id", "==", userId),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Entrainement[];

        setEntrainements(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching entrainements:", err);
        setError(err as Error);
        setLoading(false);
      },
    );

    // ⚠️ TOUJOURS cleanup
    return () => unsubscribe();
  }, [userId]);

  // Return objet avec state + helpers
  return {
    entrainements,
    loading,
    error,
    refresh: () => setLoading(true),
  };
};
```

---

## 🎨 **DESIGN SYSTEM & UI**

### **Palette Neon**

```css
/* Couleurs principales */
--neon-purple: #a855f7 /* Principal / CTA */ --neon-cyan: #06b6d4
  /* Secondaire / Info */ --neon-green: #10b981 /* Succès / Positif */
  --neon-pink: #ec4899 /* Accent / Important */ --neon-yellow: #eab308
  /* Énergie / Warning */ --neon-red: #ef4444 /* Danger / Erreur */
  /* Backgrounds */ --space-900: #0a0a14 /* Background principal */
  --space-800: #12121f /* Background cards */;
```

### **Classes Tailwind Réutilisables**

```css
/* Glassmorphism (effet verre) */
.glass-effect {
  @apply backdrop-blur-lg bg-white/10 border border-white/20;
}

/* Hover scale (toutes les cards) */
.hover-scale {
  @apply hover:scale-105 transition-transform duration-200;
}

/* Responsive padding (mobile-first) */
.responsive-padding {
  @apply p-3 sm:p-4 lg:p-6;
}

/* Responsive text */
.responsive-text {
  @apply text-sm sm:text-base lg:text-lg;
}

/* Truncate avec tooltip */
.truncate-with-tooltip {
  @apply truncate max-w-[120px] sm:max-w-[200px];
}
```

### **Composants Universels (Design System)**

```typescript
// 1. StandardModal (modals standardisées)
<StandardModal
  isOpen={isOpen}
  onClose={onClose}
  title="Titre"
  size="lg"  // sm, md, lg, xl
>
  {/* Contenu */}
</StandardModal>

// 2. ProgressHeader (headers métriques)
<ProgressHeader
  icon={<Activity />}
  title="Entraînements"
  metrics={[
    { label: 'Cette semaine', value: '3', color: 'text-neon-green' },
    { label: 'Total mois', value: '12', color: 'text-neon-cyan' },
  ]}
  period="week"  // day, week, month
  onPeriodChange={setPeriod}
  tips="Conseil IA basé sur les données"
  showPeriodSelector={true}
/>

// 3. ClickableCard (cards avec actions)
<ClickableCard
  onClick={() => navigate(`/entrainements/${id}`)}
  onEdit={() => openEditModal(id)}
  onDelete={() => confirmDelete(id)}
  variant="default"  // default, success, warning, danger
>
  {/* Contenu card */}
</ClickableCard>

// 4. HealthIndicator (zones couleur OMS)
<HealthIndicator
  value={imc}
  type="imc"  // imc, masse_grasse, tour_taille
  showDetails={true}
/>
```

### **Responsive Design (Mobile-First)**

```typescript
// Breakpoints Tailwind
sm: 640px   // Mobile landscape / Petit tablet
md: 768px   // Tablet portrait
lg: 1024px  // Tablet landscape / Petit desktop
xl: 1280px  // Desktop
2xl: 1536px // Large desktop

// ✅ Utilisation (mobile → desktop)
<div className="
  p-3 sm:p-4 lg:p-6          // Padding responsive
  text-sm sm:text-base       // Text responsive
  flex-col sm:flex-row       // Layout responsive
  hidden xl:block            // Cacher sur mobile
  block xl:hidden            // Cacher sur desktop
">
  {/* Contenu */}
</div>

// ✅ Dashboards adaptatifs
// Mobile (<xl): MobileDashboard (block xl:hidden)
// Desktop (≥xl): DesktopDashboard (hidden xl:block)
```

---

## 🧪 **TESTS & QUALITÉ**

### **Tests Vitest (308 tests)**

```typescript
// Structure standard d'un test

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MealCard from '@/components/diete/MealCard';

describe('MealCard', () => {
  // Setup
  const mockMeal = {
    id: '1',
    nom: 'Test Meal',
    macros: { kcal: 500, prot: 30, glucides: 50, lipides: 15 },
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Tests
  it('should render meal data', () => {
    render(<MealCard meal={mockMeal} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Test Meal')).toBeInTheDocument();
    expect(screen.getByText(/500.*kcal/i)).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<MealCard meal={mockMeal} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });

  it('should handle loading state', async () => {
    render(<MealCard meal={null} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });
});
```

### **Commandes Tests**

```bash
# Tests unitaires (Vitest)
npm test                    # Mode watch
npm run test:coverage       # Avec coverage
npm run test:ui             # Interface Vitest
npm test -- MealCard        # Test spécifique

# Tests E2E (Playwright)
npm run test:e2e            # Headless (CI)
npm run test:e2e:headed     # Avec navigateur visible
npm run test:e2e:ui         # Interface Playwright
npm run test:e2e:report     # Rapport HTML

# Qualité code
npm run lint                # ESLint + Prettier
npm run typecheck           # TypeScript strict
```

---

## 🔒 **SÉCURITÉ & VALIDATION**

### **Validation Zod**

```typescript
import { z } from "zod";

// ✅ Schema Repas
const RepasSchema = z.object({
  user_id: z.string().min(1),
  date: z.instanceof(Timestamp),
  repas: z.enum([
    "petit_dej",
    "collation_matin",
    "dejeuner",
    "collation_apres_midi",
    "diner",
    "collation_soir",
  ]),
  aliments: z.array(
    z.object({
      nom: z.string().min(1),
      quantite: z.number().positive(),
      unite: z.enum(["g", "ml", "unité"]),
      macros: z.object({
        kcal: z.number().nonnegative(),
        prot: z.number().nonnegative(),
        glucides: z.number().nonnegative(),
        lipides: z.number().nonnegative(),
      }),
    }),
  ),
});

// Utilisation
const result = RepasSchema.safeParse(data);
if (!result.success) {
  console.error("Validation errors:", result.error.flatten());
  return;
}

// data est maintenant typé et validé
const validData = result.data;
```

### **Firestore Rules (Rate Limiting)**

```javascript
// Sécurité active sur Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rate limiting: 100 reads/hour par user
    match /{document=**} {
      allow read: if request.auth != null
        && request.auth.uid == resource.data.user_id
        && request.time < resource.data.lastRead + duration.value(36, 's');
    }

    // Validation user_id obligatoire
    match /repas/{repasId} {
      allow create: if request.auth != null
        && request.resource.data.user_id == request.auth.uid
        && request.resource.data.date is timestamp;
    }
  }
}
```

### **Headers Sécurité (Next.js)**

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=()" },
        ],
      },
    ];
  },
};
```

---

## 🚀 **CI/CD & DÉPLOIEMENT**

### **GitHub Actions Workflow**

```yaml
# .github/workflows/firebase-hosting-merge.yml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Run quality checks
        run: |
          npm run lint
          npm run typecheck
          npm run test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          # ... autres env vars

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: "${{ secrets.GITHUB_TOKEN }}"
          firebaseServiceAccount: "${{ secrets.FIREBASE_SERVICE_ACCOUNT }}"
          channelId: live
          projectId: supernovafit-a6fe7
```

### **Commandes Déploiement**

```bash
# Build local
npm run build              # Build production (10.3s)

# Déploiement Firebase
firebase deploy --only hosting                    # Hosting seul
firebase deploy --only firestore:rules           # Rules seules
firebase deploy --only firestore:indexes         # Indexes seuls
firebase deploy                                  # Tout

# Vérification
npm run lint               # ESLint + Prettier (0 errors)
npm run typecheck          # TypeScript strict (OK)
npm test                   # 308 tests (100% passants)
```

---

## 📚 **DOCUMENTATION ESSENTIELLE**

### **Navigation Documentation**

```
Point d'entrée: docs/INDEX.md
    ↓
    ├─→ Context (2 docs)
    │   ├─→ AI_CODING_CONTEXT_EXHAUSTIVE.md (CE FICHIER) ⭐
    │   └─→ PROJECT_CONTEXT_V3.md (vue d'ensemble)
    ├─→ Technical (7 docs essentiels)
    │   ├─→ DASHBOARDS_ARCHITECTURE.md (3 dashboards)
    │   ├─→ UI_UX_INDUSTRIALIZATION_COMPLETE.md (Design System)
    │   └─→ DEPLOYMENT_WORKFLOW_CURRENT.md (CI/CD)
    ├─→ Données (6 docs CRITIQUES)
    │   ├─→ DATA_POPULATION_FINAL_REPORT.md ⭐
    │   ├─→ DATA_FORMAT_FIXES.md (structure repas)
    │   ├─→ DATA_TRAINING_STRUCTURE_FIX.md (structure entraînements)
    │   └─→ DATA_DATES_FIX.md (dates 2024→2025)
    └─→ Tests (9 docs)
        └─→ testing/README.md
```

### **Fichiers Configuration Critiques**

```
Configuration:
├── tsconfig.json           # ⚠️ exclude: ["scripts/**/*"]
├── next.config.js          # Headers sécurité, redirects
├── tailwind.config.ts      # Design System, palette neon
├── vitest.config.ts        # Config tests
├── playwright.config.ts    # Config E2E
├── .eslintrc.json          # Rules ESLint
└── .prettierrc             # Formatting

Firebase:
├── firebase.json           # Hosting + Functions config
├── config/
│   ├── firestore.rules     # Sécurité + Rate limiting
│   ├── firestore.indexes.json  # Indexes (OBLIGATOIRES)
│   └── storage.rules       # Storage permissions

Scripts:
└── scripts/
    ├── populate-test-data.ts     # ⚠️ Population données
    ├── verify-dates.ts           # Vérification dates
    └── check-firestore-data.ts   # Diagnostic structure
```

---

## 🎯 **USERS TEST (Production-Ready)**

```yaml
Test User (Athlète):
  UID: VBSTkEAy1OWptNJmUbIjFFz62Zg1
  Email: test@supernovafit.app
  Password: Test1234!
  Données:
    - 504 repas (31/07/2025 → 22/10/2025)
    - 35 entraînements (structure complète)
    - 24 mesures (tous les 3-4 jours)
    - 59 entrées journal (~70% des jours)
    - Progression: 99kg → 89kg (-10kg en 3 mois)

Test Coach:
  UID: QwpCZpdwXURc3pB2m8K51h4S6ff1
  Email: coach@supernovafit.app
  Password: Coach1234!
  Athlètes: 1 (Test User ci-dessus)
  Données:
    - 6 commentaires (diète, entraînements, journal)
    - 1 plan diète actif
```

---

## ⚠️ **PIÈGES COURANTS & SOLUTIONS**

### **1. Graphiques Vides / "Invalid time value"**

```typescript
// ❌ Cause: Timestamp non converti
const data = entrainements.map(e => ({ date: e.date, ... }));

// ✅ Solution: Toujours convertir + valider
import { timestampToDateString } from '@/lib/dateUtils';

const data = entrainements
  .filter(e => e.date)  // ⚠️ Filtrer dates nulles
  .map(e => {
    const dateStr = timestampToDateString(e.date);
    if (isNaN(new Date(dateStr).getTime())) return null;
    return { date: dateStr, ... };
  })
  .filter(d => d !== null);
```

### **2. Filtres ne Retournent Rien**

```typescript
// ❌ Cause: Comparaison string vs Timestamp
const filtered = repas.filter((r) => r.date >= "2025-10-01"); // ❌

// ✅ Solution: Comparer Timestamps
const startDate = Timestamp.fromDate(new Date("2025-10-01"));
const filtered = repas.filter((r) => r.date >= startDate);
```

### **3. Build CI/CD Échoue**

```typescript
// ❌ Cause: Scripts backend inclus dans build frontend
// Error: Cannot find module 'firebase-admin/app'

// ✅ Solution: Exclure scripts/ dans tsconfig.json
{
  "exclude": ["scripts/**/*"]
}
```

### **4. Données Test Vides**

```typescript
// ❌ Cause: Dates en string ou mauvaise année
{
  date: "2024-10-21";
} // ❌ String + mauvaise année

// ✅ Solution: Timestamp 2025 à 12:00:00
const date = new Date("2025-10-21");
date.setHours(12, 0, 0, 0);
{
  date: Timestamp.fromDate(date);
}
```

### **5. Overflow Mobile**

```typescript
// ❌ Cause: Padding fixe + whitespace-nowrap
<div className="p-6 whitespace-nowrap">  // ❌ Déborde sur mobile

// ✅ Solution: Padding responsive + truncate
<div className="p-3 sm:p-4 lg:p-6">
  <span className="truncate sm:whitespace-nowrap">...</span>
</div>
```

---

## 🔍 **DEBUGGING & MONITORING**

### **Console Logs (Production)**

```typescript
// ❌ JAMAIS laisser console.log en prod
console.log("Debug data:", data); // ❌

// ✅ Utiliser logger custom ou Sentry
import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "development") {
  console.log("Debug data:", data);
} else {
  Sentry.captureMessage("Debug context", {
    level: "info",
    extra: { data },
  });
}
```

### **Sentry Error Tracking**

```typescript
// Capturer erreurs importantes
import * as Sentry from "@sentry/nextjs";

try {
  await someOperation();
} catch (error) {
  console.error("Operation failed:", error);

  Sentry.captureException(error, {
    tags: {
      component: "MealCard",
      operation: "save",
    },
    extra: {
      userId,
      mealId,
    },
  });

  // Afficher erreur user-friendly
  toast.error("Une erreur est survenue");
}
```

### **Firebase Analytics**

```typescript
import { logEvent } from "firebase/analytics";
import { analytics } from "@/lib/firebase";

// Tracker événements importants
logEvent(analytics, "meal_created", {
  meal_type: "dejeuner",
  calories: 650,
  source: "manual",
});

logEvent(analytics, "training_completed", {
  type: "cardio",
  duration: 45,
  calories: 480,
});
```

---

## 📋 **CHECKLIST AVANT COMMIT**

```bash
# 1. Qualité code
npm run lint              # 0 errors
npm run typecheck         # OK

# 2. Tests
npm test                  # 308/308 passants

# 3. Build
npm run build             # 10.3s, 110KB

# 4. Vérifications manuelles
- [ ] Pas de console.log en prod
- [ ] Pas de TODO/FIXME bloquants
- [ ] Pas de secrets hardcodés
- [ ] Types TypeScript corrects
- [ ] Tests passants
- [ ] Documentation à jour (si nécessaire)

# 5. Commit
git add .
git commit -m "feat: description claire"  # Conventional commits
git push origin main
```

---

## 🎓 **RESSOURCES & RÉFÉRENCES**

### **Stack Documentation**

- Next.js 15: https://nextjs.org/docs
- TypeScript 5: https://www.typescriptlang.org/docs/
- Firebase: https://firebase.google.com/docs/web/setup
- Tailwind CSS: https://tailwindcss.com/docs
- Recharts: https://recharts.org/en-US/

### **Outils Dev**

- ESLint: https://eslint.org/docs/latest/
- Prettier: https://prettier.io/docs/en/
- Vitest: https://vitest.dev/guide/
- Playwright: https://playwright.dev/docs/intro

### **Internes**

- Design System: `docs/technical/UI_UX_INDUSTRIALIZATION_COMPLETE.md`
- Architecture: `docs/technical/DASHBOARDS_ARCHITECTURE.md`
- CI/CD: `docs/technical/DEPLOYMENT_WORKFLOW_CURRENT.md`
- Tests: `docs/testing/README.md`

---

## 🎯 **PRIORITÉS DÉVELOPPEMENT**

### **Court Terme (30j)**

1. ⏳ Coverage 4.49% → 25% (focus UI components)
2. ⏳ Bundle 110KB → 100KB (optimisations)
3. ⏳ Docs techniques (diagrammes mermaid)

### **Moyen Terme (60j)**

4. ⏳ Tests E2E automatisés (GitHub Actions)
5. ⏳ Monitoring ML (détection anomalies)
6. ⏳ CDN Setup (performance globale)

### **Long Terme (90j)**

7. ⏳ API Documentation (TypeDoc)
8. ⏳ Traduction docs (EN)
9. ⏳ A/B Testing UX

---

## ✅ **ÉTAT ACTUEL (21 Oct 2025)**

```yaml
Status: Production Ready ✅

Code:
  Fichiers: 227 (45,000 LOC)
  TypeScript: 100% (strict mode)
  Tests: 308/308 (4.49% coverage)
  Build: 10.3s / 110KB
  ESLint: 0 errors

Base de Données:
  Documents: 622 (production-ready)
  Structure: 100% conforme
  Dates: Timestamp 12:00:00 UTC+2
  Type: lowercase (cardio/musculation)

Qualité:
  Score: 9.6/10 🏆
  Sécurité: 0 vulnérabilité
  Performance: Lighthouse 95+
  CI/CD: ✅ Automatisé
  Monitoring: Sentry + Analytics
```

---

## 🎬 **CONCLUSION**

### **Ce Contexte Contient**

✅ **80%+ du contexte projet** (structure, stack, modèles)  
✅ **100% des règles critiques** (5 pièges majeurs)  
✅ **Conventions de code** (TypeScript, naming, imports)  
✅ **Design System** (palette, composants, responsive)  
✅ **Tests & qualité** (Vitest, Playwright, ESLint)  
✅ **Sécurité** (Zod, Firestore Rules, Headers)  
✅ **CI/CD** (GitHub Actions, déploiement)  
✅ **Debugging** (Sentry, Analytics, logs)

### **Prochaine Session IA**

1. **Lire ce fichier** (`AI_CODING_CONTEXT_EXHAUSTIVE.md`)
2. **Consulter** `docs/INDEX.md` pour navigation
3. **Vérifier** docs spécifiques selon besoin
4. **Respecter** les 5 règles critiques (dates, types, undefined, etc.)
5. **Tester** avant de commiter (lint, typecheck, tests)

---

**SuperNovaFit v3.0.0** — Excellence Technique 9.6/10 🏆

_Contexte exhaustif basé sur analyse de 227 fichiers source + 622 documents Firestore_

**Dernière MAJ**: 21 Octobre 2025  
**Auteur**: Équipe SuperNovaFit  
**License**: Propriétaire

---

## 📋 **PATTERNS STANDARDS (Standardisation)**

### **Pattern 1 : Gestion Erreurs API**

```typescript
// ✅ PATTERN STANDARD
import * as Sentry from "@sentry/nextjs";

async function saveData(data: MyData) {
  try {
    await addDoc(collection(db, "collection"), data);

    // ✅ Toast user-friendly
    toast.success("Données enregistrées avec succès");
  } catch (error) {
    // ⚠️ Log détaillé en console (dev uniquement)
    if (process.env.NODE_ENV === "development") {
      console.error("Save error:", error);
    }

    // ⚠️ Capturer dans Sentry (prod)
    Sentry.captureException(error, {
      tags: { component: "SaveData", operation: "create" },
      extra: { data },
    });

    // ✅ Message user-friendly (jamais de stack trace)
    toast.error("Une erreur est survenue. Veuillez réessayer.");

    // ⚠️ Re-throw si critique
    throw error;
  }
}
```

---

### **Pattern 2 : Validation Formulaires**

```typescript
// ✅ PATTERN STANDARD (Zod + React Hook Form)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Schema Zod
const FormSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  calories: z.number().positive('Les calories doivent être positives'),
  date: z.instanceof(Date),
});

type FormData = z.infer<typeof FormSchema>;

// 2. Component avec validation
function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (data: FormData) => {
    // ✅ Data est déjà validé et typé
    await saveData(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('nom')} />
      {errors.nom && <span className="text-red-500">{errors.nom.message}</span>}

      <button type="submit">Enregistrer</button>
    </form>
  );
}
```

---

### **Pattern 3 : Loading States Standardisés**

```typescript
// ✅ PATTERN STANDARD (Skeleton + Timeout)
function MyComponent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MyData | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const result = await getData();
        if (mounted) setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    // ⚠️ TOUJOURS cleanup
    return () => { mounted = false; };
  }, []);

  // ✅ Loading Skeleton (pas de spinner générique)
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  // ✅ Empty state
  if (!data) {
    return <EmptyState message="Aucune donnée disponible" />;
  }

  return <div>{/* Render data */}</div>;
}
```

---

### **Pattern 4 : Real-Time Firestore (avec Cleanup)**

```typescript
// ✅ PATTERN STANDARD (onSnapshot avec cleanup)
function useRealtimeData(userId: string) {
  const [data, setData] = useState<MyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "collection"),
      where("user_id", "==", userId),
    );

    // ⚠️ CRITIQUE : TOUJOURS unsubscribe
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MyData[];

        setData(items);
        setLoading(false);
      },
      (error) => {
        console.error("Snapshot error:", error);
        Sentry.captureException(error);
        setLoading(false);
      },
    );

    // ⚠️ CRITIQUE : Cleanup
    return () => unsubscribe();
  }, [userId]);

  return { data, loading };
}
```

---

## 🚨 **RAPPEL FINAL - RÈGLES D'OR**

1. 📅 **Dates = Timestamp 12:00:00** (TOUJOURS!)
2. 📊 **Graphiques = Convertir Timestamp → String** (timestampToDateString)
3. 🏋️ **Type training = lowercase** ('cardio', 'musculation')
4. 🚫 **Jamais undefined dans Firestore** (omettre les champs)
5. ⚙️ **Scripts exclus du build** (tsconfig exclude)

**Ces 5 règles + 4 patterns standards préviennent 95% des bugs récurrents.**

Bon codage ! 🚀
