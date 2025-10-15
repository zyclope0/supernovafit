'use client';

import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Volume2,
  VolumeX,
  Settings,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import {
  NotificationSettings as NotificationSettingsType,
  NotificationType,
} from '@/types/notifications';

interface NotificationSettingsProps {
  onClose?: () => void;
}

export default function NotificationSettings({
  onClose,
}: NotificationSettingsProps) {
  const { settings, updateSettings, isSupported, permission } =
    useNotifications();
  const [localSettings, setLocalSettings] =
    useState<NotificationSettingsType>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (type: NotificationType, enabled: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: enabled,
      },
    }));
  };

  const handleScheduleChange = (
    period: 'morning' | 'afternoon' | 'evening',
    time: string,
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [period]: time,
      },
    }));
  };

  // const handleFrequencyChange = (category: keyof NotificationSettingsType['frequency'], value: string) => {
  //   setLocalSettings(prev => ({
  //     ...prev,
  //     frequency: {
  //       ...prev.frequency,
  //       [category]: value as any,
  //     },
  //   }));
  // };

  const handleQuietHoursChange = (
    enabled: boolean,
    start?: string,
    end?: string,
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      quietHours: {
        enabled,
        start: start || prev.quietHours.start,
        end: end || prev.quietHours.end,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      onClose?.();
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  const getTypeLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
      reminder_meal: 'Rappels repas',
      reminder_workout: 'Rappels entraînement',
      reminder_measure: 'Rappels mesures',
      reminder_journal: 'Rappels journal',
      streak_achievement: 'Streaks atteints',
      streak_warning: 'Avertissements streaks',
      goal_achievement: 'Objectifs atteints',
      goal_reminder: 'Rappels objectifs',
      challenge_completed: 'Challenges complétés',
      challenge_reminder: 'Rappels challenges',
      coach_message: 'Messages du coach',
      coach_comment: 'Commentaires du coach',
      system_update: 'Mises à jour système',
      motivation: 'Messages de motivation',
      weekly_report: 'Rapports hebdomadaires',
      monthly_report: 'Rapports mensuels',
    };
    return labels[type];
  };

  const getTypeDescription = (type: NotificationType): string => {
    const descriptions: Record<NotificationType, string> = {
      reminder_meal: 'Rappels pour noter vos repas',
      reminder_workout: 'Rappels pour vos entraînements',
      reminder_measure: 'Rappels pour prendre vos mesures',
      reminder_journal: 'Rappels pour votre journal',
      streak_achievement: 'Notifications de streaks atteints',
      streak_warning: 'Avertissements de streaks en danger',
      goal_achievement: "Notifications d'objectifs atteints",
      goal_reminder: 'Rappels de progression vers vos objectifs',
      challenge_completed: 'Notifications de challenges complétés',
      challenge_reminder: 'Rappels de challenges en cours',
      coach_message: 'Messages de votre coach',
      coach_comment: 'Commentaires sur vos activités',
      system_update: "Mises à jour de l'application",
      motivation: 'Messages de motivation personnalisés',
      weekly_report: 'Rapports de progression hebdomadaires',
      monthly_report: 'Rapports de progression mensuels',
    };
    return descriptions[type];
  };

  if (!isSupported) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-white/10 text-center">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Notifications non supportées
        </h3>
        <p className="text-gray-400 text-sm">
          Votre navigateur ne supporte pas les notifications push
        </p>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="glass-effect rounded-xl p-6 border border-white/10 text-center">
        <VolumeX className="w-12 h-12 text-neon-red mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Notifications bloquées
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Les notifications sont bloquées dans les paramètres de votre
          navigateur
        </p>
        <p className="text-xs text-gray-500">
          Pour les activer, allez dans les paramètres de votre navigateur et
          autorisez les notifications pour ce site
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-neon-purple" />
          <h2 className="text-xl font-bold text-white">
            Paramètres des notifications
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Personnalisation</span>
        </div>
      </div>

      {/* Statut global */}
      <div className="glass-effect rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${localSettings.enabled ? 'bg-neon-green/20' : 'bg-gray-400/20'}`}
            >
              {localSettings.enabled ? (
                <Volume2 className="w-4 h-4 text-neon-green" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Notifications
              </h3>
              <p className="text-sm text-gray-400">
                {localSettings.enabled ? 'Activées' : 'Désactivées'}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setLocalSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              localSettings.enabled
                ? 'bg-neon-green/20 text-neon-green hover:bg-neon-green/30'
                : 'bg-gray-400/20 text-gray-400 hover:bg-gray-400/30'
            }`}
          >
            {localSettings.enabled ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      </div>

      {localSettings.enabled && (
        <>
          {/* Types de notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Types de notifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(localSettings.types).map(([type, enabled]) => (
                <div
                  key={type}
                  className="glass-effect rounded-lg p-4 border border-white/10 hover:border-neon-purple/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">
                        {getTypeLabel(type as NotificationType)}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {getTypeDescription(type as NotificationType)}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleSettingChange(type as NotificationType, !enabled)
                      }
                      className={`ml-3 p-1 rounded transition-colors ${
                        enabled
                          ? 'bg-neon-green/20 text-neon-green'
                          : 'bg-gray-400/20 text-gray-400'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${enabled ? 'bg-neon-green' : 'bg-gray-400'}`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Horaires de rappel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Horaires de rappel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(localSettings.schedule).map(([period, time]) => (
                <div
                  key={period}
                  className="glass-effect rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-neon-cyan" />
                    <span className="text-sm font-medium text-white capitalize">
                      {period === 'morning'
                        ? 'Matin'
                        : period === 'afternoon'
                          ? 'Après-midi'
                          : 'Soir'}
                    </span>
                  </div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) =>
                      handleScheduleChange(
                        period as 'morning' | 'afternoon' | 'evening',
                        e.target.value,
                      )
                    }
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-neon-cyan"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Heures silencieuses */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Heures silencieuses
            </h3>
            <div className="glass-effect rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-neon-yellow" />
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      Mode silencieux
                    </h4>
                    <p className="text-xs text-gray-400">
                      Désactiver les notifications pendant certaines heures
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleQuietHoursChange(!localSettings.quietHours.enabled)
                  }
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    localSettings.quietHours.enabled
                      ? 'bg-neon-yellow/20 text-neon-yellow'
                      : 'bg-gray-400/20 text-gray-400'
                  }`}
                >
                  {localSettings.quietHours.enabled ? 'Activé' : 'Désactivé'}
                </button>
              </div>

              {localSettings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Début
                    </label>
                    <input
                      type="time"
                      value={localSettings.quietHours.start}
                      onChange={(e) =>
                        handleQuietHoursChange(true, e.target.value)
                      }
                      className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-neon-yellow"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Fin
                    </label>
                    <input
                      type="time"
                      value={localSettings.quietHours.end}
                      onChange={(e) =>
                        handleQuietHoursChange(
                          true,
                          localSettings.quietHours.start,
                          e.target.value,
                        )
                      }
                      className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-neon-yellow"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </button>

        <div className="flex gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
