/**
 * Script pour analyser la couverture de code
 */

const fs = require('fs');
const path = require('path');

function analyzeCoverage() {
  const lcovPath = path.join(__dirname, '..', 'coverage', 'lcov.info');
  const data = fs.readFileSync(lcovPath, 'utf8');
  const lines = data.split('\n');

  let totalLines = 0;
  let coveredLines = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalBranches = 0;
  let coveredBranches = 0;

  const fileStats = {};
  let currentFile = null;

  lines.forEach(line => {
    if (line.startsWith('SF:')) {
      currentFile = line.substring(3).replace(/\\/g, '/');
      fileStats[currentFile] = {
        lines: { total: 0, covered: 0 },
        functions: { total: 0, covered: 0 },
        branches: { total: 0, covered: 0 },
      };
    }

    if (line.startsWith('LF:')) {
      const count = parseInt(line.split(':')[1], 10);
      totalLines += count;
      if (currentFile) {
        fileStats[currentFile].lines.total = count;
      }
    }

    if (line.startsWith('LH:')) {
      const count = parseInt(line.split(':')[1], 10);
      coveredLines += count;
      if (currentFile) {
        fileStats[currentFile].lines.covered = count;
      }
    }

    if (line.startsWith('FNF:')) {
      const count = parseInt(line.split(':')[1], 10);
      totalFunctions += count;
      if (currentFile) {
        fileStats[currentFile].functions.total = count;
      }
    }

    if (line.startsWith('FNH:')) {
      const count = parseInt(line.split(':')[1], 10);
      coveredFunctions += count;
      if (currentFile) {
        fileStats[currentFile].functions.covered = count;
      }
    }

    if (line.startsWith('BRF:')) {
      const count = parseInt(line.split(':')[1], 10);
      totalBranches += count;
      if (currentFile) {
        fileStats[currentFile].branches.total = count;
      }
    }

    if (line.startsWith('BRH:')) {
      const count = parseInt(line.split(':')[1], 10);
      coveredBranches += count;
      if (currentFile) {
        fileStats[currentFile].branches.covered = count;
      }
    }
  });

  const lineCoverage = totalLines > 0 ? (coveredLines / totalLines * 100).toFixed(2) : 0;
  const functionCoverage = totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100).toFixed(2) : 0;
  const branchCoverage = totalBranches > 0 ? (coveredBranches / totalBranches * 100).toFixed(2) : 0;

  console.log('\n📊 Rapport de Couverture de Code\n');
  console.log('='.repeat(60));
  console.log('\n📈 Couverture Globale:');
  console.log('-'.repeat(60));
  console.log(`Lignes:        ${coveredLines}/${totalLines} (${lineCoverage}%)`);
  console.log(`Fonctions:     ${coveredFunctions}/${totalFunctions} (${functionCoverage}%)`);
  console.log(`Branches:      ${coveredBranches}/${totalBranches} (${branchCoverage}%)`);
  console.log(`\n${'='.repeat(60)}`);

  // Couverture moyenne
  const avgCoverage = ((parseFloat(lineCoverage) + parseFloat(functionCoverage) + parseFloat(branchCoverage)) / 3).toFixed(2);
  console.log(`\n🎯 Couverture Moyenne: ${avgCoverage}%\n`);

  // Regroupement par module
  const modules = {
    'Controllers': [],
    'Services': [],
    'Routes': [],
    'Middleware': [],
    'Models': [],
    'Utils': [],
  };

  Object.keys(fileStats).forEach(file => {
    const stats = fileStats[file];
    const coverage = stats.lines.total > 0
      ? ((stats.lines.covered / stats.lines.total) * 100).toFixed(1)
      : 0;

    const fileInfo = { file, coverage, ...stats };

    if (file.includes('controllers/')) {
      modules.Controllers.push(fileInfo);
    } else if (file.includes('services/')) {
      modules.Services.push(fileInfo);
    } else if (file.includes('routes/')) {
      modules.Routes.push(fileInfo);
    } else if (file.includes('middleware/')) {
      modules.Middleware.push(fileInfo);
    } else if (file.includes('models/')) {
      modules.Models.push(fileInfo);
    } else if (file.includes('utils/')) {
      modules.Utils.push(fileInfo);
    }
  });

  console.log('📁 Couverture par Module:\n');
  console.log('-'.repeat(60));

  Object.entries(modules).forEach(([moduleName, files]) => {
    if (files.length > 0) {
      const avgModuleCoverage = files.reduce((sum, f) => sum + parseFloat(f.coverage), 0) / files.length;
      console.log(`\n${moduleName}: ${avgModuleCoverage.toFixed(1)}%`);
      files.forEach(f => {
        const fileName = f.file.split('/').pop();
        console.log(`  • ${fileName.padEnd(35)} ${f.coverage.toString().padStart(5)}%`);
      });
    }
  });

  console.log(`\n${'='.repeat(60)}\n`);

  if (parseFloat(avgCoverage) >= 80) {
    console.log('✅ Objectif de 80% de couverture atteint!\n');
  } else {
    console.log(`⚠️  Il manque ${(80 - parseFloat(avgCoverage)).toFixed(2)}% pour atteindre l'objectif de 80%.\n`);
  }

  return {
    lineCoverage,
    functionCoverage,
    branchCoverage,
    avgCoverage,
    modules,
  };
}

analyzeCoverage();
