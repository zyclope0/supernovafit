# 🔒 DÉPLOIEMENT VALIDATION FIRESTORE STRICTE

**Date** : 04.10.2025  
**Criticité** : 🔴 **HAUTE**  
**Temps estimé** : 4h  
**Impact** : Sécurité des données

---

## 📋 CONTEXTE

L'audit de sécurité a identifié une **absence critique de validation des données** dans les règles Firestore actuelles. Cela expose l'application à :

- 🚨 **Injection de données malveillantes**
- 🚨 **Corruption de la base de données**
- 🚨 **Incohérences dans les données**
- 🚨 **Exploitation potentielle de failles**

## ✅ SOLUTION IMPLÉMENTÉE

### 1. **Nouvelles Fonctions de Validation**

```javascript
// Validation générique des champs
function validateFields(data, required, optional) {
  return data.keys().hasAll(required) &&
         data.keys().hasOnly(required.concat(optional));
}

// Validation stricte par collection
- validateRepas()     : Type de repas, aliments non vides, limites
- validateEntrainement() : Durée valide, intensité correcte
- validateMesure()    : Poids/IMC dans limites médicales
- validateJournal()   : Humeur/énergie 1-5, sommeil 0-24h
- validateMacros()    : Valeurs nutritionnelles réalistes
```

### 2. **Protections Ajoutées**

- ✅ **Champs obligatoires** : `user_id`, `date`, champs métier
- ✅ **Types de données** : Vérification stricte (string, number, timestamp)
- ✅ **Valeurs limites** : Bornes min/max réalistes
- ✅ **Énumérations** : Valeurs prédéfinies uniquement
- ✅ **Anti-injection** : Rejet des champs non autorisés

## 🚀 PROCÉDURE DE DÉPLOIEMENT

### Étape 1 : Backup des Rules Actuelles

```bash
# Sauvegarder les rules actuelles
cp config/firestore.rules config/firestore.rules.backup-$(date +%Y%m%d)

# Vérifier le backup
ls -la config/*.backup*
```

### Étape 2 : Test en Local

```bash
# 1. Installer les dépendances si nécessaire
npm install firebase firebase-admin

# 2. Configurer les variables d'environnement
export TEST_USER_EMAIL="test@supernovafit.com"
export TEST_USER_PASSWORD="Test123!"

# 3. Lancer les tests de validation
node scripts/test-firestore-rules.js

# Résultat attendu :
# ✅ 8/8 tests passés
```

### Étape 3 : Déploiement Firebase Emulator (TEST)

```bash
# 1. Démarrer l'émulateur Firestore
firebase emulators:start --only firestore

# 2. Dans un autre terminal, copier les nouvelles rules
cp config/firestore.rules.secure config/firestore.rules

# 3. Les rules sont automatiquement rechargées dans l'émulateur

# 4. Tester avec l'application en local
npm run dev
# Naviguer et tester : création repas, mesures, journal
```

### Étape 4 : Déploiement en Production

```bash
# 1. S'assurer d'être sur la bonne branche
git status

# 2. Remplacer les rules actuelles
cp config/firestore.rules.secure config/firestore.rules

# 3. Déployer UNIQUEMENT les rules (pas l'hosting)
firebase deploy --only firestore:rules --project supernovafit-a6fe7

# 4. Vérifier dans la console Firebase
# https://console.firebase.google.com/project/supernovafit-a6fe7/firestore/rules
```

## 🧪 TESTS DE VALIDATION POST-DÉPLOIEMENT

### Test 1 : Création Repas Valide ✅

```javascript
// Doit PASSER
{
  user_id: "currentUserId",
  date: Timestamp,
  repas: "petit_dej",
  aliments: [{nom: "Pain", quantite: 100}],
  macros: {kcal: 250, prot: 8, glucides: 45, lipides: 2}
}
```

### Test 2 : Repas Sans Aliments ❌

```javascript
// Doit ÉCHOUER
{
  user_id: "currentUserId",
  date: Timestamp,
  repas: "dejeuner",
  aliments: [] // ❌ Liste vide
}
```

### Test 3 : Injection de Champs ❌

```javascript
// Doit ÉCHOUER
{
  user_id: "currentUserId",
  date: Timestamp,
  repas: "diner",
  aliments: [{nom: "Pizza"}],
  admin: true, // ❌ Champ non autorisé
  role: "admin" // ❌ Champ non autorisé
}
```

### Test 4 : Mesures Hors Limites ❌

```javascript
// Doit ÉCHOUER
{
  user_id: "currentUserId",
  date: Timestamp,
  poids: 500,      // ❌ > 300kg
  imc: 75,         // ❌ > 60
  masse_grasse: 150 // ❌ > 100%
}
```

## 📊 MONITORING POST-DÉPLOIEMENT

### 1. **Métriques à Surveiller (30 min)**

- 📈 **Taux d'erreurs** : Augmentation temporaire normale (5-10%)
- 📈 **Rejets de création** : Données invalides bloquées
- 📈 **Performance** : Légère augmentation latence (+5-10ms)

### 2. **Logs à Vérifier**

```bash
# Console Firebase → Functions → Logs
# Filtrer par : "Permission denied"
# Analyser les patterns de rejet
```

### 3. **Alertes Sentry**

Les erreurs de validation remontent automatiquement à Sentry :

- Tag : `firestore.validation`
- Level : `warning`

## ⚠️ ROLLBACK SI NÉCESSAIRE

```bash
# En cas de problème critique
cp config/firestore.rules.backup-[DATE] config/firestore.rules
firebase deploy --only firestore:rules --project supernovafit-a6fe7
```

## ✅ CHECKLIST DE VALIDATION

- [ ] Backup des rules actuelles effectué
- [ ] Tests locaux passés (8/8)
- [ ] Test avec émulateur réussi
- [ ] Déploiement production effectué
- [ ] Tests post-déploiement validés
- [ ] Monitoring actif pendant 30 min
- [ ] Documentation mise à jour

## 📈 BÉNÉFICES ATTENDUS

### Sécurité

- 🛡️ **Protection contre l'injection** : 100% des champs validés
- 🛡️ **Intégrité des données** : Types et limites strictes
- 🛡️ **Conformité** : Standards de sécurité respectés

### Qualité

- ✨ **Données cohérentes** : Pas de valeurs aberrantes
- ✨ **Moins de bugs** : Erreurs détectées côté Firestore
- ✨ **Maintenance facilitée** : Structure claire et documentée

### Performance

- ⚡ **Validation côté serveur** : Pas d'impact client
- ⚡ **Rejets rapides** : Données invalides bloquées tôt
- ⚡ **Cache optimisé** : Moins de données corrompues

## 🆘 SUPPORT

En cas de problème :

1. **Slack** : #tech-urgent
2. **Email** : tech@supernovafit.com
3. **Rollback** : Procédure ci-dessus
4. **Escalade** : CTO si impact > 10% users

---

**IMPORTANT** : Cette mise à jour est **CRITIQUE** pour la sécurité. Elle doit être déployée dans les **24h** après validation.
