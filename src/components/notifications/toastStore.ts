/**
 * Toast store — external store for the app's toast/notification surface.
 *
 * Plain module-scoped state + subscriber list (no React Context, so there
 * is no <ToastProvider> to remember to mount). useToast() subscribes to
 * this store; <ToastViewport> (rendered once, inside MainLayout) reads
 * from it and renders the stacked list.
 *
 * @business-card
 * @module toastStore
 * @exports ToastVariant, ToastOptions, ToastItem, showToast, dismissToast,
 *          subscribeToasts, getToasts
 */

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  /** Auto-dismiss after this many ms. Defaults to 4000. Pass 0 to persist until dismissed. */
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
  variant: ToastVariant;
}

let _toasts: ToastItem[] = [];
let _seq = 0;
const _listeners = new Set<() => void>();
const _timers = new Map<string, ReturnType<typeof setTimeout>>();

function _emit(): void {
  _listeners.forEach((listener) => listener());
}

export function getToasts(): ToastItem[] {
  return _toasts;
}

export function subscribeToasts(listener: () => void): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

export function dismissToast(id: string): void {
  _toasts = _toasts.filter((t) => t.id !== id);
  const timer = _timers.get(id);
  if (timer) {
    clearTimeout(timer);
    _timers.delete(id);
  }
  _emit();
}

export function showToast(options: ToastOptions): string {
  _seq += 1;
  const id = `toast_${Date.now()}_${_seq}`;
  const item: ToastItem = { id, variant: options.variant || 'info', ...options };
  _toasts = [..._toasts, item];
  _emit();
  const duration = options.duration ?? 4000;
  if (duration > 0) {
    _timers.set(id, setTimeout(() => dismissToast(id), duration));
  }
  return id;
}
