'use client';

import React from 'react';
import { PageHeader, Card, CardContent } from '@/components/ui';

export default function GameStateIncludingPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Game State Including" description="Manage game state and session metrics." />
      <Card>
        <CardContent className="p-6">
          <p className="text-text-muted">Game state configuration and state management controls.</p>
        </CardContent>
      </Card>
    </div>
  );
}
