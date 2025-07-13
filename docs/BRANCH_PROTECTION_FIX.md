# 🔧 GitHub Actions Branch Protection Fix

## 🚨 Problem
Your GitHub Actions workflow is failing because your repository has branch protection rules that require all changes to be made through pull requests. The workflow was trying to push directly to the `main` branch, which is blocked by these rules.

## ✅ Solutions Provided

### Option 1: Personal Access Token (PAT) Method ⭐ **Recommended**

I've updated your existing workflow (`version-bump.yml`) to use a Personal Access Token that can bypass branch protection rules.

#### Setup Steps:
1. **Create a Personal Access Token**:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with these permissions:
     - `repo` (Full control of private repositories)
     - `workflow` (Update GitHub Action workflows)
   - Copy the token

2. **Add Token to Repository Secrets**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `PAT_TOKEN`
   - Value: Paste your personal access token
   - Click "Add secret"

3. **Your workflow will now work** - it will use the PAT token to bypass branch protection rules.

### Option 2: Pull Request Method

I've also created an alternative workflow (`version-bump-pr.yml`) that creates pull requests instead of pushing directly.

#### How it works:
- Creates a new branch for each version bump
- Makes the version change in that branch
- Creates a pull request to main
- Attempts to auto-merge the PR (if repository settings allow)

## 🛠️ Files Modified

### Updated Files:
- `.github/workflows/version-bump.yml` - Updated to use PAT token
- Added documentation comments

### New Files:
- `.github/workflows/version-bump-pr.yml` - Alternative PR-based approach
- `docs/BRANCH_PROTECTION_FIX.md` - This documentation

## 🚀 Quick Fix

**For immediate resolution**, choose Option 1:

1. Create a PAT token as described above
2. Add it as `PAT_TOKEN` in repository secrets
3. Your existing workflow will work

## 🔄 Workflow Behavior

### Current Trigger:
- ✅ Push to main branch
- ✅ Merged pull requests to main
- ❌ Skips if commit contains `[skip ci]`

### Version Detection:
- `feat:` → Minor version bump (1.0.0 → 1.1.0)
- `fix:` → Patch version bump (1.0.0 → 1.0.1) 
- `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)

### What happens:
1. Tests and linting run
2. Version is bumped based on commit messages
3. Git tag is created
4. GitHub release is published
5. Changes are pushed to main (with PAT) or PR is created

## 🔍 Troubleshooting

### If PAT method still fails:
1. Ensure the PAT has admin permissions
2. Check that the user who created the PAT has admin access to the repository
3. Verify the secret name is exactly `PAT_TOKEN`

### If PR method fails:
1. Check repository permissions for GitHub Actions
2. Ensure "Allow GitHub Actions to create and approve pull requests" is enabled
3. Repository Settings → Actions → General → Workflow permissions

## 📋 Repository Settings Recommendations

For optimal automated versioning:

1. **Branch Protection Rules**:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ❌ Don't require pull request reviews for automated commits
   - ✅ Allow administrators to bypass restrictions (for PAT method)

2. **Actions Permissions**:
   - ✅ Allow GitHub Actions to create and approve pull requests
   - ✅ Read and write permissions for Actions

## 🎯 Next Steps

1. **Choose your preferred method** (PAT recommended)
2. **Set up the PAT token** if using Option 1
3. **Test the workflow** by making a commit with conventional format:
   ```bash
   git commit -m "feat: add new feature to test auto-versioning"
   ```
4. **Monitor the Actions tab** to see the workflow execute

## 🔗 Useful Links

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**Status**: ✅ Fixed and ready for testing  
**Last Updated**: July 13, 2025
