/**
 * Badge — Shadcn-compatible status pill.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 *   <Badge>New</Badge>
 *   <Badge variant="destructive">Error</Badge>
 *
 * @business-card
 * @module Badge
 * @exports Badge, BadgeProps
 */
import React from 'react';
import { cn } from './cn';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'danger'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const MAP: Record<BadgeVariant, string> = {
  default:     'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground transition-colors',
  secondary:   'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground',
  destructive: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-destructive text-destructive-foreground',
  danger:      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-destructive text-destructive-foreground',
  outline:     'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground',
  success:     'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning:     'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  info:        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export function Badge({ variant = 'default', className, ...rest }: BadgeProps) {
  return <span className={cn(MAP[variant], className)} {...rest} />;
}
