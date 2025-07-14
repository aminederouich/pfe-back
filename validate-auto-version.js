#!/usr/bin/env node

/**
 * 🧪 Script de test pour le système d'auto-versioning après merge PR
 * Simule différents scénarios de merge pour valider le comportement
 */

/* eslint-disable no-console */

const fs = require('fs');

console.log('🧪 TEST AUTO-VERSIONING AFTER MERGE PR');
console.log('======================================\n');

// 1. Vérifier les prérequis
console.log('🔍 Checking prerequisites...');

const workflowFiles = [
  '.github/workflows/auto-version-after-merge.yml',
  '.github/workflows/auto-version-api.yml',
];

let workflowExists = false;
workflowFiles.forEach(workflowFile => {
  if (fs.existsSync(workflowFile)) {
    console.log(`  ✅ ${workflowFile} exists`);
    workflowExists = true;
  }
});

if (!workflowExists) {
  console.log('  ❌ No auto-versioning workflow found');
  throw new Error('No workflow file found');
}

// 2. Vérifier package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = pkg.version;
console.log(`  ✅ Current version: ${currentVersion}`);

// 3. Tester les patterns de commit
console.log('\n📝 Testing commit patterns...');

const testCommits = [
  { message: 'feat: add new feature', expected: 'minor', emoji: '🟡' },
  { message: 'fix: resolve bug', expected: 'patch', emoji: '🟢' },
  { message: 'feat!: breaking change', expected: 'major', emoji: '🔴' },
  { message: 'docs: update documentation', expected: 'patch', emoji: '🟢' },
  { message: 'chore: update dependencies', expected: 'patch', emoji: '🟢' },
];

testCommits.forEach(test => {
  let detectedType = 'patch'; // default
  let detectedEmoji = '🟢'; // default

  if (test.message.match(/(^feat(\(.+\))?!:|^fix(\(.+\))?!:|^refactor(\(.+\))?!:|BREAKING CHANGE)/)) {
    detectedType = 'major';
    detectedEmoji = '🔴';
  } else if (test.message.match(/(^feat(\(.+\))?:|feat:)/)) {
    detectedType = 'minor';
    detectedEmoji = '🟡';
  } else if (test.message.match(/(^fix(\(.+\))?:|^perf(\(.+\))?:|^revert(\(.+\))?:|fix:|perf:)/)) {
    detectedType = 'patch';
    detectedEmoji = '🟢';
  }

  const isCorrect = detectedType === test.expected && detectedEmoji === test.emoji;
  const status = isCorrect ? '✅' : '❌';

  console.log(`  ${status} "${test.message}" → ${detectedEmoji} ${detectedType} (expected: ${test.emoji} ${test.expected})`);
});

// 4. Simuler des messages de merge PR
console.log('\n🔄 Testing merge PR patterns...');

const mergeMessages = [
  'Merge pull request #123 from user/feature-branch',
  'Merge pull request #456 from user/fix-bug',
  'Merge pull request #789 from user/breaking-change',
];

mergeMessages.forEach(message => {
  const prNumber = message.match(/Merge pull request #(\d+)/);
  const status = prNumber ? '✅' : '❌';
  console.log(`  ${status} "${message}" → PR #${prNumber ? prNumber[1] : 'N/A'}`);
});

// 5. Vérifier la configuration du workflow
console.log('\n⚙️ Checking workflow configuration...');

// Utiliser le premier workflow trouvé
const mainWorkflowFile = workflowFiles.find(file => fs.existsSync(file));
if (!mainWorkflowFile) {
  console.log('  ❌ No workflow file found for validation');
  throw new Error('No workflow file found for validation');
}

console.log(`  📁 Checking: ${mainWorkflowFile}`);
const workflowContent = fs.readFileSync(mainWorkflowFile, 'utf8');

const checks = [
  { name: 'Trigger on push to main', pattern: /on:\s*push:\s*branches:\s*\[\s*main\s*\]/ },
  { name: 'Merge PR condition', pattern: /contains\(github\.event\.head_commit\.message, 'Merge pull request'\)/ },
  { name: 'Skip version condition', pattern: /\[skip version\]/ },
  { name: 'Node.js setup', pattern: /node-version:\s*'22\.11\.0'/ },
  { name: 'npm version command', pattern: /npm version/ },
  { name: 'AUTO_VERSION_TOKEN support', pattern: /AUTO_VERSION_TOKEN/ },
  { name: 'Git tag creation', pattern: /git tag|\/git\/tags/ },
  { name: 'GitHub release', pattern: /actions\/create-release|create-release/ },
];

checks.forEach(check => {
  const found = check.pattern.test(workflowContent);
  const status = found ? '✅' : '❌';
  console.log(`  ${status} ${check.name}`);
});

console.log('\n🎯 Manual testing instructions:');
console.log('  1. Configure AUTO_VERSION_TOKEN secret (see docs/BRANCH_PROTECTION_SOLUTION.md)');
console.log('  2. Create a feature branch: git checkout -b test-auto-version');
console.log('  3. Make some changes and commit with conventional format');
console.log('  4. Push branch: git push origin test-auto-version');
console.log('  5. Create PR on GitHub');
console.log('  6. Merge the PR');
console.log('  7. Check if workflow runs and updates version automatically');

console.log('\n🔧 Branch Protection Fix:');
console.log('  If you see "Repository rule violations" error:');
console.log('  • Create Personal Access Token with repo permissions');
console.log('  • Add as repository secret: AUTO_VERSION_TOKEN');
console.log('  • See: docs/BRANCH_PROTECTION_SOLUTION.md for detailed instructions');

console.log('\n📋 Expected behavior after PR merge:');
console.log('  ✅ Workflow triggers on merge commit');
console.log('  ✅ Analyzes PR commits for version bump type');
console.log('  ✅ Updates package.json and package-lock.json');
console.log('  ✅ Creates commit with new version');
console.log('  ✅ Creates Git tag');
console.log('  ✅ Creates GitHub release');

console.log('\n🔗 Useful links:');
console.log('  • Actions: https://github.com/aminederouich/pfe-back/actions');
console.log('  • Releases: https://github.com/aminederouich/pfe-back/releases');
console.log(`  • Current version: ${currentVersion}`);

console.log('\n✨ Validation complete!');
console.log('🚀 Ready to test auto-versioning after merge PR!');
