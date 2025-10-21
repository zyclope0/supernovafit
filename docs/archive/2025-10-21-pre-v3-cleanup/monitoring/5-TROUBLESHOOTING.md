# 🔧 TROUBLESHOOTING GUIDE - SuperNovaFit

## Solutions aux problèmes courants de monitoring

---

## 🚨 **PROBLÈMES SENTRY**

### **1. "DSN pas configuré" / Erreurs pas reçues**

#### **Symptômes :**

```bash
❌ Console log : "Sentry DSN not configured"
❌ Erreurs provoquées n'apparaissent pas dans Sentry
❌ Dashboard Sentry vide
```

#### **Solutions :**

```bash
# 1. Vérifier DSN dans .env.local
cat .env.local | grep SENTRY
# → Doit afficher : NEXT_PUBLIC_SENTRY_DSN=https://...

# 2. Vérifier format DSN correct
# ✅ Format valide : https://abc123@o456.ingest.sentry.io/789
# ❌ Format invalide : abc123 (incomplete)

# 3. Redémarrer serveur dev
npm run dev
# → Sentry se réinitialise avec nouveau DSN

# 4. Test configuration
# Console navigateur (F12) :
console.log(process.env.NEXT_PUBLIC_SENTRY_DSN)
# → Doit afficher DSN complet

# 5. Test erreur manuelle
throw new Error("Test Sentry configuration")
# → Doit apparaître dans Sentry sous 30 secondes
```

### **2. Warnings Prisma/OpenTelemetry persistants**

#### **Symptômes :**

```bash
⚠️ Console : "Critical dependency: the request of a dependency is an expression"
⚠️ Logs répétitifs @prisma/instrumentation
⚠️ Warnings @opentelemetry pendant développement
```

#### **Solutions :**

```bash
# 1. Configuration next.config.js (SOLUTION RECOMMANDÉE)
webpack: (config, { isServer }) => {
  // Supprimer warnings spécifiques
  config.module = {
    ...config.module,
    exprContextCritical: false,
  }

  // Ignorer warnings patterns
  config.ignoreWarnings = [
    /Critical dependency: the request of a dependency is an expression/,
    /node_modules\/@prisma\/instrumentation/,
    /node_modules\/@opentelemetry/
  ]

  return config
}

# 2. Configuration Sentry alternative
# sentry.client.config.ts :
autoInstrumentRemix: false,
autoInstrumentServerFunctions: false,

# 3. Redémarrer serveur dev
npm run dev
# → Warnings supprimés
```

### **3. "Too Many Requests" / Rate Limiting**

#### **Symptômes :**

```bash
⚠️ Console : "HTTP 429 Too Many Requests"
⚠️ Sentry events manqués
⚠️ Email alert : "Rate limit exceeded"
```

#### **Solutions :**

```bash
# 1. Check quota Sentry
# Dashboard Sentry → Settings → Quotas
# → Vérifier événements/mois vs limite

# 2. Filtrer erreurs non critiques
# Éditer sentry.client.config.ts :

beforeSend(event, hint) {
  const error = hint.originalException as Error

  // Ignorer erreurs développement
  if (process.env.NODE_ENV === 'development') {
    if (error?.message?.includes('ChunkLoadError')) {
      return null  // Pas d'envoi Sentry
    }
  }

  return event
}

# 3. Réduire sampling rate
tracesSampleRate: 0.1  // 10% au lieu de 100%

# 4. Upgrade plan si nécessaire
# → Plan gratuit : 5k erreurs/mois
# → Plan payant : 50k+ erreurs/mois
```

### **3. Erreurs Spam / Bruit**

#### **Symptômes :**

```bash
📧 Email alerts multiples pour même erreur
📧 Erreurs non critiques noyent les importantes
📧 Dashboard Sentry illisible
```

#### **Solutions :**

```bash
# 1. Grouping améliorer
# Sentry → Issues → Merge similar issues

# 2. Ignore patterns
# Project Settings → Inbound Filters → Add :
# → "ChunkLoadError" (deployment related)
# → "Network request failed" (connectivity)
# → "ResizeObserver loop limit" (browser bug)

# 3. Alert rules custom
# Alerts → Create Alert → Conditions :
# → "Issue is seen more than 10 times in 1 hour"
# → "Issue affects more than 5 users"

# 4. Environment separation
# → Sentry environments : development, production
# → Filtrer alerts production uniquement
```

---

## 📊 **PROBLÈMES FIREBASE ANALYTICS**

### **1. Events pas tracking / Dashboard vide**

#### **Symptômes :**

```bash
❌ Firebase Analytics Dashboard : 0 événements
❌ Events custom (meal_added) n'apparaissent pas
❌ Real-time view vide
```

#### **Solutions :**

```bash
# 1. Vérifier Firebase config
# .env.local doit contenir :
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX

# 2. Vérifier Analytics initialisé
# Console navigateur (F12) :
# → Onglet Network → Filtrer "google-analytics"
# → Doit montrer requêtes vers analytics

# 3. Test event manuel
# Console (F12) :
import { trackEvent } from '@/lib/analytics'
trackEvent('test_event', { test: 'manual' })
# → Check Firebase Real-time dans 2-3 minutes

# 4. Vérifier Data Processing
# Firebase Console → Analytics → Data Processing
# → Processing peut prendre 24-48h premières données

# 5. Debug mode
# Chrome extension : Google Analytics Debugger
# → Install extension → Enable → Voir events temps réel
```

### **2. Data Retention / Historical Data**

#### **Symptômes :**

```bash
⚠️ Données disparaissent après 2 mois
⚠️ Rapports historiques incomplets
⚠️ Trends analysis limités
```

#### **Solutions :**

```bash
# 1. Configurer Data Retention
# Firebase Console → Analytics → Data Settings
# → Data Retention : 26 months (max gratuit)

# 2. Export BigQuery (gratuit)
# Analytics → Configure → BigQuery Linking
# → Export daily : Raw event data
# → Queries custom SQL possibles

# 3. Scheduled exports
# Analytics → Configure → Data Export
# → Google Sheets (simple reports)
# → Looker Studio (dashboards)

# 4. Custom reporting
# Analytics Intelligence API
# → Automated reports
# → Historical data backup
```

### **3. Real-time Data Delays**

#### **Symptômes :**

```bash
⏰ Events apparaissent avec 10-30 min delay
⏰ Real-time dashboard pas vraiment "real-time"
⏰ Debug difficile car feedback lent
```

#### **Solutions :**

```bash
# 1. Console browser debugging
# F12 → Console → Logs immédiats :
[Analytics] Event: meal_added sent
# → Confirmation côté client immediate

# 2. Network tab verification
# F12 → Network → google-analytics requests
# → Status 200 = événement envoyé
# → Payload correct = données OK

# 3. DebugView Firebase
# Analytics → Configure → DebugView
# → Events apparaissent quasi-temps réel
# → Filtrer par device/user

# 4. Expectations management
# → Real-time : ~2-5 minutes
# → Reports standard : 24-48h
# → Custom events : premiers peuvent prendre 24h
```

---

## ⚡ **PROBLÈMES WEB VITALS**

### **1. Métriques pas collectées**

#### **Symptômes :**

```bash
❌ Sentry Performance tab vide
❌ Console : Pas de logs "[Web Vital]"
❌ Web Vitals alertes jamais déclenchées
```

#### **Solutions :**

```bash
# 1. Vérifier VitalsReporter activé
# src/app/layout.tsx doit contenir :
<VitalsReporter />

# 2. Vérifier web-vitals package
npm list web-vitals
# → Doit être version 4.x

# 3. Vérifier imports corrects
# src/lib/vitals.ts :
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'
# → Pas getFID (deprecated v4)

# 4. Test manuel console
# F12 → Console :
import { onLCP } from 'web-vitals'
onLCP((metric) => console.log('LCP:', metric.value))
# → Naviguer page → Doit logger LCP

# 5. Browser compatibility
# → Web Vitals supporté Chrome/Edge/Firefox récents
# → Safari support partiel
```

### **2. Métriques Poor / Performance dégradée**

#### **Symptômes :**

```bash
🔴 LCP > 4s (Poor rating)
🔴 INP > 500ms (Poor rating)
🔴 CLS > 0.25 (Poor rating)
🔴 Alertes Sentry performance
```

#### **Solutions :**

```bash
# 1. Diagnostic immédiat
npm run analyze:win
# → Bundle size analysis
# → Pages lourdes identifiées

# 2. Lighthouse audit local
npx lighthouse http://localhost:3000 --output=html
# → Recommandations spécifiques
# → Opportunities optimisation

# 3. Network throttling test
# F12 → Network → Slow 3G
# → Tester navigation app
# → Identifier goulots étranglement

# 4. Performance profiling
# F12 → Performance tab → Record
# → Reload page → Stop recording
# → Analyser main thread blocking

# 5. Quick fixes common issues :
# → Images sans dimensions (CLS)
# → Charts sync loading (LCP)
# → Heavy JavaScript main thread (INP)
# → Missing dynamic imports (LCP)
```

### **3. Mobile Performance vs Desktop**

#### **Symptômes :**

```bash
📱 Mobile metrics significantly worse
📱 LCP Mobile: 4s vs Desktop: 1.5s
📱 INP Mobile: 600ms vs Desktop: 150ms
📱 User complaints mobile slow
```

#### **Solutions :**

```bash
# 1. Device emulation testing
# Chrome DevTools → Device Toolbar
# → iPhone/Android simulation
# → Network throttling Mobile

# 2. Mobile-specific optimizations :
# Images responsive
<Image
  src="/image.jpg"
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={isMobile}
/>

# Touch targets minimum 44px
.button {
  min-height: 44px;
  min-width: 44px;
}

# 3. Bundle splitting mobile
const MobileOptimizedComponent = dynamic(
  () => import('@/components/mobile/MobileComponent'),
  {
    ssr: false,
    loading: () => <MobileSkeleton />
  }
)

# 4. Progressive enhancement
# → Core functionality without JavaScript
# → Enhanced features with JavaScript
# → Graceful degradation
```

---

## 🔄 **PROBLÈMES CI/CD & DEPLOYS**

### **1. GitHub Actions Failures**

#### **Symptômes :**

```bash
🔴 Build failed: TypeScript errors
🔴 Build failed: Tests failing
🔴 Deploy failed: Firebase error
```

#### **Solutions :**

```bash
# 1. TypeScript errors
# Local check first :
npm run typecheck
# → Fix errors locally → Push

# 2. Tests failing
npm run test:lib
# → Focus on passing tests only
# → Skip Firebase hooks tests if problematic

# 3. Firebase deploy errors
# Check Firebase quota :
# Firebase Console → Usage and billing
# → Functions executions
# → Hosting bandwidth

# 4. Secrets expired
# GitHub → Settings → Secrets and variables
# → Regenerate FIREBASE_SERVICE_ACCOUNT
# → Update secret value

# 5. Re-run failed workflow
# GitHub Actions → Failed workflow → "Re-run jobs"
```

### **2. Deploy Successful but Site Not Updated**

#### **Symptômes :**

```bash
✅ GitHub Actions green
✅ Firebase deploy successful
❌ Site shows old version
❌ Changes not visible
```

#### **Solutions :**

```bash
# 1. Cache busting
# Hard refresh : Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
# → Force reload bypass cache

# 2. Firebase Hosting cache
# Firebase Console → Hosting → View
# → Check "Last deployed" timestamp
# → Should match recent deployment

# 3. CDN propagation
# → Changes may take 5-15 minutes global
# → Test from different locations/devices

# 4. Browser dev tools verification
# F12 → Network → Disable cache
# → Reload page → Fresh resources

# 5. Version verification
# Console log app version :
console.log('App version:', process.env.NEXT_PUBLIC_APP_VERSION)
# → Should match package.json version
```

### **3. Bundle Size Increased Dramatically**

#### **Symptômes :**

```bash
⚠️ npm run analyze shows pages >500kB
⚠️ First Load JS increased 50%+
⚠️ Performance alerts triggered
⚠️ Slow loading reports users
```

#### **Solutions :**

```bash
# 1. Bundle analysis comparison
npm run analyze:win
# → Compare with previous builds
# → Identify heaviest new additions

# 2. Check dynamic imports
grep -r "dynamic(" src/
# → Verify charts still dynamic
# → Verify modals still dynamic

# 3. Dependencies audit
npm list --depth=0
# → New heavy dependencies ?
# → Unused dependencies to remove

# 4. Webpack bundle analyzer
# → Interface shows exact chunk sizes
# → Drill down to specific modules

# 5. Rollback if critical
git revert [commit-hash]
git push origin main
# → Immediate rollback if performance critical
```

---

## 🛠️ **PROBLÈMES DÉVELOPPEMENT LOCAL**

### **1. Environment Variables Issues**

#### **Symptômes :**

```bash
❌ Firebase connection fails
❌ Sentry not working locally
❌ Analytics not tracking
❌ "env variable undefined"
```

#### **Solutions :**

```bash
# 1. Verify .env.local exists
ls -la .env.local
# → File must exist in project root

# 2. Check all required variables
cat .env.local
# Must contain all NEXT_PUBLIC_* variables

# 3. Restart dev server after .env changes
# Stop with Ctrl+C → npm run dev

# 4. Verify variable loading
# Console (F12) :
console.log(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
# → Should print project ID, not undefined

# 5. Copy from example
cp .env.local.example .env.local
# → Fill with your real values
```

### **2. Node/NPM Version Issues**

#### **Symptômes :**

```bash
❌ npm install fails
❌ npm run dev fails
❌ Module resolution errors
❌ TypeScript compilation errors
```

#### **Solutions :**

```bash
# 1. Check Node.js version
node --version
# → Should be 20.x or 18.x

# 2. Check NPM version
npm --version
# → Should be 9.x or 10.x

# 3. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# 4. Use specific Node version (nvm)
nvm install 20
nvm use 20
npm install

# 5. Check package.json engines
# → Verify compatibility requirements
```

### **3. Port/Process Issues**

#### **Symptômes :**

```bash
❌ Error: Port 3000 already in use
❌ EADDRINUSE :::3000
❌ Dev server won't start
```

#### **Solutions :**

```bash
# 1. Kill process on port 3000
# Windows :
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# macOS/Linux :
lsof -ti:3000 | xargs kill -9

# 2. Use different port
npm run dev -- --port 3001

# 3. Check for hanging Node processes
ps aux | grep node
# → Kill any orphaned processes

# 4. Restart terminal/computer
# → Last resort if processes stuck
```

---

## 📞 **ESCALATION & SUPPORT**

### **🆘 When to Escalate**

```bash
# Immediate escalation (< 1 hour) :
❌ Site completely down >30 minutes
❌ Data loss detected
❌ Security incident suspected
❌ Error rate >50%

# Normal escalation (< 24 hours) :
⚠️ Performance degraded >6 hours
⚠️ Core feature broken
⚠️ Multiple user complaints
⚠️ Monitoring completely broken
```

### **📋 Escalation Checklist**

```bash
# Before escalating, gather :
✅ Timeline of issue (when started)
✅ Steps to reproduce
✅ Impact assessment (users affected)
✅ Attempted solutions
✅ Relevant logs/screenshots
✅ Current workarounds
```

### **🔗 Support Resources**

```bash
# Firebase Support :
# → https://firebase.google.com/support/contact/troubleshooting

# Sentry Support :
# → https://sentry.io/support/

# Next.js Support :
# → https://github.com/vercel/next.js/discussions

# Community Support :
# → Stack Overflow (tag: nextjs, firebase, sentry)
# → Discord servers (Next.js, Firebase)
```

---

## ✅ **TROUBLESHOOTING MAÎTRISÉ**

**Tu sais maintenant :**

- ✅ Diagnostiquer problèmes Sentry
- ✅ Résoudre issues Firebase Analytics
- ✅ Fixer problèmes Web Vitals
- ✅ Débugger CI/CD et déploiements
- ✅ Gérer environnement local
- ✅ Escalader si nécessaire

**🎉 Guide Monitoring SuperNovaFit Complet !**

**Retour au sommaire : [Guide README →](./README.md)**
