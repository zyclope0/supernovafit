# 🎯 GitHub Issues à Créer - SuperNovaFit

**Source**: Audit TODO/FIXME cleanup (docs/reports/TODO_CLEANUP_AUDIT.md)  
**Date**: 29 Octobre 2025

---

## 📋 Liste des 7 Issues Recommandées

### Issue #1: Mode Coach - Programmes Entraînement 🏋️

**Titre**: `[Feature] Mode Coach - Création et assignation programmes entraînement`

**Description**:

```
Permettre aux coaches de créer des programmes d'entraînement personnalisés et les assigner à leurs athlètes.

**Fonctionnalités**:
- Création templates programmes
- Assignation athlètes
- Suivi progression
- Historique programmes

**Fichiers concernés**:
- app/coach/athlete/[id]/page.tsx

**Priorité**: Medium
```

**Labels**: `enhancement`, `coach-mode`, `feature`

---

### Issue #2: Mode Coach - Rapports PDF/Excel 📊

**Titre**: `[Feature] Mode Coach - Génération rapports PDF/Excel pour athlètes`

**Description**:

```
Générer des rapports détaillés d'analyse pour les athlètes au format PDF ou Excel.

**Fonctionnalités**:
- Export PDF complet (stats + graphiques)
- Export Excel (données brutes)
- Templates personnalisables
- Envoi par email

**Fichiers concernés**:
- app/coach/athlete/[id]/page.tsx

**Priorité**: Medium
```

**Labels**: `enhancement`, `coach-mode`, `export`

---

### Issue #3: Galerie Photos Progression 📸

**Titre**: `[Feature] Galerie photos de progression athlète`

**Description**:

```
Interface dédiée pour visualiser et comparer toutes les photos de progression d'un athlète.

**Fonctionnalités**:
- Galerie chronologique
- Comparaison avant/après
- Annotations coach
- Filtres par période

**Fichiers concernés**:
- app/coach/athlete/[id]/page.tsx

**Priorité**: Low
```

**Labels**: `enhancement`, `ui`, `media`

---

### Issue #4: Journal - Intégration Données 🔗

**Titre**: `[Feature] Journal - Intégration automatique des données (repas, entraînements, mesures)`

**Description**:

```
Intégrer automatiquement les données de nutrition, entraînements et mesures dans les calculs du journal.

**Fonctionnalités**:
- Corrélation humeur/calories
- Impact entraînements sur sommeil
- Suggestions intelligentes basées sur patterns
- Graphiques croisés

**Fichiers concernés**:
- app/journal/page.tsx
- hooks/useJournal.ts

**Priorité**: High
```

**Labels**: `enhancement`, `data-integration`, `analytics`

---

### Issue #5: Templates Quick Actions ⚡

**Titre**: `[Feature] Système templates personnalisés pour Quick Actions`

**Description**:

```
Permettre aux utilisateurs de créer et utiliser des templates personnalisés pour repas et entraînements.

**Fonctionnalités**:
- Création templates repas (recettes fréquentes)
- Création templates entraînements (routines)
- Favoris/étoiles
- Catégorisation

**Fichiers concernés**:
- components/layout/MainLayout.tsx
- components/mobile/QuickMealModal.tsx
- components/mobile/QuickTrainingModal.tsx

**Priorité**: Medium
```

**Labels**: `enhancement`, `quick-actions`, `ui`

---

### Issue #6: Type Entrainement - Champ Intensité 💪

**Titre**: `[Feature] Entraînements - Ajout champ intensité (zones cardio/watts)`

**Description**:

```
Ajouter un champ intensité pour les entraînements avec zones cardio et puissance en watts.

**Fonctionnalités**:
- Zones FC (Z1-Z5)
- Puissance moyenne/max (watts)
- TSS (Training Stress Score)
- Graphiques zones temps

**Fichiers concernés**:
- types/index.ts (interface Entrainement)
- components/entrainements/*
- lib/calculations.ts

**Priorité**: Low
```

**Labels**: `enhancement`, `training`, `data-model`

---

### Issue #7: useQuickActions Refactoring 🔧

**Titre**: `[Tech] Refactoring useQuickActions - Architecture state management`

**Description**:

```
Refactoriser le hook useQuickActions pour améliorer la maintenabilité et réduire la complexité.

**Améliorations**:
- Séparer concerns (modals, templates, actions)
- Utiliser Context API au lieu de props drilling
- Réduire taille hook (actuellement 200+ LOC)
- Améliorer testabilité

**Fichiers concernés**:
- hooks/useQuickActions.ts (8 TODOs actuels)
- components/layout/MainLayout.tsx

**Priorité**: Medium
**Dette Technique**: Yes
```

**Labels**: `refactoring`, `tech-debt`, `architecture`

---

## 🚀 Comment Créer les Issues

### Méthode 1: Via GitHub Web

1. Va sur https://github.com/TON_USERNAME/SuperNovaFit/issues/new
2. Copie-colle le titre et la description
3. Ajoute les labels
4. Soumets!

### Méthode 2: Via GitHub CLI

```bash
# Issue #1
gh issue create --title "[Feature] Mode Coach - Programmes Entraînement" \
  --body "$(cat issue1.md)" \
  --label "enhancement,coach-mode,feature"

# Issue #2
gh issue create --title "[Feature] Mode Coach - Rapports PDF/Excel" \
  --body "$(cat issue2.md)" \
  --label "enhancement,coach-mode,export"

# ... etc pour les 5 autres
```

---

## 📊 Récapitulatif

| Issue                         | Priorité | Effort Estimé | Impact             |
| ----------------------------- | -------- | ------------- | ------------------ |
| #1 - Coach Programmes         | Medium   | 3-5j          | High               |
| #2 - Coach Rapports           | Medium   | 2-3j          | Medium             |
| #3 - Galerie Photos           | Low      | 1-2j          | Low                |
| #4 - Journal Integration      | **High** | 3-4j          | **High**           |
| #5 - Templates Quick Actions  | Medium   | 2-3j          | Medium             |
| #6 - Intensité Training       | Low      | 1-2j          | Low                |
| #7 - useQuickActions Refactor | Medium   | 1-2j          | Medium (tech debt) |

**Total Effort**: ~13-21 jours de développement

---

**Note**: Ces issues ne sont **pas bloquantes** pour la production actuelle (Score 9.5/10).  
Ce sont des **améliorations futures** à implémenter selon les priorités business.
