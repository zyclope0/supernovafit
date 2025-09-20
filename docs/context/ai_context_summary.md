---
**Dernière action** : CONTEXTE AI ENRICHI 📚 - 80% contexte projet accessible rapidement
**Statut** : 🏆 EXCELLENCE PROJET - Contexte complet et actionnable
---

## **SUPERNOVA FIT - CONTEXTE AI COMPLET** 
**Version : 1.11.0** | **Dernière mise à jour : 20.01.2025** | **Statut : 🏆 EXCELLENCE - 80% CONTEXTE**

> **📋 DOCUMENT DÉTAILLÉ** : [docs/CONTEXTE_TECHNIQUE_COMPLET.md](../CONTEXTE_TECHNIQUE_COMPLET.md)  
> **Ce document** : 80% du contexte projet pour prise de contexte rapide

### **🎯 VISION & OBJECTIF**
Application de fitness **mobile-first** pour athlètes et coaches, avec suivi nutritionnel, entraînements, mesures corporelles et journal de progression. Interface coach-athlète intégrée avec système d'invitations. **PWA production ready** respectant WCAG 2.1 AA.

### **🏗️ ARCHITECTURE TECHNIQUE**
```yaml
Stack Principal:
- Frontend: Next.js 15.1.0 (App Router) + TypeScript 5.3.3 + Tailwind CSS
- Backend: Firebase (Auth + Firestore + Storage + Analytics)
- PWA: next-pwa + Service Worker + Offline support
- UI: Glassmorphism + Design System standardisé
- CI/CD: GitHub Actions → Firebase Hosting SSR
- Monitoring: Sentry + Web Vitals + Firebase Analytics

Structure:
src/
├── app/           # Pages Next.js (27 routes)
├── components/    # UI réutilisables + Design System
├── hooks/         # Logique métier (useAuth, useFirestore)
├── lib/           # Utils, firebase, calculs (BMR/TDEE/MET)
├── types/         # Interfaces TypeScript strictes
└── styles/        # Tailwind + thèmes neon
```

### **🎨 DESIGN SYSTEM STANDARDISÉ**
```css
Palette Neon:
--neon-purple: #a855f7    /* Principal */
--neon-cyan: #06b6d4      /* Secondaire */
--neon-green: #10b981     /* Succès */
--neon-pink: #ec4899      /* Accent */

Composants Standards:
- PageHeader: Headers uniformes avec actions contextuelles
- StatsDashboard: Dashboards cohérents avec métriques colorées
- Mobile: BottomNav + FAB contextuel + Templates ultra-rapides
- Cards: MealCard, TrainingCard, SwipeableCard avec animations

Patterns Responsive:
.responsive-grid { grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 }
.hover-scale { hover:scale-105 transition-transform duration-200 }
.glass-effect { backdrop-blur-lg bg-white/10 border border-white/20 }
```

### **📊 ÉTAT PROJET ACTUEL**
- **🏆 SCORE GLOBAL** : **9.2/10** (Excellence technique)
- **🏆 SÉCURITÉ** : 0 vulnérabilité, Firebase sécurisé
- **🏆 PERFORMANCE** : Build 30.3s, Bundle 221KB optimisé
- **🏆 CODE QUALITY** : 0 erreur ESLint/TypeScript
- **🏆 UI/UX** : Design system standardisé, mobile-first
- **⚠️ TESTS** : Coverage 2.16% (à améliorer vers 15%)
- **⚠️ CODE MORT** : 44 exports inutilisés (cleanup nécessaire)

### **📱 EXPÉRIENCE MOBILE-FIRST**
```typescript
Navigation Bottom (toujours visible):
- /dashboard: Home + Widgets configurables
- /diete: Apple + Quick Meal (30s)
- /entrainements: Dumbbell + Quick Training (45s)
- /journal: BookOpen + Quick Entry (20s)
- /profil: User + Calculs BMR/TDEE

FAB Contextuel (adaptatif par page):
- Diète: Ajouter repas → QuickMealModal
- Entraînements: Nouvel entraînement → QuickTrainingModal
- Journal: Nouvelle entrée → QuickJournalModal

Templates Ultra-Rapides:
- Repas: 30s (favoris, portions, scan barcode)
- Entraînements: 45s (templates, MET calories)
- Mesures: 15s (poids instantané, calculs auto)
```

### **🗄️ MODÈLE DONNÉES FIRESTORE**
```typescript
Collections Principales:
users/{userId} → { role: 'coach'|'sportif', nom, email, coach_id?, athletes? }
repas/{id} → { user_id, date, repas: 'petit_dej'|'dejeuner'..., aliments[], macros }
entrainements/{id} → { user_id, date, type, duree, calories, intensite, exercices? }
mesures/{id} → { user_id, date, poids?, imc?, masse_grasse?, tour_taille? }
journal/{id} → { user_id, date, humeur, energie, sommeil, stress, note }
coach_comments/{id} → { coach_id, athlete_id, module, comment, read_by_athlete? }

Indexes Critiques:
- repas: [user_id ASC, date DESC]
- coach_comments: [athlete_id ASC, module ASC, date DESC]
```

### **🚀 MODULES FONCTIONNELS**
- **Dashboard Temps Réel** : Widgets configurables, synchronisation onSnapshot
- **Diète & Nutrition** : Open Food Facts (2M+ aliments), CRUD repas, macros, suggestions
- **Entraînements** : Import Garmin TCX/GPX, calcul MET, 4 graphiques évolution
- **Mesures & Photos** : Upload Firebase Storage, calculs BMR/TDEE, comparaisons
- **Journal & Motivation** : Tracking émotionnel, 50 challenges, gamification XP
- **Mode Coach** : Dashboard athlètes, commentaires contextuels, plans diète

### **🔒 SÉCURITÉ & DÉPLOIEMENT**
```yaml
Firebase Configuration:
- Auth: Email/Password + AuthGuard protection routes
- Firestore: Règles strictes par user_id + validation coach
- Storage: Upload photos sécurisé + optimisation images
- Hosting: SSR + GitHub Actions CI/CD

Variables Environnement:
NEXT_PUBLIC_FIREBASE_*: Configuration publique Firebase
NEXT_PUBLIC_SENTRY_DSN: Monitoring erreurs production
FIREBASE_SERVICE_ACCOUNT_*: Déploiement GitHub Actions

Commandes Critiques:
npm run build     # Build Next.js (30.3s)
npm run lint      # ESLint + TypeScript check
npm run test      # Vitest (167 tests, 2.16% coverage)
firebase deploy --only hosting --project supernovafit-a6fe7
```

### **🧪 TESTS & QUALITÉ**
```typescript
Configuration Vitest:
- Environment: jsdom + React Testing Library
- Coverage: v8 provider (critique: 2.16% actuel)
- Mocks: Firebase, next/navigation, composants externes

Tests Implémentés:
✅ lib/calculations: BMR, TDEE, MET (76.35% coverage)
⚠️ hooks/: useAuth, useFirestore (partiels)
⚠️ components/: PageHeader, StatsDashboard (nouveaux)
❌ pages/: Tests E2E manquants

Scripts:
npm run test:lib        # Tests calculs métier (8/8 ✅)
npm run test:hooks      # Tests Firebase hooks
npm run test:coverage   # Rapport coverage complet
```

### **🔧 RÈGLES DÉVELOPPEMENT**
```typescript
Conventions Obligatoires:
- Components: PascalCase + React.forwardRef si nécessaire
- Hooks: camelCase avec préfixe 'use' (ex: useFirestore)
- Types: Interfaces PascalCase (ex: UserProfile)
- Files: kebab-case (ex: mobile-dashboard.tsx)

Patterns Critiques:
- Dynamic imports: Modals, charts, gros composants
- onSnapshot: Synchronisation temps réel Firestore
- Memoization: React.memo + useMemo pour calculs coûteux
- Validation: Zod pour tous les formulaires
- Error boundaries: ChunkGuard pour erreurs chunks

ESLint/TypeScript Strict:
- Pas de 'any' (sauf cas exceptionnels avec eslint-disable)
- Props optionnelles avec '?'
- Imports organisés: React → Next → External → Internal
```

### **🎯 PROCHAINES ACTIONS PRIORITAIRES**
1. **Tests Coverage** : 2.16% → 15% (critique pour production)
2. **Code Mort** : Nettoyer 44 exports inutilisés (-31% déjà fait)
3. **Performance** : Optimiser route /coach/athlete/[id] (471KB → 350KB)
4. **Dépendances** : Supprimer 3 packages obsolètes identifiés

### **📊 MÉTRIQUES CIBLES 30/90 JOURS**
| Métrique | Actuel | 30j | 90j |
|----------|--------|-----|-----|
| Vulnérabilités | ✅ 0 | ✅ 0 | ✅ 0 |
| Bundle max | 471KB | 400KB | 350KB |
| Test coverage | 2.16% | 15% | 30% |
| Build time | 30.3s | 25s | 20s |
| Score global | 9.2/10 | 9.5/10 | 9.8/10 |

---

**SuperNovaFit v1.11.0** © 2025 - Application mobile-first, production ready 🚀  
**Contexte AI : 80% projet** | **Document complet** : [CONTEXTE_TECHNIQUE_COMPLET.md](../CONTEXTE_TECHNIQUE_COMPLET.md)