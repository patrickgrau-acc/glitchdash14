// Implements: SPEC-053, SPEC-054, SPEC-055
// Satisfies: TS-001, TS-002
/**
 * Living data model for GlitchDash14 intensity scaling and game mechanics.
 */

export type Phase = 'ready' | 'playing' | 'over';

export interface InputState {
  /** Set of currently held key codes or identifiers */
  keys: Set<string>;
  /** Set of keys pressed in the current tick frame */
  justPressed: Set<string>;
  /** Pointer coordinates and down status */
  pointer: { x: number; y: number; down: boolean };
  /** True on the initial frame a pointer goes down */
  pointerJustDown: boolean;
}

export interface Entity {
  /** Unique identifier for the entity */
  id: string;
  /** Entity category or tag (e.g. 'glitch', 'obstacle', 'particle') */
  kind: string;
  /** X coordinate position in world/canvas space */
  x: number; 
  /** Y coordinate position in world/canvas space */
  y: number; 
  /** Width dimension in pixels */
  w: number; 
  /** Height dimension in pixels */
  h: number;
  /** Horizontal velocity vector */
  vx: number; 
  /** Vertical velocity vector */
  vy: number;
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
  /** Current lifecycle phase of the game session */
  phase: Phase;
  /** Accumulated elapsed session time in seconds */
  t: number;
  /** Current score achieved */
  score: number;
  /** Best personal score achieved */
  best: number;
  /** Canvas viewport width */
  width: number;
  /** Canvas viewport height */
  height: number;
  /** Player entity reference */
  player?: Entity | null;
  /** List of active entities in the game scene */
  entities: Entity[];
  /** Accumulated transient event log or trigger signals */
  events: string[];
  /** Permissive scratchpad for active game systems and tuning parameters. Includes restartTriggered flag for session restart handling. */
  data: Record<string, any>;
  /** Current system controller owning state */
  controller?: string;
}

export interface GameSystem {
  /** Unique system identifier */
  id: string;
  /** Execution order priority */
  order?: number;
  /** Reset callback for system state */
  reset?: (state: GameState) => void;
  /** Update callback per animation frame */
  update?: (state: GameState, input: InputState, dt: number) => void;
  /** Render callback for drawing canvas graphics */
  render?: (ctx: CanvasRenderingContext2D, state: GameState) => void;
}
