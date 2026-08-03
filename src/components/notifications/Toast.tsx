"use client";
/**
 * ToastViewport — renders the stacked toast list.
 *
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 * Mounted ONCE, inside MainLayout (see layout_framework.py) — every page
 * already renders inside MainLayout, so this never needs a second mount
 * point. Do NOT render a second <ToastViewport> elsewhere; do NOT build a
 * competing toast/snackbar component — see the "single owner per shared
 * surface" rule this scaffold exists to enforce.
 *
 * @business-card
 * @module ToastViewport
 * @exports ToastViewport
 * @consumes Icon, cn from @/components/ui; getToasts, subscribeToasts,
 *           dismissToast from ./toastStore
 */
import React, { useEffect, useState } from 'react';
import { Icon, cn } from '@/components/ui';
import { getToasts, subscribeToasts, dismissToast, type ToastItem } from './toastStore';

const VARIANT_ICON: Record<string, string> = {
  success: 'CheckCircle2',
  error: 'XCircle',
  warning: 'AlertTriangle',
  info: 'Info',
};

const VARIANT_CLASS: Record<string, string> = {
  success: 'border-success/40 text-success',
  error: 'border-danger/40 text-danger',
  warning: 'border-warning/40 text-warning',
  info: 'border-border text-text',
};

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>(() => getToasts());

  useEffect(() => subscribeToasts(() => setToasts(getToasts())), []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          className={cn(
            'bg-surface border rounded-md shadow-lg p-3 flex items-start gap-2 pointer-events-auto',
            VARIANT_CLASS[t.variant] || VARIANT_CLASS.info
          )}
        >
          <Icon name={VARIANT_ICON[t.variant] || 'Info'} className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            {t.title && <p className="text-sm font-medium text-text">{t.title}</p>}
            {t.description && (
              <p className="text-xs text-text-muted mt-0.5">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            className="text-text-muted hover:text-text shrink-0"
            aria-label="Dismiss"
          >
            <Icon name="X" className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
