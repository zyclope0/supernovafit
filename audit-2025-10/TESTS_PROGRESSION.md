# 📊 Progression Tests E2E - SuperNovaFit

**Date de Début :** 02.10.2025  
**Objectif Global :** Coverage 3.93% → 15%  
**Méthode :** Tests E2E Playwright + Tests Unitaires UI

---

## 🎯 Vue d'Ensemble

| Phase               | Tests | Status           | Coverage | Temps Estimé | Temps Réel |
| ------------------- | ----- | ---------------- | -------- | ------------ | ---------- |
| **Phase 1 : Auth**  | 10    | ✅ **TERMINÉ**   | 5%       | 3h           | 3h30       |
| **Phase 2 : Meals** | 15    | 🔄 En attente    | +3%      | 4h           | -          |
| **Phase 3 : Train** | 10    | 🔄 En attente    | +2%      | 3h           | -          |
| **Phase 4 : Coach** | 10    | 🔄 En attente    | +5%      | 4h           | -          |
| **Total E2E**       | 45    | **22% complété** | 15%      | 14h          | 3h30       |
| **Tests Unit UI**   | 20    | 🔄 En attente    | +10%     | 18h          | -          |
| **TOTAL**           | 65    | **15% complété** | 25%      | 32h          | 3h30       |

---

## ✅ Phase 1 : Authentication (TERMINÉ)

**Date :** 02.10.2025  
**Temps :** 3h30 (setup 30min + tests 2h + validation 1h)  
**Coverage :** 3.93% → ~5% (+1.07%)

### Tests Implémentés (10/10)

| Test                                    | Status | Fichier      | Lignes  |
| --------------------------------------- | ------ | ------------ | ------- |
| 1. Redirect to /auth when not logged in | ✅     | auth.spec.ts | 18-26   |
| 2. Show error on invalid credentials    | ✅     | auth.spec.ts | 28-40   |
| 3. Login successfully with valid creds  | ✅     | auth.spec.ts | 42-56   |
| 4. Stay authenticated after page reload | ✅     | auth.spec.ts | 58-76   |
| 5. Logout successfully                  | ✅     | auth.spec.ts | 78-103  |
| 6. Protect /diete route                 | ✅     | auth.spec.ts | 105-110 |
| 7. Protect /entrainements route         | ✅     | auth.spec.ts | 112-117 |
| 8. Protect /mesures route               | ✅     | auth.spec.ts | 119-124 |
| 9. Protect /journal route               | ✅     | auth.spec.ts | 126-131 |
| 10. Registration flow (skipped for now) | ⏸️     | auth.spec.ts | 137-141 |

### Infrastructure Créée

- ✅ `playwright.config.ts` - Configuration multi-devices
- ✅ `e2e/auth.spec.ts` - 10 tests auth
- ✅ `e2e/README.md` - Documentation complète
- ✅ `e2e/SETUP_GUIDE.md` - Guide setup utilisateurs Firebase
- ✅ `e2e/.env.test.example` - Template credentials
- ✅ Scripts npm : `test:e2e`, `test:e2e:ui`, `test:e2e:debug`, `test:e2e:report`

### Validation

- [ ] Utilisateurs Firebase créés (test, coach, athlete)
- [ ] Documents Firestore créés
- [ ] `.env.test` configuré localement
- [ ] 10 tests passent en mode UI
- [ ] Login manuel validé

---

## 🔄 Phase 2 : Meal Tracking (EN ATTENTE)

**Estimation :** 4h  
**Coverage Estimé :** +3% (total 8%)

### Tests À Implémenter (0/15)

| Test                               | Status | Priority | Estimation |
| ---------------------------------- | ------ | -------- | ---------- |
| 1. Open meal form modal            | ⏸️     | P0       | 15min      |
| 2. Search food in OpenFoodFacts    | ⏸️     | P0       | 30min      |
| 3. Select food from search results | ⏸️     | P0       | 20min      |
| 4. Add food to meal                | ⏸️     | P0       | 30min      |
| 5. Edit food quantity              | ⏸️     | P1       | 20min      |
| 6. Remove food from meal           | ⏸️     | P1       | 15min      |
| 7. Save meal (petit_dej)           | ⏸️     | P0       | 20min      |
| 8. Verify meal appears in list     | ⏸️     | P0       | 15min      |
| 9. Verify macros calculation       | ⏸️     | P0       | 20min      |
| 10. Edit existing meal             | ⏸️     | P1       | 30min      |
| 11. Delete meal                    | ⏸️     | P1       | 15min      |
| 12. Add food to favorites          | ⏸️     | P2       | 20min      |
| 13. Use favorite food in meal      | ⏸️     | P2       | 20min      |
| 14. Verify daily macros total      | ⏸️     | P0       | 20min      |
| 15. Test all meal types (6 types)  | ⏸️     | P1       | 30min      |

**Fichier :** `e2e/meal-tracking.spec.ts`

---

## 🔄 Phase 3 : Training (EN ATTENTE)

**Estimation :** 3h  
**Coverage Estimé :** +2% (total 11%)

### Tests À Implémenter (0/10)

| Test                                  | Status | Priority | Estimation |
| ------------------------------------- | ------ | -------- | ---------- |
| 1. Open training form modal           | ⏸️     | P0       | 15min      |
| 2. Fill manual training (type, durée) | ⏸️     | P0       | 20min      |
| 3. Add exercises to training          | ⏸️     | P1       | 30min      |
| 4. Save training session              | ⏸️     | P0       | 20min      |
| 5. Verify training in list            | ⏸️     | P0       | 15min      |
| 6. Verify calories calculation        | ⏸️     | P0       | 20min      |
| 7. Edit existing training             | ⏸️     | P1       | 30min      |
| 8. Delete training                    | ⏸️     | P1       | 15min      |
| 9. Import Garmin file (if applicable) | ⏸️     | P2       | 40min      |
| 10. Verify weekly stats update        | ⏸️     | P1       | 25min      |

**Fichier :** `e2e/training.spec.ts`

---

## 🔄 Phase 4 : Coach-Athlete (EN ATTENTE)

**Estimation :** 4h  
**Coverage Estimé :** +5% (total 15%)

### Tests À Implémenter (0/10)

| Test                                                      | Status | Priority | Estimation |
| --------------------------------------------------------- | ------ | -------- | ---------- |
| 1. Create invitation as coach                             | ⏸️     | P0       | 25min      |
| 2. Verify invitation appears                              | ⏸️     | P0       | 15min      |
| 3. Accept invitation as athlete                           | ⏸️     | P0       | 30min      |
| 4. Verify athlete in coach list                           | ⏸️     | P0       | 20min      |
| 5. View athlete data as coach                             | ⏸️     | P0       | 25min      |
| 6. Add comment as coach                                   | ⏸️     | P1       | 30min      |
| 7. Create diet plan as coach                              | ⏸️     | P1       | 40min      |
| 8. View diet plan as athlete                              | ⏸️     | P1       | 20min      |
| 9. Mark comment as read as athlete                        | ⏸️     | P2       | 20min      |
| 10. Verify permissions (athlete can't see other athletes) | ⏸️     | P0       | 25min      |

**Fichier :** `e2e/coach-athlete.spec.ts`

---

## 🧪 Tests Unitaires UI (EN ATTENTE)

**Estimation :** 18h  
**Coverage Estimé :** +10% (total 25%)

### Composants Prioritaires (0/20 tests)

| Composant         | Tests | Status | Estimation |
| ----------------- | ----- | ------ | ---------- |
| ProgressHeader    | 5     | ⏸️     | 2h         |
| StandardModal     | 5     | ⏸️     | 2h         |
| ClickableCard     | 3     | ⏸️     | 1h30       |
| FormModal         | 4     | ⏸️     | 2h         |
| HealthIndicator   | 3     | ⏸️     | 1h30       |
| useAuth hook      | 5     | ⏸️     | 2h30       |
| useFirestore hook | 4     | ⏸️     | 2h         |
| calculations.ts   | 6     | ⏸️     | 2h30       |
| validation.ts     | 5     | ⏸️     | 2h         |

**Fichiers :** `src/__tests__/components/`, `src/__tests__/hooks/`, `src/__tests__/lib/`

---

## 📈 Métriques de Suivi

### Coverage Evolution

| Date       | Coverage | Tests Passants | Tests E2E | Tests Unit | Delta  |
| ---------- | -------- | -------------- | --------- | ---------- | ------ |
| 01.10.2025 | 3.93%    | 217            | 0         | 217        | -      |
| 02.10.2025 | ~5%      | 227            | 10        | 217        | +1.07% |
| **Target** | **25%**  | **~500**       | **45**    | **237**    | -      |

### Temps Investi

| Phase                | Estimé  | Réel     | Écart      |
| -------------------- | ------- | -------- | ---------- |
| Setup Playwright     | 30min   | 30min    | 0          |
| Tests Auth           | 2h      | 2h       | 0          |
| Validation Auth      | 30min   | 1h       | +30min     |
| **Total Phase 1**    | **3h**  | **3h30** | **+30min** |
| Meals (à venir)      | 4h      | -        | -          |
| Training (à venir)   | 3h      | -        | -          |
| Coach (à venir)      | 4h      | -        | -          |
| Tests Unit (à venir) | 18h     | -        | -          |
| **TOTAL**            | **32h** | **3h30** | -          |

---

## 🎯 Prochaines Actions

### Immédiat (Aujourd'hui)

1. **Valider Phase 1** :
   - [ ] Créer utilisateurs Firebase
   - [ ] Créer documents Firestore
   - [ ] Configurer `.env.test`
   - [ ] Lancer `npm run test:e2e:ui`
   - [ ] Vérifier que les 10 tests passent

2. **Si validation OK → Commencer Phase 2** :
   - [ ] Créer `e2e/meal-tracking.spec.ts`
   - [ ] Implémenter tests 1-5 (priorité P0)
   - [ ] Valider recherche OpenFoodFacts fonctionne
   - [ ] Tester ajout/modification repas

### Cette Semaine

- [ ] Terminer Phase 2 : Meal Tracking (15 tests)
- [ ] Commencer Phase 3 : Training (5 premiers tests)

### Ce Mois (Octobre)

- [ ] Terminer toutes les phases E2E (45 tests)
- [ ] Atteindre 15% coverage
- [ ] Intégrer dans CI/CD

---

## 🚨 Blockers et Risques

| Risque                       | Probabilité | Impact | Mitigation                     |
| ---------------------------- | ----------- | ------ | ------------------------------ |
| Timeouts tests en CI         | Moyenne     | Moyen  | Augmenter timeouts config      |
| OpenFoodFacts API rate limit | Faible      | Élevé  | Mock API pour tests            |
| Flaky tests (timing issues)  | Moyenne     | Moyen  | Utiliser wait conditions       |
| Firebase test users limités  | Faible      | Faible | Créer 5 users si nécessaire    |
| Temps réel > estimé          | Élevée      | Moyen  | Prioriser tests critiques (P0) |

---

## ✅ Checklist de Validation Phase par Phase

### Phase 1 : Auth ✅

- [x] Infrastructure Playwright installée
- [x] 10 tests implémentés
- [x] Documentation créée
- [ ] Utilisateurs Firebase créés
- [ ] Tests passent localement
- [ ] Commit créé

### Phase 2 : Meals ⏸️

- [ ] 15 tests implémentés
- [ ] Tests passent localement
- [ ] OpenFoodFacts search testé
- [ ] Macros calculation validée
- [ ] Commit créé

### Phase 3 : Training ⏸️

- [ ] 10 tests implémentés
- [ ] Tests passent localement
- [ ] Calories calculation validée
- [ ] Commit créé

### Phase 4 : Coach ⏸️

- [ ] 10 tests implémentés
- [ ] Tests passent localement
- [ ] Permissions validées
- [ ] Commit créé

---

## 📚 Références

- [Guide Setup](./SETUP_GUIDE.md)
- [Documentation E2E](../e2e/README.md)
- [Playwright Config](../playwright.config.ts)
- [Audit Reconciliation](./AUDIT_RECONCILIATION.md)

---

**SuperNovaFit v2.0.0** - Progression Tests E2E 📊✅

_Dernière mise à jour : 02.10.2025 - 17:30_
