/**
 * Templates de Notifications Challenges
 *
 * Messages standardisés pour les notifications push
 *
 * @module notifications/notificationTemplates
 * @created 23.10.2025
 */

import type { Challenge } from '@/types';

export interface NotificationTemplate {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Template de notification pour challenge complété
 *
 * @param challenge - Challenge complété
 * @returns Template notification
 *
 * @example
 * ```typescript
 * const notif = getChallengeCompletedNotification(challenge);
 * // {
 * //   title: "🎉 Challenge Complété!",
 * //   body: "Warrior Streak - +300 XP gagnés!",
 * //   ...
 * // }
 * ```
 */
export function getChallengeCompletedNotification(
  challenge: Challenge,
): NotificationTemplate {
  return {
    title: `🎉 Challenge Complété!`,
    body: `${challenge.title} - +${challenge.xpReward} XP gagnés!`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `challenge-completed-${challenge.id}`,
    requireInteraction: true,
  };
}

/**
 * Template de notification pour progression importante (50%, 75%)
 *
 * @param challenge - Challenge en cours
 * @param percentage - Pourcentage atteint (50, 75, etc.)
 * @returns Template notification
 *
 * @example
 * ```typescript
 * const notif = getChallengeProgressNotification(challenge, 75);
 * // {
 * //   title: "📈 75% Complété!",
 * //   body: "Volume Monstre: 37,500/50,000 kg",
 * //   ...
 * // }
 * ```
 */
export function getChallengeProgressNotification(
  challenge: Challenge,
  percentage: number,
): NotificationTemplate {
  return {
    title: `📈 ${percentage}% Complété!`,
    body: `${challenge.title}: ${challenge.current}/${challenge.target} ${challenge.unit}`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `challenge-progress-${challenge.id}`,
    requireInteraction: false,
  };
}

/**
 * Template de notification pour nouveau challenge disponible
 *
 * @param challengeTitle - Titre du challenge
 * @param challengeDescription - Description
 * @param xpReward - Récompense XP
 * @returns Template notification
 *
 * @example
 * ```typescript
 * const notif = getNewChallengeNotification(
 *   "Warrior Streak",
 *   "30 jours consécutifs",
 *   300
 * );
 * // {
 * //   title: "✨ Nouveau Challenge!",
 * //   body: "Warrior Streak: 30 jours consécutifs (+300 XP)",
 * //   ...
 * // }
 * ```
 */
export function getNewChallengeNotification(
  challengeTitle: string,
  challengeDescription: string,
  xpReward: number,
): NotificationTemplate {
  return {
    title: `✨ Nouveau Challenge!`,
    body: `${challengeTitle}: ${challengeDescription} (+${xpReward} XP)`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `new-challenge-${challengeTitle.toLowerCase().replace(/\s+/g, '-')}`,
    requireInteraction: false,
  };
}

/**
 * Template de notification pour encouragement (presque complété)
 *
 * @param challenge - Challenge proche de completion
 * @returns Template notification
 *
 * @example
 * ```typescript
 * const notif = getChallengeAlmostDoneNotification(challenge);
 * // {
 * //   title: "🔥 Plus que 2 jours!",
 * //   body: "Warrior Streak: 28/30 jours - Continuez!",
 * //   ...
 * // }
 * ```
 */
export function getChallengeAlmostDoneNotification(
  challenge: Challenge,
): NotificationTemplate {
  const remaining = challenge.target - challenge.current;

  return {
    title: `🔥 Plus que ${remaining} ${challenge.unit}!`,
    body: `${challenge.title}: ${challenge.current}/${challenge.target} ${challenge.unit} - Continuez!`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `challenge-almost-${challenge.id}`,
    requireInteraction: false,
  };
}

/**
 * Template de notification pour reminder (challenge expirant bientôt)
 *
 * @param challenge - Challenge expirant
 * @param daysLeft - Jours restants
 * @returns Template notification
 *
 * @example
 * ```typescript
 * const notif = getChallengeExpiringNotification(challenge, 2);
 * // {
 * //   title: "⏰ 2 jours restants!",
 * //   body: "Volume Monstre expire bientôt - Dernière ligne droite!",
 * //   ...
 * // }
 * ```
 */
export function getChallengeExpiringNotification(
  challenge: Challenge,
  daysLeft: number,
): NotificationTemplate {
  return {
    title: `⏰ ${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}!`,
    body: `${challenge.title} expire bientôt - Dernière ligne droite!`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `challenge-expiring-${challenge.id}`,
    requireInteraction: false,
  };
}

/**
 * Template de notification pour streak cassée
 *
 * @param challengeTitle - Titre du challenge
 * @param streakDays - Nombre de jours de streak perdus
 * @returns Template notification
 *
 * @example
 * ```typescript
 * const notif = getStreakBrokenNotification("Warrior Streak", 15);
 * // {
 * //   title: "💔 Streak interrompue",
 * //   body: "Warrior Streak: 15 jours perdus - Recommencez aujourd'hui!",
 * //   ...
 * // }
 * ```
 */
export function getStreakBrokenNotification(
  challengeTitle: string,
  streakDays: number,
): NotificationTemplate {
  return {
    title: `💔 Streak interrompue`,
    body: `${challengeTitle}: ${streakDays} jours perdus - Recommencez aujourd'hui!`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `streak-broken-${challengeTitle.toLowerCase().replace(/\s+/g, '-')}`,
    requireInteraction: false,
  };
}
