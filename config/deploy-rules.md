# 🔐 Déploiement Firebase - Règles & Configuration

## 🚨 PROBLÈME CRITIQUE : Variables d'environnement manquantes en production

### ❌ Symptômes
```javascript
Firebase configuration error: Missing environment variables: (7) ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId']
```

### ✅ Solution : Configuration des variables d'environnement

#### Sur Vercel
```bash
# Aller dans votre projet Vercel → Settings → Environment Variables
# Ajouter ces 7 variables :
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBe176JrNl_R0NmUAFkhCISThnFUUgt8U4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=supernovafit-a6fe7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=supernovafit-a6fe7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=supernovafit-a6fe7.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=261698689691
NEXT_PUBLIC_FIREBASE_APP_ID=1:261698689691:web:edc7a7135d94a8250c443e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-RV0RK8JWN4
```

#### Sur Netlify
```bash
# Site settings → Environment variables → Add variable
# Répéter pour chaque variable ci-dessus
```

#### Sur autres plateformes
Consultez la documentation de votre plateforme pour configurer les variables d'environnement.

### 🔧 Correction appliquée dans le code
Le fichier `src/lib/firebase.ts` a été mis à jour avec une meilleure gestion d'erreur et validation.

## 📋 Étapes pour déployer les règles de sécurité

### 🔥 Firestore Rules
```bash
# Se connecter à Firebase (si pas déjà fait)
firebase login

# Déployer uniquement les règles Firestore
firebase deploy --only firestore:rules
```

### ☁️ Storage Rules  
```bash
# Déployer uniquement les règles Storage
firebase deploy --only storage
```

### 🚀 Déployer tout
```bash
# Déployer Firestore + Storage en une commande
firebase deploy --only firestore:rules,storage
```

## ⚠️ Règles mises en place

### 📁 **Storage (photos_progression/)**
- ✅ **Lecture** : Propriétaire du fichier uniquement
- ✅ **Écriture** : Propriétaire + validation (image, max 5MB)
- ✅ **Suppression** : Propriétaire uniquement

### 🗄️ **Firestore (photos_progression)**
- ✅ **Lecture** : Propriétaire ou Coach
- ✅ **Création** : Propriétaire uniquement  
- ✅ **Modification** : Propriétaire uniquement
- ✅ **Suppression** : Propriétaire uniquement

### 🌟 **Firestore (favoris_aliments)**
- ✅ **Lecture** : Propriétaire uniquement
- ✅ **Création** : Propriétaire uniquement
- ✅ **Suppression** : Propriétaire uniquement

## 🔧 En cas d'erreur

Si vous obtenez l'erreur `storage/unauthorized`, c'est que les règles Storage ne sont pas encore déployées.

**Solution rapide** :
1. Ouvrir [Firebase Console](https://console.firebase.google.com)
2. Aller dans **Storage** → **Rules**
3. Copier-coller le contenu de `storage.rules`
4. Cliquer **Publier**