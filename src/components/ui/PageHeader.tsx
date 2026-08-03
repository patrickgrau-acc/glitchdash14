/**
 * PageHeader — consistent page title + description + actions slot.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 *   <PageHeader title="Orders" description="Manage customer orders">
 *     <Button>New order</Button>
 *   </PageHeader>
 *
 * @business-card
 * @module PageHeader
 * @exports PageHeader
 */
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="page-header flex items-start justify-between gap-4">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}
