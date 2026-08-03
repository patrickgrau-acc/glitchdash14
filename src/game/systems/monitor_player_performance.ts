/**
 * Implements: SPEC-052, SPEC-059, SPEC-065
 * Satisfies: TS-0052, TS-0059, TS-0065
 * 
 * Monitor Player Performance for Difficulty Scaling Game System.
 * Tracks survival duration, collision frequency, and intensity scaling adjustments
 * across active game sessions with clean resets on game over / restart.
 */

import { GameSystem, GameState, InputState } from '../types';

interface PerformanceMonitorData {
  survivalTime: number;
  lastCollisionCheckTime: number;
  collisionEventsCount: number;
  recentCollisions: number[];
  performanceWarning: string | null;
  intensityControllerPaused: boolean;
  currentFps: number;
  smoothedFrameTime: number;
  gracePeriodTimer: number;
  lastSurvivalTierSignaled: number;
}

const monitorPlayerPerformanceSystem: GameSystem = {
  id: 'monitor_player_performance',
  order: 35,

  reset(state: GameState): void {
    state.data.performanceMonitor = {
      survivalTime: 0,
      lastCollisionCheckTime: 0,
      collisionEventsCount: 0,
      recentCollisions: [],
      performanceWarning: null,
      intensityControllerPaused: false,
      currentFps: 60,
      smoothedFrameTime: 16.67,
      gracePeriodTimer: 0,
      lastSurvivalTierSignaled: -1,
    } as PerformanceMonitorData;

    // Note: does NOT reset state.data.globalSpeedMultiplier/intensity/hardCapReached —
    // those are owned by configure_intensity_scaling_curve.ts/apply_smoothing_functions.ts
    // (order 10/25, reset() runs before this system's at order 35). This system only
    // layers a temporary fairness dip on top of their baseline; it must not clobber it.
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (!state.data.performanceMonitor) {
      monitorPlayerPerformanceSystem.reset?.(state);
    }

    const monitor: PerformanceMonitorData = state.data.performanceMonitor;

    // If not playing, keep trackers steady
    if (state.phase !== 'playing') {
      if (state.phase === 'over') {
        monitor.survivalTime = 0;
      }
      return;
    }

    // Smooth frame time estimation for performance monitoring
    const frameTimeMs = dt * 1000;
    monitor.smoothedFrameTime = monitor.smoothedFrameTime * 0.9 + frameTimeMs * 0.1;
    monitor.currentFps = Math.round(1000 / Math.max(monitor.smoothedFrameTime, 1));

    // Track active survival duration (TS-0065)
    monitor.survivalTime += dt;

    // Handle grace period countdown if active (TS-0052)
    if (monitor.gracePeriodTimer > 0) {
      monitor.gracePeriodTimer -= dt;
      if (monitor.gracePeriodTimer <= 0) {
        monitor.performanceWarning = null;
        monitor.intensityControllerPaused = false;
        state.data.intensityControllerPaused = false;
      }
    }

    // Inspect events emitted by base_player or collision engine
    const now = state.t;
    const hitOccurred = state.events.includes('hit');

    if (hitOccurred) {
      monitor.collisionEventsCount++;
      // Record timestamp of collision for frequency analysis
      monitor.recentCollisions.push(now);
    }

    // Prune collision history older than 10 seconds for rolling frequency window
    monitor.recentCollisions = monitor.recentCollisions.filter(t => now - t <= 10.0);

    // Evaluate collision frequency versus current difficulty (TS-0052) — reads the
    // ACTUAL applied difficulty (configure_intensity_scaling_curve.ts +
    // apply_smoothing_functions.ts, order 10/25, already ran earlier this frame),
    // not an independently-tracked value that could disagree with it.
    const currentDifficulty = state.data.globalSpeedMultiplier ?? 1.0;
    const rollingCollisionRate = monitor.recentCollisions.length;

    // If player experiences excessive collisions while difficulty is high, trigger grace period stabilization
    if (rollingCollisionRate >= 3 && currentDifficulty > 1.3 && monitor.gracePeriodTimer <= 0) {
      monitor.performanceWarning = 'STABILIZING DIFFICULTY (HIGH COLLISION FREQUENCY)';
      monitor.intensityControllerPaused = true;
      state.data.intensityControllerPaused = true;
      monitor.gracePeriodTimer = 4.0; // 4 second grace period with minor stabilization
      state.events.push('difficulty_stabilized');
    }

    // Apply a temporary fairness dip ON TOP of the score-based baseline while the grace
    // period is active — this system's genuine value-add (TS-0052), layered instead of
    // replacing configure_intensity_scaling_curve.ts/apply_smoothing_functions.ts's curve.
    if (monitor.intensityControllerPaused) {
      state.data.globalSpeedMultiplier = Math.max(1.0, (state.data.globalSpeedMultiplier ?? 1.0) * 0.85);
    }

    // Survival-duration difficulty escalation (TS-0065): "signal the environment to scale
    // incrementally" per this system's own acceptance criteria — pushed as an event rather
    // than by independently overwriting state.data.globalSpeedMultiplier, since that field
    // is already owned by the score-threshold curve above; a second, uncoordinated writer
    // here previously just clobbered whichever system ran first, every frame (the same
    // class of bug as control.ts's phase-ownership fix).
    const survivalTier = Math.floor(monitor.survivalTime / 30);
    if (survivalTier > monitor.lastSurvivalTierSignaled) {
      monitor.lastSurvivalTierSignaled = survivalTier;
      state.events.push('difficulty_milestone_survived');
    }

    // Expose metrics for other systems and HUD integration
    state.data.performanceMonitor = monitor;
    state.data.currentFps = monitor.currentFps;
    state.data.smoothedFrameTime = monitor.smoothedFrameTime;
    state.data.performanceWarning = monitor.performanceWarning;
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Render nothing for playing phase to avoid duplicating centered status text
  },
};

export default monitorPlayerPerformanceSystem;
