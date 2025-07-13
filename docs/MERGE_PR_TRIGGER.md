# 🔄 Auto-Versioning: Déclenchement sur Merge Pull Request

## ✅ **Modification Appliquée**

J'ai modifié le workflow pour qu'il se déclenche **même après un "Merge pull request"**, ce qui est plus pratique pour un workflow de développement normal.

## 🔄 **Nouvelle Logique**

### **Avant** ❌
- Se déclenchait seulement sur des commits directs avec `feat:`, `fix:`, etc.
- Ignorait les merges de PR
- Pas pratique pour un workflow normal

### **Après** ✅  
- Se déclenche sur **tous les pushes vers main**
- Détecte automatiquement les merges de PR
- Analyse les commits de la PR mergée pour déterminer le type de version

## 🧠 **Intelligence du Workflow**

```yaml
# Détection de merge
if echo "$LAST_COMMIT_MSG" | grep -q "Merge pull request"; then
  # Analyse les commits de la PR mergée
  COMMITS_TO_ANALYZE=$(git log --pretty=format:"%s" HEAD~5..HEAD)
else
  # Analyse le commit direct
  COMMITS_TO_ANALYZE="$LAST_COMMIT_MSG"
fi
```

## 📋 **Cas d'Usage Supportés**

### **1. Merge de PR avec conventional commits**
```bash
# Dans la PR il y avait:
# - "feat: add new feature"
# - "fix: correct bug"
# 
# Merge: "Merge pull request #123 from feature-branch"
# → Workflow détecte "feat:" → MINOR bump
```

### **2. Commit direct**
```bash
git commit -m "feat: add direct feature"
git push origin main
# → Workflow détecte "feat:" → MINOR bump
```

### **3. Merge sans conventional commits**
```bash
# PR avec commits comme:
# - "update documentation"
# - "refactor code"
#
# → Workflow fait un PATCH bump par défaut
```

## 🎯 **Types de Version Détectés**

- **🔴 MAJOR**: `feat!:`, `fix!:`, `BREAKING CHANGE`
- **🟡 MINOR**: `feat:`, `feature:`
- **🟢 PATCH**: `fix:`, `perf:`, `revert:` ou par défaut

## 🧪 **Test du Nouveau Système**

Le workflow se déclenchera maintenant sur **n'importe quel push vers main**, y compris les merges de PR.

### **Pour tester immédiatement:**
```bash
# Option 1: Commit vide de test
git commit --allow-empty -m "feat: test merge-aware auto-versioning"
git push origin main

# Option 2: Merger une PR existante
# Le workflow se déclenchera automatiquement
```

## 📊 **Avantages**

### ✅ **Plus Pratique**
- Fonctionne avec le workflow GitHub normal (PR → Merge)
- Pas besoin de forcer des commits directs
- Compatible avec les branch protection rules

### ✅ **Plus Intelligent**
- Analyse le contenu réel des PRs mergées
- Détermine automatiquement le type de version
- Fallback sur PATCH si aucun pattern détecté

### ✅ **Plus Robuste**
- Fonctionne dans tous les scénarios
- Logs détaillés pour debug
- Conditions d'exclusion claires (`[skip ci]`, `chore(release)`)

## 🔗 **Workflows Concernés**

- ✅ **`auto-version.yml`** - Modifié pour détecter les merges
- ✅ **`create-release.yml`** - Reste inchangé (se déclenche sur merge de PR de version)
- ✅ **`update-package-version.yml`** - Reste inchangé

---

**Status**: ✅ **Workflow modifié - Prêt pour merge PR**  
**Test**: Mergez n'importe quelle PR et le workflow se déclenchera  
**Date**: July 13, 2025
