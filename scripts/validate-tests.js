#!/usr/bin/env node

/**
 * Script de validation et standardisation des tests SuperNovaFit
 * Usage: node scripts/validate-tests.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  testDir: 'src',
  testPattern: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
  requiredImports: [
    '@testing-library/react',
    'vitest',
    '@testing-library/jest-dom',
  ],
  requiredSetup: ['describe(', 'it(', 'expect('],
  coverageThreshold: 25,
};

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

class TestValidator {
  constructor() {
    this.results = {
      files: [],
      errors: [],
      warnings: [],
      stats: {
        total: 0,
        valid: 0,
        invalid: 0,
        coverage: 0,
      },
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  // Trouver tous les fichiers de tests
  findTestFiles() {
    const testFiles = [];

    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith('.') &&
          item !== 'node_modules'
        ) {
          scanDir(fullPath);
        } else if (stat.isFile() && CONFIG.testPattern.test(item)) {
          testFiles.push(fullPath);
        }
      }
    };

    scanDir(CONFIG.testDir);
    return testFiles;
  }

  // Analyser un fichier de test
  analyzeTestFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const analysis = {
      path: filePath,
      valid: true,
      errors: [],
      warnings: [],
      stats: {
        lines: content.split('\n').length,
        describeBlocks: (content.match(/describe\(/g) || []).length,
        itBlocks: (content.match(/it\(/g) || []).length,
        expectBlocks: (content.match(/expect\(/g) || []).length,
      },
    };

    // Vérifier les imports requis
    for (const requiredImport of CONFIG.requiredImports) {
      if (!content.includes(requiredImport)) {
        analysis.warnings.push(`Import manquant: ${requiredImport}`);
      }
    }

    // Vérifier la structure de base
    for (const required of CONFIG.requiredSetup) {
      if (!content.includes(required)) {
        analysis.errors.push(`Structure manquante: ${required}`);
        analysis.valid = false;
      }
    }

    // Vérifier les bonnes pratiques
    if (content.includes('console.log')) {
      analysis.warnings.push('console.log détecté (à éviter en production)');
    }

    if (content.includes('.only(')) {
      analysis.errors.push('.only() détecté (à retirer avant commit)');
      analysis.valid = false;
    }

    if (content.includes('.skip(')) {
      analysis.warnings.push('.skip() détecté (vérifier si nécessaire)');
    }

    // Vérifier la couverture des cas de test
    if (analysis.stats.itBlocks < 3) {
      analysis.warnings.push('Peu de tests (moins de 3)');
    }

    if (analysis.stats.expectBlocks < analysis.stats.itBlocks) {
      analysis.warnings.push('Tests sans assertions (expect)');
    }

    return analysis;
  }

  // Exécuter les tests et récupérer le coverage
  async runTests() {
    try {
      this.log('🧪 Exécution des tests...', 'blue');

      const output = execSync('npm run test:coverage -- --reporter=json', {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      // Parser le JSON de coverage (si disponible)
      try {
        const coverageData = JSON.parse(output);
        this.results.stats.coverage = coverageData.coverage || 0;
      } catch (e) {
        this.log('⚠️  Impossible de parser le coverage JSON', 'yellow');
      }

      this.log('✅ Tests exécutés avec succès', 'green');
      return true;
    } catch (error) {
      this.log(
        `❌ Erreur lors de l'exécution des tests: ${error.message}`,
        'red',
      );
      return false;
    }
  }

  // Générer le rapport
  generateReport() {
    this.log('\n📊 RAPPORT DE VALIDATION DES TESTS', 'bold');
    this.log('='.repeat(50), 'blue');

    // Statistiques générales
    this.log(`\n📈 STATISTIQUES GÉNÉRALES:`, 'bold');
    this.log(`  • Fichiers analysés: ${this.results.stats.total}`);
    this.log(`  • Fichiers valides: ${this.results.stats.valid}`, 'green');
    this.log(`  • Fichiers invalides: ${this.results.stats.invalid}`, 'red');
    this.log(`  • Coverage actuel: ${this.results.stats.coverage}%`);
    this.log(`  • Coverage objectif: ${CONFIG.coverageThreshold}%`);

    // Fichiers avec erreurs
    if (this.results.errors.length > 0) {
      this.log(
        `\n❌ ERREURS CRITIQUES (${this.results.errors.length}):`,
        'red',
      );
      this.results.errors.forEach((error) => {
        this.log(`  • ${error}`, 'red');
      });
    }

    // Fichiers avec warnings
    if (this.results.warnings.length > 0) {
      this.log(
        `\n⚠️  AVERTISSEMENTS (${this.results.warnings.length}):`,
        'yellow',
      );
      this.results.warnings.forEach((warning) => {
        this.log(`  • ${warning}`, 'yellow');
      });
    }

    // Recommandations
    this.log(`\n💡 RECOMMANDATIONS:`, 'bold');

    if (this.results.stats.coverage < CONFIG.coverageThreshold) {
      this.log(
        `  • Coverage insuffisant (${this.results.stats.coverage}% < ${CONFIG.coverageThreshold}%)`,
        'yellow',
      );
      this.log(`  • Ajouter des tests pour les modules critiques`, 'yellow');
    }

    if (this.results.stats.invalid > 0) {
      this.log(
        `  • Corriger ${this.results.stats.invalid} fichier(s) invalide(s)`,
        'red',
      );
    }

    // Modules non testés
    const untestedModules = this.findUntestedModules();
    if (untestedModules.length > 0) {
      this.log(`\n🎯 MODULES NON TESTÉS (${untestedModules.length}):`, 'bold');
      untestedModules.slice(0, 10).forEach((module) => {
        this.log(`  • ${module}`, 'yellow');
      });
      if (untestedModules.length > 10) {
        this.log(`  • ... et ${untestedModules.length - 10} autres`, 'yellow');
      }
    }

    // Score de qualité
    const qualityScore = this.calculateQualityScore();
    this.log(
      `\n🏆 SCORE DE QUALITÉ: ${qualityScore}/10`,
      qualityScore >= 8 ? 'green' : qualityScore >= 6 ? 'yellow' : 'red',
    );
  }

  // Trouver les modules non testés
  findUntestedModules() {
    const untested = [];
    const testFiles = this.findTestFiles();
    const testPaths = testFiles.map((f) =>
      f.replace(/\.test\.(ts|tsx)$/, '').replace(/\.spec\.(ts|tsx)$/, ''),
    );

    // Scanner les fichiers source
    const scanForSourceFiles = (dir) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith('.') &&
          item !== 'node_modules' &&
          item !== '__tests__'
        ) {
          scanForSourceFiles(fullPath);
        } else if (
          stat.isFile() &&
          /\.(ts|tsx)$/.test(item) &&
          !item.includes('.test.') &&
          !item.includes('.spec.')
        ) {
          const sourcePath = fullPath.replace(/\.(ts|tsx)$/, '');
          if (!testPaths.includes(sourcePath)) {
            untested.push(fullPath);
          }
        }
      }
    };

    scanForSourceFiles(CONFIG.testDir);
    return untested;
  }

  // Calculer le score de qualité
  calculateQualityScore() {
    let score = 10;

    // Pénalités
    score -= this.results.stats.invalid * 2; // -2 par fichier invalide
    score -=
      Math.max(0, CONFIG.coverageThreshold - this.results.stats.coverage) / 5; // -0.2 par % manquant
    score -= this.results.warnings.length * 0.1; // -0.1 par warning

    return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  }

  // Exécuter la validation complète
  async run() {
    this.log('🔍 VALIDATION DES TESTS SUPERNOVAFIT', 'bold');
    this.log('='.repeat(50), 'blue');

    // 1. Trouver tous les fichiers de tests
    this.log('\n📁 Recherche des fichiers de tests...', 'blue');
    const testFiles = this.findTestFiles();
    this.log(`  • ${testFiles.length} fichiers trouvés`, 'green');

    // 2. Analyser chaque fichier
    this.log('\n🔍 Analyse des fichiers...', 'blue');
    for (const filePath of testFiles) {
      const analysis = this.analyzeTestFile(filePath);
      this.results.files.push(analysis);
      this.results.stats.total++;

      if (analysis.valid) {
        this.results.stats.valid++;
      } else {
        this.results.stats.invalid++;
        this.results.errors.push(
          ...analysis.errors.map((e) => `${filePath}: ${e}`),
        );
      }

      this.results.warnings.push(
        ...analysis.warnings.map((w) => `${filePath}: ${w}`),
      );
    }

    // 3. Exécuter les tests
    await this.runTests();

    // 4. Générer le rapport
    this.generateReport();

    // 5. Retourner le statut
    return this.results.stats.invalid === 0;
  }
}

// Exécution du script
if (require.main === module) {
  const validator = new TestValidator();
  validator
    .run()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = TestValidator;
