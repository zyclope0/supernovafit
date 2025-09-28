'use client';

import React from 'react';
import { Trophy, Target, Star, Award } from 'lucide-react';
import ProgressHeader from '@/components/ui/ProgressHeader';

interface ChallengeStats {
  activeChallenges: number;
  completedChallenges: number;
  totalAchievements: number;
  userLevel?: number;
  userXP?: number;
  nextLevelXP?: number;
}

interface ChallengesProgressHeaderProps {
  title: string;
  emoji: string;
  stats?: ChallengeStats;
  advice?: string;
}

export default function ChallengesProgressHeader({
  title,
  emoji,
  stats,
  advice,
}: ChallengesProgressHeaderProps) {
  // Générer des conseils intelligents basés sur les stats
  const generateSmartAdvice = (): string => {
    if (!stats) {
      return 'Commencez votre premier challenge pour débloquer votre potentiel !';
    }

    const {
      activeChallenges,
      completedChallenges,
      totalAchievements,
      userLevel,
    } = stats;

    // Conseils basés sur les challenges actifs
    if (activeChallenges === 0) {
      return 'Aucun challenge actif. Lancez-vous un défi pour progresser !';
    }

    if (activeChallenges >= 5) {
      return 'Excellent ! Vous avez plusieurs challenges en cours. Gardez le rythme !';
    }

    if (activeChallenges >= 3) {
      return 'Bien équilibré ! Vous avez un bon nombre de challenges actifs.';
    }

    // Conseils basés sur les achievements
    if (totalAchievements === 0) {
      return 'Terminez vos premiers challenges pour débloquer des achievements !';
    }

    if (totalAchievements >= 10) {
      return 'Impressionnant ! Vous collectionnez les achievements comme un pro !';
    }

    // Conseils basés sur le niveau
    if (userLevel && userLevel >= 10) {
      return 'Niveau élevé atteint ! Vous êtes un vrai champion des challenges !';
    }

    if (userLevel && userLevel >= 5) {
      return 'Niveau intermédiaire ! Continuez sur cette lancée !';
    }

    // Conseils basés sur les challenges terminés
    if (completedChallenges >= 20) {
      return 'Expert des challenges ! Vous avez terminé plus de 20 défis !';
    }

    if (completedChallenges >= 10) {
      return 'Très bien ! Vous avez terminé plus de 10 challenges !';
    }

    if (completedChallenges >= 5) {
      return 'Bon début ! Vous avez terminé plusieurs challenges !';
    }

    return 'Continuez vos challenges pour progresser et débloquer de nouveaux achievements !';
  };

  // Calculer des objectifs adaptatifs basés sur le niveau
  const getAdaptiveTargets = () => {
    const level = stats?.userLevel || 1;
    return {
      activeChallenges: Math.min(3 + Math.floor(level / 5), 10), // 3 au début, max 10
      completedChallenges: level * 5, // 5 par niveau
      achievements: level * 10, // 10 par niveau
      nextLevel: level + 1, // Prochain niveau
    };
  };

  const targets = getAdaptiveTargets();

  // Items pour le ProgressHeader (sans période)
  const items = [
    {
      icon: <Target className="h-5 w-5" />,
      label: 'Actifs',
      data: {
        current: stats?.activeChallenges || 0,
        target: targets.activeChallenges,
        unit: '',
      },
      color: 'green' as const,
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: 'Terminés',
      data: {
        current: stats?.completedChallenges || 0,
        target: targets.completedChallenges,
        unit: '',
      },
      color: 'cyan' as const,
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: 'Achievements',
      data: {
        current: stats?.totalAchievements || 0,
        target: targets.achievements,
        unit: '',
      },
      color: 'purple' as const,
    },
    {
      icon: <Award className="h-5 w-5" />,
      label: 'Niveau',
      data: {
        current: stats?.userLevel || 1,
        target: targets.nextLevel,
        unit: '',
      },
      color: 'pink' as const,
    },
  ];

  return (
    <ProgressHeader
      title={title}
      emoji={emoji}
      period="week"
      onPeriodChange={() => {}} // Fonction vide car on n'utilise plus la période
      items={items}
      advice={advice || generateSmartAdvice()}
    />
  );
}
