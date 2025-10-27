# 🔥 PATTERNS FIREBASE - Tests Sauvegardés

**Date**: 27 Octobre 2025  
**Source**: Fichiers obsolètes avant suppression  
**Objectif**: Préserver patterns utiles pour futures migrations Jest

---

## 📋 CONTENU SAUVEGARDÉ

### 1. Patterns Mocks Firebase (useRepas.test.ts)

#### Mock Firebase Complet

```typescript
// Mock Firebase functions - Pattern Réutilisable
const mockOnSnapshot = vi.fn();
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockDoc = vi.fn();
const mockServerTimestamp = vi.fn(() => ({ _methodName: "serverTimestamp" }));

vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual("firebase/firestore");
  return {
    ...actual,
    collection: (...args: unknown[]) => mockCollection(...args),
    query: (...args: unknown[]) => mockQuery(...args),
    where: (...args: unknown[]) => mockWhere(...args),
    onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
    addDoc: (...args: unknown[]) => mockAddDoc(...args),
    updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
    deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
    doc: (...args: unknown[]) => mockDoc(...args),
    serverTimestamp: () => mockServerTimestamp(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
  };
});
```

#### Mock useAuth

```typescript
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Usage dans tests
const mockUser = { uid: "test-user-123", email: "test@example.com" };
const mockUseAuth = vi.mocked(useAuth);
mockUseAuth.mockReturnValue({ user: mockUser });
```

#### Mock dateUtils

```typescript
vi.mock("@/lib/dateUtils", () => ({
  timestampToDateString: vi.fn((timestamp) => {
    if (!timestamp || !timestamp.toDate) return "Invalid Date";
    try {
      return timestamp.toDate().toISOString().split("T")[0];
    } catch {
      return "Invalid Date";
    }
  }),
  dateToTimestamp: vi.fn((dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(12, 0, 0, 0);
    return Timestamp.fromDate(date);
  }),
}));
```

### 2. Tests Real-Time onSnapshot

#### Pattern: Fetch Data via onSnapshot

```typescript
it("should fetch and set repas data via onSnapshot", async () => {
  mockUseAuth.mockReturnValue({ user: mockUser });

  const mockRepasData: Partial<Repas>[] = [
    {
      user_id: "test-user-123",
      date: Timestamp.fromDate(new Date("2025-10-20T12:00:00")),
      repas: "dejeuner",
      aliments: [
        {
          id: "aliment-1",
          nom: "Poulet",
          nom_lower: "poulet",
          quantite: 150,
          unite: "g",
          user_id: "test-user-123",
          created_at: Timestamp.now(),
          macros: { kcal: 250, prot: 35, glucides: 0, lipides: 12 },
          macros_base: { kcal: 165, prot: 23, glucides: 0, lipides: 8 },
        },
      ],
      macros: { kcal: 250, prot: 35, glucides: 0, lipides: 12 },
      created_at: Timestamp.now(),
    },
  ];

  mockOnSnapshot.mockImplementation((query, successCallback) => {
    const snapshot = {
      docs: mockRepasData.map((data, index) => ({
        id: `repas-${index + 1}`,
        data: () => data,
      })),
    };
    successCallback(snapshot);
    return unsubscribeMock;
  });

  const { result } = renderHook(() => useRepas());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.repas).toHaveLength(1);
  expect(result.current.repas[0].id).toBe("repas-1");
  expect(result.current.repas[0].repas).toBe("dejeuner");
  expect(result.current.repas[0].macros.kcal).toBe(250);
});
```

#### Pattern: Cleanup Unsubscribe

```typescript
it("should cleanup onSnapshot subscription on unmount", () => {
  mockUseAuth.mockReturnValue({ user: mockUser });

  mockOnSnapshot.mockReturnValue(unsubscribeMock);

  const { unmount } = renderHook(() => useRepas());

  expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

  unmount();

  expect(unsubscribeMock).toHaveBeenCalledTimes(1);
});
```

#### Pattern: Filter Invalid Dates

```typescript
it("should filter out repas with invalid dates", async () => {
  mockUseAuth.mockReturnValue({ user: mockUser });

  const mockRepasData = [
    {
      id: "repas-1",
      user_id: "test-user-123",
      date: Timestamp.fromDate(new Date("2025-10-20T12:00:00")),
      repas: "dejeuner",
      aliments: [],
      macros: { kcal: 250, prot: 35, glucides: 0, lipides: 12 },
      created_at: Timestamp.now(),
    },
    {
      id: "repas-2",
      user_id: "test-user-123",
      date: null, // Invalid date
      repas: "diner",
      aliments: [],
      macros: { kcal: 400, prot: 25, glucides: 50, lipides: 10 },
      created_at: Timestamp.now(),
    },
  ];

  mockOnSnapshot.mockImplementation((query, successCallback) => {
    const snapshot = {
      docs: mockRepasData.map((data) => ({
        id: data.id,
        data: () => data,
      })),
    };
    successCallback(snapshot);
    return unsubscribeMock();
  });

  const { result } = renderHook(() => useRepas());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  // Only valid repas should be included
  expect(result.current.repas).toHaveLength(1);
  expect(result.current.repas[0].id).toBe("repas-1");
});
```

### 3. Tests CRUD Operations

#### Pattern: Add Document (addRepas)

```typescript
it("should add a new repas successfully", async () => {
  mockUseAuth.mockReturnValue({ user: mockUser });

  mockOnSnapshot.mockImplementation((query, successCallback) => {
    successCallback({ docs: [] });
    return unsubscribeMock;
  });

  const { result } = renderHook(() => useRepas());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  const newRepasData: Omit<Repas, "id"> = {
    user_id: "test-user-123",
    date: "2025-10-22" as unknown as Timestamp,
    repas: "petit_dej",
    aliments: [
      {
        id: "aliment-1",
        nom: "Banane",
        nom_lower: "banane",
        quantite: 120,
        unite: "g",
        user_id: "test-user-123",
        created_at: Timestamp.now(),
        macros: { kcal: 108, prot: 1.3, glucides: 23, lipides: 0.3 },
        macros_base: { kcal: 90, prot: 1.1, glucides: 19.2, lipides: 0.25 },
      },
    ],
    macros: { kcal: 108, prot: 1.3, glucides: 23, lipides: 0.3 },
    created_at: Timestamp.now(),
  };

  let addResult;
  await act(async () => {
    addResult = await result.current.addRepas(newRepasData);
  });

  expect(addResult).toEqual({ success: true, id: "new-repas-id" });
  expect(mockAddDoc).toHaveBeenCalledTimes(1);
});
```

#### Pattern: Update Document (updateRepas)

```typescript
it("should update an existing repas successfully", async () => {
  mockUseAuth.mockReturnValue({ user: mockUser });

  mockOnSnapshot.mockImplementation((query, successCallback) => {
    successCallback({ docs: [] });
    return unsubscribeMock;
  });

  const { result } = renderHook(() => useRepas());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  const updateData: Partial<Omit<Repas, "id" | "created_at">> = {
    macros: { kcal: 600, prot: 40, glucides: 60, lipides: 20 },
  };

  let updateResult;
  await act(async () => {
    updateResult = await result.current.updateRepas("repas-1", updateData);
  });

  expect(updateResult).toEqual({ success: true });
  expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
});
```

#### Pattern: Delete Document (deleteRepas)

```typescript
it("should delete a repas successfully", async () => {
  mockUseAuth.mockReturnValue({ user: mockUser });

  mockOnSnapshot.mockImplementation((query, successCallback) => {
    successCallback({ docs: [] });
    return unsubscribeMock;
  });

  const { result } = renderHook(() => useRepas());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  let deleteResult;
  await act(async () => {
    deleteResult = await result.current.deleteRepas("repas-1");
  });

  expect(deleteResult).toEqual({ success: true });
  expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
});
```

### 4. Tests Error Handling

#### Pattern: Handle onSnapshot Error

```typescript
it("should handle onSnapshot error gracefully", async () => {
  mockUseAuth.mockReturnValue({ user: mockUser });

  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});

  mockOnSnapshot.mockImplementation((query, successCallback, errorCallback) => {
    errorCallback(new Error("Firestore connection failed"));
    return unsubscribeMock;
  });

  const { result } = renderHook(() => useRepas());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.repas).toEqual([]);
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "Firebase error:",
    expect.any(Error),
  );

  consoleErrorSpy.mockRestore();
});
```

#### Pattern: Handle Add Error

```typescript
it("should handle addRepas error", async () => {
  mockUseAuth.mockReturnValue({ user: mockUser });

  mockOnSnapshot.mockImplementation((query, successCallback) => {
    successCallback({ docs: [] });
    return unsubscribeMock;
  });

  mockAddDoc.mockRejectedValue(new Error("Network error"));

  const { result } = renderHook(() => useRepas());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  const newRepasData: Omit<Repas, "id"> = {
    user_id: "test-user-123",
    date: Timestamp.fromDate(new Date("2025-10-22T12:00:00")),
    repas: "dejeuner",
    aliments: [],
    macros: { kcal: 0, prot: 0, glucides: 0, lipides: 0 },
    created_at: Timestamp.now(),
  };

  let addResult;
  await act(async () => {
    addResult = await result.current.addRepas(newRepasData);
  });

  expect(addResult).toEqual({ success: false, error: "Network error" });
});
```

### 5. Tests Business Logic (useFirestore.test.ts)

#### Pattern: Validate Data Structure

```typescript
it("should validate repas data structure", () => {
  const validRepasData = {
    nom: "Petit déjeuner",
    date: "2024-01-15",
    aliments: [{ nom: "Pain", quantite: 100, unite: "g", calories: 250 }],
    macros: { kcal: 400, proteines: 20, glucides: 50, lipides: 15 },
    user_id: "test-user-id",
  };

  // Vérifier la structure des données
  expect(validRepasData).toHaveProperty("nom");
  expect(validRepasData).toHaveProperty("date");
  expect(validRepasData).toHaveProperty("aliments");
  expect(validRepasData).toHaveProperty("macros");
  expect(validRepasData).toHaveProperty("user_id");

  // Vérifier les types
  expect(typeof validRepasData.nom).toBe("string");
  expect(typeof validRepasData.date).toBe("string");
  expect(Array.isArray(validRepasData.aliments)).toBe(true);
  expect(typeof validRepasData.macros).toBe("object");
  expect(typeof validRepasData.user_id).toBe("string");
});
```

#### Pattern: Process Repas Macros

```typescript
it("should process repas macros correctly", () => {
  const aliments = [
    {
      nom: "Pain",
      quantite: 100,
      unite: "g",
      macros: { kcal: 250, proteines: 8, glucides: 45, lipides: 2 },
    },
    {
      nom: "Beurre",
      quantite: 10,
      unite: "g",
      macros: { kcal: 75, proteines: 0, glucides: 0, lipides: 8 },
    },
  ];

  // Calculer les macros totales comme le ferait le hook
  const totalMacros = aliments.reduce(
    (total, aliment) => ({
      kcal: total.kcal + (aliment.macros?.kcal || 0),
      proteines: total.proteines + (aliment.macros?.proteines || 0),
      glucides: total.glucides + (aliment.macros?.glucides || 0),
      lipides: total.lipides + (aliment.macros?.lipides || 0),
    }),
    { kcal: 0, proteines: 0, glucides: 0, lipides: 0 },
  );

  expect(totalMacros.kcal).toBe(325);
  expect(totalMacros.proteines).toBe(8);
  expect(totalMacros.glucides).toBe(45);
  expect(totalMacros.lipides).toBe(10);
});
```

### 6. Tests Calculations (calculations.test.ts)

#### Pattern: BMR Mifflin-St Jeor

```typescript
describe("BMR Calculation (Mifflin-St Jeor)", () => {
  it("should calculate BMR for men", () => {
    // BMR = 10 * poids + 6.25 * taille - 5 * age + 5
    const age = 30;
    const poids = 70; // kg
    const taille = 175; // cm

    const expectedBMR = 10 * poids + 6.25 * taille - 5 * age + 5;
    // expectedBMR = 700 + 1093.75 - 150 + 5 = 1648.75

    expect(expectedBMR).toBeCloseTo(1648.75, 1);
  });

  it("should calculate BMR for women", () => {
    // BMR = 10 * poids + 6.25 * taille - 5 * age - 161
    const age = 25;
    const poids = 60; // kg
    const taille = 165; // cm

    const expectedBMR = 10 * poids + 6.25 * taille - 5 * age - 161;
    // expectedBMR = 600 + 1031.25 - 125 - 161 = 1345.25

    expect(expectedBMR).toBeCloseTo(1345.25, 1);
  });
});
```

#### Pattern: TDEE with Activity Levels

```typescript
describe("TDEE Calculation", () => {
  it("should calculate TDEE with different activity levels", () => {
    const bmr = 1650;

    // Facteurs d'activité
    const sedentaire = bmr * 1.2;
    const leger = bmr * 1.375;
    const modere = bmr * 1.55;
    const actif = bmr * 1.725;
    const tres_actif = bmr * 1.9;

    expect(sedentaire).toBeCloseTo(1980, 1);
    expect(leger).toBeCloseTo(2268.75, 1);
    expect(modere).toBeCloseTo(2557.5, 1);
    expect(actif).toBeCloseTo(2846.25, 1);
    expect(tres_actif).toBeCloseTo(3135, 1);
  });
});
```

#### Pattern: MET Calories

```typescript
describe("MET Calories Calculation", () => {
  it("should calculate calories burned correctly", () => {
    // Calories = MET * poids(kg) * durée(heures)
    const met = 8; // Course intensive
    const poids = 70; // kg
    const dureeMinutes = 60; // minutes
    const dureeHeures = dureeMinutes / 60; // 1 heure

    const calories = met * poids * dureeHeures;
    // calories = 8 * 70 * 1 = 560

    expect(calories).toBe(560);
  });

  it("should handle fractional hours", () => {
    const met = 6; // Course modérée
    const poids = 65; // kg
    const dureeMinutes = 30; // minutes
    const dureeHeures = dureeMinutes / 60; // 0.5 heure

    const calories = met * poids * dureeHeures;
    // calories = 6 * 65 * 0.5 = 195

    expect(calories).toBe(195);
  });
});
```

---

## 🎯 UTILISATION DES PATTERNS

### Pour Migrer vers Jest

```typescript
// 1. Adapter les mocks Vitest → Jest
vi.fn() → jest.fn()
vi.mock() → jest.mock()
vi.mocked() → jest.mocked()
vi.spyOn() → jest.spyOn()

// 2. Adapter les imports
import { vi } from 'vitest' → // Supprimer (Jest global)
import { renderHook, waitFor, act } from '@testing-library/react' // Identique

// 3. Ajouter @jest-environment jsdom en haut du fichier
/**
 * @jest-environment jsdom
 */
```

### Pour Créer Nouveaux Tests

1. Copier pattern Mock Firebase complet
2. Adapter données mockées (User, Repas, etc.)
3. Utiliser patterns AAA (Arrange-Act-Assert)
4. Ajouter cleanup (beforeEach/afterEach)
5. Tester cas nominaux + edge cases + erreurs

---

**Auteur**: Assistant IA  
**Source**: Tests obsolètes avant suppression  
**Date**: 27 Octobre 2025  
**Utilisation**: Référence pour futures migrations Jest
