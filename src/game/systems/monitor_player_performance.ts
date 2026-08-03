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
    } as PerformanceMonitorData;

    // Reset difficulty config and intensity metrics cleanly on restart (TS-0059)
    state.data.intensity = 1.0;
    state.data.globalSpeedMultiplier = 1.0;
    state.data.hardCapReached = false;
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

    // Evaluate collision frequency versus current difficulty (TS-0052)
    const currentIntensity = state.data.intensity || 1.0;
    const rollingCollisionRate = monitor.recentCollisions.length;

    // If player experiences excessive collisions while intensity is high, trigger grace period stabilization
    if (rollingCollisionRate >= 3 && currentIntensity > 1.3 && monitor.gracePeriodTimer <= 0) {
      monitor.performanceWarning = 'STABILIZING DIFFICULTY (HIGH COLLISION FREQUENCY)';
      monitor.intensityControllerPaused = true;
      state.data.intensityControllerPaused = true;
      monitor.gracePeriodTimer = 4.0; // 4 second grace period with minor stabilization

      // Apply temporary stabilization dip to intensity
      state.data.intensity = Math.max(1.0, currentIntensity - 0.25);
      state.data.globalSpeedMultiplier = Math.max(1.0, (state.data.globalSpeedMultiplier || 1.0) - 0.2);
      
      state.events.push('difficulty_stabilized');
    }

    // Progressive difficulty scaling based on survival duration (TS-0065)
    // Every 30 seconds of survival without major distress scales up the intensity factor smoothly
    const targetIntensity = 1.0 + Math.floor(monitor.survivalTime / 30) * 0.25 + (monitor.survivalTime * 0.01);
    const maxCap = 3.5;

    if (!monitor.intensityControllerPaused) {
      const clampedIntensity = Math.min(maxCap, targetIntensity);
      state.data.intensity = clampedIntensity;
      state.data.globalSpeedMultiplier = 1.0 + (clampedIntensity - 1.0) * 0.5;
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
