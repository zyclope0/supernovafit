'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useAthleteRealData } from '@/hooks/useFirestore';
import { useRouter, useParams } from 'next/navigation';
import { CoachLayout } from '@/components/layout/CoachLayout';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  Scale,
  Camera,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Dynamic imports pour réduire le bundle initial
const DynamicLineChart = dynamic(
  () => import('@/components/charts/DynamicLineChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse bg-gray-800 rounded-lg" />
    ),
  },
);

const DynamicBarChart = dynamic(
  () => import('@/components/charts/DynamicBarChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse bg-gray-800 rounded-lg" />
    ),
  },
);

// ✅ Données réelles récupérées via useAthleteRealData

export default function AthleteDetailPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const athleteId = params.id as string;

  // ✅ Utiliser les vraies données de l'athlète
  const { athleteData, loading } = useAthleteRealData(athleteId);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'nutrition' | 'training' | 'measures'
  >('overview');

  useEffect(() => {
    // Vérifier que l'utilisateur est bien un coach
    if (userProfile && userProfile.role !== 'coach') {
      toast.error('Accès réservé aux coachs');
      router.push('/');
      return;
    }
  }, [userProfile, router]);

  if (loading || !athleteData) {
    return (
      <CoachLayout athleteId={athleteId} showBreadcrumbs={false}>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
        </div>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout
      athleteId={athleteId}
      athleteName={athleteData.nom}
      currentPage="overview"
    >
      <div className="space-y-6">
        {/* Header avec retour */}
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
                {athleteData.nom}
              </h1>
              <p className="text-gray-400">
                {athleteData.email} • Objectif : {athleteData.objectif}
              </p>
            </div>
          </div>
          <button className="btn-primary">Envoyer un message</button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400">Calories/jour</p>
            <p className="text-2xl font-bold text-white">
              {athleteData.stats.calories_jour}
            </p>
            <p className="text-xs text-neon-green mt-1">Objectif : 2200</p>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400">Protéines/jour</p>
            <p className="text-2xl font-bold text-white">
              {athleteData.stats.proteines_jour}g
            </p>
            <p className="text-xs text-neon-cyan mt-1">1.8g/kg</p>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400">Poids actuel</p>
            <p className="text-2xl font-bold text-white">
              {athleteData.stats.poids_actuel} kg
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-neon-green" />
              <p className="text-xs text-neon-green">
                {athleteData.stats.variation_poids}%
              </p>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400">Performances</p>
            <p className="text-2xl font-bold text-white">
              +{athleteData.stats.variation_perf}%
            </p>
            <p className="text-xs text-neon-pink mt-1">vs mois dernier</p>
          </div>
        </div>

        {/* Tabs de navigation */}
        <div className="flex gap-1 sm:gap-2 p-1 bg-white/5 rounded-lg overflow-x-auto">
          {[
            { id: 'overview', label: "Vue d'ensemble", short: 'Vue' },
            { id: 'nutrition', label: 'Nutrition', short: 'Nutrition' },
            { id: 'training', label: 'Entraînements', short: 'Training' },
            { id: 'measures', label: 'Mesures', short: 'Mesures' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as 'overview' | 'nutrition' | 'training' | 'measures',
                )
              }
              className={`flex-1 py-2 px-2 sm:px-4 rounded-lg transition-all text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
            </button>
          ))}
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'overview' && (
          <Suspense
            fallback={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse bg-gray-800 rounded-lg"
                  />
                ))}
              </div>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Évolution du poids */}
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-neon-purple" />
                  Évolution du poids
                </h2>
                <DynamicLineChart data={athleteData.evolution_poids} />
              </div>

              {/* Activités récentes */}
              <div className="glass-effect rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-neon-cyan" />
                  Activités récentes
                </h2>
                <div className="space-y-3">
                  {athleteData.activites_recentes.map(
                    (
                      activite: {
                        date: string;
                        type: string;
                        duree: number;
                        calories: number;
                      },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {activite.type}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(activite.date).toLocaleDateString(
                              'fr-FR',
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white">
                            {activite.duree} min
                          </p>
                          <p className="text-xs text-neon-green">
                            {activite.calories} kcal
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </Suspense>
        )}

        {activeTab === 'nutrition' && (
          <Suspense
            fallback={
              <div className="h-64 animate-pulse bg-gray-800 rounded-lg" />
            }
          >
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">
                Suivi nutritionnel hebdomadaire
              </h2>
              <DynamicBarChart data={athleteData.nutrition_semaine} />
            </div>
          </Suspense>
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="glass-effect rounded-xl p-4 border border-white/10 hover:border-neon-purple/50 
                           transition-all text-left group"
          >
            <Calendar className="w-8 h-8 text-neon-purple mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-medium">Créer un programme</h3>
            <p className="text-xs text-gray-400">
              Personnalisé pour cet athlète
            </p>
          </button>

          <button
            className="glass-effect rounded-xl p-4 border border-white/10 hover:border-neon-cyan/50 
                           transition-all text-left group"
          >
            <TrendingUp className="w-8 h-8 text-neon-cyan mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-medium">Générer un rapport</h3>
            <p className="text-xs text-gray-400">Analyse détaillée</p>
          </button>

          <button
            className="glass-effect rounded-xl p-4 border border-white/10 hover:border-neon-green/50 
                           transition-all text-left group"
          >
            <Camera className="w-8 h-8 text-neon-green mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-medium">Voir les photos</h3>
            <p className="text-xs text-gray-400">Progression visuelle</p>
          </button>
        </div>
      </div>
    </CoachLayout>
  );
}
