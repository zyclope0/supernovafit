#!/usr/bin/env node

/**
 * Script de génération automatique de tests SuperNovaFit
 * Usage: node scripts/generate-tests.js [--component=ComponentName] [--hook=HookName] [--utility=FunctionName]
 */

const fs = require('fs');
const path = require('path');

// Templates de tests
const TEST_TEMPLATES = {
  component: (
    name,
    props = [],
  ) => `import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ${name} } from '@/components/ui/${name}';

describe('${name}', () => {
  const mockProps = {
    ${props.map((prop) => `${prop}: 'test-${prop}',`).join('\n    ')}
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<${name} {...mockProps} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    const mockOnClick = vi.fn();
    render(<${name} {...mockProps} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should handle loading state', () => {
    render(<${name} {...mockProps} loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<${name} {...mockProps} error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    render(<${name} {...mockProps} disabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should handle custom className', () => {
    render(<${name} {...mockProps} className="custom-class" />);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});`,

  hook: (
    name,
    returns = [],
  ) => `import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ${name} } from '@/hooks/${name}';

describe('${name}', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => ${name}());
    
    expect(result.current.${returns[0] || 'value'}).toBe(null);
    expect(result.current.${returns[1] || 'loading'}).toBe(false);
    expect(result.current.${returns[2] || 'error'}).toBe(null);
  });

  it('should update value when called', () => {
    const { result } = renderHook(() => ${name}());
    
    act(() => {
      result.current.setValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });

  it('should handle async operations', async () => {
    const { result } = renderHook(() => ${name}());
    
    await act(async () => {
      await result.current.fetchData();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeDefined();
  });

  it('should handle errors', async () => {
    const { result } = renderHook(() => ${name}());
    
    await act(async () => {
      await result.current.fetchData();
    });
    
    expect(result.current.error).toBeDefined();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => ${name}());
    
    unmount();
    // Vérifier que les listeners sont nettoyés
  });
});`,

  utility: (
    name,
    params = [],
  ) => `import { describe, it, expect } from 'vitest';
import { ${name} } from '@/lib/${name}';

describe('${name}', () => {
  it('should calculate correctly', () => {
    const result = ${name}(${params.map((_, i) => i + 1).join(', ')});
    expect(result).toBe(${params.length + 1});
  });

  it('should handle edge cases', () => {
    expect(${name}(0, 0)).toBe(0);
    expect(${name}(-5, 5)).toBe(0);
    expect(${name}(Number.MAX_VALUE, 1)).toBe(Number.MAX_VALUE + 1);
  });

  it('should handle invalid inputs', () => {
    expect(() => ${name}(NaN, 5)).toThrow();
    expect(() => ${name}(5, null as any)).toThrow();
    expect(() => ${name}(5, undefined as any)).toThrow();
  });

  it('should handle string inputs', () => {
    expect(${name}('10', '20')).toBe(30);
    expect(${name}('invalid', 5)).toBeNaN();
  });

  it('should handle array inputs', () => {
    expect(${name}([1, 2, 3])).toBe(6);
    expect(${name}([])).toBe(0);
  });

  it('should handle empty inputs', () => {
    expect(${name}()).toBe(0);
    expect(${name}(null as any)).toBe(0);
  });
});`,
};

// Configuration
const CONFIG = {
  testDir: 'src',
  outputDir: 'src/__tests__',
  backupDir: '.test-backup',
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

class TestGenerator {
  constructor() {
    this.results = {
      generated: 0,
      errors: [],
      warnings: [],
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  // Parser les arguments de ligne de commande
  parseArgs() {
    const args = process.argv.slice(2);
    const options = {
      component: null,
      hook: null,
      utility: null,
      props: [],
      returns: [],
      params: [],
    };

    for (const arg of args) {
      if (arg.startsWith('--component=')) {
        options.component = arg.split('=')[1];
      } else if (arg.startsWith('--hook=')) {
        options.hook = arg.split('=')[1];
      } else if (arg.startsWith('--utility=')) {
        options.utility = arg.split('=')[1];
      } else if (arg.startsWith('--props=')) {
        options.props = arg.split('=')[1].split(',');
      } else if (arg.startsWith('--returns=')) {
        options.returns = arg.split('=')[1].split(',');
      } else if (arg.startsWith('--params=')) {
        options.params = arg.split('=')[1].split(',');
      }
    }

    return options;
  }

  // Générer un test pour un composant
  generateComponentTest(name, props = []) {
    const template = TEST_TEMPLATES.component(name, props);
    const testPath = path.join(
      CONFIG.outputDir,
      'components',
      'ui',
      `${name}.test.tsx`,
    );

    this.writeTestFile(testPath, template);
    return testPath;
  }

  // Générer un test pour un hook
  generateHookTest(name, returns = []) {
    const template = TEST_TEMPLATES.hook(name, returns);
    const testPath = path.join(CONFIG.outputDir, 'hooks', `${name}.test.ts`);

    this.writeTestFile(testPath, template);
    return testPath;
  }

  // Générer un test pour une fonction utilitaire
  generateUtilityTest(name, params = []) {
    const template = TEST_TEMPLATES.utility(name, params);
    const testPath = path.join(CONFIG.outputDir, 'lib', `${name}.test.ts`);

    this.writeTestFile(testPath, template);
    return testPath;
  }

  // Écrire un fichier de test
  writeTestFile(testPath, content) {
    try {
      // Créer le répertoire si nécessaire
      const testDir = path.dirname(testPath);
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Vérifier si le fichier existe déjà
      if (fs.existsSync(testPath)) {
        this.log(`  ⚠️  ${testPath} existe déjà`, 'yellow');
        this.results.warnings.push(`${testPath} existe déjà`);
        return;
      }

      // Écrire le fichier
      fs.writeFileSync(testPath, content);
      this.log(`  ✅ ${testPath} (généré)`, 'green');
      this.results.generated++;
    } catch (error) {
      this.log(`  ❌ ${testPath}: ${error.message}`, 'red');
      this.results.errors.push(`${testPath}: ${error.message}`);
    }
  }

  // Générer des tests pour tous les composants manquants
  generateMissingTests() {
    this.log('\n🔍 Recherche des composants sans tests...', 'blue');

    const missingTests = this.findMissingTests();

    for (const sourcePath of missingTests.slice(0, 20)) {
      // Limiter à 20
      const fileName = path.basename(sourcePath, path.extname(sourcePath));
      const relativePath = path.relative(CONFIG.testDir, sourcePath);

      if (relativePath.includes('/components/')) {
        this.generateComponentTest(fileName);
      } else if (relativePath.includes('/hooks/')) {
        this.generateHookTest(fileName);
      } else if (relativePath.includes('/lib/')) {
        this.generateUtilityTest(fileName);
      }
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

  // Générer un test interactif
  generateInteractiveTest() {
    this.log('\n🎯 GÉNÉRATION INTERACTIVE', 'bold');
    this.log('='.repeat(50), 'blue');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question('Type de test (component/hook/utility): ', (type) => {
        rl.question('Nom: ', (name) => {
          rl.question(
            'Props/Returns/Params (séparés par des virgules): ',
            (items) => {
              const itemsList = items
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item);

              let testPath = '';
              switch (type) {
                case 'component':
                  testPath = this.generateComponentTest(name, itemsList);
                  break;
                case 'hook':
                  testPath = this.generateHookTest(name, itemsList);
                  break;
                case 'utility':
                  testPath = this.generateUtilityTest(name, itemsList);
                  break;
                default:
                  this.log('Type invalide', 'red');
                  rl.close();
                  resolve();
                  return;
              }

              this.log(`\n✅ Test généré: ${testPath}`, 'green');
              rl.close();
              resolve();
            },
          );
        });
      });
    });
  }

  // Exécuter la génération
  async run() {
    this.log('🚀 GÉNÉRATION DE TESTS SUPERNOVAFIT', 'bold');
    this.log('='.repeat(50), 'blue');

    const options = this.parseArgs();

    // Mode interactif si aucun argument
    if (!options.component && !options.hook && !options.utility) {
      await this.generateInteractiveTest();
    } else {
      // Génération basée sur les arguments
      if (options.component) {
        this.log(
          `\n📱 Génération test composant: ${options.component}`,
          'blue',
        );
        this.generateComponentTest(options.component, options.props);
      }

      if (options.hook) {
        this.log(`\n🪝 Génération test hook: ${options.hook}`, 'blue');
        this.generateHookTest(options.hook, options.returns);
      }

      if (options.utility) {
        this.log(`\n🔧 Génération test utilitaire: ${options.utility}`, 'blue');
        this.generateUtilityTest(options.utility, options.params);
      }
    }

    // Générer les tests manquants si demandé
    if (process.argv.includes('--all')) {
      this.generateMissingTests();
    }

    // Générer le rapport
    this.generateReport();
  }

  // Générer le rapport
  generateReport() {
    this.log('\n📊 RAPPORT DE GÉNÉRATION', 'bold');
    this.log('='.repeat(50), 'blue');

    this.log(`\n📈 RÉSULTATS:`, 'bold');
    this.log(`  • Tests générés: ${this.results.generated}`, 'green');
    this.log(
      `  • Erreurs: ${this.results.errors.length}`,
      this.results.errors.length > 0 ? 'red' : 'green',
    );
    this.log(
      `  • Avertissements: ${this.results.warnings.length}`,
      this.results.warnings.length > 0 ? 'yellow' : 'green',
    );

    if (this.results.errors.length > 0) {
      this.log(`\n❌ ERREURS:`, 'red');
      this.results.errors.forEach((error) => {
        this.log(`  • ${error}`, 'red');
      });
    }

    if (this.results.warnings.length > 0) {
      this.log(`\n⚠️  AVERTISSEMENTS:`, 'yellow');
      this.results.warnings.forEach((warning) => {
        this.log(`  • ${warning}`, 'yellow');
      });
    }

    this.log(`\n💡 PROCHAINES ÉTAPES:`, 'bold');
    this.log(`  1. Vérifier les tests: npm test`);
    this.log(`  2. Vérifier le coverage: npm run test:coverage`);
    this.log(`  3. Adapter les tests selon vos besoins`);
    this.log(`  4. Commiter les changements`);

    this.log(`\n📚 USAGE:`, 'bold');
    this.log(
      `  • Composant: node scripts/generate-tests.js --component=Button --props=onClick,disabled`,
    );
    this.log(
      `  • Hook: node scripts/generate-tests.js --hook=useAuth --returns=user,loading,error`,
    );
    this.log(
      `  • Utilitaire: node scripts/generate-tests.js --utility=calculateBMI --params=weight,height`,
    );
    this.log(`  • Tous: node scripts/generate-tests.js --all`);
  }
}

// Exécution du script
if (require.main === module) {
  const generator = new TestGenerator();
  generator.run().catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = TestGenerator;
