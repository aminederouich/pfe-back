# 🎯 Système de Versioning Automatique

## 🚀 Résumé
Votre projet `pfe-back` est maintenant équipé d'un **système de versioning automatique** basé sur **GitHub Actions** ! 

## ✨ Ce qui a été configuré

### 📁 Fichiers ajoutés/modifiés :
- ✅ `.github/workflows/version-bump.yml` - Workflow GitHub Actions
- ✅ `package.json` - Scripts NPM pour versioning
- ✅ `docs/AUTO-VERSIONING.md` - Documentation complète
- ✅ `.git/hooks/post-merge` - Hook Git de backup

### 🔄 Comment utiliser

#### 1️⃣ **Automatique (Recommandé)**
Utilisez des messages de commit conventionnels :

```bash
# Pour une nouvelle fonctionnalité (version minor: 1.0.0 → 1.1.0)
git commit -m "feat: ajout de l'API utilisateurs"

# Pour un bug fix (version patch: 1.0.0 → 1.0.1)  
git commit -m "fix: correction authentification"

# Pour un changement majeur (version major: 1.0.0 → 2.0.0)
git commit -m "BREAKING CHANGE: refactorisation API"
```

#### 2️⃣ **Manuel**
```bash
npm run version:patch    # 1.0.0 → 1.0.1
npm run version:minor    # 1.0.0 → 1.1.0
npm run version:major    # 1.0.0 → 2.0.0

# Ou avec tests + lint
npm run release:patch
```

## 🎯 Workflow automatique

Quand vous **push sur main** ou **mergez une PR** :

1. 🧪 **Tests** - Exécution automatique
2. 🔍 **Linting** - Vérification ESLint  
3. 📊 **Analyse** - Détection du type de version
4. 📈 **Bump** - Mise à jour `package.json`
5. 💾 **Commit** - Commit automatique `[skip ci]`
6. 🏷️ **Tag** - Création tag Git `v1.x.x`
7. 🚀 **Push** - Push changements + tags
8. 📋 **Release** - Release GitHub automatique

## 🎉 Avantages

- ✅ **Plus d'oubli** de versions
- ✅ **Releases automatiques** sur GitHub
- ✅ **Tags Git** automatiques
- ✅ **Tests** avant chaque release
- ✅ **Historique** complet et traceable
- ✅ **Standards** de l'industrie (SemVer)

## 📚 Documentation complète

Consultez `docs/AUTO-VERSIONING.md` pour tous les détails.

---

**🎊 Votre projet est maintenant professionnel avec un système de versioning automatique !**
