const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp, getDocs, query, where } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

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

// Données des utilisateurs de test
const testUsers = [
  // COACHS
  {
    email: 'coach.martin@supernovafit.com',
    password: 'Coach123!',
    role: 'coach',
    nom: 'Thomas Martin',
    age: 35,
    sexe: 'M',
    taille: 178,
    poids_initial: 75,
    objectif: 'performance',
    niveau_activite: 'intense',
    unite_poids: 'kg',
    unite_taille: 'cm',
    langue: 'fr',
    profil_complete: true
  },
  {
    email: 'coach.sophie@supernovafit.com',
    password: 'Coach123!',
    role: 'coach',
    nom: 'Sophie Dubois',
    age: 28,
    sexe: 'F',
    taille: 165,
    poids_initial: 58,
    objectif: 'performance',
    niveau_activite: 'intense',
    unite_poids: 'kg',
    unite_taille: 'cm',
    langue: 'fr',
    profil_complete: true
  },
  {
    email: 'coach.alex@supernovafit.com',
    password: 'Coach123!',
    role: 'coach',
    nom: 'Alexandre Moreau',
    age: 42,
    sexe: 'M',
    taille: 182,
    poids_initial: 80,
    objectif: 'performance',
    niveau_activite: 'intense',
    unite_poids: 'kg',
    unite_taille: 'cm',
    langue: 'fr',
    profil_complete: true
  },

  // ATHLÈTES
  {
    email: 'athlete.lucas@supernovafit.com',
    password: 'Athlete123!',
    role: 'sportif',
    nom: 'Lucas Bernard',
    age: 24,
    sexe: 'M',
    taille: 175,
    poids_initial: 68,
    objectif: 'prise_masse',
    niveau_activite: 'modere',
    unite_poids: 'kg',
    unite_taille: 'cm',
    langue: 'fr',
    profil_complete: true,
    ownerCoachId: null
  },
  {
    email: 'athlete.emma@supernovafit.com',
    password: 'Athlete123!',
    role: 'sportif',
    nom: 'Emma Rousseau',
    age: 26,
    sexe: 'F',
    taille: 162,
    poids_initial: 55,
    objectif: 'seche',
    niveau_activite: 'modere',
    unite_poids: 'kg',
    unite_taille: 'cm',
    langue: 'fr',
    profil_complete: true,
    ownerCoachId: null
  },
  {
    email: 'athlete.maxime@supernovafit.com',
    password: 'Athlete123!',
    role: 'sportif',
    nom: 'Maxime Leroy',
    age: 31,
    sexe: 'M',
    taille: 180,
    poids_initial: 85,
    objectif: 'maintien',
    niveau_activite: 'leger',
    unite_poids: 'kg',
    unite_taille: 'cm',
    langue: 'fr',
    profil_complete: true,
    ownerCoachId: null
  },
  {
    email: 'athlete.julie@supernovafit.com',
    password: 'Athlete123!',
    role: 'sportif',
    nom: 'Julie Mercier',
    age: 29,
    sexe: 'F',
    taille: 168,
    poids_initial: 62,
    objectif: 'performance',
    niveau_activite: 'intense',
    unite_poids: 'kg',
    unite_taille: 'cm',
    langue: 'fr',
    profil_complete: true,
    ownerCoachId: null
  },
  {
    email: 'athlete.antoine@supernovafit.com',
    password: 'Athlete123!',
    role: 'sportif',
    nom: 'Antoine Petit',
    age: 22,
    sexe: 'M',
    taille: 172,
    poids_initial: 70,
    objectif: 'prise_masse',
    niveau_activite: 'modere',
    unite_poids: 'kg',
    unite_taille: 'cm',
    langue: 'fr',
    profil_complete: true,
    ownerCoachId: null
  }
];

// Données de test pour les repas
const alimentsTest = [
  { nom: 'Flocons d\'avoine', quantite: 60, unite: 'g', macros: { kcal: 228, prot: 8, glucides: 39, lipides: 4 } },
  { nom: 'Banane', quantite: 120, unite: 'g', macros: { kcal: 105, prot: 1, glucides: 27, lipides: 0 } },
  { nom: 'Lait demi-écrémé', quantite: 200, unite: 'ml', macros: { kcal: 96, prot: 7, glucides: 9, lipides: 3 } },
  { nom: 'Poulet blanc', quantite: 150, unite: 'g', macros: { kcal: 165, prot: 31, glucides: 0, lipides: 3 } },
  { nom: 'Riz basmati', quantite: 100, unite: 'g', macros: { kcal: 130, prot: 3, glucides: 28, lipides: 0 } },
  { nom: 'Brocoli', quantite: 200, unite: 'g', macros: { kcal: 68, prot: 6, glucides: 12, lipides: 1 } },
  { nom: 'Yaourt grec', quantite: 125, unite: 'g', macros: { kcal: 130, prot: 15, glucides: 8, lipides: 5 } },
  { nom: 'Amandes', quantite: 30, unite: 'g', macros: { kcal: 174, prot: 6, glucides: 6, lipides: 15 } },
  { nom: 'Saumon', quantite: 120, unite: 'g', macros: { kcal: 208, prot: 25, glucides: 0, lipides: 12 } },
  { nom: 'Quinoa', quantite: 80, unite: 'g', macros: { kcal: 120, prot: 4, glucides: 22, lipides: 2 } }
];

// Types d'entraînements
const typesEntrainements = [
  { type: 'cardio', nom: 'Course à pied', duree: 45, calories: 400, fc_moyenne: 150, distance: 8, vitesse_moy: 10.7 },
  { type: 'musculation', nom: 'Musculation haut du corps', duree: 60, calories: 300, effort_percu: 7 },
  { type: 'cardio', nom: 'Vélo', duree: 90, calories: 600, fc_moyenne: 140, distance: 25, vitesse_moy: 16.7 },
  { type: 'musculation', nom: 'Musculation bas du corps', duree: 45, calories: 250, effort_percu: 8 },
  { type: 'cardio', nom: 'Natation', duree: 30, calories: 300, fc_moyenne: 130, distance: 1.5, vitesse_moy: 3 }
];

// Fonction pour générer une date aléatoire dans les 30 derniers jours
function getRandomDate() {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// Fonction pour créer un utilisateur
async function createUser(userData) {
  try {
    console.log(`Création de l'utilisateur: ${userData.nom} (${userData.email})`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const uid = userCredential.user.uid;
    
    const userProfile = {
      id: uid,
      role: userData.role,
      nom: userData.nom,
      email: userData.email,
      date_invitation: serverTimestamp(),
      dernier_acces: serverTimestamp(),
      age: userData.age,
      sexe: userData.sexe,
      taille: userData.taille,
      poids_initial: userData.poids_initial,
      objectif: userData.objectif,
      niveau_activite: userData.niveau_activite,
      unite_poids: userData.unite_poids,
      unite_taille: userData.unite_taille,
      langue: userData.langue,
      profil_complete: userData.profil_complete,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      ownerCoachId: userData.ownerCoachId || null
    };
    
    await setDoc(doc(db, 'users', uid), userProfile);
    console.log(`✅ Utilisateur créé: ${userData.nom} (UID: ${uid})`);
    return { uid, ...userData };
    
  } catch (error) {
    console.error(`❌ Erreur création ${userData.nom}:`, error.message);
    return null;
  }
}

// Fonction pour créer des données de test pour un utilisateur
async function createUserTestData(userId, userProfile) {
  console.log(`📊 Création des données pour ${userProfile.nom}...`);
  
  // Repas
  const repasTypes = ['petit_dej', 'collation_matin', 'dejeuner', 'collation_apres_midi', 'diner', 'collation_soir'];
  for (let i = 0; i < 15; i++) { // 15 jours de repas
    const date = getRandomDate();
    
    for (const repasType of repasTypes) {
      const aliments = [];
      let totalMacros = { kcal: 0, prot: 0, glucides: 0, lipides: 0 };
      
      const nbAliments = repasType.includes('collation') ? 2 : 3;
      
      for (let j = 0; j < nbAliments; j++) {
        const aliment = alimentsTest[Math.floor(Math.random() * alimentsTest.length)];
        const quantite = aliment.quantite * (0.8 + Math.random() * 0.4);
        
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
  
  // Entraînements
  for (let i = 0; i < 10; i++) { // 10 entraînements
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
  
  // Mesures
  for (let i = 0; i < 8; i++) { // 8 mesures
    const date = getRandomDate();
    const evolution = (Math.random() - 0.5) * 2;
    const poids = Math.round((userProfile.poids_initial + evolution) * 10) / 10;
    
    const mesure = {
      user_id: userId,
      date: date,
      poids: poids,
      taille: userProfile.taille,
      imc: Math.round((poids / Math.pow(userProfile.taille / 100, 2)) * 10) / 10,
      masse_grasse: Math.round((15 + Math.random() * 10) * 10) / 10,
      masse_musculaire: Math.round((40 + Math.random() * 10) * 10) / 10,
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
  
  // Journal
  for (let i = 0; i < 20; i++) { // 20 entrées
    const date = getRandomDate();
    
    const entry = {
      user_id: userId,
      date: date,
      note: `Journée ${i + 1} - ${Math.random() > 0.5 ? 'Bonne journée d\'entraînement' : 'Journée de récupération'}`,
      humeur: Math.floor(Math.random() * 5) + 6,
      fatigue: Math.floor(Math.random() * 5) + 3,
      motivation: Math.floor(Math.random() * 5) + 6,
      energie: Math.floor(Math.random() * 5) + 5,
      sommeil_duree: Math.round((7 + Math.random() * 2) * 10) / 10,
      sommeil_qualite: Math.floor(Math.random() * 5) + 5,
      stress: Math.floor(Math.random() * 5) + 3,
      meteo: ['soleil', 'nuage', 'pluie'][Math.floor(Math.random() * 3)],
      activites_annexes: Math.random() > 0.7 ? ['marche', 'jardinage'][Math.floor(Math.random() * 2)] : [],
      created_at: serverTimestamp()
    };
    
    await addDoc(collection(db, 'journal'), entry);
  }
  
  console.log(`✅ Données créées pour ${userProfile.nom}`);
}

// Fonction pour créer des commentaires de coach
async function createCoachComments(coachId, athleteId, athleteName) {
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
  
  for (let i = 0; i < 6; i++) { // 6 commentaires
    const commentaire = {
      coach_id: coachId,
      athlete_id: athleteId,
      module: modules[Math.floor(Math.random() * modules.length)],
      date: getRandomDate(),
      comment: commentaires[Math.floor(Math.random() * commentaires.length)],
      read_by_athlete: Math.random() > 0.3,
      created_at: serverTimestamp()
    };
    
    await addDoc(collection(db, 'coach_comments'), commentaire);
  }
  
  console.log(`✅ Commentaires coach créés pour ${athleteName}`);
}

// Fonction principale
async function setupTestEnvironment() {
  console.log('🚀 Configuration de l\'environnement de test SuperNovaFit...\n');
  
  const createdUsers = [];
  const coachIds = [];
  
  // Étape 1: Créer les coachs
  console.log('📋 ÉTAPE 1: Création des coachs...');
  for (const userData of testUsers) {
    if (userData.role === 'coach') {
      const result = await createUser(userData);
      if (result) {
        createdUsers.push(result);
        coachIds.push(result.uid);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Étape 2: Créer les athlètes et les lier aux coachs
  console.log('\n🏃 ÉTAPE 2: Création des athlètes...');
  let coachIndex = 0;
  
  for (const userData of testUsers) {
    if (userData.role === 'sportif') {
      userData.ownerCoachId = coachIds[coachIndex % coachIds.length];
      coachIndex++;
      
      const result = await createUser(userData);
      if (result) {
        createdUsers.push(result);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Étape 3: Créer les données de test
  console.log('\n📊 ÉTAPE 3: Création des données de test...');
  
  const athletes = createdUsers.filter(u => u.role === 'sportif');
  const coaches = createdUsers.filter(u => u.role === 'coach');
  
  for (let i = 0; i < athletes.length; i++) {
    const athlete = athletes[i];
    const coach = coaches[i % coaches.length];
    
    console.log(`\n📈 Création des données pour ${athlete.nom}...`);
    
    await createUserTestData(athlete.uid, athlete);
    await createCoachComments(coach.uid, athlete.uid, athlete.nom);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Résumé final
  console.log('\n🎉 ENVIRONNEMENT DE TEST CONFIGURÉ AVEC SUCCÈS !');
  console.log('\n📊 RÉSUMÉ FINAL:');
  console.log(`✅ ${createdUsers.length} utilisateurs créés`);
  console.log(`👨‍💼 ${coaches.length} coachs`);
  console.log(`🏃 ${athletes.length} athlètes`);
  
  console.log('\n👥 UTILISATEURS CRÉÉS:');
  coaches.forEach(coach => {
    console.log(`   👨‍💼 ${coach.nom} (${coach.email}) - Mot de passe: Coach123!`);
  });
  
  athletes.forEach(athlete => {
    const coach = coaches.find(c => c.uid === athlete.ownerCoachId);
    console.log(`   🏃 ${athlete.nom} (${athlete.email}) → Coach: ${coach?.nom} - Mot de passe: Athlete123!`);
  });
  
  console.log('\n📈 DONNÉES CRÉÉES PAR ATHLÈTE:');
  console.log('   • 15 jours de repas complets');
  console.log('   • 10 entraînements variés');
  console.log('   • 8 mesures de progression');
  console.log('   • 20 entrées de journal');
  console.log('   • 6 commentaires de coach');
  
  console.log('\n🌐 CONNEXION:');
  console.log('   URL: https://supernovafit-a6fe7.web.app');
  console.log('   Utilisez les emails et mots de passe ci-dessus pour vous connecter');
  
  console.log('\n✨ L\'environnement de test est prêt !');
}

// Exécuter le script
setupTestEnvironment().catch(console.error);
