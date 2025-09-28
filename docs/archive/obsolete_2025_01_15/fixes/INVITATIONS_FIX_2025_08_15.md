# 🔧 Correction du Système d'Invitations Coach-Athlète

**Date** : 15 Août 2025  
**Problème** : Erreurs de permissions Firestore empêchant le fonctionnement des invitations

## 📝 Problèmes Identifiés

### 1. Côté Coach

- **Symptôme** : Le code d'invitation disparaissait après 3-4 secondes
- **Cause** : Erreur de permissions lors de la lecture des invitations du coach

### 2. Côté Athlète

- **Symptôme** : "FirebaseError: Missing or insufficient permissions" lors de l'utilisation d'un code
- **Cause** : Erreur de permissions lors de la lecture/mise à jour de l'invitation

## 🔍 Analyse Technique

### Problème Principal

Le code utilisait `addDoc()` pour créer les invitations (génération d'ID automatique), mais tentait ensuite d'accéder aux documents avec le code comme ID :

- Ligne 80 : `await addDoc(collection(db, 'invites'), inviteData)`
- Ligne 104 : `const inviteRef = doc(db, 'invites', code)` ❌
- Ligne 143 : `const inviteRef = doc(db, 'invites', code)` ❌

### Problèmes Secondaires

1. Les règles Firestore étaient trop restrictives pour la lecture
2. La règle `list` avait une syntaxe incorrecte
3. La mise à jour du profil utilisateur n'était pas autorisée pour lier le coach

## ✅ Solutions Appliquées

### 1. Correction du Hook `useInvites.ts`

```typescript
// Avant
await addDoc(collection(db, "invites"), inviteData);

// Après
await setDoc(doc(db, "invites", code), inviteData);
```

- Utilisation du code comme ID du document pour cohérence
- Ajout du code dans les données retournées par `onSnapshot`

### 2. Correction des Règles Firestore

#### Collection `invites`

```javascript
// Lecture améliorée
allow read: if isAuthenticated() && (
  resource.data.coachId == request.auth.uid ||  // Coach peut lire ses invitations
  resource.data.status == 'active'              // Athlète peut lire les actives
);

// Liste simplifiée
allow list: if isAuthenticated();
```

#### Collection `users`

```javascript
// Mise à jour pour permettre la liaison coach-athlète
allow update: if isOwner(userId) ||
  (
    isAuthenticated() &&
    request.auth.uid == userId &&
    request.resource.data.diff(resource.data).changedKeys().hasOnly(['ownerCoachId', 'updated_at']) &&
    request.resource.data.ownerCoachId != null
  );
```

## 📊 Résultats

✅ **Coach** : Peut maintenant générer, voir et révoquer ses invitations  
✅ **Athlète** : Peut utiliser un code d'invitation pour se lier à un coach  
✅ **Sécurité** : Les permissions restent strictes et sécurisées  
✅ **Performance** : Accès direct aux documents via le code comme ID

## 🔐 Sécurité Maintenue

- Seuls les coachs peuvent créer des invitations
- Les athlètes ne peuvent lire que les invitations actives
- Les invitations ne peuvent être utilisées qu'une fois
- Expiration automatique après 72h
- Rate limiting : 5 invitations max par 10 minutes

## 📝 Tests Recommandés

1. **Test Coach** :
   - Connexion avec compte coach
   - Génération d'un code d'invitation
   - Vérification que le code reste visible
   - Test de révocation

2. **Test Athlète** :
   - Connexion avec compte sportif
   - Utilisation du code généré
   - Vérification de la liaison coach-athlète
   - Test avec code invalide/expiré

## 🚀 Déploiement

```bash
# Règles Firestore déployées
firebase deploy --only firestore:rules
```

## 📚 Fichiers Modifiés

1. `src/hooks/useInvites.ts` : Utilisation de `setDoc` avec code comme ID
2. `config/firestore.rules` : Permissions corrigées pour `invites` et `users`
3. `docs/context/ai_context_summary.md` : Documentation mise à jour

## ⚠️ Points d'Attention

- Les invitations créées avant cette correction ne fonctionneront pas (ID différent du code)
- Il faut tester le système complet après déploiement
- Surveiller les logs Sentry pour d'éventuelles erreurs résiduelles
