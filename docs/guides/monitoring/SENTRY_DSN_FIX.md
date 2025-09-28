# 🔧 SENTRY DSN FIX - Résolution Problème Variables d'Environnement

## 🚨 Problème Identifié

**Symptôme :** Sentry fonctionnait en développement mais pas en production. Les logs montraient :

```
[Sentry] Initializing with config: {dsn: 'NOT SET', dsnValue: 'undefined', env: 'production'}
```

**Cause :** Les variables d'environnement `NEXT_PUBLIC_SENTRY_DSN` n'étaient pas correctement injectées dans le bundle client en production, malgré être présentes dans GitHub Actions.

## 🔍 Diagnostic Détaillé

### 1. Variables d'Environnement Testées

- ✅ GitHub Secrets : `NEXT_PUBLIC_SENTRY_DSN`
- ✅ GitHub Variables : `NEXT_PUBLIC_SENTRY_DSN`
- ✅ Hardcodé dans workflow : `NEXT_PUBLIC_SENTRY_DSN: "https://..."`
- ❌ **Résultat** : Toujours `undefined` dans le bundle client

### 2. Logs de Debug

```bash
# GitHub Actions (Build)
✅ NEXT_PUBLIC_SENTRY_DSN is SET before build
Length: 95
DSN: https://6a6884fb3ee7188800e6d7a5a521ac4f@o4509835502813184.ingest.de.sentry.io/4509835686117456

# Production Console
❌ dsnValue: 'undefined'
```

### 3. Problème Identifié

Le DSN était présent pendant le build mais pas dans le bundle client final. Cela indique un problème avec l'injection des variables d'environnement dans Next.js en production.

## ✅ Solution Finale

### Hardcoder le DSN dans `sentry.client.config.ts`

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

// DSN Sentry hardcodé pour production (plus fiable que les variables d'environnement)
const SENTRY_DSN =
  "https://6a6884fb3ee7188800e6d7a5a521ac4f@o4509835502813184.ingest.de.sentry.io/4509835686117456";

Sentry.init({
  dsn: SENTRY_DSN,
  // ... reste de la config
});
```

### Avantages de cette Solution

1. **Fiabilité** : Pas de dépendance aux variables d'environnement
2. **Simplicité** : Configuration directe et claire
3. **Performance** : Pas de lookup de variables d'environnement
4. **Debugging** : Plus facile à diagnostiquer

### Inconvénients

1. **Sécurité** : DSN visible dans le code (acceptable pour DSN public)
2. **Flexibilité** : Nécessite un rebuild pour changer le DSN

## 🧹 Nettoyage Effectué

### Fichiers Modifiés

1. **`sentry.client.config.ts`** : DSN hardcodé
2. **`src/lib/vitals.ts`** : Suppression logs de debug
3. **`src/components/analytics/VitalsReporter.tsx`** : Suppression logs de debug
4. **`.github/workflows/firebase-hosting-merge.yml`** : Suppression logs de debug
5. **`next.config.js`** : Suppression référence `NEXT_PUBLIC_SENTRY_DSN`

### Logs Supprimés

- ❌ Debug logs en production
- ❌ Vérifications variables d'environnement
- ❌ Logs de test dans GitHub Actions

## 🎯 Résultat Final

### En Production

```javascript
// Console propre, plus de logs de debug
[Web Vitals] Monitoring initialized successfully
```

### Test Sentry

```javascript
// Fonctionne parfaitement
setTimeout(() => {
  throw new Error("SentryPing");
}, 0);
```

### Web Vitals

- ✅ Toutes les métriques envoyées à Sentry
- ✅ Dashboard Sentry → Performance → Web Vitals
- ✅ Alertes automatiques configurées

## 📚 Documentation Mise à Jour

### Fichiers Mis à Jour

1. **`docs/guides/monitoring/1-SETUP_SENTRY.md`** : Instructions avec DSN hardcodé
2. **`docs/phases/OPTION_A_CONSOLIDATION_PLAN.md`** : Configuration mise à jour
3. **`docs/context/ai_context_summary.md`** : Status mis à jour

### Instructions pour Nouveaux Projets

1. Copier le DSN depuis Sentry Dashboard
2. Remplacer dans `sentry.client.config.ts`
3. Tester avec `setTimeout(() => { throw new Error('SentryPing') }, 0)`

## 🔮 Alternatives Futures

Si besoin de plus de flexibilité :

1. **Runtime Config** : Next.js runtime configuration
2. **API Route** : Endpoint pour récupérer la config
3. **Build-time Injection** : Script de build personnalisé

## ✅ Status Final

**Sentry est maintenant 100% fonctionnel en production :**

- ✅ Error tracking
- ✅ Web Vitals monitoring
- ✅ Performance tracking
- ✅ User context
- ✅ Source maps
- ✅ Release tracking

**Prochaine étape :** Monitoring quotidien via Sentry Dashboard
