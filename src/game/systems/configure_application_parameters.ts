/**
 * Implements: SPEC-042, SPEC-043
 * Satisfies: TS-0106 (game parameters configurable without compilation), TS-0110 (visual theme updates via constants)
 * Implements 'Configure Application Parameters for Zero-Dependency Operation' (1uI6rEarUuxjaD9UbbhE).
 * Centralized configuration constants and tuning parameters for zero-dependency operation.
 */

import type { GameSystem, GameState, InputState } from '../types';

/**
 * Centralized application configuration constants for zero-dependency tuning.
 * These constants are directly visible and modifiable at the top of the system file
 * allowing immediate tuning of speed, difficulty, obstacle frequency, and color palette
 * without external build or compilation steps.
 */
export const APP_CONFIG = {
  /** Initial speed of obstacles and course (TS-0106 target) */
  GAME_SPEED: 8.5,
  /** Minimum obstacle gap boundary to prevent impossible states */
  MIN_OBSTACLE_GAP: 120,
  /** Increment rate per second of gameplay for progressive difficulty scaling */
  SPEED_INCREMENT_RATE: 0.15,
  /** Maximum safe speed cap */
  MAX_SPEED_CAP: 25.0,
  /** Global gravity multiplier */
  GRAVITY_MULTIPLIER: 1.0,
  /** Jump force vector strength */
  JUMP_FORCE: -11.0,
  /** Obstacle spawn frequency factor */
  SPAWN_FREQUENCY: 1.0,
};

/**
 * High-contrast arcade aesthetic color constants (TS-0110 target).
 * Update these constants to immediately modify the visual theme of the game elements.
 */
export const THEME_COLORS = {
  /** Player element color (default vibrant cyan/white) */
  PLAYER: '#00F0FF',
  /** Primary obstacle color (default neon magenta) */
  OBSTACLE: '#FF0055',
  /** Secondary accent / particle color */
  ACCENT: '#FFE600',
  /** Grid / course line color */
  GRID: '#1a1a3a',
};

const configureApplicationParametersSystem: GameSystem = {
  id: 'configure_application_parameters',
  order: 1,

  reset(state: GameState): void {
    // Initialize config values into state.data for downstream systems to consume
    state.data.intensity = state.data.intensity || 1.0;
    state.data.globalSpeedMultiplier = APP_CONFIG.GAME_SPEED / 8.5; // baseline scale
    state.data.obstacleGapFactor = APP_CONFIG.MIN_OBSTACLE_GAP;
    state.data.gravityMultiplier = APP_CONFIG.GRAVITY_MULTIPLIER;
    state.data.jumpForce = APP_CONFIG.JUMP_FORCE;
    state.data.themeColors = THEME_COLORS;
    state.data.appConfig = APP_CONFIG;
  },

  update(state: GameState, _input: InputState, _dt: number): void {
    // Ensure configuration remains synchronized in state.data for zero-dependency tuning
    if (!state.data.appConfig) {
      state.data.appConfig = APP_CONFIG;
      state.data.themeColors = THEME_COLORS;
      state.data.globalSpeedMultiplier = APP_CONFIG.GAME_SPEED / 8.5;
    }
  },

  render(_ctx: CanvasRenderingContext2D, _state: GameState): void {
    // Configuration system operates purely as a tuning/constants provider.
    // Visual rendering of themed elements is handled by the core player and obstacle renderers
    // using state.data.themeColors and state.data.appConfig.
  },
};

export default configureApplicationParametersSystem;