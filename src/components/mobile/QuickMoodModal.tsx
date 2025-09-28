'use client';

import { useState } from 'react';
import { X, Heart, Battery, Moon, Zap, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJournal } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface QuickMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface MoodValue {
  humeur?: number;
  energie?: number;
  sommeil?: number;
  stress?: number;
  note?: string;
}

const MOOD_EMOJIS = {
  1: '😢',
  2: '😟',
  3: '😐',
  4: '🙂',
  5: '😊',
  6: '😄',
  7: '😃',
  8: '🤩',
  9: '🥳',
  10: '🚀',
};

const ENERGY_EMOJIS = {
  1: '🪫',
  2: '🔋',
  3: '🔋',
  4: '🔋',
  5: '🔋',
  6: '🔋',
  7: '⚡',
  8: '⚡',
  9: '⚡',
  10: '🚀',
};

const SLEEP_EMOJIS = {
  1: '😴',
  2: '😪',
  3: '😴',
  4: '🛏️',
  5: '💤',
  6: '😌',
  7: '😊',
  8: '🌟',
  9: '✨',
  10: '🚀',
};

const STRESS_EMOJIS = {
  1: '😌',
  2: '🙂',
  3: '😐',
  4: '😟',
  5: '😰',
  6: '😨',
  7: '😱',
  8: '🤯',
  9: '💥',
  10: '🔥',
};

export default function QuickMoodModal({
  isOpen,
  onClose,
  className,
}: QuickMoodModalProps) {
  const { user } = useAuth();
  const { addEntry } = useJournal();
  const [values, setValues] = useState<MoodValue>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('humeur');

  const sections = [
    {
      id: 'humeur',
      label: 'Humeur',
      icon: Heart,
      color: 'text-pink-400',
      emojis: MOOD_EMOJIS,
      question: 'Comment vous sentez-vous ?',
    },
    {
      id: 'energie',
      label: 'Énergie',
      icon: Battery,
      color: 'text-yellow-400',
      emojis: ENERGY_EMOJIS,
      question: "Quel est votre niveau d'énergie ?",
    },
    {
      id: 'sommeil',
      label: 'Sommeil',
      icon: Moon,
      color: 'text-blue-400',
      emojis: SLEEP_EMOJIS,
      question: 'Comment avez-vous dormi ?',
    },
    {
      id: 'stress',
      label: 'Stress',
      icon: Zap,
      color: 'text-red-400',
      emojis: STRESS_EMOJIS,
      question: 'Votre niveau de stress ?',
    },
  ];

  const handleSave = async () => {
    if (!user || isSubmitting) return;

    // Vérifier qu'au moins une valeur est renseignée
    if (
      !values.humeur &&
      !values.energie &&
      !values.sommeil &&
      !values.stress
    ) {
      toast.error('Veuillez renseigner au moins une valeur');
      return;
    }

    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      const entryData = {
        user_id: user.uid,
        date: today,
        humeur: values.humeur as
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6
          | 7
          | 8
          | 9
          | 10
          | undefined,
        energie: values.energie as
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6
          | 7
          | 8
          | 9
          | 10
          | undefined,
        sommeil: values.sommeil as
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6
          | 7
          | 8
          | 9
          | 10
          | undefined,
        stress: values.stress as
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6
          | 7
          | 8
          | 9
          | 10
          | undefined,
        note: values.note || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await addEntry(entryData);

      if (result.success) {
        toast.success('Journal mis à jour ! 📝');
        onClose();
        setValues({});
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setValue = (key: keyof MoodValue, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const currentSection = sections.find((s) => s.id === activeSection);
  const currentValue = values[activeSection as keyof MoodValue] as number;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-black/95 backdrop-blur-xl',
          'border-t border-white/10',
          'rounded-t-3xl',
          'max-h-[80vh] overflow-hidden',
          'transform transition-all duration-300 ease-out',
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
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-400" />
            <h2 className="text-xl font-bold text-white">Journal Express</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const hasValue = values[section.id as keyof MoodValue];

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all relative',
                    isActive
                      ? `bg-white/10 ${section.color} border border-white/20`
                      : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{section.label}</span>
                  {hasValue && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Section Content */}
        {currentSection && (
          <div className="px-6 pb-6">
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              {/* Question */}
              <h3 className="text-lg font-semibold text-white mb-6 text-center">
                {currentSection.question}
              </h3>

              {/* Current Emoji Display */}
              {currentValue && (
                <div className="text-center mb-6">
                  <div className="text-6xl mb-2">
                    {
                      currentSection.emojis[
                        currentValue as keyof typeof currentSection.emojis
                      ]
                    }
                  </div>
                  <div className="text-xl font-bold text-white">
                    {currentValue}/10
                  </div>
                </div>
              )}

              {/* Scale Selector */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    onClick={() =>
                      setValue(activeSection as keyof MoodValue, value)
                    }
                    className={cn(
                      'aspect-square rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1',
                      currentValue === value
                        ? `bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110 shadow-lg`
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:scale-105',
                    )}
                  >
                    <div className="text-lg">
                      {
                        currentSection.emojis[
                          value as keyof typeof currentSection.emojis
                        ]
                      }
                    </div>
                    <div className="text-xs font-medium">{value}</div>
                  </button>
                ))}
              </div>

              {/* Quick Note */}
              <div className="mb-4">
                <label className="text-sm text-white/60 mb-2 block">
                  Note rapide (optionnel)
                </label>
                <textarea
                  value={values.note || ''}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Comment s'est passée votre journée ?"
                  rows={2}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSave}
            disabled={!Object.values(values).some((v) => v) || isSubmitting}
            className={cn(
              'w-full py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2',
              Object.values(values).some((v) => v) && !isSubmitting
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                : 'bg-white/10 text-white/40 cursor-not-allowed',
            )}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer dans le journal
              </>
            )}
          </button>
        </div>

        {/* Safe area for iPhone */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </>
  );
}
