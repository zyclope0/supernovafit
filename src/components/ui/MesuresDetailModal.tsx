'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Mesure } from '@/types';
import StandardModal from './StandardModal';
import { timestampToDateString } from '@/lib/dateUtils';

interface MesuresDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mesure: Mesure | null;
  getStats: (mesure: Mesure) => {
    imc: number;
    evolution_poids: number;
    evolution_masse_grasse: number;
    poids_ideal_min: number;
    poids_ideal_max: number;
  } | null;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export default function MesuresDetailModal({
  isOpen,
  onClose,
  mesure,
  getStats,
  onEdit,
  onDelete,
  editLabel = 'Modifier',
  maxWidth = '2xl',
}: MesuresDetailModalProps) {
  if (!isOpen || !mesure) return null;

  const stats = getStats(mesure);

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mesures du ${formatDate(timestampToDateString(mesure.date))}`}
      subtitle={new Date(timestampToDateString(mesure.date)).toLocaleDateString(
        'fr-FR',
        {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
      )}
      icon="📏"
      onEdit={onEdit}
      editLabel={editLabel}
      maxWidth={maxWidth}
      height="85vh"
    >
      <div className="p-6 pb-4 overflow-y-auto max-h-full">
        <div className="space-y-6">
          {/* Résumé des métriques principales */}
          <div className="grid grid-cols-2 gap-4">
            {mesure.poids && (
              <div className="glass-effect p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⚖️</span>
                  <span className="text-sm font-medium text-white">Poids</span>
                </div>
                <div className="text-2xl font-bold text-neon-green">
                  {mesure.poids}
                </div>
                <div className="text-xs text-gray-400">kg</div>
              </div>
            )}

            {stats?.imc && (
              <div className="glass-effect p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📊</span>
                  <span className="text-sm font-medium text-white">IMC</span>
                </div>
                <div className="text-2xl font-bold text-neon-cyan">
                  {stats.imc}
                </div>
                <div className="text-xs text-gray-400">kg/m²</div>
              </div>
            )}
          </div>

          {/* Composition corporelle */}
          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🏃‍♂️</span>
              Composition corporelle
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {mesure.masse_grasse && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-lg">💪</span>
                    <span className="text-sm text-gray-400">Masse grasse</span>
                  </div>
                  <div className="text-xl font-bold text-neon-pink">
                    {mesure.masse_grasse}%
                  </div>
                  <div className="text-xs text-gray-400">pourcentage</div>
                </div>
              )}

              {mesure.masse_musculaire && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-lg">💪</span>
                    <span className="text-sm text-gray-400">
                      Masse musculaire
                    </span>
                  </div>
                  <div className="text-xl font-bold text-neon-purple">
                    {mesure.masse_musculaire}%
                  </div>
                  <div className="text-xs text-gray-400">pourcentage</div>
                </div>
              )}
            </div>
          </div>

          {/* Mensurations détaillées */}
          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📐</span>
              Mensurations
            </h4>

            <div className="space-y-3">
              {mesure.tour_taille && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white">Tour de taille</div>
                    <div className="text-sm text-gray-400">Circonférence</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-neon-purple">
                      {mesure.tour_taille} cm
                    </div>
                  </div>
                </div>
              )}
              {mesure.tour_hanches && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      Tour de hanches
                    </div>
                    <div className="text-sm text-gray-400">Circonférence</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-neon-pink">
                      {mesure.tour_hanches} cm
                    </div>
                  </div>
                </div>
              )}
              {mesure.tour_bras && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white">Tour de bras</div>
                    <div className="text-sm text-gray-400">Circonférence</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-neon-cyan">
                      {mesure.tour_bras} cm
                    </div>
                  </div>
                </div>
              )}
              {mesure.tour_cuisses && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      Tour de cuisses
                    </div>
                    <div className="text-sm text-gray-400">Circonférence</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-neon-green">
                      {mesure.tour_cuisses} cm
                    </div>
                  </div>
                </div>
              )}
              {mesure.tour_cou && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white">Tour de cou</div>
                    <div className="text-sm text-gray-400">Circonférence</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-neon-yellow">
                      {mesure.tour_cou} cm
                    </div>
                  </div>
                </div>
              )}
              {mesure.tour_poitrine && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      Tour de poitrine
                    </div>
                    <div className="text-sm text-gray-400">Circonférence</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-neon-orange">
                      {mesure.tour_poitrine} cm
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Évolutions si disponibles */}
          {stats &&
            (stats.evolution_poids !== 0 ||
              stats.evolution_masse_grasse !== 0) && (
              <div className="glass-effect p-4 rounded-lg border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  Évolutions
                </h4>

                <div className="space-y-3">
                  {stats.evolution_poids !== 0 && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          Évolution poids
                        </div>
                        <div className="text-sm text-gray-400">Variation</div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-semibold ${
                            stats.evolution_poids > 0
                              ? 'text-neon-green'
                              : 'text-neon-red'
                          }`}
                        >
                          {stats.evolution_poids > 0 ? '+' : ''}
                          {stats.evolution_poids} kg
                        </div>
                      </div>
                    </div>
                  )}
                  {stats.evolution_masse_grasse !== 0 && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          Évolution masse grasse
                        </div>
                        <div className="text-sm text-gray-400">Variation</div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-semibold ${
                            stats.evolution_masse_grasse < 0
                              ? 'text-neon-green'
                              : 'text-neon-red'
                          }`}
                        >
                          {stats.evolution_masse_grasse > 0 ? '+' : ''}
                          {stats.evolution_masse_grasse}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Zone de poids idéal si disponible */}
          {stats && (stats.poids_ideal_min || stats.poids_ideal_max) && (
            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Poids idéal
              </h4>

              <div className="text-center">
                <div className="text-2xl font-bold text-neon-purple">
                  {stats.poids_ideal_min} - {stats.poids_ideal_max} kg
                </div>
                <div className="text-xs text-gray-400">
                  Zone recommandée (IMC 18.5-24.9)
                </div>
              </div>
            </div>
          )}

          {/* Commentaire si présent */}
          {mesure.commentaire && (
            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">💬</span>
                Commentaire
              </h4>

              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-white italic">
                  &quot;{mesure.commentaire}&quot;
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {onDelete && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    </StandardModal>
  );
}
