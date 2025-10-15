'use client';

import React from 'react';
import {
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

interface AthleteStats {
  calories_jour: number;
  proteines_jour: number;
  entrainements_semaine: number;
  poids_actuel: number;
  variation_poids: number;
  variation_perf: number;
  derniere_activite?: Date;
  objectif_atteint?: boolean;
}

interface Athlete {
  id: string;
  nom: string;
  email: string;
  objectif?: string;
  dernier_acces?: Date | string;
  stats?: AthleteStats;
}

interface AthleteGridProps {
  athletes: Athlete[];
  onAthleteClick?: (athlete: Athlete) => void;
}

export default function AthleteGrid({
  athletes,
  onAthleteClick,
}: AthleteGridProps) {
  const getActivityStatus = (athlete: Athlete) => {
    if (!athlete.dernier_acces) return 'inactive';

    const lastAccess = new Date(athlete.dernier_acces);
    const daysSinceAccess = Math.floor(
      (Date.now() - lastAccess.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceAccess <= 1) return 'active';
    if (daysSinceAccess <= 7) return 'recent';
    return 'inactive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-neon-green bg-neon-green/20';
      case 'recent':
        return 'text-neon-yellow bg-neon-yellow/20';
      case 'inactive':
        return 'text-neon-red bg-neon-red/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3" />;
      case 'recent':
        return <Activity className="w-3 h-3" />;
      case 'inactive':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  const getPerformanceTrend = (variation: number) => {
    if (variation > 0)
      return {
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'text-neon-green',
      };
    if (variation < 0)
      return {
        icon: <TrendingDown className="w-3 h-3" />,
        color: 'text-neon-red',
      };
    return { icon: null, color: 'text-gray-400' };
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques globales */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Vue d&apos;ensemble des athlètes
          </h2>
          <p className="text-gray-400 text-sm">
            {athletes.length} athlète{athletes.length > 1 ? 's' : ''} •
            {athletes.filter((a) => getActivityStatus(a) === 'active').length}{' '}
            actif
            {athletes.filter((a) => getActivityStatus(a) === 'active').length >
            1
              ? 's'
              : ''}{' '}
            aujourd&apos;hui
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-neon-purple" />
          <span className="text-sm text-gray-400">Grille 3x3</span>
        </div>
      </div>

      {/* Grille des athlètes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {athletes.map((athlete) => {
          const activityStatus = getActivityStatus(athlete);
          const performanceTrend = getPerformanceTrend(
            athlete.stats?.variation_perf || 0,
          );

          return (
            <div
              key={athlete.id}
              className="glass-effect rounded-xl p-4 border border-white/10 hover:border-neon-purple/50 
                         transition-all hover:transform hover:scale-[1.02] cursor-pointer group"
              onClick={() => onAthleteClick?.(athlete)}
            >
              {/* Header avec nom et statut */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {athlete.nom || 'Utilisateur'}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {athlete.email}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(activityStatus)}`}
                >
                  {getStatusIcon(activityStatus)}
                  <span className="capitalize">
                    {activityStatus === 'active'
                      ? 'Actif'
                      : activityStatus === 'recent'
                        ? 'Récent'
                        : 'Inactif'}
                  </span>
                </div>
              </div>

              {/* Objectif */}
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Objectif</span>
                  <span className="text-xs text-white font-medium">
                    {athlete.objectif === 'prise_masse'
                      ? 'Prise de masse'
                      : athlete.objectif === 'seche'
                        ? 'Sèche'
                        : athlete.objectif === 'performance'
                          ? 'Performance'
                          : 'Maintien'}
                  </span>
                </div>
              </div>

              {/* Métriques rapides */}
              {athlete.stats && (
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Calories/jour</span>
                    <span className="text-xs text-white">
                      {athlete.stats.calories_jour} kcal
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Entraînements/sem
                    </span>
                    <span className="text-xs text-white">
                      {athlete.stats.entrainements_semaine}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Performance</span>
                    <div className="flex items-center gap-1">
                      {performanceTrend.icon}
                      <span className={`text-xs ${performanceTrend.color}`}>
                        {athlete.stats.variation_perf > 0 ? '+' : ''}
                        {athlete.stats.variation_perf}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions rapides */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex gap-2">
                  <Link
                    href={`/coach/athlete/${athlete.id}`}
                    className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center group-hover:bg-neon-purple/10"
                    title="Voir le dashboard"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Activity className="w-4 h-4 text-neon-purple mx-auto" />
                  </Link>
                  <Link
                    href={`/coach/athlete/${athlete.id}/diete`}
                    className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center group-hover:bg-neon-green/10"
                    title="Voir la diète"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TrendingUp className="w-4 h-4 text-neon-green mx-auto" />
                  </Link>
                  <Link
                    href={`/coach/athlete/${athlete.id}/entrainements`}
                    className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center group-hover:bg-neon-cyan/10"
                    title="Voir les entraînements"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Activity className="w-4 h-4 text-neon-cyan mx-auto" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucun athlète */}
      {athletes.length === 0 && (
        <div className="glass-effect rounded-xl p-12 border border-white/10 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Aucun athlète trouvé
          </h3>
          <p className="text-gray-400">
            Commencez par inviter des athlètes à rejoindre votre équipe
          </p>
        </div>
      )}
    </div>
  );
}
