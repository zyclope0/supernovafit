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
  Calendar,
  Activity,
  Scale,
  Camera,
  Zap,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { timestampToDateString } from '@/lib/dateUtils';
import CoachAthleteProgressHeader from '@/components/coach/CoachAthleteProgressHeader';

// Dynamic imports optimisés pour réduire le bundle initial
const DynamicLineChart = dynamic(
  () => import('@/components/charts/DynamicLineChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-gray-400 text-sm">Chargement graphique...</div>
      </div>
    ),
  },
);

const DynamicBarChart = dynamic(
  () => import('@/components/charts/DynamicBarChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-gray-400 text-sm">Chargement graphique...</div>
      </div>
    ),
  },
);

// Lazy loading des actions rapides (pour usage futur)
// const DynamicExportButton = dynamic(
//   () => import('@/components/ui/ExportButton'),
//   {
//     ssr: false,
//     loading: () => (
//       <button className="btn-primary opacity-50 cursor-not-allowed" disabled>
//         Chargement...
//       </button>
//     ),
//   },
// );

// ✅ Données réelles récupérées via useAthleteRealData

export default function AthleteDetailPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const athleteId = params.id as string;

  // ✅ Utiliser les vraies données de l'athlète avec pagination optimisée
  const { athleteData, loading } = useAthleteRealData(athleteId, 10); // Limite à 10 items pour performance
  const [activeTab, setActiveTab] = useState<
    'overview' | 'nutrition' | 'training' | 'measures'
  >('overview');
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

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
        <div className="flex items-center justify-between mb-6">
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

        {/* ProgressHeader standardisé */}
        <CoachAthleteProgressHeader
          title="Dashboard Athlète"
          athleteName={athleteData.nom}
          period={period}
          onPeriodChange={(period: string) =>
            setPeriod(period as 'today' | 'week' | 'month')
          }
          items={[
            {
              icon: <Zap className="w-4 h-4" />,
              label: 'Calories/jour',
              data: {
                current: athleteData.stats.calories_jour,
                target: 2200,
                unit: 'kcal',
              },
              color: 'green',
              trend: athleteData.stats.calories_jour >= 2000 ? 'up' : 'down',
            },
            {
              icon: <Target className="w-4 h-4" />,
              label: 'Protéines/jour',
              data: {
                current: athleteData.stats.proteines_jour,
                target: 150,
                unit: 'g',
              },
              color: 'cyan',
              trend: athleteData.stats.proteines_jour >= 120 ? 'up' : 'down',
            },
            {
              icon: <Scale className="w-4 h-4" />,
              label: 'Poids actuel',
              data: {
                current: athleteData.stats.poids_actuel,
                target: 70,
                unit: 'kg',
              },
              color: 'purple',
              trend: athleteData.stats.variation_poids < 0 ? 'down' : 'up',
            },
            {
              icon: <Activity className="w-4 h-4" />,
              label: 'Performance',
              data: {
                current: athleteData.stats.variation_perf,
                target: 20,
                unit: '%',
              },
              color: 'pink',
              trend: athleteData.stats.variation_perf > 0 ? 'up' : 'down',
            },
          ]}
          advice={`${athleteData.nom} montre une progression ${athleteData.stats.variation_perf > 0 ? 'positive' : 'stable'} cette semaine. ${athleteData.stats.calories_jour < 2000 ? "Recommandation: Augmenter l'apport calorique quotidien." : 'Excellent suivi nutritionnel !'} ${athleteData.stats.proteines_jour < 120 ? 'Penser à optimiser les protéines.' : 'Protéines optimales.'}`}
        />

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
                            {new Date(
                              timestampToDateString(activite.date),
                            ).toLocaleDateString('fr-FR')}
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

        {/* Actions rapides avec ClickableCard pattern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="glass-effect rounded-xl p-4 border border-white/10 hover:border-neon-purple/50 
                           transition-all text-left group cursor-pointer"
            onClick={() => {
              // TODO: Implémenter création programme
              toast.success('Création de programme - Fonctionnalité à venir');
            }}
          >
            <Calendar className="w-8 h-8 text-neon-purple mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-medium">Créer un programme</h3>
            <p className="text-xs text-gray-400">
              Personnalisé pour cet athlète
            </p>
          </div>

          <div
            className="glass-effect rounded-xl p-4 border border-white/10 hover:border-neon-cyan/50 
                           transition-all text-left group cursor-pointer"
            onClick={() => {
              // TODO: Implémenter génération rapport
              toast.success('Génération de rapport - Fonctionnalité à venir');
            }}
          >
            <TrendingUp className="w-8 h-8 text-neon-cyan mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-medium">Générer un rapport</h3>
            <p className="text-xs text-gray-400">Analyse détaillée</p>
          </div>

          <div
            className="glass-effect rounded-xl p-4 border border-white/10 hover:border-neon-green/50 
                           transition-all text-left group cursor-pointer"
            onClick={() => {
              // TODO: Implémenter vue photos
              toast.success('Galerie photos - Fonctionnalité à venir');
            }}
          >
            <Camera className="w-8 h-8 text-neon-green mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-medium">Voir les photos</h3>
            <p className="text-xs text-gray-400">Progression visuelle</p>
          </div>
        </div>
      </div>
    </CoachLayout>
  );
}
