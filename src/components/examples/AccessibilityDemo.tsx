'use client';

import React from 'react';
import { useSmartNotifications } from '@/components/ui/SmartNotifications';
import { useAriaAnnouncer } from '@/hooks/useAriaAnnouncer';

export default function AccessibilityDemo() {
  const { addNotification } = useSmartNotifications();
  const {
    announceSuccess,
    announceValidationError,
    announceModalState,
    announceDataUpdate,
  } = useAriaAnnouncer();

  const handleTestNotification = () => {
    addNotification({
      id: 'test-1',
      type: 'success',
      title: 'Test d&apos;accessibilité',
      message:
        'Cette notification teste les announces automatiques pour les screen readers.',
      autoHide: true,
      duration: 5000,
      actions: [
        {
          label: 'Voir détails',
          action: () => announceSuccess('Détails affichés'),
        },
      ],
    });

    // Annonce pour screen reader
    announceSuccess('Notification de test envoyée');
  };

  const handleTestValidation = () => {
    announceValidationError(
      'Poids',
      'La valeur doit être comprise entre 30 et 300 kg',
    );
  };

  const handleTestModal = () => {
    announceModalState(true, 'Modal de démonstration');

    // Simuler fermeture après 3 secondes
    setTimeout(() => {
      announceModalState(false, 'Modal de démonstration');
    }, 3000);
  };

  const handleTestDataUpdate = () => {
    announceDataUpdate('Mesures', 'mises à jour avec succès');
  };

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">
        🎯 Démonstration d&apos;Accessibilité
      </h2>

      <div className="space-y-4">
        <div className="text-sm text-gray-300 mb-6">
          <p>Testez les nouvelles fonctionnalités d&apos;accessibilité :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Announces automatiques pour screen readers</li>
            <li>Notifications avec actions accessibles</li>
            <li>Validation d&apos;erreurs avec announces</li>
            <li>États de modals annoncés</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleTestNotification}
            className="px-4 py-3 bg-neon-cyan text-white rounded-lg hover:bg-neon-cyan/80 transition-colors font-medium"
            aria-label="Tester une notification avec announce automatique"
          >
            🔔 Test Notification
          </button>

          <button
            onClick={handleTestValidation}
            className="px-4 py-3 bg-neon-red text-white rounded-lg hover:bg-neon-red/80 transition-colors font-medium"
            aria-label="Tester l'annonce d'erreur de validation"
          >
            ⚠️ Test Validation
          </button>

          <button
            onClick={handleTestModal}
            className="px-4 py-3 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors font-medium"
            aria-label="Tester l'annonce d'état de modal"
          >
            🪟 Test Modal
          </button>

          <button
            onClick={handleTestDataUpdate}
            className="px-4 py-3 bg-neon-green text-white rounded-lg hover:bg-neon-green/80 transition-colors font-medium"
            aria-label="Tester l'annonce de mise à jour de données"
          >
            📊 Test Data Update
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-sm font-medium text-blue-400 mb-2">
            💡 Instructions pour les tests
          </h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Activez un screen reader (NVDA, JAWS, VoiceOver)</li>
            <li>• Cliquez sur les boutons pour tester les announces</li>
            <li>• Vérifiez que les messages sont annoncés correctement</li>
            <li>• Testez la navigation clavier (Tab, Shift+Tab)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
