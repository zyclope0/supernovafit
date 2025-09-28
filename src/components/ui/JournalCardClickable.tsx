'use client';

import React from 'react';
import { JournalEntry } from '@/types';
import { Calendar, Heart, Zap, Battery, CloudRain, Moon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ClickableCard from './ClickableCard';

interface JournalCardClickableProps {
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

export default function JournalCardClickable({
  entry,
  onView,
  onEdit,
  onDelete,
}: JournalCardClickableProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEEE d MMMM', { locale: fr });
    } catch {
      return dateStr;
    }
  };

  const getOverallMood = () => {
    const scores = [entry.humeur, entry.energie, entry.motivation].filter(
      Boolean,
    );
    if (scores.length === 0) return null;
    const average =
      scores.reduce((sum, score) => sum + (score || 0), 0) / scores.length;
    return Math.round(average);
  };

  const overallMood = getOverallMood();

  return (
    <ClickableCard
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      viewLabel="Voir détails"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* En-tête */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📔</span>
            <div>
              <h3 className="font-medium text-white group-hover:text-neon-cyan transition-colors">
                Journal du jour
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(entry.date)}
              </div>
            </div>
          </div>

          {/* Métriques principales */}
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            {entry.humeur && (
              <div className="flex items-center gap-1 text-sm">
                <Heart className="h-4 w-4 text-neon-pink" />
                <span className="text-lg">
                  {EMOJI_LEVELS[entry.humeur as keyof typeof EMOJI_LEVELS]}
                </span>
                <span className="text-white font-medium">{entry.humeur}</span>
                <span className="text-muted-foreground">/10</span>
              </div>
            )}

            {entry.energie && (
              <div className="flex items-center gap-1 text-sm">
                <Zap className="h-4 w-4 text-neon-yellow" />
                <span className="text-lg">
                  {EMOJI_LEVELS[entry.energie as keyof typeof EMOJI_LEVELS]}
                </span>
                <span className="text-white font-medium">{entry.energie}</span>
                <span className="text-muted-foreground">/10</span>
              </div>
            )}

            {entry.motivation && (
              <div className="flex items-center gap-1 text-sm">
                <Battery className="h-4 w-4 text-neon-green" />
                <span className="text-lg">
                  {EMOJI_LEVELS[entry.motivation as keyof typeof EMOJI_LEVELS]}
                </span>
                <span className="text-white font-medium">
                  {entry.motivation}
                </span>
                <span className="text-muted-foreground">/10</span>
              </div>
            )}

            {entry.meteo && (
              <div className="flex items-center gap-1 text-sm">
                <span className="text-lg">
                  {METEO_EMOJI[entry.meteo as keyof typeof METEO_EMOJI]}
                </span>
                <span className="text-muted-foreground capitalize">
                  {entry.meteo}
                </span>
              </div>
            )}
          </div>

          {/* Données secondaires */}
          <div className="flex items-center gap-2 sm:gap-4 mb-3 text-xs flex-wrap">
            {entry.sommeil_duree && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Moon className="h-3 w-3" />
                <span>{entry.sommeil_duree}h sommeil</span>
              </div>
            )}

            {entry.fatigue && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <CloudRain className="h-3 w-3" />
                <span>Fatigue: {entry.fatigue}/10</span>
              </div>
            )}

            {entry.activites_annexes && entry.activites_annexes.length > 0 && (
              <div className="text-muted-foreground">
                {entry.activites_annexes.length} activité
                {entry.activites_annexes.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Note (aperçu) */}
          {entry.note && (
            <div className="text-sm text-muted-foreground bg-white/5 p-3 rounded-lg">
              &quot;
              {entry.note.length > 100
                ? `${entry.note.slice(0, 100)}...`
                : entry.note}
              &quot;
            </div>
          )}

          {/* Mood global */}
          {overallMood && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Humeur générale:
              </span>
              <span className="text-lg">
                {EMOJI_LEVELS[overallMood as keyof typeof EMOJI_LEVELS]}
              </span>
              <span className="text-sm font-medium text-white">
                {overallMood}/10
              </span>
            </div>
          )}
        </div>
      </div>
    </ClickableCard>
  );
}
