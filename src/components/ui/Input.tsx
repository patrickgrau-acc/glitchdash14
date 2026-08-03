/**
 * Input / Label / Textarea / Select — themed form controls.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 * @business-card
 * @module Input
 * @exports Input, Label, Textarea, Select
 */
import React from 'react';
import { cn } from './cn';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => <input ref={ref} className={cn('input', className)} {...rest} />
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => <textarea ref={ref} className={cn('textarea', className)} {...rest} />
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...rest }, ref) => <select ref={ref} className={cn('select', className)} {...rest} />
);
Select.displayName = 'Select';

export function Label({ className, ...rest }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('block text-sm font-medium mb-1', className)} {...rest} />;
}
