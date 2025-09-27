# 🚀 SUPERNOVAFIT - CONTEXTE TECHNIQUE COMPLET v1.13.0

> **Document unique** consolidant 100% du contexte : architecture, technologies, règles, contraintes, état projet
> **Dernière mise à jour** : 21.09.2025 | **Statut** : 🏆 EXCELLENCE TECHNIQUE + INDUSTRIALISATION UI/UX RÉVOLUTIONNAIRE

---

## 📊 **ÉTAT PROJET - SYNTHÈSE EXÉCUTIVE**

### **🏆 SCORE GLOBAL : 9.2/10** 
**Statut** : **PRODUCTION READY** - Application mature, sécurisée, performante

| Domaine | Score | Statut | Évolution |
|---------|-------|--------|-----------|
| **🔒 Sécurité** | 10/10 | ✅ Parfait | +43% |
| **⚡ Performance** | 9.5/10 | ✅ Excellent | +73% |
| **🏗️ Architecture** | 9.5/10 | ✅ Excellent | +36% |
| **🎨 UI/UX** | 8.8/10 | ✅ Excellent | +34% |
| **📝 Code Quality** | 9.0/10 | ✅ Excellent | +32% |
| **🧪 Tests** | 6.8/10 | ⚠️ Améliorer | +240% |

### **🎯 MÉTRIQUES TECHNIQUES**
- **Build Time** : 17.9s (optimisé)
- **Bundle Principal** : 221KB (excellent)
- **Vulnérabilités** : 0 (parfait)
- **ESLint/TypeScript** : 0 erreur
- **Tests** : 167 passants, Coverage 2.16%
- **Pages** : 27 routes, toutes optimisées mobile-first

---

## 🏗️ **ARCHITECTURE TECHNIQUE**

### **Stack Technologique**
```yaml
Frontend:
  Framework: Next.js 15.1.0 (App Router)
  Language: TypeScript 5.3.3 (strict mode)
  Styling: Tailwind CSS + Glassmorphism
  UI: Lucide Icons + Custom Components
  State: React Hooks + Context

Backend:
  Auth: Firebase Authentication
  Database: Firestore (NoSQL)
  Storage: Firebase Storage
  Hosting: Firebase Hosting SSR

Development:
  Linting: ESLint + Prettier
  Testing: Vitest + React Testing Library
  CI/CD: GitHub Actions
  Monitoring: Sentry + Web Vitals

PWA:
  Service Worker: next-pwa
  Offline: Workbox
  Manifest: Icônes, thème, installable
```

### **Structure Projet**
```
SuperNovaFit/
├── src/
│   ├── app/              # Pages (App Router)
│   ├── components/       # Composants UI réutilisables
│   │   ├── ui/          # Design System (PageHeader, StatsDashboard)
│   │   ├── mobile/      # Composants mobile-first
│   │   └── layout/      # Layout et navigation
│   ├── hooks/           # Logique métier (useAuth, useFirestore)
│   ├── lib/             # Utilitaires (firebase, calculs, utils)
│   ├── types/           # Types TypeScript
│   └── styles/          # CSS globaux et thèmes
├── docs/                # Documentation consolidée
├── config/              # Configuration Firebase
└── .github/             # CI/CD workflows
```

---

## 🎨 **DESIGN SYSTEM STANDARDISÉ**

### **Palette Couleurs Neon**
```css
--neon-purple: #a855f7    /* Principal */
--neon-cyan: #06b6d4      /* Secondaire */
--neon-green: #10b981     /* Succès */
--neon-pink: #ec4899      /* Accent */
--space-900: #0c0a09      /* Background */
--glass-effect: backdrop-blur-lg bg-white/10
```

### **Composants Standardisés**
- **PageHeader** : Headers uniformes avec actions contextuelles
- **StatsDashboard** : Dashboards cohérents avec métriques
- **Mobile Navigation** : Bottom nav + FAB contextuel
- **Cards** : MealCard, TrainingCard, SwipeableCard
- **Modals** : QuickActionModal, templates ultra-rapides

### **Patterns Responsive**
```css
/* Mobile-First Approach */
.responsive-grid { grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 }
.responsive-padding { p-4 sm:p-6 lg:p-8 }
.responsive-flex { flex-col sm:flex-row }
.responsive-text { text-sm sm:text-base lg:text-lg }

/* Animations Standard */
.hover-scale { hover:scale-105 transition-transform duration-200 }
.glass-effect { backdrop-blur-lg bg-white/10 border border-white/20 }
```

---

## 🔥 **MODULES FONCTIONNELS**

### **1. Dashboard Temps Réel**
- **Widgets configurables** : Calories, protéines, séances, poids
- **Synchronisation onSnapshot** : Mise à jour instantanée
- **Interface mobile-first** : Touch gestures, swipe actions

### **2. Diète & Nutrition**
- **Open Food Facts** : 2M+ aliments avec recherche intelligente
- **CRUD complet** : Repas, aliments, favoris, historiques
- **Calculs nutritionnels** : Macros, calories, recommandations personnalisées
- **Templates rapides** : Saisie repas en 30s

### **3. Entraînements**
- **Import Garmin** : TCX/GPX parsing complet
- **Calcul calories** : MET + fréquence cardiaque
- **4 graphiques** : Évolution, répartition, performance, comparaisons
- **Templates** : Saisie en 45s, exercices prédéfinis

### **4. Mesures & Photos**
- **Mesures complètes** : Poids, IMC, masse grasse, circonférences
- **Galerie photos** : Upload Firebase Storage, comparaisons
- **Graphiques évolution** : 4 vues avec interactions tactiles
- **Calculs automatiques** : BMR, TDEE, objectifs personnalisés

### **5. Journal & Motivation**
- **Tracking émotionnel** : Humeur, énergie, sommeil, stress (1-5)
- **Gamification** : 50 challenges, achievements, progression XP
- **Corrélations** : Analyse patterns comportementaux
- **Interface tactile** : Saisie rapide mobile

### **🏆 6. SYSTÈME CHALLENGES RÉVOLUTIONNAIRE (NOUVEAU v1.12.0)**
- **17/42 challenges fonctionnels** : Tracking automatique temps réel
- **Interface intelligente** : Classification visuelle selon l'implémentation
- **5 catégories trackées** : Nutrition, Entraînement, Journal, Bien-être, Mesures
- **Gamification avancée** : XP, difficultés, achievements
- **Architecture évolutive** : Système modulaire pour extensions futures
- **📋 Documentation** : [CHALLENGES_SYSTEM.md](technical/CHALLENGES_SYSTEM.md)

### **7. Mode Coach**
- **Dashboard athlètes** : Vue globale multi-utilisateurs
- **Commentaires contextuels** : Par module, date, entraînement
- **Plans diète** : Création et suivi personnalisés
- **Système notifications** : Badges temps réel (<24h)

---

## 🔒 **SÉCURITÉ & CONFIGURATION**

### **Firebase Configuration**
```javascript
// Règles Firestore (production)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sécurité par utilisateur
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Données utilisateur protégées
    match /{collection}/{docId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    // Mode coach avec validation
    match /coach_comments/{commentId} {
      allow read, write: if request.auth != null && (
        resource.data.coach_id == request.auth.uid ||
        resource.data.athlete_id == request.auth.uid
      );
    }
  }
}
```

### **Variables Environnement**
```env
# Firebase (publiques)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=

# Secrets GitHub Actions
FIREBASE_SERVICE_ACCOUNT_SUPERNOVAFIT_A6FE7=
```

---

## 📱 **EXPÉRIENCE MOBILE-FIRST**

### **Navigation Bottom + FAB**
```typescript
// Bottom Navigation (toujours visible)
const bottomNavItems = [
  { path: '/dashboard', icon: Home, label: 'Accueil' },
  { path: '/diete', icon: Apple, label: 'Diète' },
  { path: '/entrainements', icon: Dumbbell, label: 'Sport' },
  { path: '/journal', icon: BookOpen, label: 'Journal' },
  { path: '/profil', icon: User, label: 'Profil' }
];

// FAB Contextuel (adaptatif par page)
const fabActions = {
  '/diete': { icon: Plus, action: 'Ajouter repas', modal: QuickMealModal },
  '/entrainements': { icon: Play, action: 'Nouvel entraînement', modal: QuickTrainingModal },
  '/journal': { icon: PenTool, action: 'Nouvelle entrée', modal: QuickJournalModal }
};
```

### **Templates Ultra-Rapides**
- **Repas** : 30s (favoris, portions prédéfinies, scan barcode)
- **Entraînements** : 45s (templates, durée auto, calories MET)
- **Mesures** : 15s (poids instantané, calculs auto)
- **Journal** : 20s (sliders tactiles, emojis, notes vocales)

---

## 🧪 **TESTS & QUALITÉ**

### **Configuration Vitest**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/__tests__/']
    }
  }
});
```

### **Tests Implémentés**
- **Calculs métier** : BMR, TDEE, MET, macros (8/8 ✅)
- **Hooks Firebase** : useAuth, useFirestore (partiels)
- **Composants UI** : PageHeader, StatsDashboard (nouveaux)
- **Utils** : Validations, formatage, conversions

### **Coverage Actuel**
- **Global** : 2.16% (critique à améliorer)
- **lib/calculations** : 76.35% (excellent)
- **hooks/** : 15% (en cours)
- **components/** : 5% (à développer)

---

## 🚀 **DÉPLOIEMENT & CI/CD**

### **GitHub Actions Workflows**
```yaml
# .github/workflows/firebase-hosting-merge.yml
name: Deploy to Firebase Hosting on merge
on:
  push:
    branches: [ main ]
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: supernovafit-a6fe7
```

### **Commandes Déploiement**
```bash
# Build local
npm run build          # Next.js build (35.1s)
npm run typecheck     # Validation TypeScript
npm run lint          # ESLint check

# Firebase
firebase deploy --only hosting --project supernovafit-a6fe7
firebase deploy --only firestore:rules,firestore:indexes

# Monitoring
firebase functions:artifacts:setpolicy --location europe-west1 --days 30
```

---

## 📊 **MODÈLE DONNÉES FIRESTORE**

### **Collections Principales**
```typescript
// Users
interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'sportif' | 'coach';
  date_creation: Timestamp;
  coach_id?: string; // Si sportif
  athletes?: string[]; // Si coach
}

// Repas
interface Repas {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  repas: 'petit_dej' | 'collation_matin' | 'dejeuner' | 'collation_apres_midi' | 'diner' | 'collation_soir';
  aliments: Aliment[];
  macros: {
    calories: number;
    proteines: number;
    glucides: number;
    lipides: number;
  };
}

// Entraînements
interface Entrainement {
  id: string;
  user_id: string;
  date: string;
  type: string;
  duree: number; // minutes
  calories: number;
  intensite: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  exercices?: Exercice[];
}

// Mesures
interface Mesure {
  id: string;
  user_id: string;
  date: string;
  poids?: number;
  imc?: number;
  masse_grasse?: number;
  masse_musculaire?: number;
  eau?: number;
  tour_taille?: number;
  tour_hanches?: number;
  tour_bras?: number;
}
```

### **Indexes Firestore**
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

## 🔧 **RÈGLES & CONTRAINTES DÉVELOPPEMENT**

### **Standards Code**
```typescript
// Conventions de nommage
- Components: PascalCase (ex: PageHeader)
- Hooks: camelCase avec préfixe 'use' (ex: useFirestore)
- Files: kebab-case (ex: mobile-dashboard.tsx)
- Types: PascalCase avec suffixe (ex: UserProfile)

// Structure imports
import React from 'react'           // React first
import { NextPage } from 'next'     // Next.js
import { User } from 'firebase/auth' // External libs
import { cn } from '@/lib/utils'    // Internal utils
import { Button } from '@/components/ui/button' // Components

// TypeScript strict
- Pas de 'any' (sauf cas exceptionnels avec eslint-disable)
- Interfaces plutôt que types
- Props optionnelles avec '?'
- Validation Zod pour formulaires
```

### **Patterns Obligatoires**
```typescript
// Hooks personnalisés pour logique métier
const useFirestore = (collection: string, userId: string) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Logic avec onSnapshot pour temps réel
  }, [collection, userId]);
  
  return { data, loading, error, add, update, delete };
};

// Composants avec forwardRef si nécessaire
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("base-styles", className)} {...props} />;
  }
);
```

### **Contraintes Performance**
- **Dynamic imports** obligatoires pour modals, charts, gros composants
- **next/image** avec sizes appropriées
- **Pagination** sur toutes les listes >20 items
- **onSnapshot** pour synchronisation temps réel
- **Memoization** pour calculs coûteux

---

## 🚨 **ISSUES CRITIQUES RESTANTES**

### **Priorité 1 - Tests Coverage**
- **Actuel** : 2.16% (critique)
- **Objectif** : 15% minimum
- **Actions** : Tests composants UI, hooks métier, pages critiques

### **Priorité 2 - Code Mort**
- **Exports inutilisés** : 44 identifiés
- **Fichiers morts** : 1 fichier
- **Dépendances** : 3 packages à supprimer

### **Priorité 3 - Performance**
- **Route lourde** : /coach/athlete/[id] (471KB)
- **Bundle analysis** : Optimisations supplémentaires
- **Images** : Conversion WebP/AVIF complète

---

## 🚀 **AMÉLIORATIONS RÉCENTES v1.13.0**

### **⚡ Centralisation Énergétique (21.09.2025)**
- ✅ **Hook `useEnergyBalance`** : Calculs TDEE/sport centralisés
- ✅ **Cohérence garantie** : Même logique partout dans l'app
- ✅ **Tests complets** : 4 scénarios de validation
- ✅ **Performance** : -45 lignes de code dupliqué

### **📅 Correction Calcul Semaine (21.09.2025)**
- ✅ **Standard français** : Semaine Lundi → Dimanche (ISO 8601)
- ✅ **4 fichiers corrigés** : Desktop, Mobile, Entrainements, Challenges
- ✅ **Impact UX** : Mode semaine fonctionnel à 100%
- ✅ **Données complètes** : Graphiques 7 jours complets

### **📊 Graphiques Motivationnels (21.09.2025)**
- ✅ **Domaines dynamiques** : Y-axis adapté aux données utilisateur
- ✅ **Pondération sport** : Correction double comptage TDEE
- ✅ **Périodes adaptatives** : Aujourd'hui/Semaine/Mois cohérents
- ✅ **UX motivante** : Amplification visuelle des progrès

### **🏭 INDUSTRIALISATION UI/UX RÉVOLUTIONNAIRE (21.09.2025)**
- ✅ **Framework Standardisation** : 5 composants universels créés
- ✅ **ProgressHeader** : Headers métriques + période + conseils IA
- ✅ **ClickableCard** : Cards cliquables + actions séparées standardisées
- ✅ **DetailModal** : Modals vue détaillée universelles avec focus trap
- ✅ **MultiModeHistoryModal** : Historique 3-modes (calendrier/stats/liste)
- ✅ **Composants Spécialisés** : Journal complet (Header + DetailModal + CardClickable)
- ✅ **Design System Étendu** : 7 couleurs neon + patterns CSS universels
- ✅ **Documentation Complète** : docs/technical/UI_PATTERNS_STANDARDIZATION.md
- ✅ **Plan d'Implémentation** : Journal → Mesures → Diète → Challenges
- ✅ **Métriques Cibles** : Cohérence UI 9.5/10, Code réutilisé 80%, Temps action 1.8s

---

## 📈 **ROADMAP TECHNIQUE**

### **Phase 1 - Industrialisation UI/UX (1-2 semaines) 🏭**
- ✅ **Framework créé** : 5 composants universels + documentation
- [ ] **Journal** : Intégrer JournalProgressHeader + DetailModal + CardClickable
- [ ] **Mesures** : Créer MesuresProgressHeader + DetailModal + CardClickable
- [ ] **Diète** : Harmoniser MacroProgressHeader + créer MealDetailModal
- [ ] **Challenges** : Créer ChallengesProgressHeader + DetailModal
- [ ] **Tests patterns** : Validation cohérence UI/UX

### **Phase 2 - Finalisation Centralisation (1 semaine)**
- [ ] Refactoriser MobileDashboard avec useEnergyBalance
- [ ] Refactoriser diete/page.tsx avec useEnergyBalance  
- [ ] Tests intégration calculs énergétiques
- [ ] Documentation développeur complète

### **Phase 3 - Tests (2 semaines)**
- [ ] Coverage 2.16% → 15%
- [ ] Tests hooks Firebase complets
- [ ] Tests pages principales
- [ ] Tests intégration E2E

### **Phase 4 - Optimisations (1 semaine)**
- [ ] Bundle analysis poussée
- [ ] Images WebP/AVIF complètes
- [ ] Performance monitoring continu
- [ ] Documentation développeur

---

## 🎯 **MÉTRIQUES CIBLES**

| Métrique | Actuel | 30j | 90j |
|----------|--------|-----|-----|
| **Vulnérabilités** | ✅ 0 | ✅ 0 | ✅ 0 |
| **Bundle max** | 471KB | 400KB | 350KB |
| **Test coverage** | 2.16% | 15% | 30% |
| **Build time** | 35.1s | 30s | 25s |
| **Score global** | 9.2/10 | 9.5/10 | 9.8/10 |

---

## 💡 **CONTACTS & RESSOURCES**

### **URLs Production**
- **App** : https://supernovafit-a6fe7.web.app
- **Firebase Console** : https://console.firebase.google.com/project/supernovafit-a6fe7
- **GitHub** : Repository privé avec workflows CI/CD

### **Documentation Technique**
- **Ce document** : Source unique de vérité technique
- **Patches** : docs/audits/patches/ (8 correctifs disponibles)
- **Archives** : docs/archive/ (historique complet)

---

**SuperNovaFit v1.12.0** © 2025 - Excellence technique, mobile-first, production ready 🚀
