'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Icon, Button } from '@/components/ui';

// Cast Card to any to bypass strict type check conflicts with the underlying implementation's HTMLAttributes
const SafeCard = Card as any;

interface FeatureCardData {
  title: string;
  description: string;
  icon: string;
  featureKey: string;
  steps: { label: string; path: string }[];
  category: 'Core Game' | 'Configuration' | 'Analytics';
}

const FEATURES: FeatureCardData[] = [
  {
    title: 'GlitchDash Arcade Game',
    description: 'Single-player endless runner featuring the Glitch character with one-button controls and dynamic difficulty scaling.',
    icon: 'Gamepad2',
    featureKey: 'glitch_game',
    category: 'Core Game',
    steps: [
      { label: '① Start Game Session', path: '/glitch_dash/start' },
      { label: '② Live Play & Controls', path: '/glitch_dash/play' },
      { label: '③ High Scores & Stats', path: '/glitch_dash/scores' },
    ],
  },
  {
    title: 'Game Balance & Parameters',
    description: 'Fine-tune difficulty curves, precise collision hitboxes, physics multipliers, and sensory settings in real time.',
    icon: 'Sliders',
    featureKey: 'glitch_config',
    category: 'Configuration',
    steps: [
      { label: '① Difficulty Scaling Curve', path: '/glitch_dash/config/difficulty' },
      { label: '② Aesthetics & Audio Mute', path: '/glitch_dash/config/aesthetics' },
    ],
  },
  {
    title: 'Performance & Analytics Monitor',
    description: 'Monitor frame rate, telemetry fairness, collision performance, and debug mode metrics for educational stability.',
    icon: 'Activity',
    featureKey: 'glitch_analytics',
    category: 'Analytics',
    steps: [
      { label: '① Performance Monitor', path: '/glitch_dash/analytics/monitor' },
      { label: '② Real-time Debug Mode', path: '/glitch_dash/analytics/debug' },
    ],
  },
];

export default function DashboardPage() {
  const [workflowStates, setWorkflowStates] = useState<Record<string, { currentStep: number; completedSteps: number[] }>>({});

  useEffect(() => {
    const states: Record<string, { currentStep: number; completedSteps: number[] }> = {};
    for (const f of FEATURES) {
      const saved = localStorage.getItem(`workflow_${f.featureKey}_state`);
      if (saved) {
        try {
          states[f.featureKey] = JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
    }
    setWorkflowStates(states);
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="GlitchDash14 Hub"
        description="Browser-based endless runner arcade platform engineered for educational environments."
      >
        <Link href="/glitch_dash/play">
          <Button variant="primary">
            <Icon name="Play" className="w-4 h-4 mr-2" />
            Launch Game
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SafeCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted font-medium">Platform Status</p>
              <h3 className="text-xl font-bold text-text mt-1">100% Operational</h3>
            </div>
            <div className="p-3 bg-success/20 text-success rounded-full">
              <Icon name="ShieldCheck" className="w-6 h-6" />
            </div>
          </div>
        </SafeCard>
        <SafeCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted font-medium">Architecture</p>
              <h3 className="text-xl font-bold text-text mt-1">Zero-Dependency</h3>
            </div>
            <div className="p-3 bg-primary/20 text-primary rounded-full">
              <Icon name="Cpu" className="w-6 h-6" />
            </div>
          </div>
        </SafeCard>
        <SafeCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted font-medium">Environment</p>
              <h3 className="text-xl font-bold text-text mt-1">School Safe</h3>
            </div>
            <div className="p-3 bg-accent/20 text-accent rounded-full">
              <Icon name="GraduationCap" className="w-6 h-6" />
            </div>
          </div>
        </SafeCard>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-text tracking-wide">Feature Workflows</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const state = workflowStates[feat.featureKey];
            const currentStepIdx = state?.currentStep || 0;
            const completedCount = state?.completedSteps?.length || 0;
            const totalSteps = feat.steps.length;
            const progress = Math.round((completedCount / totalSteps) * 100);
            const activeStep = feat.steps[currentStepIdx] || feat.steps[0];

            return (
              <SafeCard key={feat.featureKey} hover className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded bg-surface border border-border text-primary">
                      <Icon name={feat.icon} className="w-6 h-6" />
                    </div>
                    <Badge variant="outline">{feat.category}</Badge>
                  </div>
                  <CardTitle>{feat.title}</CardTitle>
                  <CardDescription>{feat.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>Progress ({completedCount}/{totalSteps} steps)</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded overflow-hidden border border-border">
                      <div className="bg-primary h-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-surface rounded border border-border space-y-1">
                    <span className="text-xs text-text-muted uppercase font-semibold">Current Step</span>
                    <p className="text-sm font-medium text-text">{activeStep.label}</p>
                  </div>
                </CardContent>

                <CardFooter>
                  <span className="text-xs text-text-muted">Step {currentStepIdx + 1} of {totalSteps}</span>
                  <Link href={activeStep.path}>
                    <Button size="sm" variant="primary">
                      {completedCount > 0 ? 'Continue →' : 'Start Workflow →'}
                    </Button>
                  </Link>
                </CardFooter>
              </SafeCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}