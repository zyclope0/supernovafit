'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface QuickActionContext {
  page: string;
  userRole: 'coach' | 'sportif' | null;
  availableActions: string[];
}

export function useQuickActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickMealModalOpen, setQuickMealModalOpen] = useState(false);
  const [quickTrainingModalOpen, setQuickTrainingModalOpen] = useState(false);
  const [quickWeightModalOpen, setQuickWeightModalOpen] = useState(false);
  const [quickMoodModalOpen, setQuickMoodModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth();

  const getContext = useCallback((): QuickActionContext => {
    const page = pathname.split('/')[1] || 'dashboard';
    const userRole = userProfile?.role || null;

    let availableActions: string[] = [];

    switch (page) {
      case 'diete':
        availableActions = [
          'quick-meal',
          'template-meal',
          'scan-barcode',
          'voice-input',
        ];
        break;
      case 'entrainements':
        availableActions = [
          'quick-training',
          'template-training',
          'import-garmin',
          'timer',
        ];
        break;
      case 'mesures':
        availableActions = [
          'quick-weight',
          'full-measures',
          'photo-progress',
          'body-scan',
        ];
        break;
      case 'journal':
        availableActions = [
          'quick-mood',
          'voice-note',
          'photo-libre',
          'goal-check',
        ];
        break;
      default:
        availableActions = [
          'add-meal',
          'add-training',
          'add-measure',
          'journal-entry',
        ];
    }

    return { page, userRole, availableActions };
  }, [pathname, userProfile]);

  const executeQuickAction = useCallback(
    (actionId: string) => {
      // const context = getContext() // TODO: À utiliser pour actions contextuelles

      switch (actionId) {
        // Actions Diète
        case 'quick-meal':
          setQuickMealModalOpen(true);
          break;
        case 'template-meal':
          // TODO: Ouvrir sélecteur de templates
          toast.success('Templates repas (à implémenter)');
          break;
        case 'scan-barcode':
          // TODO: Ouvrir scanner code-barres
          toast.success('Scanner (à implémenter)');
          break;
        case 'voice-input':
          // TODO: Ouvrir saisie vocale
          toast.success('Saisie vocale (à implémenter)');
          break;

        // Actions Entraînements
        case 'quick-training':
          setQuickTrainingModalOpen(true);
          break;
        case 'template-training':
          // TODO: Ouvrir templates entraînement
          toast.success('Templates entraînement (à implémenter)');
          break;
        case 'import-garmin':
          router.push('/entrainements?import=garmin');
          break;
        case 'timer':
          // TODO: Ouvrir chronomètre
          toast.success('Chronomètre (à implémenter)');
          break;

        // Actions Mesures
        case 'quick-weight':
          setQuickWeightModalOpen(true);
          break;
        case 'full-measures':
          router.push('/mesures?mode=complete');
          break;
        case 'photo-progress':
          // TODO: Ouvrir appareil photo
          toast.success('Photo progression (à implémenter)');
          break;

        // Actions Journal
        case 'quick-mood':
          setQuickMoodModalOpen(true);
          break;
        case 'voice-note':
          // TODO: Ouvrir enregistrement vocal
          toast.success('Note vocale (à implémenter)');
          break;

        // Actions générales
        case 'add-meal':
          router.push('/diete');
          break;
        case 'add-training':
          router.push('/entrainements');
          break;
        case 'add-measure':
          router.push('/mesures');
          break;
        case 'journal-entry':
          router.push('/journal');
          break;

        default:
          toast.error('Action non reconnue');
      }

      setIsModalOpen(false);
    },
    [router],
  );

  const openQuickActions = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeQuickActions = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const closeAllModals = useCallback(() => {
    setIsModalOpen(false);
    setQuickMealModalOpen(false);
    setQuickTrainingModalOpen(false);
    setQuickWeightModalOpen(false);
    setQuickMoodModalOpen(false);
  }, []);

  return {
    isModalOpen,
    quickMealModalOpen,
    quickTrainingModalOpen,
    quickWeightModalOpen,
    quickMoodModalOpen,
    context: getContext(),
    openQuickActions,
    closeQuickActions,
    closeAllModals,
    setQuickMealModalOpen,
    setQuickTrainingModalOpen,
    setQuickWeightModalOpen,
    setQuickMoodModalOpen,
    executeQuickAction,
  };
}
