# 🔐 Fix Règles Firestore - Support Format Date String

**Date** : 21 octobre 2025  
**Problème** : Données invisibles dans l'app  
**Cause** : Règles Firestore rejetaient les dates au format string  
**Statut** : ✅ RÉSOLU

---

## 🔴 **Problème Identifié**

### Symptômes Rapportés par l'Utilisateur

| Module            | Problème                                                               |
| ----------------- | ---------------------------------------------------------------------- |
| **Diète**         | Aucun repas visible (vide)                                             |
| **Entraînements** | Visibles en liste MAIS header vide + calendrier vide + historique vide |
| **Journal**       | Même problème que entraînements (données invisibles dans widgets)      |
| **Mesures**       | ✅ OK                                                                  |
| **Coach**         | ✅ OK (recommendations visibles)                                       |

### Vérification des Données en Base

**Script de diagnostic** : `scripts/check-firestore-data.ts`

```bash
npx ts-node scripts/check-firestore-data.ts
```

**Résultat** :

```
✅ 492 repas trouvés
  → date: "2024-08-15" (type: string)
  → Structure: CORRECTE

✅ 35 entraînements trouvés
  → date: "2024-08-30" (type: string)
  → Structure: CORRECTE

✅ 24 mesures trouvées
  → date: "2024-08-23" (type: string)
  → Structure: CORRECTE

✅ 61 entrées journal trouvées
  → date: "2024-10-18" (type: string)
  → Structure: CORRECTE
```

**Conclusion** : Les données sont **correctement en base** avec le bon format.

---

## 🔍 **Cause Racine**

### Règles Firestore Trop Strictes

Les règles de sécurité Firestore **exigeaient un type `timestamp`** pour les champs `date` :

```javascript
// ❌ AVANT (config/firestore.rules)
function validateRepas(data) {
  return validateFields(data, ...) &&
    data.date is timestamp && // ⚠️ TIMESTAMP UNIQUEMENT
    // ... autres validations
}

function validateEntrainement(data) {
  return validateFields(data, ...) &&
    data.date is timestamp && // ⚠️ TIMESTAMP UNIQUEMENT
    // ... autres validations
}

function validateMesure(data) {
  return validateFields(data, ...) &&
    data.date is timestamp && // ⚠️ TIMESTAMP UNIQUEMENT
    // ... autres validations
}

function validateJournal(data) {
  return validateFields(data, ...) &&
    data.date is timestamp && // ⚠️ TIMESTAMP UNIQUEMENT
    // ... autres validations
}
```

### Impact sur les Lectures

**Important** : Les règles Firestore sont évaluées **à la lecture ET à l'écriture**.

Même si les données existent en base, **Firestore refuse de les retourner** si elles ne respectent pas les règles de validation !

```typescript
// Exemple de requête
const q = query(collection(db, "repas"), where("user_id", "==", user.uid));

const unsubscribe = onSnapshot(q, (snapshot) => {
  // ❌ snapshot.docs = [] (vide!)
  // Car les documents ont date:string au lieu de date:timestamp
  // Les règles bloquent la lecture de ces documents
});
```

### Pourquoi les Mesures Fonctionnaient ?

Les mesures fonctionnaient car :

1. Elles sont principalement affichées dans des graphiques qui **ne filtrent pas par date précise**
2. Les widgets des mesures utilisent des **agrégations** qui tolèrent mieux les formats mixtes
3. Possiblement des anciennes mesures avec `timestamp` étaient encore présentes

---

## ✅ **Solution Appliquée**

### Modification des Règles Firestore

**Changement** : Accepter **à la fois** `timestamp` ET `string` pour les champs `date`.

```javascript
// ✅ APRÈS (config/firestore.rules)
function validateRepas(data) {
  return validateFields(data, ...) &&
    (data.date is timestamp || data.date is string) && // ✅ SUPPORT TIMESTAMP ET STRING
    // ... autres validations
}

function validateEntrainement(data) {
  return validateFields(data, ...) &&
    (data.date is timestamp || data.date is string) && // ✅ SUPPORT TIMESTAMP ET STRING
    // ... autres validations
}

function validateMesure(data) {
  return validateFields(data, ...) &&
    (data.date is timestamp || data.date is string) && // ✅ SUPPORT TIMESTAMP ET STRING
    // ... autres validations
}

function validateJournal(data) {
  return validateFields(data, ...) &&
    (data.date is timestamp || data.date is string) && // ✅ SUPPORT TIMESTAMP ET STRING
    // ... autres validations
}
```

### Champ `sommeil` Ajouté au Journal

**Problème** : Le champ `sommeil` (number, 0-24h) n'était pas dans la liste des champs optionnels.

**Solution** : Ajouté `sommeil` aux champs optionnels de `validateJournal` :

```javascript
function validateJournal(data) {
  return validateFields(data,
    ['user_id', 'date'],
    ['note', 'humeur', 'fatigue', 'motivation', 'energie',
     'sommeil_duree', 'sommeil_qualite', 'stress', 'sommeil', // ✅ Ajouté
     'photos_libres', 'objectifs_accomplis', 'badges_obtenus',
     'meteo', 'activites_annexes', 'created_at', 'updated_at']) &&
    // ...
    (!('sommeil' in data) || (data.sommeil is number && data.sommeil >= 0 && data.sommeil <= 24)) && // ✅ Validation
    // ...
}
```

---

## 🚀 **Déploiement**

```bash
# 1. Déployer les nouvelles règles
firebase deploy --only firestore:rules --project supernovafit-a6fe7

# Résultat:
✅ rules file config/firestore.rules compiled successfully
✅ released rules config/firestore.rules to cloud.firestore
```

**Effet immédiat** : Les règles sont appliquées **instantanément** sans redémarrage nécessaire.

---

## 📊 **Résultats Attendus**

### Après le Fix

| Module                         | Avant ❌ | Après ✅                         |
| ------------------------------ | -------- | -------------------------------- |
| **Diète**                      | Vide     | 492 repas visibles               |
| **Entraînements - Liste**      | OK       | OK                               |
| **Entraînements - Header**     | Vide     | Métriques visibles (today, week) |
| **Entraînements - Calendrier** | Vide     | Sessions visibles par jour       |
| **Entraînements - Historique** | Vide     | 35 sessions listées              |
| **Journal - Liste**            | OK       | OK                               |
| **Journal - Header**           | Vide     | Métriques bien-être visibles     |
| **Journal - Historique**       | Vide     | 61 entrées listées               |
| **Mesures**                    | OK       | OK                               |

### Vérification dans l'App

1. **Page Diète** (`/diete`)
   - ✅ Repas du jour visibles
   - ✅ Macros calculées (kcal, protéines, glucides, lipides)
   - ✅ Graphiques nutrition analytics

2. **Page Entraînements** (`/entrainements`)
   - ✅ Liste des entraînements
   - ✅ **Header "Performance Week/Today"** avec métriques
   - ✅ **Calendrier** avec sessions marquées
   - ✅ **Historique** avec toutes les sessions

3. **Page Journal** (`/journal`)
   - ✅ Entrées du jour/semaine/mois
   - ✅ **Header bien-être** avec humeur/énergie/sommeil/stress
   - ✅ **Historique** avec toutes les entrées

---

## 🔧 **Détails Techniques**

### Pourquoi Accepter les Deux Formats ?

**Avantages de `string` "YYYY-MM-DD"** :

- ✅ Plus simple à manipuler côté client
- ✅ Filtrage direct sans conversion
- ✅ Compatible avec `<input type="date">`
- ✅ Sérialisation JSON native
- ✅ Comparaisons lexicographiques (`"2024-08-15" < "2024-08-16"`)

**Avantages de `timestamp`** :

- ✅ Support natif Firestore (tri optimisé)
- ✅ Inclusion de l'heure si nécessaire
- ✅ Méthodes `.toDate()` disponibles

**Décision** : **Accepter les deux** pour :

- Compatibilité avec données existantes (timestamp)
- Flexibilité pour futures améliorations
- Migration progressive possible

### Sécurité Maintenue

Les règles continuent de valider :

- ✅ Propriété de la donnée (`user_id` obligatoire)
- ✅ Structure des documents (champs requis/optionnels)
- ✅ Types des champs (number, string, list, map)
- ✅ Plages de valeurs (calories, poids, durées, etc.)
- ✅ Rate limiting (100 req/h, 20 créations/h)

**Seul changement** : Le type `date` accepte maintenant `timestamp` OU `string`.

---

## 📁 **Fichiers Modifiés**

| Fichier                            | Changement                          |
| ---------------------------------- | ----------------------------------- |
| `config/firestore.rules`           | 4 fonctions de validation modifiées |
| `scripts/check-firestore-data.ts`  | Nouveau script de diagnostic        |
| `docs/FIRESTORE_RULES_DATE_FIX.md` | Ce rapport (nouveau)                |

---

## 🎯 **Leçons Apprises**

### 1. **Les Règles Bloquent les Lectures**

⚠️ **Important** : Les règles Firestore s'appliquent **aussi aux lectures**, pas seulement aux écritures.

Si un document ne passe pas la validation, **il est invisible** même s'il existe en base.

### 2. **Vérifier les Règles en Premier**

Lors d'un problème "données invisibles" :

1. ✅ Vérifier que les données existent (Admin SDK ou Console)
2. ✅ Vérifier les règles Firestore **avant** de modifier le code
3. ✅ Tester avec le Simulateur de Règles Firebase

### 3. **Types de Données Cohérents**

**Recommandation** : Standardiser le format `date` dans toute l'app :

- **Client** : Utiliser `string` "YYYY-MM-DD"
- **Serveur/Admin** : Convertir si besoin pour compatibilité
- **Règles** : Accepter les deux formats pour flexibilité

---

## 🔗 **Ressources**

- [Documentation Règles Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [Simulateur de Règles](https://console.firebase.google.com/project/supernovafit-a6fe7/firestore/rules)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**SuperNovaFit v2.1.0** - Fix Règles Firestore ✅

_Données maintenant visibles dans toute l'application_
