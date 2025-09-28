'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, BarChart3, Eye } from 'lucide-react';
import StandardModal from './StandardModal';

interface HistoryItem {
  id: string;
  date: string;
  [key: string]: string | number | boolean | undefined;
}

interface MultiModeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: HistoryItem[];
  currentDate?: string;
  onDateChange?: (date: string) => void;
  onItemClick?: (item: HistoryItem) => void;
  renderItem: (item: HistoryItem, onClick: () => void) => React.ReactNode;
  getItemStats?: (
    date: string,
    items: HistoryItem[],
  ) => Record<string, unknown>;
  renderStats?: (stats: Record<string, unknown>) => React.ReactNode;
}

export default function MultiModeHistoryModalStandard({
  isOpen,
  onClose,
  title,
  items,
  currentDate,
  onDateChange,
  onItemClick,
  renderItem,
  getItemStats,
  renderStats,
}: MultiModeHistoryModalProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'stats' | 'list'>(
    'calendar',
  );
  const [selectedDate, setSelectedDate] = useState(
    currentDate || new Date().toISOString().split('T')[0],
  );

  // Filtrer les items par date sélectionnée
  const filteredItems = useMemo(() => {
    if (!selectedDate) return items;
    return items.filter((item) => item.date === selectedDate);
  }, [items, selectedDate]);

  // Statistiques pour la date sélectionnée
  const stats = useMemo(() => {
    if (!getItemStats) return null;
    return getItemStats(selectedDate, filteredItems);
  }, [selectedDate, filteredItems, getItemStats]);

  // Gérer le changement de date
  const handleDateChange = useCallback(
    (date: string) => {
      setSelectedDate(date);
      onDateChange?.(date);
    },
    [onDateChange],
  );

  // Gérer le clic sur un item
  const handleItemClick = useCallback(
    (item: HistoryItem) => {
      onItemClick?.(item);
    },
    [onItemClick],
  );

  if (!isOpen) return null;

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<Calendar className="h-6 w-6 text-neon-cyan" />}
      maxWidth="4xl"
      height="90vh"
    >
      <div className="space-y-6">
        {/* Navigation des modes */}
        <div className="flex items-center justify-between">
          <div className="flex bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-neon-cyan/20 text-neon-cyan'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Calendar className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'stats'
                  ? 'bg-neon-cyan/20 text-neon-cyan'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-neon-cyan/20 text-neon-cyan'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Contenu selon le mode */}
        {viewMode === 'calendar' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-white">Date :</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-cyan"
              />
            </div>
            <div className="space-y-3">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div key={item.id} onClick={() => handleItemClick(item)}>
                    {renderItem(item, () => handleItemClick(item))}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun élément trouvé pour cette date
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'stats' && (
          <div className="space-y-4">
            {stats && renderStats ? (
              renderStats(stats)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune statistique disponible
              </div>
            )}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-3">
            {items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} onClick={() => handleItemClick(item)}>
                  {renderItem(item, () => handleItemClick(item))}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun élément trouvé
              </div>
            )}
          </div>
        )}
      </div>
    </StandardModal>
  );
}
