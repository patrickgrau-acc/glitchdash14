"use client";
/**
 * Modal — accessible dialog (Escape to close, backdrop click, focus trap-lite).
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 *   <Modal open={open} onClose={() => setOpen(false)} title="Confirm">
 *     ...
 *   </Modal>
 *
 * @business-card
 * @module Modal
 * @exports Modal
 */
import React, { useEffect } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="card !shadow-lg w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">{title}</h3>
            <button onClick={onClose} className="btn btn-ghost !p-1" aria-label="Close">
              <Icon name="X" className="w-4 h-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
