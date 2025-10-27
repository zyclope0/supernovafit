# 🎓 Plan 25% Coverage - Approche Académique & Best Practices

**Date**: 26 Octobre 2025  
**Objectif**: Atteindre 25% coverage avec qualité académique  
**Méthodologie**: Test-Driven, AAA Pattern, Quality First  
**Durée Estimée**: 8-10h

---

## 📊 État Initial

```yaml
Coverage Actuel: 13-14%
Tests Actuels: 324/324 (100% passing)
Architecture: Hybride Jest + Vitest (stable)

Modules Déjà Testés (100%): ✅ validation/challenges.ts
  ✅ challengeTracking/* (7 fichiers)
  ✅ hooks simples (8 fichiers Jest)
  ✅ composants UI simples (3 fichiers Jest)
```

---

## 🎯 Stratégie Académique

### Principes Fondamentaux

1. **AAA Pattern** : Arrange → Act → Assert
2. **Test Isolation** : Chaque test indépendant
3. **Coverage Ciblé** : Tester logique critique (pas getter/setter basiques)
4. **Mocks Minimalistes** : Mocker uniquement dépendances externes
5. **Best Practices Jest/Vitest** : describe, it, beforeEach, afterEach

### Méthodologie

```typescript
// Pattern Standard (Académique)
describe('ModuleName', () => {
  // Arrange: Setup commun
  beforeEach(() => {
    // Reset mocks, état initial
  });

  describe('functionName', () => {
    it('should handle normal case', () => {
      // Arrange: Données test
      const input = { ...};

      // Act: Exécution
      const result = functionName(input);

      // Assert: Vérification
      expect(result).toBe(expected);
    });

    it('should handle edge case', () => {
      // ...
    });

    it('should throw error on invalid input', () => {
      expect(() => functionName(null)).toThrow();
    });
  });

  // Cleanup
  afterEach(() => {
    jest.clearAllMocks();
  });
});
```

---

## 📋 Phase 1: Hooks Critiques (3-4h) → +4-5%

### 1.1 useEnergyBalance (PRIORITÉ 1)

**Fichier**: `src/__tests__/hooks/useEnergyBalance.advanced.jest.test.ts`

**Tests à Créer** (~15 tests):

```typescript
describe("useEnergyBalance - Tests Avancés", () => {
  describe("calculateBMR", () => {
    it("should calculate BMR for male with Mifflin-St Jeor formula");
    it("should calculate BMR for female");
    it("should handle edge cases (underweight, overweight)");
    it("should throw error on invalid inputs");
  });

  describe("calculateTDEE", () => {
    it("should calculate TDEE with activity level");
    it("should handle sedentary lifestyle");
    it("should handle very active lifestyle");
  });

  describe("calculateEnergyBalance", () => {
    it("should calculate positive balance (surplus)");
    it("should calculate negative balance (deficit)");
    it("should calculate maintenance balance");
    it("should integrate training calories");
  });

  describe("integration", () => {
    it("should provide consistent calculations across scenarios");
    it("should handle real user data");
  });
});
```

**Impact**: +1-2% coverage (hook critique utilisé partout)

### 1.2 useExportData (PRIORITÉ 2)

**Fichier**: `src/__tests__/hooks/useExportData.advanced.jest.test.ts`

**Tests à Créer** (~12 tests):

```typescript
describe("useExportData - Tests Complets", () => {
  describe("exportToCSV", () => {
    it("should export meals data to CSV format");
    it("should export trainings data to CSV format");
    it("should handle empty data");
    it("should include proper headers");
    it("should format dates correctly");
  });

  describe("exportToPDF", () => {
    it("should generate PDF with proper formatting");
    it("should include all user data sections");
    it("should handle large datasets");
  });

  describe("error handling", () => {
    it("should handle export failures gracefully");
    it("should provide user-friendly error messages");
  });
});
```

**Impact**: +1% coverage (logique métier importante)

### 1.3 useChallengeTracker (PRIORITÉ 3)

**Fichier**: `src/__tests__/hooks/useChallengeTracker.jest.test.ts`

**Tests à Créer** (~20 tests):

```typescript
describe("useChallengeTracker", () => {
  describe("trackProgress", () => {
    it("should track meal completion");
    it("should track training completion");
    it("should track journal completion");
    it("should track measurement completion");
  });

  describe("calculateXP", () => {
    it("should award XP for completed challenges");
    it("should handle different difficulty levels");
    it("should apply bonus multipliers");
  });

  describe("unlockBadges", () => {
    it("should unlock badges at milestones");
    it("should not duplicate badges");
  });

  describe("streaks", () => {
    it("should calculate consecutive days");
    it("should reset on missed days");
  });

  describe("real-time updates", () => {
    it("should sync with Firestore onSnapshot");
    it("should handle disconnections");
  });
});
```

**Impact**: +2% coverage (système gamification critique)

---

## 📋 Phase 2: Pages Principales (3-4h) → +4-5%

### 2.1 app/page.tsx (PRIORITÉ 1)

**Fichier**: `src/__tests__/app/page.jest.test.tsx`

**Tests à Créer** (~15 tests):

```typescript
describe("Dashboard Page", () => {
  describe("LandingPage (unauthenticated)", () => {
    it("should render hero section");
    it("should display features grid");
    it("should render CTA buttons");
    it("should link to /auth correctly");
  });

  describe("Dashboard (authenticated sportif)", () => {
    it("should render MobileDashboard on mobile");
    it("should render DesktopDashboard on desktop");
    it("should show invite code input if no coach");
    it("should show coach connection if has coach");
    it("should display loading spinner while loading");
  });

  describe("Dashboard (authenticated coach)", () => {
    it("should redirect coach to /coach dashboard");
  });

  describe("integration", () => {
    it("should handle user transitions (login/logout)");
    it("should preserve state on navigation");
  });
});
```

**Impact**: +1-2% coverage (page la plus visitée)

### 2.2 app/auth/page.tsx

**Fichier**: `src/__tests__/app/auth/page.jest.test.tsx`

**Tests à Créer** (~12 tests):

```typescript
describe("Auth Page", () => {
  describe("Login Flow", () => {
    it("should render login form");
    it("should validate email format");
    it("should validate password");
    it("should call Firebase auth on submit");
    it("should display error messages");
    it("should redirect on successful login");
  });

  describe("Register Flow", () => {
    it("should render register form");
    it("should validate required fields");
    it("should create Firebase account");
    it("should initialize user profile");
  });

  describe("password reset", () => {
    it("should send reset email");
    it("should display success message");
  });
});
```

**Impact**: +1-2% coverage (point d'entrée critique)

### 2.3 app/diete/page.tsx

**Fichier**: `src/__tests__/app/diete/page.jest.test.tsx`

**Tests à Créer** (~10 tests):

```typescript
describe("Diete Page", () => {
  describe("meals display", () => {
    it("should render meals list");
    it("should group meals by date");
    it("should display macros summary");
    it("should calculate daily totals");
  });

  describe("interactions", () => {
    it("should open add meal modal");
    it("should edit existing meal");
    it("should delete meal with confirmation");
  });

  describe("filtering", () => {
    it("should filter by date range");
    it("should filter by meal type");
  });
});
```

**Impact**: +1% coverage (module nutrition critique)

---

## 📋 Phase 3: Composants UI Critiques (2-3h) → +2-3%

### 3.1 MobileDashboard.tsx

**Fichier**: `src/__tests__/components/mobile/MobileDashboard.jest.test.tsx`

**Tests à Créer** (~15 tests):

```typescript
describe("MobileDashboard", () => {
  describe("widgets rendering", () => {
    it("should render calories widget");
    it("should render protein widget");
    it("should render trainings widget");
    it("should render weight widget");
  });

  describe("period selector", () => {
    it("should switch to today view");
    it("should switch to week view");
    it("should switch to month view");
    it("should recalculate stats on period change");
  });

  describe("quick actions", () => {
    it("should open quick meal modal");
    it("should open quick training modal");
    it("should open quick journal modal");
  });

  describe("responsiveness", () => {
    it("should display correctly on mobile (<640px)");
    it("should adapt layout on tablet (640-1024px)");
  });
});
```

**Impact**: +1-2% coverage (dashboard mobile critique)

### 3.2 MealCard.tsx / TrainingCard.tsx

**Fichier**: `src/__tests__/components/diete/MealCard.jest.test.tsx`

**Tests à Créer** (~10 tests):

```typescript
describe("MealCard", () => {
  describe("rendering", () => {
    it("should display meal name");
    it("should display macros (kcal, prot, glucides, lipides)");
    it("should display meal time");
    it("should show aliments list");
  });

  describe("interactions", () => {
    it("should expand/collapse on click");
    it("should call onEdit callback");
    it("should call onDelete callback with confirmation");
  });

  describe("accessibility", () => {
    it("should have proper ARIA labels");
    it("should be keyboard navigable");
  });
});
```

**Impact**: +1% coverage (composants UI critiques)

---

## 📋 Phase 4: Validation & Documentation (1h)

### 4.1 Vérification Coverage

```bash
# Exécuter tous les tests
npm run test:jest
npm run test:vitest:lib

# Générer coverage Jest
npm run test:jest:coverage

# Vérifier coverage global
# Objectif: 25%+ (actuellement 13-14%)
```

### 4.2 Analyse Qualité

```typescript
// Métriques à valider
✅ Tests passants: 100%
✅ Branches coverage: >60%
✅ Functions coverage: >50%
✅ Lines coverage: >25%
✅ 0 warnings ESLint
✅ 0 erreurs TypeScript
```

### 4.3 Documentation

- Mettre à jour `TESTS_COMPLETE.md`
- Mettre à jour `AI_CODING_CONTEXT_EXHAUSTIVE.md`
- Mettre à jour `ai_context_summary.md`
- Créer rapport final `COVERAGE_25_ACHIEVED.md`

---

## ✅ Checklist Exécution

### Avant de Commencer

- [x] Plan académique créé
- [ ] Jest/Vitest configurés
- [ ] Mocks Firebase disponibles
- [ ] Documentation lue

### Phase 1: Hooks

- [ ] useEnergyBalance.advanced.jest.test.ts (15 tests)
- [ ] useExportData.advanced.jest.test.ts (12 tests)
- [ ] useChallengeTracker.jest.test.ts (20 tests)
- [ ] Tests passent (47/47)
- [ ] Coverage validé (+4-5%)

### Phase 2: Pages

- [ ] app/page.jest.test.tsx (15 tests)
- [ ] app/auth/page.jest.test.tsx (12 tests)
- [ ] app/diete/page.jest.test.tsx (10 tests)
- [ ] Tests passent (37/37)
- [ ] Coverage validé (+4-5%)

### Phase 3: Composants

- [ ] MobileDashboard.jest.test.tsx (15 tests)
- [ ] MealCard.jest.test.tsx (10 tests)
- [ ] Tests passent (25/25)
- [ ] Coverage validé (+2-3%)

### Phase 4: Validation

- [ ] Coverage ≥ 25% validé
- [ ] Documentation mise à jour
- [ ] Commit avec message conventionnel

---

## 🎓 Best Practices Appliquées

### 1. AAA Pattern (Arrange-Act-Assert)

```typescript
it("should calculate BMR correctly", () => {
  // Arrange: Préparer données
  const user = { poids: 70, taille: 175, age: 30, genre: "homme" };

  // Act: Exécuter fonction
  const bmr = calculateBMR(user);

  // Assert: Vérifier résultat
  expect(bmr).toBeCloseTo(1675, 0);
});
```

### 2. Test Isolation

```typescript
describe("MyModule", () => {
  beforeEach(() => {
    // Reset état pour chaque test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup si nécessaire
  });
});
```

### 3. Mocks Minimalistes

```typescript
// ❌ Over-mocking (mauvais)
jest.mock("@/lib/calculations", () => ({
  ...jest.requireActual("@/lib/calculations"),
  calculateBMR: jest.fn(),
  calculateTDEE: jest.fn(),
  // Mock inutile de tout
}));

// ✅ Minimal mocking (bon)
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  // Mock uniquement dépendances externes
}));
```

### 4. Assertions Précises

```typescript
// ❌ Vague
expect(result).toBeTruthy();

// ✅ Précis
expect(result).toBe(2000);
expect(result.calories).toBeCloseTo(2000, 0);
expect(result.status).toBe("success");
```

### 5. Tests Descriptifs

```typescript
// ❌ Nom vague
it("should work");

// ✅ Nom descriptif
it("should calculate TDEE with sedentary activity level (1.2x BMR)");
```

---

## 📊 Impact Estimé

```yaml
Phase 1 (Hooks): 47 tests → +4-5% coverage
Phase 2 (Pages): 37 tests → +4-5% coverage
Phase 3 (Composants): 25 tests → +2-3% coverage

Total: 109 nouveaux tests
Coverage: 13-14% → 25-27%
Durée: 8-10h développeur
Qualité: Académique + Best Practices
```

---

## 🏆 Résultat Attendu

```yaml
Coverage Global: 25-27% ✅
Tests Total: 433 tests (324 + 109)
Architecture: Hybride stable
Qualité: Académique
Best Practices: 100%
Maintenance: Optimale
```

---

**Auteur**: Assistant IA  
**Date**: 26 Octobre 2025  
**Type**: Plan Exécution Académique  
**Status**: PRÊT À EXÉCUTER
