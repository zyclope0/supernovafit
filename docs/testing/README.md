# 🧪 Guide Testing - SuperNovaFit v2.0.0

**Dernière MAJ :** 08.10.2025  
**Status :** ✅ 100% Tests Passent | 🔒 Gelé

---

## 📋 NAVIGATION RAPIDE

| Document                                     | Usage                      | Audience     |
| -------------------------------------------- | -------------------------- | ------------ |
| **[README.md](README.md)** (ce fichier)      | Point d'entrée, navigation | Tous         |
| **[UNIT_TESTS.md](UNIT_TESTS.md)**           | Tests unitaires Vitest     | Développeurs |
| **[E2E_TESTS.md](E2E_TESTS.md)**             | Tests E2E Playwright       | QA, Devs     |
| **[COVERAGE_REPORT.md](COVERAGE_REPORT.md)** | Coverage + analyse         | Tech Lead    |
| **[STATUS.md](STATUS.md)**                   | État actuel (gelé 08.10)   | Management   |

---

## 🎯 VUE D'ENSEMBLE

### État Actuel (08.10.2025)

```
✅ Tests Unitaires:  308/308 (100%)
⏸️  Tests Skippés:    13 (Badges)
📋 Tests E2E:        215 (Disponibles)
📊 Coverage:         4.49% (objectif 25%)
```

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

### Tests Unitaires (321 tests)

| Catégorie         | Tests | Coverage | Fichiers |
| ----------------- | ----- | -------- | -------- |
| **Lib Utils**     | 155   | 21.79%   | 10       |
| **Security**      | 64    | 58.06%   | 4        |
| **Components UI** | 56    | 5.14%    | 6        |
| **Hooks**         | 46    | 8.32%    | 5        |

**Détails :** Voir [UNIT_TESTS.md](UNIT_TESTS.md)

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
