"use client";
/**
 * useToast — hook for showing toast notifications.
 *
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *   import { useToast } from '@/components/notifications';
 *   const { toast } = useToast();
 *   toast({ title: 'Saved', variant: 'success' });
 *
 * No provider to mount — <ToastViewport> is already rendered once inside
 * MainLayout (see layout_framework.py), so toasts are visible on every
 * page automatically.
 *
 * @business-card
 * @module useToast
 * @exports useToast
 * @consumes showToast, dismissToast from ./toastStore
 */
import { useCallback } from 'react';
import { showToast, dismissToast, ToastOptions } from './toastStore';

export function useToast(): {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
} {
  const toast = useCallback((options: ToastOptions) => showToast(options), []);
  const dismiss = useCallback((id: string) => dismissToast(id), []);
  return { toast, dismiss };
}