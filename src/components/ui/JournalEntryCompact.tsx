'use client';

import { JournalEntry } from '@/types';
import { timestampToDateString } from '@/lib/dateUtils';

interface JournalEntryCompactProps {
  entry: JournalEntry;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Emojis pour les niveaux
const EMOJI_LEVELS: Record<number, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '😕',
  5: '😐',
  6: '🙂',
  7: '😊',
  8: '😄',
  9: '😁',
  10: '🤩',
};

// Emojis météo
const METEO_EMOJI: Record<string, string> = {
  soleil: '☀️',
  nuage: '☁️',
  pluie: '🌧️',
  orage: '⛈️',
  neige: '❄️',
};

export default function JournalEntryCompact({
  entry,
  onView,
  onEdit,
  onDelete,
}: JournalEntryCompactProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }
  };

  return (
    <div
      className="glass-effect-high p-3 rounded-lg border border-white/20 hover:border-neon-cyan/40 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/20 group cursor-pointer"
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView();
        }
      }}
      aria-label={`Voir les détails de l'entrée journal du ${formatDate(timestampToDateString(entry.date))}`}
    >
      {/* Header compact */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white text-sm group-hover:text-neon-cyan transition-colors">
            {formatDate(timestampToDateString(entry.date))}
          </span>
          {entry.meteo && (
            <span className="text-sm opacity-75">
              {METEO_EMOJI[entry.meteo]}
            </span>
          )}
        </div>

        {/* Actions compactes */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 hover:bg-neon-cyan/20 rounded transition-colors"
            title="Modifier"
          >
            <span className="text-neon-cyan text-sm">✏️</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
            title="Supprimer"
          >
            <span className="text-red-400 text-sm">🗑️</span>
          </button>
        </div>
      </div>

      {/* Indicateurs compacts en une ligne */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {entry.humeur && (
          <div className="flex items-center gap-1 px-2 py-1 bg-neon-green/10 rounded text-xs">
            <span>{EMOJI_LEVELS[entry.humeur]}</span>
            <span className="text-neon-green font-medium">{entry.humeur}</span>
          </div>
        )}
        {entry.energie && (
          <div className="flex items-center gap-1 px-2 py-1 bg-neon-cyan/10 rounded text-xs">
            <span>⚡</span>
            <span className="text-neon-cyan font-medium">{entry.energie}</span>
          </div>
        )}
        {entry.sommeil_qualite && (
          <div className="flex items-center gap-1 px-2 py-1 bg-neon-purple/10 rounded text-xs">
            <span>😴</span>
            <span className="text-neon-purple font-medium">
              {entry.sommeil_qualite}
            </span>
          </div>
        )}
        {entry.stress && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 rounded text-xs">
            <span>😰</span>
            <span className="text-orange-400 font-medium">{entry.stress}</span>
          </div>
        )}
      </div>

      {/* Activités compactes (si présentes) */}
      {entry.activites_annexes && entry.activites_annexes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.activites_annexes.slice(0, 2).map((activite, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-neon-purple/15 text-neon-purple text-xs rounded border border-neon-purple/30"
            >
              {activite}
            </span>
          ))}
          {entry.activites_annexes.length > 2 && (
            <span className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded border border-white/20">
              +{entry.activites_annexes.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Note compacte (première ligne seulement) */}
      {entry.note && (
        <div className="mt-2 text-xs text-white/80 line-clamp-1">
          {entry.note.length > 60
            ? `${entry.note.slice(0, 60)}...`
            : entry.note}
        </div>
      )}
    </div>
  );
}
