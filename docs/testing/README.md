# 🧪 Guide Testing - SuperNovaFit v3.0.0

**Dernière MAJ :** 23.10.2025  
**Status :** ✅ 100% Tests Passent | 📈 Coverage × 4

---

## 📋 NAVIGATION RAPIDE

| Document                                     | Usage                      | Audience     |
| -------------------------------------------- | -------------------------- | ------------ |
| **[README.md](README.md)** (ce fichier)      | Point d'entrée, navigation | Tous         |
| **[STATUS.md](STATUS.md)**                   | État actuel (MAJ 23.10) ⭐ | Management   |
| **[UNIT_TESTS.md](UNIT_TESTS.md)**           | Tests unitaires Vitest     | Développeurs |
| **[E2E_TESTS.md](E2E_TESTS.md)**             | Tests E2E Playwright       | QA, Devs     |
| **[COVERAGE_REPORT.md](COVERAGE_REPORT.md)** | Coverage + analyse         | Tech Lead    |

**🆕 Voir aussi** : [AUDIT_3_AXES_PRIORITAIRES.md](../technical/AUDIT_3_AXES_PRIORITAIRES.md) - Documentation unifiée complète

---

## 🎯 VUE D'ENSEMBLE

### État Actuel (23.10.2025)

```
✅ Tests Unitaires:  475/475 (100%) (+54% depuis 08.10)
⏸️  Tests Skippés:    103 (60 hooks + 21 forms + 22 dashboards)
📋 Tests E2E:        215 (Complet et stable)
📊 Coverage:         18.07% (+302%!) 🏆
```

**Objectif 25% : 72% atteint** | **Prochaine étape : réactiver hooks (+5-8%)**

### Quick Start

```bash
# Tests Unitaires
npm test                 # Mode watch
npm run test:coverage    # Avec coverage

# Tests E2E
npm run test:e2e:ui      # Interface Playwright (recommandé)
npm run test:e2e         # Headless (CI)
```

---

## 📊 RÉSUMÉ PAR TYPE

### Tests Unitaires (578 tests créés, 475 actifs)

| Catégorie         | Tests | Coverage | Fichiers | Status           |
| ----------------- | ----- | -------- | -------- | ---------------- |
| **Lib Utils**     | 155   | 95%+     | 10       | ✅ Excellent     |
| **Charts & Data** | 123   | 80%+     | 5        | ✅ Excellent     |
| **Forms**         | 40    | ~50%     | 5        | ✅ Bon (21 skip) |
| **Security**      | 64    | 58%      | 4        | ✅ Bon           |
| **Dashboards**    | 27    | ~15%     | 3        | ⚠️ Basique       |
| **Hooks**         | 106   | Var.     | 10       | ⏸️ 60 skippés    |
| **Components UI** | 63    | ~20%     | 6        | ✅ Acceptable    |

**Détails :** Voir [UNIT_TESTS.md](UNIT_TESTS.md) et [STATUS.md](STATUS.md)

### Tests E2E (215 tests)

| Module       | Tests | Navigateurs |
| ------------ | ----- | ----------- |
| **Auth**     | 10    | × 5 = 50    |
| **Meals**    | 13    | × 5 = 65    |
| **Training** | 10    | × 5 = 50    |
| **Coach**    | 11    | × 5 = 55    |

**Détails :** Voir [E2E_TESTS.md](E2E_TESTS.md)

### Coverage (4.49%)

| Métrique   | Valeur | Objectif |
| ---------- | ------ | -------- |
| Statements | 4.49%  | 25%      |
| Branches   | 73.74% | 80%      |
| Functions  | 76.55% | 80%      |

**Détails :** Voir [COVERAGE_REPORT.md](COVERAGE_REPORT.md)

---

## 🎯 POUR COMMENCER

### Développeur

1. **Lire** [UNIT_TESTS.md](UNIT_TESTS.md) - Structure et conventions
2. **Créer** un test - Suivre les templates
3. **Exécuter** `npm test` - Vérifier que tout passe

### QA / Testeur

1. **Lire** [E2E_TESTS.md](E2E_TESTS.md) - Configuration et exécution
2. **Configurer** `.env.test` - Credentials Firebase
3. **Lancer** `npm run test:e2e:ui` - Interface Playwright

### Tech Lead

1. **Consulter** [COVERAGE_REPORT.md](COVERAGE_REPORT.md) - Métriques détaillées
2. **Vérifier** [STATUS.md](STATUS.md) - État gelé validé
3. **Planifier** amélioration coverage (25%)

---

## 📈 ÉVOLUTION

| Date           | Tests   | Coverage  | Action                     |
| -------------- | ------- | --------- | -------------------------- |
| 27.09.2025     | 180     | 2.16%     | Baseline                   |
| 01.10.2025     | 217     | 3.93%     | +37 tests                  |
| **08.10.2025** | **308** | **4.49%** | **+91 tests, corrections** |

**Progression :** +128 tests (+71%), +2.33% coverage

---

## 🚀 COMMANDES RAPIDES

```bash
# Tests Unitaires
npm test                    # Mode watch
npm run test:ui             # Interface Vitest
npm run test:coverage       # Avec coverage
npm test -- <pattern>       # Tests spécifiques

# Tests E2E
npm run test:e2e            # Tous (headless)
npm run test:e2e:ui         # Interface (recommandé)
npm run test:e2e:headed     # Voir navigateur
npm run test:e2e:debug      # Mode debug
npm run test:e2e:report     # Rapport HTML

# Qualité
npm run lint                # ESLint
npm run typecheck           # TypeScript
npm run build               # Validation build
```

---

## 📚 RESSOURCES

### Documentation

- [Vitest](https://vitest.dev/) - Framework tests unitaires
- [Playwright](https://playwright.dev/) - Framework tests E2E
- [React Testing Library](https://testing-library.com/react) - Tests composants

### Guides Complémentaires

- [Guide Pratique Testing/CI-CD](../guides/GUIDE_PRATIQUE_TESTING_CICD.md) - Pour débutants
- [Utilisateurs de Test](../guides/TEST_USERS_SUMMARY.md) - Credentials Firebase
- [Progression E2E](../../audit-2025-10/TESTS_PROGRESSION.md) - Historique audit

### Configuration

- `src/test/setup.ts` - Configuration Vitest
- `playwright.config.ts` - Configuration Playwright
- `vitest.config.ts` - Configuration Vitest
- `.env.test` - Credentials tests

---

**SuperNovaFit v2.0.0** - Guide Testing Centralisé 🧪
