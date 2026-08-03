// Implements: SPEC-050, SPEC-056, SPEC-070
// Satisfies: TS-0050, TS-0056, TS-0070
// Task: game_mechanic_f1_uc1 - Configure Intensity Scaling Curve

import { GameSystem, GameState, InputState } from '../types';

/**
 * ConfigureIntensityScalingCurveSystem
 * 
 * Manages automated intensity scaling based on player score.
 * - Scales the global speed multiplier across score thresholds (TS-0070).
 * - Reduces safe obstacle gap distances as score increases to ramp up challenge (TS-0050).
 * - Enforces a strict Hard Cap to prevent infinite scaling and maintain beatability (TS-0056).
 */
const configureIntensityScalingCurveSystem: GameSystem = {
  id: 'configure_intensity_scaling_curve',
  order: 10,

  reset(state: GameState) {
    state.data.intensity = {
      globalSpeedMultiplier: 1.0,
      obstacleGapFactor: 1.0,
      hardCapReached: false,
      currentThresholdIndex: 0,
    };
  },

  update(state: GameState, _input: InputState, _dt: number) {
    if (state.phase !== 'playing') return;

    if (!state.data.intensity) {
      state.data.intensity = {
        globalSpeedMultiplier: 1.0,
        obstacleGapFactor: 1.0,
        hardCapReached: false,
        currentThresholdIndex: 0,
      };
    }

    const intensity = state.data.intensity;
    const score = state.score || 0;

    // Define difficulty progression curve thresholds
    // Thresholds: [Score, SpeedMultiplier, GapFactor]
    // Hard cap reached at score 5000+
    const thresholds = [
      { score: 0,   speed: 1.0,  gap: 1.0 },
      { score: 500,  speed: 1.15, gap: 0.90 },
      { score: 1200, speed: 1.35, gap: 0.80 },
      { score: 2500, speed: 1.60, gap: 0.70 },
      { score: 4000, speed: 1.85, gap: 0.60 },
      { score: 5000, speed: 2.00, gap: 0.50 }, // Hard Cap peak difficulty
    ];

    // Find highest applicable threshold
    let activeTier = thresholds[0];
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (score >= thresholds[i].score) {
        activeTier = thresholds[i];
        break;
      }
    }

    // Apply speed multiplier & gap scaling
    intensity.globalSpeedMultiplier = activeTier.speed;
    intensity.obstacleGapFactor = activeTier.gap;
    intensity.hardCapReached = score >= 5000;

    // Expose speed multiplier and difficulty factors on state data for the core loop and HUD
    state.data.globalSpeedMultiplier = intensity.globalSpeedMultiplier;
    state.data.obstacleGapFactor = intensity.obstacleGapFactor;
    state.data.hardCapReached = intensity.hardCapReached;
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    // Intensity badge is owned by apply_smoothing_functions.ts, which runs later in
    // system order (25 vs this system's 10) and overwrites this system's own
    // state.data.globalSpeedMultiplier/hardCapReached every frame — so this file's
    // own computed intensity.globalSpeedMultiplier never reflects what's actually
    // applied to gameplay, and its badge would have shown a stale/wrong number.
  },
};

export default configureIntensityScalingCurveSystem;