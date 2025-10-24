/**
 * Configuration centralisée pour les tests SuperNovaFit
 * Usage: import { TEST_CONFIG } from '@/test/config';
 */

export const TEST_CONFIG = {
  // Configuration Vitest
  vitest: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    exclude: ['node_modules/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        statements: 25,
        branches: 25,
        functions: 25,
        lines: 25,
      },
    },
  },

  // Configuration Playwright
  playwright: {
    testDir: 'e2e',
    timeout: 30000,
    retries: 2,
    workers: 1,
    use: {
      baseURL: 'http://localhost:3000',
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
    },
  },

  // Mocks par défaut
  mocks: {
    firebase: {
      auth: {
        currentUser: {
          uid: 'test-user-id',
          email: 'test@supernovafit.app',
          displayName: 'Test User',
        },
      },
      firestore: {
        collection: vi.fn(),
        doc: vi.fn(),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        getDoc: vi.fn(),
        getDocs: vi.fn(),
        onSnapshot: vi.fn(),
      },
      storage: {
        ref: vi.fn(),
        uploadBytes: vi.fn(),
        getDownloadURL: vi.fn(),
      },
    },
    next: {
      router: {
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
      },
      navigation: {
        useRouter: vi.fn(),
        usePathname: vi.fn(),
        useSearchParams: vi.fn(),
      },
    },
    recharts: {
      LineChart: vi.fn(),
      BarChart: vi.fn(),
      PieChart: vi.fn(),
      XAxis: vi.fn(),
      YAxis: vi.fn(),
      CartesianGrid: vi.fn(),
      Tooltip: vi.fn(),
      Legend: vi.fn(),
      Line: vi.fn(),
      Bar: vi.fn(),
      Pie: vi.fn(),
    },
  },

  // Données de test
  testData: {
    user: {
      id: 'test-user-id',
      email: 'test@supernovafit.app',
      displayName: 'Test User',
      role: 'sportif',
      genre: 'homme',
      date_naissance: new Date('1990-01-01'),
      taille: 175,
      poids_actuel: 70,
      objectif: 'maintien',
      niveau_activite: 'modere',
    },
    repas: {
      id: 'test-repas-id',
      user_id: 'test-user-id',
      date: new Date('2025-10-24'),
      repas: 'dejeuner',
      aliments: [
        {
          id: 'test-aliment-id',
          nom: 'Poulet',
          nom_lower: 'poulet',
          quantite: 150,
          unite: 'g',
          user_id: 'test-user-id',
          created_at: new Date('2025-10-24'),
          macros: {
            kcal: 250,
            prot: 30,
            glucides: 0,
            lipides: 15,
          },
          macros_base: {
            kcal: 167,
            prot: 20,
            glucides: 0,
            lipides: 10,
          },
        },
      ],
      macros: {
        kcal: 250,
        prot: 30,
        glucides: 0,
        lipides: 15,
      },
      created_at: new Date('2025-10-24'),
    },
    entrainement: {
      id: 'test-entrainement-id',
      user_id: 'test-user-id',
      date: new Date('2025-10-24'),
      type: 'cardio',
      duree: 45,
      calories: 400,
      source: 'manuel',
      commentaire: 'Test training',
      effort_percu: 7,
      fatigue_avant: 3,
      fatigue_apres: 6,
      fc_min: 120,
      fc_max: 180,
      fc_moyenne: 150,
      distance: 5,
      vitesse_moy: 12,
      cadence_moy: 85,
      elevation_gain: 100,
      created_at: new Date('2025-10-24'),
    },
    mesure: {
      id: 'test-mesure-id',
      user_id: 'test-user-id',
      date: new Date('2025-10-24'),
      poids: 70,
      taille: 175,
      imc: 22.86,
      masse_grasse: 15,
      tour_taille: 80,
      tour_hanches: 95,
      tour_bras: 30,
      tour_cuisses: 55,
      created_at: new Date('2025-10-24'),
    },
    journal: {
      id: 'test-journal-id',
      user_id: 'test-user-id',
      date: new Date('2025-10-24'),
      humeur: 8,
      energie: 7,
      sommeil: 8,
      stress: 3,
      note: 'Bonne journée',
      created_at: new Date('2025-10-24'),
    },
  },

  // Sélecteurs de test
  selectors: {
    buttons: {
      submit: 'button[type="submit"]',
      cancel: 'button[type="button"]',
      edit: '[data-testid="edit-button"]',
      delete: '[data-testid="delete-button"]',
      save: '[data-testid="save-button"]',
    },
    inputs: {
      text: 'input[type="text"]',
      email: 'input[type="email"]',
      password: 'input[type="password"]',
      number: 'input[type="number"]',
      date: 'input[type="date"]',
      time: 'input[type="time"]',
    },
    forms: {
      login: 'form[data-testid="login-form"]',
      register: 'form[data-testid="register-form"]',
      meal: 'form[data-testid="meal-form"]',
      training: 'form[data-testid="training-form"]',
      measure: 'form[data-testid="measure-form"]',
      journal: 'form[data-testid="journal-form"]',
    },
    modals: {
      meal: '[data-testid="meal-modal"]',
      training: '[data-testid="training-modal"]',
      measure: '[data-testid="measure-modal"]',
      journal: '[data-testid="journal-modal"]',
    },
  },

  // Messages d'erreur
  errorMessages: {
    validation: {
      required: 'Ce champ est requis',
      email: 'Adresse email invalide',
      password: 'Mot de passe trop faible',
      number: 'Valeur numérique invalide',
      date: 'Date invalide',
    },
    network: {
      offline: 'Connexion internet requise',
      timeout: "Délai d'attente dépassé",
      server: 'Erreur serveur',
    },
    auth: {
      login: 'Identifiants incorrects',
      register: "Erreur lors de l'inscription",
      logout: 'Erreur lors de la déconnexion',
    },
  },

  // URLs de test
  urls: {
    base: 'http://localhost:3000',
    auth: {
      login: '/auth',
      register: '/auth',
      logout: '/auth',
    },
    dashboard: {
      mobile: '/',
      desktop: '/',
      coach: '/coach',
    },
    modules: {
      diete: '/diete',
      entrainements: '/entrainements',
      mesures: '/mesures',
      journal: '/journal',
      challenges: '/challenges',
      profil: '/profil',
    },
  },

  // Timeouts
  timeouts: {
    short: 1000,
    medium: 5000,
    long: 10000,
    veryLong: 30000,
  },

  // Configuration des tests
  test: {
    retries: 2,
    timeout: 30000,
    slowThreshold: 1000,
    bail: false,
  },
};

// Types TypeScript
export type TestConfig = typeof TEST_CONFIG;
export type TestData = typeof TEST_CONFIG.testData;
export type TestSelectors = typeof TEST_CONFIG.selectors;
export type TestUrls = typeof TEST_CONFIG.urls;
export type TestTimeouts = typeof TEST_CONFIG.timeouts;
