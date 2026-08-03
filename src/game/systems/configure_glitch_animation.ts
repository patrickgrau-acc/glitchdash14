// Implements: QgBGePtbhgj3xRVI1rFh
// Satisfies: TS-0029, TS-0031, TS-0034

import { GameSystem, GameState, InputState } from '../types';

/**
 * Configuration schema for Glitch animation timing, displacement, frequency,
 * and accessibility thresholds to keep visual output within safe contrast and
 * comfort standards while maintaining responsive dash/movement behavior.
 */
export interface GlitchConfigSchema {
  /** Duration of the glitch dash animation in milliseconds */
  duration: number;
  /** Maximum pixel displacement for glitch translation effects */
  displacement: number;
  /** Frequency multiplier for noise/distortion oscillations */
  frequency: number;
  /** Minimum permissible interval between glitch triggers */
  intervalMin: number;
  /** Maximum permissible interval between glitch triggers */
  intervalMax: number;
}

/**
 * Default immutable configuration constants satisfying TS-0029, TS-0031, and TS-0034.
 */
export const GLITCH_CONFIG: GlitchConfigSchema = {
  duration: 300,        // Snappy default dash duration
  displacement: 25,     // Safe visual limit to prevent discomfort (TS-0031)
  frequency: 0.8,       // Balanced frequency
  intervalMin: 100,     // Minimum interval boundary (TS-0034)
  intervalMax: 2000,    // Maximum interval boundary (TS-0034)
};

/**
 * Validates configuration ranges to ensure intervalMin <= intervalMax (TS-0034).
 */
function validateConfig(config: GlitchConfigSchema): GlitchConfigSchema {
  if (config.intervalMin > config.intervalMax) {
    console.warn(
      `[GlitchConfig] Invalid intervals: intervalMin (${config.intervalMin}) > intervalMax (${config.intervalMax}). Correcting automatically.`
    );
    return {
      ...config,
      intervalMax: config.intervalMin,
    };
  }
  return config;
}

const validatedConfig = validateConfig(GLITCH_CONFIG);

/**
 * Configure Glitch Animation system.
 * Initializes glitch configuration constants into state.data and provides
 * live tuning updates, accessibility safeguards, and interval validations.
 */
const configureGlitchAnimationSystem: GameSystem = {
  id: 'configure_glitch_animation',
  order: 5,

  reset(state: GameState) {
    // Attach validated animation configuration into state.data scratchpad for other systems
    state.data.glitchConfig = { ...validatedConfig };
    state.data.glitchActiveTimer = 0;
    state.data.glitchIntensity = 0;
  },

  update(state: GameState, input: InputState, dt: number) {
    // Ensure state.data.glitchConfig is always present
    if (!state.data.glitchConfig) {
      state.data.glitchConfig = { ...validatedConfig };
    }

    const config: GlitchConfigSchema = state.data.glitchConfig;

    // Enforce accessibility limit on displacement (TS-0031)
    if (config.displacement > 500) {
      config.displacement = 500;
    }

    // Process any active glitch timer or input triggers
    if (state.data.glitchActiveTimer > 0) {
      state.data.glitchActiveTimer -= dt * 1000;
      if (state.data.glitchActiveTimer < 0) {
        state.data.glitchActiveTimer = 0;
      }
    }

    // If dash or glitch event is triggered in state.events, initiate timer based on current config duration
    if (state.events.includes('dash') || state.events.includes('glitch')) {
      state.data.glitchActiveTimer = config.duration;
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    // Tuning system delegates visual rendering to player/effects systems via state.data.glitchActiveTimer
  },
};

export default configureGlitchAnimationSystem;