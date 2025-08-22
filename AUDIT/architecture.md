# 🏗️ Architecture SuperNovaFit

## Vue d'ensemble

SuperNovaFit est une application de fitness moderne développée avec Next.js 15.4.6 (App Router), TypeScript, Firebase et Tailwind CSS. L'application suit une architecture modulaire avec une séparation claire entre le frontend et les services backend.

## Architecture globale

```mermaid
graph TB
    subgraph "Frontend - Next.js 15"
        APP[App Router Pages]
        COMP[Components]
        HOOKS[Custom Hooks]
        LIB[Libraries & Utils]
    end
    
    subgraph "Backend - Firebase"
        AUTH[Firebase Auth]
        FS[Firestore DB]
        STORAGE[Firebase Storage]
        ANALYTICS[Firebase Analytics]
    end
    
    subgraph "Services externes"
        OFF[Open Food Facts API]
        SENTRY[Sentry Error Tracking]
    end
    
    subgraph "CI/CD"
        GHA[GitHub Actions]
        FH[Firebase Hosting SSR]
    end
    
    APP --> COMP
    APP --> HOOKS
    HOOKS --> LIB
    HOOKS --> AUTH
    HOOKS --> FS
    COMP --> STORAGE
    LIB --> OFF
    APP --> SENTRY
    GHA --> FH
```

## Architecture des modules

```mermaid
graph LR
    subgraph "Modules principaux"
        DASH[Dashboard]
        DIETE[Diète & Nutrition]
        TRAIN[Entraînements]
        MESURES[Mesures & Photos]
        JOURNAL[Journal & Motivation]
        PROFIL[Profil Utilisateur]
        COACH[Mode Coach]
        EXPORT[Export de données]
    end
    
    subgraph "Services partagés"
        AUTH_SVC[Authentication]
        FIRESTORE[Data Layer]
        CALC[Calculations]
        VALIDATION[Validation]
    end
    
    DASH --> AUTH_SVC
    DASH --> FIRESTORE
    DIETE --> FIRESTORE
    DIETE --> CALC
    TRAIN --> FIRESTORE
    TRAIN --> CALC
    MESURES --> FIRESTORE
    MESURES --> CALC
    JOURNAL --> FIRESTORE
    PROFIL --> FIRESTORE
    PROFIL --> CALC
    COACH --> FIRESTORE
    EXPORT --> FIRESTORE
```

## Structure des données (Firestore)

```mermaid
erDiagram
    USERS ||--o{ REPAS : "has"
    USERS ||--o{ ENTRAINEMENTS : "has"
    USERS ||--o{ MESURES : "has"
    USERS ||--o{ PHOTOS : "has"
    USERS ||--o{ JOURNAL : "has"
    USERS ||--o{ COACH_COMMENTS : "receives"
    USERS ||--o{ COACH_DIET_PLANS : "has"
    
    USERS {
        string id PK
        string role "coach|sportif"
        string nom
        string email
        object objectif
        object niveauActivite
    }
    
    REPAS {
        string id PK
        string user_id FK
        date date
        string repas
        array aliments
        object macros
    }
    
    ENTRAINEMENTS {
        string id PK
        string user_id FK
        date date
        string type
        number duree
        number calories
    }
    
    MESURES {
        string id PK
        string user_id FK
        date date
        number poids
        number imc
        number masse_grasse
    }
    
    PHOTOS {
        string id PK
        string user_id FK
        date date
        string url
        string type
        string mesure_id FK
    }
    
    JOURNAL {
        string id PK
        string user_id FK
        date date
        string note
        number humeur
        number energie
    }
    
    COACH_COMMENTS {
        string id PK
        string coach_id FK
        string athlete_id FK
        string module
        string comment
        boolean read_by_athlete
    }
    
    COACH_DIET_PLANS {
        string id PK
        string coach_id FK
        string athlete_id FK
        date date_creation
        string petit_dejeuner
        string notes_generales
    }
```

## Flux d'authentification

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant FB as Firebase Auth
    participant FS as Firestore
    
    U->>A: Accès à l'application
    A->>FB: Vérifier session
    alt Session valide
        FB-->>A: User authentifié
        A->>FS: Charger profil utilisateur
        FS-->>A: Données utilisateur
        A-->>U: Dashboard personnalisé
    else Pas de session
        FB-->>A: Non authentifié
        A-->>U: Page d'accueil publique
        U->>A: Login/Register
        A->>FB: Authentification
        FB-->>A: Token
        A->>FS: Créer/Charger profil
        FS-->>A: Données utilisateur
        A-->>U: Dashboard personnalisé
    end
```

## Architecture des composants

```mermaid
graph TD
    subgraph "Layout Components"
        MainLayout[MainLayout]
        Sidebar[Sidebar]
        AuthGuard[AuthGuard]
    end
    
    subgraph "UI Components"
        Button[Button]
        Dialog[Dialog]
        Form[Form]
        Card[Card]
        Charts[Charts]
        Toast[Toast]
    end
    
    subgraph "Feature Components"
        ExportButton[ExportButton]
        FirebaseErrorDisplay[FirebaseErrorDisplay]
        AccessibleButton[AccessibleButton]
        VitalsReporter[VitalsReporter]
    end
    
    MainLayout --> Sidebar
    MainLayout --> AuthGuard
    ExportButton --> Button
    ExportButton --> Dialog
    FirebaseErrorDisplay --> Card
    AccessibleButton --> Button
```

## Stack technique détaillée

### Frontend
- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript 5.3.3
- **Styling**: Tailwind CSS 3.4.0 + Glassmorphism theme
- **State Management**: Zustand 4.4.7
- **Forms**: React Hook Form 7.48.2 + Zod 3.25.76
- **Charts**: Recharts 2.10.3 + Chart.js 4.5.0
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion 10.16.16

### Backend & Services
- **Authentication**: Firebase Auth (Email/Password)
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Analytics**: Firebase Analytics + Web Vitals
- **Error Tracking**: Sentry 10.5.0
- **APIs**: Open Food Facts (nutrition data)

### Build & Deployment
- **CI/CD**: GitHub Actions
- **Hosting**: Firebase Hosting SSR
- **Container**: Cloud Run (via Firebase)
- **Artifacts**: Artifact Registry

### Development Tools
- **Testing**: Vitest 3.2.4 + React Testing Library
- **Linting**: ESLint + TypeScript ESLint
- **Bundle Analysis**: Next.js Bundle Analyzer
- **Code Quality**: TypeScript strict mode

## Points d'entrée principaux

1. **`/` (Home)**: Landing page publique ou dashboard si connecté
2. **`/auth`**: Authentification (login/register)
3. **`/diete`**: Module nutrition
4. **`/entrainements`**: Module entraînements
5. **`/mesures`**: Module mesures corporelles
6. **`/journal`**: Module journal personnel
7. **`/profil`**: Gestion du profil
8. **`/coach/*`**: Espace coach
9. **`/export`**: Export de données

## Patterns architecturaux

### 1. **Hooks Pattern**
- Encapsulation de la logique Firebase dans des hooks custom
- Exemple: `useAuth`, `useFirestore`, `usePaginatedData`

### 2. **Error Boundary Pattern**
- Gestion centralisée des erreurs Firebase
- Hook `useFirebaseError` avec retry automatique

### 3. **Dynamic Import Pattern**
- Chargement différé des composants lourds (charts, modals)
- Optimisation du bundle initial

### 4. **Composition Pattern**
- Components UI réutilisables avec Radix UI
- Variants avec class-variance-authority

### 5. **Server-Side Rendering**
- Pages statiques générées au build
- Dynamic rendering pour les pages authentifiées

## Sécurité

### Firestore Rules
- Authentification requise pour toutes les collections
- Isolation des données par `user_id`
- Permissions spéciales pour les coaches
- Validation des structures de données

### Secrets Management
- Variables d'environnement pour les clés API
- GitHub Secrets pour CI/CD
- Compte de service pour déploiement

## Performance

### Optimisations appliquées
- Dynamic imports pour réduire le bundle
- Image optimization avec next/image (WebP)
- Preconnect pour les domaines externes
- Pagination Firestore pour les grandes listes
- Sections historiques fermées par défaut

### Métriques actuelles
- FCP: 0.44s (excellent)
- LCP: 1.31s (bon)
- TBT: 0.72s (à améliorer)
- CLS: 0.08 (excellent)

## Scalabilité

### Points forts
- Architecture modulaire facilement extensible
- Services Firebase auto-scalables
- SSR avec Cloud Run
- CDN via Firebase Hosting

### Points d'attention
- Pagination manuelle côté client sur certaines pages
- Pas de cache Redis/Memcached
- Queries Firestore non optimisées (manque d'indexes composites)