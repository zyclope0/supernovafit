# 🧪 Tests Unitaires - SuperNovaFit v2.0.0

**Framework :** Vitest + React Testing Library  
**Status :** ✅ 308/308 Tests Passent (100%)  
**Coverage :** 4.49% global, 79.9% modules critiques

---

## 📊 VUE D'ENSEMBLE

### Statistiques

| Métrique             | Valeur                       |
| -------------------- | ---------------------------- |
| **Fichiers de test** | 25                           |
| **Tests définis**    | 321                          |
| **Tests passants**   | 308 (96.0%)                  |
| **Tests skippés**    | 13 (Badges - non implémenté) |
| **Durée**            | 20.47s                       |

### Par Catégorie

| Catégorie         | Tests | Coverage | Qualité    |
| ----------------- | ----- | -------- | ---------- |
| **Lib Utils**     | 155   | 21.79%   | ⭐⭐⭐⭐⭐ |
| **Security**      | 64    | 58.06%   | ⭐⭐⭐⭐⭐ |
| **Components UI** | 56    | 5.14%    | ⭐⭐⭐⭐   |
| **Hooks**         | 46    | 8.32%    | ⭐⭐⭐⭐   |

---

## 📁 STRUCTURE DES TESTS

```
src/
├── __tests__/              # Tests principaux
│   ├── accessibility.test.tsx
│   ├── components/
│   │   ├── auth/AuthGuard.test.tsx
│   │   └── ui/
│   │       ├── CollapsibleCard.test.tsx
│   │       ├── FormField.test.tsx
│   │       ├── PageHeader.test.tsx
│   │       └── Skeletons.test.tsx
│   ├── hooks/
│   │   ├── useAuth-extended.test.ts
│   │   └── useFocusTrap.test.ts
│   ├── lib/
│   │   ├── badges.test.ts (13 skipped)
│   │   ├── dateUtils.test.ts
│   │   └── validation.test.ts
│   └── security/
│       ├── firestore-rules.test.ts
│       ├── rate-limiting.test.ts
│       └── lib/security/RateLimiter.test.ts
├── hooks/__tests__/        # Tests hooks métier
│   ├── useAuth.test.ts
│   ├── useEnergyBalance.test.ts
│   └── useFirestore.test.ts
└── lib/__tests__/          # Tests librairies
    ├── calculations.test.ts
    ├── constants.test.ts
    ├── firebase-errors.test.ts
    ├── inviteUtils.test.ts
    ├── tdee-adjustment.test.ts
    ├── userCalculations.test.ts
    ├── utils.test.ts
    └── validation.test.ts
```

---

## 🎯 TOP 10 MODULES LES MIEUX TESTÉS

| #   | Module                  | Coverage | Tests | Lines |
| --- | ----------------------- | -------- | ----- | ----- |
| 1   | **utils.ts**            | 100%     | 17    | 300   |
| 2   | **constants.ts**        | 100%     | 6     | 50    |
| 3   | **AuthGuard.tsx**       | 100%     | 10    | 100   |
| 4   | **CollapsibleCard.tsx** | 100%     | 6     | 80    |
| 5   | **PageHeader.tsx**      | 100%     | 6     | 90    |
| 6   | **useEnergyBalance.ts** | 100%     | 4     | 120   |
| 7   | **dateUtils.ts**        | 94.54%   | 16    | 104   |
| 8   | **validation.ts**       | 92.47%   | 64    | 424   |
| 9   | **userCalculations.ts** | 92%      | 19    | 200   |
| 10  | **StandardModal.tsx**   | 88.34%   | 0\*   | 120   |

\*Testé indirectement

---

## 🚀 CRÉER UN TEST

### Template Basique

```typescript
// src/__tests__/components/ui/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from '@/components/ui/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle click', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Template Hook

```typescript
// src/hooks/__tests__/useMyHook.test.ts
import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useMyHook } from "@/hooks/useMyHook";

describe("useMyHook", () => {
  it("should return initial value", () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(null);
  });

  it("should update value", () => {
    const { result } = renderHook(() => useMyHook());
    act(() => {
      result.current.setValue("new");
    });
    expect(result.current.value).toBe("new");
  });
});
```

### Template Fonction

```typescript
// src/lib/__tests__/myFunction.test.ts
import { describe, it, expect } from "vitest";
import { myFunction } from "@/lib/myModule";

describe("myFunction", () => {
  it("should calculate correctly", () => {
    const result = myFunction(10, 20);
    expect(result).toBe(30);
  });

  it("should handle edge cases", () => {
    expect(myFunction(0, 0)).toBe(0);
    expect(myFunction(-5, 5)).toBe(0);
  });
});
```

---

## 🔧 CONFIGURATION

### Vitest (vitest.config.ts)

```typescript
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    exclude: ["node_modules/**", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        statements: 30,
        branches: 25,
        functions: 30,
        lines: 30,
      },
    },
  },
});
```

### Setup Global (src/test/setup.ts)

Mocks configurés :

- Firebase (auth, firestore, storage)
- Next.js (router, navigation, image)
- React Hot Toast
- Recharts
- Fetch API

---

## 📚 CONVENTIONS

### Naming

```typescript
// Fichiers
MyComponent.tsx          → MyComponent.test.tsx
useMyHook.ts            → useMyHook.test.ts
myFunction.ts           → myFunction.test.ts

// Tests
describe('MyComponent', () => {
  it('should render correctly', () => { ... });
  it('should handle user interaction', () => { ... });
});
```

### Organisation

```typescript
describe('Module Name', () => {
  describe('Function Name', () => {
    it('should handle normal case', () => { ... });
    it('should handle edge case', () => { ... });
    it('should handle error case', () => { ... });
  });
});
```

### Assertions

```typescript
// Préférer expect() explicite
expect(result).toBe(expected);
expect(result).toEqual(expected);
expect(result).toBeCloseTo(3.14, 2);

// Éviter les assertions vagues
expect(result).toBeTruthy(); // ❌ Vague
expect(result).toBe(true); // ✅ Explicite
```

---

## 🎯 PRIORITÉS TESTING

### P0 - Critique

- ✅ Validation (92.47% coverage) - **FAIT**
- ✅ DateUtils (94.54% coverage) - **FAIT**
- ✅ Auth (77-100% coverage) - **FAIT**
- ✅ Security (58% coverage) - **FAIT**

### P1 - Important

- ⏸️ useFirestore (0% coverage) - Hook critique
- ⏸️ HealthIndicator (42% coverage)
- ⏸️ SmartNotifications (11% coverage)

### P2 - Moyen Terme

- challenges.ts (0%)
- openfoodfacts.ts (0%)
- Composants forms (0-5%)

---

## 📊 COMMANDES

```bash
# Exécution
npm test                      # Mode watch
npm run test:coverage         # Avec coverage HTML
npm test -- --run             # Une fois (CI)
npm test -- <pattern>         # Tests spécifiques

# Debug
npm run test:ui               # Interface graphique
npm test -- --reporter=verbose # Verbose
npm test -- --bail            # Stop au premier échec

# Coverage
npm run test:coverage         # Générer rapport
open coverage/index.html      # Voir rapport (macOS/Linux)
start coverage/index.html     # Voir rapport (Windows)
```

---

## 🏆 MODULES 100% COVERAGE

1. **utils.ts** (17 tests) - Utilitaires généraux
2. **constants.ts** (6 tests) - Constantes app
3. **AuthGuard.tsx** (10 tests) - Protection routes
4. **CollapsibleCard.tsx** (6 tests) - Composant UI
5. **PageHeader.tsx** (6 tests) - Composant UI
6. **useEnergyBalance.ts** (4 tests) - Hook calcul

**Total : 6 modules à 100%**

---

## 📋 CHECKLIST QUALITÉ

### Avant de Committer

- [ ] Tous les tests passent (`npm test`)
- [ ] Coverage ne baisse pas
- [ ] Pas de `console.log` dans tests
- [ ] Pas de `it.only` ou `describe.only`
- [ ] Mocks appropriés (Firebase, Next.js)
- [ ] TypeScript strict (pas de `any`)

### Bonnes Pratiques

- ✅ Tester comportement, pas implémentation
- ✅ Un test = une assertion principale
- ✅ Nom de test descriptif (should...)
- ✅ Arrange-Act-Assert pattern
- ✅ Cleanup automatique (afterEach)
- ✅ Isolation des tests (pas de dépendances)

---

**SuperNovaFit v2.0.0** - Tests Unitaires Vitest 🧪
