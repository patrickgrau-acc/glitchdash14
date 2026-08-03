'use client';

import React from 'react';
import { PageHeader, Card, CardContent } from '@/components/ui';

export default function SimpleResponsiveOnePage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Simple Responsive One" description="Responsive layout and controls." />
      <Card>
        <CardContent className="p-6">
          <p className="text-text-muted">Simple responsive interface.</p>
        </CardContent>
      </Card>
    </div>
  );
}
