// Implements: TS-0094 (Verify that engine-reset clears event listeners and timers while resetting state within performance limits)
// Satisfies: UC (o3vE8R3IbbRkwkydBZ5R - Flush Execution Context)

import { GameSystem, GameState, InputState } from '../types';

interface TrackedTimer {
  id: any;
  createdAt: number;
  label?: string;
}

interface TrackedListener {
  target: EventTarget;
  type: string;
  listener: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
}

interface FlushExecutionContextData {
  timers: TrackedTimer[];
  listeners: TrackedListener[];
  lastFlushDurationMs: number;
  resetCount: number;
  isFlushing: boolean;
  boundSampleHandler?: (e: Event) => void;
}

/**
 * FlushExecutionContextSystem manages session lifecycle cleanup, ensuring all
 * dynamic background timers, scheduled background tasks, and event listeners are
 * thoroughly terminated, uninstalled, and re-bound within performance thresholds (<16ms).
 */
const FlushExecutionContextSystem: GameSystem = {
  id: 'flush_execution_context',
  order: 10,

  reset(state: GameState): void {
    const startTime = performance.now();
    
    // Initialize or retrieve scratch data
    const data: FlushExecutionContextData = state.data.flushContext || {
      timers: [],
      listeners: [],
      lastFlushDurationMs: 0,
      resetCount: 0,
      isFlushing: false
    };

    data.isFlushing = true;

    // 1. Terminate all background timers and scheduled tasks tracked in the context
    if (data.timers && data.timers.length > 0) {
      for (const t of data.timers) {
        clearInterval(t.id);
        clearTimeout(t.id);
      }
      data.timers = [];
    }

    // Also clear any legacy global timers if registered under data
    if (state.data.backgroundIntervals && Array.isArray(state.data.backgroundIntervals)) {
      state.data.backgroundIntervals.forEach((id: any) => {
        clearInterval(id);
        clearTimeout(id);
      });
      state.data.backgroundIntervals = [];
    }

    // 2. Remove all active event listeners tracked during gameplay
    if (data.listeners && data.listeners.length > 0) {
      for (const l of data.listeners) {
        try {
          l.target.removeEventListener(l.type, l.listener, l.options);
        } catch (err) {
          // Ignore removal errors on detached nodes
        }
      }
      data.listeners = [];
    }

    // Re-bind essential clean core listeners if needed (simulating re-init)
    const sampleHandler = data.boundSampleHandler || ((e: Event) => {
      state.events.push('flush_listener_ping');
    });
    data.boundSampleHandler = sampleHandler;

    // Register a fresh event listener for gameplay interactions
    window.addEventListener('keydown', sampleHandler);
    data.listeners.push({
      target: window,
      type: 'keydown',
      listener: sampleHandler
    });

    // 3. Register a demonstration background task to prove timer lifecycle management
    const demoTimer = setInterval(() => {
      // Background task that should be cleared on subsequent resets
    }, 1000);
    data.timers.push({ id: demoTimer, createdAt: Date.now(), label: 'demo_session_timer' });

    data.resetCount = (data.resetCount || 0) + 1;
    data.isFlushing = false;

    const endTime = performance.now();
    data.lastFlushDurationMs = endTime - startTime;

    // Store back into state.data
    state.data.flushContext = data;
    state.data.hardCapReached = false;

    // Push diagnostic event confirming flush execution
    state.events.push('engine_reset_flushed');
  },

  update(state: GameState, input: InputState, dt: number): void {
    // Ensure data container exists
    if (!state.data.flushContext) {
      state.data.flushContext = {
        timers: [],
        listeners: [],
        lastFlushDurationMs: 0,
        resetCount: 0,
        isFlushing: false
      };
    }

    const data: FlushExecutionContextData = state.data.flushContext;

    // If game has just entered ready/playing phase or events indicate a reset, ensure clean state
    if (state.events.includes('over') && !data.isFlushing) {
      // Gracefully record session end stats if needed
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    const data: FlushExecutionContextData = state.data.flushContext;
    if (!data) return;

    // Optional subtle debug or performance indicator in debug mode
    if (state.data.debugHitboxes && data.lastFlushDurationMs > 0) {
      ctx.save();
      ctx.font = '10px Roboto, monospace';
      ctx.fillStyle = 'rgba(0, 255, 200, 0.7)';
      ctx.textAlign = 'right';
      ctx.fillText(`Flush: ${data.lastFlushDurationMs.toFixed(2)}ms (Resets: ${data.resetCount})`, state.width - 16, 32);
      ctx.restore();
    }
  }
};

export default FlushExecutionContextSystem;