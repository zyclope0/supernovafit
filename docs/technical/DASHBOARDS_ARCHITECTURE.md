# 📊 ARCHITECTURE DASHBOARDS SUPERNOVAFIT v1.12.0

> **Documentation complète** des différents dashboards et leurs conditions d'affichage
> **CRITIQUE** : Modifier TOUS les dashboards lors d'ajouts/modifications de fonctionnalités

---

## 🎯 **VUE D'ENSEMBLE DASHBOARDS**

SuperNovaFit utilise **4 dashboards principaux** selon le contexte utilisateur et la taille d'écran :

### **📱 DASHBOARDS ATHLÈTES**

#### **1. MobileDashboard.tsx** 
```typescript
// Fichier: src/components/mobile/MobileDashboard.tsx
// Condition: <xl (< 1280px) + utilisateur connecté

Breakpoint: block xl:hidden
Utilisateurs: Athlètes + Coaches sur mobile/tablette
Fonctionnalités:
- Widgets configurables (6 widgets)
- Tailles dynamiques (small/medium/large)
- Interactions tactiles (toggle size)
- Données temps réel (onSnapshot)

Widgets:
1. calories-today: Calories du jour
2. weight-trend: Tendance poids  
3. training-week: Entraînements semaine
4. mood-today: Humeur du jour
5. goals-progress: Progression objectifs
6. quick-stats: Stats rapides
```

#### **2. DesktopDashboard.tsx** 
```typescript
// Fichier: src/components/desktop/DesktopDashboard.tsx
// Condition: ≥xl (≥ 1280px) + utilisateur connecté

Breakpoint: hidden xl:block
Utilisateurs: Athlètes + Coaches sur desktop
Layout: Flexbox (flex-1 + w-80)

Structure:
├── Header (Bienvenue + Sélecteur période)
├── Stats rapides (6 stats en ligne)
├── Colonne principale (70%)
│   ├── Balance Énergétique (h-96, pleine largeur)
│   ├── Évolution Calories + Macros (grid 2 cols, h-96)
│   └── Évolution Poids & IMC (h-80, pleine largeur)
└── Sidebar droite (320px fixe)
    ├── Section coach (si athlète lié)
    ├── Actions Rapides (4 boutons gradient)
    ├── Activité Récente (5 dernières actions)
    ├── Objectifs du Jour (3 progress bars)
    └── Notifications (alertes contextuelles)

Graphiques spécialisés:
- CaloriesChart: Évolution 7 jours
- CaloriesInOutChart: Balance énergétique
- MacrosChart: Répartition nutritionnelle
- WeightIMCChart: Poids & IMC seulement (optimisé)
```

### **🏃‍♂️ DASHBOARDS COACHES**

#### **3. CoachDashboard (page.tsx)**
```typescript
// Fichier: src/app/coach/page.tsx
// Condition: userProfile.role === 'coach'

Layout: Standard avec MainLayout
Fonctionnalités:
- Statistiques globales (3 cards)
- Liste athlètes avec recherche
- Bouton invitation nouveaux athlètes
- Actions rapides coach

Stats:
- Total athlètes
- Athlètes actifs  
- Progression moyenne
- Taux de réussite
```

#### **4. AthleteDetailPage**
```typescript
// Fichier: src/app/coach/athlete/[id]/page.tsx
// Condition: Coach + ID athlète spécifique

Layout: CoachLayout avec tabs
Tabs:
- overview: Vue d'ensemble
- nutrition: Suivi diète
- training: Entraînements
- measures: Mesures corporelles

Graphiques:
- DynamicLineChart: Évolutions
- DynamicBarChart: Comparaisons
```

### **🌐 DASHBOARD PUBLIC**

#### **5. LandingPage**
```typescript
// Fichier: src/app/page.tsx (fonction LandingPage)
// Condition: !user (non connecté)

Contenu:
- Hero section avec CTA
- Statistiques publiques
- Fonctionnalités principales
- Call to action inscription
```

---

## 🔧 **RÈGLES CRITIQUES DE MODIFICATION**

### **⚠️ LORS D'AJOUT DE FONCTIONNALITÉS**

**OBLIGATOIRE** : Modifier TOUS les dashboards concernés :

#### **Nouvelle donnée/métrique :**
```typescript
// Exemple: Ajout "hydratation"
✅ À modifier:
1. MobileDashboard.tsx → Ajouter widget hydratation
2. DesktopDashboard.tsx → Ajouter stat rapide + graphique
3. CoachDashboard → Ajouter dans stats globales
4. AthleteDetailPage → Ajouter dans overview
```

#### **Nouveau module fonctionnel :**
```typescript
// Exemple: Module "Sommeil"
✅ À modifier:
1. MobileDashboard.tsx → Nouveau widget sommeil
2. DesktopDashboard.tsx → Quick action + activité récente
3. Actions Rapides → Bouton "Journal sommeil"
4. Navigation → Nouvel item menu
```

#### **Modification calculs :**
```typescript
// Exemple: Nouveau calcul TDEE
✅ À modifier:
1. DesktopDashboard.tsx → Stats calories + objectifs
2. MobileDashboard.tsx → Widget calories-today
3. Graphiques → CaloriesInOutChart avec nouveau TDEE
```

### **🎨 COHÉRENCE DESIGN SYSTEM**

**OBLIGATOIRE** : Respecter les standards sur tous les dashboards :

```typescript
// Couleurs standardisées
neon-purple: Actions principales, titres
neon-cyan: Protéines, informations
neon-green: Calories, succès
neon-pink: Lipides, alertes

// Composants standardisés
PageHeader: Headers uniformes (pages secondaires)
StatsDashboard: Stats avec couleurs (pages listes)
Glass-effect: Containers avec backdrop-blur

// Animations standardisées
hover:scale-105: Boutons et cards interactives
transition-all duration-200: Transitions fluides
```

---

## 📊 **MATRICE DE RESPONSABILITÉ**

| Fonctionnalité | MobileDashboard | DesktopDashboard | CoachDashboard | AthleteDetail |
|----------------|-----------------|------------------|----------------|---------------|
| **Calories jour** | ✅ Widget | ✅ Stat + Graph | ✅ Stats globales | ✅ Overview |
| **Poids** | ✅ Widget | ✅ Stat + Graph | ✅ Progression | ✅ Measures tab |
| **Entraînements** | ✅ Widget | ✅ Stat + Activity | ✅ Stats globales | ✅ Training tab |
| **Humeur** | ✅ Widget | ✅ Stat + Notifs | ❌ N/A | ✅ Overview |
| **Actions rapides** | ❌ FAB externe | ✅ Sidebar | ✅ Boutons | ❌ N/A |
| **Coach status** | ❌ Externe | ✅ Sidebar | ❌ N/A | ❌ N/A |

---

## 🚨 **CHECKLIST MODIFICATIONS**

### **Avant toute modification importante :**

- [ ] **Identifier impact** : Quels dashboards sont concernés ?
- [ ] **MobileDashboard** : Widgets à ajouter/modifier ?
- [ ] **DesktopDashboard** : Stats/graphiques/actions à mettre à jour ?
- [ ] **CoachDashboard** : Stats globales à recalculer ?
- [ ] **AthleteDetail** : Tabs/overview à enrichir ?
- [ ] **Design System** : Couleurs/composants cohérents ?
- [ ] **Tests** : Tous les dashboards fonctionnent ?

### **Après modification :**

- [ ] **Test responsive** : Mobile + Desktop + Coach
- [ ] **Test données vides** : Affichage par défaut correct ?
- [ ] **Test performances** : Pas de régression bundle ?
- [ ] **Documentation** : Ce fichier mis à jour ?

---

## 💡 **BONNES PRATIQUES**

### **Ajout de nouvelles données :**
1. **Hook centralisé** : useFirestore pour cohérence
2. **Calculs partagés** : lib/calculations.ts
3. **Types stricts** : Interfaces TypeScript
4. **États de chargement** : Skeletons uniformes

### **Nouveaux graphiques :**
1. **Dynamic import** : Optimisation bundle
2. **ResponsiveContainer** : width="100%" height="100%"
3. **Couleurs neon-*** : Cohérence palette
4. **Tooltips personnalisés** : Glass-effect

### **Nouvelles actions :**
1. **Quick actions** : DesktopDashboard sidebar
2. **FAB contextuel** : Mobile navigation
3. **Raccourcis** : Hooks useQuickActions
4. **Toast feedback** : Confirmation utilisateur

---

**SuperNovaFit v1.12.0** - Architecture dashboards multi-contexte  
**IMPORTANT** : Cette documentation DOIT être mise à jour à chaque évolution ! 🎯
