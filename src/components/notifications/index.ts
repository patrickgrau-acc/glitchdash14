/**
 * Toast/Notification System — Barrel Export
 *
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *   import { useToast } from '@/components/notifications';
 *
 * @business-card
 * @module notifications
 * @exports useToast, ToastViewport, ToastVariant, ToastOptions
 */
export { useToast } from './useToast';
export { ToastViewport, ToastProvider } from './Toast';
export type { ToastVariant, ToastOptions, ToastItem } from './toastStore';