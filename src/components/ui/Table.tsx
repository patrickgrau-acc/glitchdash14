/**
 * Table primitives — themed, accessible data table.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 *   <Table>
 *     <THead><TR><TH>Name</TH></TR></THead>
 *     <TBody><TR><TD>Ada</TD></TR></TBody>
 *   </Table>
 *
 * @business-card
 * @module Table
 * @exports Table, THead, TBody, TR, TH, TD
 */
import React from 'react';
import { cn } from './cn';

export function Table({ className, ...rest }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="card !p-0 overflow-x-auto">
      <table className={cn('w-full text-sm', className)} {...rest} />
    </div>
  );
}
export function THead({ className, ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('border-b border-border bg-surface-alt', className)} {...rest} />;
}
export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}
export function TR({ className, ...rest }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-border last:border-0 hover:bg-surface-alt/60 transition-colors', className)} {...rest} />;
}
export function TH({ className, ...rest }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('text-left font-medium text-text-muted px-4 py-2.5', className)} {...rest} />;
}
export function TD({ className, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-2.5', className)} {...rest} />;
}
