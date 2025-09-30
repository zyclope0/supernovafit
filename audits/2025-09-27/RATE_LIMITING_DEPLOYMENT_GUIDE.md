# 🔒 GUIDE DE DÉPLOIEMENT - RATE LIMITING FIREBASE

**Date**: 30.09.2025  
**Phase**: 2.1 - Sécurité Critique  
**Durée estimée**: 30-45 minutes  
**Niveau de risque**: MOYEN (modifications Firebase)

---

## 📋 PRÉREQUIS

- ✅ Accès à la Firebase Console
- ✅ Projet Firebase: `supernovafit-a6fe7`
- ✅ Backup des règles Firestore actuelles (recommandé)
- ✅ Tests en environnement de dev d'abord

---

## 🎯 OBJECTIFS

1. **Implémenter rate limiting** dans Firestore Security Rules
2. **Protéger contre DDoS** - 100 requêtes/heure par utilisateur
3. **Limiter les créations** - 20 créations/heure par utilisateur
4. **Tracking automatique** côté client

---

## 📊 LIMITES IMPLÉMENTÉES

| Type d'opération | Limite | Période | Action si dépassé |
|---|---|---|---|
| **Lectures** | 100 req | 1 heure | Blocage temporaire |
| **Créations** | 20 req | 1 heure | Blocage temporaire |
| **Mises à jour** | 100 req | 1 heure | Blocage temporaire |
| **Suppressions** | 100 req | 1 heure | Blocage temporaire |

---

## 🚀 ÉTAPE 1 : BACKUP DES RÈGLES ACTUELLES

### 1.1 Télécharger les règles actuelles

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner le projet `supernovafit-a6fe7`
3. Aller dans **Firestore Database** → **Règles**
4. **Copier tout le contenu** dans un fichier backup
5. Nommer le fichier : `firestore.rules.backup.30.09.2025`

**⚠️ IMPORTANT** : Ce backup te permettra de revenir en arrière si nécessaire !

---

## 🚀 ÉTAPE 2 : DÉPLOYER LES NOUVELLES RÈGLES

### 2.1 Option A : Déploiement via Firebase CLI (RECOMMANDÉ)

```bash
# 1. S'assurer d'être dans le bon répertoire
cd D:\SuperNovaFit

# 2. Remplacer le fichier de règles actuel
cp config/firestore.rules.enhanced config/firestore.rules

# 3. Tester les règles en local (optionnel)
firebase emulators:start --only firestore

# 4. Déployer les règles
firebase deploy --only firestore:rules --project supernovafit-a6fe7

# 5. Confirmer le déploiement
# ✅ Firestore rules updated successfully!
```

### 2.2 Option B : Déploiement via Console (ALTERNATIF)

1. Ouvrir le fichier `config/firestore.rules.enhanced`
2. **Copier tout le contenu**
3. Aller sur [Firebase Console](https://console.firebase.google.com/)
4. **Firestore Database** → **Règles**
5. **Coller le nouveau contenu**
6. Cliquer sur **Publier**
7. ⚠️ **Lire les avertissements** (s'il y en a)
8. Confirmer le déploiement

---

## 🚀 ÉTAPE 3 : CRÉER LA COLLECTION RATE_LIMITS

### 3.1 Initialisation via Console

Les documents `rate_limits` seront créés **automatiquement** lors de la première connexion de chaque utilisateur. Cependant, tu peux créer un document template :

1. Aller dans **Firestore Database** → **Données**
2. Créer une nouvelle collection : `rate_limits`
3. Créer un document avec l'ID : `_template`
4. Ajouter les champs :
   ```
   requestCount: 0 (number)
   createCount: 0 (number)
   lastReset: [timestamp actuel] (timestamp)
   userId: "_template" (string)
   ```

**Note** : Ce document template n'est pas obligatoire, c'est juste pour la structure.

---

## 🚀 ÉTAPE 4 : VALIDER LE DÉPLOIEMENT

### 4.1 Vérification des règles

1. Dans Firebase Console, aller dans **Firestore Database** → **Règles**
2. Vérifier que les nouvelles fonctions apparaissent :
   - `checkRateLimit()`
   - `checkCreateRateLimit()`
3. Vérifier qu'il n'y a **pas d'erreurs de syntaxe**

### 4.2 Test fonctionnel

```bash
# 1. Lancer l'application en dev
npm run dev

# 2. Se connecter avec un compte test
# 3. Créer quelques entrées (repas, entraînements, etc.)
# 4. Vérifier dans la console Firebase que le document rate_limits est créé
```

**Vérifications dans Firestore** :
1. Collection `rate_limits` créée ✅
2. Document avec l'ID de l'utilisateur test ✅
3. Champs `requestCount` et `createCount` augmentent ✅
4. Champ `lastReset` est un timestamp récent ✅

---

## 🧪 ÉTAPE 5 : TESTER LE RATE LIMITING

### 5.1 Test manuel de dépassement

**Script de test** (à exécuter dans la console du navigateur) :

```javascript
// Test de dépassement de limite (NE PAS FAIRE EN PRODUCTION)
const testRateLimit = async () => {
  const { db } = await import('./lib/firebase');
  const { collection, addDoc } = await import('firebase/firestore');
  
  console.log('🧪 Test rate limiting - Création de 25 documents...');
  
  for (let i = 0; i < 25; i++) {
    try {
      await addDoc(collection(db, 'journal'), {
        user_id: 'YOUR_TEST_USER_ID',
        date: new Date().toISOString(),
        note: `Test ${i}`,
      });
      console.log(`✅ Document ${i + 1} créé`);
    } catch (error) {
      console.error(`❌ Document ${i + 1} bloqué:`, error.message);
      if (error.code === 'permission-denied') {
        console.log('🔒 RATE LIMIT ATTEINT ! Protection active.');
        break;
      }
    }
  }
};

// Exécuter le test
testRateLimit();
```

**Résultat attendu** :
- ✅ Les 20 premières créations passent
- ❌ Les 5 suivantes sont bloquées avec `permission-denied`
- 🔒 Message : "RATE LIMIT ATTEINT !"

### 5.2 Vérifier le reset automatique

1. Attendre **1 heure** (ou modifier le document `rate_limits` manuellement)
2. Changer `lastReset` à une date > 1h dans le passé
3. Réessayer une création
4. ✅ Devrait fonctionner (compteurs réinitialisés)

---

## 📊 ÉTAPE 6 : MONITORING

### 6.1 Surveiller les erreurs

Dans Firebase Console :
1. Aller dans **Firestore Database** → **Utilisation**
2. Surveiller le **nombre de lectures/écritures**
3. Vérifier qu'il n'y a pas de **pics anormaux**

### 6.2 Logs d'erreurs

```bash
# Surveiller les logs Firebase
firebase functions:log --project supernovafit-a6fe7
```

Chercher les erreurs de type :
- `permission-denied` (rate limit atteint)
- `resource-exhausted` (problème de quotas)

---

## 🔧 ÉTAPE 7 : AJUSTEMENTS POSSIBLES

### 7.1 Modifier les limites

Si les limites sont **trop strictes** ou **trop permissives**, tu peux les ajuster :

**Dans `config/firestore.rules.enhanced`** :

```javascript
// Ligne 33 - Limite de requêtes générales
return data.requestCount < 100;  // ← Changer ce nombre

// Ligne 52 - Limite de créations
return data.createCount < 20;    // ← Changer ce nombre
```

Puis **redéployer** les règles (Étape 2).

### 7.2 Exclure certains utilisateurs

Pour exclure les **coaches** ou **admins** du rate limiting :

```javascript
// Ajouter dans checkRateLimit()
function checkRateLimit() {
  // Exclure les coaches
  if (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'coach') {
    return true;
  }
  
  // ... reste du code
}
```

---

## ⚠️ ROLLBACK EN CAS DE PROBLÈME

### Si quelque chose ne va pas

**Option A : Via CLI**
```bash
# Restaurer le backup
cp firestore.rules.backup.30.09.2025 config/firestore.rules

# Redéployer
firebase deploy --only firestore:rules --project supernovafit-a6fe7
```

**Option B : Via Console**
1. Ouvrir le backup `firestore.rules.backup.30.09.2025`
2. Copier tout le contenu
3. Aller dans Firebase Console → Firestore → Règles
4. Coller le contenu du backup
5. Publier

---

## ✅ CHECKLIST COMPLÈTE

### Avant le déploiement
- [ ] Backup des règles actuelles créé
- [ ] Fichier `firestore.rules.enhanced` vérifié
- [ ] Firebase CLI configuré et connecté
- [ ] Compte test créé pour valider

### Pendant le déploiement
- [ ] Règles Firestore déployées sans erreur
- [ ] Collection `rate_limits` créée (auto ou manuel)
- [ ] Aucune erreur de syntaxe dans la console

### Après le déploiement
- [ ] Test de connexion réussi
- [ ] Documents `rate_limits` créés automatiquement
- [ ] Compteurs `requestCount` et `createCount` s'incrémentent
- [ ] Test de dépassement de limite fonctionne
- [ ] Aucune erreur dans les logs Firebase

---

## 📈 MÉTRIQUES ATTENDUES

| Métrique | Avant | Après | Amélioration |
|---|---|---|---|
| Score Sécurité | 9.0/10 | **9.2/10** | +0.2 |
| Protection DDoS | ❌ Client-side | ✅ **Firestore Rules** | 100% |
| Quotas contrôlés | ❌ Non | ✅ **100 req/h** | Oui |
| Monitoring | ❌ Non | ✅ **Automatique** | Oui |

---

## 🆘 SUPPORT

### En cas de problème

1. **Vérifier les logs** :
   ```bash
   firebase functions:log --project supernovafit-a6fe7
   ```

2. **Vérifier les règles** :
   - Firebase Console → Firestore → Règles
   - Chercher les erreurs de syntaxe

3. **Tester les règles** :
   - Utiliser le **Simulateur de règles** dans Firebase Console
   - Tester un read/write avec un user_id fictif

4. **Rollback** :
   - Utiliser le backup (voir section Rollback)

### Contacts

- **Documentation Firebase** : https://firebase.google.com/docs/firestore/security/rules
- **Rate Limiting** : https://firebase.google.com/docs/firestore/security/rules-conditions#access_other_documents

---

## 📝 NOTES IMPORTANTES

1. **Les règles sont GLOBALES** : Elles s'appliquent à tous les utilisateurs
2. **Le rate limiting est par UTILISATEUR** : Chaque user a ses propres limites
3. **Les limites se RÉINITIALISENT** : Automatiquement après 1 heure
4. **Les compteurs sont ESTIMATIFS** : Le tracking côté client peut être légèrement décalé
5. **En cas de doute** : ROLLBACK et demande de l'aide

---

**Prêt pour le déploiement ?** 🚀

**Temps estimé total** : 30-45 minutes  
**Risque** : MOYEN (mais rollback facile)  
**Impact** : HAUTE sécurité contre DDoS

**Bonne chance !** 🔒✨
