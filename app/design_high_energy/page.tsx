'use client';

import React from 'react';
import { PageHeader, Card, CardContent } from '@/components/ui';

export default function DesignHighEnergyPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Design High Energy" description="High-energy themes and cyberpunk aesthetics." />
      <Card>
        <CardContent className="p-6">
          <p className="text-text-muted">High energy theme selection interface.</p>
        </CardContent>
      </Card>
    </div>
  );
}
