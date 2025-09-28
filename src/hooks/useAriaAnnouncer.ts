'use client';

import { useEffect, useCallback } from 'react';

interface AriaAnnouncerOptions {
  priority?: 'polite' | 'assertive';
  delay?: number;
}

export function useAriaAnnouncer() {
  // Create or get the announcer element
  const getAnnouncer = useCallback(() => {
    let announcer = document.getElementById('aria-announcer');

    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'aria-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(announcer);
    }

    return announcer;
  }, []);

  // Announce a message to screen readers
  const announce = useCallback(
    (message: string, options: AriaAnnouncerOptions = {}) => {
      const { priority = 'polite', delay = 100 } = options;
      const announcer = getAnnouncer();

      // Set the priority
      announcer.setAttribute('aria-live', priority);

      // Clear previous content and set new message
      const announceWithDelay = () => {
        announcer.textContent = '';

        // Use a small delay to ensure the clear is processed
        setTimeout(() => {
          announcer.textContent = message;
        }, 50);
      };

      if (delay > 0) {
        setTimeout(announceWithDelay, delay);
      } else {
        announceWithDelay();
      }
    },
    [getAnnouncer],
  );

  // Announce form validation errors
  const announceValidationError = useCallback(
    (fieldName: string, error: string) => {
      announce(`Erreur dans le champ ${fieldName}: ${error}`, {
        priority: 'assertive',
      });
    },
    [announce],
  );

  // Announce success messages
  const announceSuccess = useCallback(
    (message: string) => {
      announce(`Succès: ${message}`, { priority: 'polite' });
    },
    [announce],
  );

  // Announce loading states
  const announceLoading = useCallback(
    (action: string) => {
      announce(`Chargement: ${action}`, { priority: 'polite' });
    },
    [announce],
  );

  // Announce page changes
  const announcePageChange = useCallback(
    (pageTitle: string) => {
      announce(`Page changée: ${pageTitle}`, { priority: 'assertive' });
    },
    [announce],
  );

  // Announce modal state changes
  const announceModalState = useCallback(
    (isOpen: boolean, modalTitle: string) => {
      const state = isOpen ? 'ouverte' : 'fermée';
      announce(`Modal ${modalTitle} ${state}`, { priority: 'assertive' });
    },
    [announce],
  );

  // Announce data updates
  const announceDataUpdate = useCallback(
    (dataType: string, action: string) => {
      announce(`${dataType} ${action}`, { priority: 'polite' });
    },
    [announce],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      const announcer = document.getElementById('aria-announcer');
      if (announcer) {
        announcer.remove();
      }
    };
  }, []);

  return {
    announce,
    announceValidationError,
    announceSuccess,
    announceLoading,
    announcePageChange,
    announceModalState,
    announceDataUpdate,
  };
}
