#!/usr/bin/env node

/**
 * 🔧 Script de diagnostic et recommandation pour l'auto-versioning
 * Analyse les problèmes et recommande la meilleure approche
 */

/* eslint-disable no-console */

const fs = require('fs');

console.log('🔧 AUTO-VERSIONING DIAGNOSTIC & SOLUTION RECOMMENDATION');
console.log('=======================================================\n');

// 1. Analyser l'erreur du workflow
console.log('🚨 Error Analysis:');
console.log('  ERROR: "Problems parsing JSON" in API workflow');
console.log('  CAUSE: JSON escaping issues in curl command');
console.log('  ERROR: "Argument list too long" for package-lock.json');
console.log('  CAUSE: package-lock.json file too large for curl arguments\n');

// 2. Vérifier les workflows disponibles
console.log('📁 Available Workflows:');

const workflows = [
  {
    file: '.github/workflows/auto-version-after-merge.yml',
    name: 'Standard (with PAT)',
    method: 'Git push with AUTO_VERSION_TOKEN',
    pros: ['Simple', 'Reliable', 'Handles large files'],
    cons: ['Requires PAT configuration'],
    recommended: true,
  },
  {
    file: '.github/workflows/auto-version-hybrid.yml',
    name: 'Hybrid (Git + Token)',
    method: 'Git with token authentication',
    pros: ['Robust', 'Force push capability', 'Good error handling'],
    cons: ['Slightly more complex'],
    recommended: true,
  },
  {
    file: '.github/workflows/auto-version-api.yml',
    name: 'API-based',
    method: 'GitHub API for commits',
    pros: ['Bypasses all protections', 'Sophisticated'],
    cons: ['Complex', 'File size limitations', 'JSON escaping issues'],
    recommended: false,
  },
];

workflows.forEach((workflow, index) => {
  const exists = fs.existsSync(workflow.file);
  const status = exists ? '✅' : '❌';
  const recommendation = workflow.recommended ? '🌟 RECOMMENDED' : '⚠️  NOT RECOMMENDED';

  console.log(`  ${status} ${workflow.name}`);
  console.log(`     📁 File: ${workflow.file}`);
  console.log(`     🔧 Method: ${workflow.method}`);
  console.log(`     ✅ Pros: ${workflow.pros.join(', ')}`);
  console.log(`     ❌ Cons: ${workflow.cons.join(', ')}`);
  console.log(`     🎯 Status: ${recommendation}`);
  if (index < workflows.length - 1) {
    console.log('');
  }
});

// 3. Recommandations spécifiques
console.log('\n🎯 RECOMMENDATIONS:');

console.log('\n1. 🌟 BEST SOLUTION: Use Standard Workflow');
console.log('   • File: .github/workflows/auto-version-after-merge.yml');
console.log('   • Setup: Configure AUTO_VERSION_TOKEN (5 minutes)');
console.log('   • Reliability: Proven, simple, handles all file sizes');

console.log('\n2. 🔄 ALTERNATIVE: Use Hybrid Workflow');
console.log('   • File: .github/workflows/auto-version-hybrid.yml');
console.log('   • Setup: Same AUTO_VERSION_TOKEN');
console.log('   • Features: Force push, better error recovery');

console.log('\n3. ❌ AVOID: API Workflow (has issues)');
console.log('   • Problems: JSON parsing, file size limits');
console.log('   • Status: Needs significant fixes');

// 4. Configuration steps
console.log('\n🛠️ CONFIGURATION STEPS:');

console.log('\n📋 Step 1: Create Personal Access Token');
console.log('   1. GitHub → Settings → Developer settings → Personal access tokens');
console.log('   2. "Generate new token (classic)"');
console.log('   3. Name: Auto Versioning Token');
console.log('   4. Permissions: ✅ repo + ✅ workflow');
console.log('   5. Copy the token');

console.log('\n🔐 Step 2: Add Repository Secret');
console.log('   1. Repository → Settings → Secrets and variables → Actions');
console.log('   2. "New repository secret"');
console.log('   3. Name: AUTO_VERSION_TOKEN');
console.log('   4. Value: [paste your token]');

console.log('\n🧪 Step 3: Test the System');
console.log('   1. git checkout -b test-auto-version-final');
console.log('   2. echo "Test" > test-final.txt');
console.log('   3. git add test-final.txt');
console.log('   4. git commit -m "feat: test final auto-versioning setup"');
console.log('   5. git push origin test-auto-version-final');
console.log('   6. Create and merge PR');
console.log('   7. Watch workflow run successfully!');

// 5. Validation
console.log('\n✅ VALIDATION:');
const hasStandardWorkflow = fs.existsSync('.github/workflows/auto-version-after-merge.yml');
const hasHybridWorkflow = fs.existsSync('.github/workflows/auto-version-hybrid.yml');

if (hasStandardWorkflow && hasHybridWorkflow) {
  console.log('   🎉 PERFECT! You have both recommended workflows');
  console.log('   📋 Next: Configure AUTO_VERSION_TOKEN and test');
} else if (hasStandardWorkflow) {
  console.log('   ✅ GOOD! You have the standard workflow');
  console.log('   📋 Next: Configure AUTO_VERSION_TOKEN and test');
} else {
  console.log('   ⚠️  Missing recommended workflows');
  console.log('   📋 Next: Ensure workflows are committed');
}

// 6. Current package version
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`\n📦 Current version: ${pkg.version}`);
  console.log('   📈 Next version will be: 1.1.0 (minor bump expected)');
} catch {
  console.log('\n❌ Could not read package.json');
}

console.log('\n🔗 HELPFUL LINKS:');
console.log('   • Documentation: docs/BRANCH_PROTECTION_SOLUTION.md');
console.log('   • Actions: https://github.com/aminederouich/pfe-back/actions');
console.log('   • PAT Guide: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token');

console.log('\n🏆 SUMMARY:');
console.log('   ✅ Problem diagnosed: API workflow has JSON/size issues');
console.log('   ✅ Solution provided: Use standard or hybrid workflow');
console.log('   ✅ Configuration: AUTO_VERSION_TOKEN setup required');
console.log('   ✅ Next step: Configure token and test!');

console.log('\n🚀 Ready to fix auto-versioning permanently!');
