const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Configuration Firebase - SuperNovaFit (clés publiques)
const firebaseConfig = {
  apiKey: "AIzaSyBe176JrNl_R0NmUAFkhCISThnFUUgt8U4",
  authDomain: "supernovafit-a6fe7.firebaseapp.com",
  projectId: "supernovafit-a6fe7",
  storageBucket: "supernovafit-a6fe7.firebasestorage.app",
  messagingSenderId: "261698689691",
  appId: "1:261698689691:web:edc7a7135d94a8250c443e",
  measurementId: "G-RV0RK8JWN4"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Données de test pour les repas
const alimentsTest = [
  // Petit déjeuner
  { nom: 'Flocons d\'avoine', quantite: 60, unite: 'g', macros: { kcal: 228, prot: 8, glucides: 39, lipides: 4 } },
  { nom: 'Banane', quantite: 120, unite: 'g', macros: { kcal: 105, prot: 1, glucides: 27, lipides: 0 } },
  { nom: 'Lait demi-écrémé', quantite: 200, unite: 'ml', macros: { kcal: 96, prot: 7, glucides: 9, lipides: 3 } },
  { nom: 'Miel', quantite: 15, unite: 'g', macros: { kcal: 45, prot: 0, glucides: 12, lipides: 0 } },
  
  // Déjeuner
  { nom: 'Poulet blanc', quantite: 150, unite: 'g', macros: { kcal: 165, prot: 31, glucides: 0, lipides: 3 } },
  { nom: 'Riz basmati', quantite: 100, unite: 'g', macros: { kcal: 130, prot: 3, glucides: 28, lipides: 0 } },
  { nom: 'Brocoli', quantite: 200, unite: 'g', macros: { kcal: 68, prot: 6, glucides: 12, lipides: 1 } },
  { nom: 'Huile d\'olive', quantite: 10, unite: 'ml', macros: { kcal: 90, prot: 0, glucides: 0, lipides: 10 } },
  
  // Collations
  { nom: 'Yaourt grec', quantite: 125, unite: 'g', macros: { kcal: 130, prot: 15, glucides: 8, lipides: 5 } },
  { nom: 'Amandes', quantite: 30, unite: 'g', macros: { kcal: 174, prot: 6, glucides: 6, lipides: 15 } },
  { nom: 'Pomme', quantite: 150, unite: 'g', macros: { kcal: 78, prot: 0, glucides: 21, lipides: 0 } },
  
  // Dîner
  { nom: 'Saumon', quantite: 120, unite: 'g', macros: { kcal: 208, prot: 25, glucides: 0, lipides: 12 } },
  { nom: 'Quinoa', quantite: 80, unite: 'g', macros: { kcal: 120, prot: 4, glucides: 22, lipides: 2 } },
  { nom: 'Épinards', quantite: 100, unite: 'g', macros: { kcal: 23, prot: 3, glucides: 4, lipides: 0 } },
  { nom: 'Avocat', quantite: 50, unite: 'g', macros: { kcal: 80, prot: 1, glucides: 4, lipides: 7 } }
];

// Types d'entraînements
const typesEntrainements = [
  { type: 'cardio', nom: 'Course à pied', duree: 45, calories: 400, fc_moyenne: 150, distance: 8, vitesse_moy: 10.7 },
  { type: 'musculation', nom: 'Musculation haut du corps', duree: 60, calories: 300, effort_percu: 7 },
  { type: 'cardio', nom: 'Vélo', duree: 90, calories: 600, fc_moyenne: 140, distance: 25, vitesse_moy: 16.7 },
  { type: 'musculation', nom: 'Musculation bas du corps', duree: 45, calories: 250, effort_percu: 8 },
  { type: 'cardio', nom: 'Natation', duree: 30, calories: 300, fc_moyenne: 130, distance: 1.5, vitesse_moy: 3 },
  { type: 'yoga', nom: 'Yoga', duree: 60, calories: 150, effort_percu: 4 },
  { type: 'cardio', nom: 'HIIT', duree: 25, calories: 350, fc_moyenne: 170, effort_percu: 9 }
];

// Fonction pour générer une date aléatoire dans les 30 derniers jours
function getRandomDate() {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// Fonction pour générer des repas de test
async function createTestMeals(userId) {
  console.log(`🍽️ Création des repas pour l'utilisateur ${userId}...`);
  
  const repasTypes = ['petit_dej', 'collation_matin', 'dejeuner', 'collation_apres_midi', 'diner', 'collation_soir'];
  
  for (let i = 0; i < 20; i++) { // 20 jours de repas
    const date = getRandomDate();
    
    for (const repasType of repasTypes) {
      const aliments = [];
      let totalMacros = { kcal: 0, prot: 0, glucides: 0, lipides: 0 };
      
      // Sélectionner 2-4 aliments selon le type de repas
      const nbAliments = repasType.includes('collation') ? 2 : 4;
      const alimentsSelectionnes = [];
      
      for (let j = 0; j < nbAliments; j++) {
        const aliment = alimentsTest[Math.floor(Math.random() * alimentsTest.length)];
        const quantite = aliment.quantite * (0.8 + Math.random() * 0.4); // Variation ±20%
        
        const alimentRepas = {
          id: `aliment_${Date.now()}_${j}`,
          nom: aliment.nom,
          quantite: Math.round(quantite),
          unite: aliment.unite,
          macros: {
            kcal: Math.round(aliment.macros.kcal * quantite / aliment.quantite),
            prot: Math.round(aliment.macros.prot * quantite / aliment.quantite * 10) / 10,
            glucides: Math.round(aliment.macros.glucides * quantite / aliment.quantite * 10) / 10,
            lipides: Math.round(aliment.macros.lipides * quantite / aliment.quantite * 10) / 10
          }
        };
        
        aliments.push(alimentRepas);
        totalMacros.kcal += alimentRepas.macros.kcal;
        totalMacros.prot += alimentRepas.macros.prot;
        totalMacros.glucides += alimentRepas.macros.glucides;
        totalMacros.lipides += alimentRepas.macros.lipides;
      }
      
      const repas = {
        user_id: userId,
        date: date,
        repas: repasType,
        aliments: aliments,
        macros: {
          kcal: Math.round(totalMacros.kcal),
          prot: Math.round(totalMacros.prot * 10) / 10,
          glucides: Math.round(totalMacros.glucides * 10) / 10,
          lipides: Math.round(totalMacros.lipides * 10) / 10
        },
        created_at: serverTimestamp()
      };
      
      await addDoc(collection(db, 'repas'), repas);
    }
  }
  
  console.log(`✅ Repas créés pour l'utilisateur ${userId}`);
}

// Fonction pour générer des entraînements de test
async function createTestTrainings(userId) {
  console.log(`💪 Création des entraînements pour l'utilisateur ${userId}...`);
  
  for (let i = 0; i < 15; i++) { // 15 entraînements
    const entrainement = typesEntrainements[Math.floor(Math.random() * typesEntrainements.length)];
    const date = getRandomDate();
    
    const trainingData = {
      user_id: userId,
      date: date,
      type: entrainement.type,
      duree: entrainement.duree,
      calories: entrainement.calories,
      commentaire: `${entrainement.nom} - Séance ${i + 1}`,
      source: 'manuel',
      fc_moyenne: entrainement.fc_moyenne,
      fc_max: entrainement.fc_moyenne + Math.floor(Math.random() * 20),
      fc_min: entrainement.fc_moyenne - Math.floor(Math.random() * 20),
      distance: entrainement.distance,
      vitesse_moy: entrainement.vitesse_moy,
      effort_percu: entrainement.effort_percu,
      fatigue_avant: Math.floor(Math.random() * 5) + 3,
      fatigue_apres: Math.floor(Math.random() * 5) + 5,
      created_at: serverTimestamp()
    };
    
    await addDoc(collection(db, 'entrainements'), trainingData);
  }
  
  console.log(`✅ Entraînements créés pour l'utilisateur ${userId}`);
}

// Fonction pour générer des mesures de test
async function createTestMeasurements(userId) {
  console.log(`📏 Création des mesures pour l'utilisateur ${userId}...`);
  
  // Récupérer le profil utilisateur pour avoir le poids initial
  // Pour simplifier, on utilise des valeurs par défaut
  let poidsInitial = 70;
  let taille = 175;
  
  for (let i = 0; i < 10; i++) { // 10 mesures sur 30 jours
    const date = getRandomDate();
    const evolution = (Math.random() - 0.5) * 2; // ±1kg
    const poids = Math.round((poidsInitial + evolution) * 10) / 10;
    
    const mesure = {
      user_id: userId,
      date: date,
      poids: poids,
      taille: taille,
      imc: Math.round((poids / Math.pow(taille / 100, 2)) * 10) / 10,
      masse_grasse: Math.round((15 + Math.random() * 10) * 10) / 10, // 15-25%
      masse_musculaire: Math.round((40 + Math.random() * 10) * 10) / 10, // 40-50%
      tour_taille: Math.round(75 + Math.random() * 10),
      tour_hanches: Math.round(95 + Math.random() * 10),
      tour_bras: Math.round(30 + Math.random() * 5),
      tour_cuisses: Math.round(55 + Math.random() * 8),
      tour_cou: Math.round(35 + Math.random() * 3),
      tour_poitrine: Math.round(95 + Math.random() * 10),
      commentaire: `Mesure du ${date}`,
      created_at: serverTimestamp()
    };
    
    await addDoc(collection(db, 'mesures'), mesure);
  }
  
  console.log(`✅ Mesures créées pour l'utilisateur ${userId}`);
}

// Fonction pour générer des entrées de journal de test
async function createTestJournalEntries(userId) {
  console.log(`📝 Création des entrées de journal pour l'utilisateur ${userId}...`);
  
  for (let i = 0; i < 25; i++) { // 25 entrées sur 30 jours
    const date = getRandomDate();
    
    const entry = {
      user_id: userId,
      date: date,
      note: `Journée ${i + 1} - ${Math.random() > 0.5 ? 'Bonne journée d\'entraînement' : 'Journée de récupération'}`,
      humeur: Math.floor(Math.random() * 5) + 6, // 6-10
      fatigue: Math.floor(Math.random() * 5) + 3, // 3-7
      motivation: Math.floor(Math.random() * 5) + 6, // 6-10
      energie: Math.floor(Math.random() * 5) + 5, // 5-9
      sommeil_duree: Math.round((7 + Math.random() * 2) * 10) / 10, // 7-9h
      sommeil_qualite: Math.floor(Math.random() * 5) + 5, // 5-9
      stress: Math.floor(Math.random() * 5) + 3, // 3-7
      meteo: ['soleil', 'nuage', 'pluie'][Math.floor(Math.random() * 3)],
      activites_annexes: Math.random() > 0.7 ? ['marche', 'jardinage'][Math.floor(Math.random() * 2)] : [],
      created_at: serverTimestamp()
    };
    
    await addDoc(collection(db, 'journal'), entry);
  }
  
  console.log(`✅ Entrées de journal créées pour l'utilisateur ${userId}`);
}

// Fonction pour créer des commentaires de coach
async function createTestCoachComments(coachId, athleteId) {
  console.log(`💬 Création des commentaires coach pour l'athlète ${athleteId}...`);
  
  const modules = ['diete', 'entrainements', 'journal', 'mesures'];
  const commentaires = [
    'Excellent travail cette semaine ! Continue comme ça.',
    'Attention à bien respecter les portions recommandées.',
    'Tes entraînements sont de plus en plus réguliers, bravo !',
    'N\'oublie pas de bien t\'hydrater pendant tes séances.',
    'Tes mesures montrent une belle progression.',
    'Pense à bien récupérer entre les séances.',
    'Ton journal montre une bonne régularité, continue !'
  ];
  
  for (let i = 0; i < 8; i++) { // 8 commentaires
    const commentaire = {
      coach_id: coachId,
      athlete_id: athleteId,
      module: modules[Math.floor(Math.random() * modules.length)],
      date: getRandomDate(),
      comment: commentaires[Math.floor(Math.random() * commentaires.length)],
      read_by_athlete: Math.random() > 0.3, // 70% lus
      created_at: serverTimestamp()
    };
    
    await addDoc(collection(db, 'coach_comments'), commentaire);
  }
  
  console.log(`✅ Commentaires coach créés pour l'athlète ${athleteId}`);
}

// Fonction principale
async function createAllTestData() {
  console.log('🚀 Début de la création des données de test...\n');
  
  // Se connecter avec un compte coach pour avoir les permissions
  try {
    await signInWithEmailAndPassword(auth, 'coach.martin@supernovafit.com', 'Coach123!');
    console.log('✅ Connecté en tant que coach Martin\n');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return;
  }
  
  // IDs des utilisateurs de test (à récupérer depuis la base)
  const testUserIds = [
    'athlete.lucas@supernovafit.com',
    'athlete.emma@supernovafit.com', 
    'athlete.maxime@supernovafit.com',
    'athlete.julie@supernovafit.com',
    'athlete.antoine@supernovafit.com'
  ];
  
  const coachIds = [
    'coach.martin@supernovafit.com',
    'coach.sophie@supernovafit.com',
    'coach.alex@supernovafit.com'
  ];
  
  // Pour chaque athlète, créer des données de test
  for (let i = 0; i < testUserIds.length; i++) {
    const athleteEmail = testUserIds[i];
    const coachEmail = coachIds[i % coachIds.length];
    
    console.log(`\n📊 Création des données pour ${athleteEmail}...`);
    
    // Note: Dans un vrai script, il faudrait récupérer les UIDs depuis Firestore
    // Pour simplifier, on utilise les emails comme IDs
    const athleteId = athleteEmail;
    const coachId = coachEmail;
    
    await createTestMeals(athleteId);
    await createTestTrainings(athleteId);
    await createTestMeasurements(athleteId);
    await createTestJournalEntries(athleteId);
    await createTestCoachComments(coachId, athleteId);
    
    // Pause entre les utilisateurs
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 Création des données de test terminée !');
  console.log('\n📊 RÉSUMÉ:');
  console.log('- 5 athlètes avec données complètes');
  console.log('- 20 jours de repas par athlète');
  console.log('- 15 entraînements par athlète');
  console.log('- 10 mesures par athlète');
  console.log('- 25 entrées de journal par athlète');
  console.log('- 8 commentaires coach par athlète');
}

// Exécuter le script
createAllTestData().catch(console.error);
