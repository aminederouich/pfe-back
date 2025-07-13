# 🚀 Workflow Auto-Versioning via Pull Request

## ✅ **Nouveau Système Activé**

J'ai implémenté le système d'auto-versioning via Pull Request automatique qui contourne les règles de protection de branche.

## 🔄 **Comment ça fonctionne**

### 1. **Détection de commit**
- Le workflow se déclenche sur push vers `main`
- Analyse les messages de commit pour déterminer le type de bump
- Skip automatiquement les commits avec `[skip ci]` ou `chore: bump version`

### 2. **Création de PR automatique**
- Crée une branche temporaire `auto-bump-vX.Y.Z`
- Met à jour `package.json` avec la nouvelle version
- Pousse la branche et crée une PR vers `main`
- Utilise `peter-evans/create-pull-request@v5` pour la création

### 3. **Release après merge**
- Un second job se déclenche quand la PR de version est mergée
- Crée automatiquement le tag Git
- Génère une release GitHub avec changelog

## 📋 **Structure du Workflow**

```yaml
# Job 1: version-bump (sur push vers main)
- Analyse des commits
- Bump de version
- Création de branche temporaire
- Création de PR automatique

# Job 2: create-release (sur merge de PR de version)
- Création du tag Git
- Publication de la release GitHub
```

## 🎯 **Messages de commit supportés**

- `feat:` → **Minor** version bump (1.0.0 → 1.1.0)
- `fix:` → **Patch** version bump (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → **Major** version bump (1.0.0 → 2.0.0)

## 🧪 **Test du système**

Pour tester, faites un commit avec un message conventionnel :

```bash
git commit -m "feat: add new feature to test auto-versioning"
git push origin main
```

**Résultat attendu :**
1. ✅ Workflow se déclenche automatiquement
2. ✅ Crée une branche `auto-bump-v1.1.0`
3. ✅ Ouvre une PR vers main
4. ✅ Après merge de la PR → tag et release automatiques

## 🔧 **Permissions requises**

Le workflow utilise `${{ secrets.GITHUB_TOKEN }}` par défaut, mais peut utiliser `${{ secrets.PAT_TOKEN }}` si configuré pour plus de permissions.

## 📁 **Fichiers modifiés**

- ✅ `.github/workflows/version-bump.yml` - Workflow principal avec PR
- ❌ `.github/workflows/version-bump-pr.yml.disabled` - Ancien workflow désactivé
- 📄 `docs/AUTO_PR_VERSIONING.md` - Cette documentation

## 🎉 **Avantages**

- ✅ Respecte les règles de protection de branche
- ✅ Transparence via Pull Requests
- ✅ Possibilité de review avant merge
- ✅ Audit trail complet
- ✅ Pas besoin de PAT token (optionnel)
- ✅ Compatible avec tous les repository settings

---

**Status**: ✅ **Prêt pour utilisation**  
**Date**: July 13, 2025
