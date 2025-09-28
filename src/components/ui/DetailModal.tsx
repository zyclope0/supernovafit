'use client';

import React from 'react';
import StandardModal from './StandardModal';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onEdit?: () => void;
  editLabel?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export default function DetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  onEdit,
  editLabel = 'Modifier',
  children,
  maxWidth = '4xl',
}: DetailModalProps) {
  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      onEdit={onEdit}
      editLabel={editLabel}
      maxWidth={maxWidth}
      height="90vh"
    >
      <div className="p-6">{children}</div>
    </StandardModal>
  );
}
