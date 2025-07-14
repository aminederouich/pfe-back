# 🔧 Configuration Auto-Versioning avec Protection de Branche

## 🚨 Problème identifié

Le workflow d'auto-versioning échoue avec l'erreur :
```
remote: error: GH013: Repository rule violations found for refs/heads/main
remote: - Changes must be made through a pull request.
```

## 💡 Solutions disponibles

### Solution 1: Personal Access Token (PAT) - RECOMMANDÉE

#### Étapes de configuration :

1. **Créer un PAT avec permissions admin** :
   - Aller sur GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Cliquer "Generate new token (classic)"
   - Nom : `Auto Versioning Token`
   - Permissions requises :
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (Write packages to GitHub Package Registry)

2. **Ajouter le PAT comme secret** :
   - Aller dans votre repository → Settings → Secrets and variables → Actions
   - Cliquer "New repository secret"
   - Name : `AUTO_VERSION_TOKEN`
   - Secret : [coller votre PAT]

3. **Le workflow est déjà configuré** pour utiliser ce token :
   ```yaml
   token: ${{ secrets.AUTO_VERSION_TOKEN || secrets.GITHUB_TOKEN }}
   ```

### Solution 2: Utiliser l'API GitHub (Alternative)

Si vous ne pouvez pas utiliser un PAT, utilisez le workflow `auto-version-api.yml` qui :
- Utilise l'API GitHub pour faire les commits
- Contourne complètement les règles de protection
- Met à jour les fichiers directement via l'API

### Solution 3: Modifier les règles de protection (Non recommandée)

Temporairement modifier les règles :
1. Repository → Settings → Rules
2. Modifier la règle pour `main`
3. Ajouter une exception pour les GitHub Actions
4. ⚠️ Moins sécurisé

## 🧪 Test de la solution

Une fois configuré :

1. **Créer une branche de test** :
   ```bash
   git checkout -b test-versioning-fix
   echo "Test fix" > test-fix.txt
   git add test-fix.txt
   git commit -m "feat: test auto-versioning with branch protection fix"
   git push origin test-versioning-fix
   ```

2. **Créer une PR** et la merger

3. **Vérifier** que le workflow :
   - ✅ Se déclenche après le merge
   - ✅ Met à jour package.json et package-lock.json  
   - ✅ Crée un commit de version
   - ✅ Crée un tag Git
   - ✅ Crée une release GitHub

## 🔍 Debug

Pour vérifier que tout fonctionne :

```bash
# Vérifier la version actuelle
node -p "require('./package.json').version"

# Vérifier les derniers commits
git log --oneline -5

# Vérifier les tags
git tag -l

# Tester le script de validation
node validate-auto-version.js
```

## 📋 Checklist de configuration

- [ ] PAT créé avec permissions repo + workflow
- [ ] Secret `AUTO_VERSION_TOKEN` ajouté au repository
- [ ] Workflow `auto-version-after-merge.yml` configuré
- [ ] Test effectué avec une vraie PR
- [ ] Version mise à jour automatiquement
- [ ] Tag et release créés

## 🎯 Workflows disponibles

1. **`auto-version-after-merge.yml`** : Version principale avec PAT
2. **`auto-version-api.yml`** : Version alternative via API
3. **`node.js.yml`** : Tests et CI standard

Choisissez le workflow qui convient le mieux à votre configuration !

---

## 🔗 Liens utiles

- [GitHub PAT Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
