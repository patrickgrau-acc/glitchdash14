// Implements: SPEC-053, SPEC-054, SPEC-055, SPEC-056, SPEC-057
// Satisfies: TS-001, TS-002, TS-003, TS-004, TS-005
"use client";

import React from 'react';
import GameCanvas from '@/game/GameCanvas';
import { PageHeader } from '@/components/ui';

export default function GlitchDashPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="GlitchDash14 Arcade"
        description="Meme-inspired endless runner featuring the 'Glitch' avatar with real-time intensity scaling and frictionless instant retry."
      />
      <GameCanvas />
    </div>
  );
}