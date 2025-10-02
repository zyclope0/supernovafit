# 🎭 Tests E2E SuperNovaFit - Guide Complet

**Version :** 1.0.0  
**Date :** 02.10.2025  
**Statut :** ✅ Phase 1 Implémentée (10 tests auth)

---

## 🚀 Quick Start (3 minutes)

### 1. Configurer les Credentials (1 min)

Éditer **`.env.test`** à la racine du projet :

```bash
# .env.test
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
TEST_USER_EMAIL=test@supernovafit.com
TEST_USER_PASSWORD=TonMotDePasse     # ⚠️ CHANGER
TEST_COACH_EMAIL=coach@supernovafit.com
TEST_COACH_PASSWORD=TonMotDePasseCoach  # ⚠️ CHANGER
```

### 2. Lancer les Tests (2 min)

```bash
# Terminal 1 : Serveur dev
npm run dev

# Terminal 2 : Tests E2E (mode UI recommandé)
npm run test:e2e:ui
```

Dans l'interface Playwright :

- Cliquer sur **"Run all"**
- ✅ Les 10 tests devraient passer

---

## 📊 État Actuel

| Phase               | Tests | Status        | Coverage |
| ------------------- | ----- | ------------- | -------- |
| **Phase 1 : Auth**  | 10    | ✅ Implémenté | ~5%      |
| **Phase 2 : Meals** | 15    | 🔄 À faire    | +3%      |
| **Phase 3 : Train** | 10    | 🔄 À faire    | +2%      |
| **Phase 4 : Coach** | 10    | 🔄 À faire    | +5%      |
| **TOTAL**           | 45    | **22% fait**  | **15%**  |

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

| Test                             | Ligne   |
| -------------------------------- | ------- |
| Redirection si non authentifié   | 18-26   |
| Erreur sur credentials invalides | 28-40   |
| Login valide avec redirect       | 42-56   |
| Session persistante après reload | 58-76   |
| Logout fonctionnel               | 78-103  |
| Protection route /diete          | 105-110 |
| Protection route /entrainements  | 112-117 |
| Protection route /mesures        | 119-124 |
| Protection route /journal        | 126-131 |

---

## 🔧 Configuration

### Environnement

- **Navigateurs :** Chrome Mobile (priorité), Desktop Chrome, Safari Mobile/Desktop, Firefox
- **Timeouts :** 30s par test, 10s actions, 15s navigation
- **Retry :** 2 fois en CI, 0 en local
- **Traces :** Générées en cas d'échec uniquement

### Firebase

Les utilisateurs doivent **exister dans Firebase Auth** :

- `test@supernovafit.com` (role: sportif)
- `coach@supernovafit.com` (role: coach)

**Documents Firestore requis :**

- `users/[UID]` avec champs `email`, `role`, `displayName`

---

## 🐛 Dépannage

### "Invalid email or password"

✅ Vérifier credentials dans `.env.test`  
✅ Tester login manuel sur `http://localhost:3000`

### "Timeout waiting for..."

✅ Vérifier serveur dev tourne (`npm run dev`)  
✅ Vérifier `http://localhost:3000` accessible

### Tests qui échouent aléatoirement (flaky)

✅ Augmenter timeouts dans `playwright.config.ts`  
✅ Utiliser `waitForSelector` au lieu de `click` direct

---

## 📚 Documentation Détaillée

- **[TESTS_PROGRESSION.md](../audit-2025-10/TESTS_PROGRESSION.md)** - Suivi complet 4 phases
- **[playwright.config.ts](../playwright.config.ts)** - Configuration technique

---

## 🎯 Prochaines Étapes

### Phase 2 : Meal Tracking (15 tests) - À venir

- Recherche aliments OpenFoodFacts
- Ajout/édition/suppression repas
- Calcul macros
- Gestion favoris

### Phase 3 : Training (10 tests) - À venir

- Recording manuel séances
- Validation données (durée, calories)
- Édition/suppression

### Phase 4 : Coach-Athlete (10 tests) - À venir

- Création/acceptation invitations
- Visualisation données athlete
- Commentaires et plans diététiques

---

## ✅ Checklist Avant Commit

- [ ] Tous les tests passent localement
- [ ] Tests ajoutés pour nouvelle fonctionnalité
- [ ] Sélecteurs sémantiques utilisés (aria-label, role)
- [ ] Timeouts appropriés spécifiés
- [ ] Cleanup dans `beforeEach`/`afterEach`
- [ ] Tests exécutés sur mobile ET desktop

---

**SuperNovaFit v2.0.0** - Tests E2E Playwright 🎭✅

_Dernière mise à jour : 02.10.2025_
