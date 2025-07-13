#!/usr/bin/env node
/* eslint-disable no-nested-ternary */

/**
 * 🔍 Script de diagnostic pour l'auto-versioning
 * Vérifie que tous les éléments sont en place pour que les workflows fonctionnent
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 DIAGNOSTIC AUTO-VERSIONING SYSTEM');
console.log('=====================================\n');

// 1. Vérifier les fichiers de workflow
const workflowDir = '.github/workflows';
const requiredWorkflows = [
  'auto-version.yml',
  'create-release.yml',
  'update-package-version.yml',
];

console.log('📁 Checking workflow files...');
requiredWorkflows.forEach(workflow => {
  const filePath = path.join(workflowDir, workflow);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${workflow} - EXISTS`);
  } else {
    console.log(`  ❌ ${workflow} - MISSING`);
  }
});

// 2. Vérifier package.json
console.log('\n📦 Checking package.json...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`  ✅ Current version: ${pkg.version}`);

  if (pkg.scripts && pkg.scripts.lint) {
    console.log(`  ✅ Lint script: ${pkg.scripts.lint}`);
  } else {
    console.log('  ⚠️  No lint script found');
  }

  if (pkg.scripts && pkg.scripts.test) {
    console.log(`  ✅ Test script: ${pkg.scripts.test}`);
  } else {
    console.log('  ⚠️  No test script found');
  }
} catch (error) {
  console.log(`  ❌ Error reading package.json: ${error.message}`);
}

// 3. Vérifier l'état Git
console.log('\n🌿 Checking Git status...');
try {
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`  ✅ Current branch: ${branch}`);

  const lastCommit = execSync('git log -1 --pretty=format:"%h - %s"', { encoding: 'utf8' }).trim();
  console.log(`  ✅ Last commit: ${lastCommit}`);

  const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (status) {
    console.log('  ⚠️  Uncommitted changes detected');
  } else {
    console.log('  ✅ Working tree clean');
  }
} catch (error) {
  console.log(`  ❌ Git error: ${error.message}`);
}

// 4. Vérifier la structure des commits conventionnels
console.log('\n📝 Checking recent commits for conventional format...');
try {
  const commits = execSync('git log -5 --pretty=format:"%s"', { encoding: 'utf8' })
    .split('\n')
    .filter(msg => msg.trim());

  commits.forEach((commit) => {
    const isConventional = /^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?!?:/.test(commit);
    const isMerge = commit.startsWith('Merge pull request');
    const icon = isConventional ? '✅' : (isMerge ? '🔄' : '⚠️');
    console.log(`  ${icon} ${commit}`);
  });
} catch (error) {
  console.log(`  ❌ Error checking commits: ${error.message}`);
}

// 5. Instructions pour vérifier sur GitHub
console.log('\n🔗 Manual checks needed:');
console.log('  1. Go to: https://github.com/aminederouich/pfe-back/actions');
console.log('  2. Check if "🚀 Auto Version Bump" workflow ran');
console.log('  3. Look for any error messages in the workflow logs');
console.log('  4. Verify repository settings > Actions permissions are enabled');
console.log('  5. Check if GITHUB_TOKEN has sufficient permissions');

console.log('\n🎯 Expected behavior:');
console.log('  - Workflow should trigger on push to main');
console.log('  - Should create a version bump PR');
console.log('  - PR should be named like "🟡 chore(release): bump version to X.Y.Z"');

console.log('\n✨ Diagnostic complete!');
