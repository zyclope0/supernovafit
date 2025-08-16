const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, collection, addDoc, serverTimestamp } = require('firebase/firestore');
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

// UIDs des utilisateurs créés (récupérés du script précédent)
const testUsers = [
  // COACHS
  {
    uid: 'hTcmfxj5hLSeGeuUfi0Des7W4WM2',
    email: 'coach.martin@supernovafit.com',
    nom: 'Thomas Martin',
    role: 'coach'
  },
  {
    uid: 'CSx3BAP5nWRapJMsl1OwcHUTwmo1',
    email: 'coach.sophie@supernovafit.com',
    nom: 'Sophie Dubois',
    role: 'coach'
  },
  {
    uid: 'ZiytJg8OdHTd2UBCJSbDfzQklGt1',
    email: 'coach.alex@supernovafit.com',
    nom: 'Alexandre Moreau',
    role: 'coach'
  },

  // ATHLÈTES
  {
    uid: 'tZp61RK0IgOYBfYNPF03LtCu9L52',
    email: 'athlete.lucas@supernovafit.com',
    nom: 'Lucas Bernard',
    role: 'sportif',
    ownerCoachId: 'hTcmfxj5hLSeGeuUfi0Des7W4WM2'
  },
  {
    uid: '3SAGAqDW44PXZ1cD7hYx1QPaocH2',
    email: 'athlete.emma@supernovafit.com',
    nom: 'Emma Rousseau',
    role: 'sportif',
    ownerCoachId: 'CSx3BAP5nWRapJMsl1OwcHUTwmo1'
  },
  {
    uid: 'tPQUhE7OhgS10FhPcmlj0girOxw2',
    email: 'athlete.maxime@supernovafit.com',
    nom: 'Maxime Leroy',
    role: 'sportif',
    ownerCoachId: 'ZiytJg8OdHTd2UBCJSbDfzQklGt1'
  },
  {
    uid: '5e8kVN3OrbPDA8hQIjJghWScwEe2',
    email: 'athlete.julie@supernovafit.com',
    nom: 'Julie Mercier',
    role: 'sportif',
    ownerCoachId: 'hTcmfxj5hLSeGeuUfi0Des7W4WM2'
  },
  {
    uid: 'FFrHQw0V85gsuchVQycjHimfK6T2',
    email: 'athlete.antoine@supernovafit.com',
    nom: 'Antoine Petit',
    role: 'sportif',
    ownerCoachId: 'CSx3BAP5nWRapJMsl1OwcHUTwmo1'
  }
];

// Fonction pour mettre à jour les profils utilisateurs
async function updateUserProfiles() {
  console.log('🔄 Mise à jour des profils utilisateurs...\n');
  
  for (const user of testUsers) {
    try {
      console.log(`Mise à jour du profil: ${user.nom}`);
      
      const updateData = {
        updated_at: serverTimestamp(),
        dernier_acces: serverTimestamp()
      };
      
      // Ajouter ownerCoachId pour les athlètes
      if (user.ownerCoachId) {
        updateData.ownerCoachId = user.ownerCoachId;
      }
      
      await updateDoc(doc(db, 'users', user.uid), updateData);
      console.log(`✅ Profil mis à jour: ${user.nom}`);
      
    } catch (error) {
      console.error(`❌ Erreur mise à jour ${user.nom}:`, error.message);
    }
  }
}

// Fonction pour créer quelques données de test simples
async function createSimpleTestData() {
  console.log('\n📊 Création de quelques données de test simples...\n');
  
  const athletes = testUsers.filter(u => u.role === 'sportif');
  
  for (const athlete of athletes) {
    try {
      console.log(`Création de données pour ${athlete.nom}...`);
      
      // Créer un repas de test
      const repas = {
        user_id: athlete.uid,
        date: new Date().toISOString().split('T')[0],
        repas: 'dejeuner',
        aliments: [
          {
            id: `aliment_${Date.now()}_1`,
            nom: 'Poulet blanc',
            quantite: 150,
            unite: 'g',
            macros: { kcal: 165, prot: 31, glucides: 0, lipides: 3 }
          },
          {
            id: `aliment_${Date.now()}_2`,
            nom: 'Riz basmati',
            quantite: 100,
            unite: 'g',
            macros: { kcal: 130, prot: 3, glucides: 28, lipides: 0 }
          }
        ],
        macros: { kcal: 295, prot: 34, glucides: 28, lipides: 3 },
        created_at: serverTimestamp()
      };
      
      await addDoc(collection(db, 'repas'), repas);
      console.log(`✅ Repas créé pour ${athlete.nom}`);
      
      // Créer un entraînement de test
      const entrainement = {
        user_id: athlete.uid,
        date: new Date().toISOString().split('T')[0],
        type: 'cardio',
        duree: 45,
        calories: 400,
        commentaire: 'Course à pied - Test',
        source: 'manuel',
        fc_moyenne: 150,
        fc_max: 170,
        fc_min: 130,
        distance: 8,
        vitesse_moy: 10.7,
        effort_percu: 7,
        fatigue_avant: 5,
        fatigue_apres: 7,
        created_at: serverTimestamp()
      };
      
      await addDoc(collection(db, 'entrainements'), entrainement);
      console.log(`✅ Entraînement créé pour ${athlete.nom}`);
      
      // Créer une mesure de test
      const mesure = {
        user_id: athlete.uid,
        date: new Date().toISOString().split('T')[0],
        poids: 70,
        taille: 175,
        imc: 22.9,
        masse_grasse: 18.5,
        masse_musculaire: 45.2,
        tour_taille: 80,
        tour_hanches: 98,
        tour_bras: 32,
        tour_cuisses: 58,
        tour_cou: 37,
        tour_poitrine: 98,
        commentaire: 'Mesure de test',
        created_at: serverTimestamp()
      };
      
      await addDoc(collection(db, 'mesures'), mesure);
      console.log(`✅ Mesure créée pour ${athlete.nom}`);
      
      // Créer une entrée de journal de test
      const journal = {
        user_id: athlete.uid,
        date: new Date().toISOString().split('T')[0],
        note: 'Journée de test - Bonne forme !',
        humeur: 8,
        fatigue: 4,
        motivation: 9,
        energie: 7,
        sommeil_duree: 8.0,
        sommeil_qualite: 8,
        stress: 3,
        meteo: 'soleil',
        activites_annexes: [],
        created_at: serverTimestamp()
      };
      
      await addDoc(collection(db, 'journal'), journal);
      console.log(`✅ Journal créé pour ${athlete.nom}`);
      
    } catch (error) {
      console.error(`❌ Erreur création données pour ${athlete.nom}:`, error.message);
    }
  }
}

// Fonction principale
async function updateTestEnvironment() {
  console.log('🚀 Mise à jour de l\'environnement de test...\n');
  
  try {
    // Se connecter avec un compte coach
    await signInWithEmailAndPassword(auth, 'coach.martin@supernovafit.com', 'Coach123!');
    console.log('✅ Connecté en tant que coach Martin\n');
    
    // Mettre à jour les profils
    await updateUserProfiles();
    
    // Créer quelques données de test
    await createSimpleTestData();
    
    console.log('\n🎉 Mise à jour terminée !');
    console.log('\n📊 RÉSUMÉ:');
    console.log('✅ 8 utilisateurs mis à jour');
    console.log('✅ Données de test créées pour 5 athlètes');
    
    console.log('\n👥 UTILISATEURS DISPONIBLES:');
    const coaches = testUsers.filter(u => u.role === 'coach');
    const athletes = testUsers.filter(u => u.role === 'sportif');
    
    coaches.forEach(coach => {
      console.log(`   👨‍💼 ${coach.nom} (${coach.email}) - Mot de passe: Coach123!`);
    });
    
    athletes.forEach(athlete => {
      const coach = coaches.find(c => c.uid === athlete.ownerCoachId);
      console.log(`   🏃 ${athlete.nom} (${athlete.email}) → Coach: ${coach?.nom} - Mot de passe: Athlete123!`);
    });
    
    console.log('\n🌐 CONNEXION:');
    console.log('   URL: https://supernovafit-a6fe7.web.app');
    console.log('   Utilisez les emails et mots de passe ci-dessus');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter le script
updateTestEnvironment().catch(console.error);
