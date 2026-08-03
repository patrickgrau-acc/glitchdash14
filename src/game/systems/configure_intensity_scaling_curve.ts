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

// Difficulty progression curve thresholds — [Score, SpeedMultiplier, GapFactor].
// Exported so apply_smoothing_functions.ts (TS-0045/0053/0062) can smooth transitions
// between these steps and share the same Hard Cap (last entry) instead of inventing one.
export const INTENSITY_THRESHOLDS = [
  { score: 0,   speed: 1.0,  gap: 1.0 },
  { score: 500,  speed: 1.15, gap: 0.90 },
  { score: 1200, speed: 1.35, gap: 0.80 },
  { score: 2500, speed: 1.60, gap: 0.70 },
  { score: 4000, speed: 1.85, gap: 0.60 },
  { score: 5000, speed: 2.00, gap: 0.50 }, // Hard Cap peak difficulty
];

const configureIntensityScalingCurveSystem: GameSystem = {
  id: 'configure_intensity_scaling_curve',
  order: 10,

  reset(state: GameState) {
    // Namespaced as `intensityCurve`, NOT `intensity` — that key is a plain-number
    // convention shared by ~6 other systems (configure_application_parameters,
    // configure_global_difficulty, configure_game_balance_constants,
    // monitor_performance_for_fairness, monitor_player_performance,
    // manage_session_progress). monitor_player_performance's reset() (order 35,
    // runs after this one) was overwriting state.data.intensity with a plain
    // number, so this system's own `intensity.globalSpeedMultiplier = ...` write
    // below threw a TypeError (assigning a property to a primitive, strict mode)
    // every frame — caught and silently swallowed by engine.ts's per-system
    // try/catch, so this curve never actually applied to gameplay.
    state.data.intensityCurve = {
      globalSpeedMultiplier: 1.0,
      obstacleGapFactor: 1.0,
      hardCapReached: false,
      currentThresholdIndex: 0,
    };
  },

  update(state: GameState, _input: InputState, _dt: number) {
    if (state.phase !== 'playing') return;

    if (!state.data.intensityCurve) {
      state.data.intensityCurve = {
        globalSpeedMultiplier: 1.0,
        obstacleGapFactor: 1.0,
        hardCapReached: false,
        currentThresholdIndex: 0,
      };
    }

    const intensity = state.data.intensityCurve;
    const score = state.score || 0;

    // Find highest applicable threshold
    let activeTier = INTENSITY_THRESHOLDS[0];
    for (let i = INTENSITY_THRESHOLDS.length - 1; i >= 0; i--) {
      if (score >= INTENSITY_THRESHOLDS[i].score) {
        activeTier = INTENSITY_THRESHOLDS[i];
        break;
      }
    }

    // Apply speed multiplier & gap scaling
    intensity.globalSpeedMultiplier = activeTier.speed;
    intensity.obstacleGapFactor = activeTier.gap;
    intensity.hardCapReached = score >= 5000;

    // Raw target values live on state.data.intensityCurve only — apply_smoothing_functions.ts
    // (order 25) reads them from there and is the sole writer of the applied
    // state.data.globalSpeedMultiplier/obstacleGapFactor/hardCapReached the core loop reads.
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    // Intensity badge is owned by apply_smoothing_functions.ts, which smooths and applies
    // this system's raw threshold values — see note in update() above.
  },
};

export default configureIntensityScalingCurveSystem;