# 🎯 PLAN D'OPTIMISATION TESTS - SuperNovaFit

**Date**: 22 Octobre 2025  
**Contexte**: Axe 2 - Qualité (Coverage 5% → 25%)  
**Durée estimée**: 9-10h (2h optimisation + 7-8h nouveaux tests)

---

## 📊 **ÉTAT ACTUEL**

```yaml
Tests Totaux: 398 passants
Coverage Global: ~5-6%
Objectif 30j: 25%
Gap: -20%

Problèmes Critiques:
  ❌ Graphiques: 90 tests mais 0% coverage (Recharts mocké)
  ❌ Hooks Firestore: 30% coverage (15/20 non testés)
  ❌ Formulaires: 0% coverage
  ❌ Dashboards: 0% coverage
```

---

## 🚀 **PHASE 1 : OPTIMISATION (2h) - PRIORITÉ CRITIQUE**

### **Objectif**: Corriger le coverage 0% des graphiques

#### **Problème Détecté**

```typescript
// ❌ Situation actuelle
// Composant: src/components/charts/MesuresCharts.tsx
export default function MesuresCharts({ mesures }: Props) {
  // 100 lignes de logique de transformation
  const chartData = useMemo(() => {
    return mesures
      .filter((m) => m.date)
      .map((m) => {
        const dateStr = timestampToDateString(m.date);
        if (isNaN(new Date(dateStr).getTime())) {
          console.warn('Invalid date:', { date: m.date, dateStr });
          return null;
        }
        return {
          date: dateStr,
          poids: m.poids || null,
          imc: m.imc || null,
          masse_grasse: m.masse_grasse || null,
          // ... 10 autres champs
        };
      })
      .filter((d): d is NonNullable<typeof d> => d !== null);
  }, [mesures]);

  return <LineChart data={chartData}>...</LineChart>; // ← Mocké dans les tests
}

// Test: src/__tests__/components/charts/MesuresCharts.test.tsx
vi.mock('recharts', () => ({
  LineChart: () => <div data-testid="line-chart" />,
}));

// Résultat: Vitest voit 0% du code exécuté (tout est dans le mock)
```

#### **Solution : Extraire la logique**

**Étape 1** : Créer `src/lib/chartDataTransformers.ts`

```typescript
import { Timestamp } from "firebase/firestore";
import { timestampToDateString } from "./dateUtils";
import type { Mesure, Entrainement } from "@/types";

// ✅ Fonction pure, 100% testable
export function prepareMesuresChartData(mesures: Mesure[]): ChartData[] {
  return mesures
    .filter((m) => m.date)
    .map((m) => {
      const dateStr = timestampToDateString(m.date);

      // Validation date
      if (isNaN(new Date(dateStr).getTime())) {
        console.warn("Invalid date in prepareMesuresChartData:", {
          original: m.date,
          converted: dateStr,
        });
        return null;
      }

      return {
        date: dateStr,
        poids: m.poids || null,
        imc: m.imc || null,
        masse_grasse: m.masse_grasse || null,
        masse_musculaire: m.masse_musculaire || null,
        tour_taille: m.tour_taille || null,
        tour_hanches: m.tour_hanches || null,
        tour_bras: m.tour_bras || null,
        tour_cuisses: m.tour_cuisses || null,
        tour_cou: m.tour_cou || null,
        tour_poitrine: m.tour_poitrine || null,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);
}

export type ChartData = NonNullable<
  ReturnType<typeof prepareMesuresChartData>[number]
>;

// ✅ Fonction pure pour HeartRate
export function prepareHeartRateChartData(
  entrainements: Entrainement[],
): HRChartData[] {
  return entrainements
    .filter((e) => e.date && (e.fc_moyenne || e.fc_max || e.fc_min))
    .map((e) => {
      const dateStr = timestampToDateString(e.date);

      if (isNaN(new Date(dateStr).getTime())) {
        console.warn("Invalid date in prepareHeartRateChartData:", {
          original: e.date,
          converted: dateStr,
        });
        return null;
      }

      return {
        date: dateStr,
        fc_moyenne: e.fc_moyenne || null,
        fc_max: e.fc_max || null,
        fc_min: e.fc_min || null,
        type: e.type,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export type HRChartData = NonNullable<
  ReturnType<typeof prepareHeartRateChartData>[number]
>;

// ✅ Fonction pure pour Performance
export function preparePerformanceChartData(
  entrainements: Entrainement[],
  metric: "vitesse" | "calories_per_min" | "distance",
): PerformanceChartData[] {
  return entrainements
    .filter((e) => {
      if (!e.date) return false;

      switch (metric) {
        case "vitesse":
          return e.vitesse_moy && e.vitesse_moy > 0;
        case "calories_per_min":
          return e.calories && e.calories > 0 && e.duree > 0;
        case "distance":
          return e.distance && e.distance > 0;
        default:
          return false;
      }
    })
    .map((e) => {
      const dateStr = timestampToDateString(e.date);

      if (isNaN(new Date(dateStr).getTime())) {
        console.warn("Invalid date in preparePerformanceChartData:", {
          original: e.date,
          converted: dateStr,
        });
        return null;
      }

      const baseData = {
        date: dateStr,
        type: e.type,
        duree: e.duree,
        fc_moyenne: e.fc_moyenne,
        vitesse: e.vitesse_moy,
        distance: e.distance,
        calories_per_min:
          e.calories && e.duree > 0
            ? Math.round((e.calories / e.duree) * 10) / 10
            : null,
      };

      return {
        ...baseData,
        value:
          metric === "vitesse"
            ? e.vitesse_moy
            : metric === "calories_per_min"
              ? baseData.calories_per_min
              : metric === "distance"
                ? e.distance
                : 0,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .filter(
      (d) => d.value != null && typeof d.value === "number" && d.value > 0,
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export type PerformanceChartData = NonNullable<
  ReturnType<typeof preparePerformanceChartData>[number]
>;

// ✅ Fonction pure pour Training Volume
export function prepareTrainingVolumeData(
  entrainements: Entrainement[],
  weeks: number,
): VolumeChartData[] {
  const data: VolumeChartData[] = [];
  const today = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 });

    const weekStartStr = format(weekStart, "yyyy-MM-dd");
    const weekEndStr = format(weekEnd, "yyyy-MM-dd");

    const weekTrainings = entrainements.filter((e) => {
      if (!e.date) return false;
      const dateStr = timestampToDateString(e.date);
      return dateStr >= weekStartStr && dateStr <= weekEndStr;
    });

    const totalDuration = weekTrainings.reduce((sum, e) => sum + e.duree, 0);
    const totalCalories = weekTrainings.reduce(
      (sum, e) => sum + (e.calories || 0),
      0,
    );

    data.push({
      week: format(weekStart, "'S'w", { locale: fr }),
      fullDate: format(weekStart, "dd/MM", { locale: fr }),
      seances: weekTrainings.length,
      duree: totalDuration,
      calories: totalCalories,
    });
  }

  return data;
}

export type VolumeChartData = NonNullable<
  ReturnType<typeof prepareTrainingVolumeData>[number]
>;
```

**Étape 2** : Simplifier les composants

```typescript
// Composant: src/components/charts/MesuresCharts.tsx (SIMPLIFIÉ)
import { prepareMesuresChartData } from '@/lib/chartDataTransformers';

export default function MesuresCharts({ mesures }: Props) {
  // ✅ Logique déléguée à la fonction pure
  const chartData = useMemo(
    () => prepareMesuresChartData(mesures),
    [mesures]
  );

  // Reste inchangé (JSX Recharts)
  return (
    <div className="space-y-6">
      {/* Weight & IMC Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="poids"
            stroke="#10b981"
            name="Poids (kg)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="imc"
            stroke="#a855f7"
            name="IMC"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Étape 3** : Mettre à jour les tests

```typescript
// Test: src/__tests__/lib/chartDataTransformers.test.ts (NOUVEAU)
import { describe, it, expect, beforeAll } from "vitest";
import {
  prepareMesuresChartData,
  prepareHeartRateChartData,
  preparePerformanceChartData,
  prepareTrainingVolumeData,
} from "@/lib/chartDataTransformers";

let Timestamp: any;

beforeAll(async () => {
  const firestore = await vi.importActual("firebase/firestore");
  Timestamp = firestore.Timestamp;
});

describe("prepareMesuresChartData", () => {
  it("should convert Timestamps to ISO strings", () => {
    const input = [
      {
        id: "1",
        user_id: "test",
        date: Timestamp.fromDate(new Date("2025-10-21")),
        poids: 75,
        imc: 24.5,
        created_at: Timestamp.now(),
      },
    ];

    const result = prepareMesuresChartData(input);

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2025-10-21");
    expect(result[0].poids).toBe(75);
    expect(result[0].imc).toBe(24.5);
  });

  it("should filter out mesures without date", () => {
    const input = [
      {
        id: "1",
        user_id: "test",
        date: Timestamp.fromDate(new Date("2025-10-21")),
        poids: 75,
        created_at: Timestamp.now(),
      },
      {
        id: "2",
        user_id: "test",
        date: null as any,
        poids: 80,
        created_at: Timestamp.now(),
      },
    ];

    const result = prepareMesuresChartData(input);

    expect(result).toHaveLength(1);
    expect(result[0].poids).toBe(75);
  });

  it("should filter out invalid dates", () => {
    const invalidDate = new Date("invalid");
    const input = [
      {
        id: "1",
        user_id: "test",
        date: Timestamp.fromDate(new Date("2025-10-21")),
        poids: 75,
        created_at: Timestamp.now(),
      },
      {
        id: "2",
        user_id: "test",
        date: Timestamp.fromDate(invalidDate),
        poids: 80,
        created_at: Timestamp.now(),
      },
    ];

    const result = prepareMesuresChartData(input);

    expect(result).toHaveLength(1);
    expect(result[0].poids).toBe(75);
  });

  it("should handle missing optional fields", () => {
    const input = [
      {
        id: "1",
        user_id: "test",
        date: Timestamp.fromDate(new Date("2025-10-21")),
        poids: 75,
        // imc manquant
        created_at: Timestamp.now(),
      },
    ];

    const result = prepareMesuresChartData(input);

    expect(result).toHaveLength(1);
    expect(result[0].poids).toBe(75);
    expect(result[0].imc).toBeNull();
  });
});

// ... 80 autres tests pour les 4 fonctions
```

**Étape 4** : Mettre à jour les tests composants (garder mais simplifier)

```typescript
// Test: src/__tests__/components/charts/MesuresCharts.test.tsx (SIMPLIFIÉ)
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MesuresCharts from '@/components/charts/MesuresCharts';

// ✅ Garder les mocks Recharts
vi.mock('recharts', () => ({ ... }));

// ✅ Mocker la fonction de transformation (déjà testée dans lib/)
vi.mock('@/lib/chartDataTransformers', () => ({
  prepareMesuresChartData: vi.fn((mesures) => {
    // Mock simple pour tests composant
    return mesures.map(m => ({
      date: '2025-10-21',
      poids: m.poids,
      imc: m.imc,
    }));
  }),
}));

describe('MesuresCharts Component', () => {
  it('should render chart container', () => {
    const mesures = [mockMesure()];
    render(<MesuresCharts mesures={mesures} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    render(<MesuresCharts mesures={[]} />);

    expect(screen.getByText(/aucune donnée/i)).toBeInTheDocument();
  });

  // ✅ Tests simplifiés (10 au lieu de 18)
  // La logique de transformation est testée dans lib/
});
```

#### **Résultats Attendus**

```yaml
Avant:
  Tests: 90 (composants)
  Coverage graphiques: 0%
  Durée: 2s

Après:
  Tests: 130 (+40 dans lib/)
  Coverage graphiques: 80%+ ✅
  Coverage lib: +5%
  Durée: 1.5s (tests lib plus rapides)

Impact:
  ✅ Coverage total: 5% → 10-12%
  ✅ Tests plus fiables (logique pure)
  ✅ Code réutilisable (4 fonctions exportées)
  ✅ Maintenance simplifiée
```

#### **Fichiers à Modifier**

**Créer (1 fichier)** :

- `src/lib/chartDataTransformers.ts` (400 lignes)

**Modifier (8 fichiers)** :

- `src/components/charts/MesuresCharts.tsx`
- `src/components/ui/HeartRateChart.tsx`
- `src/components/ui/PerformanceChart.tsx`
- `src/components/ui/TrainingVolumeChart.tsx`
- `src/__tests__/components/charts/MesuresCharts.test.tsx`
- `src/__tests__/components/ui/HeartRateChart.test.tsx`
- `src/__tests__/components/ui/PerformanceChart.test.tsx`
- `src/__tests__/components/ui/TrainingVolumeChart.test.tsx`

**Créer (1 fichier test)** :

- `src/__tests__/lib/chartDataTransformers.test.ts` (500 lignes, 40 tests)

**Effort Total** : **2h**

---

## 🎯 **PHASE 2 : NOUVEAUX TESTS (7-8h)**

### **Action 2/4 : Tests Hooks Firestore (3h)**

Détaillé dans `AUDIT_3_AXES_PRIORITAIRES.md` ligne 318

### **Action 3/4 : Tests Formulaires (2-3h)**

Détaillé dans `AUDIT_3_AXES_PRIORITAIRES.md` ligne 289

### **Action 4/4 : Tests Dashboards (2h)**

Détaillé dans `AUDIT_3_AXES_PRIORITAIRES.md` ligne 343

---

## 📊 **PROJECTION FINALE (9-10h total)**

```yaml
Tests: 398 → 626 (+228 tests)
  - Phase 1: +40 tests lib
  - Phase 2: +60 tests hooks
  - Phase 3: +46 tests formulaires
  - Phase 4: +32 tests dashboards
  - Composants: +50 tests (simplifiés/refactorés)

Coverage: 5-6% → 25%+ ✅
  - Graphiques: 0% → 80%
  - Hooks: 30% → 70%
  - Formulaires: 0% → 60%
  - Dashboards: 0% → 50%

Qualité:
  - ✅ Fonctions pures testables
  - ✅ Séparation logique/présentation
  - ✅ Code réutilisable
  - ✅ Maintenance simplifiée

Durée Tests: 21s → 18s (optimisation)
```

---

## ✅ **DÉCISION RECOMMANDÉE**

**Je recommande vivement de faire la Phase 1 MAINTENANT** :

1. **ROI Maximum** : 2h pour +80% coverage graphiques
2. **Fondation Solide** : Pattern réutilisable pour le reste
3. **Quick Win** : Résultats immédiats et mesurables
4. **Pas de Risque** : Refactoring sans changer le comportement

**Voulez-vous que je commence la Phase 1 maintenant ?**

---

**SuperNovaFit v3.0.0** — Plan Optimisation Tests

_22 Octobre 2025_
