# 🔑 RÉCUPÉRER DSN SENTRY - Guide Visuel

## Étapes détaillées avec descriptions visuelles

---

## 📋 **MÉTHODES POUR RÉCUPÉRER LE DSN**

Tu peux récupérer ton DSN Sentry de **3 façons différentes**. Voici les méthodes pas-à-pas :

---

## 🎯 **MÉTHODE 1 : Lors de la création du projet (PLUS SIMPLE)**

### **Étape 1 : Créer le projet**

```bash
# Sur https://sentry.io
# Après connexion, cliquer "Create Project"

Interface visible :
┌─────────────────────────────────────────────────────────┐
│ Create Project                                          │
│                                                         │
│ Choose a platform:                                      │
│ [React] [Vue] [Angular] [Next.js] ← Sélectionner       │
│ [Node.js] [Python] [Java] [More...]                    │
│                                                         │
│ Project name: supernovafit                              │
│ Team: #my-team                                          │
│                                                         │
│                    [Create Project]                     │
└─────────────────────────────────────────────────────────┘
```

### **Étape 2 : DSN affiché immédiatement**

```bash
# Directement après "Create Project", page automatique :

┌─────────────────────────────────────────────────────────┐
│ Configure Next.js                                      │
│                                                         │
│ 1. Install Sentry SDK                                  │
│    npm install @sentry/nextjs                          │
│                                                         │
│ 2. Configure your DSN                                  │
│    ┌─────────────────────────────────────────────────┐ │
│    │ NEXT_PUBLIC_SENTRY_DSN=                        │ │
│    │ "https://abc123@o456789.ingest.sentry.io/123"  │ │ ← TON DSN !
│    │                                                 │ │
│    │              [📋 Copy to clipboard]            │ │ ← Cliquer
│    └─────────────────────────────────────────────────┘ │
│                                                         │
│ 3. Configure sentry.client.config.ts                   │
│    [Show me how]                                        │
└─────────────────────────────────────────────────────────┘
```

### **✅ Action : Copier le DSN complet**

```bash
# Exemple DSN complet :
https://a1b2c3d4e5f6@o987654321.ingest.sentry.io/123456789

# ⚠️ Attention :
# → Copier la LIGNE COMPLÈTE
# → Commencer par "https://"
# → Finir par "/[numéros]"
```

---

## 🔧 **MÉTHODE 2 : Via Settings → Client Keys**

### **Étape 1 : Naviguer vers Settings**

```bash
# Dans ton projet Sentry existant :

Interface Sentry Dashboard :
┌─────────────────────────────────────────────────────────┐
│ [Logo] SuperNovaFit Project                  [Settings]│ ← Cliquer
│                                                         │
│ Issues    Performance    Releases    Alerts            │
│                                                         │
│ 📊 Overview                                            │
│ Error rate: 0.2%                                       │
│ Performance: Good                                       │
└─────────────────────────────────────────────────────────┘
```

### **Étape 2 : Menu Settings gauche**

```bash
# Page Settings ouverte, menu gauche :

┌─────────────────┬───────────────────────────────────────┐
│ Settings        │ General Settings                      │
│                 │                                       │
│ General         │ Project Details                       │
│ Teams           │ Name: supernovafit                    │
│ Projects        │ Platform: Next.js                     │
│ Client Keys     │ ← CLIQUER ICI                        │
│ Security        │                                       │
│ Processing      │                                       │
│ Debug Files     │                                       │
│ Source Maps     │                                       │
│ Integrations    │                                       │
└─────────────────┴───────────────────────────────────────┘
```

### **Étape 3 : Copier DSN dans Client Keys**

```bash
# Page Client Keys (DSN) :

┌─────────────────────────────────────────────────────────┐
│ Client Keys (DSN)                                       │
│                                                         │
│ DSN (Public)                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ https://abc123@o456789.ingest.sentry.io/123456     │ │ ← TON DSN
│ │                                  [📋 Copy]         │ │ ← Cliquer
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Public Key                                              │
│ abc123def456ghi789                                      │
│                                                         │
│ Secret Key                                              │
│ [Hidden - Click to reveal]                              │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ **MÉTHODE 3 : Via Project Settings**

### **Étape 1 : Clic icône Settings (roue dentée)**

```bash
# Depuis ton dashboard projet :

┌─────────────────────────────────────────────────────────┐
│ [🏠] SuperNovaFit                            [⚙️]      │ ← Cliquer roue
│                                                         │
│ Issues (12)    Performance    Releases                 │
│                                                         │
│ Recent Issues:                                          │
│ • TypeError in Dashboard                                │
│ • Network timeout                                       │
└─────────────────────────────────────────────────────────┘
```

### **Étape 2 : General Settings**

```bash
# Page qui s'ouvre automatiquement :

┌─────────────────────────────────────────────────────────┐
│ Project Settings                                        │
│                                                         │
│ General                                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Project Details                                     │ │
│ │ Name: SuperNovaFit                                  │ │
│ │ Platform: Next.js                                   │ │
│ │                                                     │ │
│ │ Client Keys (DSN)                                   │ │
│ │ DSN: https://abc123@o456.ingest.sentry.io/789  📋  │ │ ← DSN visible
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 **UTILISER LE DSN DANS SUPERNOVAFIT**

### **Étape 1 : Ouvrir .env.local**

```bash
# Dans ton projet SuperNovaFit :
# Fichier : .env.local (racine du projet)

# Si le fichier n'existe pas :
cp .env.local.example .env.local
```

### **Étape 2 : Ajouter la ligne DSN**

```bash
# Contenu .env.local :

# Firebase (existant)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBe176JrNl_R0NmUAFkhCISThnFUUgt8U4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=supernovafit-a6fe7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=supernovafit-a6fe7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=supernovafit-a6fe7.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=261698689691
NEXT_PUBLIC_FIREBASE_APP_ID=1:261698689691:web:edc7a7135d94a8250c443e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-RV0RK8JWN4

# Sentry (AJOUTER CETTE LIGNE)
NEXT_PUBLIC_SENTRY_DSN=https://TON-DSN-COMPLET-ICI
#                      ↑ Remplacer par la valeur copiée
```

### **Étape 3 : Redémarrer le serveur**

```bash
# Terminal dans SuperNovaFit :
# Arrêter avec Ctrl+C puis :
npm run dev
```

---

## ✅ **VÉRIFIER QUE ÇA MARCHE**

### **Test 1 : Console navigateur**

```bash
# 1. Ouvrir SuperNovaFit : http://localhost:3000
# 2. F12 → Console
# 3. Taper :

console.log(process.env.NEXT_PUBLIC_SENTRY_DSN)

# Résultat attendu :
# → "https://abc123@o456.ingest.sentry.io/789"
# ❌ Si "undefined" → DSN mal configuré
```

### **Test 2 : Provoquer erreur**

```bash
# Dans la console navigateur (F12) :

throw new Error("Test Sentry - ça marche!")

# Résultat attendu :
# → Erreur visible dans console
# → 30 secondes plus tard : erreur dans Sentry Dashboard
```

### **Test 3 : Check Sentry Dashboard**

```bash
# 1. Retourner sur https://sentry.io
# 2. Sélectionner projet "SuperNovaFit"
# 3. Menu "Issues"

Interface attendue :
┌─────────────────────────────────────────────────────────┐
│ Issues                                    [New ✨]      │
│                                                         │
│ 🔴 Error: Test Sentry - ça marche!                     │
│    First seen: just now                                │
│    Last seen: just now                                 │
│    Events: 1    Users: 1                               │
│                                                         │
│ [View Details]                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚨 **ERREURS COURANTES DSN**

### **❌ Erreur 1 : DSN incomplet**

```bash
# MAUVAIS :
NEXT_PUBLIC_SENTRY_DSN=abc123def456

# BON :
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456@o789.ingest.sentry.io/123
```

### **❌ Erreur 2 : Guillemets manquants**

```bash
# MAUVAIS :
NEXT_PUBLIC_SENTRY_DSN="https://..."

# BON (sans guillemets en .env) :
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### **❌ Erreur 3 : Variable mal nommée**

```bash
# MAUVAIS :
SENTRY_DSN=https://...

# BON :
NEXT_PUBLIC_SENTRY_DSN=https://...
#         ↑ NEXT_PUBLIC obligatoire pour Next.js
```

### **❌ Erreur 4 : Serveur pas redémarré**

```bash
# Après modification .env.local :
# OBLIGATOIRE de redémarrer :
# Ctrl+C puis npm run dev
```

---

## 📞 **SI ÇA MARCHE TOUJOURS PAS**

### **🔍 Debug étape par étape**

```bash
# 1. Vérifier DSN dans Sentry
# → Copier-coller depuis interface Sentry

# 2. Vérifier fichier .env.local
cat .env.local | grep SENTRY
# → Doit afficher la ligne complète

# 3. Redémarrer complètement
rm -rf .next
npm run dev

# 4. Test différent navigateur
# → Firefox, Chrome, Edge

# 5. Vérifier Network (F12)
# → Onglet Network → Filtrer "sentry"
# → Doit montrer requêtes vers sentry.io
```

### **📧 Support si bloqué**

```bash
# Si rien ne marche après ces étapes :

# 1. Screenshot de ton DSN dans Sentry
# 2. Screenshot de ton .env.local
# 3. Screenshot console erreurs F12
# 4. Contacter support Sentry ou poser question
#    Stack Overflow avec tag "sentry" + "nextjs"
```

---

## 🎉 **DSN CONFIGURÉ AVEC SUCCÈS !**

**✅ Tu as maintenant :**

- DSN Sentry récupéré correctement
- Variable environment configurée
- Monitoring erreurs actif
- Tests validation réussis

**🚀 Prochaines étapes :**

- [Retour au Guide Setup Sentry →](./1-SETUP_SENTRY.md#étape-4-tester-sentry)
- [Configuration Firebase Analytics →](./2-FIREBASE_ANALYTICS.md)
