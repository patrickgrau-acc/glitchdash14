/**
 * # Implements: SPEC-0046, SPEC-0061, SPEC-0066
 * # Satisfies: TS-0046, TS-0061, TS-0066
 * 
 * Configure Global Difficulty Constants (j4In3RPtrr9AFrVWNDsI)
 * Manages the foundational difficulty parameters as tunable constants at the top of the codebase
 * and applies them dynamically to game state during reset and update cycles.
 */

import { GameSystem, GameState, InputState } from '../types';

/** Centralized global difficulty constants optimized for balanced endless arcade gameplay. */
export const DIFFICULTY_CONFIG = {
  /** Initial speed of obstacles and background scroll (pixels per second). */
  INITIAL_SPEED: 260,
  /** Minimum horizontal/vertical gap between obstacle entities to ensure dodgeability. */
  MIN_OBSTACLE_GAP: 140,
  /** Rate at which difficulty/speed increments per second of survival. */
  SPEED_INCREMENT_RATE: 12,
  /** Maximum speed cap to preserve player reaction windows and prevent impossible gameplay states. */
  MAX_SPEED_CAP: 750,
  /** Gravity multiplier governing vertical jump/fall arc physics. */
  GRAVITY_MULTIPLIER: 1.00,
};

const configureGlobalDifficultySystem: GameSystem = {
  id: 'configure_global_difficulty',
  order: 5,

  reset(state: GameState): void {
    // Ensure all difficulty tuning parameters and boundaries are active in state.data on session initialization
    state.data.intensity = state.data.intensity || 1.0;
    state.data.globalSpeedMultiplier = state.data.globalSpeedMultiplier || 1.0;
    state.data.obstacleGapFactor = state.data.obstacleGapFactor || 1.0;
    state.data.hardCapReached = false;

    // Attach centralized constants to state.data for dependent mechanics to reference dynamically
    state.data.difficultyConfig = {
      INITIAL_SPEED: DIFFICULTY_CONFIG.INITIAL_SPEED,
      MIN_OBSTACLE_GAP: DIFFICULTY_CONFIG.MIN_OBSTACLE_GAP,
      SPEED_INCREMENT_RATE: DIFFICULTY_CONFIG.SPEED_INCREMENT_RATE,
      MAX_SPEED_CAP: DIFFICULTY_CONFIG.MAX_SPEED_CAP,
      GRAVITY_MULTIPLIER: DIFFICULTY_CONFIG.GRAVITY_MULTIPLIER,
    };
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (state.phase !== 'playing') return;

    // Dynamically scale intensity and speed using centralized constants and guards against impossible states
    const config = state.data.difficultyConfig || DIFFICULTY_CONFIG;
    
    // Ensure boundaries are strictly enforced upon every tick
    const currentSpeed = config.INITIAL_SPEED + (state.t * config.SPEED_INCREMENT_RATE);
    const clampedSpeed = Math.min(currentSpeed, config.MAX_SPEED_CAP);

    state.data.globalSpeedMultiplier = clampedSpeed / config.INITIAL_SPEED;
    state.data.hardCapReached = clampedSpeed >= config.MAX_SPEED_CAP;
    
    // Expose validated gap factor bounded safely above minimum obstacle gap requirements
    state.data.obstacleGapFactor = Math.max(0.8, config.MIN_OBSTACLE_GAP / 140);
  },
};

export default configureGlobalDifficultySystem;