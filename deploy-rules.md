# 🔐 Déploiement des Règles Firebase

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