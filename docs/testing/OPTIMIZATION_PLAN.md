# 🚀 PLAN D'OPTIMISATION TESTS - SuperNovaFit

**Date**: 23 Octobre 2025  
**Objectif**: Atteindre 25% coverage avec 866 tests existants  
**Status**: ⚠️ Limitation technique (fuite mémoire Vitest)

## 📊 **ANALYSE ACTUELLE**

### **Métriques Réelles**

```yaml
Tests Totaux: 866 tests (100% passing)
Fichiers: 52 fichiers de tests
Coverage: ~12-15% (objectif 25%)
Problème: Fuite mémoire Vitest bloque tests complexes
```

### **Modules Critiques Non Testés (PRIORITÉ 1)**

```yaml
1. challengeImplementation.ts (0% coverage)
   - 50 challenges définis
   - Logique de classification
   - Impact: +3-5% coverage

2. challengeNotifications.ts (0% coverage)
   - Notifications push FCM
   - Templates de notifications
   - Impact: +2-3% coverage

3. useChallengeTracker.ts (0% coverage)
   - Hook principal challenges
   - Logique de tracking automatique
   - Impact: +4-6% coverage

4. notificationTemplates.ts (0% coverage)
   - Templates de messages
   - Formatage des notifications
   - Impact: +1-2% coverage
```

### **Modules Partiellement Testés (PRIORITÉ 2)**

```yaml
1. hooks/useFirestore.ts (0% coverage)
   - 60 tests skippés (fuite mémoire)
   - Hooks critiques pour l'app
   - Impact: +5-8% coverage

2. components/ui/ (15-20% coverage)
   - Composants UI standardisés
   - Tests existants mais incomplets
   - Impact: +3-5% coverage

3. lib/challenges.ts (0% coverage)
   - Définitions des challenges
   - Logique métier
   - Impact: +2-3% coverage
```

---

## 🎯 **STRATÉGIE D'OPTIMISATION**

### **Phase 1: Tests Modules Critiques (4-6h)**

#### **1.1 Tests challengeImplementation.ts (1.5h)**

```typescript
// Tests à créer
describe("challengeImplementation", () => {
  describe("IMPLEMENTED_CHALLENGES", () => {
    it("should contain all implemented challenges", () => {});
    it("should have valid challenge names", () => {});
  });

  describe("UNIMPLEMENTABLE_CHALLENGES", () => {
    it("should have valid reasons for unimplementable", () => {});
    it("should categorize challenges correctly", () => {});
  });

  describe("getChallengeStatus", () => {
    it("should return correct status for implemented", () => {});
    it("should return correct status for unimplementable", () => {});
  });
});
```

#### **1.2 Tests challengeNotifications.ts (2h)**

```typescript
// Tests à créer
describe("challengeNotifications", () => {
  describe("sendChallengeCompletedNotification", () => {
    it("should send notification when permission granted", () => {});
    it("should handle permission denied", () => {});
    it("should handle browser not supported", () => {});
  });

  describe("sendChallengeProgressNotification", () => {
    it("should send progress notification", () => {});
    it("should format progress correctly", () => {});
  });

  describe("sendChallengeAlmostDoneNotification", () => {
    it("should send almost done notification", () => {});
    it("should calculate progress correctly", () => {});
  });
});
```

#### **1.3 Tests notificationTemplates.ts (1h)**

```typescript
// Tests à créer
describe("notificationTemplates", () => {
  describe("getChallengeCompletedNotification", () => {
    it("should return correct template for completed challenge", () => {});
    it("should include XP reward in template", () => {});
  });

  describe("getChallengeProgressNotification", () => {
    it("should return progress template", () => {});
    it("should format progress percentage", () => {});
  });
});
```

#### **1.4 Tests useChallengeTracker.ts (1.5h)**

```typescript
// Tests à créer
describe("useChallengeTracker", () => {
  describe("hook initialization", () => {
    it("should initialize with correct state", () => {});
    it("should handle user authentication", () => {});
  });

  describe("challenge tracking", () => {
    it("should track nutrition challenges", () => {});
    it("should track training challenges", () => {});
    it("should track journal challenges", () => {});
  });

  describe("notifications", () => {
    it("should send completion notifications", () => {});
    it("should send progress notifications", () => {});
  });
});
```

### **Phase 2: Tests Hooks Firestore (4-6h)**

#### **2.1 Migration Jest (RECOMMANDÉE)**

```bash
# Installation Jest
npm install jest @testing-library/jest-dom @testing-library/react-hooks

# Configuration jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/jest-setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
  ],
};
```

#### **2.2 Tests Hooks avec Jest**

```typescript
// Tests à réactiver
describe("useFirestore hooks", () => {
  describe("useRepas", () => {
    it("should fetch repas data", () => {});
    it("should handle real-time updates", () => {});
    it("should create new repas", () => {});
  });

  describe("useEntrainements", () => {
    it("should fetch entrainements data", () => {});
    it("should handle real-time updates", () => {});
    it("should create new entrainement", () => {});
  });

  // ... autres hooks
});
```

### **Phase 3: Tests Composants UI (2-3h)**

#### **3.1 Tests Composants Manquants**

```typescript
// Composants à tester
describe("UI Components", () => {
  describe("StandardModal", () => {
    it("should render modal correctly", () => {});
    it("should handle close events", () => {});
  });

  describe("ClickableCard", () => {
    it("should render card with actions", () => {});
    it("should handle click events", () => {});
  });

  describe("HealthIndicator", () => {
    it("should display health zones", () => {});
    it("should show correct colors", () => {});
  });
});
```

---

## 📈 **ROADMAP COVERAGE**

### **Étape 1: Modules Critiques (4-6h)**

```yaml
challengeImplementation.ts: 0% → 80% (+3-5%)
challengeNotifications.ts: 0% → 70% (+2-3%)
useChallengeTracker.ts: 0% → 60% (+4-6%)
notificationTemplates.ts: 0% → 80% (+1-2%)

Total: +10-16% coverage
Résultat: 12% → 22-28%
```

### **Étape 2: Hooks Firestore (4-6h)**

```yaml
useFirestore.ts: 0% → 70% (+5-8%)
useRepas.ts: 0% → 80% (+1-2%)
useEntrainements.ts: 0% → 80% (+1-2%)
useMesures.ts: 0% → 80% (+1-2%)
useJournal.ts: 0% → 80% (+1-2%)

Total: +9-16% coverage
Résultat: 22% → 31-44%
```

### **Étape 3: Composants UI (2-3h)**

```yaml
StandardModal: 0% → 70% (+1%)
ClickableCard: 0% → 70% (+1%)
HealthIndicator: 42% → 80% (+1%)
ProgressHeader: 0% → 70% (+1%)

Total: +4% coverage
Résultat: 31% → 35%
```

---

## 🛠️ **IMPLÉMENTATION**

### **Actions Immédiates**

#### **1. Créer Tests Modules Critiques**

```bash
# Créer fichiers de tests
touch src/__tests__/lib/challengeImplementation.test.ts
touch src/__tests__/lib/notifications/challengeNotifications.test.ts
touch src/__tests__/lib/notifications/notificationTemplates.test.ts
touch src/__tests__/hooks/useChallengeTracker.test.ts
```

#### **2. Migration Jest (Optionnelle)**

```bash
# Si migration Jest choisie
npm install jest @testing-library/jest-dom @testing-library/react-hooks
# Créer jest.config.js
# Migrer tests hooks
```

#### **3. Tests Composants UI**

```bash
# Créer tests composants manquants
touch src/__tests__/components/ui/StandardModal.test.tsx
touch src/__tests__/components/ui/ClickableCard.test.tsx
touch src/__tests__/components/ui/HealthIndicator.test.tsx
```

### **Validation Coverage**

#### **Après Phase 1**

```bash
npm run test:coverage
# Objectif: 22-28% coverage
```

#### **Après Phase 2**

```bash
npm run test:coverage
# Objectif: 31-44% coverage
```

#### **Après Phase 3**

```bash
npm run test:coverage
# Objectif: 35%+ coverage (dépassement objectif 25%)
```

---

## 🎯 **RÉSULTATS ATTENDUS**

### **Coverage Final**

```yaml
Avant: 12-15% coverage
Après: 35%+ coverage
Progression: +20-23%
Tests: 866 → 950+ tests
```

### **Modules 100% Testés**

```yaml
- challengeImplementation.ts
- challengeNotifications.ts
- notificationTemplates.ts
- useChallengeTracker.ts
- useFirestore.ts (hooks)
- StandardModal.tsx
- ClickableCard.tsx
- HealthIndicator.tsx
```

### **Impact Qualité**

```yaml
- Couverture complète des modules critiques
- Tests standardisés et maintenables
- Documentation à jour
- CI/CD stable
- Score qualité: 8/10 → 9.5/10
```

---

**Version**: 1.0 OPTIMIZATION  
**Auteur**: Équipe Technique SuperNovaFit  
**Dernière MAJ**: 23 Octobre 2025  
**Status**: 🚀 Prêt pour implémentation

**🎯 Objectif: 25% → 35% coverage en 10-15h de travail**
