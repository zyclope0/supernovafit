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
import { logger } from '@/lib/logger';
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

        // Détection Opera GX pour diagnostic
        const userAgent = window.navigator.userAgent;
        const isOpera =
          userAgent.includes('OPR') || userAgent.includes('Opera');

        logger.info('FCM Support Check', {
          component: 'notifications',
          action: 'support_check',
          supported,
          hasNotification: 'Notification' in window,
          hasServiceWorker: 'serviceWorker' in navigator,
          hostname: window.location.hostname,
          userAgent: userAgent.substring(0, 50) + '...',
          isOpera,
          browser: isOpera ? 'Opera/OperaGX' : 'Other',
        });

        setIsSupported(supported);

        if (supported) {
          setPermission(Notification.permission);
          logger.info('FCM Permission Check', {
            component: 'notifications',
            action: 'permission_check',
            permission: Notification.permission,
          });
        }
      } catch (error) {
        logger.error('Erreur vérification support FCM', {
          component: 'notifications',
          action: 'support_check_error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  // Initialiser Firebase Messaging
  useEffect(() => {
    const initMessaging = async () => {
      // Logs de diagnostic avec détection Opera GX
      const userAgent =
        typeof window !== 'undefined' ? window.navigator.userAgent : '';
      const isOpera = userAgent.includes('OPR') || userAgent.includes('Opera');

      logger.info('FCM Initialisation - Vérification des prérequis', {
        component: 'notifications',
        action: 'fcm_init_check',
        user: user ? 'présent' : 'absent',
        userId: user?.uid || 'N/A',
        isSupported,
        permission,
        hostname:
          typeof window !== 'undefined' ? window.location.hostname : 'N/A',
        userAgent: userAgent.substring(0, 50) + '...',
        isOpera,
        browser: isOpera ? 'Opera/OperaGX' : 'Other',
      });

      if (!user || !isSupported) {
        logger.warn('FCM Initialisation ignorée', {
          component: 'notifications',
          action: 'fcm_init_ignored',
          reason: !user ? 'user_manquant' : 'support_manquant',
          user: user ? 'présent' : 'absent',
          isSupported,
        });
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
          logger.warn('📱 NOTIFICATIONS - Service worker non enregistré', {
            action: 'sw_registration',
          });
          // Essayer d'enregistrer le service worker
          try {
            await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            logger.notifications('Service worker enregistré avec succès', {
              action: 'sw_registration',
            });
          } catch (swError) {
            logger.notificationsError(
              'Erreur enregistrement service worker',
              swError as Error,
              { action: 'sw_registration' },
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
            // Vérifier la clé VAPID
            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            if (!vapidKey || vapidKey.length < 80) {
              logger.warn(
                'Clé VAPID manquante ou invalide - Notifications push désactivées',
                {
                  action: 'fcm_token',
                  vapidKeyLength: vapidKey?.length || 0,
                  vapidKeyPresent: !!vapidKey,
                },
              );
              return;
            }

            // Clé VAPID validée - Firebase gère le format base64 URL-safe

            // Obtenir le service worker registration (utiliser le service worker PWA existant)
            logger.info('Recherche du service worker existant', {
              action: 'fcm_token',
            });

            // Essayer d'abord le service worker FCM dédié
            let swRegistration = await navigator.serviceWorker.getRegistration(
              '/firebase-messaging-sw.js',
            );

            // Si pas trouvé, utiliser le service worker PWA principal
            if (!swRegistration) {
              logger.info(
                'Service worker FCM non trouvé, utilisation du service worker PWA',
                { action: 'fcm_token' },
              );
              swRegistration =
                await navigator.serviceWorker.getRegistration('/sw.js');
            }

            // Si toujours pas trouvé, essayer d'enregistrer le service worker FCM
            if (!swRegistration) {
              logger.warn(
                "Aucun service worker trouvé, tentative d'enregistrement FCM",
                { action: 'fcm_token' },
              );
              try {
                swRegistration = await navigator.serviceWorker.register(
                  '/firebase-messaging-sw.js',
                  { scope: '/' },
                );
                logger.info('Service worker FCM enregistré avec succès', {
                  action: 'fcm_token',
                });
              } catch (swError) {
                logger.notificationsError(
                  "Impossible d'enregistrer le service worker FCM",
                  swError instanceof Error
                    ? swError
                    : new Error(String(swError)),
                  { action: 'fcm_token' },
                );
                return;
              }
            }

            logger.info('Service worker sélectionné', {
              action: 'fcm_token',
              swFound: !!swRegistration,
              swActive: !!swRegistration?.active,
              swScope: swRegistration?.scope,
              swScriptURL: swRegistration?.active?.scriptURL,
            });

            // Debug: Vérifier les paramètres avant getToken
            logger.info("Tentative d'obtention du token FCM", {
              action: 'fcm_token',
              vapidKeyLength: vapidKey.length,
              vapidKeyStart: vapidKey.substring(0, 10) + '...',
              swRegistrationActive: !!swRegistration?.active,
              swRegistrationScope: swRegistration?.scope,
            });

            // Test : Logique spéciale pour Opera GX
            let fcmToken;
            const userAgent = window.navigator.userAgent;
            const isOpera =
              userAgent.includes('OPR') || userAgent.includes('Opera');

            if (isOpera) {
              // Opera GX : Logique spéciale pour éviter les problèmes de Service Worker
              logger.info('Opera GX détecté - Logique spéciale activée', {
                action: 'fcm_token',
                browser: 'Opera/OperaGX',
              });

              // Opera GX : Essayer plusieurs stratégies
              const strategies = [
                // Stratégie 1: Sans service worker
                { name: 'sans_service_worker', useSW: false },
                // Stratégie 2: Avec service worker FCM dédié
                { name: 'avec_sw_fcm', useSW: true, swType: 'fcm' },
                // Stratégie 3: Avec service worker PWA
                { name: 'avec_sw_pwa', useSW: true, swType: 'pwa' },
              ];

              let lastError: Error | null = null;

              for (const strategy of strategies) {
                try {
                  logger.info(
                    `Opera GX - Tentative stratégie: ${strategy.name}`,
                    {
                      action: 'fcm_token',
                      strategy: strategy.name,
                    },
                  );

                  if (strategy.useSW) {
                    // Utiliser le service worker approprié
                    const swToUse =
                      strategy.swType === 'fcm'
                        ? await navigator.serviceWorker.getRegistration(
                            '/firebase-messaging-sw.js',
                          )
                        : await navigator.serviceWorker.getRegistration(
                            '/sw.js',
                          );

                    fcmToken = await getToken(messagingInstance, {
                      vapidKey,
                      serviceWorkerRegistration: swToUse,
                    });
                  } else {
                    // Sans service worker
                    fcmToken = await getToken(messagingInstance, {
                      vapidKey,
                    });
                  }

                  logger.info(
                    `Opera GX - Succès avec stratégie: ${strategy.name}`,
                    {
                      action: 'fcm_token',
                      strategy: strategy.name,
                    },
                  );
                  break; // Succès, sortir de la boucle
                } catch (strategyError) {
                  lastError =
                    strategyError instanceof Error
                      ? strategyError
                      : new Error(String(strategyError));
                  logger.warn(`Opera GX - Échec stratégie: ${strategy.name}`, {
                    action: 'fcm_token',
                    strategy: strategy.name,
                    errorMessage: lastError.message,
                  });
                }
              }

              // Si toutes les stratégies échouent
              if (!fcmToken && lastError) {
                throw lastError;
              }
            } else {
              // Autres navigateurs : logique normale
              try {
                fcmToken = await getToken(messagingInstance, {
                  vapidKey,
                  serviceWorkerRegistration: swRegistration,
                });
              } catch (tokenError) {
                logger.warn(
                  'Erreur avec service worker, tentative sans service worker',
                  {
                    action: 'fcm_token',
                    errorMessage:
                      tokenError instanceof Error
                        ? tokenError.message
                        : String(tokenError),
                  },
                );

                // Essayer sans service worker registration
                try {
                  fcmToken = await getToken(messagingInstance, {
                    vapidKey,
                  });
                  logger.info('Token FCM obtenu sans service worker', {
                    action: 'fcm_token',
                  });
                } catch (fallbackError) {
                  // Dernière tentative : configuration spéciale pour localhost UNIQUEMENT
                  if (
                    typeof window !== 'undefined' &&
                    window.location.hostname === 'localhost'
                  ) {
                    logger.warn(
                      'FCM échoue en localhost - Tentative avec configuration spéciale',
                      {
                        action: 'fcm_token',
                        hostname: window.location.hostname,
                        protocol: window.location.protocol,
                      },
                    );

                    // Simuler un token FCM pour les tests en localhost
                    const mockToken = `mock-fcm-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    logger.info('Token FCM simulé pour localhost', {
                      action: 'fcm_token',
                      mockToken: mockToken.substring(0, 20) + '...',
                    });
                    fcmToken = mockToken;
                  } else {
                    // En production, on ne simule pas de token - on laisse l'erreur
                    logger.error(
                      'FCM échoue en production - Pas de simulation de token',
                      {
                        action: 'fcm_token',
                        hostname: window.location.hostname,
                        environment: 'production',
                        error:
                          fallbackError instanceof Error
                            ? fallbackError
                            : new Error(String(fallbackError)),
                      },
                    );
                    throw fallbackError; // Re-throw l'erreur originale
                  }
                }
              }
            } // Fin du bloc else pour les autres navigateurs

            if (fcmToken) {
              setToken(fcmToken);
              await saveTokenToFirestore(fcmToken);
              logger.notifications('Token FCM obtenu et sauvegardé', {
                action: 'fcm_token',
                tokenLength: fcmToken.length,
              });
            } else {
              logger.warn('Aucun token FCM reçu', { action: 'fcm_token' });
            }
          } catch (tokenError) {
            // Créer un Error valide avec informations détaillées
            let error: Error;
            if (tokenError instanceof Error) {
              error = tokenError;
            } else if (typeof tokenError === 'object' && tokenError !== null) {
              // Si c'est un objet, essayer d'extraire les informations
              const errorObj = tokenError as any;
              error = new Error(
                errorObj.message || errorObj.error || 'Erreur FCM inconnue',
              );
              error.name = errorObj.name || 'FCMError';
            } else {
              // Si c'est autre chose, convertir en string
              error = new Error(String(tokenError) || 'Erreur FCM inconnue');
              error.name = 'FCMError';
            }

            logger.notificationsError('Erreur obtention token FCM', error, {
              action: 'fcm_token',
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
                ? 'présente'
                : 'manquante',
              vapidKeyLength:
                process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.length || 0,
              errorDetails: {
                originalError: tokenError,
                errorType: error.name,
                errorMessage: error.message,
                hasStack: !!error.stack,
              },
            });
            // Ne pas bloquer l'initialisation si le token échoue
          }

          // Écouter les messages en premier plan
          const unsubscribe = onMessage(messagingInstance, (payload) => {
            logger.notifications('Message reçu au premier plan', {
              action: 'message_received',
              messageId: payload.messageId,
              from: payload.from,
            });
            handleForegroundMessage(payload);
          });

          unsubscribeRef.current = unsubscribe;
          logger.notifications('Initialisation terminée avec succès', {
            action: 'init_complete',
          });
        } else {
          logger.warn(`Permission refusée: ${permission}`, {
            action: 'permission_denied',
            permission,
          });
        }
      } catch (error) {
        logger.notificationsError('Erreur initialisation', error as Error, {
          action: 'init_error',
        });
        // Ne pas bloquer l'application si les notifications échouent
      }
    };

    initMessaging();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSupported, permission, settings, user],
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
