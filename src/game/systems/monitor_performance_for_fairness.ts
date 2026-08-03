/**
 * Implements: TS-0054, TS-0063, TS-0068
 * Satisfies: Monitor Performance for Fairness (3iwTRYdCbcNujWtetjUl)
 * 
 * Game system responsible for tracking frame times (dt), detecting performance
 * instability on low-end hardware (Chromebooks), automatically throttling intensity
 * scaling factors to maintain 60 FPS, enforcing a mandatory stability lockout period
 * before scaling up again, and pausing intensity escalation during imminent collisions.
 */

import type { GameSystem, GameState, InputState } from '../types';

interface PerformanceMonitorData {
  fps: number;
  smoothedFrameTime: number;
  warningActive: boolean;
  warningTimer: number;
  lockoutTimer: number;
  throttleCount: number;
  lastThrottleTime: number;
}

const monitor_performance_for_fairness: GameSystem = {
  id: 'monitor_performance_for_fairness',
  order: 15,

  reset(state: GameState): void {
    state.data.performanceMonitor = {
      fps: 60,
      smoothedFrameTime: 16.67,
      warningActive: false,
      warningTimer: 0,
      lockoutTimer: 0,
      throttleCount: 0,
      lastThrottleTime: 0,
    } as PerformanceMonitorData;

    // Initialize baseline intensity scaling factors if not already present
    if (typeof state.data.globalSpeedMultiplier !== 'number') {
      state.data.globalSpeedMultiplier = 1.0;
    }
    if (typeof state.data.intensity !== 'number') {
      state.data.intensity = 1.0;
    }
    if (typeof state.data.obstacleGapFactor !== 'number') {
      state.data.obstacleGapFactor = 1.0;
    }
    state.data.hardCapReached = false;
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (state.phase !== 'playing') return;

    let perf = state.data.performanceMonitor as PerformanceMonitorData;
    if (!perf) {
      this.reset!(state);
      perf = state.data.performanceMonitor as PerformanceMonitorData;
    }

    // Convert dt (seconds) to milliseconds
    const frameTimeMs = Math.max(1, dt * 1000);
    
    // Smooth frame time (exponential moving average)
    perf.smoothedFrameTime = perf.smoothedFrameTime * 0.85 + frameTimeMs * 0.15;
    perf.fps = Math.round(1000 / Math.max(1, perf.smoothedFrameTime));

    // Expose performance metrics in state.data for UI/other systems
    state.data.currentFps = perf.fps;
    state.data.smoothedFrameTime = perf.smoothedFrameTime;
    state.data.performanceWarning = perf.warningActive;

    // Check for imminent collision in state.events or nearby entities (TS-0068)
    const imminentCollision = state.events.includes('near_miss') || state.events.includes('collision_warning');

    // Threshold for performance warning: 15ms (16.67ms * 0.9)
    const FRAME_TIME_THRESHOLD = 15.0;

    // Decrement timers
    if (perf.warningTimer > 0) {
      perf.warningTimer -= dt;
      if (perf.warningTimer <= 0) {
        perf.warningActive = false;
      }
    }

    if (perf.lockoutTimer > 0) {
      perf.lockoutTimer -= dt;
    }

    // TS-0068: Validate intensity controller pause during imminent collision under lag
    if (imminentCollision && perf.smoothedFrameTime > 12.0) {
      // Pause or compensate intensity escalation during tight collision windows under lag
      state.data.intensityControllerPaused = true;
      state.events.push('intensity_paused_fairness');
    } else {
      state.data.intensityControllerPaused = false;
    }

    // TS-0054: Automatic intensity throttling when frame time exceeds safety threshold
    if (perf.smoothedFrameTime > FRAME_TIME_THRESHOLD) {
      perf.warningActive = true;
      perf.warningTimer = 2.0; // Show warning for 2 seconds
      perf.throttleCount++;
      perf.lastThrottleTime = state.t;
      
      // Enforce mandatory lockout period (TS-0063) - 5 seconds of stabilization required
      perf.lockoutTimer = 5.0;

      // Throttle intensity parameters smoothly
      state.data.globalSpeedMultiplier = Math.max(0.6, (state.data.globalSpeedMultiplier || 1.0) * 0.92);
      state.data.intensity = Math.max(0.5, (state.data.intensity || 1.0) * 0.90);
      state.data.obstacleGapFactor = Math.min(1.5, (state.data.obstacleGapFactor || 1.0) * 1.10);
      
      state.events.push('performance_throttle_triggered');
    } else if (perf.lockoutTimer <= 0 && !state.data.intensityControllerPaused) {
      // TS-0063: Enforce mandatory lockout period after throttle trigger before scaling up
      // Allow gradual escalation if performance is stable and lockout has expired
      if (perf.smoothedFrameTime < 13.0 && (state.data.globalSpeedMultiplier || 1.0) < 2.0) {
        state.data.globalSpeedMultiplier = Math.min(2.0, (state.data.globalSpeedMultiplier || 1.0) + 0.02 * dt);
        state.data.intensity = Math.min(2.5, (state.data.intensity || 1.0) + 0.03 * dt);
      }
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    if (state.phase !== 'playing') return;

    const perf = state.data.performanceMonitor as PerformanceMonitorData;
    if (!perf) return;

    ctx.save();
    
    // Draw discreet, high-performance monitoring hud top-right
    const x = state.width - 140;
    const y = 16;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.roundRect ? ctx.roundRect(x, y, 126, 42, 6) : ctx.rect(x, y, 126, 42);
    ctx.fill();

    ctx.font = '10px Roboto, monospace';
    ctx.fillStyle = perf.fps < 50 ? '#f87171' : perf.fps < 58 ? '#fbbf24' : '#34d399';
    ctx.fillText(`FPS: ${perf.fps} (${perf.smoothedFrameTime.toFixed(1)}ms)`, x + 10, y + 18);

    ctx.fillStyle = '#94a3b8';
    const throttleStatus = perf.lockoutTimer > 0 ? `LOCKOUT (${Math.ceil(perf.lockoutTimer)}s)` : 'STABLE';
    ctx.fillText(`GOVERNOR: ${throttleStatus}`, x + 10, y + 32);

    // If performance warning is active, render a non-obtrusive fair play indicator banner
    if (perf.warningActive) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.fillRect(state.width / 2 - 140, 50, 280, 26);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ HARDWARE THROTTLE: FAIRNESS GOVERNOR ACTIVE', state.width / 2, 67);
      ctx.textAlign = 'left';
    }

    ctx.restore();
  },
};

export default monitor_performance_for_fairness;