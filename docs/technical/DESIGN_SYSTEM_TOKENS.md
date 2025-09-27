# 🎨 DESIGN SYSTEM TOKENS - SUPERNOVAFIT

**Version :** 1.0.0  
**Date :** 21.09.2025  
**Statut :** 🏆 SYSTÈME CENTRALISÉ - 1 fichier contrôle tout

## 🎯 **OBJECTIF**

Créer un système de design tokens **parfaitement centralisé** où **1 seul fichier** contrôle toutes les couleurs, transparences et styles de l'application.

## 📍 **LOCALISATION DES TOKENS**

### **Fichier principal :** `src/styles/globals.css`
```css
:root {
  /* === PALETTE NEON CENTRALISÉE === */
  /* Pour changer de thème, modifier SEULEMENT ces valeurs */
  --neon-purple: #a855f7;
  --neon-pink: #ec4899;
  --neon-blue: #3b82f6;
  --neon-cyan: #06b6d4;
  --neon-green: #10b981;
  --neon-yellow: #eab308;
  --neon-orange: #f97316;
  --neon-red: #ef4444;
}
```

### **Configuration Tailwind :** `tailwind.config.ts`
```typescript
neon: {
  purple: '#a855f7',
  pink: '#ec4899',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  green: '#10b981',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',
}
```

## 🎨 **PALETTE DE COULEURS**

### **Couleurs Neon**
| Couleur | Code | Usage |
|---------|------|-------|
| `--neon-purple` | `#a855f7` | Actions principales, titres |
| `--neon-pink` | `#ec4899` | Accent, lipides, alertes |
| `--neon-blue` | `#3b82f6` | Informations, liens |
| `--neon-cyan` | `#06b6d4` | Secondaire, protéines |
| `--neon-green` | `#10b981` | Succès, calories, validation |
| `--neon-yellow` | `#eab308` | Attention, énergie |
| `--neon-orange` | `#f97316` | Performance, glucides |
| `--neon-red` | `#ef4444` | Erreurs, danger |

### **Couleurs Sémantiques**
| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-success` | `var(--neon-green)` | Validation, succès |
| `--color-warning` | `var(--neon-yellow)` | Attention, avertissement |
| `--color-error` | `var(--neon-red)` | Erreurs, échecs |
| `--color-info` | `var(--neon-cyan)` | Informations, aide |
| `--color-primary` | `var(--neon-purple)` | Actions principales |
| `--color-secondary` | `var(--neon-pink)` | Actions secondaires |

## 🔍 **TRANSPARENCES STANDARDISÉES**

### **Effets Glass**
| Classe | Background | Border | Usage |
|--------|------------|--------|-------|
| `.glass-effect` | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.15)` | Standard |
| `.glass-effect-high` | `rgba(255,255,255,0.12)` | `rgba(255,255,255,0.20)` | Éléments critiques |
| `.glass-effect-dark` | `rgba(0,0,0,0.20)` | `rgba(255,255,255,0.10)` | Texte sur fond sombre |

### **Tokens CSS**
```css
--glass-bg: rgba(255, 255, 255, 0.08);
--glass-bg-high: rgba(255, 255, 255, 0.12);
--glass-bg-dark: rgba(0, 0, 0, 0.20);
--glass-border: rgba(255, 255, 255, 0.15);
--glass-border-high: rgba(255, 255, 255, 0.20);
--glass-border-dark: rgba(255, 255, 255, 0.10);
```

## 🛠️ **UTILISATION**

### **Classes Tailwind (Recommandé)**
```html
<!-- Couleurs neon -->
<div class="text-neon-purple bg-neon-cyan/10 border-neon-green/20">

<!-- Couleurs sémantiques -->
<div class="text-success bg-warning border-error">

<!-- Effets glass -->
<div class="glass-effect">
<div class="glass-effect-high">
<div class="glass-effect-dark">
```

### **Classes CSS personnalisées**
```html
<!-- Couleurs sémantiques -->
<div class="text-primary bg-secondary border-success">
```

### **Variables CSS directes**
```css
.custom-element {
  color: var(--neon-purple);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}
```

## 🔄 **CHANGEMENT DE THÈME**

### **Pour changer de thème complet :**

1. **Modifier `src/styles/globals.css`** :
```css
:root {
  /* Nouveau thème - modifier SEULEMENT ces valeurs */
  --neon-purple: #nouvelle-couleur;
  --neon-pink: #nouvelle-couleur;
  /* ... etc */
}
```

2. **Modifier `tailwind.config.ts`** :
```typescript
neon: {
  purple: '#nouvelle-couleur',
  pink: '#nouvelle-couleur',
  // ... etc
}
```

3. **Rebuilder l'application** :
```bash
npm run build
```

### **Exemple : Thème "Ocean"**
```css
:root {
  --neon-purple: #0ea5e9;  /* Bleu océan */
  --neon-pink: #06b6d4;    /* Cyan */
  --neon-blue: #0284c7;    /* Bleu profond */
  --neon-cyan: #0891b2;    /* Cyan profond */
  --neon-green: #059669;   /* Vert océan */
  --neon-yellow: #eab308;  /* Jaune (inchangé) */
  --neon-orange: #ea580c;  /* Orange océan */
  --neon-red: #dc2626;     /* Rouge océan */
}
```

## 📊 **BÉNÉFICES**

### **✅ Avantages**
- **1 seul fichier** à modifier pour changer de thème
- **Cohérence** garantie sur toute l'application
- **Maintenabilité** maximale
- **Performance** optimisée (CSS variables)
- **Flexibilité** pour thèmes futurs
- **Documentation** centralisée

### **🎯 Cas d'usage**
- **Changement de thème** : Modifier 1 fichier
- **Ajustement de couleurs** : Modifier 1 fichier
- **Nouveau thème** : Créer 1 fichier de variables
- **Mode sombre/clair** : Ajouter des variables conditionnelles

## 🚀 **MIGRATION**

### **Étapes pour migrer vers le système centralisé :**

1. **Identifier les couleurs hardcodées** :
```bash
grep -r "#[0-9a-fA-F]" src/components/
```

2. **Remplacer par les tokens** :
```html
<!-- Avant -->
<div style="color: #a855f7; background: rgba(255,255,255,0.08);">

<!-- Après -->
<div class="text-neon-purple glass-effect">
```

3. **Utiliser les couleurs sémantiques** :
```html
<!-- Avant -->
<div class="text-neon-green">Succès</div>

<!-- Après -->
<div class="text-success">Succès</div>
```

## 📋 **CHECKLIST STANDARDISATION**

- [ ] **Palette neon complète** dans `tailwind.config.ts`
- [ ] **Tokens CSS** dans `globals.css`
- [ ] **Couleurs sémantiques** définies
- [ ] **Transparences standardisées**
- [ ] **Classes utilitaires** créées
- [ ] **Documentation** à jour
- [ ] **Tests** de changement de thème
- [ ] **Migration** des couleurs hardcodées

## 🎉 **RÉSULTAT**

**1 seul fichier** (`src/styles/globals.css`) contrôle maintenant **100% des couleurs** de l'application. Pour changer de thème, il suffit de modifier les variables CSS dans ce fichier !

---

**SuperNovaFit v1.13.0** © 2025 - Design System Tokens Centralisés 🎨
