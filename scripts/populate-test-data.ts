/**
 * Script de population de données de test cohérentes
 * Basé sur l'historique réel : 99kg (31.07.2025) -> 89kg (20.10.2025)
 * Régime alimentaire progressif avec changement il y a 3 semaines
 * 3-4 entraînements/semaine (endurance + musculation)
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
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

// ID utilisateur de test (sportif)
const TEST_USER_ID = 'VBSTkEAy1OWptNJmUbIjFFz62Zg1'; // User test réel
const COACH_ID = 'QwpCZpdwXURc3pB2m8K51h4S6ff1'; // Coach réel

// Dates clés
const START_DATE = new Date('2024-07-31'); // 99kg
const END_DATE = new Date('2024-10-20'); // 89kg
const DIET_CHANGE_DATE = new Date('2024-09-29'); // Il y a 3 semaines

// Fonction pour générer une progression linéaire du poids
function calculateWeight(date: Date): number {
  const totalDays =
    (END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24);
  const daysPassed =
    (date.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24);

  const startWeight = 99;
  const endWeight = 89;
  const weightLoss = startWeight - endWeight;

  // Progression linéaire avec légères variations
  const baseWeight = startWeight - (weightLoss * daysPassed) / totalDays;
  const variation = (Math.random() - 0.5) * 0.5; // ±0.25kg variation

  return Math.round((baseWeight + variation) * 10) / 10;
}

// Fonction pour calculer IMC
function calculateIMC(poids: number, taille: number): number {
  return Math.round((poids / Math.pow(taille / 100, 2)) * 10) / 10;
}

// Fonction pour calculer masse grasse estimée
function calculateBodyFat(poids: number, progressRatio: number): number {
  const startBodyFat = 28; // Estimation départ
  const endBodyFat = 18; // Estimation fin
  const bodyFat = startBodyFat - (startBodyFat - endBodyFat) * progressRatio;

  return Math.round(bodyFat * 10) / 10;
}

/**
 * ANCIEN RÉGIME (jusqu'au 29.09.2024)
 */
const OLD_DIET = {
  petit_dej: [
    {
      nom: 'Banane',
      quantite: '1 unité',
      calories: 105,
      proteines: 1.3,
      glucides: 27,
      lipides: 0.4,
    },
    {
      nom: "Flocons d'avoine",
      quantite: '50g',
      calories: 190,
      proteines: 6.5,
      glucides: 34,
      lipides: 3.5,
    },
    {
      nom: 'Séré maigre',
      quantite: '250g',
      calories: 170,
      proteines: 30,
      glucides: 10,
      lipides: 1,
    },
  ],
  collation_matin: [
    {
      nom: 'Fromage',
      quantite: '60g',
      calories: 240,
      proteines: 15,
      glucides: 1,
      lipides: 20,
    },
  ],
  dejeuner: [
    {
      nom: 'Poulet grillé',
      quantite: '120g',
      calories: 198,
      proteines: 37,
      glucides: 0,
      lipides: 4.3,
    },
    {
      nom: 'Brocoli vapeur',
      quantite: '200g',
      calories: 68,
      proteines: 5.6,
      glucides: 14,
      lipides: 0.7,
    },
  ],
  collation_apres_midi: [
    {
      nom: 'Viande des Grisons',
      quantite: '60g',
      calories: 132,
      proteines: 24,
      glucides: 0,
      lipides: 3.6,
    },
  ],
  diner: [
    {
      nom: 'Saumon',
      quantite: '120g',
      calories: 248,
      proteines: 25,
      glucides: 0,
      lipides: 16,
    },
    {
      nom: 'Haricots verts',
      quantite: '200g',
      calories: 62,
      proteines: 3.6,
      glucides: 14,
      lipides: 0.4,
    },
  ],
  collation_soir: [
    {
      nom: 'Séré maigre',
      quantite: '250g',
      calories: 170,
      proteines: 30,
      glucides: 10,
      lipides: 1,
    },
    {
      nom: 'Pomme',
      quantite: '150g',
      calories: 78,
      proteines: 0.4,
      glucides: 21,
      lipides: 0.3,
    },
  ],
};

/**
 * NOUVEAU RÉGIME (depuis le 29.09.2024)
 */
const NEW_DIET = {
  petit_dej: [
    {
      nom: 'Pain complet',
      quantite: '50g',
      calories: 130,
      proteines: 5,
      glucides: 24,
      lipides: 1.5,
    },
    {
      nom: 'Beurre',
      quantite: '10g',
      calories: 75,
      proteines: 0.1,
      glucides: 0.1,
      lipides: 8.3,
    },
    {
      nom: 'Confiture',
      quantite: '20g',
      calories: 52,
      proteines: 0.1,
      glucides: 13,
      lipides: 0,
    },
  ],
  collation_matin: [
    {
      nom: 'Viande séchée',
      quantite: '50g',
      calories: 110,
      proteines: 20,
      glucides: 0,
      lipides: 3,
    },
  ],
  dejeuner: [
    {
      nom: 'Poulet grillé',
      quantite: '140g',
      calories: 231,
      proteines: 43,
      glucides: 0,
      lipides: 5,
    },
    {
      nom: 'Courgettes',
      quantite: '200g',
      calories: 34,
      proteines: 2.4,
      glucides: 7,
      lipides: 0.6,
    },
  ],
  collation_apres_midi: [
    {
      nom: 'Amandes',
      quantite: '30g',
      calories: 174,
      proteines: 6.3,
      glucides: 6.6,
      lipides: 15,
    },
  ],
  diner: [
    {
      nom: 'Pommes de terre',
      quantite: '200g',
      calories: 154,
      proteines: 4,
      glucides: 36,
      lipides: 0.2,
    },
    {
      nom: 'Steak de boeuf',
      quantite: '120g',
      calories: 250,
      proteines: 26,
      glucides: 0,
      lipides: 16,
    },
    {
      nom: 'Salade verte',
      quantite: '100g',
      calories: 15,
      proteines: 1.4,
      glucides: 2.9,
      lipides: 0.2,
    },
  ],
  collation_soir: [
    {
      nom: 'Chocolat noir 70%',
      quantite: '20g (4 carrés)',
      calories: 114,
      proteines: 1.4,
      glucides: 10,
      lipides: 8,
    },
  ],
};

/**
 * Entraînements types
 */
const TRAININGS = [
  {
    type: 'Cardio',
    nom: 'Course à pied',
    duree: 45,
    intensite: 'Modérée',
    calories: 450,
    exercices: [
      { nom: 'Échauffement', duree: 5, intensite: 'Faible' },
      { nom: 'Course endurance', duree: 35, intensite: 'Modérée' },
      { nom: 'Retour au calme', duree: 5, intensite: 'Faible' },
    ],
  },
  {
    type: 'Musculation',
    nom: 'Full body',
    duree: 60,
    intensite: 'Élevée',
    calories: 350,
    exercices: [
      { nom: 'Squat', series: 4, repetitions: 12, poids: 80, repos: 90 },
      {
        nom: 'Développé couché',
        series: 4,
        repetitions: 10,
        poids: 70,
        repos: 90,
      },
      {
        nom: 'Soulevé de terre',
        series: 3,
        repetitions: 8,
        poids: 100,
        repos: 120,
      },
      { nom: 'Tractions', series: 3, repetitions: 10, repos: 90 },
      { nom: 'Dips', series: 3, repetitions: 12, repos: 60 },
    ],
  },
  {
    type: 'Cardio',
    nom: 'Vélo',
    duree: 50,
    intensite: 'Modérée',
    calories: 400,
    exercices: [
      { nom: 'Échauffement', duree: 5, intensite: 'Faible' },
      { nom: 'Vélo endurance', duree: 40, intensite: 'Modérée' },
      { nom: 'Retour au calme', duree: 5, intensite: 'Faible' },
    ],
  },
  {
    type: 'Musculation',
    nom: 'Haut du corps',
    duree: 55,
    intensite: 'Élevée',
    calories: 320,
    exercices: [
      {
        nom: 'Développé incliné',
        series: 4,
        repetitions: 10,
        poids: 60,
        repos: 90,
      },
      { nom: 'Rowing barre', series: 4, repetitions: 10, poids: 70, repos: 90 },
      {
        nom: 'Développé militaire',
        series: 3,
        repetitions: 12,
        poids: 40,
        repos: 90,
      },
      { nom: 'Curl biceps', series: 3, repetitions: 12, poids: 15, repos: 60 },
      {
        nom: 'Extension triceps',
        series: 3,
        repetitions: 12,
        poids: 12,
        repos: 60,
      },
    ],
  },
];

/**
 * Nettoyage des données de test
 */
async function cleanTestData() {
  console.log('🧹 Nettoyage des anciennes données...');

  const collections = [
    'repas',
    'entrainements',
    'mesures',
    'journal',
    'coach_comments',
    'coach_diet_plans',
    'challenges',
    'badges',
    'objectifs',
  ];

  for (const collectionName of collections) {
    const snapshot = await db
      .collection(collectionName)
      .where('user_id', '==', TEST_USER_ID)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      batch.delete(doc.ref);
    });

    if (snapshot.size > 0) {
      await batch.commit();
      console.log(
        `  ✓ ${snapshot.size} documents supprimés de ${collectionName}`,
      );
    }
  }

  console.log('✅ Nettoyage terminé\n');
}

/**
 * Population des mesures (99kg -> 89kg)
 */
async function populateMesures() {
  console.log('📏 Création des mesures...');

  const TAILLE = 178; // cm
  const totalDays = Math.floor(
    (END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24),
  );

  const batch = db.batch();
  let count = 0;

  // Créer une mesure tous les 3-4 jours
  for (let i = 0; i <= totalDays; i += Math.random() > 0.5 ? 3 : 4) {
    const date = new Date(START_DATE);
    date.setDate(date.getDate() + i);

    if (date > END_DATE) break;

    // ⚠️ IMPORTANT: Timestamp à 12:00:00 (comme l'app)
    const dateAt12 = new Date(date);
    dateAt12.setHours(12, 0, 0, 0);

    const poids = calculateWeight(date);
    const imc = calculateIMC(poids, TAILLE);
    const progressRatio = i / totalDays;
    const masse_grasse = calculateBodyFat(poids, progressRatio);
    const tour_taille = Math.round(98 - 10 * progressRatio); // 98cm -> 88cm

    const mesureRef = db.collection('mesures').doc();
    batch.set(mesureRef, {
      user_id: TEST_USER_ID,
      date: Timestamp.fromDate(dateAt12), // ✅ Timestamp à 12:00:00
      poids,
      taille: TAILLE,
      imc,
      masse_grasse,
      tour_taille,
      created_at: Timestamp.fromDate(new Date()),
    });

    count++;
  }

  await batch.commit();
  console.log(`  ✓ ${count} mesures créées\n`);
}

/**
 * Population des repas
 */
async function populateRepas() {
  console.log('🍽️ Création des repas...');

  const totalDays = Math.floor(
    (END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24),
  );
  let count = 0;

  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(START_DATE);
    date.setDate(date.getDate() + i);

    if (date > END_DATE) break;

    // ⚠️ IMPORTANT: Timestamp à 12:00:00 (comme l'app)
    const dateAt12 = new Date(date);
    dateAt12.setHours(12, 0, 0, 0);

    // Choisir le régime approprié
    const diet = date < DIET_CHANGE_DATE ? OLD_DIET : NEW_DIET;

    const batch = db.batch();

    // Créer les repas pour chaque moment de la journée
    for (const [mealType, aliments] of Object.entries(diet)) {
      const repasRef = db.collection('repas').doc();

      const macros = aliments.reduce(
        (acc, aliment) => ({
          kcal: acc.kcal + aliment.calories,
          prot: acc.prot + aliment.proteines,
          glucides: acc.glucides + aliment.glucides,
          lipides: acc.lipides + aliment.lipides,
        }),
        { kcal: 0, prot: 0, glucides: 0, lipides: 0 },
      );

      const now = new Date();

      batch.set(repasRef, {
        user_id: TEST_USER_ID,
        date: Timestamp.fromDate(dateAt12), // ✅ Timestamp à 12:00:00
        repas: mealType,
        aliments: aliments.map((a, index) => {
          const quantiteNum = parseFloat(a.quantite.replace(/[^\d.]/g, ''));
          const unite = a.quantite.match(/[a-zA-Z]+/)?.[0] || 'g';

          // Calcul des macros_base (pour 100g/100ml)
          const macros_base = {
            kcal: Math.round((a.calories / quantiteNum) * 100),
            prot: Math.round((a.proteines / quantiteNum) * 100 * 10) / 10,
            glucides: Math.round((a.glucides / quantiteNum) * 100 * 10) / 10,
            lipides: Math.round((a.lipides / quantiteNum) * 100 * 10) / 10,
          };

          return {
            id: `${Date.now()}-${count}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            nom: a.nom,
            nom_lower: a.nom.toLowerCase(), // ✅ Ajouté
            quantite: quantiteNum,
            unite: unite,
            user_id: TEST_USER_ID, // ✅ Ajouté
            created_at: Timestamp.fromDate(now), // ✅ Ajouté
            macros: {
              kcal: a.calories,
              prot: a.proteines,
              glucides: a.glucides,
              lipides: a.lipides,
            },
            macros_base: macros_base, // ✅ Ajouté
            // openfoodfacts_id: undefined // Pas disponible pour test data
          };
        }),
        macros: {
          kcal: Math.round(macros.kcal),
          prot: Math.round(macros.prot * 10) / 10,
          glucides: Math.round(macros.glucides * 10) / 10,
          lipides: Math.round(macros.lipides * 10) / 10,
        },
        created_at: Timestamp.fromDate(now),
      });

      count++;
    }

    await batch.commit();
  }

  console.log(`  ✓ ${count} repas créés\n`);
}

/**
 * Population des entraînements (3-4 par semaine)
 */
async function populateEntrainements() {
  console.log('🏋️ Création des entraînements...');

  const totalDays = Math.floor(
    (END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24),
  );
  let count = 0;
  let weekTrainings = 0;
  let currentWeek = 0;

  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(START_DATE);
    date.setDate(date.getDate() + i);

    if (date > END_DATE) break;

    // ⚠️ IMPORTANT: Timestamp à 12:00:00 (comme l'app)
    const dateAt12 = new Date(date);
    dateAt12.setHours(12, 0, 0, 0);

    const week = Math.floor(i / 7);
    if (week !== currentWeek) {
      currentWeek = week;
      weekTrainings = 0;
    }

    // 3-4 entraînements par semaine
    const targetTrainings = Math.random() > 0.5 ? 3 : 4;
    const dayOfWeek = date.getDay();

    // Éviter dimanche, privilégier lundi/mercredi/vendredi/samedi
    const shouldTrain =
      weekTrainings < targetTrainings &&
      dayOfWeek !== 0 &&
      [1, 3, 5, 6].includes(dayOfWeek) &&
      Math.random() > 0.3;

    if (shouldTrain) {
      const training = TRAININGS[Math.floor(Math.random() * TRAININGS.length)];
      const trainRef = db.collection('entrainements').doc();

      const trainingData: any = {
        user_id: TEST_USER_ID,
        date: Timestamp.fromDate(dateAt12), // ✅ Timestamp à 12:00:00
        type: training.type,
        duree: training.duree,
        source: 'manuel',
        calories: training.calories,
        commentaire: `Session ${training.nom} - Bonne performance`,
        created_at: Timestamp.fromDate(new Date()),
      };

      // Ajouter distance uniquement pour le cardio
      if (training.type === 'Cardio') {
        trainingData.distance = Math.round(training.duree * 0.15 * 10) / 10;
        trainingData.vitesse_moy =
          Math.round((trainingData.distance / (training.duree / 60)) * 10) / 10;
      }

      await trainRef.set(trainingData);

      weekTrainings++;
      count++;
    }
  }

  console.log(`  ✓ ${count} entraînements créés\n`);
}

/**
 * Population du journal (humeur, énergie, sommeil, stress)
 */
async function populateJournal() {
  console.log('📓 Création des entrées de journal...');

  const totalDays = Math.floor(
    (END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24),
  );
  let count = 0;

  for (let i = 0; i <= totalDays; i += Math.random() > 0.3 ? 1 : 2) {
    const date = new Date(START_DATE);
    date.setDate(date.getDate() + i);

    if (date > END_DATE) break;

    // ⚠️ IMPORTANT: Timestamp à 12:00:00 (comme l'app)
    const dateAt12 = new Date(date);
    dateAt12.setHours(12, 0, 0, 0);

    const progressRatio = i / totalDays;

    // Progression positive : meilleure humeur et énergie au fil du temps
    const baseHumeur = 5 + Math.floor(progressRatio * 3);
    const baseEnergie = 5 + Math.floor(progressRatio * 3);

    const journalRef = db.collection('journal').doc();
    await journalRef.set({
      user_id: TEST_USER_ID,
      date: Timestamp.fromDate(dateAt12), // ✅ Timestamp à 12:00:00
      humeur: Math.min(10, baseHumeur + Math.floor(Math.random() * 2)),
      energie: Math.min(10, baseEnergie + Math.floor(Math.random() * 2)),
      sommeil: 6 + Math.floor(Math.random() * 3),
      stress: Math.max(
        1,
        5 - Math.floor(progressRatio * 2) + Math.floor(Math.random() * 2),
      ),
      note: [
        'Bonne journée, je me sens de mieux en mieux',
        "Entraînement intense aujourd'hui, fatigué mais satisfait",
        'Poids qui continue de baisser, motivation au top!',
        'Nouvelle routine alimentaire qui me convient bien',
        'Je vois les progrès dans le miroir, ça fait plaisir',
        'Sommeil un peu léger, mais forme OK',
        'Excellente session de sport, je progresse!',
      ][Math.floor(Math.random() * 7)],
      created_at: Timestamp.fromDate(new Date()),
    });

    count++;
  }

  console.log(`  ✓ ${count} entrées de journal créées\n`);
}

/**
 * Population des commentaires coach
 */
async function populateCoachComments() {
  console.log('💬 Création des commentaires coach...');

  const comments = [
    {
      module: 'diete',
      date: new Date('2024-08-15'),
      comment:
        "Excellent travail sur ton alimentation! Les flocons d'avoine et le séré sont un super combo le matin. Continue comme ça!",
    },
    {
      module: 'entrainements',
      date: new Date('2024-08-20'),
      comment:
        'Très bon rythme de 3-4 séances par semaine. Le mix cardio/musculation est parfait pour ta perte de poids. Bravo!',
    },
    {
      module: 'mesures',
      date: new Date('2024-09-01'),
      comment:
        "Super progression! -6kg en 1 mois, c'est dans la fourchette idéale (0.5-1kg/semaine). Tu es sur la bonne voie!",
    },
    {
      module: 'diete',
      date: new Date('2024-09-29'),
      comment:
        "J'aime bien l'évolution de ta diète avec plus de glucides complexes. Le pain et les pommes de terre vont t'aider à maintenir ton énergie pour les entraînements.",
    },
    {
      module: 'journal',
      date: new Date('2024-10-05'),
      comment:
        "Je vois que ton humeur et ton énergie s'améliorent! C'est normal, la perte de poids et l'activité physique ont un impact positif sur le moral. Continue!",
    },
    {
      module: 'mesures',
      date: new Date('2024-10-15'),
      comment:
        "Magnifique! -10kg en moins de 3 mois, c'est un exploit. Ta masse grasse a bien diminué aussi. Objectif presque atteint!",
    },
  ];

  const batch = db.batch();

  for (const comment of comments) {
    const commentRef = db.collection('coach_comments').doc();
    batch.set(commentRef, {
      coach_id: COACH_ID,
      athlete_id: TEST_USER_ID,
      module: comment.module,
      date: comment.date ? Timestamp.fromDate(comment.date) : null,
      comment: comment.comment,
      read_by_athlete: false,
      created_at: Timestamp.fromDate(comment.date || new Date()),
    });
  }

  await batch.commit();
  console.log(`  ✓ ${comments.length} commentaires coach créés\n`);
}

/**
 * Population du plan diète coach
 */
async function populateCoachDietPlan() {
  console.log('📋 Création du plan diète coach...');

  const dietPlanRef = db.collection('coach_diet_plans').doc();
  await dietPlanRef.set({
    coach_id: COACH_ID,
    athlete_id: TEST_USER_ID,
    date_creation: Timestamp.fromDate(new Date('2024-09-29')),
    petit_dej:
      'Pain complet 50g + beurre 10g + confiture 20g - Bon équilibre glucides/lipides pour démarrer la journée',
    collation_matin:
      'Viande séchée 50g - Protéines de qualité, pratique à transporter',
    dejeuner:
      'Viande/poisson 140g + légumes à volonté - Augmentation des portions protéiques pour la satiété',
    collation_apres_midi:
      'Oléagineux 30g (amandes, noix) - Bonnes graisses + satiété',
    diner:
      'Pommes de terre 200g + viande/poisson 120g + légumes - Réintroduction des glucides complexes le soir',
    collation_soir:
      'Chocolat noir 70% (4 carrés) - Petit plaisir contrôlé, bon pour le moral',
    notes_generales:
      "Plan adapté après 2 mois de diète stricte. Réintroduction progressive des glucides complexes (pain, pommes de terre) pour maintenir l'énergie et éviter l'effet yo-yo. Maintien d'un déficit calorique modéré (~300-400 kcal) pour continuer la perte de poids de manière durable. Excellent travail jusqu'ici, -8kg en 2 mois!",
    created_at: Timestamp.fromDate(new Date('2024-09-29')),
  });

  console.log(`  ✓ Plan diète coach créé\n`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Début de la population des données de test\n');
  console.log('📊 Transformation : 99kg (31.07.2024) -> 89kg (20.10.2024)');
  console.log('⏱️  Durée : 81 jours');
  console.log('📉 Perte : -10kg (-12.4%)');
  console.log('🎯 Rythme : ~0.88kg/semaine\n');

  try {
    // 1. Nettoyage
    await cleanTestData();

    // 2. Mesures (progression poids)
    await populateMesures();

    // 3. Repas (ancien + nouveau régime)
    await populateRepas();

    // 4. Entraînements (3-4/semaine)
    await populateEntrainements();

    // 5. Journal (humeur, énergie)
    await populateJournal();

    // 6. Commentaires coach
    await populateCoachComments();

    // 7. Plan diète coach
    await populateCoachDietPlan();

    console.log('✅ Population terminée avec succès!');
    console.log('\n📈 Récapitulatif des données créées:');
    console.log('  • ~27 mesures (tous les 3-4 jours)');
    console.log('  • ~486 repas (6 repas/jour pendant 81 jours)');
    console.log('  • ~40 entraînements (3-4/semaine)');
    console.log('  • ~60 entrées de journal');
    console.log('  • 6 commentaires coach');
    console.log('  • 1 plan diète coach');
  } catch (error) {
    console.error('❌ Erreur lors de la population:', error);
    process.exit(1);
  }
}

// Exécution
main()
  .then(() => {
    console.log('\n✨ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
