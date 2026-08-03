/**
 * Spinner / Skeleton / EmptyState — loading and empty feedback.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 * @business-card
 * @module States
 * @exports Spinner, Skeleton, EmptyState
 */
import React from 'react';
import { cn } from './cn';
import { Icon } from './Icon';

export function Spinner({ className, size }: { className?: string; size?: number | string }) {
  const sizeClass =
    size === 'sm' ? 'w-4 h-4'
    : size === 'md' ? 'w-6 h-6'
    : size === 'lg' ? 'w-8 h-8'
    : typeof size === 'number' ? `w-${size} h-${size}`
    : 'w-5 h-5';
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(`inline-block border-2 border-primary border-t-transparent rounded-full animate-spin ${sizeClass}`, className)}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
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
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Icon name={icon} className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      {children}
    </div>
  );
}
