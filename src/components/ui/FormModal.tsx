'use client';

import { ReactNode } from 'react';
import StandardModal from './StandardModal';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface FormModalProps {
  title: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  children: ReactNode;
}

export default function FormModal({
  title,
  tabs,
  activeTab,
  onTabChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Enregistrer',
  children,
}: FormModalProps) {
  const footerContent = (
    <div className="flex items-center justify-end gap-3 p-6">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        Annuler
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="px-6 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Enregistrement...' : submitLabel}
      </button>
    </div>
  );

  return (
    <StandardModal
      isOpen={true}
      onClose={onCancel}
      title={title}
      maxWidth="2xl"
      height="calc(100vh - 120px)" // Réserve 120px pour navigation bottom + padding
      showFooter={true}
      footerContent={footerContent}
    >
      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-neon-purple border-b-2 border-neon-purple bg-neon-purple/5'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <form
          onSubmit={onSubmit}
          className="flex-1 flex flex-col p-6 overflow-y-auto"
        >
          {children}
        </form>
      </div>
    </StandardModal>
  );
}
