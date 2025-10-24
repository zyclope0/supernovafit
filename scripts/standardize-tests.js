#!/usr/bin/env node

/**
 * Script de standardisation des tests SuperNovaFit
 * Usage: node scripts/standardize-tests.js
 */

const fs = require('fs');
const path = require('path');

// Templates standardisés
const TEMPLATES = {
  component: `import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentName } from '@/components/ui/ComponentName';

describe('ComponentName', () => {
  const mockProps = {
    // Props par défaut
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ComponentName {...mockProps} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    const mockOnClick = vi.fn();
    render(<ComponentName {...mockProps} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should handle loading state', () => {
    render(<ComponentName {...mockProps} loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<ComponentName {...mockProps} error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});`,

  hook: `import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useHookName } from '@/hooks/useHookName';

describe('useHookName', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useHookName());
    
    expect(result.current.value).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should update value when called', () => {
    const { result } = renderHook(() => useHookName());
    
    act(() => {
      result.current.setValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });

  it('should handle async operations', async () => {
    const { result } = renderHook(() => useHookName());
    
    await act(async () => {
      await result.current.fetchData();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeDefined();
  });

  it('should handle errors', async () => {
    const { result } = renderHook(() => useHookName());
    
    await act(async () => {
      await result.current.fetchData();
    });
    
    expect(result.current.error).toBeDefined();
  });
});`,

  utility: `import { describe, it, expect } from 'vitest';
import { functionName } from '@/lib/functionName';

describe('functionName', () => {
  it('should calculate correctly', () => {
    const result = functionName(10, 20);
    expect(result).toBe(30);
  });

  it('should handle edge cases', () => {
    expect(functionName(0, 0)).toBe(0);
    expect(functionName(-5, 5)).toBe(0);
    expect(functionName(Number.MAX_VALUE, 1)).toBe(Number.MAX_VALUE + 1);
  });

  it('should handle invalid inputs', () => {
    expect(() => functionName(NaN, 5)).toThrow();
    expect(() => functionName(5, null as any)).toThrow();
    expect(() => functionName(5, undefined as any)).toThrow();
  });

  it('should handle string inputs', () => {
    expect(functionName('10', '20')).toBe(30);
    expect(functionName('invalid', 5)).toBeNaN();
  });

  it('should handle array inputs', () => {
    expect(functionName([1, 2, 3])).toBe(6);
    expect(functionName([])).toBe(0);
  });
});`,
};

// Configuration
const CONFIG = {
  testDir: 'src',
  testPattern: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
  backupDir: '.test-backup',
  standardImports: [
    "import { render, screen, fireEvent } from '@testing-library/react';",
    "import { describe, it, expect, vi, beforeEach } from 'vitest';",
    "import { renderHook, act } from '@testing-library/react';",
  ],
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

class TestStandardizer {
  constructor() {
    this.results = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: [],
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  // Créer un backup
  createBackup() {
    if (!fs.existsSync(CONFIG.backupDir)) {
      fs.mkdirSync(CONFIG.backupDir, { recursive: true });
      this.log(`📁 Backup créé: ${CONFIG.backupDir}`, 'blue');
    }
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

  // Standardiser un fichier de test
  standardizeTestFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Vérifier si le fichier est déjà standardisé
      if (this.isStandardized(content)) {
        this.log(`  ✅ ${filePath} (déjà standardisé)`, 'green');
        return;
      }

      // Créer un backup
      const backupPath = path.join(
        CONFIG.backupDir,
        path.relative(CONFIG.testDir, filePath),
      );
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(backupPath, content);

      // Standardiser le contenu
      const standardizedContent = this.standardizeContent(content, filePath);

      // Écrire le fichier standardisé
      fs.writeFileSync(filePath, standardizedContent);

      this.log(`  🔄 ${filePath} (standardisé)`, 'yellow');
      this.results.updated++;
    } catch (error) {
      this.log(`  ❌ ${filePath}: ${error.message}`, 'red');
      this.results.errors.push(`${filePath}: ${error.message}`);
    }
  }

  // Vérifier si un fichier est déjà standardisé
  isStandardized(content) {
    const hasStandardImports = CONFIG.standardImports.every((imp) =>
      content.includes(imp),
    );
    const hasStandardStructure =
      content.includes('describe(') &&
      content.includes('it(') &&
      content.includes('expect(');
    const hasCleanup =
      content.includes('beforeEach') || content.includes('afterEach');

    return hasStandardImports && hasStandardStructure && hasCleanup;
  }

  // Standardiser le contenu d'un fichier
  standardizeContent(content, filePath) {
    const lines = content.split('\n');
    const standardized = [];

    // Déterminer le type de test
    const isComponent = filePath.includes('/components/');
    const isHook = filePath.includes('/hooks/');
    const isUtility = filePath.includes('/lib/');

    // Ajouter les imports standardisés
    if (isComponent || isHook) {
      standardized.push(
        "import { render, screen, fireEvent } from '@testing-library/react';",
      );
      standardized.push(
        "import { describe, it, expect, vi, beforeEach } from 'vitest';",
      );

      if (isHook) {
        standardized.push(
          "import { renderHook, act } from '@testing-library/react';",
        );
      }
    } else {
      standardized.push("import { describe, it, expect } from 'vitest';");
    }

    standardized.push(''); // Ligne vide

    // Extraire le nom du composant/hook/fonction
    const fileName = path
      .basename(filePath, '.test.tsx')
      .replace('.test.ts', '');
    const componentName = this.extractComponentName(fileName, filePath);

    // Ajouter la structure standardisée
    if (isComponent) {
      standardized.push(`describe('${componentName}', () => {`);
      standardized.push('  const mockProps = {');
      standardized.push('    // Props par défaut');
      standardized.push('  };');
      standardized.push('');
      standardized.push('  beforeEach(() => {');
      standardized.push('    vi.clearAllMocks();');
      standardized.push('  });');
      standardized.push('');
      standardized.push("  it('should render correctly', () => {");
      standardized.push(`    render(<${componentName} {...mockProps} />);`);
      standardized.push(
        "    expect(screen.getByText('Expected Text')).toBeInTheDocument();",
      );
      standardized.push('  });');
      standardized.push('');
      standardized.push("  it('should handle user interaction', () => {");
      standardized.push('    const mockOnClick = vi.fn();');
      standardized.push(
        `    render(<${componentName} {...mockProps} onClick={mockOnClick} />);`,
      );
      standardized.push('    ');
      standardized.push("    fireEvent.click(screen.getByRole('button'));");
      standardized.push('    expect(mockOnClick).toHaveBeenCalledTimes(1);');
      standardized.push('  });');
    } else if (isHook) {
      standardized.push(`describe('${componentName}', () => {`);
      standardized.push("  it('should return initial state', () => {");
      standardized.push(
        `    const { result } = renderHook(() => ${componentName}());`,
      );
      standardized.push('    ');
      standardized.push('    expect(result.current.value).toBe(null);');
      standardized.push('    expect(result.current.loading).toBe(false);');
      standardized.push('    expect(result.current.error).toBe(null);');
      standardized.push('  });');
      standardized.push('');
      standardized.push("  it('should update value when called', () => {");
      standardized.push(
        `    const { result } = renderHook(() => ${componentName}());`,
      );
      standardized.push('    ');
      standardized.push('    act(() => {');
      standardized.push("      result.current.setValue('new value');");
      standardized.push('    });');
      standardized.push('    ');
      standardized.push("    expect(result.current.value).toBe('new value');");
      standardized.push('  });');
    } else {
      standardized.push(`describe('${componentName}', () => {`);
      standardized.push("  it('should calculate correctly', () => {");
      standardized.push(`    const result = ${componentName}(10, 20);`);
      standardized.push('    expect(result).toBe(30);');
      standardized.push('  });');
      standardized.push('');
      standardized.push("  it('should handle edge cases', () => {");
      standardized.push(`    expect(${componentName}(0, 0)).toBe(0);`);
      standardized.push(`    expect(${componentName}(-5, 5)).toBe(0);`);
      standardized.push('  });');
    }

    standardized.push('});');

    return standardized.join('\n');
  }

  // Extraire le nom du composant/hook/fonction
  extractComponentName(fileName, filePath) {
    // Règles de nommage
    if (filePath.includes('/components/')) {
      return fileName.replace(/^[a-z]/, (c) => c.toUpperCase());
    } else if (filePath.includes('/hooks/')) {
      return fileName.startsWith('use')
        ? fileName
        : `use${fileName.charAt(0).toUpperCase() + fileName.slice(1)}`;
    } else {
      return fileName;
    }
  }

  // Créer un fichier de test manquant
  createMissingTest(sourcePath) {
    try {
      const testPath = sourcePath.replace(/\.(ts|tsx)$/, '.test.$1');
      const testDir = path.dirname(testPath);

      // Créer le répertoire si nécessaire
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Déterminer le type de test
      const isComponent = sourcePath.includes('/components/');
      const isHook = sourcePath.includes('/hooks/');
      const isUtility = sourcePath.includes('/lib/');

      let template = '';
      const fileName = path.basename(sourcePath, path.extname(sourcePath));

      if (isComponent) {
        template = TEMPLATES.component.replace(/ComponentName/g, fileName);
      } else if (isHook) {
        template = TEMPLATES.hook.replace(/useHookName/g, fileName);
      } else {
        template = TEMPLATES.utility.replace(/functionName/g, fileName);
      }

      // Écrire le fichier de test
      fs.writeFileSync(testPath, template);

      this.log(`  ➕ ${testPath} (créé)`, 'green');
      this.results.created++;
    } catch (error) {
      this.log(`  ❌ Erreur création ${sourcePath}: ${error.message}`, 'red');
      this.results.errors.push(`${sourcePath}: ${error.message}`);
    }
  }

  // Trouver les fichiers source sans tests
  findMissingTests() {
    const missingTests = [];

    const scanDir = (dir) => {
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
          scanDir(fullPath);
        } else if (
          stat.isFile() &&
          /\.(ts|tsx)$/.test(item) &&
          !item.includes('.test.') &&
          !item.includes('.spec.')
        ) {
          const testPath = fullPath.replace(/\.(ts|tsx)$/, '.test.$1');
          if (!fs.existsSync(testPath)) {
            missingTests.push(fullPath);
          }
        }
      }
    };

    scanDir(CONFIG.testDir);
    return missingTests;
  }

  // Exécuter la standardisation
  async run() {
    this.log('🔧 STANDARDISATION DES TESTS SUPERNOVAFIT', 'bold');
    this.log('='.repeat(50), 'blue');

    // 1. Créer un backup
    this.createBackup();

    // 2. Standardiser les tests existants
    this.log('\n📁 Standardisation des tests existants...', 'blue');
    const testFiles = this.findTestFiles();

    for (const filePath of testFiles) {
      this.standardizeTestFile(filePath);
      this.results.processed++;
    }

    // 3. Créer les tests manquants
    this.log('\n➕ Création des tests manquants...', 'blue');
    const missingTests = this.findMissingTests();

    for (const sourcePath of missingTests.slice(0, 10)) {
      // Limiter à 10 pour éviter la surcharge
      this.createMissingTest(sourcePath);
    }

    // 4. Générer le rapport
    this.generateReport();
  }

  // Générer le rapport
  generateReport() {
    this.log('\n📊 RAPPORT DE STANDARDISATION', 'bold');
    this.log('='.repeat(50), 'blue');

    this.log(`\n📈 RÉSULTATS:`, 'bold');
    this.log(`  • Fichiers traités: ${this.results.processed}`);
    this.log(`  • Fichiers mis à jour: ${this.results.updated}`, 'yellow');
    this.log(`  • Fichiers créés: ${this.results.created}`, 'green');
    this.log(
      `  • Erreurs: ${this.results.errors.length}`,
      this.results.errors.length > 0 ? 'red' : 'green',
    );

    if (this.results.errors.length > 0) {
      this.log(`\n❌ ERREURS:`, 'red');
      this.results.errors.forEach((error) => {
        this.log(`  • ${error}`, 'red');
      });
    }

    this.log(`\n💡 PROCHAINES ÉTAPES:`, 'bold');
    this.log(`  1. Vérifier les tests: npm test`);
    this.log(`  2. Vérifier le coverage: npm run test:coverage`);
    this.log(`  3. Corriger les erreurs si nécessaire`);
    this.log(`  4. Commiter les changements`);

    this.log(`\n📁 Backup disponible dans: ${CONFIG.backupDir}`, 'blue');
  }
}

// Exécution du script
if (require.main === module) {
  const standardizer = new TestStandardizer();
  standardizer.run().catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = TestStandardizer;
