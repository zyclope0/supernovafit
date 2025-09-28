# 🚨 SETUP SENTRY - Guide Étape par Étape

## Configuration complète Sentry pour SuperNovaFit

---

## 🎯 **OBJECTIF**

Configurer Sentry pour recevoir automatiquement :

- **Erreurs JavaScript** en temps réel
- **Performance metrics** (Web Vitals)
- **User context** (qui a eu l'erreur)
- **Release tracking** (quelle version)

---

## 📝 **ÉTAPE 1 : CRÉER COMPTE SENTRY**

### **1.1 Inscription (Gratuite)**

```bash
# 1. Aller sur https://sentry.io/signup/
# 2. Choisir "Sign up with email"
# 3. Remplir :
#    - Email : ton-email@domain.com
#    - Password : (mot de passe fort)
#    - Nom complet
# 4. Confirmer email
```

### **1.2 Créer Organisation**

```bash
# Après connexion :
# 1. "Create Organization"
# 2. Organization name : "SuperNovaFit" (ou ton nom)
# 3. Choisir plan "Developer" (gratuit - 5k erreurs/mois)
```

---

## 🔧 **ÉTAPE 2 : CRÉER PROJET NEXT.JS**

### **2.1 Setup Projet**

```bash
# Dans Sentry Dashboard :
# 1. Cliquer "Create Project"
# 2. Sélectionner plateforme : "Next.js"
# 3. Project name : "supernovafit"
# 4. Team : "Default"
# 5. Cliquer "Create Project"
```

### **2.2 Récupérer DSN (LA CLÉ IMPORTANTE)**

**📋 Comment trouver ton DSN :**

#### **Méthode A : Page Setup (directement après création)**

```bash
# Après "Create Project", tu vois :
# ┌─────────────────────────────────────────┐
# │ Configure Next.js                      │
# │                                         │
# │ dsn: "https://abc123@o456.ingest.     │
# │       sentry.io/789"                    │ ← C'EST ÇA TON DSN !
# │                                         │
# │ [Copy to clipboard]                     │
# └─────────────────────────────────────────┘

# ✅ Copier cette valeur complète
```

#### **Méthode B : Settings → Client Keys**

```bash
# Si tu as fermé la page :
# 1. Sentry Dashboard → Sélectionner projet "supernovafit"
# 2. Menu gauche → Settings ⚙️
# 3. Cliquer "Client Keys (DSN)"
# 4. Copier "DSN" (Public Key)

# Format DSN :
# https://[public_key]@[organization_id].ingest.sentry.io/[project_id]
# Exemple : https://abc123def456@o789012.ingest.sentry.io/345678
```

#### **Méthode C : Project Settings**

```bash
# Alternative :
# 1. Project → Settings → General Settings
# 2. Section "Client Keys (DSN)"
# 3. Copier la valeur "DSN"
```

---

## 🔐 **ÉTAPE 3 : CONFIGURER .ENV.LOCAL**

### **3.1 Configuration Sentry (DSN Hardcodé)**

**✅ SOLUTION FINALE :** Le DSN Sentry est maintenant hardcodé dans `sentry.client.config.ts` pour éviter les problèmes de variables d'environnement en production.

```typescript
// sentry.client.config.ts
const SENTRY_DSN =
  "https://6a6884fb3ee7188800e6d7a5a521ac4f@o4509835502813184.ingest.de.sentry.io/4509835686117456";
```

**⚠️ POUR TON PROJET :** Remplace le DSN ci-dessus par ton DSN Sentry personnel.

### **3.2 Configuration .env.local (Optionnel)**

**ℹ️ NOTE :** Le DSN Sentry est maintenant hardcodé, donc pas besoin de variable d'environnement.

```bash
# Firebase (existant)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBe176JrNl_R0NmUAFkhCISThnFUUgt8U4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=supernovafit-a6fe7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=supernovafit-a6fe7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=supernovafit-a6fe7.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=261698689691
NEXT_PUBLIC_FIREBASE_APP_ID=1:261698689691:web:edc7a7135d94a8250c443e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-RV0RK8JWN4

# Sentry : DSN hardcodé dans sentry.client.config.ts
```

### **3.3 Redémarrer Application**

```bash
# Terminal dans SuperNovaFit :
# Ctrl+C pour arrêter serveur dev
npm run dev
# → Serveur restart avec Sentry configuré (DSN hardcodé)
```

---

## ✅ **ÉTAPE 4 : TESTER SENTRY**

### **4.1 Test Erreur JavaScript**

```bash
# 1. Ouvrir SuperNovaFit dans navigateur
# → http://localhost:3000

# 2. Ouvrir DevTools (F12) → Console

# 3. Taper cette commande pour provoquer erreur :
setTimeout(() => { throw new Error('SentryPing') }, 0)

# 4. Check Sentry Dashboard (refresh page)
# → Tu devrais voir la nouvelle erreur !
```

### **4.2 Test Navigation (Web Vitals)**

```bash
# 1. Naviguer dans l'app :
# → Dashboard → Diète → Entraînements → Retour Dashboard

# 2. Ouvrir F12 → Console → Chercher :
# [Web Vital] CLS: 0.05 (good)
# [Web Vital] FCP: 800ms (good)
# [Web Vital] LCP: 1200ms (good)

# 3. Check Sentry → Performance tab
# → Métriques Web Vitals apparaissent
```

### **4.3 Test User Context**

```bash
# 1. Se connecter dans SuperNovaFit :
# → Email: test@supernovafit.com
# → Password: Test123!

# 2. Provoquer une erreur (F12 Console) :
setTimeout(() => { throw new Error('SentryPing') }, 0)

# 3. Check Sentry → Issue Details
# → User ID doit apparaître dans "User Context"
```

---

## 📊 **ÉTAPE 5 : CONFIGURER ALERTES**

### **5.1 Email Notifications**

```bash
# 1. Sentry → Settings → Notifications
# 2. "Email" → Enabled
# 3. Configurer :
#    - "Workflow notifications" : ON
#    - "Deploy notifications" : ON
#    - "Issue alerts" : ON

# 4. Frequency : "Immediately" pour nouvelles erreurs
```

### **5.2 Alertes Rules (Optionnel)**

```bash
# Pour setup avancé :
# 1. Project → Alerts → "Create Alert Rule"
# 2. Conditions exemple :
#    - "An event is seen" : Email immédiat
#    - "The issue's assignee" : Quand assigné
#    - "Issue state changes" : Résolu/rouvert

# 3. Actions :
#    - Send email
#    - Send Slack (si configuré)
```

---

## 🎯 **ÉTAPE 6 : VÉRIFIER CONFIGURATION**

### **6.1 Checklist Final**

```bash
✅ Compte Sentry créé
✅ Projet "supernovafit" créé
✅ DSN copié et hardcodé dans sentry.client.config.ts
✅ App redémarrée (npm run dev)
✅ Test erreur → Apparaît dans Sentry
✅ Test Web Vitals → Apparaît dans Performance
✅ Test User Context → User ID visible
✅ Email notifications activées
```

### **6.2 Troubleshooting**

```bash
# Si erreurs n'apparaissent pas :

# 1. Vérifier DSN correct :
# → Ouvrir sentry.client.config.ts
# → Vérifier que SENTRY_DSN contient ton DSN

# 2. Vérifier console navigateur :
# F12 → Network → Filtrer "sentry"
# → Requêtes vers sentry.io doivent apparaître

# 3. Vérifier environnement :
console.log(process.env.NODE_ENV)
# → Doit être "development" en local

# 4. Restart complet :
rm -rf .next && npm run dev
```

---

## 📱 **UTILISATION SENTRY**

### **Dashboard Principal**

```bash
# https://sentry.io → Sélectionner projet "supernovafit"

# 📊 Vue d'ensemble :
- Erreurs dernières 24h
- Performance trends
- Release health
- Top erreurs fréquentes

# 🔍 Issues (Erreurs) :
- Liste erreurs groupées
- Détails stack trace
- User impact
- First/Last seen

# 📈 Performance :
- Web Vitals trends
- Slow transactions
- Most impacted users
```

### **Workflow Typique**

```bash
# 1. Recevoir email "New Issue in SuperNovaFit"
# 2. Cliquer lien → Voir détails erreur
# 3. Analyser :
#    - Quel utilisateur (User Context)
#    - Quelle page (URL)
#    - Quand (Timestamp)
#    - Comment reproduire (Breadcrumbs)
# 4. Corriger dans code
# 5. Deploy → Sentry track résolution
```

---

## 🎉 **SENTRY CONFIGURÉ !**

**✅ Sentry est maintenant actif sur SuperNovaFit**

**Prochaine étape : [2. Firebase Analytics →](./2-FIREBASE_ANALYTICS.md)**

### **Liens Utiles**

- **Dashboard Sentry** : https://sentry.io
- **Docs Sentry Next.js** : https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Status Sentry** : https://status.sentry.io/
