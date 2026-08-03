"use client";
/**
 * Button — Shadcn-compatible button with standard variants.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 *   <Button>Save</Button>
 *   <Button variant="outline" size="sm">Cancel</Button>
 *   <Button variant="destructive">Delete</Button>
 *
 * @business-card
 * @module Button
 * @exports Button, ButtonProps
 */
import React from 'react';
import { cn } from './cn';

type Variant =
  | 'default'
  | 'primary'
  | 'destructive'
  | 'danger'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';

type Size = 'default' | 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  default:     'inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50',
  primary:     'inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50',
  destructive: 'inline-flex items-center justify-center rounded-md text-sm font-medium bg-destructive text-destructive-foreground h-10 px-4 py-2 hover:bg-destructive/90 transition-colors disabled:pointer-events-none disabled:opacity-50',
  danger:      'inline-flex items-center justify-center rounded-md text-sm font-medium bg-destructive text-destructive-foreground h-10 px-4 py-2 hover:bg-destructive/90 transition-colors disabled:pointer-events-none disabled:opacity-50',
  outline:     'inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors disabled:pointer-events-none disabled:opacity-50',
  secondary:   'inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground h-10 px-4 py-2 hover:bg-secondary/80 transition-colors disabled:pointer-events-none disabled:opacity-50',
  ghost:       'inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors disabled:pointer-events-none disabled:opacity-50',
  link:        'inline-flex items-center justify-center text-sm font-medium text-primary underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50',
};

const SIZES: Record<Size, string> = {
  default: '',
  sm:      'h-9 rounded-md px-3 text-xs',
  md:      '',
  lg:      'h-11 rounded-md px-8',
  icon:    'h-10 w-10',
};

export function Button({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  className,
  children,
  asChild: _asChild,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(VARIANTS[variant], SIZES[size], loading && 'opacity-60 cursor-wait', className)}
    >
      {loading ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}
