'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCoachDietPlans } from '@/hooks/useFirestore';
import { CoachDietPlan } from '@/types';
import { ArrowLeft, Save, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type AthleteLite = { id: string; nom?: string; email?: string };

export default function CoachDietPlanPage() {
  const params = useParams<{ id: string }>();
  const athleteId: string = params.id;
  const router = useRouter();
  const { user } = useAuth();
  const [athlete, setAthlete] = useState<AthleteLite | null>(null);
  const [currentPlan, setCurrentPlan] = useState<CoachDietPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    petit_dej: '',
    collation_matin: '',
    dejeuner: '',
    collation_apres_midi: '',
    diner: '',
    collation_soir: '',
    notes_generales: '',
  });

  // Récupérer les plans diète de l'athlète
  const {
    dietPlans,
    loading: loadingPlans,
    addDietPlan,
    updateDietPlan,
    deleteDietPlan,
  } = useCoachDietPlans(athleteId as string);

  useEffect(() => {
    if (!user || !athleteId) return;

    // Récupérer les infos de l'athlète
    const fetchAthlete = async () => {
      try {
        // Ici on pourrait récupérer les détails de l'athlète
        // Pour l'instant on simule
        setAthlete({
          id: athleteId,
          nom: 'Yannick',
          email: 'test@supernovafit.com',
        });
      } catch (error) {
        console.error('Erreur récupération athlète:', error);
        toast.error('Erreur lors du chargement des données athlète');
      }
    };

    fetchAthlete();
  }, [user, athleteId]);

  const mealTypes = [
    { key: 'petit_dej', label: 'Petit Déjeuner', icon: '🌅' },
    { key: 'collation_matin', label: 'Collation Matin', icon: '☕' },
    { key: 'dejeuner', label: 'Déjeuner', icon: '🍽️' },
    { key: 'collation_apres_midi', label: 'Collation Après-midi', icon: '🍎' },
    { key: 'diner', label: 'Dîner', icon: '🌙' },
    { key: 'collation_soir', label: 'Collation Soir', icon: '🌃' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (currentPlan) {
        // Modification
        await updateDietPlan(currentPlan.id, {
          ...formData,
          updated_at: new Date(),
        });
        toast.success('Plan diète mis à jour avec succès !');
      } else {
        // Création
        await addDietPlan({
          coach_id: user.uid,
          athlete_id: athleteId as string,
          date_creation: new Date().toISOString().split('T')[0],
          ...formData,
        });
        toast.success('Plan diète créé avec succès !');
      }

      setIsCreating(false);
      setCurrentPlan(null);
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde plan diète:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (plan: CoachDietPlan) => {
    setCurrentPlan(plan);
    setFormData({
      petit_dej: plan.petit_dej,
      collation_matin: plan.collation_matin,
      dejeuner: plan.dejeuner,
      collation_apres_midi: plan.collation_apres_midi,
      diner: plan.diner,
      collation_soir: plan.collation_soir,
      notes_generales: plan.notes_generales || '',
    });
    setIsCreating(true);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan diète ?')) return;

    try {
      await deleteDietPlan(planId);
      toast.success('Plan diète supprimé avec succès !');
    } catch (error) {
      console.error('Erreur suppression plan:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      petit_dej: '',
      collation_matin: '',
      dejeuner: '',
      collation_apres_midi: '',
      diner: '',
      collation_soir: '',
      notes_generales: '',
    });
  };

  if (!athlete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-space-900 via-space-800 to-space-900 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-900 via-space-800 to-space-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 glass-effect rounded-lg border border-white/10 hover:glow-purple transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold neon-text">Plans Diète</h1>
              <p className="text-gray-400">Athlète : {athlete.nom}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCreating(true);
              setCurrentPlan(null);
              resetForm();
            }}
            className="flex items-center space-x-2 px-4 py-2 glass-effect rounded-lg border border-neon-green/20 hover:glow-green transition-all"
          >
            <Plus className="w-5 h-5 text-neon-green" />
            <span className="text-white">Nouveau Plan</span>
          </button>
        </div>

        {/* Liste des plans existants */}
        {!isCreating && (
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Plans Existants
            </h2>

            {loadingPlans ? (
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <p className="text-gray-400 text-center">
                  Chargement des plans...
                </p>
              </div>
            ) : dietPlans.length === 0 ? (
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <p className="text-gray-400 text-center">
                  Aucun plan diète créé
                </p>
              </div>
            ) : (
              dietPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="glass-effect rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Plan du{' '}
                        {new Date(plan.date_creation).toLocaleDateString(
                          'fr-FR',
                        )}
                      </h3>
                      {plan.notes_generales && (
                        <p className="text-gray-400 text-sm mt-1">
                          {plan.notes_generales}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-2 glass-effect rounded-lg border border-neon-cyan/20 hover:glow-cyan transition-all"
                      >
                        <Edit2 className="w-4 h-4 text-neon-cyan" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-2 glass-effect rounded-lg border border-neon-pink/20 hover:glow-pink transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-neon-pink" />
                      </button>
                    </div>
                  </div>

                  {/* Aperçu du plan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mealTypes.map(({ key, label, icon }) => {
                      const content = plan[key as keyof typeof plan] as string;
                      return content ? (
                        <div key={key} className="bg-white/5 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-neon-cyan mb-1">
                            {icon} {label}
                          </h4>
                          <p className="text-xs text-gray-300 line-clamp-2">
                            {content}
                          </p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Formulaire de création/édition */}
        {isCreating && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-6">
                {currentPlan ? 'Modifier le Plan Diète' : 'Nouveau Plan Diète'}
              </h2>

              {/* Grille des repas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mealTypes.map(({ key, label, icon }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-neon-cyan flex items-center space-x-2">
                      <span>{icon}</span>
                      <span>{label}</span>
                    </label>
                    <textarea
                      value={formData[key as keyof typeof formData]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      placeholder={`Indications pour le ${label.toLowerCase()}...`}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 resize-none"
                      rows={4}
                    />
                  </div>
                ))}
              </div>

              {/* Notes générales */}
              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-neon-purple">
                  📝 Notes Générales
                </label>
                <textarea
                  value={formData.notes_generales}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes_generales: e.target.value,
                    }))
                  }
                  placeholder="Notes additionnelles, objectifs, recommandations générales..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple/50 resize-none"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setCurrentPlan(null);
                    resetForm();
                  }}
                  className="px-6 py-2 glass-effect rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2 glass-effect rounded-lg border border-neon-green/20 hover:glow-green transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-neon-green" />
                  <span className="text-white">
                    {isSubmitting
                      ? 'Sauvegarde...'
                      : currentPlan
                        ? 'Modifier'
                        : 'Créer'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
