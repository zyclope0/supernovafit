/**
 * Script de vérification des données Firestore
 * Vérifie la structure et les formats des données créées
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Équivalent de __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialiser Firebase Admin
if (!getApps().length) {
  const serviceAccount = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../firebase-service-account.json'),
      'utf8',
    ),
  );

  initializeApp({
    credential: cert(serviceAccount),
    projectId: 'supernovafit-a6fe7',
  });
}

const db = getFirestore();

const TEST_USER_ID = 'VBSTkEAy1OWptNJmUbIjFFz62Zg1';

async function checkRepas() {
  console.log('\n📊 Vérification REPAS...');

  const snapshot = await db
    .collection('repas')
    .where('user_id', '==', TEST_USER_ID)
    .limit(3)
    .get();

  console.log(`  → ${snapshot.size} repas trouvés`);

  if (snapshot.size > 0) {
    const firstRepas = snapshot.docs[0].data();
    console.log('\n  📝 Premier repas:');
    console.log('    - ID:', snapshot.docs[0].id);
    console.log(
      '    - date:',
      firstRepas.date,
      '(type:',
      typeof firstRepas.date,
      ')',
    );
    console.log('    - repas:', firstRepas.repas);
    console.log('    - aliments count:', firstRepas.aliments?.length || 0);

    if (firstRepas.aliments && firstRepas.aliments.length > 0) {
      const aliment = firstRepas.aliments[0];
      console.log('    - aliment[0]:');
      console.log('      * id:', aliment.id);
      console.log('      * nom:', aliment.nom);
      console.log(
        '      * quantite:',
        aliment.quantite,
        '(type:',
        typeof aliment.quantite,
        ')',
      );
      console.log('      * unite:', aliment.unite);
      console.log('      * macros.kcal:', aliment.macros?.kcal);
      console.log('      * macros.prot:', aliment.macros?.prot);
    }

    console.log('    - macros:');
    console.log('      * kcal:', firstRepas.macros?.kcal);
    console.log('      * prot:', firstRepas.macros?.prot);
    console.log('      * glucides:', firstRepas.macros?.glucides);
    console.log('      * lipides:', firstRepas.macros?.lipides);
  }
}

async function checkEntrainements() {
  console.log('\n🏋️ Vérification ENTRAÎNEMENTS...');

  const snapshot = await db
    .collection('entrainements')
    .where('user_id', '==', TEST_USER_ID)
    .limit(3)
    .get();

  console.log(`  → ${snapshot.size} entraînements trouvés`);

  if (snapshot.size > 0) {
    const firstTraining = snapshot.docs[0].data();
    console.log('\n  📝 Premier entraînement:');
    console.log('    - ID:', snapshot.docs[0].id);
    console.log(
      '    - date:',
      firstTraining.date,
      '(type:',
      typeof firstTraining.date,
      ')',
    );
    console.log('    - type:', firstTraining.type);
    console.log('    - duree:', firstTraining.duree);
    console.log('    - source:', firstTraining.source);
    console.log('    - calories:', firstTraining.calories);
    console.log('    - commentaire:', firstTraining.commentaire);
    console.log('    - distance:', firstTraining.distance);
  }
}

async function checkMesures() {
  console.log('\n📏 Vérification MESURES...');

  const snapshot = await db
    .collection('mesures')
    .where('user_id', '==', TEST_USER_ID)
    .limit(3)
    .get();

  console.log(`  → ${snapshot.size} mesures trouvées`);

  if (snapshot.size > 0) {
    const firstMesure = snapshot.docs[0].data();
    console.log('\n  📝 Première mesure:');
    console.log('    - ID:', snapshot.docs[0].id);
    console.log(
      '    - date:',
      firstMesure.date,
      '(type:',
      typeof firstMesure.date,
      ')',
    );
    console.log('    - poids:', firstMesure.poids);
    console.log('    - imc:', firstMesure.imc);
    console.log('    - masse_grasse:', firstMesure.masse_grasse);
  }
}

async function checkJournal() {
  console.log('\n📓 Vérification JOURNAL...');

  const snapshot = await db
    .collection('journal')
    .where('user_id', '==', TEST_USER_ID)
    .limit(3)
    .get();

  console.log(`  → ${snapshot.size} entrées trouvées`);

  if (snapshot.size > 0) {
    const firstEntry = snapshot.docs[0].data();
    console.log('\n  📝 Première entrée:');
    console.log('    - ID:', snapshot.docs[0].id);
    console.log(
      '    - date:',
      firstEntry.date,
      '(type:',
      typeof firstEntry.date,
      ')',
    );
    console.log('    - humeur:', firstEntry.humeur);
    console.log('    - energie:', firstEntry.energie);
    console.log('    - sommeil:', firstEntry.sommeil);
  }
}

async function main() {
  console.log('🔍 Vérification des données Firestore\n');
  console.log('User ID:', TEST_USER_ID);

  try {
    await checkRepas();
    await checkEntrainements();
    await checkMesures();
    await checkJournal();

    console.log('\n✅ Vérification terminée\n');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
