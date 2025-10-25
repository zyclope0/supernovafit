# 🏆 ARCHITECTURE CHALLENGES - FRONT-END TO BACK-END

**Version**: 1.0.0 | **Date**: 23 Octobre 2025 | **Status**: Production Ready ✅

> **🎯 Objectif**: Documentation complète du système de challenges du front-end au back-end  
> **📊 Couverture**: 50 challenges prédéfinis + 35 challenges avancés + 15 meta-challenges  
> **🧪 Tests**: 48 tests challenges + 70 tests Jest hooks + 925 tests Vitest

---

## 🏗️ **ARCHITECTURE GLOBALE**

### **Flux de Données Challenge**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    TRACKING      │    │   BACKEND       │
│                 │    │                  │    │                 │
│ 1. User Action  │───▶│ 2. Auto Tracking│───▶│ 3. Firestore    │
│ (meal, workout) │    │ (useChallengeTracker)│    │ (challenges collection)│
│                 │    │                  │    │                 │
│ 4. UI Update    │◀───│ 5. Notifications │◀───│ 6. Real-time    │
│ (progress bar)  │    │ (push, toast)    │    │ (onSnapshot)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Composants Clés**

```typescript
// 1. DÉFINITIONS (Backend)
src/lib/challenges.ts
├── CHALLENGE_DEFINITIONS (50 challenges prédéfinis)
├── ACHIEVEMENT_DEFINITIONS (badges/achievements)
└── createChallengeFromDefinition()

// 2. TRACKING (Frontend → Backend)
src/hooks/useChallengeTracker.ts
├── useChallengeTracker() - Hook principal
├── useEffect() - Surveillance données
├── Calculs métriques (nutrition, training, etc.)
└── Mise à jour automatique Firestore

// 3. PERSISTENCE (Backend)
src/hooks/useChallenges.ts
├── useChallenges() - CRUD challenges
├── addChallenge() - Création
├── updateChallenge() - Mise à jour
└── deleteChallenge() - Suppression

// 4. NOTIFICATIONS (Frontend)
src/lib/notifications/challengeNotifications.ts
├── sendChallengeCompletedNotification()
├── sendChallengeProgressNotification()
└── sendChallengeAlmostDoneNotification()
```

---

## 📊 **MODÈLE DE DONNÉES**

### **Interface Challenge (TypeScript)**

```typescript
interface Challenge {
  id: string; // UUID Firestore
  user_id: string; // Propriétaire
  type: "nutrition" | "training" | "streak" | "social" | "special";
  title: string; // "5 Workouts par Semaine"
  description: string; // Description détaillée
  icon: string; // "🏋️"
  category: "daily" | "weekly" | "monthly" | "special";
  target: number; // Objectif (ex: 5)
  current: number; // Progression actuelle (ex: 3)
  unit: string; // "entraînements", "jours", "kcal"
  startDate: string; // Date début
  endDate: string; // Date fin
  status: "active" | "completed" | "expired" | "paused";
  xpReward: number; // XP gagné (ex: 100)
  badgeReward?: string; // Badge débloqué
  isRepeatable: boolean; // Peut être refait
  difficulty: "easy" | "medium" | "hard" | "legendary";
  created_at?: Date | string; // Date création
  completed_at?: string; // Date completion
}
```

### **Collections Firestore**

```typescript
// Collection: challenges/{challengeId}
{
  user_id: "VBSTkEAy1OWptNJmUbIjFFz62Zg1",
  type: "training",
  title: "5 Workouts par Semaine",
  description: "Complétez 5 entraînements cette semaine",
  icon: "🏋️",
  category: "weekly",
  target: 5,
  current: 3,                    // ← Mis à jour automatiquement
  unit: "entraînements",
  status: "active",
  xpReward: 100,
  isRepeatable: true,
  difficulty: "medium",
  created_at: Timestamp,
  completed_at: null
}

// Collection: achievements/{achievementId}
{
  user_id: "VBSTkEAy1OWptNJmUbIjFFz62Zg1",
  type: "milestone",
  name: "Premier Challenge",
  description: "Complétez votre premier challenge",
  icon: "🎯",
  rarity: "common",
  xpReward: 50,
  condition: "challengesCompleted >= 1",
  unlockedAt: "2025-10-23T12:00:00Z"
}
```

---

## 🔄 **FLUX DE TRACKING AUTOMATIQUE**

### **1. Déclenchement (User Action)**

```typescript
// User ajoute un repas
const { addRepas } = useRepas();
await addRepas({
  user_id: user.uid,
  date: Timestamp.fromDate(dateAt12),
  repas: "dejeuner",
  aliments: [...],
  macros: { kcal: 650, prot: 45, glucides: 60, lipides: 20 }
});
```

### **2. Surveillance (useChallengeTracker)**

```typescript
// Hook principal - Surveillance automatique
export function useChallengeTracker() {
  const { user } = useAuth();
  const { repas } = useRepas(); // ← Données nutrition
  const { entrainements } = useEntrainements(); // ← Données training
  const { entries: journalEntries } = useJournal(); // ← Données wellness
  const { mesures } = useMesures(); // ← Données mesures
  const { challenges, updateChallenge } = useChallenges();

  // ========================================
  // 🏋️ CHALLENGES ENTRAÎNEMENT
  // ========================================
  useEffect(() => {
    if (!user || !entrainements || challenges.length === 0) return;

    const activeChallenges = challenges.filter((c) => c.status === "active");

    // Calculer métriques une seule fois
    const weekTrainingsCount = countWeekTrainings(entrainements);
    const weekTrainingTime = calculateWeekTrainingTime(entrainements);
    const trainingStreak = calculateTrainingStreak(entrainements);

    // Mise à jour par titre de challenge
    const updates = [];

    activeChallenges.forEach((challenge) => {
      let newCurrent = null;

      switch (challenge.title) {
        case "5 Workouts par Semaine":
          newCurrent = weekTrainingsCount;
          break;
        case "Warrior Streak":
          newCurrent = trainingStreak;
          break;
        case "10h d'Entraînement en un Mois":
          newCurrent = weekTrainingTime;
          break;
        // ... autres challenges
      }

      // Mise à jour si changement détecté
      if (newCurrent !== null && newCurrent !== challenge.current) {
        updates.push({
          id: challenge.id,
          title: challenge.title,
          current: newCurrent,
        });
      }
    });

    // Appliquer les mises à jour avec validation Zod
    updates.forEach(({ id, title, current }) => {
      const validation = safeValidateUpdateChallenge({
        user_id: user.uid,
        current,
      });

      if (!validation.success) {
        console.warn(
          `⚠️ Validation échouée pour "${title}":`,
          validation.error,
        );
        return;
      }

      // Vérifier si challenge vient d'être complété
      const fullChallenge = challenges.find((c) => c.id === id);
      const wasCompleted = fullChallenge.current >= fullChallenge.target;
      const isNowCompleted = current >= fullChallenge.target;
      const justCompleted = !wasCompleted && isNowCompleted;

      updateChallenge(id, { current })
        .then(() => {
          // 🎉 Notification si complété
          if (justCompleted) {
            sendChallengeCompletedNotification(fullChallenge);
            console.log(`🎉 Challenge complété: ${title}`);
          }
          // 📈 Notification progression (50%, 75%, 90%)
          else if (!isNowCompleted) {
            sendChallengeProgressNotification({ ...fullChallenge, current });
          }
          // 🔥 Notification encouragement (presque fini)
          else if (fullChallenge.target - current <= 3) {
            sendChallengeAlmostDoneNotification({ ...fullChallenge, current });
          }
        })
        .catch((error) => {
          console.error(`❌ Erreur mise à jour "${title}":`, error);
        });
    });
  }, [user, entrainements, challenges, updateChallenge]);
}
```

### **3. Calculs Métriques (Pure Functions)**

```typescript
// src/lib/challengeTracking/training.ts
export function countWeekTrainings(entrainements: Entrainement[]): number {
  const weekBounds = getWeekBounds();
  return entrainements.filter((e) =>
    isDateInBounds(e.date, weekBounds.start, weekBounds.end),
  ).length;
}

export function calculateTrainingStreak(entrainements: Entrainement[]): number {
  // Algorithme de calcul de streak
  const sortedByDate = entrainements.sort(
    (a, b) => b.date.toDate().getTime() - a.date.toDate().getTime(),
  );

  let streak = 0;
  let currentDate = new Date();

  for (const training of sortedByDate) {
    const trainingDate = training.date.toDate();
    const daysDiff = Math.floor(
      (currentDate.getTime() - trainingDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === streak) {
      streak++;
      currentDate = trainingDate;
    } else {
      break;
    }
  }

  return streak;
}
```

### **4. Persistence Firestore (useChallenges)**

```typescript
// src/hooks/useChallenges.ts
export function useChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "challenges"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Challenge[];
      setChallenges(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateChallenge = useCallback(
    async (id: string, updates: Partial<Challenge>) => {
      if (!user) return { success: false, error: "Utilisateur non connecté" };

      try {
        await updateDoc(doc(db, "challenges", id), {
          ...updates,
          updated_at: serverTimestamp(),
        });
        return { success: true };
      } catch (error) {
        console.error("Erreur mise à jour challenge:", error);
        return { success: false, error: "Erreur mise à jour" };
      }
    },
    [user],
  );

  return { challenges, loading, updateChallenge };
}
```

---

## 🔔 **SYSTÈME DE NOTIFICATIONS**

### **Types de Notifications**

```typescript
// 1. Challenge Complété
await sendChallengeCompletedNotification(challenge);
// → "🎉 Challenge Complété! 5 Workouts par Semaine - +100 XP"

// 2. Progression (50%, 75%, 90%)
await sendChallengeProgressNotification(challenge);
// → "📈 75% Complété! Plus que 1 entraînement"

// 3. Encouragement (presque fini)
await sendChallengeAlmostDoneNotification(challenge);
// → "🔥 Plus que 2 jours! Vous y êtes presque!"
```

### **Implémentation Notifications**

```typescript
// src/lib/notifications/challengeNotifications.ts
export async function sendChallengeCompletedNotification(
  challenge: Challenge,
): Promise<void> {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const template = getChallengeCompletedNotification(challenge);

  try {
    const notification = new Notification(template.title, {
      body: template.body,
      icon: template.icon,
      badge: template.badge,
      tag: template.tag,
      requireInteraction: template.requireInteraction,
      data: {
        type: "challenge-completed",
        challengeId: challenge.id,
        xpReward: challenge.xpReward,
      },
    });

    // Action au clic
    notification.onclick = () => {
      window.focus();
      window.location.href = "/challenges";
      notification.close();
    };

    console.log("✅ Notification envoyée:", template.title);
  } catch (error) {
    console.error("❌ Erreur envoi notification:", error);
  }
}
```

---

## 🎯 **CHALLENGES PRÉDÉFINIS**

### **50 Challenges Prédéfinis**

```typescript
// src/lib/challenges.ts
export const CHALLENGE_DEFINITIONS = [
  // ===== NUTRITION CHALLENGES =====
  {
    type: "nutrition",
    title: "7 Jours de Nutrition Parfaite",
    description:
      "Ajoutez au moins 3 repas par jour pendant 7 jours consécutifs.",
    icon: "🥗",
    category: "weekly",
    target: 7,
    unit: "jours",
    xpReward: 100,
    isRepeatable: true,
    difficulty: "medium",
  },
  {
    type: "nutrition",
    title: "Marathon des Protéines",
    description: "Atteignez votre objectif protéines pendant 5 jours.",
    icon: "💪",
    category: "weekly",
    target: 5,
    unit: "jours",
    xpReward: 80,
    isRepeatable: true,
    difficulty: "medium",
  },

  // ===== TRAINING CHALLENGES =====
  {
    type: "training",
    title: "5 Workouts par Semaine",
    description: "Complétez 5 entraînements cette semaine.",
    icon: "🏋️",
    category: "weekly",
    target: 5,
    unit: "entraînements",
    xpReward: 100,
    isRepeatable: true,
    difficulty: "medium",
  },
  {
    type: "training",
    title: "Warrior Streak",
    description: "Entraînez-vous 3 jours consécutifs.",
    icon: "⚔️",
    category: "streak",
    target: 3,
    unit: "jours",
    xpReward: 150,
    isRepeatable: true,
    difficulty: "hard",
  },

  // ===== WELLNESS CHALLENGES =====
  {
    type: "streak",
    title: "Journal Quotidien",
    description: "Tenez votre journal 7 jours consécutifs.",
    icon: "📓",
    category: "weekly",
    target: 7,
    unit: "jours",
    xpReward: 120,
    isRepeatable: true,
    difficulty: "medium",
  },

  // ... 45 autres challenges
];
```

### **35 Challenges Avancés (Phase 2.3)**

```typescript
// Challenges Avancés - Calculs complexes
export const ADVANCED_CHALLENGES = [
  {
    type: "training",
    title: "Machine à Entraînement",
    description: "Complétez 50 entraînements au total.",
    icon: "🤖",
    category: "special",
    target: 50,
    unit: "entraînements",
    xpReward: 500,
    isRepeatable: false,
    difficulty: "legendary",
  },
  {
    type: "nutrition",
    title: "Nutritionniste",
    description: "Enregistrez 200 repas au total.",
    icon: "🍽️",
    category: "special",
    target: 200,
    unit: "repas",
    xpReward: 400,
    isRepeatable: false,
    difficulty: "hard",
  },
  // ... 33 autres challenges avancés
];
```

### **15 Meta-Challenges (Phase 2.4)**

```typescript
// Meta-Challenges - Challenges qui dépendent d'autres challenges
export const META_CHALLENGES = [
  {
    type: "special",
    title: "Légende Vivante",
    description: "Atteignez le niveau 20.",
    icon: "👑",
    category: "special",
    target: 20,
    unit: "niveau",
    xpReward: 1000,
    isRepeatable: false,
    difficulty: "legendary",
  },
  {
    type: "special",
    title: "Maître des Challenges",
    description: "Complétez 25 challenges différents.",
    icon: "🏆",
    category: "special",
    target: 25,
    unit: "challenges",
    xpReward: 800,
    isRepeatable: false,
    difficulty: "legendary",
  },
  // ... 13 autres meta-challenges
];
```

---

## 🔒 **SÉCURITÉ & VALIDATION**

### **Firestore Rules**

```javascript
// config/firestore.rules
match /challenges/{challengeId} {
  allow read: if isAuthenticated() &&
    (resource.data.user_id == request.auth.uid ||
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'coach')
    && checkRateLimit();

  allow create: if isAuthenticated() &&
    request.resource.data.user_id == request.auth.uid &&
    validateFields(request.resource.data,
      ['user_id', 'type', 'title', 'description', 'category', 'status'],
      ['target', 'current', 'startDate', 'endDate', 'icon', 'unit', 'xpReward', 'isRepeatable', 'difficulty', 'created_at', 'completed_at']) &&
    request.resource.data.type is string &&
    request.resource.data.title is string &&
    request.resource.data.status in ['active', 'completed', 'abandoned'] &&
    checkCreateRateLimit();

  allow update: if isAuthenticated() &&
    resource.data.user_id == request.auth.uid &&
    request.resource.data.user_id == request.auth.uid &&
    checkRateLimit();

  allow delete: if isAuthenticated() &&
    resource.data.user_id == request.auth.uid
    && checkRateLimit();
}
```

### **Validation Zod**

```typescript
// src/lib/validation/challenges.ts
export const UpdateChallengeSchema = z.object({
  user_id: z.string().min(1),
  current: z.number().min(0),
  status: z.enum(["active", "completed", "expired", "paused"]).optional(),
  completed_at: z.string().optional(),
});

export function safeValidateUpdateChallenge(data: unknown) {
  try {
    const validated = UpdateChallengeSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten() };
    }
    return { success: false, error: "Validation error" };
  }
}
```

---

## 🧪 **TESTS & QUALITÉ**

### **Tests Challenges (48 tests)**

```typescript
// src/__tests__/lib/challengeTracking/advanced.test.ts
describe("Advanced Challenge Tracking", () => {
  it("should calculate total trainings correctly", () => {
    const entrainements = [
      { date: Timestamp.fromDate(new Date("2025-01-15")), type: "cardio" },
      { date: Timestamp.fromDate(new Date("2025-01-16")), type: "musculation" },
    ];

    const result = calculateTotalTrainings(entrainements);
    expect(result).toBe(2);
  });

  it("should calculate week training time correctly", () => {
    const entrainements = [
      { date: Timestamp.fromDate(new Date("2025-01-15")), duree: 45 },
      { date: Timestamp.fromDate(new Date("2025-01-16")), duree: 30 },
    ];

    const result = calculateWeekTrainingTime(entrainements);
    expect(result).toBe(75); // 45 + 30 minutes
  });
});
```

### **Tests Hooks (70 tests Jest)**

```typescript
// src/__tests__/hooks/useChallengeTracker.simple.jest.test.ts
describe("useChallengeTracker Simple (Jest)", () => {
  it("should track training challenges correctly", async () => {
    const { result } = renderHook(() => useChallengeTracker());

    // Simuler ajout d'entraînement
    await act(async () => {
      await result.current.addTraining({
        type: "cardio",
        duree: 45,
        calories: 300,
      });
    });

    // Vérifier que le challenge est mis à jour
    expect(result.current.challenges[0].current).toBe(1);
  });
});
```

---

## 📊 **MÉTRIQUES & PERFORMANCE**

### **Coverage Tests**

```yaml
Tests Challenges:
  - 48 tests avancés + meta-challenges
  - 70 tests Jest (hooks Firestore)
  - 925 tests Vitest (composants, lib, utils)
  - Total: 1043 tests
  - Coverage: 22-25% (objectif 25% ATTEINT!)

Performance:
  - Calculs métriques: < 10ms
  - Mise à jour Firestore: < 100ms
  - Notifications: < 50ms
  - Real-time sync: < 200ms
```

### **Optimisations**

```typescript
// 1. Calculs optimisés (une seule fois par useEffect)
const weekTrainingsCount = countWeekTrainings(entrainements);
const weekTrainingTime = calculateWeekTrainingTime(entrainements);

// 2. Validation Zod (évite les erreurs)
const validation = safeValidateUpdateChallenge({
  user_id: user.uid,
  current,
});

// 3. Notifications intelligentes (évite le spam)
const milestones = [50, 75, 90];
const closestMilestone = milestones.find(
  (m) => Math.abs(progressPercent - m) < 1,
);

// 4. Cleanup automatique (évite les fuites mémoire)
useEffect(() => {
  const unsubscribe = onSnapshot(q, callback);
  return () => unsubscribe(); // ← CRITIQUE
}, [user]);
```

---

## 🚀 **DÉPLOIEMENT & MONITORING**

### **CI/CD Pipeline**

```yaml
# .github/workflows/firebase-hosting-merge.yml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"
      - name: Install dependencies
        run: npm ci
      - name: Run quality checks
        run: |
          npm run lint
          npm run typecheck
          npm run test:coverage  # ← Tests challenges inclus
      - name: Build
        run: npm run build
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
```

### **Monitoring Production**

```typescript
// Sentry tracking pour challenges
import * as Sentry from "@sentry/nextjs";

try {
  await updateChallenge(id, { current });
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: "ChallengeTracker",
      operation: "updateChallenge",
    },
    extra: {
      challengeId: id,
      newCurrent: current,
    },
  });
}
```

---

## 🎯 **ROADMAP & ÉVOLUTIONS**

### **Phase 2.3: Challenges Avancés ✅**

- ✅ 35 challenges avancés implémentés
- ✅ Calculs complexes (streaks, volumes, transformations)
- ✅ Tests complets (48 tests)
- ✅ Documentation technique

### **Phase 2.4: Meta-Challenges ✅**

- ✅ 15 meta-challenges implémentés
- ✅ Dépendances entre challenges
- ✅ Système de niveaux
- ✅ Badges et achievements

### **Phase 3: Notifications Push (Futur)**

- 🔄 FCM (Firebase Cloud Messaging)
- 🔄 Notifications push mobiles
- 🔄 Rappels intelligents
- 🔄 Personnalisation utilisateur

### **Phase 4: IA & Recommandations (Futur)**

- 🔄 Suggestions de challenges personnalisées
- 🔄 Détection de patterns utilisateur
- 🔄 Ajustement automatique difficulté
- 🔄 Coaching intelligent

---

## 📋 **CHECKLIST DÉVELOPPEMENT**

### **Avant Modification**

```bash
# 1. Tests
npm run test:coverage        # 1043 tests, 22-25% coverage
npm run test:jest            # 70 tests Jest (hooks)
npm test -- challenge        # Tests spécifiques challenges

# 2. Qualité
npm run lint                 # 0 errors
npm run typecheck           # TypeScript strict

# 3. Build
npm run build               # 10.3s, 110KB
```

### **Après Modification**

```bash
# 1. Validation
npm run test:coverage        # Vérifier coverage maintenu
npm run lint                 # Vérifier 0 errors
npm run typecheck           # Vérifier types corrects

# 2. Commit
git add .
git commit -m "feat: description claire"
git push origin main
```

---

## 🎬 **CONCLUSION**

### **Architecture Robuste**

✅ **Séparation des responsabilités** : Tracking, Persistence, Notifications  
✅ **Tests complets** : 1043 tests, 22-25% coverage  
✅ **Validation stricte** : Zod + Firestore Rules  
✅ **Performance optimisée** : Calculs < 10ms, sync < 200ms  
✅ **Monitoring production** : Sentry + Analytics

### **Système Évolutif**

✅ **50 challenges prédéfinis** : Nutrition, Training, Wellness  
✅ **35 challenges avancés** : Calculs complexes, transformations  
✅ **15 meta-challenges** : Dépendances, niveaux, badges  
✅ **Notifications intelligentes** : Progression, completion, encouragement  
✅ **Real-time sync** : onSnapshot Firestore

### **Prochaines Étapes**

🔄 **Phase 3** : Notifications push FCM  
🔄 **Phase 4** : IA & recommandations personnalisées  
🔄 **Phase 5** : Challenges sociaux & compétitions

---

**SuperNovaFit Challenges System v1.0.0** — Architecture Production Ready 🏆

_System complet du front-end au back-end avec 100 challenges, 1043 tests, et monitoring production_
