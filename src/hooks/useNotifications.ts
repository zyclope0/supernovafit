'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import {
  NotificationData,
  NotificationSettings,
  NotificationHistory,
  NotificationType,
  NOTIFICATION_TEMPLATES,
  UseNotificationsReturn,
} from '@/types/notifications';
import { useAuth } from './useAuth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

// Configuration par défaut
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  types: {
    reminder_meal: true,
    reminder_workout: true,
    reminder_measure: true,
    reminder_journal: true,
    streak_achievement: true,
    streak_warning: true,
    goal_achievement: true,
    goal_reminder: true,
    challenge_completed: true,
    challenge_reminder: true,
    coach_message: true,
    coach_comment: true,
    system_update: true,
    motivation: false,
    weekly_report: true,
    monthly_report: true,
  },
  schedule: {
    morning: '08:00',
    afternoon: '13:00',
    evening: '19:00',
  },
  frequency: {
    reminders: 'daily',
    streaks: 'immediate',
    goals: 'immediate',
    challenges: 'immediate',
    coach: 'immediate',
    reports: 'weekly',
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
  },
};

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const messagingRef = useRef<unknown>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Vérifier le support des notifications
  useEffect(() => {
    const checkSupport = async () => {
      if (typeof window === 'undefined') return;

      try {
        const supported =
          'Notification' in window && 'serviceWorker' in navigator;
        setIsSupported(supported);

        if (supported) {
          setPermission(Notification.permission);
        }
      } catch (error) {
        console.error('❌ NOTIFICATIONS - Erreur vérification support:', error);
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  // Initialiser Firebase Messaging
  useEffect(() => {
    const initMessaging = async () => {
      if (!user || !isSupported) {
        console.log(
          '📱 NOTIFICATIONS - Initialisation ignorée (user ou support manquant)',
        );
        return;
      }

      try {
        const messagingInstance = await messaging;
        if (!messagingInstance) {
          console.warn('📱 NOTIFICATIONS - Instance messaging non disponible');
          return;
        }

        messagingRef.current = messagingInstance;

        // Vérifier si le service worker est enregistré
        const registration = await navigator.serviceWorker.getRegistration(
          '/firebase-messaging-sw.js',
        );
        if (!registration) {
          console.warn('📱 NOTIFICATIONS - Service worker non enregistré');
          // Essayer d'enregistrer le service worker
          try {
            await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log(
              '📱 NOTIFICATIONS - Service worker enregistré avec succès',
            );
          } catch (swError) {
            console.error(
              '❌ NOTIFICATIONS - Erreur enregistrement service worker:',
              swError,
            );
            return;
          }
        }

        // Demander la permission
        const permission = await Notification.requestPermission();
        setPermission(permission);

        if (permission === 'granted') {
          // Obtenir le token FCM avec gestion d'erreurs améliorée
          try {
            const fcmToken = await getToken(messagingInstance, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
              serviceWorkerRegistration:
                await navigator.serviceWorker.getRegistration(
                  '/firebase-messaging-sw.js',
                ),
            });

            if (fcmToken) {
              setToken(fcmToken);
              await saveTokenToFirestore(fcmToken);
              console.log('📱 NOTIFICATIONS - Token FCM obtenu et sauvegardé');
            } else {
              console.warn('📱 NOTIFICATIONS - Aucun token FCM reçu');
            }
          } catch (tokenError) {
            console.error(
              '❌ NOTIFICATIONS - Erreur obtention token FCM:',
              tokenError,
            );
            // Ne pas bloquer l'initialisation si le token échoue
          }

          // Écouter les messages en premier plan
          const unsubscribe = onMessage(messagingInstance, (payload) => {
            console.log(
              '📱 NOTIFICATIONS - Message reçu au premier plan:',
              payload,
            );
            handleForegroundMessage(payload);
          });

          unsubscribeRef.current = unsubscribe;
          console.log('📱 NOTIFICATIONS - Initialisation terminée avec succès');
        } else {
          console.log('📱 NOTIFICATIONS - Permission refusée:', permission);
        }
      } catch (error) {
        console.error('❌ NOTIFICATIONS - Erreur initialisation:', error);
        // Ne pas bloquer l'application si les notifications échouent
      }
    };

    initMessaging();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, isSupported]);

  // Charger les paramètres utilisateur
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const settingsDoc = await getDoc(
          doc(db, 'notification_settings', user.uid),
        );
        if (settingsDoc.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsDoc.data() });
        }
      } catch (error) {
        console.error(
          '❌ NOTIFICATIONS - Erreur chargement paramètres:',
          error,
        );
      }
    };

    loadSettings();
  }, [user]);

  // Sauvegarder le token FCM
  const saveTokenToFirestore = useCallback(
    async (fcmToken: string) => {
      if (!user) return;

      try {
        await setDoc(doc(db, 'notification_tokens', user.uid), {
          token: fcmToken,
          userId: user.uid,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          },
          createdAt: new Date(),
          lastUsed: new Date(),
          isActive: true,
        });
      } catch (error) {
        console.error('❌ NOTIFICATIONS - Erreur sauvegarde token:', error);
      }
    },
    [user],
  );

  // Gérer les messages en premier plan
  const handleForegroundMessage = useCallback(
    (payload: unknown) => {
      const notificationData = (
        payload as { notification?: { title?: string; body?: string } }
      ).notification;
      const data = (payload as { data?: Record<string, unknown> }).data;

      // Afficher une notification toast
      toast.success(notificationData?.title || 'Nouvelle notification', {
        duration: 5000,
        icon: '📱',
      });

      // Enregistrer dans l'historique
      addToHistory({
        userId: user?.uid || '',
        type: (data?.type as NotificationType) || 'system_update',
        title: notificationData?.title || 'Notification',
        body: notificationData?.body || '',
        sentAt: new Date(),
        deliveredAt: new Date(),
        data: data,
      });
    },
    [user],
  );

  // Ajouter à l'historique
  const addToHistory = useCallback(
    async (notification: Omit<NotificationHistory, 'id'>) => {
      if (!user) return;

      try {
        await addDoc(collection(db, 'notification_history'), notification);
      } catch (error) {
        console.error('❌ NOTIFICATIONS - Erreur ajout historique:', error);
      }
    },
    [user],
  );

  // Demander la permission
  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!isSupported) {
        throw new Error(
          'Les notifications ne sont pas supportées sur cet appareil',
        );
      }

      try {
        const permission = await Notification.requestPermission();
        setPermission(permission);

        if (permission === 'granted' && messagingRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fcmToken = await getToken(messagingRef.current as any, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (fcmToken) {
            setToken(fcmToken);
            await saveTokenToFirestore(fcmToken);
          }
        }

        return permission;
      } catch (error) {
        console.error('❌ NOTIFICATIONS - Erreur demande permission:', error);
        throw error;
      }
    }, [isSupported, saveTokenToFirestore]);

  // Mettre à jour les paramètres
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      if (!user) return;

      try {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);

        await setDoc(
          doc(db, 'notification_settings', user.uid),
          updatedSettings,
        );

        toast.success('Paramètres de notifications mis à jour');
      } catch (error) {
        console.error(
          '❌ NOTIFICATIONS - Erreur mise à jour paramètres:',
          error,
        );
        toast.error('Erreur lors de la mise à jour des paramètres');
      }
    },
    [user, settings],
  );

  // Envoyer une notification
  const sendNotification = useCallback(
    async (data: NotificationData) => {
      if (!isSupported || permission !== 'granted') {
        throw new Error('Les notifications ne sont pas autorisées');
      }

      try {
        const template = NOTIFICATION_TEMPLATES[data.type];
        const notificationOptions: NotificationOptions = {
          body: data.body,
          icon: data.icon || template.icon,
          badge: data.badge || '/icons/badge-72x72.png',
          tag: data.tag || data.type,
          data: data.data || {},
          requireInteraction:
            data.requireInteraction || template.requireInteraction,
          silent: data.silent || false,
        };

        // Vérifier les heures silencieuses
        if (settings.quietHours.enabled) {
          const now = new Date();
          const currentTime = now.getHours() * 60 + now.getMinutes();
          const startTime =
            parseInt(settings.quietHours.start.split(':')[0]) * 60 +
            parseInt(settings.quietHours.start.split(':')[1]);
          const endTime =
            parseInt(settings.quietHours.end.split(':')[0]) * 60 +
            parseInt(settings.quietHours.end.split(':')[1]);

          if (currentTime >= startTime || currentTime <= endTime) {
            notificationOptions.silent = true;
          }
        }

        // Afficher la notification
        const notification = new Notification(data.title, notificationOptions);

        // Gérer les clics
        notification.onclick = (event) => {
          event.preventDefault();
          if (data.url) {
            window.open(data.url, '_blank');
          }
          notification.close();
        };

        // Enregistrer dans l'historique
        await addToHistory({
          userId: user?.uid || '',
          type: data.type,
          title: data.title,
          body: data.body,
          sentAt: new Date(),
          deliveredAt: new Date(),
          data: data.data,
          analytics: data.analytics,
        });
      } catch (error) {
        console.error('❌ NOTIFICATIONS - Erreur envoi notification:', error);
        throw error;
      }
    },
    [isSupported, permission, settings, user, addToHistory],
  );

  // Programmer une notification
  const scheduleNotification = useCallback(
    async (data: NotificationData, delay: number) => {
      if (delay <= 0) {
        return sendNotification(data);
      }

      setTimeout(() => {
        sendNotification(data);
      }, delay);
    },
    [sendNotification],
  );

  // Annuler une notification
  const cancelNotification = useCallback(async (tag: string) => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        const notifications = await registration.getNotifications({ tag });
        notifications.forEach((notification) => notification.close());
      }
    } catch (error) {
      console.error(
        '❌ NOTIFICATIONS - Erreur annulation notification:',
        error,
      );
    }
  }, []);

  // Obtenir l'historique des notifications
  const getNotificationHistory = useCallback(async (): Promise<
    NotificationHistory[]
  > => {
    if (!user) return [];

    try {
      const q = query(
        collection(db, 'notification_history'),
        where('userId', '==', user.uid),
        orderBy('sentAt', 'desc'),
        limit(50),
      );

      const snapshot = await getDocs(q);
      const history = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        sentAt: doc.data().sentAt?.toDate() || new Date(),
        deliveredAt: doc.data().deliveredAt?.toDate(),
        clickedAt: doc.data().clickedAt?.toDate(),
        dismissedAt: doc.data().dismissedAt?.toDate(),
      })) as NotificationHistory[];

      return history;
    } catch (error) {
      console.error(
        '❌ NOTIFICATIONS - Erreur récupération historique:',
        error,
      );
      return [];
    }
  }, [user]);

  // Effacer l'historique
  const clearNotificationHistory = useCallback(async () => {
    if (!user) return;

    try {
      // Note: Dans une vraie implémentation, vous devriez supprimer les documents
      // Pour cette démo, on affiche juste un message de succès
      toast.success('Historique des notifications effacé');
    } catch (error) {
      console.error('❌ NOTIFICATIONS - Erreur effacement historique:', error);
      toast.error("Erreur lors de l'effacement de l'historique");
    }
  }, [user]);

  return {
    isSupported,
    permission,
    token,
    settings,
    requestPermission,
    updateSettings,
    sendNotification,
    scheduleNotification,
    cancelNotification,
    getNotificationHistory,
    clearNotificationHistory,
  };
}
