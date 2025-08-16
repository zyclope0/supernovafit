const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

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
    ownerCoachId: null // Sera mis à jour après création des coachs
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

// Fonction pour créer un utilisateur
async function createUser(userData) {
  try {
    console.log(`Création de l'utilisateur: ${userData.nom} (${userData.email})`);
    
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const uid = userCredential.user.uid;
    
    // Créer le profil utilisateur dans Firestore
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
    
    console.log(`✅ Utilisateur créé avec succès: ${userData.nom} (UID: ${uid})`);
    return { uid, ...userData };
    
  } catch (error) {
    console.error(`❌ Erreur lors de la création de ${userData.nom}:`, error.message);
    return null;
  }
}

// Fonction principale
async function createAllTestUsers() {
  console.log('🚀 Début de la création des utilisateurs de test...\n');
  
  const createdUsers = [];
  const coachIds = [];
  
  // Créer d'abord les coachs
  console.log('📋 Création des coachs...');
  for (const userData of testUsers) {
    if (userData.role === 'coach') {
      const result = await createUser(userData);
      if (result) {
        createdUsers.push(result);
        coachIds.push(result.uid);
      }
      // Pause entre les créations pour éviter les rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Créer les athlètes et les lier aux coachs
  console.log('\n🏃 Création des athlètes...');
  let coachIndex = 0;
  
  for (const userData of testUsers) {
    if (userData.role === 'sportif') {
      // Lier l'athlète à un coach (rotation)
      userData.ownerCoachId = coachIds[coachIndex % coachIds.length];
      coachIndex++;
      
      const result = await createUser(userData);
      if (result) {
        createdUsers.push(result);
      }
      // Pause entre les créations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Résumé
  console.log('\n📊 RÉSUMÉ DE LA CRÉATION:');
  console.log(`✅ ${createdUsers.length} utilisateurs créés avec succès`);
  
  const coaches = createdUsers.filter(u => u.role === 'coach');
  const athletes = createdUsers.filter(u => u.role === 'sportif');
  
  console.log(`👨‍💼 Coachs: ${coaches.length}`);
  coaches.forEach(coach => {
    console.log(`   - ${coach.nom} (${coach.email})`);
  });
  
  console.log(`🏃 Athlètes: ${athletes.length}`);
  athletes.forEach(athlete => {
    const coach = coaches.find(c => c.uid === athlete.ownerCoachId);
    console.log(`   - ${athlete.nom} (${athlete.email}) → Coach: ${coach?.nom || 'Aucun'}`);
  });
  
  console.log('\n🎉 Création terminée !');
  console.log('\n📝 INFORMATIONS DE CONNEXION:');
  console.log('Tous les utilisateurs utilisent le mot de passe: Athlete123! (athlètes) ou Coach123! (coachs)');
}

// Exécuter le script
createAllTestUsers().catch(console.error);
