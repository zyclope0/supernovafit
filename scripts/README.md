# 🔧 Scripts SuperNovaFit

## 📋 Scripts Actifs

### Population des données de test

Le script `populate-test-data.ts` crée un historique cohérent et réaliste pour l'utilisateur de test basé sur une transformation réelle :

### 🎯 Profil

- **Poids départ** : 99kg (31.07.2024)
- **Poids actuel** : 89kg (20.10.2024)
- **Perte totale** : -10kg en 81 jours (~0.88kg/semaine)
- **Taille** : 178cm
- **Activité** : 3-4 entraînements/semaine (mix endurance + musculation)

### 🍽️ Régimes alimentaires

#### Ancien régime (jusqu'au 29.09.2024)

Régime strict faible en glucides :

- **Matin** : Banane + Flocons d'avoine 50g + Séré maigre 250g
- **9h** : Fromage 60g
- **12h** : Viande/poisson 120g + Légumes
- **16h** : Charcuterie 60g
- **20h** : Viande/poisson 120g + Légumes
- **22h** : Séré maigre 250g + Fruits 150g

#### Nouveau régime (depuis le 29.09.2024)

Réintroduction progressive des glucides complexes :

- **Matin** : Pain 50g + Beurre + Confiture
- **9h** : Viande séchée 50g
- **12h** : Viande/poisson 140g + Légumes
- **16h** : Oléagineux 30g
- **20h** : Pommes de terre 200g + Viande/poisson 120g + Légumes
- **22h** : Chocolat noir 4 carrés

### 🏋️ Entraînements

4 types d'entraînements variés :

1. **Course à pied** (45min, ~450 kcal)
2. **Full body musculation** (60min, ~350 kcal)
3. **Vélo** (50min, ~400 kcal)
4. **Haut du corps** (55min, ~320 kcal)

Répartition : 3-4 séances/semaine (lundi, mercredi, vendredi, samedi)

### 📊 Données créées

- **~27 mesures** : Progression 99kg → 89kg avec IMC, masse grasse, tour de taille
- **~486 repas** : 6 repas/jour pendant 81 jours (ancien + nouveau régime)
- **~40 entraînements** : Mix cardio/musculation
- **~60 entrées journal** : Humeur, énergie, sommeil, stress (progression positive)
- **6 commentaires coach** : Encouragements et conseils
- **1 plan diète coach** : Plan après changement de régime

## 🚀 Utilisation

### Prérequis

1. Fichier `firebase-service-account.json` dans le dossier racine
2. Variables d'environnement configurées dans `.env.local`

### Exécution

```bash
# Installation des dépendances (si besoin)
npm install firebase-admin ts-node

# Exécution du script
node scripts/run-populate.js
```

### ⚠️ Important

Avant d'exécuter, **modifier les IDs** dans `populate-test-data.ts` :

```typescript
const TEST_USER_ID = "test-user-id"; // Remplacer par l'ID réel
const COACH_ID = "test-coach-id"; // Remplacer par l'ID coach réel
```

Pour trouver les IDs :

1. Aller dans Firebase Console → Firestore
2. Collection `users`
3. Copier les IDs des documents

## 🧹 Nettoyage

Le script nettoie automatiquement les anciennes données **sans supprimer** :

- Les utilisateurs (collection `users`)
- Les profils utilisateurs

Collections nettoyées :

- `repas`
- `entrainements`
- `mesures`
- `journal`
- `coach_comments`
- `coach_diet_plans`
- `challenges`
- `badges`
- `objectifs`

## 📈 Résultat attendu

Après exécution, l'utilisateur de test aura :

- Un historique complet de transformation sur 81 jours
- Une progression cohérente et réaliste
- Des données variées pour tester toutes les fonctionnalités
- Un exemple parfait pour les démos et tests

## 🐛 Troubleshooting

### Erreur "firebase-service-account.json not found"

Télécharger la clé de compte de service depuis Firebase Console :

1. Project Settings → Service Accounts
2. Generate New Private Key
3. Renommer le fichier en `firebase-service-account.json`
4. Placer à la racine du projet

### Erreur "Permission denied"

Vérifier les règles Firestore et les permissions du compte de service.

### Script trop lent

C'est normal ! La création de ~600 documents prend plusieurs minutes.
Le script affiche la progression en temps réel.

---

## 📦 Scripts Archivés

Les scripts suivants ont été archivés dans `scripts/archive/` car ils ont rempli leur rôle:

- ✅ `generate-tests.js` - Génération initiale tests (complété)
- ✅ `standardize-tests.js` - Standardisation tests (complété)
- ✅ `validate-tests.js` - Validation tests (complété)
- ✅ `performance-budget.js` - Budget performance (one-shot)

**Note**: Ces scripts sont conservés pour référence historique mais ne sont plus nécessaires au fonctionnement du projet.
