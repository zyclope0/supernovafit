# 📊 Guide de Population des Données de Test

## 🎯 Vue d'ensemble

J'ai créé un script complet qui va nettoyer et peupler la base de données avec **tes données réelles** :

- **Transformation** : 99kg → 89kg
- **Période** : 31.07.2024 → 20.10.2024 (81 jours)
- **Perte** : -10kg en ~3 mois
- **Activité** : 3-4 entraînements/semaine

## 📝 Étapes à Suivre

### 1. Prérequis

Tu as besoin de :

- ✅ Fichier `firebase-service-account.json` (clé admin Firebase)
- ✅ IDs de l'utilisateur de test et du coach

#### Obtenir la clé Firebase Admin

1. Va sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionne ton projet `supernovafit-a6fe7`
3. ⚙️ Project Settings → Service Accounts
4. **Generate New Private Key**
5. Télécharge le fichier JSON
6. Renomme-le en `firebase-service-account.json`
7. Place-le à la **racine du projet** (même niveau que `package.json`)

⚠️ **Important** : Ce fichier contient des clés sensibles, il est dans `.gitignore` et ne sera pas commité.

#### Trouver les IDs utilisateurs

1. Va sur Firebase Console → Firestore Database
2. Collection `users`
3. Note les IDs des documents :
   - ID utilisateur de test (sportif)
   - ID coach de test

### 2. Configuration

Ouvre le fichier `scripts/populate-test-data.ts` et modifie les lignes 27-28 :

```typescript
// Avant
const TEST_USER_ID = "test-user-id"; // À remplacer
const COACH_ID = "test-coach-id"; // À remplacer

// Après (avec tes vrais IDs)
const TEST_USER_ID = "TON_ID_USER_REEL";
const COACH_ID = "TON_ID_COACH_REEL";
```

### 3. Exécution

```bash
# Dans le terminal, à la racine du projet
node scripts/run-populate.js
```

Le script va :

1. 🧹 Nettoyer les anciennes données (sauf users)
2. 📏 Créer 27 mesures de progression
3. 🍽️ Créer 486 repas (2 régimes)
4. 🏋️ Créer ~40 entraînements
5. 📓 Créer ~60 entrées journal
6. 💬 Créer 6 commentaires coach
7. 📋 Créer 1 plan diète coach

⏱️ **Durée** : 2-3 minutes

## 📊 Données Créées

### Mesures (~27)

Progression réaliste :

- **31.07** : 99kg, IMC 31.3, 28% masse grasse
- **20.10** : 89kg, IMC 28.1, 18% masse grasse
- Mesures tous les 3-4 jours avec légères variations

### Régimes Alimentaires

#### Ancien régime (31.07 → 29.09)

Strict faible en glucides :

```
Matin (7h30):
  - Banane 1 unité
  - Flocons d'avoine 50g
  - Séré maigre 250g

Collation (9h):
  - Fromage 60g

Midi (12h):
  - Viande/poisson 120g
  - Légumes à volonté

Collation (16h):
  - Charcuterie 60g

Soir (20h):
  - Viande/poisson 120g
  - Légumes à volonté

Collation (22h):
  - Séré maigre 250g
  - Fruits 150g
```

#### Nouveau régime (29.09 → 20.10)

Réintroduction glucides :

```
Matin:
  - Pain 50g + Beurre + Confiture

Collation (9h):
  - Viande séchée 50g

Midi:
  - Viande/poisson 140g
  - Légumes à volonté

Collation (16h):
  - Oléagineux 30g (amandes, noix)

Soir:
  - Pommes de terre 200g
  - Viande/poisson 120g
  - Légumes à volonté

Collation (22h):
  - Chocolat noir 4 carrés
```

### Entraînements (~40)

4 types variés, 3-4 séances/semaine :

1. **Course à pied** (45min, ~450 kcal)
2. **Full body musculation** (60min, ~350 kcal)
3. **Vélo** (50min, ~400 kcal)
4. **Haut du corps** (55min, ~320 kcal)

### Journal (~60 entrées)

Progression émotionnelle :

- **Humeur** : 5/10 → 8/10
- **Énergie** : 5/10 → 8/10
- **Sommeil** : 6h → 7.5h
- **Stress** : 5/10 → 2/10

### Commentaires Coach (6)

Encouragements contextuels répartis sur la période :

- Validation routine alimentaire
- Encouragement rythme entraînement
- Félicitations progression
- Validation changement régime

### Plan Diète Coach (1)

Plan personnalisé créé le 29.09 avec le nouveau régime et rationale nutritionnelle.

## 🔒 Sécurité

### Ce qui est supprimé

❌ Anciennes données de l'utilisateur de test dans :

- `repas`
- `entrainements`
- `mesures`
- `journal`
- `coach_comments`
- `coach_diet_plans`
- `challenges`
- `badges`
- `objectifs`

### Ce qui est préservé

✅ **JAMAIS supprimé** :

- Collection `users` (comptes)
- Profils utilisateurs
- Données des autres utilisateurs

## 🐛 Dépannage

### Erreur "firebase-service-account.json not found"

➡️ Télécharge la clé depuis Firebase Console (voir étape 1)

### Erreur "Permission denied"

➡️ Vérifie que le compte de service a les droits nécessaires :

- Cloud Firestore → Lecture/Écriture
- Dans Firebase Console → IAM

### Script trop lent

➡️ C'est normal ! Création de ~600 documents prend 2-3 minutes.

### Erreur "TEST_USER_ID not found"

➡️ Vérifie que tu as bien modifié les IDs dans `populate-test-data.ts`

## ✅ Vérification

Après exécution, vérifie dans Firebase Console :

1. **Firestore** → Collection `mesures` → Filtre `user_id == TON_ID`
   - Tu devrais voir ~27 documents
2. **Collection `repas`**
   - Tu devrais voir ~486 documents
3. **Collection `entrainements`**
   - Tu devrais voir ~40 documents

## 📚 Documentation Complète

- **Script** : `scripts/populate-test-data.ts`
- **README scripts** : `scripts/README.md`
- **Doc technique** : `docs/technical/OPT-7_TEST_DATA_POPULATION.md`

## 💡 Utilisation

Une fois les données créées, tu pourras :

- ✅ Tester toutes les features avec des données réalistes
- ✅ Faire des démos impressionnantes
- ✅ Valider les algorithmes de calcul
- ✅ Former de nouveaux développeurs

## 🔄 Ré-exécution

Tu peux ré-exécuter le script autant de fois que tu veux :

- Il nettoie automatiquement avant de re-créer
- Données toujours cohérentes et identiques

---

**Besoin d'aide ?** Consulte `scripts/README.md` pour plus de détails ! 🚀
