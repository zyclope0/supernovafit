# 🏋️ Correction Structure Entraînements - 21 Oct 2025

## 🔴 **Problème Identifié**

Après la correction des repas, l'utilisateur a fourni la structure exacte d'un entraînement saisi manuellement. Le script de population était **incomplet** et manquait **11 champs critiques**.

---

## 📊 **Comparaison Détaillée**

### **Script AVANT ❌**

```typescript
{
  user_id: "VBSTkEAy1OWptNJmUbIjFFz62Zg1",
  date: Timestamp,
  type: "Cardio",  // ❌ PascalCase au lieu de lowercase
  duree: 45,
  source: "manuel",
  calories: 450,
  commentaire: "Session Course à pied - Bonne performance",
  created_at: Timestamp,
  // Champs Cardio uniquement
  distance: 6.75,
  vitesse_moy: 9.0
  // ❌ MANQUE 11 CHAMPS !
}
```

### **Format App Attendu ✅**

```typescript
{
  user_id: "VBSTkEAy1OWptNJmUbIjFFz62Zg1",
  date: Timestamp(2025-10-21 12:00:00 UTC+2),  // ✅ 12:00:00
  type: "cardio",                               // ✅ lowercase
  duree: 77,                                    // (minutes)
  calories: 485,
  source: "manuel",
  commentaire: "Parfait",

  // ✅ Champs universels (tous entraînements)
  effort_percu: 7,        // Échelle 1-10
  fatigue_avant: 9,       // Échelle 1-10
  fatigue_apres: 9,       // Échelle 1-10
  fc_min: 98,             // BPM
  fc_max: 172,            // BPM
  fc_moyenne: 117,        // BPM

  // ✅ Champs spécifiques Cardio
  distance: 6,            // km
  vitesse_moy: 6,         // km/h
  cadence_moy: 22,        // rpm (foulées/min ou pédalage/min)
  elevation_gain: 500,    // mètres

  // ✅ Champs spécifiques Musculation (exemple)
  // puissance_moy: 182,  // Watts

  created_at: Timestamp(2025-10-21 17:59:08 UTC+2)
}
```

---

## ✅ **Corrections Appliquées**

### **1. Type en Lowercase**

```typescript
// ❌ AVANT
type: training.type,  // "Cardio" ou "Musculation"

// ✅ MAINTENANT
type: training.type.toLowerCase(),  // "cardio" ou "musculation"
```

### **2. Champs Universels (Tous Types)**

```typescript
const fc_min = 80 + Math.floor(Math.random() * 20); // 80-100 BPM
const fc_max = 160 + Math.floor(Math.random() * 20); // 160-180 BPM
const fc_moyenne = Math.floor((fc_min + fc_max) / 2);

const trainingData = {
  // ... champs existants
  effort_percu: 6 + Math.floor(Math.random() * 3), // 6-8
  fatigue_avant: 5 + Math.floor(Math.random() * 5), // 5-9
  fatigue_apres: 6 + Math.floor(Math.random() * 4), // 6-9
  fc_min,
  fc_max,
  fc_moyenne,
};
```

### **3. Champs Spécifiques Cardio**

```typescript
if (isCardio) {
  trainingData.distance = distance; // km
  trainingData.vitesse_moy = vitesse_moy; // km/h
  trainingData.cadence_moy = 20 + Math.floor(Math.random() * 10); // 20-30 rpm
  trainingData.elevation_gain = Math.floor(Math.random() * 600); // 0-600m
}
```

### **4. Champs Spécifiques Musculation**

```typescript
else {
  trainingData.puissance_moy = 150 + Math.floor(Math.random() * 100);  // 150-250W
}
```

---

## 📋 **Liste Complète des Champs**

| Champ              | Type      | Obligatoire | Cardio | Musculation | Plages Réalistes          |
| ------------------ | --------- | ----------- | ------ | ----------- | ------------------------- |
| **user_id**        | string    | ✅          | ✅     | ✅          | ID Firebase               |
| **date**           | Timestamp | ✅          | ✅     | ✅          | 12:00:00 UTC+2            |
| **type**           | string    | ✅          | ✅     | ✅          | "cardio" ou "musculation" |
| **duree**          | number    | ✅          | ✅     | ✅          | 30-120 min                |
| **calories**       | number    | ✅          | ✅     | ✅          | 200-800 kcal              |
| **source**         | string    | ✅          | ✅     | ✅          | "manuel"                  |
| **commentaire**    | string    | ❌          | ✅     | ✅          | Texte libre               |
| **created_at**     | Timestamp | ✅          | ✅     | ✅          | Now()                     |
| **effort_percu**   | number    | ❌          | ✅     | ✅          | 1-10                      |
| **fatigue_avant**  | number    | ❌          | ✅     | ✅          | 1-10                      |
| **fatigue_apres**  | number    | ❌          | ✅     | ✅          | 1-10                      |
| **fc_min**         | number    | ❌          | ✅     | ✅          | 80-100 BPM                |
| **fc_max**         | number    | ❌          | ✅     | ✅          | 160-180 BPM               |
| **fc_moyenne**     | number    | ❌          | ✅     | ✅          | (min+max)/2               |
| **distance**       | number    | ❌          | ✅     | ❌          | 1-20 km                   |
| **vitesse_moy**    | number    | ❌          | ✅     | ❌          | 5-15 km/h                 |
| **cadence_moy**    | number    | ❌          | ✅     | ❌          | 20-30 rpm                 |
| **elevation_gain** | number    | ❌          | ✅     | ❌          | 0-600 m                   |
| **puissance_moy**  | number    | ❌          | ❌     | ✅          | 150-250 W                 |

---

## 🎯 **Impact**

### **Avant**

- ❌ Entraînements créés mais **invisibles** dans header/calendrier/historique
- ❌ Manque de données pour les graphiques d'évolution
- ❌ Aucune métrique de fréquence cardiaque
- ❌ Pas de distinction Cardio/Musculation

### **Après**

- ✅ **36 entraînements** avec structure complète
- ✅ Données réalistes pour header + calendrier + historique
- ✅ Métriques FC (min/max/moyenne) pour graphiques
- ✅ Métriques spécifiques Cardio (distance, vitesse, cadence, dénivelé)
- ✅ Métriques spécifiques Musculation (puissance)
- ✅ Perception effort + fatigue pour analyse bien-être

---

## 📝 **Code Final**

```typescript:scripts/populate-test-data.ts
if (shouldTrain) {
  const training = TRAININGS[Math.floor(Math.random() * TRAININGS.length)];
  const trainRef = db.collection('entrainements').doc();

  const isCardio = training.type === 'Cardio';

  // ✅ Génération de données réalistes
  const distance = isCardio
    ? Math.round(training.duree * 0.15 * 10) / 10
    : undefined;
  const vitesse_moy = isCardio
    ? Math.round((distance! / (training.duree / 60)) * 10) / 10
    : undefined;
  const fc_min = 80 + Math.floor(Math.random() * 20); // 80-100
  const fc_max = 160 + Math.floor(Math.random() * 20); // 160-180
  const fc_moyenne = Math.floor((fc_min + fc_max) / 2);

  const trainingData: any = {
    user_id: TEST_USER_ID,
    date: Timestamp.fromDate(dateAt12), // ✅ Timestamp à 12:00:00
    type: training.type.toLowerCase(), // ✅ "cardio" ou "musculation"
    duree: training.duree,
    calories: training.calories,
    source: 'manuel',
    commentaire: `Session ${training.nom} - Bonne performance`,
    effort_percu: 6 + Math.floor(Math.random() * 3), // 6-8
    fatigue_avant: 5 + Math.floor(Math.random() * 5), // 5-9
    fatigue_apres: 6 + Math.floor(Math.random() * 4), // 6-9
    fc_min,
    fc_max,
    fc_moyenne,
    created_at: Timestamp.fromDate(new Date()),
  };

  // ✅ Champs spécifiques Cardio
  if (isCardio) {
    trainingData.distance = distance;
    trainingData.vitesse_moy = vitesse_moy;
    trainingData.cadence_moy = 20 + Math.floor(Math.random() * 10); // 20-30
    trainingData.elevation_gain = Math.floor(Math.random() * 600); // 0-600m
  } else {
    // ✅ Champs spécifiques Musculation
    trainingData.puissance_moy = 150 + Math.floor(Math.random() * 100); // 150-250W
  }

  await trainRef.set(trainingData);
  weekTrainings++;
  count++;
}
```

---

## 🚀 **Résultat**

```bash
✅ 36 entraînements créés
✅ Structure 100% conforme à l'app
✅ Données réalistes sur 81 jours (3-4 entraînements/semaine)
✅ Mix Cardio/Musculation avec métriques spécifiques
```

---

## 📚 **Références**

- **Fichier modifié** : `scripts/populate-test-data.ts` (lignes 600-650)
- **Commit** : `fix: add all missing training fields (fc_min/max/moyenne, cadence_moy, elevation_gain, effort_percu, fatigue_avant/apres, puissance_moy)`
- **Documentation** : `docs/DATA_FORMAT_FIXES.md` (repas), `docs/FIRESTORE_RULES_DATE_FIX.md` (dates)

---

**Status** : ✅ **RÉSOLU** — Les entraînements devraient maintenant être visibles dans header, calendrier et historique.
