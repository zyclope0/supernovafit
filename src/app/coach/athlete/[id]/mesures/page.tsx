'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Calendar, MessageCircle, Scale } from 'lucide-react';
import type { Mesure } from '@/types';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import { timestampToDateString } from '@/lib/dateUtils';

type AthleteLite = { id: string; nom?: string; email?: string };

export default function CoachAthleteMesuresPage() {
  const { user } = useAuth();
  const params = useParams();
  const athleteId = params.id as string;

  const [athlete, setAthlete] = useState<AthleteLite | null>(null);
  const [mesures, setMesures] = useState<Mesure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedMesure, setSelectedMesure] = useState<Mesure | null>(null);
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

    // Écouter les 30 dernières mesures
    const q = query(
      collection(db, 'mesures'),
      where('user_id', '==', athleteId),
      limit(30),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Mesure[];
        // Tri client par date desc
        data.sort((a, b) => {
          const dateA = timestampToDateString(a.date);
          const dateB = timestampToDateString(b.date);
          return dateB.localeCompare(dateA);
        });
        setMesures(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur récupération mesures:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [athleteId, user]);

  // Ajouter un commentaire coach
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedMesure) return;

    setSubmittingComment(true);
    try {
      await addDoc(collection(db, 'coach_comments'), {
        coach_id: user?.uid,
        athlete_id: athleteId,
        module: 'mesures',
        mesure_id: selectedMesure.id,
        date: selectedMesure.date,
        comment: newComment,
        created_at: serverTimestamp(),
      });

      toast.success('Commentaire ajouté');
      setNewComment('');
      setShowCommentModal(false);
      setSelectedMesure(null);
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href={`/coach`}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold neon-text flex items-center gap-2">
              <Scale className="h-5 w-5 text-neon-green" /> Mesures —{' '}
              {athlete?.nom || athlete?.email}
            </h1>
            <p className="text-sm text-muted-foreground">
              Dernières mesures et commentaires
            </p>
          </div>
        </div>

        {/* Historique des mesures */}
        <CollapsibleCard
          title="Historique des mesures"
          defaultOpen
          counter={mesures.length}
        >
          {mesures.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Aucune mesure trouvée.
            </div>
          ) : (
            <div className="space-y-3">
              {mesures.map((m) => (
                <div
                  key={m.id}
                  className="glass-effect p-4 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">
                        {new Date(
                          timestampToDateString(m.date),
                        ).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> {m.date}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMesure(m);
                        setShowCommentModal(true);
                      }}
                      className="px-3 py-1.5 bg-neon-purple/20 text-neon-purple rounded-lg text-sm hover:bg-neon-purple/30 transition-colors flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" /> Commenter
                    </button>
                  </div>

                  {/* Détails mesure */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {m.poids !== undefined && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-neon-green">
                          {m.poids}
                        </div>
                        <div className="text-xs text-muted-foreground">kg</div>
                      </div>
                    )}
                    {m.taille !== undefined && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-neon-cyan">
                          {m.taille}
                        </div>
                        <div className="text-xs text-muted-foreground">cm</div>
                      </div>
                    )}
                    {/* IMC calculé si données présentes */}
                    {m.poids !== undefined &&
                      m.taille !== undefined &&
                      m.taille > 0 && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-neon-purple">
                            {(m.poids / Math.pow(m.taille / 100, 2)).toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            IMC
                          </div>
                        </div>
                      )}
                    {m.masse_grasse !== undefined && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-neon-pink">
                          {m.masse_grasse}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          % MG
                        </div>
                      </div>
                    )}
                    {m.masse_musculaire !== undefined && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-neon-green">
                          {m.masse_musculaire}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          % MM
                        </div>
                      </div>
                    )}
                    {m.tour_taille !== undefined && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-neon-cyan">
                          {m.tour_taille}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          cm taille
                        </div>
                      </div>
                    )}
                    {m.tour_hanches !== undefined && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-neon-purple">
                          {m.tour_hanches}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          cm hanches
                        </div>
                      </div>
                    )}
                    {m.tour_poitrine !== undefined && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-neon-pink">
                          {m.tour_poitrine}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          cm poitrine
                        </div>
                      </div>
                    )}
                  </div>

                  {m.commentaire && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-sm text-muted-foreground italic">
                        &quot;{m.commentaire}&quot;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CollapsibleCard>

        {/* Modal de commentaire */}
        {showCommentModal && selectedMesure && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-effect rounded-2xl p-6 border border-white/10 max-w-lg w-full">
              <h3 className="text-xl font-semibold text-white mb-2">
                Commenter la mesure
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {new Date(
                  timestampToDateString(selectedMesure.date),
                ).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Vos observations sur cette mesure..."
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setSelectedMesure(null);
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
