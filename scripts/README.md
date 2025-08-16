# 🧪 Scripts de Test - SuperNovaFit

Ce dossier contient les scripts pour créer un environnement de test complet avec des utilisateurs et des données réalistes.

## 📁 Fichiers Disponibles

- **`setup-test-environment.js`** - Script principal (recommandé)
- **`create-test-users.js`** - Création des utilisateurs uniquement
- **`create-test-data.js`** - Création des données uniquement

## 🚀 Utilisation Rapide

### Option 1: Script Principal (Recommandé)
```bash
node scripts/setup-test-environment.js
```

Ce script fait tout automatiquement :
1. ✅ Crée 3 coachs
2. ✅ Crée 5 athlètes
3. ✅ Lie les athlètes aux coachs
4. ✅ Génère des données complètes pour chaque athlète

### Option 2: Scripts Séparés
```bash
# 1. Créer les utilisateurs
node scripts/create-test-users.js

# 2. Créer les données (après avoir créé les utilisateurs)
node scripts/create-test-data.js
```

## 👥 Utilisateurs de Test Créés

### 👨‍💼 **COACHS** (3)
| Nom | Email | Mot de passe | Âge | Profil |
|-----|-------|--------------|-----|--------|
| Thomas Martin | `coach.martin@supernovafit.com` | `Coach123!` | 35 | Performance, intense |
| Sophie Dubois | `coach.sophie@supernovafit.com` | `Coach123!` | 28 | Performance, intense |
| Alexandre Moreau | `coach.alex@supernovafit.com` | `Coach123!` | 42 | Performance, intense |

### 🏃 **ATHLÈTES** (5)
| Nom | Email | Mot de passe | Âge | Objectif | Coach |
|-----|-------|--------------|-----|----------|-------|
| Lucas Bernard | `athlete.lucas@supernovafit.com` | `Athlete123!` | 24 | Prise de masse | Thomas Martin |
| Emma Rousseau | `athlete.emma@supernovafit.com` | `Athlete123!` | 26 | Séche | Sophie Dubois |
| Maxime Leroy | `athlete.maxime@supernovafit.com` | `Athlete123!` | 31 | Maintien | Alexandre Moreau |
| Julie Mercier | `athlete.julie@supernovafit.com` | `Athlete123!` | 29 | Performance | Thomas Martin |
| Antoine Petit | `athlete.antoine@supernovafit.com` | `Athlete123!` | 22 | Prise de masse | Sophie Dubois |

## 📊 Données Générées

Pour chaque athlète, le script crée :

### 🍽️ **Repas** (15 jours complets)
- **6 repas par jour** : Petit-déjeuner, collation matin, déjeuner, collation après-midi, dîner, collation soir
- **Aliments réalistes** : Flocons d'avoine, poulet, riz, brocoli, yaourt grec, amandes, saumon, quinoa, etc.
- **Macros calculées** : Calories, protéines, glucides, lipides
- **Variations** : Quantités ±20% pour plus de réalisme

### 💪 **Entraînements** (10 séances)
- **Types variés** : Course à pied, vélo, musculation, natation
- **Données complètes** : Durée, calories, FC moyenne/max/min, distance, vitesse
- **Ressenti** : Effort perçu, fatigue avant/après

### 📏 **Mesures** (8 mesures)
- **Données corporelles** : Poids, IMC, masse grasse/musculaire
- **Mensurations** : Tour de taille, hanches, bras, cuisses, cou, poitrine
- **Évolution** : Variations réalistes sur 30 jours

### 📝 **Journal** (20 entrées)
- **Métriques** : Humeur, fatigue, motivation, énergie (6-10)
- **Sommeil** : Durée (7-9h) et qualité (5-9)
- **Stress** : Niveau 3-7
- **Météo** : Soleil, nuage, pluie
- **Activités** : Marche, jardinage (occasionnel)

### 💬 **Commentaires Coach** (6 par athlète)
- **Modules** : Diète, entraînements, journal, mesures
- **Messages** : Encouragements, conseils, feedback
- **Statut** : 70% lus par les athlètes

## 🔧 Configuration

### Prérequis
- Node.js installé
- Accès au projet Firebase SuperNovaFit
- Permissions d'écriture sur Firestore

### Variables d'Environnement
Les scripts utilisent les clés publiques Firebase directement (sécurisé pour les clés publiques).

### Rate Limiting
- Pause de 1 seconde entre chaque création d'utilisateur
- Pause de 2 secondes entre chaque athlète pour les données
- Respect des limites Firebase

## 🎯 Cas d'Usage

### Développement
```bash
# Créer un environnement de test complet
node scripts/setup-test-environment.js

# Tester l'application avec des données réalistes
# Se connecter avec n'importe quel utilisateur ci-dessus
```

### Démonstration
```bash
# Montrer toutes les fonctionnalités
# Utiliser les comptes coach pour voir le mode coach
# Utiliser les comptes athlète pour voir le mode athlète
```

### Tests
```bash
# Tester les relations coach-athlète
# Vérifier les permissions Firestore
# Tester les calculs de macros et calories
```

## 🚨 Notes Importantes

### Sécurité
- ⚠️ **Ne pas utiliser en production** - Ces scripts créent des utilisateurs réels
- ⚠️ **Supprimer les utilisateurs de test** après utilisation si nécessaire
- ✅ **Clés publiques uniquement** - Pas de clés privées exposées

### Performance
- 📊 **~5 minutes** pour créer l'environnement complet
- 💾 **~500 documents** créés au total
- 🔄 **Pauses automatiques** pour éviter les rate limits

### Maintenance
- 🧹 **Nettoyage** : Les scripts ne suppriment pas les données existantes
- 🔄 **Réutilisation** : Peut être exécuté plusieurs fois (gère les erreurs)
- 📝 **Logs détaillés** : Suivi complet de la création

## 🌐 Connexion

Une fois les scripts exécutés, connectez-vous sur :
**https://supernovafit-a6fe7.web.app**

Utilisez n'importe quel email/mot de passe de la liste ci-dessus.

## 🆘 Dépannage

### Erreur "User already exists"
- L'utilisateur existe déjà, le script continue avec les suivants
- Normal si le script a déjà été exécuté

### Erreur "Permission denied"
- Vérifier que vous avez les permissions Firestore
- Vérifier que les règles Firestore permettent l'écriture

### Erreur "Rate limit exceeded"
- Attendre quelques minutes et relancer
- Les scripts incluent des pauses automatiques

---

**✨ L'environnement de test est maintenant prêt pour développer et tester SuperNovaFit !**
