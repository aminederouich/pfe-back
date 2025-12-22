/**
 * Script pour compter le nombre total de tests
 */

const fs = require('fs');
const path = require('path');

function countTestsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Compter les occurrences de it( ou test(
  const itMatches = content.match(/\bit\(/g) || [];
  const testMatches = content.match(/\btest\(/g) || [];

  return itMatches.length + testMatches.length;
}

function scanDirectory(dir) {
  let totalTests = 0;
  const testsByFile = {};

  function scan(currentDir) {
    const files = fs.readdirSync(currentDir);

    files.forEach(file => {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.includes('node_modules')) {
        scan(fullPath);
      } else if (file.endsWith('.test.js')) {
        const count = countTestsInFile(fullPath);
        totalTests += count;
        testsByFile[fullPath.replace(process.cwd(), '')] = count;
      }
    });
  }

  scan(dir);
  return { totalTests, testsByFile };
}

const testDir = path.join(__dirname, '..', 'test');
const { totalTests, testsByFile } = scanDirectory(testDir);

console.log('\n📊 Rapport de Tests\n');
console.log('='.repeat(60));
console.log('\nNombre de tests par fichier:');
console.log('-'.repeat(60));

Object.entries(testsByFile)
  .sort((a, b) => b[1] - a[1])
  .forEach(([file, count]) => {
    console.log(`${count.toString().padStart(3)} tests - ${file}`);
  });

console.log(`\n${'='.repeat(60)}`);
console.log(`\n🎯 TOTAL: ${totalTests} tests`);
console.log(`\n${'='.repeat(60)}\n`);

// Répartition par type
const unitTests = Object.entries(testsByFile)
  .filter(([file]) => file.includes('\\unit\\') || file.includes('/unit/'))
  .reduce((sum, [, count]) => sum + count, 0);

const integrationTests = Object.entries(testsByFile)
  .filter(([file]) => file.includes('\\integration\\') || file.includes('/integration/'))
  .reduce((sum, [, count]) => sum + count, 0);

const functionalTests = Object.entries(testsByFile)
  .filter(([file]) => file.includes('\\functional\\') || file.includes('/functional/'))
  .reduce((sum, [, count]) => sum + count, 0);

const e2eTests = Object.entries(testsByFile)
  .filter(([file]) => file.includes('\\e2e\\') || file.includes('/e2e/'))
  .reduce((sum, [, count]) => sum + count, 0);

console.log('📈 Répartition par type:');
console.log('-'.repeat(60));
console.log(`Tests Unitaires:      ${unitTests.toString().padStart(3)} tests`);
console.log(`Tests d'Intégration:  ${integrationTests.toString().padStart(3)} tests`);
console.log(`Tests Fonctionnels:   ${functionalTests.toString().padStart(3)} tests`);
console.log(`Tests E2E:            ${e2eTests.toString().padStart(3)} tests`);
console.log('='.repeat(60));
console.log(`TOTAL:                ${totalTests.toString().padStart(3)} tests\n`);

if (totalTests >= 260) {
  console.log('✅ Objectif de 260 tests atteint!\n');
} else {
  console.log(`⚠️  Il manque ${260 - totalTests} tests pour atteindre l'objectif de 260.\n`);
}
