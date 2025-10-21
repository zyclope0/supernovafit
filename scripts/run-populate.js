/**
 * Script d'exécution pour peupler les données de test
 * Usage: node scripts/run-populate.js
 *
 * eslint-disable @typescript-eslint/no-require-imports
 */

// @ts-ignore
const dotenv = require('dotenv');
// @ts-ignore
const { execSync } = require('child_process');

dotenv.config({ path: '.env.local' });

console.log('🔧 Compilation du script TypeScript...');
try {
  execSync('npx ts-node scripts/populate-test-data.ts', {
    stdio: 'inherit',
    env: process.env,
  });
} catch (error) {
  console.error("❌ Erreur lors de l'exécution:", error.message);
  process.exit(1);
}
