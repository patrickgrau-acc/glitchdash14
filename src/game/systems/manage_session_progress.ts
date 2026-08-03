/**
 * Implements: SPEC-007, SPEC-008
 * Satisfies: TS-0007 (Verify continuous environment scrolling and scoring), TS-0008 (Verify session behavior upon reaching target session duration)
 * 
 * GameSystem 'manage_session_progress'
 * Phase Owner for 'playing' phase.
 * Manages session duration tracking, continuous environmental scrolling velocity updates,
 * difficulty scaling integration, and target session duration maintenance (90+ seconds threshold).
 */

import { GameSystem, GameState, InputState } from '../types';

interface SessionProgressData {
  elapsedSessionTime: number;
  targetDurationReached: boolean;
  baseEnvironmentSpeed: number;
  currentEnvironmentOffset: number;
  lastUpdateTime: number;
}

const SESSION_TARGET_DURATION = 90.0; // 90 seconds target duration per TS-0008

const manageSessionProgressSystem: GameSystem = {
  id: 'manage_session_progress',
  order: 10,

  reset(state: GameState): void {
    state.data.manageSessionProgress = {
      elapsedSessionTime: 0,
      targetDurationReached: false,
      baseEnvironmentSpeed: 5.0,
      currentEnvironmentOffset: 0,
      lastUpdateTime: state.t,
    } as SessionProgressData;
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (state.phase !== 'playing') {
      return;
    }

    let progressData = state.data.manageSessionProgress as SessionProgressData;
    if (!progressData) {
      progressData = {
        elapsedSessionTime: 0,
        targetDurationReached: false,
        baseEnvironmentSpeed: 5.0,
        currentEnvironmentOffset: 0,
        lastUpdateTime: state.t,
      };
      state.data.manageSessionProgress = progressData;
    }

    // Accumulate elapsed session time during active survival
    progressData.elapsedSessionTime += dt;

    // Check if target session duration (90 seconds) has been reached or exceeded (TS-0008)
    if (progressData.elapsedSessionTime >= SESSION_TARGET_DURATION) {
      if (!progressData.targetDurationReached) {
        progressData.targetDurationReached = true;
        state.events.push('session_target_duration_reached');
      }
    }

    // Maintain continuous environment scrolling velocity and factor in difficulty intensity scaling if present
    const intensityMultiplier = typeof state.data.intensity === 'number' ? state.data.intensity : 1.0;
    const speedMultiplier = typeof state.data.globalSpeedMultiplier === 'number' ? state.data.globalSpeedMultiplier : 1.0;
    
    const effectiveSpeed = progressData.baseEnvironmentSpeed * intensityMultiplier * speedMultiplier;
    progressData.currentEnvironmentOffset = (progressData.currentEnvironmentOffset + effectiveSpeed * dt * 60) % 2000;

    // Expose scrolling offset for visual rendering sync
    state.data.environmentOffset = progressData.currentEnvironmentOffset;
    state.data.sessionDuration = progressData.elapsedSessionTime;
    state.data.targetDurationReached = progressData.targetDurationReached;

    // Push active survival continuous progression event if not already present
    if (!state.events.includes('environment_scrolling')) {
      state.events.push('environment_scrolling');
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    if (state.phase !== 'playing') {
      return;
    }

    const progressData = state.data.manageSessionProgress as SessionProgressData;
    if (!progressData) return;

    // Render subtle decorative background motion lines / data stream to reinforce continuous environment scrolling (TS-0007)
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 15]);
    
    const offset = progressData.currentEnvironmentOffset % 100;
    const horizonY = state.height - 80;

    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(state.width, horizonY);
    ctx.stroke();

    // "Stable state lock" status now lives in the DOM Status & Config panel
    // (GameCanvas.tsx) alongside Intensity, not as floating canvas text.
    ctx.restore();
  },
};

export default manageSessionProgressSystem;