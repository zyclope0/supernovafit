'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, History } from 'lucide-react';
import { Entrainement } from '@/types';
import { cn } from '@/lib/utils';
import { timestampToDateString } from '@/lib/dateUtils';

interface TrainingCalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  entrainements: Entrainement[];
  onShowHistory: () => void;
}

const TrainingCalendar: React.FC<TrainingCalendarProps> = ({
  selectedDate,
  onDateChange,
  entrainements,
  onShowHistory,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date(selectedDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  // Créer une map des jours avec entraînements
  const trainingsMap = useMemo(() => {
    const map = new Map<string, Entrainement[]>();
    entrainements.forEach((training) => {
      const dateKey = timestampToDateString(training.date);
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)?.push(training);
    });
    return map;
  }, [entrainements]);

  // Générer les jours du calendrier
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    // const lastDay = new Date(year, month + 1, 0) // Unused for now
    const startDate = new Date(firstDay);

    // Commencer le lundi (ISO 8601)
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    const days = [];
    const current = new Date(startDate);

    // Générer 42 jours (6 semaines)
    for (let i = 0; i < 42; i++) {
      const dateStr = (() => {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })();
      const trainingsForDay = trainingsMap.get(dateStr) || [];
      const isCurrentMonth = current.getMonth() === month;
      const todayStr = (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })();
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;

      days.push({
        date: new Date(current),
        dateStr,
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        trainings: trainingsForDay,
        hasTrainings: trainingsForDay.length > 0,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentMonth, trainingsMap, selectedDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const getTrainingIndicator = (trainings: Entrainement[]) => {
    if (trainings.length === 0) return null;

    if (trainings.length === 1) {
      const training = trainings[0];
      if (training.type.toLowerCase().includes('cardio')) {
        return <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />;
      } else if (training.type.toLowerCase().includes('musculation')) {
        return <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />;
      } else {
        return <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />;
      }
    }

    // Multiple trainings - show count
    return (
      <div className="w-4 h-4 bg-neon-purple rounded-full flex items-center justify-center">
        <span className="text-[8px] font-bold text-white">
          {trainings.length}
        </span>
      </div>
    );
  };

  return (
    <div className="glass-effect p-4 rounded-xl border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-neon-cyan" />
          <h3 className="text-lg font-semibold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowHistory}
            className="p-2 text-gray-400 hover:text-neon-cyan transition-colors rounded-lg hover:bg-white/5"
            title="Voir l'historique"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-medium text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => day.isCurrentMonth && onDateChange(day.dateStr)}
            disabled={!day.isCurrentMonth}
            className={cn(
              'relative p-2 text-sm rounded-lg transition-all duration-200 min-h-[36px]',
              'flex flex-col items-center justify-center gap-0.5',
              day.isCurrentMonth
                ? 'text-white hover:bg-white/10 cursor-pointer'
                : 'text-gray-600 cursor-not-allowed',
              day.isSelected && 'bg-neon-cyan text-white shadow-lg',
              day.isToday &&
                !day.isSelected &&
                'bg-white/10 text-neon-cyan font-semibold',
              day.hasTrainings &&
                day.isCurrentMonth &&
                !day.isSelected &&
                'bg-white/5',
            )}
          >
            <span
              className={cn(
                day.isSelected
                  ? 'font-bold'
                  : day.isToday
                    ? 'font-semibold'
                    : 'font-normal',
              )}
            >
              {day.day}
            </span>

            {/* Indicateur d'entraînements */}
            {day.hasTrainings && (
              <div className="absolute bottom-1 right-1">
                {getTrainingIndicator(day.trainings)}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Légende */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              <span>Cardio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
              <span>Musculation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span>Autre</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-neon-purple rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">2+</span>
              </div>
              <span>Multiple</span>
            </div>
          </div>

          <button
            onClick={onShowHistory}
            className="text-neon-cyan hover:text-neon-cyan/80 transition-colors flex items-center gap-1"
          >
            <History className="h-3 w-3" />
            Historique
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingCalendar;
