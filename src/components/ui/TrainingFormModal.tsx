'use client';

import React from 'react';
import StandardModal from './StandardModal';
import TrainingForm from './TrainingForm';
import { Entrainement } from '@/types';

interface TrainingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (training: Omit<Entrainement, 'id' | 'user_id'>) => void;
  editingTraining?: Entrainement | null;
  isSubmitting?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export default function TrainingFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingTraining,
  isSubmitting = false,
  maxWidth = '4xl',
}: TrainingFormModalProps) {
  const handleSubmit = (training: Omit<Entrainement, 'id' | 'user_id'>) => {
    onSubmit(training);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingTraining ? "Modifier l'entraînement" : 'Nouvel entraînement'
      }
      subtitle={
        editingTraining
          ? 'Modifiez les données de votre entraînement'
          : 'Ajoutez un nouvel entraînement à votre planning'
      }
      icon="🏋️"
      maxWidth={maxWidth}
      height="85vh"
    >
      <div className="p-6">
        <TrainingForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          existingTraining={editingTraining || undefined}
          isEditing={!!editingTraining}
          isSubmitting={isSubmitting}
        />
      </div>
    </StandardModal>
  );
}
