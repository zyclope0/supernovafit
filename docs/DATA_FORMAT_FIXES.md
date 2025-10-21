# 🔧 Corrections des Formats de Données - Population BDD

**Date** : 21 octobre 2025  
**Version** : 2.0  
**Statut** : ✅ Corrigé et Re-testé

---

## 🔴 Problèmes Identifiés

### 1. **REPAS - Non Visibles dans l'App**

#### Erreurs Détectées

```typescript
// ❌ AVANT (Incorrect)
{
  date: Timestamp.fromDate(date),           // Firebase Timestamp au lieu de string
  aliments: [{
    nom: "Flocons d'avoine",
    quantite: "80g",                         // String au lieu de number
    calories: 296,                            // Champs directement sur aliment
    proteines: 11,
    // MANQUANT: id, unite, macros nested
  }],
  macros: {
    calories: 1800,                           // "calories" au lieu de "kcal"
    proteines: 150,                           // "proteines" au lieu de "prot"
    glucides: 150,
    lipides: 50
  }
}
```

#### Format Attendu (Type Interface)

```typescript
interface Repas {
  id: string;
  user_id: string;
  date: string; // ✅ "YYYY-MM-DD"
  repas: MealType;
  aliments: Aliment[];
  macros: Macros;
}

interface Aliment {
  id: string; // ✅ Unique ID
  nom: string;
  quantite: number; // ✅ Nombre
  unite: string; // ✅ "g", "ml", "unité"
  macros: {
    kcal: number; // ✅ "kcal" pas "calories"
    prot: number; // ✅ "prot" pas "proteines"
    glucides: number;
    lipides: number;
  };
}

interface Macros {
  kcal: number; // ✅ "kcal" pas "calories"
  prot: number; // ✅ "prot" pas "proteines"
  glucides: number;
  lipides: number;
}
```

#### Corrections Appliquées

```typescript
// ✅ APRÈS (Correct)
{
  user_id: TEST_USER_ID,
  date: "2024-07-31",                         // ✅ String YYYY-MM-DD
  repas: "petit_dej",
  aliments: [{
    id: "1729522000-0-0",                     // ✅ ID unique
    nom: "Flocons d'avoine",
    quantite: 80,                             // ✅ Number
    unite: "g",                               // ✅ Unité séparée
    macros: {                                 // ✅ Macros nested
      kcal: 296,                              // ✅ "kcal"
      prot: 11,                               // ✅ "prot"
      glucides: 52,
      lipides: 6
    }
  }],
  macros: {
    kcal: 1800,                               // ✅ "kcal"
    prot: 150,                                // ✅ "prot"
    glucides: 150,
    lipides: 50
  },
  created_at: Timestamp.fromDate(date)
}
```

---

### 2. **ENTRAÎNEMENTS - Pas Visibles dans Performance Week/Today**

#### Erreurs Détectées

```typescript
// ❌ AVANT (Incorrect)
{
  date: Timestamp.fromDate(date),             // Firebase Timestamp au lieu de string
  type: "Cardio",
  nom: "Course à pied",                       // ❌ Champ "nom" n'existe pas
  duree: 45,
  intensite: "Modérée",                       // ❌ Champ "intensite" n'existe pas
  calories: 450,
  exercices: [...],                           // ❌ Champ "exercices" n'existe pas
  notes: "Session...",                        // ❌ "notes" au lieu de "commentaire"
  // MANQUANT: source (obligatoire!)
}
```

#### Format Attendu (Type Interface)

```typescript
interface Entrainement {
  id: string;
  user_id: string;
  date: string; // ✅ "YYYY-MM-DD"
  type: string;
  duree: number; // minutes
  commentaire?: string; // ✅ "commentaire" pas "notes"
  source: TrainingSource; // ✅ 'manuel' | 'garmin' | 'import' (OBLIGATOIRE)

  // Optionnels
  calories?: number;
  distance?: number; // km (cardio)
  vitesse_moy?: number; // km/h (cardio)
  fc_moyenne?: number;
  // ... autres champs optionnels
}
```

#### Corrections Appliquées

```typescript
// ✅ APRÈS (Correct)
{
  user_id: TEST_USER_ID,
  date: "2024-08-02",                         // ✅ String YYYY-MM-DD
  type: "Cardio",
  duree: 45,
  source: "manuel",                           // ✅ Ajouté (obligatoire)
  calories: 450,
  commentaire: "Session Course à pied - Bonne performance",  // ✅ "commentaire"
  distance: 6.8,                              // ✅ Ajouté pour cardio
  vitesse_moy: 9.1,                           // ✅ Ajouté pour cardio
  created_at: Timestamp.fromDate(date)
}
```

---

### 3. **MESURES - Format Date**

#### Corrections Appliquées

```typescript
// ❌ AVANT
{
  date: Timestamp.fromDate(date),             // Firebase Timestamp
  // ...
}

// ✅ APRÈS
{
  date: "2024-07-31",                         // ✅ String YYYY-MM-DD
  poids: 99.0,
  taille: 178,
  imc: 31.2,
  masse_grasse: 28.0,
  tour_taille: 102,
  created_at: Timestamp.fromDate(date)
}
```

---

### 4. **JOURNAL - Format Date**

#### Corrections Appliquées

```typescript
// ❌ AVANT
{
  date: Timestamp.fromDate(date),             // Firebase Timestamp
  // ...
}

// ✅ APRÈS
{
  date: "2024-08-01",                         // ✅ String YYYY-MM-DD
  humeur: 6,
  energie: 7,
  sommeil: 7,
  stress: 4,
  note: "Bonne journée, je me sens de mieux en mieux",
  created_at: Timestamp.fromDate(date)
}
```

---

## 📊 Impact des Corrections

### Avant (Données Invisibles)

| Module            | Problème                                  | Cause                                                                    |
| ----------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| **Diète**         | Aucun repas visible                       | Format date Timestamp, structure aliments incorrecte, noms champs macros |
| **Entraînements** | Visibles en liste mais pas en performance | Format date Timestamp, champ `source` manquant                           |
| **Mesures**       | Potentiellement affectées                 | Format date Timestamp                                                    |
| **Journal**       | Potentiellement affecté                   | Format date Timestamp                                                    |

### Après (Données Correctes)

| Module            | Statut                      | Documents Créés                 |
| ----------------- | --------------------------- | ------------------------------- |
| **Diète**         | ✅ Visible                  | 492 repas (6/jour × 81 jours)   |
| **Entraînements** | ✅ Visible + Performance OK | 35 entraînements (3-4/semaine)  |
| **Mesures**       | ✅ Visible                  | 24 mesures (tous les 3-4 jours) |
| **Journal**       | ✅ Visible                  | 61 entrées                      |
| **Coach**         | ✅ Visible                  | 6 commentaires + 1 plan diète   |

---

## 🔍 Détails Techniques

### Conversion des Dates

**Problème** : L'application attend des strings `YYYY-MM-DD` pour le filtrage et l'affichage.

**Solution** :

```typescript
// Conversion correcte
const dateString = date.toISOString().split("T")[0];
// Résultat: "2024-07-31"
```

### Structure Aliments (Repas)

**Problème** : L'interface `Aliment` exige une structure nested avec `macros`.

**Solution** :

```typescript
aliments: aliments.map((a, index) => ({
  id: `${Date.now()}-${count}-${index}`, // ID unique
  nom: a.nom,
  quantite: parseFloat(a.quantite.replace(/[^\d.]/g, "")), // "80g" → 80
  unite: a.quantite.match(/[a-zA-Z]+/)?.[0] || "g", // "80g" → "g"
  macros: {
    kcal: a.calories, // Nested + renommé
    prot: a.proteines, // Nested + renommé
    glucides: a.glucides,
    lipides: a.lipides,
  },
}));
```

### Entraînements - Champ `source`

**Problème** : Le champ `source` est **obligatoire** dans l'interface mais était manquant.

**Solution** :

```typescript
{
  source: 'manuel',  // Obligatoire: 'manuel' | 'garmin' | 'import'
  // ... autres champs
}
```

### Entraînements - Suppression Champs Invalides

**Champs supprimés** (non présents dans l'interface) :

- ❌ `nom` → Info intégrée dans `commentaire`
- ❌ `intensite` → Peut être ajouté dans `commentaire` ou utilisé `effort_percu`
- ❌ `exercices` → Pas de champ structuré pour ça dans l'interface actuelle

---

## ✅ Tests de Vérification

### Commande d'Exécution

```bash
node scripts/run-populate.js
```

### Résultats

```
✅ 24 mesures créées
✅ 492 repas créés
✅ 35 entraînements créés
✅ 61 entrées de journal créées
✅ 6 commentaires coach créés
✅ 1 plan diète coach créé

TOTAL: 619 documents créés avec succès
```

### Vérification Firebase Console

1. **Repas** (`repas` collection)
   - ✅ `date` : "2024-07-31" (string)
   - ✅ `aliments[0].id` : présent
   - ✅ `aliments[0].quantite` : 80 (number)
   - ✅ `aliments[0].unite` : "g"
   - ✅ `aliments[0].macros.kcal` : 296
   - ✅ `aliments[0].macros.prot` : 11
   - ✅ `macros.kcal` : 500
   - ✅ `macros.prot` : 28

2. **Entraînements** (`entrainements` collection)
   - ✅ `date` : "2024-08-02" (string)
   - ✅ `source` : "manuel"
   - ✅ `commentaire` : "Session..."
   - ✅ `distance` : 6.8 (pour cardio uniquement)
   - ✅ `vitesse_moy` : 9.1 (pour cardio uniquement)

3. **Mesures** (`mesures` collection)
   - ✅ `date` : "2024-07-31" (string)
   - ✅ `poids` : 99.0

4. **Journal** (`journal` collection)
   - ✅ `date` : "2024-08-01" (string)
   - ✅ `humeur` : 6

---

## 📁 Fichiers Modifiés

| Fichier                         | Modifications                                             |
| ------------------------------- | --------------------------------------------------------- |
| `scripts/populate-test-data.ts` | Correction formats repas, entraînements, mesures, journal |
| `docs/DATA_FORMAT_FIXES.md`     | Nouveau rapport détaillé (ce fichier)                     |

---

## 🚀 Prochaines Étapes

1. ✅ **Vérifier l'affichage dans l'app**
   - Page Diète : repas visibles avec macros correctes
   - Page Entraînements : sessions visibles en liste ET dans performance week/today
   - Page Mesures : progression visible
   - Page Journal : entrées affichées

2. ✅ **Tester les calculs dérivés**
   - Dashboard : métriques temps réel
   - Graphiques : évolution poids/calories
   - Performance : moyennes week/today

3. ⚠️ **Ajuster si besoin**
   - Si d'autres champs sont nécessaires pour l'affichage
   - Si des calculs spécifiques utilisent d'autres propriétés

---

## 🎯 Résumé des Règles à Respecter

### Dates (TOUTES les collections)

```typescript
date: string; // ✅ Format "YYYY-MM-DD"
date: dateInstance.toISOString().split("T")[0];
```

### Repas

```typescript
{
  date: "YYYY-MM-DD",                         // ✅ String
  aliments: [{
    id: string,                               // ✅ Obligatoire
    quantite: number,                         // ✅ Number
    unite: string,                            // ✅ "g", "ml"
    macros: { kcal, prot, glucides, lipides } // ✅ Nested + noms corrects
  }],
  macros: { kcal, prot, glucides, lipides }  // ✅ Noms corrects
}
```

### Entraînements

```typescript
{
  date: "YYYY-MM-DD",                         // ✅ String
  source: 'manuel' | 'garmin' | 'import',     // ✅ OBLIGATOIRE
  commentaire: string,                        // ✅ Pas "notes"
  // Supprimer: nom, intensite, exercices
}
```

---

**SuperNovaFit v2.1.0** - Données Test Correctement Formatées ✅
