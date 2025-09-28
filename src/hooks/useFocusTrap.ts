'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
  isActive: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  onClose?: () => void;
  initialFocus?: string;
  trapFocus?: boolean;
}

export function useFocusTrap({
  isActive,
  closeOnEscape = true,
  closeOnOutsideClick = false,
  onClose,
  initialFocus,
  trapFocus = true,
}: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focusable elements selector
  const focusableElementsSelector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  // Get focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll(focusableElementsSelector),
    ) as HTMLElement[];
  }, [focusableElementsSelector]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive || !trapFocus) return;

      const { key, shiftKey } = event;
      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Handle Escape key
      if (key === 'Escape' && closeOnEscape && onClose) {
        event.preventDefault();
        onClose();
        return;
      }

      // Handle Tab navigation
      if (key === 'Tab') {
        if (shiftKey) {
          // Shift + Tab (backwards)
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab (forwards)
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [isActive, trapFocus, closeOnEscape, onClose, getFocusableElements],
  );

  // Handle outside clicks
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!isActive || !closeOnOutsideClick || !onClose) return;

      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        onClose();
      }
    },
    [isActive, closeOnOutsideClick, onClose],
  );

  // Set up focus management
  useEffect(() => {
    if (!isActive) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus initial element or first focusable element
    const focusableElements = getFocusableElements();
    let elementToFocus: HTMLElement | null = null;

    if (initialFocus && containerRef.current) {
      elementToFocus = containerRef.current.querySelector(initialFocus);
    }

    if (!elementToFocus && focusableElements.length > 0) {
      elementToFocus = focusableElements[0];
    }

    // Focus the element after a short delay to ensure DOM is ready
    const focusTimer = setTimeout(() => {
      if (elementToFocus) {
        elementToFocus.focus();
      }
    }, 50);

    return () => {
      clearTimeout(focusTimer);
    };
  }, [isActive, initialFocus, getFocusableElements]);

  // Restore focus when trap is deactivated
  useEffect(() => {
    if (!isActive && previousActiveElement.current) {
      const restoreTimer = setTimeout(() => {
        previousActiveElement.current?.focus();
        previousActiveElement.current = null;
      }, 50);

      return () => clearTimeout(restoreTimer);
    }
  }, [isActive]);

  // Add event listeners
  useEffect(() => {
    if (!isActive) return;

    document.addEventListener('keydown', handleKeyDown);

    if (closeOnOutsideClick) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActive, handleKeyDown, handleClickOutside, closeOnOutsideClick]);

  return {
    containerRef,
    getFocusableElements,
  };
}
