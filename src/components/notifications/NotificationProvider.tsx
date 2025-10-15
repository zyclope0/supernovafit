'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import {
  NotificationData,
  NotificationContextType,
} from '@/types/notifications';
import toast from 'react-hot-toast';

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const notifications = useNotifications();
  const [, setActiveNotifications] = useState<Map<string, NotificationData>>(
    new Map(),
  );

  // Fonction pour afficher une notification
  const showNotification = useCallback((data: NotificationData) => {
    const id = Date.now().toString();
    setActiveNotifications((prev) => new Map(prev.set(id, data)));

    // Afficher un toast
    toast.success(data.title, {
      duration: 5000,
      icon: '🔔',
    });

    // Auto-hide après 5 secondes
    setTimeout(() => {
      hideNotification(id);
    }, 5000);
  }, []);

  // Fonction pour masquer une notification
  const hideNotification = (id: string) => {
    setActiveNotifications((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  // Fonction pour effacer toutes les notifications
  const clearAllNotifications = () => {
    setActiveNotifications(new Map());
  };

  // Exemple d'utilisation : Envoyer une notification de test
  useEffect(() => {
    if (notifications.isSupported && notifications.permission === 'granted') {
      // Délai pour éviter les notifications immédiates au chargement
      const timer = setTimeout(() => {
        // Notification de bienvenue (une seule fois)
        const hasSeenWelcome = localStorage.getItem(
          'notification-welcome-seen',
        );
        if (!hasSeenWelcome) {
          showNotification({
            type: 'system_update',
            title: '🔔 Notifications activées !',
            body: 'Vous recevrez maintenant des rappels et notifications personnalisées.',
            icon: '/icons/notification-icon.png',
            priority: 'normal',
            silent: false,
            data: {
              url: '/profil',
              analytics: {
                category: 'onboarding',
                action: 'notification_enabled',
                label: 'welcome',
              },
            },
          });
          localStorage.setItem('notification-welcome-seen', 'true');
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notifications.isSupported, notifications.permission, showNotification]);

  const contextValue: NotificationContextType = {
    ...notifications,
    showNotification,
    hideNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotificationContext must be used within a NotificationProvider',
    );
  }
  return context;
}
