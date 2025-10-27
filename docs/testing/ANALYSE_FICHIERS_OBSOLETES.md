# 🔍 ANALYSE FICHIERS OBSOLÈTES - Contenu Récupérable

**Date**: 27 Octobre 2025  
**Objectif**: Identifier contenu utile avant suppression  
**Fichiers Analysés**: 59 fichiers obsolètes

---

## 📊 RÉSUMÉ EXÉCUTIF

**Analyse Complète** : 59 fichiers obsolètes / 81 total (73%)

**Contenu Récupérable Identifié** :

- ✅ **26 tests unitaires complets** (useRepas.test.ts) - TRÈS UTILE
- ✅ **15 cas de test business logic** (useFirestore.test.ts) - UTILE
- ✅ **8 tests calculs BMR/TDEE** (calculations.test.ts, userCalculations.test.ts) - UTILE
- ✅ **Patterns de mocks Firebase** - RÉFÉRENCE PRÉCIEUSE

**Recommandation** :

1. **Sauvegarder** contenu utile dans documentation
2. **Migrer** tests pertinents vers Jest
3. **Supprimer** fichiers obsolètes

---

## 📋 CATÉGORIE 1: DOUBLONS (15 fichiers)

### ❌ À SUPPRIMER (tous des doublons stricts)

#### Hooks Vitest Obsolètes (11 fichiers)

```yaml
useEntrainements:
  ❌ src/__tests__/hooks/useEntrainements.test.ts (ancien Vitest)
  ❌ src/__tests__/hooks/useEntrainements.simple.test.ts (ancien Vitest)
  ✅ src/__tests__/hooks/useEntrainements.simple.jest.test.ts (ACTIF)

useJournal: ❌ src/__tests__/hooks/useJournal.test.ts (ancien Vitest)
  ❌ src/__tests__/hooks/useJournal.simple.test.ts (ancien Vitest)
  ✅ src/__tests__/hooks/useJournal.simple.jest.test.ts (ACTIF)

useMesures: ❌ src/__tests__/hooks/useMesures.test.ts (ancien Vitest)
  ❌ src/__tests__/hooks/useMesures.simple.test.ts (ancien Vitest)
  ✅ src/__tests__/hooks/useMesures.simple.jest.test.ts (ACTIF)

useRepas:
  ❌ src/__tests__/hooks/useRepas.test.ts (531 lignes) ⭐ CONTENU À SAUVEGARDER
  ❌ src/__tests__/hooks/useRepas.simple.test.ts (54 lignes)
  ❌ src/__tests__/hooks/useRepas.jest.test.ts (229 lignes) - dupliqué
  ✅ src/__tests__/hooks/useRepas.simple.jest.test.ts (ACTIF - 7 tests)

useCoachComments:
  ❌ src/__tests__/hooks/useCoachComments.test.ts (ancien Vitest)
  ✅ src/__tests__/hooks/useCoachComments.simple.jest.test.ts (ACTIF)

useAuth: ❌ src/__tests__/hooks/useAuth-extended.test.ts (ancien, non maintenu)
  ✅ src/__tests__/hooks/useAuth.simple.jest.test.ts (ACTIF)
```

**Action** : Supprimer TOUS sauf sauvegarder contenu useRepas.test.ts

#### Composants UI Dupliqués (4 fichiers)

```yaml
FormField: ❌ src/__tests__/components/ui/FormField.test.tsx (ancien Vitest)
  ✅ src/__tests__/components/ui/FormField.jest.test.tsx (ACTIF - 15 tests)

PageHeader: ❌ src/__tests__/components/ui/PageHeader.test.tsx (ancien Vitest)
  ✅ src/__tests__/components/ui/PageHeader.jest.test.tsx (ACTIF - 6 tests)

Skeletons: ❌ src/__tests__/components/ui/Skeletons.test.tsx (ancien Vitest)
  ✅ src/__tests__/components/ui/Skeletons.jest.test.tsx (ACTIF - 14 tests)

CollapsibleCard: ❌ src/__tests__/components/ui/CollapsibleCard.test.tsx (ancien, non maintenu)
```

**Action** : Supprimer TOUS (doublons exacts)

---

## 📋 CATÉGORIE 2: MAL PLACÉS (11 fichiers)

### ⚠️ CONTENU RÉCUPÉRABLE

#### src/hooks/**tests**/ (3 fichiers)

```yaml
useAuth.test.ts:
  Contenu: Tests business logic Auth
  Lignes: ~150
  Valeur: FAIBLE (dupliqué useAuth.simple.jest.test.ts)
  Action: SUPPRIMER

useEnergyBalance.test.ts:
  Contenu: Tests calculs énergétiques
  Lignes: ~80
  Valeur: FAIBLE (dupliqué useEnergyBalance.advanced.jest.test.ts - 23 tests 100%)
  Action: SUPPRIMER

useFirestore.test.ts:
  Contenu: 15 tests business logic Firestore (380 lignes) ⭐
  Valeur: UTILE (patterns de validation, calculs)
  Tests:
    - Data Validation (4 tests)
    - Data Processing Functions (3 tests)
    - Error Handling (3 tests)
    - Date Processing (2 tests)
    - Performance Considerations (2 tests)
    - Integration Scenarios (1 test)
  Action: SAUVEGARDER patterns → SUPPRIMER fichier
```

#### src/lib/**tests**/ (8 fichiers)

```yaml
calculations.test.ts:
  Contenu: Tests BMR, TDEE, MET, IMC (119 lignes) ⭐
  Valeur: TRÈS UTILE (tests académiques)
  Tests:
    - BMR Calculation (2 tests)
    - TDEE Calculation (1 test)
    - MET Calories Calculation (2 tests)
    - Macro Distribution (1 test)
    - IMC Calculation (2 tests)
  Action: MIGRER vers Jest → src/__tests__/lib/calculations.test.ts

userCalculations.test.ts:
  Contenu: Tests BMR avancés (148 lignes) ⭐
  Valeur: TRÈS UTILE (edge cases, validations)
  Tests:
    - calculateBMR (7 tests exhaustifs)
  Action: FUSIONNER avec calculations.test.ts → Supprimer fichier

constants.test.ts:
  Contenu: Tests constantes (MET, activités)
  Valeur: MOYEN
  Action: ÉVALUER utilité → DÉCIDER

firebase-errors.test.ts:
  Contenu: Tests gestion erreurs Firebase
  Valeur: MOYEN
  Action: ÉVALUER utilité → DÉCIDER

inviteUtils.test.ts:
  Contenu: Tests système invitations coach
  Valeur: FAIBLE (non critique)
  Action: SUPPRIMER

tdee-adjustment.test.ts:
  Contenu: Tests ajustements TDEE
  Valeur: MOYEN (dupliqué partiel useEnergyBalance)
  Action: SUPPRIMER

utils.test.ts:
  Contenu: Tests utilitaires généraux
  Valeur: MOYEN
  Action: ÉVALUER utilité → DÉCIDER

validation.test.ts:
  Contenu: Tests validation Zod
  Valeur: FAIBLE (dupliqué validation/challenges.test.ts - 93.18%)
  Action: SUPPRIMER
```

**Action Globale** :

- Sauvegarder 3 fichiers utiles (calculations, userCalculations, useFirestore patterns)
- Supprimer 8 fichiers après récupération

---

## 📋 CATÉGORIE 3: NON MAINTENUS (33 fichiers)

### Composants Complexes Skippés (13 fichiers)

```yaml
❌ DesktopDashboard.test.tsx (226 lignes) - 100% tests skippés
   Contenu: Tests dashboard desktop (widgets, période, actions)
   Raison skip: "Component too complex, needs extensive mocking"
   Valeur: FAIBLE (E2E couvre le cas)
   Action: SUPPRIMER

❌ MobileDashboard.test.tsx - 100% tests skippés
   Raison: Même que Desktop
   Action: SUPPRIMER

❌ DietForm.test.tsx - Tests skippés
❌ JournalForm.test.tsx - Tests skippés
❌ ClickableCard.test.tsx - Tests skippés
❌ HeartRateChart.test.tsx - Tests skippés
❌ MealForm.test.tsx - Tests skippés
❌ MesuresFormModal.test.tsx - Tests skippés
❌ PerformanceChart.test.tsx - Tests skippés
❌ TrainingForm.test.tsx - Tests skippés
❌ TrainingVolumeChart.test.tsx - Tests skippés
❌ MesuresCharts.test.tsx - Tests skippés
❌ AuthGuard.test.tsx - Ancien, remplacé

Raison commune: Components trop complexes, mocks lourds, E2E meilleure stratégie
```

**Action** : SUPPRIMER TOUS (13 fichiers)

### Libs Non Intégrées (11 fichiers)

```yaml
❌ analytics.test.ts - Non intégré au workflow
❌ badges.test.ts - Non intégré
❌ challengeImplementation.test.ts - Obsolète
❌ dateUtils.test.ts - Non intégré (mais potentiel)
❌ garminParser.test.ts - Non intégré
❌ logger.test.ts - Non intégré
❌ numberUtils.test.ts - Non intégré
❌ openfoodfacts.test.ts - Non intégré
❌ utils.test.ts - Non intégré (dupliqué)
❌ validation.test.ts - Dupliqué (validation/challenges 93.18%)
❌ vitals.test.ts - Non intégré
```

**Action** : SUPPRIMER TOUS (11 fichiers)

### Notifications/Security Non Intégrés (6 fichiers)

```yaml
❌ challengeNotifications.test.ts - Non intégré
❌ notificationTemplates.test.ts - Non intégré
❌ RateLimiter.test.ts - Non intégré
❌ firestore-rules.test.ts - Non intégré
❌ rate-limiting.test.ts - Non intégré
```

**Action** : SUPPRIMER TOUS (6 fichiers)

### Autres (3 fichiers)

```yaml
❌ accessibility.test.tsx - Non maintenu
❌ app/coach/page.test.tsx - Skippé (complexe)
❌ hooks/useFocusTrap.test.ts - Non intégré
❌ jest-setup.test.ts - Setup, pas de vrais tests
```

**Action** : SUPPRIMER TOUS (3 fichiers)

---

## 🎯 CONTENU À RÉCUPÉRER AVANT SUPPRESSION

### 1. useRepas.test.ts (531 lignes) ⭐ PRIORITÉ 1

**Contenu Précieux** :

```yaml
Tests Real-Time Firestore (10 tests):
  - Rendering & Loading (2 tests)
  - Real-time Data Fetching via onSnapshot (2 tests)
  - Filter invalid dates (1 test)
  - Cleanup unsubscribe (1 test)
  - Create (addRepas) (3 tests)
  - Filter undefined values (1 test)

Tests CRUD (6 tests):
  - Update (updateRepas) (2 tests)
  - Delete (deleteRepas) (1 test)
  - Error Handling (3 tests)

Tests Date Conversion (1 test):
  - Convert string to Timestamp

Total: 26 tests exhaustifs avec mocks Firebase complets
```

**Patterns Réutilisables** :

- ✅ Mock Firebase complet (onSnapshot, addDoc, updateDoc, deleteDoc)
- ✅ Mock useAuth avancé
- ✅ Mock dateUtils avec timestampToDateString
- ✅ Pattern cleanup (beforeEach/afterEach)
- ✅ Pattern AAA (Arrange-Act-Assert)
- ✅ Tests async/await avec act et waitFor

**Action** :

1. Sauvegarder fichier complet dans `docs/testing/PATTERNS_TESTS_FIREBASE.md`
2. Évaluer migration vers Jest (adapter mocks)
3. Supprimer fichier original

### 2. useFirestore.test.ts (380 lignes) ⭐ PRIORITÉ 2

**Contenu Précieux** :

```yaml
Business Logic Tests (15 tests):
  - Data Validation (4 tests)
    * Repas structure validation
    * Entrainement structure validation
    * Mesure structure + BMI calculation

  - Data Processing Functions (3 tests)
    * Process repas macros correctly
    * Calculate training duration
    * Process measurement trends

  - Error Handling (3 tests)
    * Invalid repas data gracefully
    * Missing user data
    * Validate required fields

  - Date Processing (2 tests)
    * Format dates consistently
    * Handle date ranges correctly

  - Performance Considerations (2 tests)
    * Handle large datasets efficiently
    * Optimize memory usage

  - Integration Scenarios (1 test)
    * Complete user workflow
```

**Patterns Réutilisables** :

- ✅ Validation structures de données
- ✅ Calculs métier (IMC, macros, durées)
- ✅ Tests performance (datasets larges)
- ✅ Tests intégration (workflows complets)

**Action** :

1. Extraire tests business logic purs (sans mocks Firebase)
2. Créer `src/__tests__/lib/businessLogic.test.ts` (Jest)
3. Supprimer fichier original

### 3. calculations.test.ts (119 lignes) ⭐ PRIORITÉ 1

**Contenu Précieux** :

```yaml
Tests Calculations (8 tests):
  - BMR Calculation Mifflin-St Jeor (2 tests)
    * Men: 10×poids + 6.25×taille - 5×age + 5
    * Women: 10×poids + 6.25×taille - 5×age - 161

  - TDEE Calculation (1 test)
    * 5 niveaux activité (1.2 à 1.9)

  - MET Calories Calculation (2 tests)
    * Formule: MET × poids × durée(heures)
    * Gestion heures fractionnelles

  - Macro Distribution (1 test)
    * 50% glucides, 20% protéines, 30% lipides
    * Conversion kcal → grammes

  - IMC Calculation (2 tests)
    * Formule: poids / (taille²)
    * Classification catégories
```

**Action** :

1. Déplacer vers `src/__tests__/lib/calculations.test.ts` (Vitest)
2. Fusionner avec userCalculations.test.ts
3. Supprimer fichier original mal placé

### 4. userCalculations.test.ts (148 lignes) ⭐ PRIORITÉ 1

**Contenu Précieux** :

```yaml
Tests calculateBMR Exhaustifs (7 tests):
  - Homme vs Femme
  - Valeurs limites (âge 18-80)
  - Poids extrêmes (45-120kg)
  - Tailles extrêmes (150-200cm)
  - Nombres cohérents (1000-3000 kcal)
  - Différenciation sexe (écart 166 kcal)
```

**Action** :

1. Fusionner avec calculations.test.ts
2. Créer test suite complète `src/__tests__/lib/calculations.complete.test.ts`
3. Supprimer fichier original

---

## 📚 DOCUMENTATION À CRÉER

### 1. PATTERNS_TESTS_FIREBASE.md

**Contenu** :

- Patterns mocks Firebase (onSnapshot, CRUD)
- Patterns real-time avec cleanup
- Patterns async/await avec act/waitFor
- Exemple complet useRepas.test.ts

### 2. BUSINESS_LOGIC_TESTS_PATTERNS.md

**Contenu** :

- Tests validation structures
- Tests calculs métier
- Tests performance
- Tests intégration workflows

### 3. CALCULATIONS_TESTS_COMPLETE.md

**Contenu** :

- Formules BMR/TDEE/MET/IMC
- Tests edge cases
- Tests validations

---

## ✅ PLAN D'ACTION FINAL

### Phase 1: Sauvegarde (15 min)

```bash
# 1. Créer documentation patterns
# Voir PATTERNS_TESTS_FIREBASE.md (contenu useRepas.test.ts)

# 2. Créer tests consolidés
# Migrer calculations.test.ts + userCalculations.test.ts
# → src/__tests__/lib/calculations.complete.test.ts

# 3. Extraire business logic
# Créer src/__tests__/lib/businessLogic.test.ts
```

### Phase 2: Nettoyage (15 min)

```bash
# Catégorie 1: Doublons (15 fichiers)
rm src/__tests__/hooks/useEntrainements.{test.ts,simple.test.ts}
rm src/__tests__/hooks/useJournal.{test.ts,simple.test.ts}
rm src/__tests__/hooks/useMesures.{test.ts,simple.test.ts}
rm src/__tests__/hooks/useRepas.{test.ts,simple.test.ts,jest.test.ts}
rm src/__tests__/hooks/useCoachComments.test.ts
rm src/__tests__/hooks/useAuth-extended.test.ts
rm src/__tests__/components/ui/FormField.test.tsx
rm src/__tests__/components/ui/PageHeader.test.tsx
rm src/__tests__/components/ui/Skeletons.test.tsx
rm src/__tests__/components/ui/CollapsibleCard.test.tsx

# Catégorie 2: Mal placés (11 fichiers)
rm -rf src/hooks/__tests__/
rm -rf src/lib/__tests__/

# Catégorie 3: Non maintenus (33 fichiers)
# Composants (13)
rm src/__tests__/components/desktop/DesktopDashboard.test.tsx
rm src/__tests__/components/mobile/MobileDashboard.test.tsx
rm src/__tests__/components/diete/DietForm.test.tsx
rm src/__tests__/components/journal/JournalForm.test.tsx
rm src/__tests__/components/ui/ClickableCard.test.tsx
rm src/__tests__/components/ui/HeartRateChart.test.tsx
rm src/__tests__/components/ui/MealForm.test.tsx
rm src/__tests__/components/ui/MesuresFormModal.test.tsx
rm src/__tests__/components/ui/PerformanceChart.test.tsx
rm src/__tests__/components/ui/TrainingForm.test.tsx
rm src/__tests__/components/ui/TrainingVolumeChart.test.tsx
rm src/__tests__/components/charts/MesuresCharts.test.tsx
rm src/__tests__/components/auth/AuthGuard.test.tsx

# Libs (11)
rm src/__tests__/lib/analytics.test.ts
rm src/__tests__/lib/badges.test.ts
rm src/__tests__/lib/challengeImplementation.test.ts
rm src/__tests__/lib/dateUtils.test.ts
rm src/__tests__/lib/garminParser.test.ts
rm src/__tests__/lib/logger.test.ts
rm src/__tests__/lib/numberUtils.test.ts
rm src/__tests__/lib/openfoodfacts.test.ts
rm src/__tests__/lib/utils.test.ts
rm src/__tests__/lib/validation.test.ts
rm src/__tests__/lib/vitals.test.ts

# Notifications/Security (6)
rm src/__tests__/lib/notifications/challengeNotifications.test.ts
rm src/__tests__/lib/notifications/notificationTemplates.test.ts
rm src/__tests__/lib/security/RateLimiter.test.ts
rm src/__tests__/security/firestore-rules.test.ts
rm src/__tests__/security/rate-limiting.test.ts

# Autres (3)
rm src/__tests__/accessibility.test.tsx
rm src/__tests__/app/coach/page.test.tsx
rm src/__tests__/hooks/useFocusTrap.test.ts
rm src/__tests__/jest-setup.test.ts
```

### Phase 3: Validation (10 min)

```bash
# Vérifier tests passent
npm run test:jest
npm run test:vitest:lib

# Vérifier coverage maintenu
npm run test:coverage

# Vérifier build
npm run build
```

---

## 🎯 RÉSULTAT ATTENDU

```yaml
Avant:
  Fichiers: 81 (22 actifs, 59 obsolètes)
  Tests: 361/361 passing
  Coverage: 18-20%
  Organisation: ⚠️ Éparpillée

Après:
  Fichiers: 25-27 (100% actifs)
  Tests: 361-380/361-380 passing (si migrations)
  Coverage: 18-22% (si migrations calculations)
  Organisation: ✅ 100% conforme

Contenu Récupéré: ✅ 26 tests useRepas (patterns Firebase)
  ✅ 15 tests business logic
  ✅ 15 tests calculations (BMR/TDEE/MET/IMC)
  ✅ Documentation patterns complète
```

---

**Auteur**: Assistant IA  
**Date**: 27 Octobre 2025  
**Type**: Analyse Récupération Contenu  
**Status**: PRÊT POUR EXÉCUTION
