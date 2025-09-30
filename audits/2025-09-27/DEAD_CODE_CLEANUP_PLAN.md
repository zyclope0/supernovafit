# 🧹 PLAN DE NETTOYAGE CODE MORT - PHASE 3

**Date**: 30.09.2025 - 17:30  
**Statut**: 🔄 **EN COURS**  
**Approche**: **MINUTIEUSE** - Vérification manuelle de chaque export

---

## 📊 ANALYSE INITIALE

### Outil d'Analyse
- **ts-unused-exports** : 79 modules avec exports non utilisés
- **Vérification manuelle** : Nécessaire (l'outil fait des erreurs)

### Exemples d'Erreurs de l'Outil
- **CardSkeleton/ListSkeleton** : Marqués comme non utilisés mais **UTILISÉS** dans mesures, journal, challenges
- **reportWebVitals** : Marqué comme non utilisé mais **UTILISÉ** via import dynamique

---

## 🎯 PLAN D'ACTION STRUCTURÉ

### 🔴 PHASE 3.1 - EXPORTS CRITIQUES (1h)

#### 3.1.1 Hooks Non Utilisés
- ❌ **useRateLimitTracker** : Hook créé pour Phase 2.1 mais non intégré
- ❌ **useChallenges, useAchievements, useUserProgress** : Dans useFirestore.ts mais non utilisés

#### 3.1.2 Constantes Non Utilisées
- ❌ **APP_NAME, APP_RELEASE_DATE, ACTIVITY_LEVELS** : Seulement dans les tests
- ❌ **MEAL_TYPES, OPENFOOD_TAGS_SUGGESTIONS** : Déjà supprimés (commentaires)

#### 3.1.3 Schémas de Validation Non Utilisés
- ❌ **macrosSchema, alimentSchema, mesureSchema, formatZodError** : Seulement dans les tests

### 🟡 PHASE 3.2 - TYPES DUPLIQUÉS (1h)

#### 3.2.1 Types d'Export Non Utilisés
- ❌ **ExportFilters, CSVExportData, MonthlyReport** : Non utilisés
- ❌ **RepasExportData, EntrainementExportData, MesureExportData** : Non utilisés
- ❌ **ExportTemplate, UserExportPreferences** : Non utilisés

#### 3.2.2 Types en Conflit
- ❌ **ChartData** : Défini dans types/export.ts ET lib/export/chart-utils.ts
- ✅ **Garder** : lib/export/chart-utils.ts (utilisé)
- ❌ **Supprimer** : types/export.ts (duplicat)

### 🟢 PHASE 3.3 - VÉRIFICATIONS FINALES (2h)

#### 3.3.1 Exports Potentiellement Utiles
- 🔍 **BadgeDefinition, BADGE_DEFINITIONS** : À vérifier
- 🔍 **ChallengeAuditor** : À vérifier
- 🔍 **GarminParser, GarminActivity** : À vérifier

#### 3.3.2 Exports de Configuration
- 🔍 **tailwind.config.ts default** : À vérifier
- 🔍 **middleware.ts exports** : À vérifier

---

## 📋 CHECKLIST DE VÉRIFICATION

### ✅ Exports à GARDER (Vérifiés)
- **CardSkeleton, ListSkeleton** : Utilisés dans mesures, journal, challenges
- **reportWebVitals** : Utilisé via import dynamique
- **ChartData** (lib/export/chart-utils.ts) : Utilisé dans exports

### ❌ Exports à SUPPRIMER (Vérifiés)
- **useRateLimitTracker** : Non intégré
- **APP_NAME, APP_RELEASE_DATE, ACTIVITY_LEVELS** : Seulement tests
- **macrosSchema, alimentSchema, mesureSchema, formatZodError** : Seulement tests
- **ExportFilters, CSVExportData, MonthlyReport** : Non utilisés
- **RepasExportData, EntrainementExportData, MesureExportData** : Non utilisés
- **ExportTemplate, UserExportPreferences** : Non utilisés
- **ChartData** (types/export.ts) : Duplicat

### 🔍 Exports à VÉRIFIER
- **BadgeDefinition, BADGE_DEFINITIONS** : Utilisation à vérifier
- **ChallengeAuditor** : Utilisation à vérifier
- **GarminParser, GarminActivity** : Utilisation à vérifier
- **tailwind.config.ts default** : Utilisation à vérifier
- **middleware.ts exports** : Utilisation à vérifier

---

## 🎯 RÉSULTATS ATTENDUS

### Métriques Cibles
- **Exports supprimés** : 15-20 exports non utilisés
- **Bundle size** : -23KB (estimation)
- **Build time** : -2-3s (estimation)
- **Maintenance** : Code plus propre et maintenable

### Validation
- ✅ **Tests** : Tous les tests passent
- ✅ **Build** : Build réussi
- ✅ **Lint** : 0 erreur ESLint
- ✅ **TypeScript** : 0 erreur TypeScript

---

## 🚀 PROCHAINES ÉTAPES

1. **Phase 3.1** : Supprimer exports critiques non utilisés
2. **Phase 3.2** : Nettoyer types dupliqués et non utilisés
3. **Phase 3.3** : Vérifier exports restants
4. **Validation** : Tests + Build + Lint
5. **Documentation** : Mettre à jour IMPLEMENTATION_LOG.md

---

**Approche minutieuse garantie** : Chaque export sera vérifié manuellement avant suppression ! 🔍
