/**
 * Challenge Notifications Logic
 *
 * Gestion des notifications push pour les challenges
 * Intégration avec FCM (Firebase Cloud Messaging)
 *
 * @module notifications/challengeNotifications
 * @created 23.10.2025
 */

import type { Challenge } from '@/types';
import {
  getChallengeCompletedNotification,
  getChallengeProgressNotification,
  getChallengeAlmostDoneNotification,
} from './notificationTemplates';

/**
 * Envoie une notification de challenge complété
 *
 * @param challenge - Challenge complété
 * @returns Promise résolue si notification envoyée
 *
 * @example
 * ```typescript
 * await sendChallengeCompletedNotification(challenge);
 * // Notification "🎉 Challenge Complété! Warrior Streak - +300 XP"
 * ```
 */
export async function sendChallengeCompletedNotification(
  challenge: Challenge,
): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('Notifications non supportées par ce navigateur');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Permission notifications non accordée');
    return;
  }

  const template = getChallengeCompletedNotification(challenge);

  try {
    // Notification browser native
    const notification = new Notification(template.title, {
      body: template.body,
      icon: template.icon,
      badge: template.badge,
      tag: template.tag,
      requireInteraction: template.requireInteraction,
      vibrate: [200, 100, 200], // Vibration pattern
      data: {
        type: 'challenge-completed',
        challengeId: challenge.id,
        xpReward: challenge.xpReward,
      },
    });

    // Optionnel: Action au clic
    notification.onclick = () => {
      window.focus();
      window.location.href = '/challenges';
      notification.close();
    };

    // Log pour debug
    console.log('✅ Notification envoyée:', template.title);
  } catch (error) {
    console.error('❌ Erreur envoi notification:', error);
  }
}

/**
 * Envoie une notification de progression (50%, 75%, etc.)
 *
 * @param challenge - Challenge en cours
 * @returns Promise résolue si notification envoyée
 *
 * @example
 * ```typescript
 * await sendChallengeProgressNotification(challenge);
 * // Si 75% complété → Notification "📈 75% Complété!"
 * ```
 */
export async function sendChallengeProgressNotification(
  challenge: Challenge,
): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const progressPercent = (challenge.current / challenge.target) * 100;

  // Notifier seulement aux jalons importants (50%, 75%, 90%)
  const milestones = [50, 75, 90];
  const closestMilestone = milestones.find(
    (m) => Math.abs(progressPercent - m) < 1,
  );

  if (!closestMilestone) {
    return; // Pas de jalon atteint
  }

  const template = getChallengeProgressNotification(
    challenge,
    closestMilestone,
  );

  try {
    const notification = new Notification(template.title, {
      body: template.body,
      icon: template.icon,
      badge: template.badge,
      tag: template.tag,
      requireInteraction: template.requireInteraction,
      vibrate: [100, 50, 100],
      data: {
        type: 'challenge-progress',
        challengeId: challenge.id,
        progress: closestMilestone,
      },
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = '/challenges';
      notification.close();
    };

    console.log(`✅ Notification progression envoyée: ${closestMilestone}%`);
  } catch (error) {
    console.error('❌ Erreur envoi notification progression:', error);
  }
}

/**
 * Envoie une notification d'encouragement (presque terminé)
 *
 * @param challenge - Challenge proche de completion
 * @returns Promise résolue si notification envoyée
 *
 * @example
 * ```typescript
 * await sendChallengeAlmostDoneNotification(challenge);
 * // Si 28/30 → Notification "🔥 Plus que 2 jours!"
 * ```
 */
export async function sendChallengeAlmostDoneNotification(
  challenge: Challenge,
): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const remaining = challenge.target - challenge.current;

  // Notifier seulement quand il reste peu (1-3 unités)
  if (remaining > 3 || remaining <= 0) {
    return;
  }

  const template = getChallengeAlmostDoneNotification(challenge);

  try {
    const notification = new Notification(template.title, {
      body: template.body,
      icon: template.icon,
      badge: template.badge,
      tag: template.tag,
      requireInteraction: template.requireInteraction,
      vibrate: [150, 75, 150],
      data: {
        type: 'challenge-almost-done',
        challengeId: challenge.id,
        remaining,
      },
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = '/challenges';
      notification.close();
    };

    console.log(`✅ Notification encouragement envoyée: ${remaining} restants`);
  } catch (error) {
    console.error('❌ Erreur envoi notification encouragement:', error);
  }
}

/**
 * Demande la permission pour les notifications
 *
 * @returns Promise<boolean> - True si permission accordée
 *
 * @example
 * ```typescript
 * const granted = await requestNotificationPermission();
 * if (granted) {
 *   console.log('Notifications activées');
 * }
 * ```
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Notifications non supportées');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn("Permission notifications refusée par l'utilisateur");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Erreur demande permission notifications:', error);
    return false;
  }
}

/**
 * Vérifie si les notifications sont disponibles et autorisées
 *
 * @returns boolean - True si notifications disponibles
 */
export function areNotificationsAvailable(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}
