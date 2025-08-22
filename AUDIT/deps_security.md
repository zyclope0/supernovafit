# 🔒 Analyse de Sécurité - SuperNovaFit

## Résumé critique

L'analyse révèle **7 vulnérabilités critiques de sécurité** incluant des **secrets hardcodés**, **4 vulnérabilités de dépendances** (3 HIGH, 1 MODERATE), et des **problèmes de configuration** qui exposent l'application à des risques importants.

## 1. 🚨 SECRETS HARDCODÉS (CRITIQUE)

### Clés API Firebase exposées dans le code source

**Lieu**: `src/lib/firebase.ts:9-15`
```typescript
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyBe176JrNl_R0NmUAFkhCISThnFUUgt8U4',
authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'supernovafit-a6fe7.firebaseapp.com',
projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'supernovafit-a6fe7',
storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'supernovafit-a6fe7.firebasestorage.app',
messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '261698689691',
appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:261698689691:web:edc7a7135d94a8250c443e',
measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-RV0RK8JWN4',
```

**Impact**: Les clés Firebase sont exposées publiquement. Même si ce sont des clés "publiques", les avoir en fallback hardcodé est une mauvaise pratique.

### Mots de passe en clair dans les scripts

**Lieu**: Multiple scripts dans `/scripts/`
- `scripts/create-test-users.js:26,42,58,76,93,110,127,144`
- `scripts/setup-test-environment.js:26,42,58,76,93,110,127,144`
- `scripts/update-test-users.js`

```javascript
password: 'Coach123!',
password: 'Athlete123!',
```

**Impact**: Mots de passe de test hardcodés accessibles dans le repository.

## 2. 🔴 Vulnérabilités des dépendances NPM

### Détails des vulnérabilités

| Package | Sévérité | CVE/Advisory | Description | Version actuelle | Fix |
|---------|----------|--------------|-------------|------------------|-----|
| **xlsx** | HIGH | GHSA-4r6h-8v6p-xvw6 | Prototype Pollution - Permet l'injection de propriétés malveillantes | 0.18.5 | ❌ Aucun |
| **xlsx** | HIGH | GHSA-5pgg-2g8v-p4x9 | ReDoS - Déni de service par regex | 0.18.5 | ❌ Aucun |
| **jspdf** | HIGH | GHSA-w532-jxjh-hjhj | ReDoS - Déni de service | 2.5.1 | 3.0.1 |
| **dompurify** | MODERATE | GHSA-vhxf-7vqr-mrjg | XSS - Cross-site Scripting | < 3.2.4 | 3.2.4+ |

### Analyse d'impact

- **xlsx**: Critique car utilisé pour l'export Excel. Aucun fix disponible, nécessite migration.
- **jspdf**: Utilisé pour génération PDF. Breaking changes en v3.
- **dompurify**: Dépendance transitive via jspdf.

## 3. ⚠️ Configuration de sécurité

### Firestore Rules - Points d'attention

**Lieu**: `config/firestore.rules`

1. **Accès coach trop permissif** (lignes 18-19, 36-37, etc.)
   - Un coach peut lire TOUTES les données de TOUS les utilisateurs
   - Devrait être limité aux athlètes liés uniquement

2. **Pas de validation des données**
   - Aucune validation de structure/format dans les règles
   - Risque d'injection de données malformées

3. **Get() excessifs**
   - Multiple `get()` pour vérifier le rôle = performance impact
   - Pourrait être optimisé avec custom claims

### Headers de sécurité manquants

L'analyse ne montre pas de configuration explicite pour :
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## 4. 🔍 Autres problèmes de sécurité identifiés

### Validation côté client uniquement

**Lieu**: Multiples endroits utilisant Zod
- La validation Zod est bonne mais doit être doublée côté serveur
- Les règles Firestore ne valident pas la structure des données

### Tokens d'invitation prévisibles

**Lieu**: `src/hooks/useFirestore.ts:1168`
```typescript
const invitationToken = generateId()
```
- La fonction `generateId()` doit utiliser une source cryptographiquement sûre

### Gestion des erreurs trop verboses

**Lieu**: `src/lib/firebase-errors.ts`
- Les messages d'erreur techniques peuvent révéler la structure interne
- Devrait logger les détails mais afficher des messages génériques

## 5. 📊 Résumé des risques

| Catégorie | Nombre | Sévérité |
|-----------|--------|----------|
| Secrets hardcodés | 7 clés API + 8 passwords | CRITIQUE |
| Vulnérabilités npm HIGH | 3 | HAUTE |
| Vulnérabilités npm MODERATE | 1 | MOYENNE |
| Config Firestore | 3 issues | HAUTE |
| Headers sécurité | 4 manquants | MOYENNE |

## 6. 🛡️ Plan de remédiation

### Actions immédiates (< 24h)

1. **Supprimer tous les secrets hardcodés**
   ```bash
   # Nettoyer l'historique git des secrets
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch src/lib/firebase.ts scripts/*.js' \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **Migrer xlsx vers exceljs**
   ```bash
   npm uninstall xlsx
   npm install exceljs
   ```

3. **Mettre à jour jspdf**
   ```bash
   npm install jspdf@3.0.1 jspdf-autotable@5.0.2
   ```

### Actions court terme (< 1 semaine)

1. **Implémenter CSP headers** dans `next.config.js`
2. **Restreindre les règles Firestore** aux athlètes liés
3. **Ajouter validation serveur** via Cloud Functions
4. **Implémenter rate limiting** sur les endpoints sensibles

### Actions moyen terme (< 1 mois)

1. **Audit de sécurité complet** avec outil professionnel
2. **Implémenter authentification 2FA**
3. **Chiffrement des données sensibles** (mesures, photos)
4. **Monitoring des accès anormaux**

## 7. 🔧 Scripts de correction

### Script 1: Nettoyer les secrets
```bash
#!/bin/bash
# remove-secrets.sh

# Supprimer les fichiers avec mots de passe
rm -f scripts/create-test-*.js scripts/setup-*.js scripts/update-*.js

# Créer .env.example sans valeurs
cat > .env.local.example << 'EOF'
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_SENTRY_DSN=
EOF

echo "Secrets removed. Don't forget to update firebase.ts to remove fallbacks!"
```

### Script 2: Headers de sécurité
```javascript
// next.config.js - Ajouter dans la configuration
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.firebase.com *.firebaseapp.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: *.googleapis.com;
      font-src 'self';
      connect-src 'self' *.firebase.com *.firebaseapp.com *.googleapis.com;
    `.replace(/\n/g, ' ').trim()
  }
]
```

## 8. Conformité et régulations

### RGPD/GDPR Compliance
- ✅ Page privacy policy présente
- ⚠️ Pas de mécanisme de suppression de compte
- ⚠️ Pas d'export complet des données personnelles
- ❌ Pas de consentement explicite pour analytics

### Recommandations RGPD
1. Implémenter "Droit à l'oubli" (suppression compte)
2. Ajouter bannière cookies avec opt-in
3. Logger tous les accès aux données personnelles
4. Chiffrer les données sensibles (santé = catégorie spéciale)

## Conclusion

Le projet présente des vulnérabilités critiques qui doivent être adressées avant mise en production. Les secrets hardcodés et les dépendances vulnérables représentent les risques les plus importants. Un plan de remédiation en 3 phases est proposé pour sécuriser l'application.