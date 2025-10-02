# 🎭 Tests E2E avec Playwright - SuperNovaFit

## 📋 Vue d'ensemble

Tests end-to-end pour valider les parcours critiques de l'application en conditions réelles.

### Objectifs

- **Coverage 3.93% → 15%** (premier pallier)
- Parcours critiques 100% testés
- Régressions détectées automatiquement
- CI/CD integration complète

---

## 🚀 Quick Start

### Installation

```bash
# Déjà fait dans le projet
npm install -D @playwright/test

# Installer les navigateurs
npx playwright install
```

### Lancer les tests

```bash
# Tous les tests
npm run test:e2e

# Interface interactive
npm run test:e2e:ui

# Mode debug
npm run test:e2e:debug

# Voir le rapport
npm run test:e2e:report
```

---

## 📁 Structure

```
e2e/
├── README.md                    # Ce fichier
├── auth.spec.ts                 # ✅ Tests authentification
├── meal-tracking.spec.ts        # 🔄 Tests suivi repas
├── training.spec.ts             # 🔄 Tests entraînements
├── coach-athlete.spec.ts        # 🔄 Tests mode coach
├── fixtures/                    # Données de test
│   ├── users.ts                 # Utilisateurs de test
│   └── meals.ts                 # Repas de test
└── helpers/                     # Utilitaires
    ├── auth-helper.ts           # Helper authentification
    └── data-helper.ts           # Helper données

```

---

## 🎯 Parcours Critiques

### 1. Authentication (✅ Implémenté)

```typescript
// e2e/auth.spec.ts
- ✅ Redirection si non auth
- ✅ Login invalide (erreur)
- ✅ Login valide (succès)
- ✅ Session persistante
- ✅ Logout
- ✅ Protection routes
```

### 2. Meal Tracking (🔄 À faire)

```typescript
// e2e/meal-tracking.spec.ts
- [ ] Recherche aliment OpenFoodFacts
- [ ] Ajout aliment à un repas
- [ ] Édition repas existant
- [ ] Suppression repas
- [ ] Vérification macros totales
- [ ] Ajout aux favoris
```

### 3. Training (🔄 À faire)

```typescript
// e2e/training.spec.ts
- [ ] Recording manuel séance
- [ ] Validation données (durée, calories)
- [ ] Édition séance
- [ ] Suppression séance
- [ ] Import Garmin (si applicable)
```

### 4. Coach-Athlete (🔄 À faire)

```typescript
// e2e/coach-athlete.spec.ts
- [ ] Création invitation
- [ ] Acceptation invitation
- [ ] Visualisation données athlete
- [ ] Ajout commentaire coach
- [ ] Création plan diététique
```

---

## 🔧 Configuration

### Environnement de Test

```bash
# .env.test
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
TEST_USER_EMAIL=test@supernovafit.com
TEST_USER_PASSWORD=Test123!SuperNova
TEST_COACH_EMAIL=coach@supernovafit.com
TEST_COACH_PASSWORD=Coach123!SuperNova
```

**⚠️ IMPORTANT :**

- Créer des utilisateurs Firebase dédiés aux tests
- **NE JAMAIS** utiliser de vrais utilisateurs
- **NE JAMAIS** committer `.env.test` avec vraies credentials

### Navigateurs Testés

- ✅ Chrome Mobile (Pixel 5) - **Priorité 1**
- ✅ Chrome Desktop
- ✅ Safari Mobile (iPhone 12)
- ✅ Safari Desktop
- ✅ Firefox Desktop

---

## 📝 Conventions de Code

### Nommage des Tests

```typescript
test("should [action] when [condition]", async ({ page }) => {
  // Arrange
  await page.goto("/route");

  // Act
  await page.click("button");

  // Assert
  await expect(page).toHaveURL("/expected");
});
```

### Sélecteurs Recommandés

```typescript
// ✅ PRÉFÉRER : Sélecteurs sémantiques
page.locator('role=button[name="Submit"]');
page.locator('text="Ajouter un repas"');
page.locator('button[aria-label="Fermer"]');

// ⚠️ ÉVITER : Sélecteurs CSS fragiles
page.locator(".btn-primary");
page.locator("#submit-btn");
```

### Attentes

```typescript
// Toujours spécifier timeout pour actions async
await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
await expect(element).toBeVisible({ timeout: 5000 });
```

---

## 🎯 Métriques Cibles

| Phase       | Objectif         | Tests E2E    | Coverage |
| ----------- | ---------------- | ------------ | -------- |
| **Phase 1** | Authentication   | 10 tests     | 5%       |
| **Phase 2** | Meal Tracking    | 15 tests     | 8%       |
| **Phase 3** | Training         | 10 tests     | 11%      |
| **Phase 4** | Coach            | 10 tests     | 15%      |
| **Total**   | **15% Coverage** | **45 tests** | **15%**  |

---

## 🐛 Debugging

### Mode Interactif

```bash
# UI mode (recommandé)
npm run test:e2e:ui

# Debug mode (breakpoints)
npm run test:e2e:debug

# Headed mode (voir navigateur)
npm run test:e2e:headed
```

### Traces

Les traces sont automatiquement générées en cas d'échec :

```bash
# Voir rapport
npm run test:e2e:report
```

### Screenshots & Videos

- **Screenshots** : Automatiques en cas d'échec
- **Videos** : Conservées uniquement en cas d'échec
- **Localisation** : `test-results/`

---

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📚 Ressources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Selectors Guide](https://playwright.dev/docs/selectors)

---

## ✅ Checklist Avant Commit

- [ ] Tous les tests passent localement
- [ ] Tests ajoutés pour nouvelle fonctionnalité
- [ ] Sélecteurs sémantiques utilisés
- [ ] Timeouts appropriés
- [ ] Cleanup dans `beforeEach`/`afterEach`
- [ ] Variables d'environnement documentées
- [ ] Tests exécutés sur mobile et desktop

---

**SuperNovaFit v2.0.0** - Tests E2E Playwright 🎭✅

_Dernière mise à jour : 02.10.2025_
