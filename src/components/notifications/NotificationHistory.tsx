'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Eye, EyeOff, Trash2, Calendar, Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type {
  NotificationHistory,
  NotificationType,
} from '@/types/notifications';

interface NotificationHistoryProps {
  onClose?: () => void;
}

export default function NotificationHistory({
  onClose,
}: NotificationHistoryProps) {
  const { getNotificationHistory, clearNotificationHistory } =
    useNotifications();
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [showRead, setShowRead] = useState(true);

  const loadHistory = React.useCallback(async () => {
    setLoading(true);
    try {
      const notifications = await getNotificationHistory();
      setHistory(notifications);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setLoading(false);
    }
  }, [getNotificationHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleClearHistory = async () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir effacer tout l'historique des notifications ?",
      )
    ) {
      try {
        await clearNotificationHistory();
        setHistory([]);
      } catch (error) {
        console.error('Erreur effacement historique:', error);
      }
    }
  };

  const getTypeIcon = (type: NotificationType): string => {
    const icons: Record<NotificationType, string> = {
      reminder_meal: '🍽️',
      reminder_workout: '🏋️',
      reminder_measure: '📏',
      reminder_journal: '📝',
      streak_achievement: '🔥',
      streak_warning: '⚠️',
      goal_achievement: '🎯',
      goal_reminder: '🎯',
      challenge_completed: '🏆',
      challenge_reminder: '🏆',
      coach_message: '👨‍🏫',
      coach_comment: '💬',
      system_update: '🔄',
      motivation: '💪',
      weekly_report: '📊',
      monthly_report: '📈',
    };
    return icons[type] || '🔔';
  };

  const getTypeLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
      reminder_meal: 'Rappel repas',
      reminder_workout: 'Rappel entraînement',
      reminder_measure: 'Rappel mesures',
      reminder_journal: 'Rappel journal',
      streak_achievement: 'Streak atteint',
      streak_warning: 'Avertissement streak',
      goal_achievement: 'Objectif atteint',
      goal_reminder: 'Rappel objectif',
      challenge_completed: 'Challenge complété',
      challenge_reminder: 'Rappel challenge',
      coach_message: 'Message coach',
      coach_comment: 'Commentaire coach',
      system_update: 'Mise à jour',
      motivation: 'Motivation',
      weekly_report: 'Rapport hebdomadaire',
      monthly_report: 'Rapport mensuel',
    };
    return labels[type] || 'Notification';
  };

  const getStatusColor = (notification: NotificationHistory): string => {
    if (notification.clickedAt) return 'text-neon-green';
    if (notification.dismissedAt) return 'text-neon-red';
    if (notification.deliveredAt) return 'text-neon-cyan';
    return 'text-gray-400';
  };

  const getStatusText = (notification: NotificationHistory): string => {
    if (notification.clickedAt) return 'Ouverte';
    if (notification.dismissedAt) return 'Ignorée';
    if (notification.deliveredAt) return 'Livrée';
    return 'Envoyée';
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const filteredHistory = history.filter((notification) => {
    if (filter !== 'all' && notification.type !== filter) return false;
    if (!showRead && notification.clickedAt) return false;
    return true;
  });

  const typeOptions: Array<{ value: NotificationType | 'all'; label: string }> =
    [
      { value: 'all', label: 'Toutes' },
      { value: 'reminder_meal', label: 'Rappels repas' },
      { value: 'reminder_workout', label: 'Rappels entraînement' },
      { value: 'reminder_measure', label: 'Rappels mesures' },
      { value: 'reminder_journal', label: 'Rappels journal' },
      { value: 'streak_achievement', label: 'Streaks' },
      { value: 'goal_achievement', label: 'Objectifs' },
      { value: 'challenge_completed', label: 'Challenges' },
      { value: 'coach_message', label: 'Coach' },
      { value: 'system_update', label: 'Système' },
    ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-neon-purple" />
          <h2 className="text-xl font-bold text-white">
            Historique des notifications
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            {history.length} notifications
          </span>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as NotificationType | 'all')
            }
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-neon-purple"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowRead(!showRead)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showRead
                ? 'bg-neon-green/20 text-neon-green'
                : 'bg-gray-400/20 text-gray-400'
            }`}
          >
            {showRead ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            {showRead ? 'Lues' : 'Non lues'}
          </button>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-3 py-2 bg-neon-red/20 hover:bg-neon-red/30 text-neon-red rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Effacer
          </button>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-purple"></div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="glass-effect rounded-xl p-8 border border-white/10 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Aucune notification
            </h3>
            <p className="text-gray-400 text-sm">
              {filter === 'all'
                ? "Vous n'avez pas encore reçu de notifications"
                : 'Aucune notification de ce type trouvée'}
            </p>
          </div>
        ) : (
          filteredHistory.map((notification) => (
            <div
              key={notification.id}
              className="glass-effect rounded-xl p-4 border border-white/10 hover:border-neon-purple/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Icône du type */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                    {getTypeIcon(notification.type)}
                  </div>
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-white truncate">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {getTypeLabel(notification.type)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span
                        className={`text-xs ${getStatusColor(notification)}`}
                      >
                        {getStatusText(notification)}
                      </span>
                      <Clock className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {notification.body}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {formatDate(notification.sentAt)}
                    </span>

                    {(notification.data?.url as string) && (
                      <button
                        onClick={() =>
                          window.open(
                            notification.data?.url as string,
                            '_blank',
                          )
                        }
                        className="text-xs text-neon-purple hover:text-neon-purple/80 transition-colors"
                      >
                        Ouvrir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      {onClose && (
        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
