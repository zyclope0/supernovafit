# 🧪 AUDIT TESTS & COUVERTURE - SuperNovaFit

**Date d'audit** : 14 Janvier 2025  
**Version analysée** : 1.9.4  
**Framework de test** : Vitest 3.2.4  
**Couverture actuelle** : 2.16%

---

## 📊 Résumé Exécutif

### ⚠️ État Critique
- **Couverture globale** : 2.16% (objectif : 80%)
- **Tests existants** : 23 tests dans 3 fichiers
- **Modules testés** : Calculs métier uniquement
- **UI testée** : 0% (aucun test de composants)

### Points Positifs
- ✅ Framework Vitest configuré correctement
- ✅ Tests unitaires des calculs fonctionnels
- ✅ Configuration coverage complète
- ✅ 100% de succès sur les tests existants

---

## 🔍 Analyse Détaillée

### Tests Existants (23 tests)

#### 1. Tests de Calculs (8 tests) ✅
- **Fichier** : `src/lib/__tests__/calculations.test.ts`
- **Couverture** : 100% des fonctions testées
- **Tests** :
  - BMR (Basal Metabolic Rate) - hommes/femmes
  - TDEE (Total Daily Energy Expenditure)
  - MET (Metabolic Equivalent of Task)
  - IMC (Indice de Masse Corporelle)

#### 2. Tests useAuth (7 tests) ✅
- **Fichier** : `src/hooks/__tests__/useAuth.test.ts`
- **Couverture** : 73.46% du hook
- **Tests** :
  - État initial non connecté
  - Login avec succès
  - Gestion d'erreurs
  - Logout
  - Création de compte

#### 3. Tests useFirestore (8 tests) ✅
- **Fichier** : `src/hooks/__tests__/useFirestore.test.ts`
- **Couverture** : 0% (mocks complets)
- **Note** : Tests temporairement désactivés (problèmes mémoire)

### Modules Non Testés (97.84%)

#### Composants UI (0% coverage)
- 30 composants dans `src/components/ui/`
- 5 composants layout
- 3 composants charts
- **Impact** : Risque de régression UI élevé

#### Pages (0% coverage)
- 23 pages Next.js
- Logique métier dans les pages
- **Impact** : Bugs non détectés en production

#### Hooks Custom (5.61% coverage)
- `useExportData` : 0%
- `useInvites` : 0%
- `useFocusTrap` : 0%
- **Impact** : Logique critique non testée

#### Services & Utils (18.74% coverage)
- Firebase services : 90.9%
- Garmin parser : 0%
- Open Food Facts : 0%
- Export functions : 0%

---

## 📈 Métriques de Couverture

| Module | Statements | Branches | Functions | Lines |
|--------|------------|----------|-----------|-------|
| **Global** | 2.16% | 76.06% | 79.61% | 2.16% |
| Hooks | 5.61% | 63.63% | 81.81% | 5.61% |
| Lib | 18.74% | 40% | 35.29% | 18.74% |
| Components | 0% | 96.66% | 96.66% | 0% |
| Pages | 0% | 100% | 100% | 0% |

> **Note** : Les % élevés de branches/functions avec 0% lines indiquent des fichiers non testés

---

## 🚨 Problèmes Identifiés

### Issue #1 : Couverture Critique (2.16%)
- **Sévérité** : Bloquante
- **Impact** : Régressions non détectées, bugs en production
- **Effort** : L (2-3 semaines)

### Issue #2 : Aucun Test UI
- **Sévérité** : Majeure
- **Impact** : Composants cassés non détectés
- **Effort** : L (1-2 semaines)

### Issue #3 : Tests Firebase Désactivés
- **Sévérité** : Majeure
- **Impact** : Logique Firestore non testée
- **Problème** : Fuites mémoire avec mocks
- **Effort** : M (3-5 jours)

### Issue #4 : Hooks Critiques Non Testés
- **Sévérité** : Majeure
- **Hooks** : useExportData, useInvites
- **Effort** : M (2-3 jours)

### Issue #5 : Services Externes Non Testés
- **Sévérité** : Modérée
- **Services** : Garmin, OpenFoodFacts
- **Effort** : M (3-5 jours)

---

## 🎯 Plan d'Amélioration des Tests

### Phase 1 : Tests Critiques (30% coverage) - 1 semaine

#### Hooks Prioritaires
```typescript
// useExportData.test.ts
describe('useExportData', () => {
  it('should generate CSV correctly', async () => {
    const { result } = renderHook(() => useExportData())
    const csv = await result.current.generateCSV(mockData)
    expect(csv).toMatchSnapshot()
  })
})
```

#### Composants Critiques
```typescript
// AuthGuard.test.tsx
describe('AuthGuard', () => {
  it('should redirect when not authenticated', () => {
    render(<AuthGuard><div>Protected</div></AuthGuard>)
    expect(mockRouter.push).toHaveBeenCalledWith('/auth')
  })
})
```

### Phase 2 : Tests UI (50% coverage) - 2 semaines

#### Composants Forms
- MealForm.tsx
- TrainingForm.tsx
- ProfileForm.tsx
- JournalForm.tsx

#### Composants Display
- MacrosChart.tsx
- TrainingCard.tsx
- MesuresCharts.tsx

### Phase 3 : Tests Integration (70% coverage) - 2 semaines

#### Flows Complets
- Authentification complète
- Ajout de repas avec calculs
- Import Garmin
- Export de données

### Phase 4 : Tests E2E (80%+ coverage) - 1 semaine

#### Playwright/Cypress
- Parcours utilisateur complet
- Tests cross-browser
- Tests mobile

---

## 🔧 Configuration Recommandée

### Vitest Améliorations
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/types/**',
      ],
      all: true, // Inclure fichiers non testés
    },
    pool: 'forks', // Éviter fuites mémoire
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
})
```

### Scripts NPM Additionnels
```json
{
  "scripts": {
    "test:unit": "vitest run src/lib src/hooks",
    "test:components": "vitest run src/components",
    "test:integration": "vitest run src/app",
    "test:watch:coverage": "vitest --coverage --ui"
  }
}
```

---

## 📋 Exemples de Tests Manquants

### Test Composant UI
```typescript
// FoodSearch.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { FoodSearch } from '@/components/ui/FoodSearch'

describe('FoodSearch', () => {
  it('should search and display results', async () => {
    render(<FoodSearch onSelect={jest.fn()} />)
    
    const input = screen.getByPlaceholderText('Rechercher un aliment')
    fireEvent.change(input, { target: { value: 'pomme' } })
    
    await waitFor(() => {
      expect(screen.getByText('Pomme')).toBeInTheDocument()
    })
  })
})
```

### Test Hook Firebase
```typescript
// useFirestore.test.ts (amélioré)
describe('useFirestore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add document successfully', async () => {
    const { result } = renderHook(() => useFirestore())
    
    await act(async () => {
      await result.current.addRepas(mockRepas)
    })
    
    expect(addDoc).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining(mockRepas)
    )
  })
})
```

---

## ✅ Checklist d'Amélioration

### Immédiat (Quick Wins)
- [ ] Fixer tests useFirestore (mémoire)
- [ ] Ajouter tests useExportData
- [ ] Tester AuthGuard
- [ ] Coverage badge dans README

### Court Terme (30 jours)
- [ ] Tests composants forms
- [ ] Tests services externes
- [ ] CI/CD avec seuil coverage
- [ ] Tests snapshot UI

### Moyen Terme (60 jours)
- [ ] Tests E2E Playwright
- [ ] Tests performance
- [ ] Tests accessibilité
- [ ] Monitoring coverage

---

## 🎯 Objectifs de Couverture

| Délai | Coverage | Focus |
|-------|----------|-------|
| 1 semaine | 30% | Hooks & Utils |
| 1 mois | 50% | + Composants UI |
| 2 mois | 70% | + Integration |
| 3 mois | 80%+ | + E2E |

---

*Audit tests effectué le 14/01/2025 - Coverage critique nécessitant action immédiate*