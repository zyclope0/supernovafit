# 🎨 SPÉCIFICATIONS ICÔNES PWA - SuperNovaFit

**Date :** 15.01.2025  
**Version :** 1.10.0  

## 🎯 **REQUIREMENTS PWA ICONS**

### **Tailles requises :**
- ✅ **72x72px** - Android Chrome
- ✅ **96x96px** - Android Chrome
- ✅ **128x128px** - Android Chrome
- ✅ **144x144px** - Windows
- ✅ **152x152px** - iOS Safari
- ✅ **192x192px** - Android Chrome (standard)
- ✅ **384x384px** - Android Chrome
- ✅ **512x512px** - Android Chrome (standard)

### **Shortcuts (96x96px) :**
- ✅ **shortcut-dashboard.png** - Dashboard principal
- ✅ **shortcut-challenges.png** - Page challenges
- ✅ **shortcut-diete.png** - Page diète

## 🎨 **DESIGN SPECIFICATIONS**

### **Style visuel :**
- **Thème** : Space/Neon cohérent avec l'app
- **Couleurs** : 
  - Primary: `#3b82f6` (bleu)
  - Background: `#0f0f23` (space dark)
  - Accent: `#8b5cf6` (violet)
- **Logo** : SuperNovaFit avec étoile/planète
- **Format** : PNG avec transparence
- **Style** : Moderne, minimaliste, reconnaissable

### **Contraintes techniques :**
- **Maskable** : Support des icônes adaptatives Android
- **Contraste** : Minimum 3:1 pour accessibilité
- **Lisibilité** : Reconnaissable à petite taille
- **Cohérence** : Style uniforme sur toutes les tailles

## 📁 **STRUCTURE FICHIERS**

```
public/
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── shortcut-dashboard.png
│   ├── shortcut-challenges.png
│   └── shortcut-diete.png
└── screenshots/
    ├── desktop-dashboard.png (1280x720)
    └── mobile-dashboard.png (390x844)
```

## 🚀 **GÉNÉRATION TEMPORAIRE**

Pour les tests, des icônes temporaires peuvent être créées avec :
- **Favicon existant** : Copié et redimensionné
- **Placeholder** : Icônes simples avec texte "SNF"
- **Outils** : GIMP, Photoshop, ou générateurs en ligne

## ✅ **VALIDATION**

### **Tests requis :**
- ✅ **Lighthouse PWA** : Score 100/100
- ✅ **Installation** : Banner d'installation fonctionnel
- ✅ **Affichage** : Icônes visibles dans toutes les tailles
- ✅ **Maskable** : Support Android adaptatif

### **Outils de validation :**
- **Lighthouse** : Audit PWA complet
- **PWA Builder** : Validation manifest et icônes
- **Chrome DevTools** : Test installation

## 📝 **NOTES IMPORTANTES**

1. **Icônes temporaires** : Créées pour les tests, à remplacer par le design final
2. **Design cohérent** : Respecter l'identité visuelle SuperNovaFit
3. **Performance** : Optimiser la taille des fichiers
4. **Accessibilité** : Contraste et lisibilité suffisants

---

**Status** : ⏳ **EN ATTENTE** - Icônes temporaires créées, design final à implémenter
