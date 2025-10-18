// Firebase Cloud Messaging Service Worker
// Version: 1.0.0
// Date: 14 Janvier 2025

importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js',
);

// Configuration Firebase (identique à celle du client)
const firebaseConfig = {
  apiKey: 'AIzaSyBe176JrNl_R0NmUAFkhCISThnFUUgt8U4',
  authDomain: 'supernovafit-a6fe7.firebaseapp.com',
  projectId: 'supernovafit-a6fe7',
  storageBucket: 'supernovafit-a6fe7.firebasestorage.app',
  messagingSenderId: '261698689691',
  appId: '1:261698689691:web:edc7a7135d94a8250c443e',
  measurementId: 'G-RV0RK8JWN4',
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Initialiser Firebase Messaging
const messaging = firebase.messaging();

// Configuration des notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Message reçu en arrière-plan:',
    payload,
  );

  // Données de la notification
  const notificationTitle = payload.notification?.title || 'SuperNovaFit';
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: payload.data?.tag || 'supernovafit-notification',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
        icon: '/icon-192x192.png',
      },
      {
        action: 'dismiss',
        title: 'Ignorer',
        icon: '/icon-192x192.png',
      },
    ],
    requireInteraction: false,
    silent: false,
  };

  // Afficher la notification
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Clic sur notification:', event);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Ouvrir l'application
    event.waitUntil(
      clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Si l'application est déjà ouverte, la focus
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          // Sinon, ouvrir une nouvelle fenêtre
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        }),
    );
  } else if (event.action === 'dismiss') {
    // Notification ignorée
    console.log('[firebase-messaging-sw.js] Notification ignorée');
  }
});

// Gestion des erreurs
self.addEventListener('error', (event) => {
  console.error('[firebase-messaging-sw.js] Erreur:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[firebase-messaging-sw.js] Promesse rejetée:', event.reason);
});

// Log de démarrage
console.log('[firebase-messaging-sw.js] Service Worker FCM initialisé');
