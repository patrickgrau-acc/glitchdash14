/**
 * Badge — small status pill.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 *   <Badge variant="success">Active</Badge>
 *
 * @business-card
 * @module Badge
 * @exports Badge, BadgeProps
 */
import React from 'react';
import { cn } from './cn';

type BadgeVariant = 'default' | 'secondary' | 'info' | 'success' | 'warning' | 'danger' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const MAP: Record<BadgeVariant, string> = {
  default: 'badge',
  secondary: 'badge badge-secondary',
  info: 'badge badge-info',
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger: 'badge badge-danger',
  outline: 'badge badge-outline',
};

export function Badge({ variant = 'info', className, ...rest }: BadgeProps) {
  return <span className={cn(MAP[variant], className)} {...rest} />;
}
