# 🚀 ACTIONS PRIORITAIRES - SuperNovaFit
## Suite Audit 14 Janvier 2025

### 📊 RÉSUMÉ RAPIDE
- **Progression**: 55% des objectifs atteints ✅
- **Points forts**: 0 vulnérabilités, 0 erreurs code, -80% dépendances, -31% exports
- **Points critiques restants**: Bundle 471KB, Tests 2%

---

## 🔴 ACTIONS CRITIQUES (Cette semaine)

### 1. OPTIMISATION BUNDLE /coach/athlete/[id] (8h)
**Problème**: 471KB au lieu de 200KB (2.35x trop lourd)

```bash
# Analyser le bundle
npm install --save-dev webpack-bundle-analyzer
npm run build:analyze

# Implémenter code splitting
# Dans /src/app/coach/athlete/[id]/page.tsx
```

**Actions concrètes**:
- [ ] Installer webpack-bundle-analyzer
- [ ] Identifier composants lourds
- [ ] Implémenter React.lazy() pour:
  - Graphiques/Charts
  - Modales
  - Composants non critiques
- [ ] Dynamic imports pour librairies tierces
- [ ] Vérifier réduction à <200KB

### 2. CORRIGER TESTS (16h)
**Problème**: Coverage 2%, tests timeout

```bash
# Corriger configuration
# vitest.config.ts - augmenter timeout
testTimeout: 30000,
hookTimeout: 30000,

# Lancer tests avec plus de mémoire
NODE_OPTIONS="--max-old-space-size=4096" npm test
```

**Actions concrètes**:
- [ ] Corriger timeout dans vitest.config.ts
- [ ] Créer tests unitaires pour:
  - useAuth
  - useFirestore (basiques)
  - utils critiques
- [ ] Désactiver tests problématiques temporairement
- [ ] Atteindre 15% coverage minimum

### 3. FINALISER NETTOYAGE CODE (4h)
**Progrès**: Déjà -31% exports (64→44) et -80% dépendances (15+→3) ✅

```bash
# Supprimer les 3 dernières dépendances inutiles
npm uninstall @types/exceljs @testing-library/user-event webpack-bundle-analyzer

# Évaluer exports restants (beaucoup sont des utils)
npx knip --include exports

# Si approprié, nettoyer avec prudence
npx knip --fix  # ATTENTION: vérifier chaque suppression
```

**Actions concrètes**:
- [ ] Désinstaller 3 dernières dépendances
- [ ] Évaluer si certains utils doivent être gardés (calculateBMI, formatters, etc.)
- [ ] Nettoyer seulement les vrais exports morts
- [ ] Garder les utils qui pourraient servir

---

## 🟡 ACTIONS SECONDAIRES (Semaine prochaine)

### 4. SECRET SENTRY (2h)
**Note**: ❄️ Gelé temporairement, mais à corriger

```bash
# Dans .env.local
NEXT_PUBLIC_SENTRY_DSN=https://...

# Dans instrumentation-client.ts
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
```

### 5. ACCESSIBILITÉ (8h)
- Ajouter skip links
- Améliorer contraste couleurs
- Compléter aria-labels

---

## ✅ CHECKLIST VALIDATION

Après chaque action, vérifier:
```bash
# Build passe
npm run build

# Pas d'erreurs lint
npm run lint

# Tests passent
npm test

# Bundle size
# Vérifier dans output du build
```

---

## 📈 MÉTRIQUES SUCCÈS

| Action | Avant | Actuel | Objectif | Validation |
|--------|-------|--------|----------|------------|
| Bundle /coach/athlete | 602KB | 471KB | <200KB | Build output |
| Test coverage | 0% | 2% | 15% | npm test |
| Exports inutilisés | 64 | 44 (-31%✅) | ~20 | npx knip |
| Dépendances inutiles | 15+ | 3 (-80%✅✅) | 0 | npx depcheck |

---

## 🎯 RÉSULTAT ATTENDU (21 Janvier)

- **Performance**: Page la plus lourde <200KB
- **Tests**: 15% coverage minimum, pas de timeout
- **Code**: 0 exports morts, 0 dépendances inutiles
- **Qualité**: Maintien 0 erreurs ESLint/TS

---

## 💡 TIPS

1. **Bundle**: Commencer par analyser avant d'optimiser
2. **Tests**: Désactiver les tests problématiques, focus sur nouveaux
3. **Code mort**: Utiliser `--fix` de knip avec prudence, vérifier après

---

*Document créé le 14/01/2025 suite à l'audit complet*
*Progression actuelle: 55% → Objectif: 75% d'ici le 21/01/2025*
*Excellents progrès sur dépendances (-80%) et exports (-31%)*