# 🎯 Guide Step-by-Step : Lancer les Tests E2E

**Durée totale :** 3 minutes ⏱️

---

## 📋 Prérequis (Déjà Fait ✅)

- ✅ Playwright installé
- ✅ 10 tests auth créés (`e2e/auth.spec.ts`)
- ✅ Utilisateurs Firebase existent (`test@supernovafit.com`, `coach@supernovafit.com`)

---

## 🚀 ÉTAPE 1 : Configurer les Mots de Passe (1 min)

### Éditer le fichier `.env.test` à la racine du projet

```bash
# .env.test (à la racine : D:\SuperNovaFit\.env.test)

PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000

# ⚠️ REMPLACER par les VRAIS mots de passe Firebase
TEST_USER_EMAIL=test@supernovafit.com
TEST_USER_PASSWORD=TonVraiMotDePasse

TEST_COACH_EMAIL=coach@supernovafit.com
TEST_COACH_PASSWORD=TonVraiMotDePasseCoach
```

**Comment trouver les mots de passe ?**

- Si tu les connais → Les mettre directement
- Sinon → Reset password dans Firebase Console

---

## 🚀 ÉTAPE 2 : Démarrer le Serveur Dev (30 secondes)

### Ouvrir un **Terminal 1** :

```bash
npm run dev
```

**✅ Attendre le message :**

```
▲ Next.js 15.1.0
- Local:        http://localhost:3000
✓ Ready in 3.2s
```

---

## 🚀 ÉTAPE 3 : Lancer les Tests (1 min)

### Ouvrir un **Terminal 2** :

```bash
npm run test:e2e:ui
```

**Une interface graphique s'ouvre (Playwright UI) :**

1. ✅ Voir la liste des tests dans `auth.spec.ts`
2. ✅ Cliquer sur le bouton **"Run all"** en haut à gauche
3. ✅ Observer les tests s'exécuter en temps réel

---

## 🎯 Résultat Attendu

```
✅ 10 passed (30 secondes)

Authentication Flow
  ✅ should redirect to /auth when not authenticated
  ✅ should show error on invalid credentials
  ✅ should login successfully with valid credentials
  ✅ should stay authenticated after page reload
  ✅ should logout successfully
  ✅ should protect /diete route
  ✅ should protect /entrainements route
  ✅ should protect /mesures route
  ✅ should protect /journal route
  ⏸️  should register new user (SKIPPED)
```

---

## ✅ Si Tout Passe

**🎉 BRAVO ! Phase 1 Validée !**

**Coverage :** 3.93% → ~5% (+1.07%)

**Prochaine étape :**

- Phase 2 : Meal Tracking (15 tests)

---

## 🚨 Si un Test Échoue

### Erreur : "Invalid email or password"

**Cause :** Mots de passe incorrects dans `.env.test`

**Solution :**

1. Tester le login manuel sur `http://localhost:3000`
2. Si ça marche → Vérifier que `.env.test` a bien les mêmes mots de passe
3. Si ça ne marche pas → Reset password dans Firebase

### Erreur : "Timeout waiting for selector"

**Cause :** Serveur dev pas démarré ou page lente

**Solution :**

1. Vérifier que `npm run dev` tourne dans Terminal 1
2. Ouvrir `http://localhost:3000` dans navigateur pour tester
3. Relancer les tests

### Erreur : "Navigation failed"

**Cause :** Port 3000 occupé ou serveur crashé

**Solution :**

1. Arrêter `npm run dev` (Ctrl+C)
2. Redémarrer `npm run dev`
3. Attendre "Ready in X.Xs"
4. Relancer tests

---

## 🔍 Debugging Avancé (Si Besoin)

### Voir le navigateur en action

```bash
npm run test:e2e:headed
```

### Mode debug avec breakpoints

```bash
npm run test:e2e:debug
```

### Voir le rapport détaillé

```bash
npm run test:e2e:report
```

---

## 📊 Résumé Visual

```
┌─────────────────────────────────────────┐
│  1. Éditer .env.test (1 min)            │
│     └─ Mettre vrais mots de passe       │
├─────────────────────────────────────────┤
│  2. Terminal 1: npm run dev (30s)       │
│     └─ Attendre "Ready in X.Xs"         │
├─────────────────────────────────────────┤
│  3. Terminal 2: npm run test:e2e:ui     │
│     └─ Cliquer "Run all"                │
├─────────────────────────────────────────┤
│  ✅ Résultat: 10 tests passed           │
└─────────────────────────────────────────┘
```

---

## 📞 Besoin d'Aide ?

**Documentation complète :**

- `e2e/README.md` - Guide complet tests E2E
- `audit-2025-10/TESTS_PROGRESSION.md` - Suivi 4 phases
- `playwright.config.ts` - Configuration technique

**Logs utiles :**

- Tests : `test-results/`
- Screenshots : Automatiques en cas d'échec
- Videos : Conservées si échec

---

**SuperNovaFit v2.0.0** - Guide Step-by-Step Tests E2E 🚀

_Version : 1.0 - 02.10.2025_
