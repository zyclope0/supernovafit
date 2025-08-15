# 📊 GUIDE MONITORING SuperNovaFit
## Guide Pratique Complet - Sentry, Firebase Analytics & Web Vitals

> **Guide pas-à-pas** pour utiliser et consulter le monitoring de SuperNovaFit

---

## 📁 **STRUCTURE DU GUIDE**

- **[1. SETUP_SENTRY.md](./1-SETUP_SENTRY.md)** → Configuration Sentry + récupération DSN
- **[SENTRY_DSN_VISUEL.md](./SENTRY_DSN_VISUEL.md)** → **Guide visuel DSN** (captures d'écran)
- **[SENTRY_DSN_FIX.md](./SENTRY_DSN_FIX.md)** → **Résolution problème variables d'environnement**
- **[2. FIREBASE_ANALYTICS.md](./2-FIREBASE_ANALYTICS.md)** → Console Firebase & métriques  
- **[3. WEB_VITALS.md](./3-WEB_VITALS.md)** → Performance monitoring
- **[4. MONITORING_QUOTIDIEN.md](./4-MONITORING_QUOTIDIEN.md)** → Workflow daily/weekly
- **[5. TROUBLESHOOTING.md](./5-TROUBLESHOOTING.md)** → Résoudre problèmes courants

---

## 🚀 **DÉMARRAGE RAPIDE**

### **1. Setup Initial (15 minutes)**
```bash
# 1. Créer compte Sentry (gratuit)
# → Suivre Guide/1-SETUP_SENTRY.md

# 2. Configurer DSN hardcodé dans sentry.client.config.ts
# → Remplacer le DSN par le tien

# 3. Redémarrer l'app
npm run dev
```

### **2. Vérification Monitoring Actif**
```bash
# 1. Ouvrir SuperNovaFit dans navigateur
# → F12 → Console → Chercher "[Web Vital]"

# 2. Provoquer erreur test
# → Aller page inexistante → Vérifier Sentry reçoit

# 3. Check Firebase Analytics
# → console.firebase.google.com → Analytics
```

### **3. Dashboards Monitoring**
- **Sentry** : https://sentry.io → Errors + Performance
- **Firebase** : https://console.firebase.google.com → Analytics + Crash reports
- **GitHub Actions** : https://github.com/ton-repo → Actions tab

---

## 📊 **QUE SURVEILLER**

### **🚨 Critique (Check quotidien)**
- Nouvelles erreurs Sentry
- Performance dégradée (Web Vitals)
- Builds GitHub Actions échouent

### **📈 Important (Check hebdomadaire)**  
- Tendances utilisateurs Firebase
- Bundle size evolution
- Coverage tests

### **💡 Nice-to-have (Check mensuel)**
- Features usage analytics
- Error patterns long terme
- Performance optimizations

---

## 🎯 **PROCHAINES ÉTAPES**

1. **[Commencer par Setup Sentry →](./1-SETUP_SENTRY.md)**
2. Configurer Firebase Analytics  
3. Tester monitoring en action
4. Mettre en place workflow quotidien

**Questions ? → Consulter [Troubleshooting](./5-TROUBLESHOOTING.md)**
