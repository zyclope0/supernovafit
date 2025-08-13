# ⚡ WEB VITALS MONITORING - Guide Performance
## Surveiller Performance Real Users SuperNovaFit

---

## 🎯 **QU'EST-CE QUE WEB VITALS**

**Web Vitals** = Métriques Google pour mesurer **expérience utilisateur réelle** :
- **Performance** : Vitesse chargement pages
- **Interactivité** : Réactivité aux clics
- **Stabilité visuelle** : Pages qui "bougent"

**Impact** : SEO Google, UX utilisateurs, taux conversion

---

## 📊 **MÉTRIQUES WEB VITALS v4**

### **🚀 Core Web Vitals (3 critiques)**

#### **1. LCP - Largest Contentful Paint**
```bash
# ❓ Quoi : Temps affichage élément principal
# 📏 Cible : < 2.5s (Good) | < 4s (Needs Improvement) | > 4s (Poor)
# 🎯 SuperNovaFit : Chargement Dashboard, cartes repas, graphiques

# Exemple valeurs :
✅ 1.2s → Excellent (Dashboard)
⚠️ 3.5s → Moyen (Page diète avec charts)
❌ 5.8s → Mauvais (Problème performance)
```

#### **2. INP - Interaction to Next Paint**
```bash
# ❓ Quoi : Délai entre clic et réaction visuelle (remplace FID)
# 📏 Cible : < 200ms (Good) | < 500ms (Needs Improvement) | > 500ms (Poor)
# 🎯 SuperNovaFit : Clics boutons, saisie formulaires, navigation

# Exemple valeurs :
✅ 120ms → Excellent (Bouton "Ajouter repas")
⚠️ 350ms → Moyen (Recherche aliments)
❌ 800ms → Mauvais (Interface bloquée)
```

#### **3. CLS - Cumulative Layout Shift**
```bash
# ❓ Quoi : Décalages éléments pendant chargement
# 📏 Cible : < 0.1 (Good) | < 0.25 (Needs Improvement) | > 0.25 (Poor)
# 🎯 SuperNovaFit : Images, cartes, modales qui "poussent" contenu

# Exemple valeurs :
✅ 0.05 → Excellent (Layout stable)
⚠️ 0.18 → Moyen (Quelques décalages)
❌ 0.35 → Mauvais (Page "saute" beaucoup)
```

### **📈 Autres Métriques**

#### **4. FCP - First Contentful Paint**
```bash
# ❓ Quoi : Temps premier élément visible
# 📏 Cible : < 1.8s (Good) | < 3s (Needs Improvement) | > 3s (Poor)
# 🎯 SuperNovaFit : Logo, header, premier texte
```

#### **5. TTFB - Time to First Byte**
```bash
# ❓ Quoi : Temps réponse serveur
# 📏 Cible : < 800ms (Good) | < 1.8s (Needs Improvement) | > 1.8s (Poor)
# 🎯 SuperNovaFit : Firebase Hosting response
```

---

## 🔍 **OÙ VOIR WEB VITALS**

### **1. Sentry Dashboard (Production)**
```bash
# 📊 Sentry → Performance → Web Vitals

# Vue d'ensemble :
- Aggregate scores (moyennes toutes pages)
- Trends temporelles (amélioration/dégradation)
- Page breakdown (quelles pages problématiques)
- User impact (% utilisateurs affectés)

# 🎯 Filtres utiles :
- Par page : /diete, /entrainements, /dashboard
- Par device : Mobile vs Desktop
- Par timeframe : Last 24h, 7d, 30d
```

### **2. Console Développeur (Local)**
```bash
# F12 → Console → Chercher "[Web Vital]"

# Logs automatiques :
[Web Vital] LCP: 1200ms (good)
[Web Vital] INP: 120ms (good)
[Web Vital] CLS: 0.05 (good)
[Web Vital] FCP: 800ms (good)
[Web Vital] TTFB: 300ms (good)

# 💡 Usage :
# → Tester modifications en dev
# → Comparer avant/après optimisations
```

### **3. Lighthouse (Audit Complet)**
```bash
# Chrome DevTools → Lighthouse tab

# Audit local :
npx lighthouse http://localhost:3000 --output=html

# Métriques Lighthouse vs Web Vitals :
# → Lighthouse = Lab data (simulation)
# → Web Vitals = Field data (utilisateurs réels)
```

---

## 📊 **ANALYSER PERFORMANCE SENTRY**

### **Dashboard Web Vitals**
```bash
# Sentry → Performance → Web Vitals

# 📈 Overview Cards :
┌─────────────────┬─────────────────┬─────────────────┐
│ LCP             │ INP             │ CLS             │
│ 1.8s (Good)     │ 180ms (Good)    │ 0.08 (Good)     │
│ ↗️ +0.2s vs week│ ↘️ -20ms vs week│ → stable        │
└─────────────────┴─────────────────┴─────────────────┘

# 🎯 Interprétation :
# → LCP +0.2s = Performance dégradée (investiguer)
# → INP -20ms = Interactivité améliorée (good)
# → CLS stable = Layout OK
```

### **Performance par Page**
```bash
# Sentry → Performance → Web Vitals → "View All"

# 📊 Breakdown pages :
Page                LCP      INP      CLS      Score
/                  1.2s     120ms    0.05     Good ✅
/diete             2.8s     200ms    0.12     OK ⚠️
/entrainements     1.9s     150ms    0.08     Good ✅
/coach/athlete/[id] 4.2s    350ms    0.18     Poor ❌

# 🎯 Actions :
# → /coach/athlete/[id] = priorité optimisation
# → /diete = surveiller évolution
```

### **Trends Temporelles**
```bash
# Graphiques Sentry (7/30 jours) :

# 📈 LCP Trend :
# → Baseline 1.5s
# → Pic 3.2s (12 Jan) → Deploy problématique ?
# → Retour 1.8s (15 Jan) → Fix deployed

# 🔍 Corrélation events :
# → Deploiements
# → Traffic spikes
# → Erreurs JS
```

---

## 🚨 **ALERTES PERFORMANCE**

### **Alertes Automatiques Sentry**
```bash
# Configuré dans SuperNovaFit :

# 🔴 Poor Performance (Auto alert) :
# → LCP > 4s pendant 1h
# → INP > 500ms pendant 1h  
# → CLS > 0.25 pendant 1h

# 📧 Email notifications :
# → "Performance degraded in SuperNovaFit"
# → Lien direct vers analyse Sentry
# → Actions recommandées
```

### **Configurer Alertes Custom**
```bash
# Sentry → Alerts → Create Alert

# 📊 Performance Budget Alert :
# Condition : "avg(measurements.lcp) > 2500ms"
# Timeframe : "15 minutes"
# Action : "Send email"

# 🎯 Exemples alertes utiles :
# → LCP > 3s sur /diete (page critique)
# → INP > 300ms (UX dégradée)
# → CLS > 0.15 (layout instable)
```

---

## 🔧 **OPTIMISATIONS COURANTES**

### **⚡ Améliorer LCP (Largest Contentful Paint)**
```bash
# 🎯 Problème : Chargement lent élément principal

# Solutions SuperNovaFit :
# 1. Images optimisées :
<Image
  src="/hero-image.jpg"
  width={800}
  height={400}
  priority={true}        # ← LCP image
  sizes="(max-width: 768px) 100vw, 50vw"
/>

# 2. Preload ressources critiques :
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin />

# 3. Code splitting :
const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'))

# 4. CSS critique inline
# → Styles above-the-fold en <style> dans <head>
```

### **🚀 Améliorer INP (Interaction to Next Paint)**
```bash
# 🎯 Problème : Clics lents à réagir

# Solutions SuperNovaFit :
# 1. Réduire JavaScript main thread :
# → Dynamic imports pour charts
# → Web Workers pour calculs lourds

# 2. Optimiser event handlers :
const handleClick = useCallback(() => {
  startTransition(() => {
    // Actions non-urgentes
    setHeavyState(newValue)
  })
}, [])

# 3. Virtual scrolling longues listes :
# → Historique repas > 100 items
# → Liste entraînements
```

### **📐 Améliorer CLS (Cumulative Layout Shift)**
```bash
# 🎯 Problème : Layout qui "saute"

# Solutions SuperNovaFit :
# 1. Dimensions explicites images :
<Image
  src="/food-image.jpg"
  width={200}          # ← Évite redimensionnement
  height={150}
  alt="Aliment"
/>

# 2. Skeleton loaders :
{loading ? <CardSkeleton /> : <MealCard data={meal} />}

# 3. CSS aspect-ratio :
.chart-container {
  aspect-ratio: 16/9;  /* Réserve espace avant chart load */
}

# 4. Eviter injections DOM :
# → Pas d'éléments ajoutés dynamiquement above-the-fold
```

---

## 📱 **MONITORING MOBILE vs DESKTOP**

### **Performance Device-Specific**
```bash
# Sentry → Filters → "device.family"

# 📊 Breakdown typical :
Desktop (60% users) :
- LCP: 1.5s (Good)
- INP: 120ms (Good)  
- CLS: 0.06 (Good)

Mobile (40% users) :
- LCP: 2.8s (Needs Improvement)
- INP: 250ms (Needs Improvement)
- CLS: 0.12 (Good)

# 🎯 Actions :
# → Optimiser mobile priority
# → Images responsive
# → Touch targets 44px+
```

### **Network Conditions**
```bash
# Chrome DevTools → Network tab → Throttling

# Test conditions :
# 📶 Fast 3G (1.6 Mbps down) :
# → LCP target < 3.5s
# → TTFB target < 1.2s

# 📶 Slow 3G (400 Kbps down) :
# → LCP target < 6s
# → Progressive enhancement critical
```

---

## 🎯 **WORKFLOW PERFORMANCE**

### **Daily Performance Check (2 min)**
```bash
# 1. Sentry Web Vitals Dashboard
# → All metrics "Good" ? ✅
# → Trends stable ? ✅
# → No alerts ? ✅

# 2. Si dégradation :
# → Corrélation avec deploy récent ?
# → Page spécifique affectée ?
# → Mobile vs Desktop issue ?
```

### **Weekly Performance Review (15 min)**
```bash
# 1. Trends analysis :
# → Amélioration ou dégradation ?
# → Pages problématiques persistantes ?

# 2. Benchmarking :
# → Comparer avec standards industrie
# → Progress vs objectifs

# 3. Optimizations planning :
# → Quick wins identifiés ?
# → Resources nécessaires ?
```

### **Performance Budgets**
```bash
# Objectifs SuperNovaFit 2025 :

# 🎯 Current vs Targets :
LCP  : 1.8s → Target 1.5s (-300ms)
INP  : 180ms → Target 150ms (-30ms)
CLS  : 0.08 → Target 0.05 (-0.03)
FCP  : 800ms → Target 600ms (-200ms)

# 📊 Success criteria :
# → 80% users "Good" rating
# → 0% users "Poor" rating
# → Mobile performance gap < 1s
```

---

## 🔧 **OUTILS COMPLÉMENTAIRES**

### **PageSpeed Insights (Google)**
```bash
# URL : https://pagespeed.web.dev/
# Analyser : https://supernovafit.app

# 📊 Data :
# → Field Data (real users) = Web Vitals
# → Lab Data (simulation) = Lighthouse
# → Recommandations optimisations automatiques
```

### **WebPageTest**
```bash
# URL : https://webpagetest.org/
# Test advanced conditions :
# → Multiple locations
# → Various devices
# → Network conditions
# → Filmstrip view
```

### **Lighthouse CI**
```bash
# Ajouter à GitHub Actions :
# → Performance regression detection
# → Bundle size monitoring
# → Accessibility checks

# .github/workflows/lighthouse.yml (optionnel)
```

---

## ✅ **WEB VITALS MAÎTRISÉS**

**Tu comprends maintenant :**
- ✅ Métriques Web Vitals (LCP, INP, CLS)
- ✅ Monitoring Sentry Performance
- ✅ Optimisations courantes
- ✅ Workflow performance quotidien

**Prochaine étape : [4. Workflow Monitoring Quotidien →](./4-MONITORING_QUOTIDIEN.md)**
