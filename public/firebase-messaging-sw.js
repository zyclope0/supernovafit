// Firebase Cloud Messaging Service Worker
// Ce fichier doit être dans le dossier public pour être accessible

importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js',
);

// Configuration Firebase pour le service worker
const firebaseConfig = {
  apiKey: 'AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Remplacer par la vraie clé
  authDomain: 'supernovafit-a6fe7.firebaseapp.com',
  projectId: 'supernovafit-a6fe7',
  storageBucket: 'supernovafit-a6fe7.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abcdefghijklmnop',
  measurementId: 'G-XXXXXXXXXX',
};

// Initialiser Firebase dans le service worker
firebase.initializeApp(firebaseConfig);

// Initialiser Firebase Cloud Messaging
const messaging = firebase.messaging();

// Gérer les messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log(
    '📱 [firebase-messaging-sw.js] Message reçu en arrière-plan:',
    payload,
  );

  const notificationTitle = payload.notification?.title || 'SuperNovaFit';
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: payload.data?.type || 'default',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
        icon: '/icons/open-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Ignorer',
        icon: '/icons/dismiss-icon.png',
      },
    ],
    requireInteraction: payload.data?.priority === 'high',
    silent: payload.data?.silent === 'true',
  };

  // Afficher la notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('📱 [firebase-messaging-sw.js] Clic sur notification:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    // Notification ignorée
    return;
  }

  // Ouvrir l'application
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Chercher une fenêtre existante
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }

        // Ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// Gérer les actions de notification
self.addEventListener('notificationclose', (event) => {
  console.log('📱 [firebase-messaging-sw.js] Notification fermée:', event);

  // Optionnel: Envoyer des analytics
  if (event.notification.data?.analytics) {
    // Envoyer des données d'analytics
    console.log(
      '📊 Analytics - Notification fermée:',
      event.notification.data.analytics,
    );
  }
});

// Gérer les erreurs de messaging
messaging.onMessage((payload) => {
  console.log(
    '📱 [firebase-messaging-sw.js] Message reçu au premier plan:',
    payload,
  );

  // Les messages au premier plan sont gérés par le composant React
  // Ici on peut juste logger ou faire des actions spécifiques
});

// Gérer les erreurs
self.addEventListener('error', (event) => {
  console.error(
    '❌ [firebase-messaging-sw.js] Erreur service worker:',
    event.error,
  );
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ [firebase-messaging-sw.js] Promise rejetée:', event.reason);
});

console.log(
  '🚀 [firebase-messaging-sw.js] Service Worker Firebase Messaging initialisé',
);
