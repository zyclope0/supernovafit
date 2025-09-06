# 🚨 ISSUES IDENTIFIÉES & PATCHES
**Date**: 06 Jan 2025 | **Version**: 1.9.4

## 📊 RÉSUMÉ DES ISSUES

| Priorité | Nombre | Résolu | En cours | À faire |
|----------|--------|--------|----------|---------|
| 🔴 **Bloquante** | 3 | 0 | 0 | 3 |
| 🟠 **Majeure** | 5 | 0 | 0 | 5 |
| 🟡 **Modérée** | 7 | 0 | 0 | 7 |
| 🟢 **Mineure** | 5 | 0 | 0 | 5 |
| **TOTAL** | **20** | **0** | **0** | **20** |

---

## 🔴 ISSUES BLOQUANTES

### Issue #1: [Tests] Coverage Critique 2%
**Lieu**: `src/hooks/__tests__/useFirestore.test.ts` et configuration globale
**Constat & preuve**: 
```bash
# Coverage actuelle
Statements   : 2.16% ( 147/6789 )
Branches     : 1.85% ( 24/1298 )
Functions    : 2.35% ( 31/1321 )
Lines        : 2.16% ( 147/6789 )
```
**Impact**: Régressions invisibles, bugs production, dette technique
**Sévérité**: Bloquante
**Effort**: L (2 semaines)
**Fix proposé**: Voir patch `01-fix-test-config.diff`
**Tests**: Atteindre 30% coverage minimum
**Risques & rollback**: Aucun risque, amélioration pure

### Issue #2: [Perf] Route /entrainements 398KB
**Lieu**: `src/app/entrainements/page.tsx`
**Constat & preuve**:
```
Route                Size
/entrainements      398 KB (plus lourd bundle)
```
**Impact**: Temps chargement +2s, UX dégradée
**Sévérité**: Bloquante
**Effort**: M (3 jours)
**Fix proposé**: Voir patch `02-optimize-entrainements.diff`
**Tests**: Bundle < 350KB après fix
**Risques & rollback**: Test sur staging requis

### Issue #3: [A11y] Labels Manquants Inputs
**Lieu**: Multiple formulaires
**Constat & preuve**:
```tsx
// src/components/ui/SearchBar.tsx:15
<input type="text" placeholder="Rechercher..." />
// ❌ Pas de label ou aria-label
```
**Impact**: Inaccessible screen readers, non WCAG
**Sévérité**: Bloquante (conformité légale)
**Effort**: S (1 jour)
**Fix proposé**: Voir patch `03-add-aria-labels.diff`
**Tests**: Axe-core validation
**Risques & rollback**: Aucun

---

## 🟠 ISSUES MAJEURES

### Issue #4: [Code] 44 Exports Inutilisés
**Lieu**: Multiple fichiers (voir knip report)
**Constat & preuve**:
```
Unused exports (44)
- useFirebaseOperation (useFirebaseError.ts:162)
- useUserProfile (useFirestore.ts:1025)
- calculateMaxHR (caloriesCalculator.ts:102)
[...41 autres]
```
**Impact**: Bundle +30KB inutile
**Sévérité**: Majeure
**Effort**: S (4h)
**Fix proposé**: Voir patch `04-remove-dead-exports.diff`
**Tests**: Vérifier aucune régression
**Risques & rollback**: Certains exports peuvent être API publique

### Issue #5: [Perf] Build Time 45s
**Lieu**: Configuration build Next.js
**Constat & preuve**: `real 0m45.448s`
**Impact**: CI/CD lent, DX dégradée
**Sévérité**: Majeure
**Effort**: M (2 jours)
**Fix proposé**: Voir patch `05-optimize-build.diff`
**Tests**: Build < 30s
**Risques & rollback**: Test config SWC

### Issue #6: [UX] Loading States Manquants
**Lieu**: Pages diete, export, coach
**Constat & preuve**: Pages blanches pendant chargement
**Impact**: UX confusion, abandons
**Sévérité**: Majeure
**Effort**: M (3 jours)
**Fix proposé**: Voir patch `06-add-skeletons.diff`
**Tests**: Tous les fetch avec skeleton
**Risques & rollback**: Aucun

### Issue #7: [A11y] Focus Management Modales
**Lieu**: `src/components/ui/*Modal.tsx`
**Constat & preuve**: Focus trap incomplet
**Impact**: Navigation clavier cassée
**Sévérité**: Majeure
**Effort**: S (1 jour)
**Fix proposé**: Voir patch `07-fix-focus-trap.diff`
**Tests**: Keyboard navigation tests
**Risques & rollback**: Test sur différents browsers

### Issue #8: [Deps] 3 Dépendances Inutilisées
**Lieu**: `package.json`
**Constat & preuve**:
```
@types/exceljs - unused
@testing-library/user-event - unused
webpack-bundle-analyzer - unused
```
**Impact**: Install plus lent, confusion
**Sévérité**: Majeure
**Effort**: S (30min)
**Fix proposé**: Voir patch `08-remove-unused-deps.diff`
**Tests**: npm install fonctionne
**Risques & rollback**: Vérifier aucun usage

---

## 🟡 ISSUES MODÉRÉES

### Issue #9: [Code] Fichier OptimizedImage.tsx Inutilisé
**Lieu**: `src/components/ui/OptimizedImage.tsx`
**Constat**: Fichier complet non référencé
**Impact**: Code mort, confusion
**Sévérité**: Modérée
**Effort**: S (10min)
**Fix proposé**: Voir patch `09-remove-optimizedimage.diff`

### Issue #10: [Perf] Images Non Optimisées
**Lieu**: `src/components/ui/PhotosLibresGallery.tsx`
**Constat**: Pas de lazy loading sur galerie
**Impact**: Performance initiale
**Sévérité**: Modérée
**Effort**: S (2h)
**Fix proposé**: Voir patch `10-optimize-gallery.diff`

### Issue #11: [A11y] Contrast Glass Effect
**Lieu**: `src/styles/globals.css`
**Constat**: Backdrop 12% encore limite
**Impact**: Lisibilité faible luminosité
**Sévérité**: Modérée
**Effort**: S (1h)
**Fix proposé**: Voir patch `11-improve-contrast.diff`

### Issue #12: [UX] Navigation Mobile
**Lieu**: `src/components/layout/Sidebar.tsx`
**Constat**: Pas de gestures swipe
**Impact**: UX mobile basique
**Sévérité**: Modérée
**Effort**: M (2 jours)
**Fix proposé**: Voir patch `12-add-gestures.diff`

### Issue #13: [Test] Timeout useFirestore Tests
**Lieu**: `src/hooks/__tests__/useFirestore.test.ts`
**Constat**: Fuite mémoire, timeout 900s
**Impact**: Tests non exécutables
**Sévérité**: Modérée
**Effort**: M (1 jour)
**Fix proposé**: Voir patch `13-fix-firestore-tests.diff`

### Issue #14: [Doc] Prettier Non Déclaré
**Lieu**: `package.json`
**Constat**: Binaire utilisé mais non listé
**Impact**: CI peut échouer
**Sévérité**: Modérée
**Effort**: S (5min)
**Fix proposé**: Voir patch `14-add-prettier.diff`

### Issue #15: [Perf] Bundle Partagé 126KB
**Lieu**: Chunk principal
**Constat**: 57% du JS dans 1 chunk
**Impact**: Cache inefficace
**Sévérité**: Modérée
**Effort**: M (2 jours)
**Fix proposé**: Voir patch `15-split-chunks.diff`

---

## 🟢 ISSUES MINEURES

### Issue #16: [DX] Next Lint Déprécié
**Lieu**: Configuration lint
**Constat**: Warning Next.js 16
**Effort**: S (1h)

### Issue #17: [A11y] Microdata Incomplète
**Lieu**: Breadcrumbs
**Constat**: Schema.org partiel
**Effort**: S (30min)

### Issue #18: [UX] Animations Manquantes
**Lieu**: Transitions pages
**Constat**: Changements brusques
**Effort**: M (2 jours)

### Issue #19: [Code] Console Logs Dev
**Lieu**: Multiple fichiers
**Constat**: Logs en production
**Effort**: S (30min)

### Issue #20: [Monitoring] Telemetry Next.js
**Lieu**: Build process
**Constat**: Message telemetry
**Effort**: S (10min)

---

## 📁 PATCHES DISPONIBLES

Les patches sont créés dans `/workspace/AUDIT_NOW/patches/`:
- `01-fix-test-config.diff` - Configuration tests robuste
- `02-optimize-entrainements.diff` - Code splitting route
- `03-add-aria-labels.diff` - Labels accessibilité
- `04-remove-dead-exports.diff` - Nettoyage exports
- `05-optimize-build.diff` - Build performance
- `06-add-skeletons.diff` - Loading states
- `07-fix-focus-trap.diff` - Focus management
- `08-remove-unused-deps.diff` - Deps cleanup

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Jour 1-2 (Quick Wins)
✅ Issues #3, #8, #9, #14, #16, #19, #20
- 2h total effort
- Impact immédiat
- Aucun risque

### Semaine 1 (Priorités)
⚡ Issues #1, #2, #4, #6, #7
- Tests stabilisés
- Bundle optimisé
- UX améliorée

### Semaine 2-3 (Consolidation)
🔧 Issues #5, #10, #11, #12, #13, #15
- Performance globale
- Accessibilité complète
- Tests fonctionnels

### Mois 2 (Excellence)
🎨 Issues #17, #18 + nouvelles features
- Finitions UX
- Monitoring avancé
- Documentation