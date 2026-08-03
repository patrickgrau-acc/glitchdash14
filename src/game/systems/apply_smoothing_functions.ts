// Implements: SPEC-045, SPEC-053, SPEC-062
// Satisfies: TS-0045, TS-0053, TS-0062

import { GameSystem, GameState, InputState } from '../types';

/**
 * Apply Smoothing Functions to Difficulty Scaling
 * 
 * Satisfies TS-0045, TS-0053, TS-0062 by applying Exponential Moving Average (EMA)
 * smoothing to intensity and speed factors, clamping values to predefined Hard Caps,
 * and ensuring gradual continuous progression without jarring instantaneous jumps.
 */
interface SmoothingState {
  rawIntensity: number;
  smoothedIntensity: number;
  rawSpeedMultiplier: number;
  smoothedSpeedMultiplier: number;
  rawObstacleRate: number;
  smoothedObstacleRate: number;
  hardCapReached: boolean;
  maxHardCap: number;
  smoothingAlpha: number; // EMA factor between 0 and 1
}

const applySmoothingFunctionsSystem: GameSystem = {
  id: 'apply_smoothing_functions',
  order: 25,

  reset(state: GameState): void {
    const initialConfig: SmoothingState = {
      rawIntensity: 1.0,
      smoothedIntensity: 1.0,
      rawSpeedMultiplier: 1.0,
      smoothedSpeedMultiplier: 1.0,
      rawObstacleRate: 1.0,
      smoothedObstacleRate: 1.0,
      hardCapReached: false,
      maxHardCap: 3.5, // Predefined upper bound Hard Cap
      smoothingAlpha: 0.08, // Gradual interpolation factor for fluid transitions
    };

    state.data.smoothingConfig = initialConfig;
    state.data.intensity = 1.0;
    state.data.globalSpeedMultiplier = 1.0;
    state.data.obstacleGapFactor = 1.0;
    state.data.hardCapReached = false;
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (state.phase !== 'playing') {
      return;
    }

    let config = state.data.smoothingConfig as SmoothingState;
    if (!config) {
      this.reset!(state);
      config = state.data.smoothingConfig as SmoothingState;
    }

    // Calculate progression based on game time (t) and score milestones
    // Simulating gradual incremental difficulty scaling over time/score
    const timeProgressionFactor = 1.0 + (state.t * 0.015) + (state.score * 0.02);
    
    config.rawIntensity = Math.min(config.maxHardCap, timeProgressionFactor);
    config.rawSpeedMultiplier = Math.min(3.0, 1.0 + (state.t * 0.008));
    config.rawObstacleRate = Math.min(2.8, 1.0 + (state.t * 0.006));

    // Apply Exponential Moving Average (EMA) smoothing for fluid, jitter-free transitions (TS-0053, TS-0062)
    const alpha = config.smoothingAlpha;
    config.smoothedIntensity += (config.rawIntensity - config.smoothedIntensity) * alpha;
    config.smoothedSpeedMultiplier += (config.rawSpeedMultiplier - config.smoothedSpeedMultiplier) * alpha;
    config.smoothedObstacleRate += (config.rawObstacleRate - config.smoothedObstacleRate) * alpha;

    // Enforce Hard Cap limits to prevent impossible intensity states (TS-0045)
    if (config.smoothedIntensity >= config.maxHardCap) {
      config.smoothedIntensity = config.maxHardCap;
      config.hardCapReached = true;
    } else {
      config.hardCapReached = false;
    }

    // Expose smoothed metrics via state.data for game loop integration and rendering
    state.data.intensity = config.smoothedIntensity;
    state.data.globalSpeedMultiplier = config.smoothedSpeedMultiplier;
    state.data.obstacleGapFactor = Math.max(0.4, 2.0 / config.smoothedObstacleRate);
    state.data.hardCapReached = config.hardCapReached;

    // Optional keyboard tuning / debugging hook (e.g. holding 'KeyM' for max intensity test)
    if (input.keys.has('KeyM')) {
      config.smoothedIntensity = config.maxHardCap;
      config.hardCapReached = true;
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    const config = state.data.smoothingConfig as SmoothingState;
    if (!config || state.phase !== 'playing') return;

    // Draw subtle, non-intrusive HUD indicator for difficulty smoothness and Hard Cap status
    ctx.save();
    ctx.font = '10px Roboto, sans-serif';
    ctx.fillStyle = config.hardCapReached ? 'rgba(239, 68, 68, 0.85)' : 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'right';
    
    const intensityText = `Intensity: ${config.smoothedIntensity.toFixed(2)}${config.hardCapReached ? ' [HARD CAP]' : ''}`;
    ctx.fillText(intensityText, ctx.canvas.width - 16, 36);
    
    ctx.restore();
  }
};

export default applySmoothingFunctionsSystem;