# 🚀 Auto-Versioning Guide

Ce projet utilise un système automatisé de gestion des versions basé sur **GitHub Actions** et les **messages de commit conventionnels**.

## 📋 Comment ça fonctionne

### 🔄 Déclenchement automatique
Le versioning automatique se déclenche quand :
- ✅ Un **Push direct** sur la branche `main`
- ✅ Une **Pull Request** est **mergée** dans `main`
- ❌ **Ignoré** si le message contient `[skip ci]`

### 📊 Types de version

Le système analyse vos messages de commit pour déterminer le type de bump :

| Type de commit | Version bump | Exemple |
|----------------|--------------|---------|
| `BREAKING CHANGE:`, `feat!:`, `fix!:` | **MAJOR** 🔴 | `1.0.0` → `2.0.0` |
| `feat:`, `feature:`, `minor:` | **MINOR** 🟡 | `1.0.0` → `1.1.0` |
| `fix:`, `patch:`, `chore:`, `docs:` | **PATCH** 🟢 | `1.0.0` → `1.0.1` |

## ✅ Messages de commit recommandés

### 🟢 Pour un PATCH (1.0.0 → 1.0.1)
```bash
git commit -m "fix: correction du bug d'authentification"
git commit -m "chore: mise à jour des dépendances"
git commit -m "docs: amélioration de la documentation"
git commit -m "style: correction du formatage ESLint"
```

### 🟡 Pour un MINOR (1.0.0 → 1.1.0)
```bash
git commit -m "feat: ajout de l'API de gestion des utilisateurs"
git commit -m "feature: nouvelle fonctionnalité de notification"
git commit -m "minor: amélioration des performances"
```

### 🔴 Pour un MAJOR (1.0.0 → 2.0.0)
```bash
git commit -m "BREAKING CHANGE: refactorisation complète de l'API"
git commit -m "feat!: changement incompatible dans l'authentification"
git commit -m "fix!: correction qui casse la compatibilité"
```

## 🛠️ Scripts NPM disponibles

Vous pouvez aussi gérer les versions manuellement :

```bash
# Version patch (ex: 1.0.0 → 1.0.1)
npm run version:patch

# Version minor (ex: 1.0.0 → 1.1.0)  
npm run version:minor

# Version major (ex: 1.0.0 → 2.0.0)
npm run version:major

# Release complète avec tests + lint + version
npm run release:patch
npm run release:minor
npm run release:major
```

## 🎯 Workflow GitHub Actions

### Ce qui se passe automatiquement :

1. **🧪 Tests** - Exécution de tous les tests
2. **🔍 Linting** - Vérification ESLint
3. **📊 Analyse** - Détermination du type de version
4. **📈 Bump** - Mise à jour du `package.json`
5. **💾 Commit** - Commit automatique des changements
6. **🏷️ Tag** - Création d'un tag Git
7. **🚀 Push** - Push des changements et tags
8. **📋 Release** - Création d'une release GitHub

### Exemple de sortie :
```
🚀 Bumping version with type: minor
📊 Current version: 1.0.0
✨ New version: 1.1.0
🏷️ Git tag: v1.1.0
🔗 Release URL: https://github.com/aminederouich/pfe-back/releases/tag/v1.1.0
```

## 🚫 Comment désactiver temporairement

Pour éviter le versioning automatique sur un commit :

```bash
git commit -m "fix: correction temporaire [skip ci]"
```

## 📁 Fichiers générés automatiquement

- ✅ `package.json` - Version mise à jour
- ✅ Tags Git - `v1.0.0`, `v1.1.0`, etc.
- ✅ Releases GitHub - Avec notes de version
- ✅ Historique des commits - Commits de version automatiques

## 🔧 Configuration avancée

### Modifier les règles de versioning
Éditez `.github/workflows/version-bump.yml` pour personnaliser :
- Les patterns de détection
- Les messages de commit
- Les conditions de déclenchement

### Permissions requises
Le workflow nécessite :
- `contents: write` - Pour modifier le repo
- `pull-requests: read` - Pour lire les PR

## 🎉 Avantages

- ✅ **Automatisé** - Plus d'oubli de version
- ✅ **Cohérent** - Règles standardisées
- ✅ **Traceable** - Historique complet
- ✅ **Professional** - Releases GitHub automatiques
- ✅ **Sécurisé** - Tests avant chaque release
