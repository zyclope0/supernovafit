# 🏆 Règles Firestore pour les Badges

## À ajouter dans Firebase Console → Firestore → Rules

Ajoutez cette section dans vos règles Firestore existantes :

```javascript
// Règles pour la collection 'badges'
match /badges/{badgeId} {
  allow read: if isAuthenticated() && 
    resource.data.user_id == request.auth.uid;
  
  allow create: if isAuthenticated() && 
    request.resource.data.user_id == request.auth.uid;
  
  allow update: if isAuthenticated() && 
    resource.data.user_id == request.auth.uid;
  
  allow delete: if isAuthenticated() && 
    resource.data.user_id == request.auth.uid;
}
```

## Index Firestore nécessaire

**Firebase Console → Firestore → Indexes → Create Index :**

- **Collection** : `badges`
- **Champs** :
  - `user_id` : **Ascending**
  - `date_obtenu` : **Descending**

## Badges disponibles

1. **🔥 Streak 3 jours** - 3 jours consécutifs de journal
2. **⚡ Streak Semaine** - 7 jours consécutifs de journal  
3. **😊 Excellent Moral** - Humeur 9+ pendant 3 jours
4. **💪 Motivé(e)** - Motivation 8+ pendant 5 jours
5. **📝 Première Entrée** - Première entrée dans le journal
6. **📸 Photographe** - 10 photos uploadées

Les badges sont **débloqués automatiquement** quand les conditions sont remplies !