/**
 * Modal — accessible dialog overlay.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 * @business-card
 * @module Modal
 * @exports Modal
 */
import React from 'react';
import { cn } from './cn';
import { Icon } from './Icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: string;
  className?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, size = 'max-w-lg', className, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className={cn('relative bg-background rounded-lg shadow-lg w-full border p-6', size, className)}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="rounded-sm opacity-70 hover:opacity-100" aria-label="Close">
              <Icon name="X" className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
