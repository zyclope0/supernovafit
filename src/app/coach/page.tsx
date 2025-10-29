'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCoachAthletes } from '@/hooks/useFirestore';
import { useCoachRealAnalytics } from '@/hooks/useCoachRealAnalytics';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Users, Plus, TrendingUp, AlertTriangle, Trophy } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import InviteModal from '@/components/ui/InviteModal';
import AthleteGrid from '@/components/coach/AthleteGrid';
import AlertsPanel from '@/components/coach/AlertsPanel';
import PerformanceComparison from '@/components/coach/PerformanceComparison';
import TeamProgress from '@/components/coach/TeamProgress';
import ImplementationStatus, {
  MetricWithStatus,
} from '@/components/coach/ImplementationStatus';

// interface AthleteWithStats {
//   id: string
//   nom: string
//   email: string
//   objectif?: string
//   derniere_activite?: Date
//   stats?: {
//     entrainements_semaine: number
//     calories_jour_moyen: number
//     progression_poids?: number
//   }
// }

export default function CoachDashboard() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const {} = useCoachAthletes();
  const { analyticsData, loading: analyticsLoading } = useCoachRealAnalytics();
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'analytics' | 'alerts'
  >('overview');
  const [selectedMetric, setSelectedMetric] = useState<
    | 'calories_jour'
    | 'proteines_jour'
    | 'entrainements_semaine'
    | 'variation_perf'
    | 'variation_poids'
  >('variation_perf');

  useEffect(() => {
    // Vérifier que l'utilisateur est bien un coach
    if (userProfile && userProfile.role !== 'coach') {
      toast.error('Accès réservé aux coachs');
      router.push('/');
    }
    if (userProfile) {
      setLoading(false);
    }
  }, [userProfile, router]);

  if (loading || analyticsLoading) {
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
        {/* Header avec navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Dashboard Coach Analytics
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Vue consolidée de tous vos athlètes avec alertes automatiques
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Trophy className="w-8 h-8 text-neon-yellow" />
          </div>
        </div>

        {/* Statut d'implémentation */}
        <ImplementationStatus
          status={{
            realDataAvailable: true,
            realDataPercentage: 35,
            simulatedFeatures: [
              'Alertes automatiques',
              'Comparaisons de performance',
              'Progression collective',
              'Métriques avancées',
              'Recommandations IA',
            ],
            missingFeatures: [
              'Système de notifications push',
              'Intégration calendrier',
              'Export de rapports',
              'Chat temps réel',
              'Analytics avancées',
            ],
            recommendations: [
              "Implémenter les vraies données d'analytics",
              'Ajouter les notifications push',
              'Créer un système de rapports',
              'Intégrer un chat coach-athlète',
            ],
          }}
        />

        {/* Navigation par onglets */}
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-neon-purple border-b-2 border-neon-purple'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Vue d&apos;ensemble
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'text-neon-purple border-b-2 border-neon-purple'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'text-neon-purple border-b-2 border-neon-purple'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Alertes ({analyticsData?.alerts.length || 0})
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'overview' && (
          <>
            {/* Métriques avec statut d'implémentation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricWithStatus
                label="Mes Athlètes"
                value={analyticsData?.teamStats.totalAthletes || 0}
                unit=""
                dataSource="real"
                category="database"
                priority="low"
              />
              <MetricWithStatus
                label="Actifs Aujourd'hui"
                value={analyticsData?.teamStats.activeAthletes || 0}
                unit=""
                dataSource="real"
                category="database"
                priority="low"
              />
              <MetricWithStatus
                label="XP Total"
                value={analyticsData?.teamStats.totalXP || 0}
                unit="XP"
                dataSource="simulated"
                category="backend"
                priority="medium"
                estimatedTime="1 jour"
              />
              <MetricWithStatus
                label="Alertes Actives"
                value={analyticsData?.alerts.length || 0}
                unit=""
                dataSource="simulated"
                category="backend"
                priority="high"
                estimatedTime="2-3 jours"
              />
            </div>

            {/* Grille des athlètes */}
            {analyticsData && (
              <AthleteGrid
                athletes={analyticsData.athletes}
                onAthleteClick={(athlete) => {
                  console.log('Athlète sélectionné:', athlete);
                }}
              />
            )}
          </>
        )}

        {activeTab === 'analytics' && analyticsData && (
          <div className="space-y-6">
            {/* Progression collective */}
            <TeamProgress
              stats={analyticsData.teamStats}
              onViewDetails={() => {
                console.log('Voir rapport complet');
              }}
            />

            {/* Comparaison des performances */}
            <PerformanceComparison
              athletes={analyticsData.athletes}
              metric={selectedMetric}
              onMetricChange={(metric) =>
                setSelectedMetric(
                  metric as
                    | 'calories_jour'
                    | 'proteines_jour'
                    | 'entrainements_semaine'
                    | 'variation_perf'
                    | 'variation_poids',
                )
              }
            />
          </div>
        )}

        {activeTab === 'alerts' && analyticsData && (
          <AlertsPanel
            alerts={analyticsData.alerts}
            onAlertClick={(alert) => {
              console.log('Alerte cliquée:', alert);
            }}
            onDismissAlert={(alertId) => {
              console.log('Alerte ignorée:', alertId);
            }}
          />
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowInviteModal(true)}
            className="glass-effect rounded-xl p-6 border border-white/10 hover:border-neon-purple/50 
                     transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-4">
              <Plus className="w-12 h-12 text-neon-purple group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Inviter un athlète
                </h3>
                <p className="text-sm text-gray-400">
                  Ajouter un nouvel athlète à votre équipe
                </p>
              </div>
            </div>
          </button>

          <Link
            href="/coach/all-athletes"
            className="glass-effect rounded-xl p-6 border border-white/10 hover:border-neon-cyan/50 
                     transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-4">
              <Users className="w-12 h-12 text-neon-cyan group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Voir tous les athlètes
                </h3>
                <p className="text-sm text-gray-400">
                  Découvrir et inviter de nouveaux athlètes
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Modal d'invitation */}
        {showInviteModal && userProfile && (
          <InviteModal
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            coachId={userProfile.id}
          />
        )}
      </div>
    </MainLayout>
  );
}
