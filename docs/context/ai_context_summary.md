# 🤖 SUPERNOVAFIT - CONTEXTE AI QUICK REFERENCE

**Version** : 2.2.0 | **Dernière MAJ** : 21.10.2025 | **Score** : 9.6/10 🏆

> **🎯 Objectif** : Quick reference (40% du projet en < 5 minutes)  
> **⭐ Contexte PRINCIPAL** : [AI_CODING_CONTEXT_EXHAUSTIVE.md](AI_CODING_CONTEXT_EXHAUSTIVE.md) **(80%+ du projet)**  
> **📖 Détails techniques** : [CONTEXTE_TECHNIQUE_COMPLET.md](../CONTEXTE_TECHNIQUE_COMPLET.md)

---

## 🚨 **IMPORTANT : USAGE DE CE DOCUMENT**

Ce fichier est une **référence rapide** pour scan initial.  
**Pour toute modification de code**, utilisez **[AI_CODING_CONTEXT_EXHAUSTIVE.md](AI_CODING_CONTEXT_EXHAUSTIVE.md)** qui contient :

- ✅ **5 règles critiques** avec exemples avant/après
- ✅ **Conventions complètes** (imports, nommage, structure)
- ✅ **Pièges courants** + solutions (dates, types, undefined)
- ✅ **Patterns obligatoires** (Firestore, validation, tests)

---

## 🚀 **VISION & MÉTIER**

**SuperNovaFit** = Application fitness **mobile-first** pour athlètes et coaches

### **Fonctionnalités Core**

- 📱 Suivi nutrition (Open Food Facts 2M+ aliments)
- 🏋️ Tracking entraînements (import Garmin TCX/GPX, calcul MET)
- 📊 Mesures corporelles (IMC, BMR/TDEE, photos progression)
- 📓 Journal bien-être (humeur, sommeil, énergie, stress)
- 🎯 Challenges et gamification (50 challenges, XP, badges)
- 👨‍🏫 Mode Coach (dashboard athlètes, commentaires, plans diète)

### **Spécificités Métier**

- **Mobile-first** : Interface optimisée tablette/smartphone
- **Temps réel** : Synchronisation onSnapshot Firestore
- **PWA** : Offline-first, service worker, cache intelligent
- **Accessibilité** : WCAG 2.1 AA, screen readers, focus management

---

## 🏗️ **STACK TECHNIQUE**

### **Frontend**

```yaml
Framework: Next.js 15.1.0 (App Router)
Language: TypeScript 5.3.3 (strict mode)
UI: Tailwind CSS + Glassmorphism design
State: React hooks + Context API
Forms: React Hook Form + Zod validation
Charts: Recharts (dynamic imports)
Icons: Lucide React + Heroicons
```

### **Backend & Services**

```yaml
BaaS: Firebase (Auth, Firestore, Storage, Analytics)
Auth: Email/Password + AuthGuard protection
Database: Firestore (NoSQL, temps réel)
Storage: Firebase Storage (photos, imports)
Monitoring: Sentry (client/server/edge)
Analytics: Firebase Analytics + Web Vitals
```

### **DevOps & CI/CD**

```yaml
CI/CD: GitHub Actions (quality + deploy)
Hosting: Firebase Hosting (SSR Next.js)
Tests: Vitest + React Testing Library
Linting: ESLint + Prettier + Husky
Coverage: 4.49% (objectif 25%)
Build: 10.3s | Bundle: 110KB
```

---

## 📁 **STRUCTURE CODE**

```
src/
├── app/                    # Pages Next.js (App Router - 35 routes)
│   ├── page.tsx            # Dashboard principal
│   ├── auth/               # Authentification
│   ├── diete/              # Nutrition + Open Food Facts
│   ├── entrainements/      # Workouts + Garmin import
│   ├── mesures/            # Body metrics + photos
│   ├── journal/            # Wellness tracking
│   ├── challenges/         # Gamification
│   ├── profil/             # User profile + settings
│   ├── export/             # Export données (CSV/PDF)
│   ├── coach/              # Mode Coach
│   │   ├── page.tsx        # Dashboard coach
│   │   ├── all-athletes/   # Liste athlètes
│   │   ├── athlete/[id]/   # Détail athlète
│   │   ├── programmes/     # Programmes entraînement
│   │   └── rapports/       # Rapports coach
│   ├── admin/              # Administration
│   ├── create-coach/       # Création compte coach
│   ├── guide/              # Guide utilisateur
│   ├── menu/               # Menu navigation
│   ├── nouveautes/         # Nouveautés
│   └── legal/              # Pages légales (privacy, terms, cookies)
├── components/
│   ├── ui/                 # Design System (StandardModal, ProgressHeader)
│   ├── charts/             # Recharts wrappers
│   ├── mobile/             # Mobile-specific (BottomNav, FAB)
│   ├── layout/             # MainLayout, Sidebar
│   ├── diete/              # DietForm, NutritionAnalytics, SmartSuggestions
│   ├── journal/            # JournalForm, JournalWellnessHeader
│   └── [domain]/           # Domain components
├── hooks/                  # Custom hooks
│   ├── useAuth.ts          # Authentication + user profile
│   ├── useFirestore.ts     # Firestore CRUD + real-time
│   ├── useEnergyBalance.ts # Balance énergétique
│   └── use[Feature].ts     # Feature-specific hooks
├── lib/
│   ├── firebase.ts         # Firebase config + init
│   ├── calculations.ts     # BMR, TDEE, MET formulas
│   ├── userCalculations.ts # Calculs utilisateur
│   ├── validation.ts       # Zod schemas
│   ├── nutritional-database.ts # Base données nutritionnelle
│   ├── badges.ts           # Système badges/achievements
│   └── utils.ts            # Helpers
├── types/                  # TypeScript interfaces
│   └── index.ts            # Types centralisés
└── styles/                 # Global CSS + Tailwind config
    └── globals.css         # CSS global
```

---

## 🗄️ **MODÈLE DONNÉES**

### **Collections Firestore**

```typescript
users/{userId}
  → { id, role: 'coach'|'sportif', nom, email, ownerCoachId?, athletes?, created_at }

repas/{repasId}
  → { user_id, date, repas: 'petit_dej'|'collation_matin'|'dejeuner'|
      'collation_apres_midi'|'diner'|'collation_soir', aliments[], macros, created_at }

entrainements/{entrainementId}
  → { user_id, date, type, duree, calories, intensite, exercices?, created_at }

mesures/{mesureId}
  → { user_id, date, poids?, imc?, masse_grasse?, tour_taille?, created_at }

journal/{entryId}
  → { user_id, date, humeur, energie, sommeil, stress, note, created_at }

coach_comments/{commentId}
  → { coach_id, athlete_id, module, date?, training_id?, entry_id?,
      mesure_id?, comment, read_by_athlete?, created_at }

coach_diet_plans/{planId}
  → { coach_id, athlete_id, date_creation, petit_dej?, collation_matin?,
      dejeuner?, collation_apres_midi?, diner?, collation_soir?, notes_generales }

invites/{inviteId}
  → { coachId, code, status: 'active'|'used'|'expired', usedByAthleteId?,
      usedAt?, createdAt }

challenges/{challengeId}
  → { user_id, type, target, progress, status, created_at, completed_at? }

badges/{badgeId}
  → { user_id, type, titre, description, icone, date_obtention }

objectifs/{objectifId}
  → { user_id, titre, description, cible, progres, statut, type, date_creation }

favoris_aliments/{favoriId}
  → { user_id, aliment_data, ajouté_le }

photos_progression/{photoId}
  → { user_id, date, url, type, mesure_id?, commentaire }
```

### **Indexes Critiques**

```yaml
repas: [user_id ASC, date DESC]
entrainements: [user_id ASC, date DESC]
mesures: [user_id ASC, date DESC]
journal: [user_id ASC, date DESC]
coach_comments: [athlete_id ASC, module ASC, date DESC]
coach_diet_plans: [athlete_id ASC, date_creation DESC]
menus_type: [coach_id ASC]
```

### **Sécurité Firestore**

- ✅ **Rate limiting** : 100 req/h, 20 créations/h par user
- ✅ **Validation** : user_id obligatoire, propriété stricte
- ✅ **Coach access** : Lecture athlètes assignés uniquement

---

## 🔧 **RÈGLES DÉVELOPPEMENT**

### **Conventions Obligatoires**

```typescript
// Naming
Components: PascalCase (UserProfile.tsx)
Hooks: camelCase + 'use' prefix (useFirestore.ts)
Types: PascalCase interfaces (UserProfile)
Files: kebab-case (mobile-dashboard.tsx)

// TypeScript Strict
- NO 'any' (sauf exceptions avec eslint-disable)
- Props optionnelles avec '?'
- Imports organisés: React → Next → External → Internal
```

### **Patterns Critiques**

```typescript
// 1. Dynamic Imports (performance)
const Modal = dynamic(() => import('@/components/ui/Modal'), {
  ssr: false,
  loading: () => <Skeleton />
});

// 2. Firestore Real-time
const unsub = onSnapshot(collection, (snapshot) => {
  // TOUJOURS cleanup dans useEffect return
});

// 3. Validation Zod
const schema = z.object({ ... });
const validated = schema.parse(data); // Throws si invalide

// 4. Error Boundaries
<ChunkGuard fallback={<Error />}>
  <DynamicComponent />
</ChunkGuard>
```

### **À ÉVITER**

```typescript
❌ Fetch direct dans composants (utiliser hooks)
❌ État global sans Context/Props drilling
❌ Firestore queries non optimisées (use indexes)
❌ Images non optimisées (use next/image)
❌ Modals SSR (toujours ssr: false)
```

---

## 🎨 **DESIGN SYSTEM**

### **Palette Neon**

```css
--neon-purple: #a855f7 /* Principal */ --neon-cyan: #06b6d4 /* Secondaire */
  --neon-green: #10b981 /* Succès */ --neon-pink: #ec4899 /* Accent */
  --neon-yellow: #eab308 /* Énergie */ --neon-red: #ef4444 /* Attention */;
```

### **Composants Universels**

- `StandardModal` : Modals unifiées (border-white/70, focus trap)
- `ProgressHeader` : Headers métriques + conseils IA
- `ClickableCard` : Cards actions séparées (voir/éditer/supprimer)
- `HealthIndicator` : Zones couleur OMS (IMC, masse grasse)

### **Patterns CSS**

```css
.glass-effect { backdrop-blur-lg bg-white/10 border border-white/20 }
.hover-scale { hover:scale-105 transition-transform duration-200 }
```

---

## 🔒 **SÉCURITÉ**

### **Headers HTTP**

```yaml
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()
Strict-Transport-Security: max-age=31536000
```

### **Firebase Security**

- ✅ **Firestore Rules** : Rate limiting + validation user_id
- ✅ **Storage Rules** : Upload limité à 10MB par user
- ✅ **Auth** : AuthGuard sur toutes routes protégées

---

## 🧪 **TESTS & QUALITÉ**

### **Configuration**

```yaml
Framework: Vitest + jsdom
Library: React Testing Library
Coverage: 4.49% (objectif 25%)
Mocks: Firebase, next/navigation, composants
```

### **Tests Actuels**

```
✅ Tests Unitaires: 308/308 (100% passent)
✅ Tests E2E: 215 disponibles (4 flux × 5 navigateurs)
✅ Modules critiques: validation 92%, dateUtils 95%, utils 100%
✅ Security: 58% coverage (RateLimiter, Firestore rules)
⏸️ Badges: 13 tests skippés (fonctionnalité non implémentée)
```

### **Commandes**

```bash
# Tests Unitaires (Vitest)
npm run test              # Mode watch
npm run test:coverage     # Avec coverage
npm run test:ui           # Interface Vitest
npm test -- <pattern>     # Tests spécifiques

# Tests E2E (Playwright)
npm run test:e2e          # Headless (CI)
npm run test:e2e:ui       # Interface Playwright
npm run test:e2e:headed   # Voir navigateur
npm run test:e2e:report   # Rapport HTML
```

---

## 🚀 **COMMANDES CRITIQUES**

### **Développement**

```bash
npm run dev               # Dev server (localhost:3000)
npm run build             # Build production (10.3s)
npm run lint              # ESLint + Prettier
npm run typecheck         # TypeScript strict
npm run test              # Tests Vitest
```

### **Déploiement**

```bash
# Automatique via GitHub Actions
git push origin main      # → quality checks → deploy production

# Manuel (si nécessaire)
npm run build
firebase deploy --only hosting --project supernovafit-a6fe7
```

### **Maintenance**

```bash
make clean                # Nettoyer build artifacts
npm audit                 # Vérifier vulnérabilités
npx depcheck              # Dépendances inutilisées
npx ts-unused-exports     # Exports non utilisés
```

---

## ⚠️ **POINTS D'ATTENTION**

### **Limitations Connues**

1. **Coverage 4.49%** : Objectif 25% avant release majeure (15% pages E2E non comptées)
2. **Bundle 110KB** : Objectif 100KB (dynamic imports aggressive)
3. **Firestore Rules** : Rate limiting peut bloquer tests intensifs
4. **Open Food Facts API** : Rate limit 100 req/min (géré côté client)

### **Décisions Architecture**

1. **Next.js App Router** : Migration complète de Pages Router
2. **Firebase BaaS** : Pas de backend custom, limites Firebase acceptées
3. **Mobile-first** : Desktop = extension mobile, pas l'inverse
4. **PWA** : Offline-first avec cache intelligent (30j images)

### **Patterns Spécifiques Projet**

1. **Dashboard contextuels** : 3 dashboards selon contexte (mobile <xl, desktop ≥xl, coach)
2. **Quick Actions** : QuickMealModal, QuickTrainingModal (30s/45s max)
3. **Real-time sync** : onSnapshot avec cleanup systématique dans useEffect
4. **Industrialisation UI** : 5/5 pages principales standardisées (Journal, Diète, Mesures, Challenges, Entraînements)
5. **Pagination intelligente** : usePaginatedEntrainements (30 items/page)
6. **Smart Suggestions** : Suggestions intelligentes basées sur habitudes + nutritional-database

---

## 📊 **ÉTAT ACTUEL**

| Métrique         | Valeur                    | Objectif 30j |
| ---------------- | ------------------------- | ------------ |
| **Score Global** | 9.5/10                    | 9.7/10       |
| **Sécurité**     | ✅ 0 vuln                 | ✅ 0 vuln    |
| **Performance**  | Build 10.3s, Bundle 110KB | 9s, 100KB    |
| **Tests**        | 308 tests, 4.49%          | 25%          |
| **Code Quality** | 0 ESLint errors           | 0 errors     |

**Dernières actions :**

- ✅ Audit technique complet (8/8 phases)
- ✅ Monitoring production (Sentry + alertes)
- ✅ Tests validés (308/308, 100% passent)
- ✅ Documentation tests standardisée (13 → 7 fichiers)
- ✅ OPT-14 Logger Custom implémenté (debugging production optimisé)
- ✅ FCM complètement fonctionnel (clé VAPID réelle + service worker + test intégré)

---

## 📚 **DOCUMENTATION RÉFÉRENCE**

| Document                                                                                | Usage                  |
| --------------------------------------------------------------------------------------- | ---------------------- |
| [CONTEXTE_TECHNIQUE_COMPLET.md](../CONTEXTE_TECHNIQUE_COMPLET.md)                       | Détails approfondis    |
| [UI_UX_INDUSTRIALIZATION_COMPLETE.md](../technical/UI_UX_INDUSTRIALIZATION_COMPLETE.md) | Design System complet  |
| [DEPLOYMENT_WORKFLOW_CURRENT.md](../technical/DEPLOYMENT_WORKFLOW_CURRENT.md)           | CI/CD détaillé         |
| [testing/README.md](../testing/README.md)                                               | Tests (Point d'entrée) |
| [guides/GUIDE_PRATIQUE_TESTING_CICD.md](../guides/GUIDE_PRATIQUE_TESTING_CICD.md)       | Tests (Pédagogique)    |
| [guides/TEST_USERS_SUMMARY.md](../guides/TEST_USERS_SUMMARY.md)                         | Credentials Firebase   |
| [audit-2025-10/](../../audit-2025-10/)                                                  | Audit Octobre 2025     |

---

**SuperNovaFit v2.1.0** © 2025 - Excellence Technique 9.5/10 🏆

_Ce document contient 80% du contexte nécessaire pour développer efficacement sur SuperNovaFit_
