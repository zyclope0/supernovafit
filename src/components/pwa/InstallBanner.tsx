'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Download, X, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InstallBanner() {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    isServiceWorkerReady,
    installApp,
  } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà dismissé le banner
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Ne pas afficher si déjà installé, dismissé, ou pas installable
  if (isInstalled || isDismissed || !isInstallable || !isServiceWorkerReady) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await installApp();
      toast.success('SuperNovaFit installé avec succès ! 🎉');
    } catch (error) {
      console.error('Erreur installation PWA:', error);
      toast.error('Erreur lors de l&apos;installation');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Stocker en localStorage pour ne pas re-afficher
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="glass-effect rounded-xl p-4 border border-white/20 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Smartphone className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">
              Installer SuperNovaFit
            </h3>
            <p className="text-xs text-white/70 mb-3">
              Accédez rapidement à votre app depuis votre écran d&apos;accueil
              {!isOnline && (
                <span className="block text-yellow-400 mt-1">
                  ⚠️ Mode hors ligne disponible
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                <Download className="w-3 h-3" />
                Installer
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-white/70 hover:text-white text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg"
              >
                Plus tard
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-white/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
