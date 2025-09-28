'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, X, XCircle } from 'lucide-react';

interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

interface SmartNotificationProps {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  actions?: NotificationAction[];
  autoHide?: boolean;
  duration?: number;
  onClose?: () => void;
}

interface NotificationState {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  actions?: NotificationAction[];
  autoHide?: boolean;
  duration?: number;
  onClose?: () => void;
  timestamp: number;
}

const NotificationIcon = ({ type }: { type: string }) => {
  const iconClass = 'h-5 w-5';

  switch (type) {
    case 'success':
      return <CheckCircle className={cn(iconClass, 'text-green-400')} />;
    case 'warning':
      return <AlertCircle className={cn(iconClass, 'text-yellow-400')} />;
    case 'error':
      return <XCircle className={cn(iconClass, 'text-red-400')} />;
    case 'info':
    default:
      return <Info className={cn(iconClass, 'text-blue-400')} />;
  }
};

const NotificationItem = ({
  notification,
  onClose,
}: {
  notification: NotificationState;
  onClose: (id: string) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(notification.id);
      notification.onClose?.();
    }, 300);
  }, [notification, onClose]);

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (notification.autoHide) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.autoHide, notification.duration, handleClose]);

  const getNotificationStyles = () => {
    const baseStyles =
      'glass-effect p-4 rounded-lg border transition-all duration-300 transform';

    switch (notification.type) {
      case 'success':
        return cn(baseStyles, 'border-green-500/30 bg-green-500/10', {
          'translate-x-full opacity-0': !isVisible && !isLeaving,
          '-translate-x-4 opacity-0': isLeaving,
        });
      case 'warning':
        return cn(baseStyles, 'border-yellow-500/30 bg-yellow-500/10', {
          'translate-x-full opacity-0': !isVisible && !isLeaving,
          '-translate-x-4 opacity-0': isLeaving,
        });
      case 'error':
        return cn(baseStyles, 'border-red-500/30 bg-red-500/10', {
          'translate-x-full opacity-0': !isVisible && !isLeaving,
          '-translate-x-4 opacity-0': isLeaving,
        });
      case 'info':
      default:
        return cn(baseStyles, 'border-blue-500/30 bg-blue-500/10', {
          'translate-x-full opacity-0': !isVisible && !isLeaving,
          '-translate-x-4 opacity-0': isLeaving,
        });
    }
  };

  return (
    <div
      className={getNotificationStyles()}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={notification.type} />

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-gray-300 mb-3">{notification.message}</p>

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex gap-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={cn(
                    'px-3 py-1 text-xs rounded-md font-medium transition-colors',
                    action.variant === 'primary'
                      ? 'bg-neon-cyan text-white hover:bg-neon-cyan/80'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20',
                  )}
                  aria-label={action.label}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
          aria-label="Fermer la notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function SmartNotifications() {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  // Fonction pour ajouter une notification
  const addNotification = (notification: SmartNotificationProps) => {
    const newNotification: NotificationState = {
      ...notification,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Fonction pour fermer une notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Fonction pour fermer toutes les notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Exposer les fonctions globalement pour utilisation dans l'app
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).addSmartNotification = addNotification;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).clearSmartNotifications = clearAll;
    }
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      {/* Bouton pour fermer toutes les notifications */}
      {notifications.length > 1 && (
        <button
          onClick={clearAll}
          className="w-full text-xs text-gray-400 hover:text-white transition-colors py-2"
          aria-label="Fermer toutes les notifications"
        >
          Fermer toutes les notifications
        </button>
      )}
    </div>
  );
}

// Hook pour utiliser les notifications
// Types pour l'API globale
interface GlobalWindow extends Window {
  addSmartNotification?: (notification: SmartNotificationProps) => void;
  clearSmartNotifications?: () => void;
}

export const useSmartNotifications = () => {
  const addNotification = (notification: SmartNotificationProps) => {
    if (typeof window !== 'undefined') {
      const globalWindow = window as GlobalWindow;
      if (globalWindow.addSmartNotification) {
        globalWindow.addSmartNotification(notification);
      }
    }
  };

  const clearAll = () => {
    if (typeof window !== 'undefined') {
      const globalWindow = window as GlobalWindow;
      if (globalWindow.clearSmartNotifications) {
        globalWindow.clearSmartNotifications();
      }
    }
  };

  return { addNotification, clearAll };
};
