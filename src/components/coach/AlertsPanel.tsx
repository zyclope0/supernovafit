'use client';

import React from 'react';
import { AlertTriangle, Clock, Target, MessageSquare } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  title: string;
  message: string;
  athleteId?: string;
  athleteName?: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertsPanelProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  onDismissAlert?: (alertId: string) => void;
}

export default function AlertsPanel({
  alerts,
  onAlertClick,
  onDismissAlert,
}: AlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'info':
        return <MessageSquare className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      case 'success':
        return <Target className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow';
      case 'info':
        return 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan';
      case 'error':
        return 'border-neon-red/50 bg-neon-red/10 text-neon-red';
      case 'success':
        return 'border-neon-green/50 bg-neon-green/10 text-neon-green';
      default:
        return 'border-gray-400/50 bg-gray-400/10 text-gray-400';
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-neon-yellow/5';
      case 'info':
        return 'bg-neon-cyan/5';
      case 'error':
        return 'bg-neon-red/5';
      case 'success':
        return 'bg-neon-green/5';
      default:
        return 'bg-gray-400/5';
    }
  };

  // Grouper les alertes par type
  const groupedAlerts = alerts.reduce(
    (acc, alert) => {
      if (!acc[alert.type]) acc[alert.type] = [];
      acc[alert.type].push(alert);
      return acc;
    },
    {} as Record<string, Alert[]>,
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'warning':
        return 'Avertissements';
      case 'info':
        return 'Informations';
      case 'error':
        return 'Erreurs';
      case 'success':
        return 'Succès';
      default:
        return 'Alertes';
    }
  };

  const getTypeCount = (type: string) => {
    return groupedAlerts[type]?.length || 0;
  };

  return (
    <div className="space-y-4">
      {/* Header avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Alertes & Notifications
          </h2>
          <p className="text-gray-400 text-sm">
            {alerts.length} alerte{alerts.length > 1 ? 's' : ''} •
            {getTypeCount('warning')} avertissement
            {getTypeCount('warning') > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-neon-yellow" />
          <span className="text-sm text-gray-400">Monitoring</span>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['warning', 'info', 'error', 'success'].map((type) => {
          const count = getTypeCount(type);
          if (count === 0) return null;

          return (
            <div
              key={type}
              className={`p-3 rounded-lg border ${getAlertColor(type)} ${getAlertBgColor(type)}`}
            >
              <div className="flex items-center gap-2">
                {getAlertIcon(type)}
                <span className="text-sm font-medium capitalize">
                  {getTypeLabel(type)}
                </span>
              </div>
              <div className="text-lg font-bold mt-1">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Liste des alertes */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="glass-effect rounded-xl p-8 border border-white/10 text-center">
            <Target className="w-12 h-12 text-neon-green mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Aucune alerte
            </h3>
            <p className="text-gray-400 text-sm">
              Tous vos athlètes sont actifs et suivent leurs objectifs !
            </p>
          </div>
        ) : (
          alerts
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10) // Limiter à 10 alertes récentes
            .map((alert) => (
              <div
                key={alert.id}
                className={`glass-effect rounded-xl p-4 border ${getAlertColor(alert.type)} 
                           hover:border-opacity-70 transition-all cursor-pointer group`}
                onClick={() => onAlertClick?.(alert)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${getAlertBgColor(alert.type)}`}
                    >
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {alert.title}
                        </h4>
                        {alert.athleteName && (
                          <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                            {alert.athleteName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {alert.timestamp.toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.action && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert.action?.onClick();
                        }}
                        className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        {alert.action.label}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismissAlert?.(alert.id);
                      }}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Ignorer cette alerte"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Actions rapides */}
      {alerts.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-sm text-gray-400">
            {alerts.length > 10
              ? `+${alerts.length - 10} autres alertes`
              : 'Toutes les alertes affichées'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // Marquer toutes les alertes comme lues
                alerts.forEach((alert) => onDismissAlert?.(alert.id));
              }}
              className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Tout marquer comme lu
            </button>
            <button
              onClick={() => {
                // Voir toutes les alertes
                console.log('Voir toutes les alertes');
              }}
              className="px-3 py-1 text-xs bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple rounded-lg transition-colors"
            >
              Voir tout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
