# 🎭 Tests E2E Playwright - SuperNovaFit v2.0.0

**Framework :** Playwright  
**Status :** 📋 215 Tests Disponibles (44 tests × 5 navigateurs)  
**Coverage E2E :** ~15% du code (pages + flux utilisateurs)

---

## 🚀 QUICK START

### 1. Configuration (.env.test)

```bash
# .env.test à la racine
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000

# Utilisateurs Firebase (doivent exister)
TEST_USER_EMAIL=test@supernovafit.com
TEST_USER_PASSWORD=Test123!SuperNova

TEST_COACH_EMAIL=coach@supernovafit.com
TEST_COACH_PASSWORD=Coach123!SuperNova

TEST_ATHLETE_EMAIL=athlete@supernovafit.com
TEST_ATHLETE_PASSWORD=Athlete123!SuperNova
```

### 2. Lancer les Tests

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:e2e:ui    # Interface (recommandé)
npm run test:e2e       # Headless (CI)
```

> **📖 Credentials complets :** [docs/guides/TEST_USERS_SUMMARY.md](../guides/TEST_USERS_SUMMARY.md)

---

## 📊 TESTS DISPONIBLES

### Par Module (44 tests uniques)

| Module       | Tests  | Navigateurs | Total   | Status      |
| ------------ | ------ | ----------- | ------- | ----------- |
| **Auth**     | 10     | 5           | 50      | ✅ Prêt     |
| **Meals**    | 13     | 5           | 65      | ✅ Prêt     |
| **Training** | 10     | 5           | 50      | ✅ Prêt     |
| **Coach**    | 11     | 5           | 55      | ✅ Prêt     |
| **TOTAL**    | **44** | **5**       | **215** | ✅ **Prêt** |

### Navigateurs Configurés

1. **Mobile Chrome** (Pixel 5) - Priorité
2. **Desktop Chrome**
3. **Mobile Safari** (iPhone 13)
4. **Desktop Safari**
5. **Desktop Firefox**

---

## 📝 TESTS DÉTAILLÉS

### Authentication (10 tests)

**Fichier :** `e2e/auth.spec.ts`

| #   | Test                                                           | Status |
| --- | -------------------------------------------------------------- | ------ |
| 1   | Redirection → /auth si non auth                                | ✅     |
| 2   | Erreur sur credentials invalides                               | ✅     |
| 3   | Login valide + returnUrl                                       | ✅     |
| 4   | Session persistante après reload                               | ✅     |
| 5   | Logout depuis /menu                                            | ✅     |
| 6-9 | Protection routes (/diete, /entrainements, /mesures, /journal) | ✅     |
| 10  | Registration (skipped)                                         | ⏸️     |

### Meal Tracking (13 tests)

**Fichier :** `e2e/meal-tracking.spec.ts`

| #   | Test                            | Status |
| --- | ------------------------------- | ------ |
| 1   | Ouvrir formulaire repas         | ✅     |
| 2   | Rechercher OpenFoodFacts        | ✅     |
| 3   | Ajouter aliment                 | ✅     |
| 4   | Sauvegarder repas complet       | ✅     |
| 5   | Calculer macros                 | ✅     |
| 6   | Éditer repas existant           | ✅     |
| 7   | Supprimer repas                 | ✅     |
| 8   | Ajouter aux favoris             | ✅     |
| 9   | Afficher totaux journaliers     | ✅     |
| 10  | Gérer 6 types de repas          | ✅     |
| 11  | Valider repas vide              | ✅     |
| 12  | Gérer erreur réseau             | ✅     |
| 13  | Import template (à implémenter) | 📝     |

### Training (10 tests)

**Fichier :** `e2e/training.spec.ts`

| #   | Test                       | Status |
| --- | -------------------------- | ------ |
| 1   | Ouvrir formulaire training | ✅     |
| 2   | Remplir manuel             | ✅     |
| 3   | Calculer calories auto     | ✅     |
| 4   | Sauvegarder session        | ✅     |
| 5   | Afficher dans liste        | ✅     |
| 6   | Éditer training            | ✅     |
| 7   | Supprimer training         | ✅     |
| 8   | Valider champs requis      | ✅     |
| 9   | Gérer différents types     | ✅     |
| 10  | Afficher stats hebdo       | ✅     |

### Coach-Athlete (11 tests)

**Fichier :** `e2e/coach.spec.ts`

| #   | Test                               | Status |
| --- | ---------------------------------- | ------ |
| 1   | Accès dashboard coach              | ✅     |
| 2   | Créer code invitation              | ✅     |
| 3   | Voir liste athlètes                | ✅     |
| 4   | Voir détails athlète               | ✅     |
| 5   | Ajouter commentaire                | ✅     |
| 6   | Accepter invitation (athlète)      | ✅     |
| 7   | Voir commentaires coach            | ✅     |
| 8   | Marquer commentaire lu             | ✅     |
| 9   | Empêcher athlète → coach dashboard | ✅     |
| 10  | Empêcher athlète → autres athlètes | ✅     |
| 11  | Valider permissions coach          | ✅     |

---

## 🔧 CONFIGURATION TECHNIQUE

### Playwright Config

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // Série pour éviter conflits
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: "http://localhost:3000",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    { name: "Mobile Chrome", use: devices["Pixel 5"] },
    { name: "Desktop Chrome", use: devices["Desktop Chrome"] },
    { name: "Mobile Safari", use: devices["iPhone 13"] },
    { name: "Desktop Safari", use: devices["Desktop Safari"] },
    { name: "Desktop Firefox", use: devices["Desktop Firefox"] },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    timeout: 120000,
  },
});
```

### Bonnes Pratiques

**Sélecteurs Recommandés (ordre de préférence) :**

1. `button[title="..."]` - Attributs stables
2. `role="button"` - Sémantique ARIA
3. `data-testid="..."` - Test IDs dédiés
4. `text="..."` - Texte (dernierrecours)

**Attentes Asynchrones :**

```typescript
// ✅ BON
await page.waitForSelector('button[title="Ajouter"]', { timeout: 10000 });
await expect(element).toBeVisible({ timeout: 15000 });

// ❌ MAUVAIS
await page.waitForTimeout(5000); // Arbitraire
```

**Login Pattern :**

```typescript
test.beforeEach(async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/auth");
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000); // Firebase Auth propagation
});
```

---

## 🐛 DÉPANNAGE

### Timeouts

**Symptôme :** "Timeout waiting for selector"

**Causes courantes :**

1. Serveur dev pas démarré
2. Port 3000 occupé
3. Firebase Auth lent (augmenter timeout)
4. CSR bailout Next.js 15 (ajouter waitForSelector)

**Solution :**

```typescript
// Ajouter après goto('/auth')
await page.waitForSelector('input[type="email"]', { timeout: 10000 });
```

### Rate Limiting

**Symptôme :** HTTP 429 "Rate limit exceeded"

**Cause :** Middleware rate limiting actif

**Solution :** Vérifier détection Playwright

```typescript
// src/middleware.ts
const isTestMode = request.headers.get("user-agent")?.includes("Playwright");
if (!isTestMode) {
  // Apply rate limiting
}
```

### Cookies Safari

**Symptôme :** Tests Safari échouent, Chrome OK

**Cause :** Safari plus lent pour cookies auth

**Solution :**

```typescript
// Augmenter timeout après login
await page.waitForTimeout(5000); // 3s → 5s pour Safari
```

---

## 📊 COMMANDES

```bash
# Exécution
npm run test:e2e                    # Tous (headless)
npm run test:e2e:ui                 # Interface (recommandé)
npm run test:e2e:headed             # Voir navigateur
npm run test:e2e -- auth.spec.ts   # Un fichier
npm run test:e2e -- -g "login"     # Pattern

# Debug
npm run test:e2e:debug              # Mode debug
npm run test:e2e -- --trace on      # Traces
npx playwright show-trace trace.zip # Voir trace

# Rapports
npm run test:e2e:report             # HTML report
npx playwright show-report          # Ouvrir rapport
```

---

## 📈 PROGRESSION COVERAGE E2E

| Phase     | Tests  | Coverage Gain | Status  |
| --------- | ------ | ------------- | ------- |
| Auth      | 10     | +5%           | ✅      |
| Meals     | 13     | +3%           | ✅      |
| Training  | 10     | +2%           | 📋      |
| Coach     | 11     | +5%           | 📋      |
| **TOTAL** | **44** | **+15%**      | **51%** |

---

**SuperNovaFit v2.0.0** - Tests E2E Playwright 🎭

_215 tests disponibles - 5 navigateurs - Coverage +15%_
