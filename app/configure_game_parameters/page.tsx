'use client';

import React from 'react';
import { PageHeader, Card, CardContent } from '@/components/ui';

export default function ConfigureGameParametersPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Configure Game Parameters" description="Tune speeds, gravity, and difficulty parameters." />
      <Card>
        <CardContent className="p-6">
          <p className="text-text-muted">Game parameter configuration interface.</p>
        </CardContent>
      </Card>
    </div>
  );
}
