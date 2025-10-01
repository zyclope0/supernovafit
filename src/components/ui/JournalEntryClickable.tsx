'use client';

import React from 'react';
import { JournalEntry } from '@/types';
// Date formatting fait en interne pour préserver l'esprit Journal

interface JournalEntryClickableProps {
  entry: JournalEntry;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
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

export default function JournalEntryClickable({
  entry,
  onView,
  onEdit,
  onDelete,
}: JournalEntryClickableProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (date.toDateString() === today) return "Aujourd'hui";
    if (date.toDateString() === yesterday) return 'Hier';

    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // const getOverallMood = () => {
  //   const scores = [entry.humeur, entry.energie, entry.motivation].filter(Boolean)
  //   if (scores.length === 0) return null
  //   const average = scores.reduce((sum, score) => sum + (score || 0), 0) / scores.length
  //   return Math.round(average)
  // }

  // const overallMood = getOverallMood() // Unused for now

  return (
    <div
      className="glass-effect-high p-5 rounded-xl border border-white/20 hover:border-neon-cyan/40 transition-all duration-300 hover:shadow-xl hover:shadow-neon-cyan/20 group cursor-pointer"
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView();
        }
      }}
      aria-label={`Voir les détails de l'entrée journal du ${formatDate(entry.date)}`}
    >
      {/* Header avec date et météo (style Journal existant) */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex flex-col">
            <span className="font-semibold text-white text-base group-hover:text-neon-cyan transition-colors">
              {formatDate(entry.date)}
            </span>
            {entry.meteo && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                {METEO_EMOJI[entry.meteo]}{' '}
                <span className="capitalize">{entry.meteo}</span>
              </span>
            )}
          </div>

          {/* Indicateur photo si présent */}
          {entry.photos_libres && entry.photos_libres.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-neon-pink/10 rounded-lg border border-neon-pink/20">
              <span className="text-neon-pink">📷</span>
              <span className="text-xs text-neon-pink font-medium">
                {entry.photos_libres.length}
              </span>
            </div>
          )}

          {/* Indicateur de vue détaillée */}
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-neon-cyan text-lg">👁️</span>
          </div>
        </div>

        {/* Actions avec design Journal (émojis au lieu d'icônes) */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 hover:bg-neon-cyan/20 rounded-lg transition-all duration-200 group/btn"
            title="Modifier"
          >
            <span className="text-neon-cyan group-hover/btn:scale-110 transition-transform">
              ✏️
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 group/btn"
            title="Supprimer"
          >
            <span className="text-red-400 group-hover/btn:scale-110 transition-transform">
              🗑️
            </span>
          </button>
        </div>
      </div>

      {/* Indicateurs avec design amélioré (EXACT style Journal existant) */}
      <div className="flex flex-wrap gap-2 mb-4">
        {entry.humeur && (
          <div className="flex items-center gap-2 px-3 py-2 bg-neon-green/10 rounded-lg border border-neon-green/20">
            <span className="text-lg">{EMOJI_LEVELS[entry.humeur]}</span>
            <span className="text-sm text-neon-green font-semibold">
              {entry.humeur}/10
            </span>
            <span className="text-xs text-muted-foreground">Humeur</span>
          </div>
        )}
        {entry.energie && (
          <div className="flex items-center gap-2 px-3 py-2 bg-neon-cyan/10 rounded-lg border border-neon-cyan/20">
            <span className="text-lg">⚡</span>
            <span className="text-sm text-neon-cyan font-semibold">
              {entry.energie}/10
            </span>
            <span className="text-xs text-muted-foreground">Énergie</span>
          </div>
        )}
        {entry.sommeil_qualite && (
          <div className="flex items-center gap-2 px-3 py-2 bg-neon-purple/10 rounded-lg border border-neon-purple/20">
            <span className="text-lg">😴</span>
            <span className="text-sm text-neon-purple font-semibold">
              {entry.sommeil_qualite}/10
            </span>
            <span className="text-xs text-muted-foreground">Sommeil</span>
          </div>
        )}
        {entry.stress && (
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <span className="text-lg">😰</span>
            <span className="text-sm text-orange-400 font-semibold">
              {entry.stress}/10
            </span>
            <span className="text-xs text-muted-foreground">Stress</span>
          </div>
        )}
      </div>

      {/* Note avec design amélioré (EXACT style Journal existant) */}
      {entry.note && (
        <div className="bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 rounded-lg p-4 mb-4 border-l-4 border-neon-cyan/50">
          <p className="text-sm text-white/95 leading-relaxed line-clamp-3">
            {entry.note.length > 150
              ? `${entry.note.slice(0, 150)}...`
              : entry.note}
          </p>
        </div>
      )}

      {/* Activités avec design amélioré (EXACT style Journal existant) */}
      {entry.activites_annexes && entry.activites_annexes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {entry.activites_annexes.slice(0, 4).map((activite, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-neon-purple/15 text-neon-purple text-sm rounded-full border border-neon-purple/30 font-medium"
            >
              {activite}
            </span>
          ))}
          {entry.activites_annexes.length > 4 && (
            <span className="px-3 py-1.5 bg-white/10 text-white/70 text-sm rounded-full border border-white/20">
              +{entry.activites_annexes.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Bouton d'action principal (nouveau) */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={onView}
          className="flex items-center gap-2 px-4 py-2 text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors bg-neon-cyan/15 hover:bg-neon-cyan/25 rounded-lg border border-neon-cyan/30"
          title="Voir les détails complets"
        >
          <span>👁️</span>
          Voir détails complets
        </button>
      </div>
    </div>
  );
}
