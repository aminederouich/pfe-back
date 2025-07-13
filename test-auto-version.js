#!/usr/bin/env node

/**
 * 🧪 Test Script for Auto-Versioning System
 *
 * This script validates that all components are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Auto-Versioning System...\n');

// Test 1: Check if workflows exist
console.log('📁 Checking workflows...');
const workflowsDir = '.github/workflows';
const requiredWorkflows = [
  'auto-version.yml',
  'update-package-version.yml',
];

let allWorkflowsExist = true;
requiredWorkflows.forEach(workflow => {
  const workflowPath = path.join(workflowsDir, workflow);
  if (fs.existsSync(workflowPath)) {
    console.log(`✅ ${workflow} exists`);
  } else {
    console.log(`❌ ${workflow} missing`);
    allWorkflowsExist = false;
  }
});

// Test 2: Check package.json structure
console.log('\n📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  if (packageJson.version) {
    console.log(`✅ Current version: ${packageJson.version}`);
  } else {
    console.log('❌ No version in package.json');
  }

  if (packageJson.scripts && packageJson.scripts.test) {
    console.log('✅ Test script available');
  } else {
    console.log('❌ No test script in package.json');
  }

  if (packageJson.scripts && packageJson.scripts.lint) {
    console.log('✅ Lint script available');
  } else {
    console.log('❌ No lint script in package.json');
  }

} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Test 3: Check if documentation exists
console.log('\n📚 Checking documentation...');
const docFiles = [
  'docs/AUTO_VERSIONING_GUIDE.md',
];

docFiles.forEach(docFile => {
  if (fs.existsSync(docFile)) {
    console.log(`✅ ${docFile} exists`);
  } else {
    console.log(`❌ ${docFile} missing`);
  }
});

// Summary
console.log('\n🎯 System Status:');
if (allWorkflowsExist) {
  console.log('✅ All workflows configured');
  console.log('✅ System ready for auto-versioning');
  console.log('\n🚀 To test the system:');
  console.log('   git commit -m "feat: test auto-versioning system"');
  console.log('   git push origin main');
} else {
  console.log('❌ Some workflows are missing');
  console.log('❌ System not ready');
}

console.log('\n📋 Expected workflow:');
console.log('1. Push commit with feat:/fix:/BREAKING CHANGE');
console.log('2. auto-version.yml creates version bump PR');
console.log('3. update-package-version.yml updates package.json');
console.log('4. Merge PR → automatic tag and release');
