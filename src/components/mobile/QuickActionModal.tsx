'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  X,
  Utensils,
  Dumbbell,
  Scale,
  BookOpen,
  Clock,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  color: string;
  gradient: string;
}

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function QuickActionModal({
  isOpen,
  onClose,
  className,
}: QuickActionModalProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Actions rapides contextuelles selon la page
  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        id: 'add-meal',
        label: 'Ajouter Repas',
        description: 'Enregistrer un repas rapidement',
        icon: Utensils,
        action: () => {
          router.push('/diete');
          onClose();
          toast.success('Redirection vers la diète');
        },
        color: 'text-orange-400',
        gradient: 'from-orange-500 to-red-500',
      },
      {
        id: 'add-training',
        label: 'Nouvel Entraînement',
        description: 'Enregistrer une séance',
        icon: Dumbbell,
        action: () => {
          router.push('/entrainements');
          onClose();
          toast.success('Redirection vers les entraînements');
        },
        color: 'text-blue-400',
        gradient: 'from-blue-500 to-purple-500',
      },
      {
        id: 'add-measure',
        label: 'Prendre Mesures',
        description: 'Poids, tour de taille...',
        icon: Scale,
        action: () => {
          router.push('/mesures');
          onClose();
          toast.success('Redirection vers les mesures');
        },
        color: 'text-green-400',
        gradient: 'from-green-500 to-teal-500',
      },
      {
        id: 'journal-entry',
        label: 'Journal',
        description: 'Humeur, énergie, notes',
        icon: BookOpen,
        action: () => {
          router.push('/journal');
          onClose();
          toast.success('Redirection vers le journal');
        },
        color: 'text-purple-400',
        gradient: 'from-purple-500 to-pink-500',
      },
    ];

    // Actions contextuelles selon la page actuelle
    if (pathname === '/diete') {
      return [
        {
          id: 'quick-meal',
          label: 'Repas Rapide',
          description: 'Templates favoris',
          icon: Clock,
          action: () => {
            onClose();
            // TODO: Ouvrir modal repas rapide
            toast.success('Repas rapide (à implémenter)');
          },
          color: 'text-yellow-400',
          gradient: 'from-yellow-500 to-orange-500',
        },
        ...baseActions.filter((a) => a.id !== 'add-meal'),
      ];
    }

    if (pathname === '/entrainements') {
      return [
        {
          id: 'quick-training',
          label: 'Entraînement Express',
          description: 'Templates prédéfinis',
          icon: Target,
          action: () => {
            onClose();
            // TODO: Ouvrir modal entraînement express
            toast.success('Entraînement express (à implémenter)');
          },
          color: 'text-cyan-400',
          gradient: 'from-cyan-500 to-blue-500',
        },
        ...baseActions.filter((a) => a.id !== 'add-training'),
      ];
    }

    return baseActions;
  };

  const quickActions = getQuickActions();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-black/95 backdrop-blur-xl',
          'border-t border-white/10',
          'rounded-t-3xl',
          'transform transition-all duration-300 ease-out',
          'md:hidden',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          className,
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <h2 className="text-xl font-bold text-white">Actions Rapides</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="px-6 pb-8">
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="glass-effect rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Icon with gradient */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className="font-semibold text-white text-sm mb-1">
                        {action.label}
                      </h3>
                      <p className="text-xs text-white/60 leading-tight">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Safe area for iPhone */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </>
  );
}
