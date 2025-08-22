# 📝 Issues Identifiées - SuperNovaFit

## Résumé

Total : **15 issues critiques** identifiées
- 🔴 Bloquantes : 3
- 🟠 Majeures : 7  
- 🟡 Modérées : 5

## 🔴 Issues Bloquantes

### 1. [Sécurité] Secrets Firebase hardcodés dans le code

**Lieu** : `src/lib/firebase.ts:9-15`

**Constat & preuve** :
```typescript
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyBe176JrNl_R0NmUAFkhCISThnFUUgt8U4',
authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'supernovafit-a6fe7.firebaseapp.com',
projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'supernovafit-a6fe7',
// ... autres clés
```
Les clés API Firebase sont exposées en fallback hardcodé.

**Impact** : Sécurité - Les clés sont exposées dans le repository public

**Sévérité** : Bloquante

**Effort** : S (< 1 jour)

**Fix proposé (diff)** :
```diff
- apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyBe176JrNl_R0NmUAFkhCISThnFUUgt8U4',
- authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'supernovafit-a6fe7.firebaseapp.com',
- projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'supernovafit-a6fe7',
- storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'supernovafit-a6fe7.firebasestorage.app',
- messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '261698689691',
- appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:261698689691:web:edc7a7135d94a8250c443e',
- measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-RV0RK8JWN4',
+ apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
+ authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
+ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
+ storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
+ messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
+ appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
+ measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
```

**Tests** : Vérifier que l'app ne démarre pas sans variables d'environnement

**Risques & rollback** : Aucun risque si les variables sont bien configurées

---

### 2. [Sécurité] Vulnérabilités npm critiques non corrigées

**Lieu** : `package.json` - dépendances

**Constat & preuve** :
```json
// npm audit
xlsx: 2 vulnérabilités HIGH (Prototype Pollution + ReDoS)
jspdf: 1 vulnérabilité HIGH (ReDoS)
jspdf-autotable: 1 vulnérabilité HIGH (via jspdf)
```

**Impact** : Sécurité - Déni de service et injection possible

**Sévérité** : Bloquante

**Effort** : M (3-5 jours pour migration)

**Fix proposé** : Voir patch `AUDIT/patches/01-security-deps.diff`

**Tests** : Vérifier que les exports Excel/PDF fonctionnent après migration

**Risques & rollback** : Breaking changes possibles, nécessite tests complets

---

### 3. [Performance] Bundle JavaScript de 602KB sur /export

**Lieu** : `src/app/export/page.tsx`

**Constat & preuve** :
```
Route (app)     Size     First Load JS
/export         236 KB   602 KB  ❌
```
Page 3x plus lourde que la recommandation (200KB max).

**Impact** : Performance - Temps de chargement excessif sur mobile

**Sévérité** : Bloquante pour l'UX mobile

**Effort** : S (< 1 jour)

**Fix proposé** : Voir patch `AUDIT/patches/02-export-optimization.diff`

**Tests** : Mesurer bundle size après optimisation

**Risques & rollback** : Aucun, amélioration progressive

---

## 🟠 Issues Majeures

### 4. [Tests] Couverture de code à 1.96%

**Lieu** : Global - `coverage/`

**Constat & preuve** :
```
% Coverage report from v8
File        | % Stmts | % Branch | % Funcs | % Lines
All files   |    1.96 |    70.63 |   73.21 |    1.96
```

**Impact** : Stabilité - Régressions non détectées

**Sévérité** : Majeure

**Effort** : L (> 1 semaine)

**Fix proposé** : Plan détaillé dans `AUDIT/testing.md`

**Tests** : Objectif 80% de couverture

**Risques & rollback** : Aucun, amélioration progressive

---

### 5. [A11y] Composants d'accessibilité non utilisés

**Lieu** : `src/components/ui/AccessibleButton.tsx`, `AccessibleForm.tsx`, `AccessibleLink.tsx`

**Constat & preuve** :
```
Unused files (10)
src/components/ui/AccessibleButton.tsx
src/components/ui/AccessibleForm.tsx
src/components/ui/AccessibleLink.tsx
```
Composants créés mais jamais importés.

**Impact** : UX/Accessibilité - Non conformité WCAG 2.2

**Sévérité** : Majeure

**Effort** : M (3-5 jours)

**Fix proposé** : Voir patch `AUDIT/patches/03-use-accessible-components.diff`

**Tests** : Audit d'accessibilité avec axe-core

**Risques & rollback** : Changements visuels mineurs possibles

---

### 6. [Code Mort] 64 exports non utilisés

**Lieu** : Multiple fichiers

**Constat & preuve** :
```
Unused exports (64)
trackMealAdded         src/lib/analytics.ts:38:14
calculateBMR           src/lib/userCalculations.ts:8:17
// ... 62 autres
```

**Impact** : Performance - Bundle size inutilement augmenté

**Sévérité** : Majeure

**Effort** : S (< 1 jour)

**Fix proposé** : Voir patch `AUDIT/patches/04-remove-dead-code.diff`

**Tests** : Vérifier que le build passe

**Risques & rollback** : Faible si bien testé

---

### 7. [Performance] Hook useFirestore monolithique (1591 lignes)

**Lieu** : `src/hooks/useFirestore.ts`

**Constat & preuve** :
```typescript
// 1591 lignes, 60+ fonctions
export function useFirestore() {
  // Toutes les requêtes Firestore dans un seul hook
}
```

**Impact** : Performance - Re-render inutiles, bundle size

**Sévérité** : Majeure

**Effort** : L (> 1 semaine)

**Fix proposé** : Splitter en hooks spécialisés
```typescript
// useRepas.ts
export function useRepas() { /* ... */ }

// useEntrainements.ts  
export function useEntrainements() { /* ... */ }

// etc.
```

**Tests** : Tests unitaires par hook

**Risques & rollback** : Refactoring majeur, nécessite tests complets

---

### 8. [A11y] Contrastes insuffisants sur thème neon

**Lieu** : Global - classes Tailwind

**Constat & preuve** :
```css
bg-neon-purple/20 text-neon-purple /* Ratio: 3.8:1 < 4.5:1 requis */
bg-neon-cyan/20 text-neon-cyan /* Ratio: 3.5:1 < 4.5:1 requis */
```

**Impact** : Accessibilité - Lisibilité réduite

**Sévérité** : Majeure (conformité légale)

**Effort** : S (< 1 jour)

**Fix proposé** : Voir patch `AUDIT/patches/05-fix-contrast.diff`

**Tests** : Audit avec Chrome DevTools

**Risques & rollback** : Changement visuel du thème

---

### 9. [UX] Boutons trop petits sur mobile

**Lieu** : Global - boutons avec `px-2 py-1`

**Constat & preuve** :
```tsx
<button className="px-2 py-1 text-xs">
  {/* Taille finale < 44x44px minimum */}
</button>
```

**Impact** : UX mobile - Difficulté à cliquer

**Sévérité** : Majeure

**Effort** : S (< 1 jour)

**Fix proposé** : Voir patch `AUDIT/patches/06-touch-targets.diff`

**Tests** : Test sur device mobile

**Risques & rollback** : Layout peut changer légèrement

---

### 10. [Performance] Images non optimisées

**Lieu** : Multiple composants

**Constat & preuve** :
```tsx
<Image src={url} alt="Photo" width={400} height={300} />
// Manque: sizes, placeholder, loading
```

**Impact** : Performance - CLS et temps de chargement

**Sévérité** : Majeure

**Effort** : M (2-3 jours)

**Fix proposé** : Voir patch `AUDIT/patches/07-optimize-images.diff`

**Tests** : Lighthouse performance audit

**Risques & rollback** : Aucun

---

## 🟡 Issues Modérées

### 11. [DX] ESLint version obsolète

**Lieu** : `package.json:80`

**Constat & preuve** :
```json
"eslint": "^8.57.1" // Deprecated, ESLint 9+ disponible
```

**Impact** : DX - Nouvelles règles non disponibles

**Sévérité** : Modérée

**Effort** : S (< 1 jour)

**Fix proposé** :
```diff
- "eslint": "^8.57.1",
+ "eslint": "^9.0.0",
```

**Tests** : `npm run lint`

**Risques & rollback** : Config à adapter

---

### 12. [Code] Duplication des librairies de graphiques

**Lieu** : `package.json` - recharts ET chart.js

**Constat & preuve** :
```json
"recharts": "^2.10.3",
"chart.js": "^4.5.0",
"react-chartjs-2": "^5.3.0", // Non utilisé
```

**Impact** : Performance - Bundle size doublé

**Sévérité** : Modérée

**Effort** : M (2-3 jours)

**Fix proposé** : Unifier sur recharts, supprimer chart.js

**Tests** : Vérifier tous les graphiques

**Risques & rollback** : Migration des graphiques chart.js

---

### 13. [A11y] Pas de skip links

**Lieu** : `src/app/layout.tsx`

**Constat & preuve** : Aucun skip link pour navigation rapide

**Impact** : Accessibilité - Navigation clavier difficile

**Sévérité** : Modérée

**Effort** : S (15 minutes)

**Fix proposé** : Voir patch `AUDIT/patches/08-skip-links.diff`

**Tests** : Navigation clavier

**Risques & rollback** : Aucun

---

### 14. [Performance] Firestore queries non paginées

**Lieu** : Collections journal, entrainements, mesures

**Constat & preuve** :
```typescript
// Charge TOUT l'historique
const q = query(collection(db, 'journal'), where('user_id', '==', userId))
```

**Impact** : Performance - Temps de chargement et coûts Firestore

**Sévérité** : Modérée

**Effort** : M (3-5 jours)

**Fix proposé** : Implémenter pagination serveur (voir `performance.md`)

**Tests** : Tests de charge

**Risques & rollback** : Changement d'API

---

### 15. [RGPD] Pas de mécanisme de suppression de compte

**Lieu** : Profil utilisateur

**Constat & preuve** : Aucune option pour supprimer son compte (droit à l'oubli)

**Impact** : Conformité légale RGPD

**Sévérité** : Modérée (risque légal)

**Effort** : M (2-3 jours)

**Fix proposé** : Ajouter bouton + Cloud Function de suppression

**Tests** : Test du workflow complet

**Risques & rollback** : Suppression irréversible, nécessite confirmation

---

## 📊 Résumé par effort

### Quick Wins (S - < 1 jour) : 7 issues
1. Secrets Firebase ✅
2. Bundle export ✅
3. Code mort ✅
4. Contrastes ✅
5. Touch targets ✅
6. ESLint update ✅
7. Skip links ✅

### Effort Moyen (M - 3-5 jours) : 5 issues
8. Vulnérabilités npm
9. Composants accessibles
10. Images optimisation
11. Duplication graphiques
12. RGPD suppression

### Effort Important (L - > 1 semaine) : 3 issues
13. Tests coverage
14. Refactoring useFirestore
15. Pagination Firestore