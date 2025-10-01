'use client';

import React, { useState } from 'react';
import { JournalEntry } from '@/types';
import { Heart, Battery, Zap, CloudRain, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import StandardModal from './StandardModal';

interface JournalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null;
  onEdit?: () => void;
}

const EMOJI_LEVELS = {
  1: '😞',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😊',
  6: '😄',
  7: '😁',
  8: '🤩',
  9: '😍',
  10: '🚀',
};

const METEO_EMOJI = {
  soleil: '☀️',
  nuage: '☁️',
  pluie: '🌧️',
  orage: '⛈️',
  neige: '❄️',
};

export default function JournalDetailModal({
  isOpen,
  onClose,
  entry,
  onEdit,
}: JournalDetailModalProps) {
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  if (!entry) return null;

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEEE d MMMM yyyy', { locale: fr });
    } catch {
      return dateStr;
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'gray-400';
    if (score <= 3) return 'red-400';
    if (score <= 5) return 'yellow-400';
    if (score <= 7) return 'green-400';
    return 'neon-green';
  };

  const getScoreLabel = (score?: number) => {
    if (!score) return 'Non renseigné';
    if (score <= 3) return 'Faible';
    if (score <= 5) return 'Moyen';
    if (score <= 7) return 'Bon';
    return 'Excellent';
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Entrée Journal"
      subtitle={formatDate(entry.date)}
      icon="📔"
      onEdit={onEdit}
      editLabel="Modifier"
      maxWidth="4xl"
      height="85vh"
    >
      <div className="p-6 pb-4 overflow-y-auto max-h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-4">
            {/* Note personnelle */}
            {entry.note && (
              <div className="glass-effect p-4 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  💭 Note personnelle
                </h2>
                <div className="text-gray-300 bg-white/5 p-4 rounded-lg italic">
                  &quot;{entry.note}&quot;
                </div>
              </div>
            )}

            {/* Métriques bien-être */}
            <div className="glass-effect p-4 rounded-xl border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                📊 Métriques bien-être
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {entry.humeur && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="h-6 w-6 text-neon-pink" />
                    </div>
                    <div className="text-2xl mb-1">
                      {EMOJI_LEVELS[entry.humeur as keyof typeof EMOJI_LEVELS]}
                    </div>
                    <div className="text-xl font-bold text-white">
                      {entry.humeur}/10
                    </div>
                    <div className="text-sm text-muted-foreground">Humeur</div>
                  </div>
                )}

                {entry.energie && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="h-6 w-6 text-neon-yellow" />
                    </div>
                    <div className="text-2xl mb-1">
                      {EMOJI_LEVELS[entry.energie as keyof typeof EMOJI_LEVELS]}
                    </div>
                    <div className="text-xl font-bold text-white">
                      {entry.energie}/10
                    </div>
                    <div className="text-sm text-muted-foreground">Énergie</div>
                  </div>
                )}

                {entry.motivation && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Battery className="h-6 w-6 text-neon-green" />
                    </div>
                    <div className="text-2xl mb-1">
                      {
                        EMOJI_LEVELS[
                          entry.motivation as keyof typeof EMOJI_LEVELS
                        ]
                      }
                    </div>
                    <div className="text-xl font-bold text-white">
                      {entry.motivation}/10
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Motivation
                    </div>
                  </div>
                )}

                {entry.fatigue && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CloudRain className="h-6 w-6 text-neon-cyan" />
                    </div>
                    <div className="text-2xl mb-1">
                      {EMOJI_LEVELS[entry.fatigue as keyof typeof EMOJI_LEVELS]}
                    </div>
                    <div className="text-xl font-bold text-white">
                      {entry.fatigue}/10
                    </div>
                    <div className="text-sm text-muted-foreground">Fatigue</div>
                  </div>
                )}
              </div>
            </div>

            {/* Activités annexes */}
            {entry.activites_annexes && entry.activites_annexes.length > 0 && (
              <div className="glass-effect p-4 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  🏃 Activités annexes
                </h2>
                <div className="flex flex-wrap gap-2">
                  {entry.activites_annexes.map((activite, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-sm"
                    >
                      {activite}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar droite */}
          <div className="space-y-4">
            {/* Sommeil */}
            {(entry.sommeil_duree || entry.sommeil_qualite) && (
              <div className="glass-effect p-4 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  🌙 Sommeil
                </h2>
                <div className="space-y-3">
                  {entry.sommeil_duree && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Durée
                        </span>
                        <span className="text-lg font-bold text-neon-cyan">
                          {entry.sommeil_duree}h
                        </span>
                      </div>
                    </div>
                  )}

                  {entry.sommeil_qualite && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Qualité
                        </span>
                        <span
                          className={`text-sm font-medium text-${getScoreColor(entry.sommeil_qualite)}`}
                        >
                          {getScoreLabel(entry.sommeil_qualite)}
                        </span>
                      </div>
                      <div className="w-full bg-space-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r from-${getScoreColor(entry.sommeil_qualite)} to-${getScoreColor(entry.sommeil_qualite)}/80`}
                          style={{
                            width: `${(entry.sommeil_qualite / 10) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-center text-lg font-bold text-white mt-1">
                        {entry.sommeil_qualite}/10
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stress */}
            {entry.stress && (
              <div className="glass-effect p-4 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  😰 Niveau de stress
                </h2>
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {EMOJI_LEVELS[entry.stress as keyof typeof EMOJI_LEVELS]}
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {entry.stress}/10
                  </div>
                  <div
                    className={`text-sm font-medium text-${getScoreColor(10 - entry.stress)}`}
                  >
                    {entry.stress <= 3
                      ? 'Détendu'
                      : entry.stress <= 6
                        ? 'Modéré'
                        : 'Élevé'}
                  </div>
                  <div className="w-full bg-space-700 rounded-full h-2 mt-3">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-red-500 to-red-400"
                      style={{ width: `${(entry.stress / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Météo */}
            {entry.meteo && (
              <div className="glass-effect p-4 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  🌤️ Météo
                </h2>
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {METEO_EMOJI[entry.meteo as keyof typeof METEO_EMOJI]}
                  </div>
                  <div className="text-sm text-gray-300 capitalize">
                    {entry.meteo}
                  </div>
                </div>
              </div>
            )}

            {/* Photos libres */}
            {entry.photos_libres && entry.photos_libres.length > 0 && (
              <div className="glass-effect p-4 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  📷 Photos ({entry.photos_libres.length})
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {entry.photos_libres.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setEnlargedPhoto(url)}
                      className="relative w-full h-24 rounded-lg overflow-hidden hover:ring-2 hover:ring-neon-pink transition-all cursor-zoom-in group"
                    >
                      <Image
                        src={url}
                        alt={`Photo ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        quality={85}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl">
                          🔍
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal d'agrandissement photo */}
            {enlargedPhoto && (
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={() => setEnlargedPhoto(null)}
              >
                <button
                  onClick={() => setEnlargedPhoto(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                  aria-label="Fermer l'agrandissement"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
                <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
                  <Image
                    src={enlargedPhoto}
                    alt="Photo agrandie"
                    fill
                    sizes="100vw"
                    quality={95}
                    className="object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StandardModal>
  );
}
