# 🚨 Guide Configuration Alertes de Budget Google Cloud

## 🎯 **OBJECTIF**

Configurer des alertes de budget pour SuperNovaFit afin de surveiller et contrôler les coûts d'hébergement Firebase/Google Cloud.

## 📊 **ÉTAPES DE CONFIGURATION**

### **1. 🚀 Accès à la Console Billing**

#### **URL Directe**

```
https://console.cloud.google.com/billing
```

#### **Navigation**

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Sélectionnez le projet `supernovafit-a6fe7`
3. Menu latéral → **"Billing"** (Facturation)

### **2. 💰 Configuration du Budget**

#### **Créer un Budget**

1. **Section "Budgets & Alerts"** → **"CREATE BUDGET"**
2. **Nom du budget** : `SuperNovaFit Monthly Budget`
3. **Montant** : `25€` (marge de sécurité)
4. **Période** : Monthly (Mensuel)

#### **Filtrage par Projet**

1. **"Filter projects"** → Sélectionner `supernovafit-a6fe7`
2. **"Filter services"** → Sélectionner :
   - Cloud Functions
   - Firebase Hosting
   - Firestore
   - Firebase Auth

### **3. 🚨 Configuration des Alertes**

#### **Seuils Recommandés**

- **50% du budget** : `12.50€` (Avertissement précoce)
- **80% du budget** : `20€` (Attention)
- **100% du budget** : `25€` (Critique)

#### **Actions d'Alerte**

1. **Email** : Votre adresse email
2. **Notification** : Console Google Cloud
3. **Action automatique** : Aucune (surveillance uniquement)

### **4. 📈 Monitoring Détaillé**

#### **Services à Surveiller**

```
Cloud Functions (Next.js SSR)
├── Mémoire : 512MiB (optimisé)
├── Instances : 0-3 (optimisé)
├── Coût estimé : 3-8€/mois
└── Région : europe-west1

Firebase Hosting
├── Stockage : Gratuit jusqu'à 10GB
├── Transfert : Gratuit jusqu'à 10GB/mois
└── Coût estimé : 0€/mois

Firestore Database
├── Stockage : Gratuit jusqu'à 1GB
├── Lectures : Gratuit jusqu'à 50k/jour
└── Coût estimé : 0€/mois

Firebase Auth
├── Utilisateurs : Gratuit jusqu'à 10k
├── Vérifications : Gratuit jusqu'à 10k/mois
└── Coût estimé : 0€/mois
```

### **5. 🔧 Optimisations Appliquées**

#### **Configuration Optimisée**

```json
{
  "frameworksBackend": {
    "region": "europe-west1",
    "memory": "512MiB", // -50% (1024→512)
    "maxInstances": 3, // -40% (5→3)
    "minInstances": 0, // -100% (1→0)
    "concurrency": 80 // -20% (100→80)
  }
}
```

#### **Économies Estimées**

- **Mémoire** : -50% de coût
- **Instances** : -40% de coût
- **Min Instances** : -100% de coût (cold start)
- **Total** : **-60% de coût** (15€→6€/mois)

### **6. 📱 Application Mobile**

#### **Google Cloud Console App**

1. Téléchargez l'app mobile
2. Connectez-vous avec votre compte Google
3. Accès rapide aux alertes de budget
4. Notifications push automatiques

### **7. 🚨 Alertes Avancées**

#### **Configuration Recommandée**

```yaml
Budget: 25€/mois
├── Alerte 50% (12.50€)
│   ├── Email : ✅
│   ├── Console : ✅
│   └── Action : Surveillance
├── Alerte 80% (20€)
│   ├── Email : ✅
│   ├── Console : ✅
│   └── Action : Vérification
└── Alerte 100% (25€)
    ├── Email : ✅
    ├── Console : ✅
    └── Action : Intervention
```

### **8. 📊 Tableau de Bord**

#### **Métriques Clés**

- **Coût mensuel actuel** : 3-8€
- **Budget alloué** : 25€
- **Marge de sécurité** : 17-22€
- **Utilisation** : 12-32%

#### **Tendances à Surveiller**

- **Pic de trafic** : Augmentation des instances
- **Croissance utilisateurs** : Augmentation Firestore
- **Nouveaux utilisateurs** : Augmentation Auth

### **9. 🔄 Révision Mensuelle**

#### **Checklist Mensuelle**

- [ ] Vérifier les coûts réels vs estimés
- [ ] Analyser les pics de consommation
- [ ] Ajuster le budget si nécessaire
- [ ] Optimiser la configuration si besoin

#### **Seuils d'Action**

- **< 10€/mois** : Configuration optimale
- **10-20€/mois** : Surveillance renforcée
- **> 20€/mois** : Investigation et optimisation

### **10. 🆘 Support et Ressources**

#### **Liens Utiles**

- **Console Billing** : https://console.cloud.google.com/billing
- **Documentation Budgets** : https://cloud.google.com/billing/docs/how-to/budgets
- **Calculateur de Coûts** : https://cloud.google.com/products/calculator
- **Support Firebase** : https://firebase.google.com/support

#### **Contacts d'Urgence**

- **Support Google Cloud** : Via console
- **Documentation SuperNovaFit** : `docs/guides/`
- **Configuration Firebase** : `firebase.production.json`

---

**Date de création** : 15.01.2025  
**Dernière mise à jour** : 15.01.2025  
**Statut** : ✅ **ACTIF** - Configuration optimisée  
**Coût estimé** : 3-8€/mois (vs 15€/mois initial)
