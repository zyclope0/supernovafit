# 📊 FIREBASE ANALYTICS - Guide Console

## Consulter métriques utilisateurs SuperNovaFit

---

## 🎯 **QUE VOIR DANS FIREBASE ANALYTICS**

Firebase Analytics track automatiquement :

- **Utilisateurs actifs** (quotidien/hebdomadaire/mensuel)
- **Events custom SuperNovaFit** (meal_added, training_added, etc.)
- **Pages populaires** (Dashboard, Diète, Entraînements)
- **Device info** (Mobile/Desktop, Navigateurs)
- **User engagement** (Durée sessions, retention)

---

## 🚀 **ACCÈS FIREBASE CONSOLE**

### **1. Connexion Console**

```bash
# 1. Aller sur : https://console.firebase.google.com/
# 2. Se connecter avec compte Google
# 3. Sélectionner projet "supernovafit-a6fe7"
```

### **2. Navigation Analytics**

```bash
# Menu gauche Firebase Console :
# 📊 Analytics
#   ├── Dashboard          ← Vue générale
#   ├── Events             ← Events custom SuperNovaFit
#   ├── Conversions        ← Goals completion
#   ├── Audiences          ← Segments utilisateurs
#   ├── Funnel Analysis    ← Parcours utilisateur
#   ├── Cohort Analysis    ← Retention
#   ├── StreamView         ← Temps réel
#   └── DebugView          ← Test events
```

---

## 📈 **DASHBOARD PRINCIPAL**

### **Métriques Clés**

```bash
# 👥 Utilisateurs
- Active users (1/7/28 jours)
- New vs Returning users
- User retention

# 📱 Engagement
- Average engagement time
- Engaged sessions per user
- Event count per user

# 💰 Monetization (si applicable)
- Revenue per user
- Purchase events

# 🌍 Demographics
- Countries/Cities
- Languages
- Devices (Mobile/Desktop)
- Operating Systems
```

### **Graphiques Importants**

```bash
# 📊 User activity (7 derniers jours)
# → Pic d'activité à quelle heure ?
# → Quels jours plus actifs ?

# 📱 Platform breakdown
# → % Mobile vs Desktop
# → Navigateurs populaires

# 🌍 Geographic data
# → Pays utilisateurs
# → Optimisations timezone ?
```

---

## 🎯 **EVENTS SUPERNOVAFIT CUSTOM**

### **Events Configurés Automatiquement**

```bash
# Menu Analytics → Events → Table events

# 🍽️ meal_added
- Paramètres : meal_type, food_count, calories
- Usage : Combien repas ajoutés par jour
- Insight : Quels types repas populaires

# 🏋️ training_added
- Paramètres : training_type, duration, source
- Usage : Fréquence entraînements
- Insight : Manuel vs Import Garmin

# 📝 journal_entry
- Paramètres : mood_score, energy_score
- Usage : Engagement journal
- Insight : Corrélation humeur/usage

# 🔍 food_search
- Paramètres : query_length, results_count
- Usage : Efficacité recherche
- Insight : Termes recherchés populaires

# 📊 page_view
- Paramètres : page_name, user_role
- Usage : Pages populaires
- Insight : Coach vs Sportif behavior
```

### **Analyser Events Custom**

```bash
# 1. Analytics → Events → Sélectionner "meal_added"

# 2. Voir métriques :
#    - Event count (combien total)
#    - Users triggered (combien utilisateurs)
#    - Event value (valeur moyenne)

# 3. Breakdown par paramètre :
#    - meal_type : petit_dej vs diner popularité
#    - food_count : moyennes aliments par repas
#    - calories : distribution calories

# 4. Trends temporelles :
#    - Évolution dans le temps
#    - Patterns jour/semaine
```

---

## 📊 **RAPPORTS UTILES**

### **1. Engagement Report**

```bash
# Analytics → Engagement → Pages and screens

# 📄 Pages populaires :
1. / (Dashboard)           - 45% traffic
2. /diete                  - 30% traffic
3. /entrainements          - 15% traffic
4. /journal                - 7% traffic
5. /mesures                - 3% traffic

# 💡 Insights :
# → Dashboard = point d'entrée principal
# → Diète = feature la plus utilisée
# → Journal = moins populaire (optimiser ?)
```

### **2. User Journey Flow**

```bash
# Analytics → Exploration → Path exploration

# 🛣️ Parcours typique :
1. Landing → Dashboard
2. Dashboard → Diète
3. Diète → Ajouter repas
4. Retour Dashboard
5. [Exit ou autre module]

# 🔍 Analyse abandons :
# → Où utilisateurs quittent ?
# → Pages problématiques ?
# → UX à améliorer ?
```

### **3. Real-time Overview**

```bash
# Analytics → Realtime → Overview

# 🔴 Temps réel (derniers 30 min) :
- Active users now : 2-5 utilisateurs
- Top pages : Dashboard, Diète
- Top events : page_view, meal_added
- Geographic : France (principal)
- Device : 60% Desktop, 40% Mobile

# 💡 Usage :
# → Tester nouvelles features en live
# → Voir impact deploys immédiats
```

---

## 🔧 **CONFIGURATION AVANCÉE**

### **1. Custom Dimensions (Optionnel)**

```bash
# Pour tracking plus précis :
# Analytics → Configure → Custom definitions

# Exemples dimensions utiles :
- user_role : "coach" vs "sportif"
- subscription_type : "free" vs "premium"
- app_version : "1.2.0"
- feature_flags : enabled features
```

### **2. Audiences Segments**

```bash
# Analytics → Audiences → Create Audience

# Segments utiles :
# 👥 "Power Users" :
#    - meal_added > 50 last 30 days
#    - training_added > 10 last 30 days

# 🏋️ "Fitness Focused" :
#    - training_added > journal_entry
#    - page_view contains "/entrainements"

# 🍽️ "Nutrition Focused" :
#    - meal_added > training_added
#    - page_view contains "/diete"
```

### **3. Conversions Goals**

```bash
# Analytics → Conversions → Create conversion

# Goals SuperNovaFit :
# 🎯 "Complete Profile" :
#    - Event : profile_completed
#    - Value : User retention

# 🎯 "Weekly Active" :
#    - Event : session_start
#    - Condition : >= 3 days in week

# 🎯 "Feature Adoption" :
#    - Event : training_added
#    - Condition : first time user
```

---

## 📱 **MONITORING QUOTIDIEN**

### **Dashboard Daily Check (2 minutes)**

```bash
# 1. Analytics → Dashboard → Filtrer "Last 24 hours"

# 📊 Vérifier :
✅ Active users > 0 (app utilisée)
✅ No dramatic drops (pas de bugs)
✅ Events firing (meal_added, training_added)
✅ No error spikes (si tracking errors)

# 🚨 Red flags :
❌ 0 active users (app down ?)
❌ Events stopped (tracking broken ?)
❌ Massive drop usage (performance issue ?)
```

### **Weekly Analytics Review (15 minutes)**

```bash
# 1. User Growth :
#    - Nouveaux utilisateurs semaine
#    - Retention rate
#    - Churn analysis

# 2. Feature Usage :
#    - Events trends (meal_added, training_added)
#    - Page popularity changes
#    - User journey patterns

# 3. Technical Health :
#    - Error rates
#    - Performance metrics
#    - Device/Browser distribution
```

---

## 📊 **EXPORT & REPORTS**

### **Export Data**

```bash
# Analytics → Configure → Data export

# 🔄 BigQuery (gratuit jusqu'à 1GB) :
# → Export raw data
# → Custom analyses SQL
# → Advanced reporting

# 📧 Scheduled Reports :
# → Weekly summary email
# → Monthly detailed report
# → Custom metrics dashboard
```

### **Looker Studio Integration**

```bash
# Pour dashboards custom :
# 1. Analytics → Configure → Integrations
# 2. "Link to Data Studio"
# 3. Créer rapports visuels custom
# 4. Partager avec équipe
```

---

## 🎯 **INSIGHTS BUSINESS**

### **Questions à se poser**

```bash
# 📈 Growth :
# → Utilisateurs augmentent ?
# → Retention améliore ?
# → Churn diminue ?

# 🎯 Product :
# → Features populaires ?
# → Abandons dans funnel ?
# → UX pain points ?

# 🔧 Technical :
# → Performance impacts usage ?
# → Mobile vs Desktop preferences ?
# → Error correlation avec drops ?
```

### **Actions possibles**

```bash
# Si meal_added populaire :
# → Améliorer UX ajout repas
# → Ajouter shortcuts
# → Optimiser recherche aliments

# Si journal_entry faible :
# → Simplifier interface
# → Ajouter reminders
# → Gamification badges

# Si mobile usage bas :
# → Optimiser responsive
# → PWA features
# → Touch targets
```

---

## ✅ **FIREBASE ANALYTICS MAÎTRISÉ**

**Tu sais maintenant :**

- ✅ Consulter dashboard Analytics
- ✅ Analyser events custom SuperNovaFit
- ✅ Comprendre user behavior
- ✅ Identifier optimisations possibles

**Prochaine étape : [3. Web Vitals Performance →](./3-WEB_VITALS.md)**
