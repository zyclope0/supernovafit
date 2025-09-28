'use client';

import { useState } from 'react';
import { JournalEntry } from '@/types';
import {
  Heart,
  Battery,
  Gauge,
  Zap,
  Moon,
  Activity,
  Save,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
} from 'lucide-react';
import FormModal from '@/components/ui/FormModal';
import CompactSlider from '@/components/ui/CompactSlider';

interface JournalFormProps {
  onSubmit: (
    entryData: Omit<JournalEntry, 'id' | 'user_id'>,
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  existingEntry?: JournalEntry | null;
  isSubmitting?: boolean;
}

// Options météo
const METEO_OPTIONS = [
  { value: 'soleil', label: 'Soleil', icon: Sun, emoji: '☀️' },
  { value: 'nuage', label: 'Nuageux', icon: Cloud, emoji: '☁️' },
  { value: 'pluie', label: 'Pluie', icon: CloudRain, emoji: '🌧️' },
  { value: 'orage', label: 'Orage', icon: Zap, emoji: '⛈️' },
  { value: 'neige', label: 'Neige', icon: Snowflake, emoji: '❄️' },
] as const;

// Activités prédéfinies
const ACTIVITES_SUGGESTIONS = [
  'Marche',
  'Jardinage',
  'Ménage',
  'Shopping',
  'Lecture',
  'Méditation',
  'Cuisine',
  'Bricolage',
  'Jeux vidéo',
  'Film/Série',
  'Socialisation',
  'Travail',
];

// Tabs pour organiser le contenu
const TABS = [
  { id: 'wellness', label: 'Bien-être', icon: Heart },
  { id: 'sleep', label: 'Sommeil', icon: Moon },
  { id: 'activities', label: 'Activités', icon: Activity },
  { id: 'notes', label: 'Notes', icon: Save },
];

export default function JournalForm({
  onSubmit,
  onCancel,
  existingEntry,
  isSubmitting,
}: JournalFormProps) {
  const [activeTab, setActiveTab] = useState<
    'wellness' | 'sleep' | 'activities' | 'notes'
  >('wellness');

  // État du formulaire
  const [formData, setFormData] = useState({
    date: existingEntry?.date || new Date().toISOString().split('T')[0],
    humeur: existingEntry?.humeur || 5,
    energie: existingEntry?.energie || 5,
    stress: existingEntry?.stress || 5,
    motivation: existingEntry?.motivation || 5,
    sommeil_duree: existingEntry?.sommeil_duree || 8,
    sommeil_qualite: existingEntry?.sommeil_qualite || 5,
    meteo: existingEntry?.meteo || 'soleil',
    activites: existingEntry?.activites_annexes || [],
    note: existingEntry?.note || '',
  });

  const [newActivity, setNewActivity] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convertir activites vers activites_annexes pour la soumission
    const { activites, ...restData } = formData;
    await onSubmit({
      ...restData,
      activites_annexes: activites,
    } as Omit<JournalEntry, 'id' | 'user_id'>);
  };

  const addActivity = () => {
    if (
      newActivity.trim() &&
      !formData.activites.includes(newActivity.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        activites: [...prev.activites, newActivity.trim()],
      }));
      setNewActivity('');
    }
  };

  const removeActivity = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      activites: prev.activites.filter((a) => a !== activity),
    }));
  };

  // Contenu des tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'wellness':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-neon-pink" />
              Bien-être général
            </h3>

            <CompactSlider
              label="Humeur"
              value={formData.humeur}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  humeur: value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
                }))
              }
              color="neon-green"
              icon={Heart}
            />

            <CompactSlider
              label="Énergie"
              value={formData.energie}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  energie: value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
                }))
              }
              color="neon-yellow"
              icon={Battery}
            />

            <CompactSlider
              label="Stress"
              value={formData.stress}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  stress: value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
                }))
              }
              color="neon-red"
              icon={Gauge}
            />

            <CompactSlider
              label="Motivation"
              value={formData.motivation}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  motivation: value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
                }))
              }
              color="neon-purple"
              icon={Zap}
            />

            {/* Météo */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Météo du jour
              </label>
              <div className="grid grid-cols-5 gap-2">
                {METEO_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          meteo: option.value,
                        }))
                      }
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        formData.meteo === option.value
                          ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
                          : 'border-white/10 bg-white/5 text-white hover:border-white/20'
                      }`}
                    >
                      <Icon className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xs">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'sleep':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Moon className="h-5 w-5 text-neon-cyan" />
              Sommeil
            </h3>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Durée du sommeil (heures)
              </label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={formData.sommeil_duree}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sommeil_duree: parseFloat(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
              />
            </div>

            <CompactSlider
              label="Qualité du sommeil"
              value={formData.sommeil_qualite}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  sommeil_qualite: value as
                    | 1
                    | 2
                    | 3
                    | 4
                    | 5
                    | 6
                    | 7
                    | 8
                    | 9
                    | 10,
                }))
              }
              color="neon-cyan"
              icon={Moon}
            />
          </div>
        );

      case 'activities':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-neon-green" />
              Activités de la journée
            </h3>

            {/* Activités sélectionnées */}
            {formData.activites.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  Activités sélectionnées
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.activites.map((activity) => (
                    <span
                      key={activity}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm"
                    >
                      {activity}
                      <button
                        type="button"
                        onClick={() => removeActivity(activity)}
                        className="ml-1 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions d'activités */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Suggestions
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ACTIVITES_SUGGESTIONS.map((activity) => (
                  <button
                    key={activity}
                    type="button"
                    onClick={() => {
                      if (!formData.activites.includes(activity)) {
                        setFormData((prev) => ({
                          ...prev,
                          activites: [...prev.activites, activity],
                        }));
                      }
                    }}
                    disabled={formData.activites.includes(activity)}
                    className={`p-2 rounded-lg border text-sm transition-colors ${
                      formData.activites.includes(activity)
                        ? 'border-neon-green bg-neon-green/20 text-neon-green cursor-not-allowed'
                        : 'border-white/10 bg-white/5 text-white hover:border-white/20'
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>

            {/* Ajouter une activité personnalisée */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Ajouter une activité
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="Activité personnalisée..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addActivity())
                  }
                />
                <button
                  type="button"
                  onClick={addActivity}
                  className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Save className="h-5 w-5 text-neon-cyan" />
              Notes du jour
            </h3>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Comment s&apos;est passée votre journée ?
              </label>
              <textarea
                value={formData.note}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder="Décrivez votre journée, vos ressentis, vos réflexions..."
                rows={8}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none resize-none"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <FormModal
      title={existingEntry ? "Modifier l'entrée" : 'Nouvelle entrée'}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(tabId) =>
        setActiveTab(tabId as 'wellness' | 'sleep' | 'activities' | 'notes')
      }
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel={existingEntry ? 'Modifier' : 'Enregistrer'}
    >
      {/* Date (toujours visible) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          Date
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, date: e.target.value }))
          }
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
        />
      </div>

      {/* Contenu du tab actif */}
      {renderTabContent()}
    </FormModal>
  );
}
