'use client';

import React from 'react';
import clsx from 'clsx';
import { LucideIcons } from 'lucide-react';
import * as Icons from 'lucide-react';

export function Icon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as Record<string, any>)[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
    
    const variants = {
      primary: 'bg-primary text-white hover:opacity-90',
      secondary: 'bg-surface-alt text-text hover:bg-border',
      outline: 'border border-border text-text hover:bg-surface-alt',
      danger: 'bg-danger text-white hover:opacity-90',
      ghost: 'text-text hover:bg-surface-alt',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export function Card({ children, className, hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={clsx('bg-surface-alt border border-border rounded p-6 shadow-sm', hover && 'transition-transform hover:-translate-y-0.5 hover:border-primary', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={clsx('text-lg font-semibold text-text', className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={clsx('text-sm text-text-muted mt-1', className)}>{children}</p>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('mt-4 pt-4 border-t border-border flex items-center justify-between', className)}>{children}</div>;
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx('w-full bg-surface border border-border rounded px-3 py-2 text-text text-sm focus:outline-none focus:border-primary', className)}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx('w-full bg-surface border border-border rounded px-3 py-2 text-text text-sm focus:outline-none focus:border-primary', className)}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={clsx('w-full bg-surface border border-border rounded px-3 py-2 text-text text-sm focus:outline-none focus:border-primary', className)}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={clsx('block text-xs font-medium text-text-muted mb-1', className)} {...props}>
      {children}
    </label>
  );
}

export function Badge({ children, className, variant = 'primary' }: { children: React.ReactNode; className?: string; variant?: 'primary' | 'success' | 'warning' | 'danger' | 'outline' }) {
  const variants = {
    primary: 'bg-primary/20 text-primary border border-primary/30',
    success: 'bg-success/20 text-success border border-success/30',
    warning: 'bg-warning/20 text-warning border border-warning/30',
    danger: 'bg-danger/20 text-danger border border-danger/30',
    outline: 'border border-border text-text-muted',
  };

  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-border pb-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <div className={clsx('animate-spin rounded-full h-6 w-6 border-b-2 border-primary', className)} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-surface-alt rounded', className)} />;
}

export function EmptyState({ title, description, icon = 'FolderOpen', action }: { title: string; description: string; icon?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-alt/50 border border-border rounded">
      <div className="p-4 bg-surface rounded-full text-text-muted mb-4">
        <Icon name={icon} className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-medium text-text">{title}</h3>
      <p className="text-sm text-text-muted max-w-md mt-1 mb-6">{description}</p>
      {action}
    </div>
  );
}

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto border border-border rounded bg-surface-alt">
      <table className={clsx('w-full text-left text-sm text-text', className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-surface border-b border-border text-text-muted uppercase text-xs">{children}</thead>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={clsx('hover:bg-surface/50 transition-colors', className)}>{children}</tr>;
}

export function TH({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={clsx('px-4 py-3 font-medium', className)}>{children}</th>;
}

export function TD({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={clsx('px-4 py-3', className)}>{children}</td>;
}

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-surface-alt border border-border rounded max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <Icon name="X" className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

// Auto-added by shipper: re-export sibling components missing from barrel
export * from './States';
export * from './cn';
