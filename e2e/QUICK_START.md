# 🚀 Quick Start - Tests E2E

## ⚡ Lancement Rapide (5 min)

### Étape 1 : Configurer les Mots de Passe (2 min)

Les utilisateurs **existent déjà** dans Firebase :

- ✅ `test@supernovafit.com` (sportif)
- ✅ `coach@supernovafit.com` (coach)

**Action requise :**

1. Éditer le fichier `.env.test` à la racine
2. Remplacer les placeholders par les vrais mots de passe :

```bash
# .env.test
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000

# ⚠️ REMPLACER PAR LES VRAIS MOTS DE PASSE
TEST_USER_EMAIL=test@supernovafit.com
TEST_USER_PASSWORD=VotreVraiMotDePasse

TEST_COACH_EMAIL=coach@supernovafit.com
TEST_COACH_PASSWORD=VotreVraiMotDePasseCoach
```

---

### Étape 2 : Démarrer le Serveur Dev (30s)

```bash
npm run dev
```

Attendre que le serveur démarre sur `http://localhost:3000`

---

### Étape 3 : Lancer les Tests (2 min)

**Option 1 : Mode UI (Recommandé)** 🎯

```bash
npm run test:e2e:ui
```

Dans l'interface Playwright :

- Cliquer sur "Run all" en haut à gauche
- Voir les 10 tests s'exécuter en temps réel
- ✅ Tous devraient passer (vert)

**Option 2 : Mode Headless (CI)**

```bash
npm run test:e2e
```

**Option 3 : Mode Debug**

```bash
npm run test:e2e:debug
```

---

## 🎯 Résultat Attendu

```
✅ 10 tests passed (auth.spec.ts)

Tests:
  ✅ should redirect to /auth when not authenticated
  ✅ should show error on invalid credentials
  ✅ should login successfully with valid credentials
  ✅ should stay authenticated after page reload
  ✅ should logout successfully
  ✅ should protect /diete route when not authenticated
  ✅ should protect /entrainements route when not authenticated
  ✅ should protect /mesures route when not authenticated
  ✅ should protect /journal route when not authenticated
  ⏸️  should register new user successfully (SKIPPED)
```

---

## 🚨 Si un Test Échoue

### Problème : "Invalid email or password"

**Solution :**

1. Vérifier que les mots de passe dans `.env.test` sont corrects
2. Tester le login manuel sur `http://localhost:3000`
3. Si le login manuel fonctionne, le problème vient d'ailleurs

### Problème : "Timeout waiting for..."

**Solution :**

1. Vérifier que le serveur dev tourne (`npm run dev`)
2. Vérifier que `http://localhost:3000` est accessible
3. Augmenter les timeouts dans `playwright.config.ts` si nécessaire

### Problème : "Permission denied" (Firestore)

**Solution :**

1. Vérifier que les documents Firestore existent :
   - `users/[UID_test]` avec `role: "sportif"`
   - `users/[UID_coach]` avec `role: "coach"`
2. Vérifier que les Firestore Rules sont déployées

---

## 📊 Validation Réussie

Si les 10 tests passent :

**🎉 Phase 1 VALIDÉE !**

On peut passer à **Phase 2 : Meal Tracking** (15 tests)

---

## 🔍 Debugging Avancé

### Voir les Logs Détaillés

```bash
# Mode headed (voir navigateur)
npm run test:e2e:headed

# Mode debug (breakpoints)
npm run test:e2e:debug
```

### Voir le Rapport HTML

```bash
npm run test:e2e:report
```

### Screenshots et Videos

En cas d'échec, automatiquement générés dans :

- `test-results/[test-name]/`

---

## 📝 Notes Importantes

1. **`.env.test` n'est PAS commité** (dans `.gitignore`)
2. **Ne jamais utiliser de vrais utilisateurs** pour les tests
3. **Les tests modifient les données** (créer/supprimer repas, entrainements)
4. **Utiliser Firebase Emulator** en prod (recommandé pour CI/CD)

---

**SuperNovaFit v2.0.0** - Quick Start Tests E2E 🚀✅

_Mis à jour : 02.10.2025_
