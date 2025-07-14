# 🚀 Auto-Versioning After Merge PR - Guide Complet

## 📋 Vue d'ensemble

Ce système d'auto-versioning a été conçu pour mettre à jour automatiquement les versions dans `package.json` et `package-lock.json` immédiatement après chaque merge de pull request, sans créer de PR supplémentaire.

## 🎯 Objectifs

- ✅ **Versioning automatique** : Met à jour la version après chaque merge de PR
- ✅ **Commit direct** : Pas de PR intermédiaire, mise à jour directe sur main
- ✅ **Conventional commits** : Analyse les commits pour déterminer le type de version (major/minor/patch)
- ✅ **Release automatique** : Crée automatiquement un tag Git et une release GitHub
- ✅ **Compatible protection de branche** : Fonctionne avec les règles de protection

## 🔄 Comment ça fonctionne

### 1. Déclenchement
- Se déclenche sur **push vers main**
- Condition : le commit doit contenir "Merge pull request"
- Ignore les commits avec `[skip version]` ou `chore(release)`

### 2. Analyse des commits
- Récupère le numéro de la PR depuis le message de merge
- Utilise l'API GitHub pour récupérer tous les commits de la PR
- Analyse chaque commit pour détecter le type de changement

### 3. Détermination du bump
```
🔴 MAJOR (x.0.0) : feat!, fix!, BREAKING CHANGE
🟡 MINOR (x.y.0) : feat, nouvelles fonctionnalités
🟢 PATCH (x.y.z) : fix, perf, revert, autres
```

### 4. Mise à jour des fichiers
- Met à jour `package.json` avec `npm version`
- Vérifie et corrige `package-lock.json` si nécessaire
- Crée un commit avec le message standardisé

### 5. Création du tag et release
- Crée un tag Git `vX.Y.Z`
- Pousse le commit et le tag vers GitHub
- Crée automatiquement une release GitHub

## 📁 Structure des fichiers

```
.github/workflows/
└── auto-version-after-merge.yml    # Workflow principal
test-auto-version-merge.js           # Script de validation
docs/
└── AUTO_VERSION_AFTER_MERGE.md     # Cette documentation
```

## 🛠️ Configuration requise

### 1. Permissions GitHub Actions
```yaml
permissions:
  contents: write      # Pour commit et push
  pull-requests: read  # Pour lire les détails des PR
```

### 2. Secrets
- `GITHUB_TOKEN` : Fourni automatiquement par GitHub Actions

### 3. Scripts package.json
```json
{
  "scripts": {
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
  }
}
```

## 📝 Format des commits conventionnels

Le système reconnaît les formats suivants :

### ✅ Formats supportés
```
feat: nouvelle fonctionnalité          → MINOR
feat!: changement cassant              → MAJOR
feat(api): nouvelle API                → MINOR
fix: correction de bug                 → PATCH
fix!: correction cassante              → MAJOR
perf: amélioration performance         → PATCH
revert: annulation de commit           → PATCH
docs: mise à jour documentation        → PATCH
chore: tâches de maintenance           → PATCH
```

### ❌ Formats ignorés
```
Update README.md                       → PATCH (par défaut)
Merge branch 'feature'                 → PATCH (par défaut)
WIP: work in progress                  → PATCH (par défaut)
```

## 🎮 Utilisation

### 1. Workflow normal
```bash
# 1. Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# 2. Faire des commits avec format conventionnel
git commit -m "feat: ajouter authentification utilisateur"
git commit -m "fix: corriger validation email"

# 3. Pousser la branche
git push origin feature/nouvelle-fonctionnalite

# 4. Créer une PR sur GitHub

# 5. Merger la PR
# → Le workflow se déclenche automatiquement
# → Version mise à jour dans package.json et package-lock.json
# → Tag et release créés automatiquement
```

### 2. Exemples de messages de commit

```bash
# Nouvelle fonctionnalité (MINOR)
git commit -m "feat: add user authentication system"
git commit -m "feat(api): implement REST endpoints for users"

# Correction de bug (PATCH)
git commit -m "fix: resolve login validation issue"
git commit -m "fix(auth): handle empty password case"

# Changement cassant (MAJOR)
git commit -m "feat!: change API response format"
git commit -m "fix!: remove deprecated endpoints"

# Amélioration performance (PATCH)
git commit -m "perf: optimize database queries"

# Documentation (PATCH)
git commit -m "docs: update API documentation"
```

## 🔍 Monitoring et debug

### 1. Vérifier les exécutions
```bash
# Aller sur GitHub
https://github.com/aminederouich/pfe-back/actions

# Chercher le workflow "🚀 Auto Version After Merge PR"
```

### 2. Logs de debug
Le workflow inclut des logs détaillés :
- Analyse des commits de la PR
- Type de bump détecté
- Version calculée
- Fichiers mis à jour

### 3. Script de validation
```bash
# Tester localement
node test-auto-version-merge.js
```

## 🚨 Résolution de problèmes

### Problème : Workflow ne se déclenche pas
**Causes possibles :**
- Le commit n'est pas un merge de PR
- Message contient `[skip version]`
- Permissions insuffisantes

**Solution :**
```bash
# Vérifier le message du dernier commit
git log -1 --pretty=format:"%s"

# Doit contenir "Merge pull request #XXX"
```

### Problème : Version incorrecte
**Causes possibles :**
- Commits non conventionnels
- API GitHub inaccessible

**Solution :**
- Utiliser des commits conventionnels
- Vérifier les permissions du token

### Problème : package-lock.json non mis à jour
**Causes possibles :**
- Versions incohérentes

**Solution :**
Le workflow inclut une correction automatique :
```bash
npm install --package-lock-only
```

## 📊 Exemples de versions

| Version actuelle | Type de commit | Nouvelle version |
|------------------|----------------|------------------|
| 1.0.0 | `feat: new feature` | 1.1.0 |
| 1.0.0 | `fix: bug fix` | 1.0.1 |
| 1.0.0 | `feat!: breaking` | 2.0.0 |
| 1.2.3 | `perf: optimize` | 1.2.4 |
| 2.0.0 | `docs: update` | 2.0.1 |

## 🔗 Liens utiles

- [Actions](https://github.com/aminederouich/pfe-back/actions)
- [Releases](https://github.com/aminederouich/pfe-back/releases)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## ✅ Checklist de mise en production

- [ ] Workflow créé dans `.github/workflows/`
- [ ] Permissions configurées
- [ ] Scripts test/lint disponibles
- [ ] Documentation créée
- [ ] Test effectué sur une branche
- [ ] Monitoring configuré

---

🤖 **Système automatisé** - Aucune intervention manuelle requise après le merge de PR !
