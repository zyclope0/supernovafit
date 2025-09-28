# 🧹 Plan de Nettoyage ESLint - SuperNovaFit

## Status : ✅ Production Déployée

- **Déploiement** : https://supernovafit-a6fe7.web.app
- **Build** : ✅ Fonctionne (ESLint ignoré pendant build)
- **Erreurs ESLint** : ~300 (non-bloquantes)

## 🎯 Stratégie Progressive

### Phase 1 : Variables non utilisées (🔴 Priorité)

- **Impact** : Code mort, confusion
- **Effort** : 2-3h
- **Files** : 45+ fichiers avec imports/variables inutilisés

```bash
# Commande pour identifier
npm run lint | grep "is defined but never used"
```

### Phase 2 : Caractères non échappés (🟡 Moyen)

- **Impact** : Warnings, lisibilité
- **Effort** : 1h
- **Correction** : `'` → `&apos;`, `"` → `&quot;`

### Phase 3 : Types 'any' (🟠 Long terme)

- **Impact** : Sécurité TypeScript
- **Effort** : 4-6h
- **Approche** : Remplacer progressivement par types spécifiques

### Phase 4 : Hooks dependencies (🔵 Optimisation)

- **Impact** : Performance, bugs potentiels
- **Effort** : 2h
- **Focus** : useEffect dependencies manquantes

## 🛠️ Scripts de Nettoyage

### Script 1 : Variables non utilisées

```bash
# Créer un script automatisé pour supprimer imports inutilisés
node scripts/cleanup-unused-imports.js
```

### Script 2 : Caractères échappés

```bash
# Remplacement automatique des caractères
node scripts/fix-escaped-entities.js
```

### Script 3 : Types any

```bash
# Identification et remplacement progressif
node scripts/replace-any-types.js
```

## 📅 Planning Recommandé

- **Semaine 1** : Phase 1 (variables)
- **Semaine 2** : Phase 2 (caractères)
- **Semaine 3-4** : Phase 3 (types any)
- **Semaine 5** : Phase 4 (hooks)

## 🔒 Règles de Sécurité

1. **Un fichier à la fois** pour éviter les régressions
2. **Test après chaque correction** importante
3. **Commit fréquent** pour pouvoir revenir en arrière
4. **Build + déploiement** après chaque phase

## 📊 Métriques Cibles

- **Erreurs ESLint** : 300+ → 0
- **Code coverage** : Maintenir >90%
- **Build time** : Conserver <30s
- **Performance** : Aucune régression

---

**Dernière mise à jour** : 13 Janvier 2025
**Status** : Plan créé post-déploiement réussi
