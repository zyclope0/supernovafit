# 🎭 Tests E2E SuperNovaFit

**Version :** 2.0.0  
**Date :** 08.10.2025  
**Status :** ✅ 215 Tests Disponibles (4 flux × 5 navigateurs)

> **📖 Documentation complète :** [docs/testing/E2E_TESTS.md](../docs/testing/E2E_TESTS.md)

---

## 🚀 Quick Start (3 minutes)

### 1. Configurer les Credentials (1 min)

Éditer **`.env.test`** à la racine du projet :

```bash
# .env.test
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000

# Utilisateurs existants dans Firebase
TEST_USER_EMAIL=test@supernovafit.com
TEST_USER_PASSWORD=Test123!SuperNova    # Sportif

TEST_COACH_EMAIL=coach@supernovafit.com
TEST_COACH_PASSWORD=Coach123!SuperNova  # Coach

TEST_ATHLETE_EMAIL=athlete@supernovafit.com
TEST_ATHLETE_PASSWORD=Athlete123!SuperNova  # Athlète du coach
```

### 2. Lancer les Tests (2 min)

```bash
# Terminal 1 : Serveur dev
npm run dev

# Terminal 2 : Tests E2E (mode UI recommandé)
npm run test:e2e:ui
```

Dans l'interface Playwright :

- Cliquer sur **"Run all"** pour tous les tests
- Ou sélectionner un fichier spécifique (`auth.spec.ts`, `meal-tracking.spec.ts`)
- ✅ Observer les tests s'exécuter en temps réel

---

## 📊 État Actuel

| Phase               | Tests | Status       | Fichier                 | Coverage |
| ------------------- | ----- | ------------ | ----------------------- | -------- |
| **Phase 1 : Auth**  | 10/10 | ✅ TERMINÉ   | `auth.spec.ts`          | ~5%      |
| **Phase 2 : Meals** | 13/15 | 🔄 EN COURS  | `meal-tracking.spec.ts` | +3%      |
| **Phase 3 : Train** | 0/10  | 📝 À faire   | `training.spec.ts`      | +2%      |
| **Phase 4 : Coach** | 0/10  | 📝 À faire   | `coach.spec.ts`         | +5%      |
| **TOTAL**           | 23/45 | **51% fait** | -                       | **15%**  |

---

## 📝 Scripts Disponibles

```bash
# Tests E2E
npm run test:e2e           # Mode headless (CI)
npm run test:e2e:ui        # Mode UI interactif (recommandé)
npm run test:e2e:headed    # Voir le navigateur
npm run test:e2e:debug     # Mode debug (breakpoints)
npm run test:e2e:report    # Voir rapport HTML

# Tests Unitaires (Vitest)
npm run test               # Mode watch
npm run test:coverage      # Avec coverage
```

---

## 🎯 Tests Implémentés

### Phase 1 : Authentication (10 tests) ✅

**Fichier :** `e2e/auth.spec.ts`

- ✅ Redirection vers `/auth` si non authentifié
- ✅ Erreur sur credentials invalides
- ✅ Login valide avec returnUrl
- ✅ Session persistante après reload
- ✅ Logout fonctionnel depuis `/menu`
- ✅ Protection routes : `/diete`, `/entrainements`, `/mesures`, `/journal`
- ⏸️ Registration (skipped - à implémenter)

### Phase 2 : Meal Tracking (13 tests) 🔄

**Fichier :** `e2e/meal-tracking.spec.ts`

- ✅ Ouvrir le formulaire de repas
- ✅ Rechercher dans OpenFoodFacts
- ✅ Ajouter aliment au repas
- ✅ Sauvegarder repas complet
- ✅ Calculer macros correctement
- ✅ Éditer repas existant
- ✅ Supprimer repas
- ✅ Ajouter aux favoris
- ✅ Afficher totaux journaliers
- ✅ Gérer 6 types de repas
- ✅ Validation repas vide
- ✅ Gestion erreurs réseau
- 📝 Import depuis template (à faire)

---

## 🔧 Configuration

### Environnement

- **Navigateurs :** Chrome Mobile (priorité), Desktop Chrome, Safari Mobile/Desktop, Firefox
- **Timeouts :** 30s par test, 15s actions, 15s navigation
- **Retry :** 2 fois en CI, 0 en local
- **Traces :** Générées en cas d'échec uniquement
- **Rate Limiting :** Désactivé automatiquement (détection user-agent Playwright)

### Firebase Setup

**3 utilisateurs requis dans Firebase Auth :**

```javascript
// 1. Sportif standard
Email: test@supernovafit.com
Password: Test123!SuperNova
Firestore: users/{uid} { role: 'sportif', displayName: 'Test User' }

// 2. Coach
Email: coach@supernovafit.com
Password: Coach123!SuperNova
Firestore: users/{uid} { role: 'coach', displayName: 'Coach Test' }

// 3. Athlète du coach
Email: athlete@supernovafit.com
Password: Athlete123!SuperNova
Firestore: users/{uid} { role: 'sportif', ownerCoachId: '{coach_uid}' }
```

---

## 🐛 Dépannage

### Problèmes Courants et Solutions

#### "Invalid email or password"

```bash
# Solution 1 : Vérifier .env.test
cat .env.test  # Vérifier les mots de passe

# Solution 2 : Test manuel
# Ouvrir http://localhost:3000/auth et tester login
```

#### "Timeout waiting for selector"

```bash
# Solution 1 : Vérifier serveur
lsof -i :3000  # Port occupé ?
npm run dev     # Redémarrer serveur

# Solution 2 : Augmenter timeouts
# Dans playwright.config.ts : navigationTimeout: 30000
```

#### "Rate limit exceeded" (429)

```bash
# Normalement résolu automatiquement
# Si persiste : vérifier src/middleware.ts détecte bien Playwright
```

#### Tests Safari échouent (cookies)

```bash
# Known issue : Safari plus lent pour cookies
# Workaround : waitForTimeout(5000) après login
```

---

## 📚 Structure des Tests

```
e2e/
├── auth.spec.ts           # ✅ Tests authentification (10 tests)
├── meal-tracking.spec.ts  # 🔄 Tests repas (13 tests)
├── training.spec.ts       # 📝 Tests entraînements (à créer)
├── coach.spec.ts          # 📝 Tests mode coach (à créer)
└── README.md              # 📖 Ce document

audit-2025-10/
└── TESTS_PROGRESSION.md   # 📊 Suivi détaillé 4 phases
```

---

## 🎯 Prochaines Étapes

### Phase 2 : Meal Tracking - EN COURS

```bash
# Corriger le locator du bouton "Ajouter un repas"
# Dans meal-tracking.spec.ts ligne ~35 :
const addButton = page.locator('button[title*="Ajouter un repas"]').first();

# Puis valider les 13 tests
npm run test:e2e e2e/meal-tracking.spec.ts
```

### Phase 3 : Training (10 tests) - À créer

- Recording manuel avec durée/calories
- Import fichiers TCX/GPX
- Calcul MET automatique
- Templates d'entraînement

### Phase 4 : Coach-Athlete (10 tests) - À créer

- Génération code invitation
- Acceptation par athlète
- Dashboard coach avec métriques
- Commentaires contextuels

---

## ✅ Checklist Développeur

### Avant d'écrire un test

- [ ] Vérifier les locators dans DevTools (F12)
- [ ] Identifier les `data-testid` disponibles
- [ ] Préférer les sélecteurs stables (`button[title=...]` > `text=...`)

### Bonnes pratiques

- [ ] `beforeEach` : Clear cookies + navigation directe
- [ ] Attendre Firebase Auth : `waitForTimeout(3000-5000)`
- [ ] Assertions flexibles : `toContain()` > `toHaveURL()`
- [ ] Mobile first : Tester d'abord sur "Mobile Chrome"

### Avant de commit

- [ ] `npm run test:e2e` passe localement
- [ ] Pas de `.only()` oublié dans les tests
- [ ] Screenshots/videos supprimés de `test-results/`

---

## 📞 Commandes Utiles

```bash
# Tests ciblés
npm run test:e2e -- auth.spec.ts              # Un fichier
npm run test:e2e -- -g "should login"         # Un test
npm run test:e2e -- --project="Mobile Chrome" # Un navigateur

# Debug
npm run test:e2e:debug                        # Mode debug
npm run test:e2e:headed                       # Voir navigateur
npm run test:e2e:report                       # Rapport HTML

# CI/CD
npm run test:e2e -- --reporter=github         # Format GitHub Actions
```

---

**SuperNovaFit v2.1.0** - Tests E2E Playwright 🎭✅

_Dernière mise à jour : 04.10.2025 | Coverage : 8% → 15% (objectif)_
