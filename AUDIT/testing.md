# 🧪 Analyse des Tests - SuperNovaFit

## Résumé critique

La couverture de code est **extrêmement faible à 1.96%**. Seulement **3 fichiers de tests** existent pour une application de production. **Aucun test de composants React**, **aucun test d'intégration**, et **aucun test E2E**. Cette situation représente un **risque majeur** pour la stabilité et la maintenabilité.

## 1. 📊 Métriques actuelles

### Couverture globale
| Métrique | Valeur | Objectif | Écart |
|----------|--------|----------|-------|
| **Statements** | 1.96% | 80% | -78.04% ❌ |
| **Branches** | 70.63% | 80% | -9.37% ⚠️ |
| **Functions** | 73.21% | 80% | -6.79% ⚠️ |
| **Lines** | 1.96% | 80% | -78.04% ❌ |

### Tests existants
- **Total**: 23 tests passent
- **Durée**: 1.51s
- **Fichiers testés**: 3/167 (1.8%)

### Répartition des tests
1. **`calculations.test.ts`**: 8 tests - Calculs BMR/TDEE/MET ✅
2. **`useAuth.test.ts`**: 7 tests - Hook d'authentification ✅
3. **`useFirestore.test.ts`**: 8 tests - Logique métier Firestore ✅

## 2. 🔍 Analyse détaillée

### ✅ Ce qui est testé

#### Calculs métier (`src/lib/__tests__/calculations.test.ts`)
```typescript
- BMR Calculation (hommes/femmes)
- TDEE avec différents niveaux d'activité
- Calcul calories MET
- Distribution macros
- Calcul IMC
```

#### Hook Auth (`src/hooks/__tests__/useAuth.test.ts`)
```typescript
- État utilisateur authentifié
- Gestion erreur connexion
- Déconnexion
- Envoi magic link
```

#### Logique Firestore (`src/hooks/__tests__/useFirestore.test.ts`)
```typescript
- Validation structure repas
- Calcul calories totales
- Validation mesures corporelles
- Formatage dates
- Gestion tableaux vides
```

### ❌ Ce qui n'est PAS testé (critique)

#### Composants React (0% couverture)
- **0/33 composants UI testés**
- Aucun test de rendu
- Aucun test d'interaction utilisateur
- Aucun test d'accessibilité

#### Pages (0% couverture)
- **0/25 pages testées**
- Routes non vérifiées
- Navigation non testée
- États de chargement non testés

#### Hooks critiques non testés
- `useFirestore.ts` (1591 lignes) - Partiellement testé
- `useExportData.ts` - Export de données
- `useInvites.ts` - Système d'invitations
- `usePaginatedData` - Pagination

#### Services non testés
- Firebase Auth/Firestore integration
- API Open Food Facts
- Parser Garmin (TCX/GPX)
- Export PDF/Excel/CSV
- Upload images

## 3. 🐛 Problèmes identifiés

### Tests désactivés

**Lieu**: Documentation mentionne "tests temporairement désactivés"
```
⚠️ Tests hooks Firebase : Temporairement désactivés (problèmes de mémoire)
```

### Fuite mémoire dans les tests

**Lieu**: `docs/context/ai_context_summary.md:137`
```
Le test useFirestore.test.ts cause systématiquement 
"FATAL ERROR: Ineffective mark-compacts near heap limit"
```

### Mocks incomplets

**Lieu**: `src/test/setup.ts`
- Mocks Firebase basiques
- Pas de mocks pour Storage, Analytics
- Pas de mocks pour les APIs externes

### Absence de tests E2E
- Aucun test Cypress/Playwright
- Parcours utilisateur non vérifiés
- Intégrations non testées

## 4. 📈 Plan d'amélioration

### Phase 1: Tests critiques (1 semaine)

#### 1.1 Composants UI prioritaires
```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('supports disabled state', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })
})
```

#### 1.2 Pages principales
```typescript
// src/app/__tests__/page.test.tsx
import { render, screen } from '@testing-library/react'
import HomePage from '../page'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false })
}))

describe('HomePage', () => {
  it('renders landing page for unauthenticated users', () => {
    render(<HomePage />)
    expect(screen.getByText(/Transformez votre physique/)).toBeInTheDocument()
  })
})
```

#### 1.3 Hooks manquants
```typescript
// src/hooks/__tests__/useExportData.test.ts
import { renderHook, act } from '@testing-library/react'
import { useExportData } from '../useExportData'

describe('useExportData', () => {
  it('exports data in CSV format', async () => {
    const { result } = renderHook(() => useExportData())
    
    await act(async () => {
      await result.current.exportData('csv', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      })
    })
    
    expect(result.current.isExporting).toBe(false)
  })
})
```

### Phase 2: Tests d'intégration (2 semaines)

#### 2.1 Firebase Integration
```typescript
// src/__tests__/integration/firebase.test.ts
import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'

describe('Firebase Integration', () => {
  it('creates and retrieves user data', async () => {
    // Test real Firebase operations
  })
})
```

#### 2.2 API Integration
```typescript
// src/__tests__/integration/openfoodfacts.test.ts
describe('OpenFoodFacts API', () => {
  it('searches for products', async () => {
    const results = await searchProducts('pomme')
    expect(results).toHaveLength(greaterThan(0))
  })
})
```

### Phase 3: Tests E2E (3 semaines)

#### 3.1 Setup Cypress
```bash
npm install --save-dev cypress @testing-library/cypress
```

#### 3.2 Parcours utilisateur critiques
```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
  it('user can sign up, login and logout', () => {
    cy.visit('/')
    cy.contains('Commencer').click()
    // ... test complet du parcours
  })
})
```

## 5. 🛠️ Configuration recommandée

### Vitest config améliorée
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/*'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
```

### Scripts NPM additionnels
```json
{
  "scripts": {
    "test:unit": "vitest run src/**/*.test.ts",
    "test:integration": "vitest run src/**/*.integration.test.ts",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

## 6. 📊 Objectifs de couverture

### Court terme (1 mois)
| Type | Actuel | Objectif | Priorité |
|------|--------|----------|----------|
| Hooks critiques | 20% | 80% | 🔴 Haute |
| Composants UI | 0% | 60% | 🔴 Haute |
| Pages principales | 0% | 50% | 🟠 Moyenne |
| Utils/Lib | 16% | 80% | 🟠 Moyenne |

### Moyen terme (3 mois)
| Type | Objectif | Description |
|------|----------|-------------|
| Unit tests | 80% | Tous les composants et hooks |
| Integration | 70% | Firebase, APIs externes |
| E2E | 100% | Parcours utilisateur critiques |
| Performance | - | Tests de charge (k6/Artillery) |

## 7. 🎯 Quick wins

### Tests à ajouter immédiatement

1. **Test du composant Button** (30 min)
   ```typescript
   // Impact: Composant le plus utilisé
   // Effort: Faible
   ```

2. **Test page Auth** (1h)
   ```typescript
   // Impact: Critique pour l'accès
   // Effort: Moyen
   ```

3. **Test useFirebaseError** (45 min)
   ```typescript
   // Impact: Gestion d'erreurs globale
   // Effort: Faible
   ```

4. **Test FoodSearch** (2h)
   ```typescript
   // Impact: Fonctionnalité clé
   // Effort: Moyen
   ```

5. **Test ExportButton** (1h)
   ```typescript
   // Impact: Export de données
   // Effort: Moyen
   ```

## 8. ⚠️ Risques actuels

### Sans tests adéquats
1. **Régressions non détectées** lors des mises à jour
2. **Bugs en production** non anticipés
3. **Refactoring dangereux** sans filet de sécurité
4. **Documentation vivante** manquante
5. **Onboarding difficile** pour nouveaux développeurs

### Recommandation critique
**⚠️ NE PAS déployer de nouvelles features sans tests**

## Conclusion

La situation des tests est **critique** avec moins de 2% de couverture. Un effort immédiat et soutenu est nécessaire pour atteindre un niveau acceptable de 80%. Prioriser les tests des composants UI et des hooks critiques, puis progresser vers les tests d'intégration et E2E.