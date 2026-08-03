'use client';

import React from 'react';
import { PageHeader, Card, CardContent } from '@/components/ui';

export default function FrictionlessInstantRetryPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Frictionless Instant Retry" description="Instant retry and restart management." />
      <Card>
        <CardContent className="p-6">
          <p className="text-text-muted">Instant retry interface.</p>
        </CardContent>
      </Card>
    </div>
  );
}
