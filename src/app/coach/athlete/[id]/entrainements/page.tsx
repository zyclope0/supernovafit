'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, MessageCircle, Activity } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Entrainement } from '@/types';
import CollapsibleCard from '@/components/ui/CollapsibleCard';

type AthleteLite = { id: string; nom?: string; email?: string };

export default function CoachAthleteTrainingsPage() {
  const { user } = useAuth();
  const params = useParams();
  const athleteId = params.id as string;

  const [athlete, setAthlete] = useState<AthleteLite | null>(null);
  const [entrainements, setEntrainements] = useState<Entrainement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Entrainement | null>(
    null,
  );
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!athleteId || !user) return;

    // Récupérer les infos de l'athlète
    const fetchAthlete = async () => {
      try {
        const athleteDoc = await getDoc(doc(db, 'users', athleteId));
        if (athleteDoc.exists()) {
          setAthlete({ id: athleteDoc.id, ...athleteDoc.data() });
        }
      } catch (error) {
        console.error('Erreur récupération athlète:', error);
      }
    };

    fetchAthlete();

    // Écouter les 30 derniers entraînements
    const q = query(
      collection(db, 'entrainements'),
      where('user_id', '==', athleteId),
      orderBy('date', 'desc'),
      limit(30),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Entrainement[];
        setEntrainements(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur récupération entrainements:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [athleteId, user]);

  // Ajouter un commentaire coach
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTraining) return;

    setSubmittingComment(true);
    try {
      await addDoc(collection(db, 'coach_comments'), {
        coach_id: user?.uid,
        athlete_id: athleteId,
        module: 'entrainements',
        training_id: selectedTraining.id,
        date: selectedTraining.date,
        comment: newComment,
        created_at: serverTimestamp(),
      });

      toast.success('Commentaire ajouté');
      setNewComment('');
      setShowCommentModal(false);
      setSelectedTraining(null);
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      toast.error("Erreur lors de l'ajout du commentaire");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading || !athlete) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
        </div>
      </MainLayout>
    );
  }

  // Statistiques des entraînements
  const stats = {
    total: entrainements.length,
    totalCalories: entrainements.reduce((sum, e) => sum + (e.calories || 0), 0),
    totalDuration: entrainements.reduce((sum, e) => sum + (e.duree || 0), 0),
    avgPerWeek: Math.round(entrainements.length / 4.3), // Approximation sur 30 jours
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/coach"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Entraînements de {athlete.nom}
              </h1>
              <p className="text-gray-400">
                Historique des 30 dernières séances
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Total séances</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-neon-purple mt-1">30 derniers jours</p>
          </div>
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Calories totales</p>
            <p className="text-3xl font-bold text-white">
              {stats.totalCalories}
            </p>
            <p className="text-xs text-neon-green mt-1">kcal brûlées</p>
          </div>
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Temps total</p>
            <p className="text-3xl font-bold text-white">
              {Math.round(stats.totalDuration / 60)}
            </p>
            <p className="text-xs text-neon-cyan mt-1">heures</p>
          </div>
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">Moyenne/semaine</p>
            <p className="text-3xl font-bold text-white">{stats.avgPerWeek}</p>
            <p className="text-xs text-neon-pink mt-1">séances</p>
          </div>
        </div>

        {/* Liste des entraînements */}
        <CollapsibleCard title="Historique des entraînements" defaultOpen>
          {entrainements.length === 0 ? (
            <div className="glass-effect rounded-xl p-12 border border-white/10 text-center">
              <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucun entraînement enregistré</p>
            </div>
          ) : (
            entrainements.map((training) => (
              <div
                key={training.id}
                className="glass-effect rounded-xl p-6 border border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {training.type}
                      </h3>
                      <span className="text-sm text-gray-400">
                        {new Date(training.date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-400">Durée</p>
                        <p className="text-white">{training.duree} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Calories</p>
                        <p className="text-neon-green">
                          {training.calories || 0} kcal
                        </p>
                      </div>
                      {training.fc_moyenne && (
                        <div>
                          <p className="text-xs text-gray-400">FC moy</p>
                          <p className="text-neon-pink">
                            {training.fc_moyenne} bpm
                          </p>
                        </div>
                      )}
                      {training.vitesse_moy && (
                        <div>
                          <p className="text-xs text-gray-400">Vitesse</p>
                          <p className="text-neon-cyan">
                            {training.vitesse_moy.toFixed(1)} km/h
                          </p>
                        </div>
                      )}
                    </div>

                    {training.commentaire && (
                      <p className="mt-3 text-sm text-gray-300 italic">
                        &quot;{training.commentaire}&quot;
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTraining(training);
                      setShowCommentModal(true);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ml-4"
                    title="Ajouter un commentaire"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))
          )}
        </CollapsibleCard>

        {/* Modal de commentaire */}
        {showCommentModal && selectedTraining && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-effect rounded-2xl p-6 border border-white/10 max-w-lg w-full">
              <h3 className="text-xl font-semibold text-white mb-2">
                Commenter l&apos;entraînement
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {selectedTraining.type} du{' '}
                {new Date(selectedTraining.date).toLocaleDateString('fr-FR')}
              </p>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Vos observations sur cet entraînement..."
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                         text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple
                         resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setSelectedTraining(null);
                    setNewComment('');
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="flex-1 btn-primary"
                >
                  {submittingComment ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
