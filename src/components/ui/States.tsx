/**
 * Spinner / EmptyState / Skeleton — loading and empty feedback.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 * @business-card
 * @module States
 * @exports Spinner, EmptyState, Skeleton
 */
import React from 'react';
import { cn } from './cn';
import { Icon } from './Icon';

export function Spinner({ className, size }: { className?: string; size?: number | string }) {
  const sizeClass = size ? `w-${size} h-${size}` : 'w-5 h-5';
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(`inline-block border-2 border-primary border-t-transparent rounded-full animate-spin ${sizeClass}`, className)}
    />
  );
}

export function Skeleton({ className, size }: { className?: string; size?: number | string }) {
  return <div className={cn('animate-pulse rounded bg-surface-alt', className)} />;
}

export function EmptyState({
  icon = 'Inbox',
  title,
  description,
  children,
}: {
  icon?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mb-3">
        <Icon name={icon} className="w-6 h-6 text-text-muted" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="text-sm text-text-muted mt-1 max-w-sm">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
