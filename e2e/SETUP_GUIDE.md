# 🔧 Guide de Setup Tests E2E - SuperNovaFit

## 📋 Prérequis

Avant de lancer les tests E2E, vous devez créer des utilisateurs de test dans Firebase.

---

## 🔥 Étape 1 : Créer les Utilisateurs Firebase de Test

### 1.1 Accéder à Firebase Console

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner le projet **SuperNovaFit** (`supernovafit-a6fe7`)
3. Aller dans **Authentication** → **Users**

### 1.2 Créer l'Utilisateur Sportif de Test

**Email :** `test@supernovafit.com`  
**Mot de passe :** `Test123!SuperNova`

1. Cliquer sur **Add user**
2. Remplir :
   - Email : `test@supernovafit.com`
   - Password : `Test123!SuperNova`
3. Cliquer sur **Add user**

### 1.3 Créer l'Utilisateur Coach de Test

**Email :** `coach@supernovafit.com`  
**Mot de passe :** `Coach123!SuperNova`

1. Cliquer sur **Add user**
2. Remplir :
   - Email : `coach@supernovafit.com`
   - Password : `Coach123!SuperNova`
3. Cliquer sur **Add user**

### 1.4 Créer l'Utilisateur Athlète de Test

**Email :** `athlete@supernovafit.com`  
**Mot de passe :** `Athlete123!SuperNova`

1. Cliquer sur **Add user**
2. Remplir :
   - Email : `athlete@supernovafit.com`
   - Password : `Athlete123!SuperNova`
3. Cliquer sur **Add user**

---

## 📄 Étape 2 : Créer les Documents Firestore

### 2.1 Créer le Document User pour Sportif

1. Aller dans **Firestore Database** → **users** collection
2. Cliquer sur **Add document**
3. Document ID : **Copier l'UID** de l'utilisateur `test@supernovafit.com` depuis Authentication
4. Ajouter les champs :

```json
{
  "email": "test@supernovafit.com",
  "role": "sportif",
  "displayName": "Test Sportif",
  "photoURL": "",
  "created_at": [TIMESTAMP NOW],
  "updated_at": [TIMESTAMP NOW],
  "sexe": "homme",
  "age": 30,
  "poids": 75,
  "taille": 175,
  "objectif": "maintien",
  "niveau_activite": "moderately_active"
}
```

### 2.2 Créer le Document User pour Coach

1. Document ID : **Copier l'UID** de l'utilisateur `coach@supernovafit.com`
2. Ajouter les champs :

```json
{
  "email": "coach@supernovafit.com",
  "role": "coach",
  "displayName": "Test Coach",
  "photoURL": "",
  "created_at": [TIMESTAMP NOW],
  "updated_at": [TIMESTAMP NOW],
  "sexe": "homme",
  "age": 35,
  "specialisation": "nutrition",
  "certifications": ["ISSA", "Precision Nutrition"]
}
```

### 2.3 Créer le Document User pour Athlète

1. Document ID : **Copier l'UID** de l'utilisateur `athlete@supernovafit.com`
2. Ajouter les champs :

```json
{
  "email": "athlete@supernovafit.com",
  "role": "sportif",
  "displayName": "Test Athlete",
  "photoURL": "",
  "created_at": [TIMESTAMP NOW],
  "updated_at": [TIMESTAMP NOW],
  "sexe": "femme",
  "age": 25,
  "poids": 60,
  "taille": 165,
  "objectif": "perte_poids",
  "niveau_activite": "very_active",
  "ownerCoachId": "" // À remplir avec UID du coach après tests
}
```

---

## 🔐 Étape 3 : Configurer .env.test Local

Créer le fichier `.env.test` à la racine du projet :

```bash
# Variables d'environnement pour tests E2E Playwright
# NE PAS committer ce fichier !

# URL de test (local)
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000

# Credentials utilisateur sportif
TEST_USER_EMAIL=test@supernovafit.com
TEST_USER_PASSWORD=Test123!SuperNova

# Credentials coach
TEST_COACH_EMAIL=coach@supernovafit.com
TEST_COACH_PASSWORD=Coach123!SuperNova

# Credentials athlete
TEST_ATHLETE_EMAIL=athlete@supernovafit.com
TEST_ATHLETE_PASSWORD=Athlete123!SuperNova
```

**⚠️ IMPORTANT :** Ce fichier est déjà dans `.gitignore`, ne jamais le committer !

---

## ✅ Étape 4 : Valider le Setup

### 4.1 Démarrer le Serveur de Dev

```bash
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:3000`

### 4.2 Lancer les Tests E2E en Mode UI

```bash
npm run test:e2e:ui
```

Cela ouvrira l'interface Playwright où vous pouvez :

- Voir la liste des 10 tests auth
- Lancer les tests un par un
- Voir les résultats en temps réel

### 4.3 Vérifier que les Tests Passent

Les 10 tests devraient passer :

- ✅ Redirection si non authentifié
- ✅ Erreur sur credentials invalides
- ✅ Login valide avec redirect
- ✅ Session persistante après reload
- ✅ Logout fonctionnel
- ✅ Protection /diete
- ✅ Protection /entrainements
- ✅ Protection /mesures
- ✅ Protection /journal

### 4.4 En Cas d'Échec

Si des tests échouent :

1. **Vérifier les credentials** dans `.env.test`
2. **Vérifier les utilisateurs Firebase** existent et ont les bons mots de passe
3. **Vérifier les documents Firestore** existent avec les bons UIDs
4. **Lancer en mode debug** :
   ```bash
   npm run test:e2e:debug
   ```

---

## 🎯 Tests Supplémentaires Manuels

### Test 1 : Login Manuel

1. Aller sur `http://localhost:3000`
2. Devrait rediriger vers `/auth`
3. Se connecter avec `test@supernovafit.com` / `Test123!SuperNova`
4. Devrait rediriger vers `/dashboard`
5. Recharger la page → devrait rester sur `/dashboard`

### Test 2 : Login Coach

1. Se déconnecter
2. Se connecter avec `coach@supernovafit.com` / `Coach123!SuperNova`
3. Vérifier que l'interface coach s'affiche

### Test 3 : Protection Routes

1. Se déconnecter
2. Essayer d'accéder directement à :
   - `http://localhost:3000/diete` → devrait rediriger vers `/auth`
   - `http://localhost:3000/entrainements` → devrait rediriger vers `/auth`
   - `http://localhost:3000/mesures` → devrait rediriger vers `/auth`

---

## 📊 Checklist de Validation

- [ ] 3 utilisateurs Firebase créés (test, coach, athlete)
- [ ] 3 documents Firestore créés avec bons UIDs
- [ ] Fichier `.env.test` créé et configuré
- [ ] Serveur dev démarre sans erreur
- [ ] Login manuel fonctionne avec test@supernovafit.com
- [ ] Login manuel fonctionne avec coach@supernovafit.com
- [ ] 10 tests E2E passent en mode UI
- [ ] Protection des routes fonctionne

---

## 🚨 Dépannage

### Problème : "Cannot find module .env.test"

**Solution :** Le fichier `.env.test` doit être à la racine du projet, pas dans `/e2e`

### Problème : "Invalid email or password"

**Solution :** Vérifier que :

1. L'utilisateur existe dans Firebase Auth
2. Le mot de passe est exactement `Test123!SuperNova` (sensible à la casse)
3. Les credentials dans `.env.test` sont corrects

### Problème : "Permission denied" sur Firestore

**Solution :** Vérifier que :

1. Le document user existe dans Firestore avec le bon UID
2. Le champ `role` est bien défini (`sportif` ou `coach`)
3. Les Firestore Rules sont déployées

### Problème : Tests timeout

**Solution :**

1. Augmenter les timeouts dans `playwright.config.ts`
2. Vérifier que le serveur dev est bien démarré
3. Vérifier que Firebase est accessible

---

## 🎉 Prochaine Étape

Une fois que les 10 tests auth passent :
✅ **Phase 1 validée !**

On peut passer à :
🔄 **Phase 2 : Meal Tracking Tests** (15 tests, +3% coverage)

---

**SuperNovaFit v2.0.0** - Setup Guide Tests E2E 🔧✅

_Dernière mise à jour : 02.10.2025_
