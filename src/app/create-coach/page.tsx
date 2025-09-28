'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function CreateCoachPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: 'Coach Test',
    email: 'coach@supernovafit.com',
    password: 'Coach123!',
  });

  const createCoachAccount = async () => {
    setLoading(true);

    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const user = userCredential.user;

      // Créer le profil dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        role: 'coach',
        nom: formData.nom,
        email: formData.email,
        date_invitation: new Date(),
        dernier_acces: new Date(),
        // Profil enrichi pour les tests
        age: 35,
        sexe: 'M',
        taille: 180,
        poids_initial: 75,
        objectif: 'performance',
        niveau_activite: 'intense',
      });

      // Mettre à jour l'utilisateur test@supernovafit.com pour lui assigner ce coach
      // Note: En production, cela se ferait via le système d'invitation
      try {
        const testUserQuery = await getDocs(
          query(
            collection(db, 'users'),
            where('email', '==', 'test@supernovafit.com'),
          ),
        );

        if (!testUserQuery.empty) {
          const testUserDoc = testUserQuery.docs[0];
          await updateDoc(doc(db, 'users', testUserDoc.id), {
            coach_id: user.uid,
          });
          toast.success('Utilisateur test lié au coach !');
        }
      } catch (error) {
        console.error('Erreur liaison utilisateur test:', error);
      }

      toast.success('Compte coach créé avec succès !');

      // Afficher les informations
      toast.success(`Email: ${formData.email}`, { duration: 10000 });
      toast.success(`Mot de passe: ${formData.password}`, { duration: 10000 });

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
    } catch (error: unknown) {
      console.error('Erreur création compte coach:', error);
      const err = error as { code?: string };

      if (err.code === 'auth/email-already-in-use') {
        toast.error('Cet email est déjà utilisé');
      } else if (err.code === 'auth/weak-password') {
        toast.error('Le mot de passe est trop faible');
      } else {
        toast.error('Erreur lors de la création du compte');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="glass-effect rounded-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-full bg-neon-purple/20 mb-4">
              <UserPlus className="w-12 h-12 text-neon-purple" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Créer un Compte Coach de Test
            </h1>
            <p className="text-gray-400">
              Cet outil permet de créer rapidement un compte coach pour les
              tests
            </p>
          </div>

          <div className="space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nom du coach
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                         text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                         text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Mot de passe
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                         text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple"
              />
              <p className="text-xs text-gray-500 mt-1">
                Affiché en clair pour faciliter les tests
              </p>
            </div>

            {/* Informations du compte */}
            <div className="bg-neon-purple/10 rounded-lg p-4 border border-neon-purple/30">
              <h3 className="text-sm font-medium text-neon-purple mb-2">
                Informations du compte qui sera créé :
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>
                  • Rôle : <span className="text-white">Coach</span>
                </li>
                <li>
                  • Âge : <span className="text-white">35 ans</span>
                </li>
                <li>
                  • Sexe : <span className="text-white">Homme</span>
                </li>
                <li>
                  • Taille : <span className="text-white">180 cm</span>
                </li>
                <li>
                  • Poids : <span className="text-white">75 kg</span>
                </li>
                <li>
                  • Objectif : <span className="text-white">Performance</span>
                </li>
                <li>
                  • Niveau d&apos;activité :{' '}
                  <span className="text-white">Intense</span>
                </li>
              </ul>
            </div>

            {/* Bouton de création */}
            <button
              onClick={createCoachAccount}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Créer le Compte Coach
                </>
              )}
            </button>

            {/* Avertissement */}
            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
              <p className="text-sm text-red-400">
                ⚠️ <span className="font-medium">Attention :</span> Cette page
                est uniquement pour les tests. Ne pas utiliser en production.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
