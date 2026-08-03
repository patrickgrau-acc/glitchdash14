'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui';

export interface Step {
  id: string;
  label: string;
  path: string | null;
  description?: string | null;
}

export interface WorkflowContextType {
  featureKey: string;
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  goToStep: (step: number) => void;
  markComplete: (stepIndex: number) => void;
  markStepComplete: (stepIndex: number) => void;
  completedSteps: number[];
  totalSteps: number;
  isComplete: boolean;
  progress: number;
  isStepAccessible: (index: number) => boolean;
  workflowId: string | null;
  setWorkflowId: (id: string | null) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function useWorkflowProgress(featureKey: string, totalSteps: number) {
  const searchParams = useSearchParams();
  const [workflowId, setWorkflowStateId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const wid = searchParams.get('workflowId');
    if (wid) {
      setWorkflowStateId(wid);
    } else {
      const savedWid = localStorage.getItem(`workflow_${featureKey}_id`);
      if (savedWid) {
        setWorkflowStateId(savedWid);
      }
    }

    const savedState = localStorage.getItem(`workflow_${featureKey}_state`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (typeof parsed.currentStep === 'number') setCurrentStep(parsed.currentStep);
        if (Array.isArray(parsed.completedSteps)) setCompletedSteps(parsed.completedSteps);
      } catch (e) {
        // ignore
      }
    }
  }, [featureKey, searchParams]);

  const setWorkflowId = useCallback((id: string | null) => {
    setWorkflowStateId(id);
    if (id) {
      localStorage.setItem(`workflow_${featureKey}_id`, id);
    } else {
      localStorage.removeItem(`workflow_${featureKey}_id`);
    }
  }, [featureKey]);

  const markComplete = useCallback((stepIndex: number) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(stepIndex) ? prev : [...prev, stepIndex];
      const newState = { currentStep: Math.min(stepIndex + 1, totalSteps - 1), completedSteps: next };
      localStorage.setItem(`workflow_${featureKey}_state`, JSON.stringify(newState));
      return next;
    });
  }, [featureKey, totalSteps]);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setCompletedSteps((prev) => {
      const newState = { currentStep: step, completedSteps: prev };
      localStorage.setItem(`workflow_${featureKey}_state`, JSON.stringify(newState));
      return prev;
    });
  }, [featureKey]);

  const isComplete = completedSteps.length >= totalSteps;
  const progress = Math.round((completedSteps.length / totalSteps) * 100);

  return {
    currentStep,
    setCurrentStep,
    goToStep,
    completedSteps,
    markComplete,
    totalSteps,
    isComplete,
    progress,
    workflowId,
    setWorkflowId,
  };
}

export function WorkflowProvider({ featureKey, steps, children }: { featureKey: string; steps: Step[]; children: React.ReactNode }) {
  const progressData = useWorkflowProgress(featureKey, steps.length);

  const isStepAccessible = useCallback((index: number) => {
    if (index === 0) return true;
    for (let i = 0; i < index; i++) {
      if (!progressData.completedSteps.includes(i)) return false;
    }
    return true;
  }, [progressData.completedSteps]);

  const value = {
    featureKey,
    steps,
    ...progressData,
    markStepComplete: progressData.markComplete,
    isStepAccessible,
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflowContext() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflowContext must be used within a WorkflowProvider');
  }
  return context;
}

export function WorkflowStepper({ steps, currentStep, completedSteps, onStepClick }: { steps: Step[]; currentStep: number; completedSteps: number[]; onStepClick?: (i: number) => void }) {
  return (
    <div className="flex items-center justify-between w-full py-4 mb-6 border-b border-border">
      {steps.map((step, idx) => {
        const isCurrent = idx === currentStep;
        const isCompleted = completedSteps.includes(idx);

        let bg = 'bg-surface border-border text-text-muted';
        if (isCompleted) bg = 'bg-success/20 border-success text-success';
        else if (isCurrent) bg = 'bg-primary/20 border-primary text-primary font-bold';

        return (
          <div
            key={step.id}
            onClick={() => onStepClick && onStepClick(idx)}
            className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-all ${bg}`}
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full border text-xs font-semibold">
              {isCompleted ? <Icon name="Check" className="w-3.5 h-3.5" /> : idx + 1}
            </div>
            <span className="text-xs font-medium hidden sm:inline">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function WorkflowNav({ previousPath, previousLabel, nextPath, nextLabel, onPrevious, onNext }: { previousPath?: string | null; previousLabel?: string | null; nextPath?: string | null; nextLabel?: string | null; onPrevious?: () => void; onNext?: () => void }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
      {previousPath !== undefined && previousPath !== null ? (
        <button
          onClick={() => {
            if (onPrevious) onPrevious();
            router.push(previousPath);
          }}
          className="inline-flex items-center px-4 py-2 rounded bg-surface-alt border border-border text-text text-sm font-medium hover:bg-border transition-colors"
        >
          <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
          {previousLabel || 'Previous Step'}
        </button>
      ) : <div />}

      {nextPath !== undefined && nextPath !== null ? (
        <button
          onClick={() => {
            if (onNext) onNext();
            router.push(nextPath);
          }}
          className="inline-flex items-center px-4 py-2 rounded bg-primary text-white text-sm font-medium hover:opacity-90 transition-colors"
        >
          {nextLabel || 'Next Step'}
          <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
        </button>
      ) : <div />}
    </div>
  );
}

export function WorkflowGate({ requiredStep, stepIndex, fallback, children }: { requiredStep?: number; stepIndex?: number; fallback?: React.ReactNode; children: React.ReactNode }) {
  const context = useContext(WorkflowContext);
  const targetStep = requiredStep !== undefined ? requiredStep : (stepIndex !== undefined ? stepIndex : 0);

  if (!context) {
    return <>{children}</>;
  }

  const isAccessible = context.isStepAccessible(targetStep);

  if (!isAccessible) {
    return (
      <div className="p-6 bg-surface-alt border border-border rounded text-center my-4">
        {fallback || (
          <div>
            <h4 className="text-base font-semibold text-text mb-1">Step Locked</h4>
            <p className="text-xs text-text-muted">Please complete prior workflow steps to access this content.</p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
