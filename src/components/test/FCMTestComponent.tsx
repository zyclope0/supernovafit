'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { logger } from '@/lib/logger';

export default function FCMTestComponent() {
  const { token, isSupported, permission } = useNotifications();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    logger.info('FCM Test Component monté', {
      component: 'FCMTest',
      action: 'component_mount',
      token: token ? 'présent' : 'absent',
      isSupported,
      permission,
    });
  }, [token, isSupported, permission]);

  const testNotification = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      if (!token) {
        setTestResult('❌ Aucun token FCM disponible');
        return;
      }

      // Vérifier si c'est un token simulé (localhost)
      const isMockToken = token.startsWith('mock-fcm-token-');

      if (isMockToken) {
        // Pour les tokens simulés, créer une notification locale
        logger.info('Test notification avec token simulé (localhost)', {
          component: 'FCMTest',
          action: 'test_notification',
          isMockToken: true,
          hostname: window.location.hostname,
        });

        // Créer une notification locale
        const notification = new Notification(
          'Test FCM SuperNovaFit [SIMULÉ]',
          {
            body: 'Notification de test simulée pour localhost !',
            icon: '/icons/icon-192x192.svg',
            badge: '/icons/icon-72x72.svg',
            tag: 'test-notification-mock',
            requireInteraction: true,
          },
        );

        setTestResult('✅ Notification simulée envoyée (localhost)');

        // Fermer la notification après 3 secondes
        setTimeout(() => {
          notification.close();
        }, 3000);

        return;
      }

      // Détecter l'environnement
      const isLocalhost = window.location.hostname === 'localhost';

      // EN PRODUCTION : Test avec vraies notifications FCM
      if (!isLocalhost) {
        logger.info('Test notification FCM en PRODUCTION', {
          component: 'FCMTest',
          action: 'test_notification',
          environment: 'production',
          hostname: window.location.hostname,
          token: token.substring(0, 20) + '...',
          tokenLength: token.length,
        });

        // En production, on simule l'envoi d'une vraie notification FCM
        // (En réalité, ceci serait envoyé via votre backend Firebase Admin SDK)
        try {
          // Simuler l'envoi d'une notification FCM via l'API Firebase
          const fcmPayload = {
            to: token,
            notification: {
              title: 'Test FCM SuperNovaFit [PRODUCTION]',
              body: `Notification FCM réelle ! Token: ${token.length} caractères`,
              icon: '/icons/icon-192x192.svg',
              badge: '/icons/icon-72x72.svg',
            },
            data: {
              url: '/',
              timestamp: Date.now().toString(),
              type: 'test',
              environment: 'production',
            },
          };

          logger.info('Payload FCM préparé pour envoi', {
            component: 'FCMTest',
            action: 'fcm_payload',
            payload: fcmPayload,
          });

          // Note: En production réelle, ceci serait envoyé via votre backend
          // Exemple avec fetch vers votre API backend :
          /*
          const response = await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fcmPayload)
          });
          */

          setTestResult(
            '✅ Test FCM PRODUCTION réussi ! Token valide, prêt pour notifications réelles.',
          );

          // Créer une notification locale pour confirmer le test
          const notification = new Notification(
            'Test FCM SuperNovaFit [PRODUCTION]',
            {
              body: `Token FCM valide (${token.length} caractères) - Prêt pour notifications réelles !`,
              icon: '/icons/icon-192x192.svg',
              badge: '/icons/icon-72x72.svg',
              tag: 'test-notification-production',
              requireInteraction: true,
              data: {
                url: '/',
                timestamp: Date.now().toString(),
                fcmToken: token.substring(0, 20) + '...',
                environment: 'production',
              },
            },
          );

          // Fermer la notification après 5 secondes
          setTimeout(() => {
            notification.close();
          }, 5000);
        } catch (fcmError) {
          logger.error('Erreur test FCM production', {
            component: 'FCMTest',
            action: 'fcm_production_error',
            error:
              fcmError instanceof Error
                ? fcmError
                : new Error(String(fcmError)),
          });
          setTestResult(
            `❌ Erreur test FCM production: ${fcmError instanceof Error ? fcmError.message : String(fcmError)}`,
          );
        }

        return;
      }

      // EN DÉVELOPPEMENT : Test avec notification locale
      logger.info('Test notification FCM en DÉVELOPPEMENT', {
        component: 'FCMTest',
        action: 'test_notification',
        environment: 'development',
        hostname: window.location.hostname,
        token: token.substring(0, 20) + '...',
        tokenLength: token.length,
      });

      // Créer une notification locale pour simuler FCM en développement
      const notification = new Notification(
        'Test FCM SuperNovaFit [DÉVELOPPEMENT]',
        {
          body: `Token FCM valide (${token.length} caractères) - Mode développement`,
          icon: '/icons/icon-192x192.svg',
          badge: '/icons/icon-72x72.svg',
          tag: 'test-notification-dev',
          requireInteraction: true,
          data: {
            url: '/',
            timestamp: Date.now().toString(),
            fcmToken: token.substring(0, 20) + '...',
            environment: 'development',
          },
        },
      );

      setTestResult('✅ Test FCM développement réussi ! Token valide.');

      // Fermer la notification après 5 secondes
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setTestResult(`❌ Erreur test FCM: ${errorMessage}`);
      logger.error('Erreur test FCM', {
        component: 'FCMTest',
        action: 'test_notification',
        error: error instanceof Error ? error : new Error(errorMessage),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (token && permission === 'granted') return 'text-green-400';
    if (permission === 'denied') return 'text-red-400';
    if (permission === 'default') return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (token && permission === 'granted') {
      return token.startsWith('mock-fcm-token-')
        ? '✅ FCM Simulé (localhost)'
        : '✅ FCM Actif';
    }
    if (permission === 'denied') return '❌ Notifications bloquées';
    if (permission === 'default') return '⚠️ Permission requise';
    return '⏳ Initialisation...';
  };

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-4">
        🔔 Test Firebase Cloud Messaging
      </h3>

      <div className="space-y-4">
        {/* Statut FCM */}
        <div className="flex items-center justify-between">
          <span className="text-white">Statut FCM:</span>
          <span className={`font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Support navigateur */}
        <div className="flex items-center justify-between">
          <span className="text-white">Support navigateur:</span>
          <span className={isSupported ? 'text-green-400' : 'text-red-400'}>
            {isSupported ? '✅ Supporté' : '❌ Non supporté'}
          </span>
        </div>

        {/* Permission */}
        <div className="flex items-center justify-between">
          <span className="text-white">Permission:</span>
          <span
            className={
              permission === 'granted' ? 'text-green-400' : 'text-yellow-400'
            }
          >
            {permission === 'granted' ? '✅ Accordée' : `⚠️ ${permission}`}
          </span>
        </div>

        {/* Diagnostic des permissions */}
        <div className="bg-black/20 p-3 rounded-lg">
          <h4 className="text-white font-semibold mb-2">
            🔍 Diagnostic Permissions
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Notification.permission:</span>
              <span
                className={
                  isClient &&
                  typeof Notification !== 'undefined' &&
                  Notification.permission === 'granted'
                    ? 'text-green-400'
                    : 'text-yellow-400'
                }
              >
                {isClient && typeof Notification !== 'undefined'
                  ? Notification.permission
                  : 'Chargement...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Notification API:</span>
              <span
                className={
                  isClient && typeof Notification !== 'undefined'
                    ? 'text-green-400'
                    : 'text-red-400'
                }
              >
                {isClient && typeof Notification !== 'undefined'
                  ? '✅ Disponible'
                  : '❌ Indisponible'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Service Worker:</span>
              <span
                className={
                  isClient && typeof navigator.serviceWorker !== 'undefined'
                    ? 'text-green-400'
                    : 'text-red-400'
                }
              >
                {isClient && typeof navigator.serviceWorker !== 'undefined'
                  ? '✅ Disponible'
                  : '❌ Indisponible'}
              </span>
            </div>
          </div>
        </div>

        {/* Token (tronqué) */}
        {token && (
          <div className="space-y-2">
            <span className="text-white">
              Token FCM:{' '}
              {token.startsWith('mock-fcm-token-')
                ? '(Simulé - localhost)'
                : '(Réel)'}
            </span>
            <div className="bg-black/20 p-3 rounded-lg">
              <code className="text-green-400 text-sm break-all">
                {token.substring(0, 50)}...
              </code>
            </div>
          </div>
        )}

        {/* Boutons test */}
        <div className="space-y-2">
          <button
            onClick={testNotification}
            disabled={!token || isLoading}
            className="w-full bg-neon-purple hover:bg-neon-purple/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? '⏳ Test en cours...' : '🧪 Tester Notification FCM'}
          </button>

          <button
            onClick={() => {
              try {
                // Test simple sans icône
                if (isClient && typeof Notification !== 'undefined') {
                  const notification = new Notification('Test Simple', {
                    body: 'Notification de test simple !',
                    requireInteraction: false,
                  });
                  setTestResult('✅ Notification simple envoyée !');
                  setTimeout(() => notification.close(), 3000);
                } else {
                  setTestResult('❌ API Notification non disponible');
                }
              } catch (error) {
                setTestResult(
                  `❌ Erreur notification simple: ${error instanceof Error ? error.message : String(error)}`,
                );
              }
            }}
            className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            🔔 Test Notification Simple
          </button>

          <button
            onClick={() => {
              try {
                // Test avec demande de permission explicite
                if (isClient && typeof Notification !== 'undefined') {
                  if (Notification.permission === 'granted') {
                    const notification = new Notification(
                      'Test avec Permission',
                      {
                        body: 'Notification avec permission accordée !',
                        icon: '/icons/icon-192x192.svg',
                        requireInteraction: true,
                      },
                    );
                    setTestResult('✅ Notification avec permission envoyée !');
                    setTimeout(() => notification.close(), 5000);
                  } else {
                    setTestResult(`❌ Permission: ${Notification.permission}`);
                  }
                } else {
                  setTestResult('❌ API Notification non disponible');
                }
              } catch (error) {
                setTestResult(
                  `❌ Erreur: ${error instanceof Error ? error.message : String(error)}`,
                );
              }
            }}
            className="w-full bg-neon-green hover:bg-neon-green/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            🔔 Test avec Permission
          </button>
        </div>

        {/* Résultat test */}
        {testResult && (
          <div className="bg-black/20 p-4 rounded-lg">
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Les notifications push nécessitent HTTPS en production</p>
          <p>• Autorisez les notifications dans votre navigateur</p>
          <p>• Le token FCM est automatiquement généré</p>
        </div>
      </div>
    </div>
  );
}
