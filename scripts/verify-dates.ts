/**
 * Script de vérification des dates dans Firestore
 * Vérifie que les données sont bien en 2025 et incluent aujourd'hui
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function verifyDates() {
  console.log('🔍 Vérification des dates dans Firestore...\n');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  console.log(`📅 Date du jour: ${todayStr}\n`);

  // Vérifier repas
  const repasSnap = await db
    .collection('repas')
    .where('user_id', '==', TEST_USER_ID)
    .orderBy('date', 'desc')
    .limit(5)
    .get();

  console.log(`🍽️ Repas (${repasSnap.size} derniers):`);
  repasSnap.forEach((doc) => {
    const data = doc.data();
    const date = data.date.toDate();
    console.log(
      `  - ${date.toISOString().split('T')[0]} | ${data.repas} | ${data.aliments.length} aliments`,
    );
  });

  // Vérifier entraînements
  const trainSnap = await db
    .collection('entrainements')
    .where('user_id', '==', TEST_USER_ID)
    .orderBy('date', 'desc')
    .limit(5)
    .get();

  console.log(`\n🏋️ Entraînements (${trainSnap.size} derniers):`);
  trainSnap.forEach((doc) => {
    const data = doc.data();
    const date = data.date.toDate();
    console.log(
      `  - ${date.toISOString().split('T')[0]} | ${data.type} | ${data.duree}min`,
    );
  });

  // Vérifier mesures
  const mesuresSnap = await db
    .collection('mesures')
    .where('user_id', '==', TEST_USER_ID)
    .orderBy('date', 'desc')
    .limit(5)
    .get();

  console.log(`\n📏 Mesures (${mesuresSnap.size} dernières):`);
  mesuresSnap.forEach((doc) => {
    const data = doc.data();
    const date = data.date.toDate();
    console.log(
      `  - ${date.toISOString().split('T')[0]} | Poids: ${data.poids}kg | IMC: ${data.imc}`,
    );
  });

  // Vérifier journal
  const journalSnap = await db
    .collection('journal')
    .where('user_id', '==', TEST_USER_ID)
    .orderBy('date', 'desc')
    .limit(5)
    .get();

  console.log(`\n📓 Journal (${journalSnap.size} dernières):`);
  journalSnap.forEach((doc) => {
    const data = doc.data();
    const date = data.date.toDate();
    console.log(
      `  - ${date.toISOString().split('T')[0]} | Humeur: ${data.humeur}/10 | Énergie: ${data.energie}/10`,
    );
  });

  // Vérifier s'il y a des données aujourd'hui
  const todayRepas = await db
    .collection('repas')
    .where('user_id', '==', TEST_USER_ID)
    .get();

  const todayRepasCount = todayRepas.docs.filter((doc) => {
    const date = doc.data().date.toDate();
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  }).length;

  console.log(`\n✅ Résumé:`);
  console.log(`  - Repas aujourd'hui (${todayStr}): ${todayRepasCount}`);
  console.log(
    `  - Total repas: ${repasSnap.size > 0 ? repasSnap.docs[0].data().date.toDate().toISOString().split('T')[0] : 'N/A'}`,
  );

  if (todayRepasCount === 0) {
    console.log(`\n⚠️ ATTENTION: Aucun repas pour aujourd'hui (${todayStr})`);
  } else {
    console.log(`\n✅ OK: ${todayRepasCount} repas pour aujourd'hui`);
  }
}

verifyDates()
  .then(() => {
    console.log('\n✨ Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
