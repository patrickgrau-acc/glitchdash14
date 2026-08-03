'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextType {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...options, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = options.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastViewport({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        let borderColor = 'border-border';
        let iconName = 'Info';
        let iconColor = 'text-accent';

        if (t.variant === 'success') {
          borderColor = 'border-success';
          iconName = 'CheckCircle2';
          iconColor = 'text-success';
        } else if (t.variant === 'error') {
          borderColor = 'border-danger';
          iconName = 'AlertCircle';
          iconColor = 'text-danger';
        } else if (t.variant === 'warning') {
          borderColor = 'border-warning';
          iconName = 'AlertTriangle';
          iconColor = 'text-warning';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start p-4 rounded bg-surface-alt border ${borderColor} shadow-lg transition-all transform translate-y-0`}
          >
            <div className={`mr-3 mt-0.5 ${iconColor}`}>
              <Icon name={iconName} className="w-5 h-5" />
            </div>
            <div className="flex-1 mr-2">
              <h4 className="font-medium text-sm text-text">{t.title}</h4>
              {t.description && <p className="text-xs text-text-muted mt-1">{t.description}</p>}
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-text-muted hover:text-text transition-colors"
            >
              <Icon name="X" className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
