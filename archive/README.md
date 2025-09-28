# 📦 Archive SuperNovaFit

Ce dossier contient les fichiers archivés qui ne sont pas nécessaires au fonctionnement du projet en production.

## 📁 Structure

### `/non-essential/`

Fichiers temporaires, rapports et outils de développement :

- **Rapports de performance** : `chromewebdata_*.report.html`, `localhost_*.report.html`
- **Fichiers de build temporaires** : `tsconfig.tsbuildinfo`, `knip-output.json`
- **Coverage de tests** : `/coverage/` (généré automatiquement)
- **Scripts de test** : `/scripts/` (environnement de test)
- **Exemples** : `/examples/` (non utilisés en production)
- **Fichiers de fallback** : `fallback-*.js` (générés automatiquement)

## 🎯 Objectif

Réduire la taille du repository et améliorer les performances en excluant :

- Fichiers temporaires de build
- Rapports de performance générés
- Outils de développement non critiques
- Données de test volumineuses

## 📋 Règles

- Le dossier `/archive/non-essential/` est ignoré par Git (`.gitignore`)
- Les fichiers peuvent être restaurés si nécessaire
- Seuls les fichiers essentiels au fonctionnement restent dans le repo principal

---

**SuperNovaFit v2.0.0** - Archive créée le 27.09.2025
