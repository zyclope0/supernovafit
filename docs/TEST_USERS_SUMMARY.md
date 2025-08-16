# 👥 Utilisateurs de Test - SuperNovaFit

## 🎉 **UTILISATEURS CRÉÉS AVEC SUCCÈS !**

Les utilisateurs suivants ont été créés dans Firebase Auth et Firestore. Ils sont prêts à être utilisés pour tester l'application.

---

## 👨‍💼 **COACHS** (3 utilisateurs)

### 1. Thomas Martin
- **Email** : `coach.martin@supernovafit.com`
- **Mot de passe** : `Coach123!`
- **UID** : `hTcmfxj5hLSeGeuUfi0Des7W4WM2`
- **Âge** : 35 ans
- **Profil** : Performance, niveau intense
- **Athlètes** : Lucas Bernard, Julie Mercier

### 2. Sophie Dubois
- **Email** : `coach.sophie@supernovafit.com`
- **Mot de passe** : `Coach123!`
- **UID** : `CSx3BAP5nWRapJMsl1OwcHUTwmo1`
- **Âge** : 28 ans
- **Profil** : Performance, niveau intense
- **Athlètes** : Emma Rousseau, Antoine Petit

### 3. Alexandre Moreau
- **Email** : `coach.alex@supernovafit.com`
- **Mot de passe** : `Coach123!`
- **UID** : `ZiytJg8OdHTd2UBCJSbDfzQklGt1`
- **Âge** : 42 ans
- **Profil** : Performance, niveau intense
- **Athlètes** : Maxime Leroy

---

## 🏃 **ATHLÈTES** (5 utilisateurs)

### 1. Lucas Bernard
- **Email** : `athlete.lucas@supernovafit.com`
- **Mot de passe** : `Athlete123!`
- **UID** : `tZp61RK0IgOYBfYNPF03LtCu9L52`
- **Âge** : 24 ans
- **Objectif** : Prise de masse
- **Niveau** : Modéré
- **Coach** : Thomas Martin

### 2. Emma Rousseau
- **Email** : `athlete.emma@supernovafit.com`
- **Mot de passe** : `Athlete123!`
- **UID** : `3SAGAqDW44PXZ1cD7hYx1QPaocH2`
- **Âge** : 26 ans
- **Objectif** : Séche
- **Niveau** : Modéré
- **Coach** : Sophie Dubois

### 3. Maxime Leroy
- **Email** : `athlete.maxime@supernovafit.com`
- **Mot de passe** : `Athlete123!`
- **UID** : `tPQUhE7OhgS10FhPcmlj0girOxw2`
- **Âge** : 31 ans
- **Objectif** : Maintien
- **Niveau** : Léger
- **Coach** : Alexandre Moreau

### 4. Julie Mercier
- **Email** : `athlete.julie@supernovafit.com`
- **Mot de passe** : `Athlete123!`
- **UID** : `5e8kVN3OrbPDA8hQIjJghWScwEe2`
- **Âge** : 29 ans
- **Objectif** : Performance
- **Niveau** : Intense
- **Coach** : Thomas Martin

### 5. Antoine Petit
- **Email** : `athlete.antoine@supernovafit.com`
- **Mot de passe** : `Athlete123!`
- **UID** : `FFrHQw0V85gsuchVQycjHimfK6T2`
- **Âge** : 22 ans
- **Objectif** : Prise de masse
- **Niveau** : Modéré
- **Coach** : Sophie Dubois

---

## 🌐 **CONNEXION**

### URL de l'application
**https://supernovafit-a6fe7.web.app**

### Instructions de connexion
1. Aller sur l'URL ci-dessus
2. Cliquer sur "Se connecter"
3. Utiliser n'importe quel email/mot de passe de la liste ci-dessus
4. L'application détectera automatiquement le rôle (coach ou athlète)

---

## 🎯 **CAS D'USAGE RECOMMANDÉS**

### Test du Mode Coach
- **Utiliser** : `coach.martin@supernovafit.com` / `Coach123!`
- **Fonctionnalités à tester** :
  - Dashboard coach
  - Liste des athlètes
  - Commentaires sur les modules
  - Génération d'invitations

### Test du Mode Athlète
- **Utiliser** : `athlete.lucas@supernovafit.com` / `Athlete123!`
- **Fonctionnalités à tester** :
  - Dashboard athlète
  - Modules diète, entraînements, mesures, journal
  - Réception des commentaires coach
  - Système d'invitations

### Test des Relations Coach-Athlète
- **Coach** : `coach.martin@supernovafit.com`
- **Athlètes liés** : Lucas Bernard, Julie Mercier
- **Tester** : Commentaires, invitations, permissions

---

## 📊 **PROFILS COMPLETS**

Tous les utilisateurs ont des profils complets avec :
- ✅ Âge, sexe, taille, poids initial
- ✅ Objectifs et niveau d'activité
- ✅ Préférences (unités, langue)
- ✅ Relations coach-athlète établies
- ✅ Profils marqués comme complets

---

## 🔧 **NOTES TECHNIQUES**

### Données de Test
- Les utilisateurs sont créés dans Firebase Auth
- Les profils sont stockés dans Firestore (collection `users`)
- Les relations coach-athlète sont établies via `ownerCoachId`

### Permissions
- Les règles Firestore sont strictes (sécurité)
- Les utilisateurs peuvent lire/écrire leurs propres données
- Les coachs peuvent lire les données de leurs athlètes

### Sécurité
- ⚠️ **Ne pas utiliser en production**
- ✅ **Clés publiques uniquement** utilisées
- 🔒 **Mots de passe sécurisés** mais simples pour les tests

---

## 🚀 **PRÊT À TESTER !**

L'environnement de test est maintenant prêt. Vous pouvez :

1. **Tester l'interface utilisateur** avec différents rôles
2. **Vérifier les fonctionnalités** coach-athlète
3. **Tester les calculs** de macros, calories, TDEE
4. **Valider les permissions** Firestore
5. **Démonstrer l'application** avec des données réalistes

**✨ Bon test !**
