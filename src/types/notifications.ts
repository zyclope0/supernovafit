// Types pour le système de notifications push

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  priority?: 'high' | 'normal' | 'low';
  silent?: boolean;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: Record<string, unknown>;
  analytics?: {
    category: string;
    action: string;
    label?: string;
  };
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export type NotificationType =
  | 'reminder_meal' // Rappel repas
  | 'reminder_workout' // Rappel entraînement
  | 'reminder_measure' // Rappel mesures
  | 'reminder_journal' // Rappel journal
  | 'streak_achievement' // Streak atteint
  | 'streak_warning' // Streak en danger
  | 'goal_achievement' // Objectif atteint
  | 'goal_reminder' // Rappel objectif
  | 'challenge_completed' // Challenge complété
  | 'challenge_reminder' // Rappel challenge
  | 'coach_message' // Message du coach
  | 'coach_comment' // Commentaire du coach
  | 'system_update' // Mise à jour système
  | 'motivation' // Message de motivation
  | 'weekly_report' // Rapport hebdomadaire
  | 'monthly_report'; // Rapport mensuel

export interface NotificationSettings {
  enabled: boolean;
  types: {
    [K in NotificationType]: boolean;
  };
  schedule: {
    morning: string; // Format HH:MM
    afternoon: string; // Format HH:MM
    evening: string; // Format HH:MM
  };
  frequency: {
    reminders: 'daily' | 'weekdays' | 'custom';
    streaks: 'immediate' | 'daily';
    goals: 'immediate' | 'weekly';
    challenges: 'immediate' | 'daily';
    coach: 'immediate' | 'daily';
    reports: 'weekly' | 'monthly';
  };
  quietHours: {
    enabled: boolean;
    start: string; // Format HH:MM
    end: string; // Format HH:MM
  };
}

export interface NotificationToken {
  token: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
  };
  createdAt: Date;
  lastUsed: Date;
  isActive: boolean;
}

export interface NotificationHistory {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  sentAt: Date;
  deliveredAt?: Date;
  clickedAt?: Date;
  dismissedAt?: Date;
  data?: Record<string, unknown>;
  analytics?: {
    category: string;
    action: string;
    label?: string;
  };
}

export interface StreakData {
  type: 'meal' | 'workout' | 'measure' | 'journal';
  current: number;
  best: number;
  lastActivity: Date;
  nextMilestone: number;
}

export interface GoalData {
  type: 'weight' | 'calories' | 'workouts' | 'challenges';
  current: number;
  target: number;
  deadline: Date;
  progress: number; // Pourcentage
}

export interface ChallengeData {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  deadline: Date;
  reward?: string;
}

// Types pour les templates de notifications
export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  body: string;
  icon: string;
  priority: 'high' | 'normal' | 'low';
  requireInteraction: boolean;
  actions: NotificationAction[];
}

// Templates prédéfinis
export const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  NotificationTemplate
> = {
  reminder_meal: {
    type: 'reminder_meal',
    title: '🍽️ Rappel repas',
    body: 'Il est temps de noter votre repas !',
    icon: '/icons/meal-icon.png',
    priority: 'normal',
    requireInteraction: false,
    actions: [
      {
        action: 'add_meal',
        title: 'Ajouter repas',
        icon: '/icons/add-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Plus tard',
        icon: '/icons/dismiss-icon.png',
      },
    ],
  },
  reminder_workout: {
    type: 'reminder_workout',
    title: '🏋️ Rappel entraînement',
    body: "Prêt pour votre séance d'entraînement ?",
    icon: '/icons/workout-icon.png',
    priority: 'normal',
    requireInteraction: false,
    actions: [
      {
        action: 'start_workout',
        title: 'Commencer',
        icon: '/icons/play-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Plus tard',
        icon: '/icons/dismiss-icon.png',
      },
    ],
  },
  reminder_measure: {
    type: 'reminder_measure',
    title: '📏 Rappel mesures',
    body: "N'oubliez pas de prendre vos mesures !",
    icon: '/icons/measure-icon.png',
    priority: 'normal',
    requireInteraction: false,
    actions: [
      {
        action: 'add_measure',
        title: 'Ajouter mesures',
        icon: '/icons/add-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Plus tard',
        icon: '/icons/dismiss-icon.png',
      },
    ],
  },
  reminder_journal: {
    type: 'reminder_journal',
    title: '📝 Rappel journal',
    body: "Comment vous sentez-vous aujourd'hui ?",
    icon: '/icons/journal-icon.png',
    priority: 'normal',
    requireInteraction: false,
    actions: [
      { action: 'add_journal', title: 'Écrire', icon: '/icons/write-icon.png' },
      {
        action: 'dismiss',
        title: 'Plus tard',
        icon: '/icons/dismiss-icon.png',
      },
    ],
  },
  streak_achievement: {
    type: 'streak_achievement',
    title: '🔥 Streak atteint !',
    body: 'Félicitations ! Vous avez maintenu votre streak de {days} jours !',
    icon: '/icons/fire-icon.png',
    priority: 'high',
    requireInteraction: true,
    actions: [
      {
        action: 'view_streak',
        title: 'Voir streak',
        icon: '/icons/view-icon.png',
      },
      { action: 'share', title: 'Partager', icon: '/icons/share-icon.png' },
    ],
  },
  streak_warning: {
    type: 'streak_warning',
    title: '⚠️ Streak en danger',
    body: 'Votre streak de {days} jours risque de se briser !',
    icon: '/icons/warning-icon.png',
    priority: 'high',
    requireInteraction: true,
    actions: [
      {
        action: 'continue_streak',
        title: 'Continuer',
        icon: '/icons/continue-icon.png',
      },
      { action: 'dismiss', title: 'Ignorer', icon: '/icons/dismiss-icon.png' },
    ],
  },
  goal_achievement: {
    type: 'goal_achievement',
    title: '🎯 Objectif atteint !',
    body: 'Bravo ! Vous avez atteint votre objectif {goal} !',
    icon: '/icons/target-icon.png',
    priority: 'high',
    requireInteraction: true,
    actions: [
      {
        action: 'view_goal',
        title: 'Voir objectif',
        icon: '/icons/view-icon.png',
      },
      {
        action: 'set_new_goal',
        title: 'Nouvel objectif',
        icon: '/icons/add-icon.png',
      },
    ],
  },
  goal_reminder: {
    type: 'goal_reminder',
    title: '🎯 Rappel objectif',
    body: 'Vous êtes à {progress}% de votre objectif {goal} !',
    icon: '/icons/target-icon.png',
    priority: 'normal',
    requireInteraction: false,
    actions: [
      {
        action: 'view_goal',
        title: 'Voir objectif',
        icon: '/icons/view-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Plus tard',
        icon: '/icons/dismiss-icon.png',
      },
    ],
  },
  challenge_completed: {
    type: 'challenge_completed',
    title: '🏆 Challenge complété !',
    body: 'Félicitations ! Vous avez complété le challenge "{challenge}" !',
    icon: '/icons/trophy-icon.png',
    priority: 'high',
    requireInteraction: true,
    actions: [
      {
        action: 'view_challenge',
        title: 'Voir challenge',
        icon: '/icons/view-icon.png',
      },
      {
        action: 'next_challenge',
        title: 'Suivant',
        icon: '/icons/next-icon.png',
      },
    ],
  },
  challenge_reminder: {
    type: 'challenge_reminder',
    title: '🏆 Rappel challenge',
    body: 'Il vous reste {time} pour compléter le challenge "{challenge}" !',
    icon: '/icons/trophy-icon.png',
    priority: 'normal',
    requireInteraction: false,
    actions: [
      {
        action: 'view_challenge',
        title: 'Voir challenge',
        icon: '/icons/view-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Plus tard',
        icon: '/icons/dismiss-icon.png',
      },
    ],
  },
  coach_message: {
    type: 'coach_message',
    title: '👨‍🏫 Message du coach',
    body: 'Votre coach vous a envoyé un message !',
    icon: '/icons/coach-icon.png',
    priority: 'high',
    requireInteraction: true,
    actions: [
      { action: 'view_message', title: 'Lire', icon: '/icons/read-icon.png' },
      { action: 'reply', title: 'Répondre', icon: '/icons/reply-icon.png' },
    ],
  },
  coach_comment: {
    type: 'coach_comment',
    title: '👨‍🏫 Commentaire du coach',
    body: 'Votre coach a commenté votre {activity} !',
    icon: '/icons/comment-icon.png',
    priority: 'normal',
    requireInteraction: false,
    actions: [
      {
        action: 'view_comment',
        title: 'Voir commentaire',
        icon: '/icons/view-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Plus tard',
        icon: '/icons/dismiss-icon.png',
      },
    ],
  },
  system_update: {
    type: 'system_update',
    title: '🔄 Mise à jour disponible',
    body: 'Une nouvelle version de SuperNovaFit est disponible !',
    icon: '/icons/update-icon.png',
    priority: 'normal',
    requireInteraction: false,
    actions: [
      {
        action: 'update',
        title: 'Mettre à jour',
        icon: '/icons/update-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Plus tard',
        icon: '/icons/dismiss-icon.png',
      },
    ],
  },
  motivation: {
    type: 'motivation',
    title: '💪 Message de motivation',
    body: 'Vous êtes sur la bonne voie ! Continuez comme ça !',
    icon: '/icons/motivation-icon.png',
    priority: 'low',
    requireInteraction: false,
    actions: [
      {
        action: 'view_motivation',
        title: 'Voir message',
        icon: '/icons/view-icon.png',
      },
      { action: 'dismiss', title: 'Fermer', icon: '/icons/dismiss-icon.png' },
    ],
  },
  weekly_report: {
    type: 'weekly_report',
    title: '📊 Rapport hebdomadaire',
    body: 'Votre rapport de la semaine est prêt !',
    icon: '/icons/report-icon.png',
    priority: 'normal',
    requireInteraction: false,
    actions: [
      {
        action: 'view_report',
        title: 'Voir rapport',
        icon: '/icons/view-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Plus tard',
        icon: '/icons/dismiss-icon.png',
      },
    ],
  },
  monthly_report: {
    type: 'monthly_report',
    title: '📈 Rapport mensuel',
    body: 'Découvrez vos progrès du mois !',
    icon: '/icons/chart-icon.png',
    priority: 'normal',
    requireInteraction: false,
    actions: [
      {
        action: 'view_report',
        title: 'Voir rapport',
        icon: '/icons/view-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Plus tard',
        icon: '/icons/dismiss-icon.png',
      },
    ],
  },
};

// Types pour les hooks et composants
export interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  token: string | null;
  settings: NotificationSettings;
  requestPermission: () => Promise<NotificationPermission>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  sendNotification: (data: NotificationData) => Promise<void>;
  scheduleNotification: (
    data: NotificationData,
    delay: number,
  ) => Promise<void>;
  cancelNotification: (tag: string) => Promise<void>;
  getNotificationHistory: () => Promise<NotificationHistory[]>;
  clearNotificationHistory: () => Promise<void>;
}

export interface NotificationProviderProps {
  children: React.ReactNode;
}

export interface NotificationContextType extends UseNotificationsReturn {
  // Méthodes supplémentaires pour le contexte
  showNotification: (data: NotificationData) => void;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
}
