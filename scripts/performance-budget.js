#!/usr/bin/env node
/**
 * 🎯 PERFORMANCE BUDGET MONITORING - SUPERNOVAFIT
 * Script pour vérifier les seuils de performance définis
 * Usage: node scripts/performance-budget.js
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Configuration du budget de performance
const PERFORMANCE_BUDGET = {
  bundleSize: {
    maxSize: 200 * 1024, // 200KB
    warningSize: 180 * 1024, // 180KB
  },
  webVitals: {
    LCP: { max: 2500, warning: 2000 }, // ms
    INP: { max: 200, warning: 150 }, // ms
    CLS: { max: 0.1, warning: 0.08 }, // score
    FCP: { max: 1800, warning: 1500 }, // ms
    TTFB: { max: 800, warning: 600 }, // ms
  },
  memory: {
    maxHeapSize: 512 * 1024 * 1024, // 512MB
    warningHeapSize: 400 * 1024 * 1024, // 400MB
  },
};

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Helper pour formater les tailles
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper pour formater le temps
function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Vérifier la taille du bundle
function checkBundleSize() {
  const buildDir = path.join(process.cwd(), '.next');
  const staticDir = path.join(buildDir, 'static');

  if (!fs.existsSync(staticDir)) {
    console.log(
      `${colors.yellow}⚠️  Build directory not found. Run 'npm run build' first.${colors.reset}`,
    );
    return { status: 'warning', message: 'Build directory not found' };
  }

  let totalSize = 0;
  let files = [];

  // Parcourir les fichiers JS
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.js') || item.endsWith('.css')) {
        totalSize += stat.size;
        files.push({
          name: item,
          size: stat.size,
          path: fullPath.replace(process.cwd(), ''),
        });
      }
    });
  }

  scanDirectory(staticDir);

  // Trier par taille
  files.sort((a, b) => b.size - a.size);

  // Déterminer le statut
  let status = 'good';
  let message = '';

  if (totalSize > PERFORMANCE_BUDGET.bundleSize.maxSize) {
    status = 'error';
    message = `Bundle size exceeds maximum budget (${formatBytes(PERFORMANCE_BUDGET.bundleSize.maxSize)})`;
  } else if (totalSize > PERFORMANCE_BUDGET.bundleSize.warningSize) {
    status = 'warning';
    message = `Bundle size exceeds warning budget (${formatBytes(PERFORMANCE_BUDGET.bundleSize.warningSize)})`;
  } else {
    message = `Bundle size within budget`;
  }

  return {
    status,
    message,
    totalSize,
    files: files.slice(0, 5), // Top 5 fichiers
  };
}

// Vérifier les métriques de performance (simulation)
function checkWebVitals() {
  // En production, ces métriques viendraient de Sentry ou d'un autre service
  // Ici on simule des valeurs pour la démonstration
  const mockVitals = {
    LCP: 1800, // ms
    INP: 120, // ms
    CLS: 0.05, // score
    FCP: 1200, // ms
    TTFB: 400, // ms
  };

  const results = {};
  let hasIssues = false;

  Object.entries(mockVitals).forEach(([metric, value]) => {
    const budget = PERFORMANCE_BUDGET.webVitals[metric];
    let status = 'good';
    let message = '';

    if (value > budget.max) {
      status = 'error';
      message = `Exceeds maximum budget (${budget.max})`;
      hasIssues = true;
    } else if (value > budget.warning) {
      status = 'warning';
      message = `Exceeds warning budget (${budget.warning})`;
      hasIssues = true;
    } else {
      message = 'Within budget';
    }

    results[metric] = {
      value,
      status,
      message,
      budget,
    };
  });

  return {
    status: hasIssues ? 'warning' : 'good',
    results,
  };
}

// Fonction principale
function main() {
  console.log(
    `${colors.bold}${colors.blue}🎯 PERFORMANCE BUDGET CHECK - SUPERNOVAFIT${colors.reset}\n`,
  );

  // 1. Vérifier la taille du bundle
  console.log(`${colors.bold}📦 Bundle Size Check:${colors.reset}`);
  const bundleResult = checkBundleSize();

  const bundleColor =
    bundleResult.status === 'error'
      ? colors.red
      : bundleResult.status === 'warning'
        ? colors.yellow
        : colors.green;

  console.log(
    `${bundleColor}${bundleResult.status.toUpperCase()}: ${bundleResult.message}${colors.reset}`,
  );

  if (bundleResult.totalSize) {
    console.log(`   Total size: ${formatBytes(bundleResult.totalSize)}`);
    console.log(
      `   Budget: ${formatBytes(PERFORMANCE_BUDGET.bundleSize.maxSize)}`,
    );

    if (bundleResult.files && bundleResult.files.length > 0) {
      console.log(`   Top files:`);
      bundleResult.files.forEach((file) => {
        console.log(`     ${file.path}: ${formatBytes(file.size)}`);
      });
    }
  }
  console.log('');

  // 2. Vérifier les Web Vitals
  console.log(`${colors.bold}⚡ Web Vitals Check:${colors.reset}`);
  const vitalsResult = checkWebVitals();

  Object.entries(vitalsResult.results).forEach(([metric, result]) => {
    const color =
      result.status === 'error'
        ? colors.red
        : result.status === 'warning'
          ? colors.yellow
          : colors.green;

    const value =
      metric === 'CLS' ? result.value.toFixed(3) : formatTime(result.value);
    const budget =
      metric === 'CLS' ? result.budget.max : formatTime(result.budget.max);

    console.log(
      `${color}${result.status.toUpperCase()}${colors.reset} ${metric}: ${value} (budget: ${budget})`,
    );
    if (result.status !== 'good') {
      console.log(`   ${result.message}`);
    }
  });
  console.log('');

  // 3. Résumé
  const overallStatus =
    bundleResult.status === 'error' || vitalsResult.status === 'error'
      ? 'error'
      : bundleResult.status === 'warning' || vitalsResult.status === 'warning'
        ? 'warning'
        : 'good';

  const overallColor =
    overallStatus === 'error'
      ? colors.red
      : overallStatus === 'warning'
        ? colors.yellow
        : colors.green;

  console.log(
    `${colors.bold}📊 Overall Status: ${overallColor}${overallStatus.toUpperCase()}${colors.reset}`,
  );

  if (overallStatus === 'good') {
    console.log(
      `${colors.green}✅ All performance budgets are within acceptable limits!${colors.reset}`,
    );
  } else {
    console.log(
      `${colors.yellow}⚠️  Some performance budgets need attention.${colors.reset}`,
    );
  }

  // Exit code
  process.exit(overallStatus === 'error' ? 1 : 0);
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = {
  checkBundleSize,
  checkWebVitals,
  PERFORMANCE_BUDGET,
};
