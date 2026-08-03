// Implements: SPEC-045, SPEC-053, SPEC-062
// Satisfies: TS-0045, TS-0053, TS-0062

import { GameSystem, GameState, InputState } from '../types';
import { INTENSITY_THRESHOLDS } from './configure_intensity_scaling_curve';

/**
 * Apply Smoothing Functions to Difficulty Scaling
 *
 * Satisfies TS-0045, TS-0053, TS-0062 by applying Exponential Moving Average (EMA)
 * smoothing to configure_intensity_scaling_curve.ts's score-threshold curve (order 10,
 * runs first), so its step changes between tiers feel gradual instead of instantaneous.
 * This system does not compute its own difficulty curve — it smooths the one owned by
 * that sibling system and shares its Hard Cap (the curve's last threshold entry), rather
 * than enforcing an independent, uncoordinated upper bound on the same state.data fields.
 */
const HARD_CAP = INTENSITY_THRESHOLDS[INTENSITY_THRESHOLDS.length - 1];

interface SmoothingState {
  smoothedSpeedMultiplier: number;
  smoothedObstacleGapFactor: number;
  smoothingAlpha: number; // EMA factor between 0 and 1
}

const applySmoothingFunctionsSystem: GameSystem = {
  id: 'apply_smoothing_functions',
  order: 25,

  reset(state: GameState): void {
    const initialConfig: SmoothingState = {
      smoothedSpeedMultiplier: 1.0,
      smoothedObstacleGapFactor: 1.0,
      smoothingAlpha: 0.08, // Gradual interpolation factor for fluid tier transitions
    };

    state.data.smoothingConfig = initialConfig;
    state.data.globalSpeedMultiplier = 1.0;
    state.data.obstacleGapFactor = 1.0;
    state.data.hardCapReached = false;
  },

  update(state: GameState, input: InputState, _dt: number): void {
    if (state.phase !== 'playing') {
      return;
    }

    let config = state.data.smoothingConfig as SmoothingState;
    if (!config) {
      this.reset!(state);
      config = state.data.smoothingConfig as SmoothingState;
    }

    // Target values are configure_intensity_scaling_curve.ts's raw threshold-based curve.
    // Deliberately NOT state.data.intensity — that key is a plain-number convention
    // used by several other systems; reusing it here silently discarded these values.
    const intensity = state.data.intensityCurve as
      { globalSpeedMultiplier: number; obstacleGapFactor: number; hardCapReached: boolean } | undefined;
    const targetSpeed = intensity?.globalSpeedMultiplier ?? 1.0;
    const targetGap = intensity?.obstacleGapFactor ?? 1.0;

    // Apply Exponential Moving Average (EMA) smoothing for fluid, jitter-free transitions (TS-0053, TS-0062)
    const alpha = config.smoothingAlpha;
    config.smoothedSpeedMultiplier += (targetSpeed - config.smoothedSpeedMultiplier) * alpha;
    config.smoothedObstacleGapFactor += (targetGap - config.smoothedObstacleGapFactor) * alpha;

    // Enforce the shared Hard Cap to prevent impossible intensity states (TS-0045)
    config.smoothedSpeedMultiplier = Math.min(config.smoothedSpeedMultiplier, HARD_CAP.speed);
    config.smoothedObstacleGapFactor = Math.max(config.smoothedObstacleGapFactor, HARD_CAP.gap);

    // Debug-only calibration hook — was bound to 'KeyM' (collided with audio mute,
    // and let any player force max difficulty just by holding the mute key).
    // Snaps straight to the curve's Hard Cap for instant calibration/testing.
    if (state.data.debug?.enabled && input.keys.has('Backquote')) {
      config.smoothedSpeedMultiplier = HARD_CAP.speed;
      config.smoothedObstacleGapFactor = HARD_CAP.gap;
    }

    // Expose smoothed metrics via state.data for game loop integration and rendering
    state.data.globalSpeedMultiplier = config.smoothedSpeedMultiplier;
    state.data.obstacleGapFactor = config.smoothedObstacleGapFactor;
    state.data.hardCapReached = intensity?.hardCapReached ?? false;
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Intensity/Hard-Cap readout now lives in the DOM status panel (GameCanvas.tsx).
  }
};

export default applySmoothingFunctionsSystem;