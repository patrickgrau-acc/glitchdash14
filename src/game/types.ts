/**
 * ── src/game/types.ts ──
 * Extended living data model for GlitchDash14 intensity scaling mechanics
 * Includes difficulty configuration tracking for centralized constant enforcement
 * and self-contained deployment configuration support.
 */

export type Phase = 'ready' | 'playing' | 'over';

export interface InputState {
  keys: Set<string>;
  justPressed: Set<string>;
  pointer: { x: number; y: number; down: boolean };
  pointerJustDown: boolean;
}

export interface Entity {
  id: string;
  kind: string;
  x: number; y: number; w: number; h: number;
  vx: number; vy: number;
  [key: string]: any;
}

export interface DifficultyConfigSchema {
  /** Initial speed of obstacles and course */
  INITIAL_SPEED: number;
  /** Minimum obstacle gap boundary to prevent impossible states */
  MIN_OBSTACLE_GAP: number;
  /** Increment rate per second of gameplay */
  SPEED_INCREMENT_RATE: number;
  /** Maximum safe speed cap */
  MAX_SPEED_CAP: number;
  /** Global gravity multiplier */
  GRAVITY_MULTIPLIER: number;
  /** Jump force vector strength */
  JUMP_FORCE?: number;
}

export interface GameState {
  phase: Phase;
  t: number;
  score: number;
  best: number;
  width: number;
  height: number;
  entities: Entity[];
  events: string[];
  /** Permissive scratchpad for active game systems and tuning parameters. Includes highScoreRetrieved flag for local high score mechanics. */
  data: Record<string, any>;
}

export interface GameSystem {
  id: string;
  order?: number;
  reset?: (state: GameState) => void;
  update?: (state: GameState, input: InputState, dt: number) => void;
  render?: (ctx: CanvasRenderingContext2D, state: GameState) => void;
}