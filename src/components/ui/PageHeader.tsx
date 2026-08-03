/**
 * PageHeader — consistent page title + description + actions slot.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 * @business-card
 * @module PageHeader
 * @exports PageHeader
 */
import React from 'react';
import { cn } from './cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, subtitle, action, children, className }: PageHeaderProps) {
  const actions = children ?? action;
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {(description || subtitle) && (
          <p className="text-muted-foreground">{description ?? subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
