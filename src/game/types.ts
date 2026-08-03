// ── src/game/types.ts ──
// Extended living data model for GlitchDash14 intensity scaling mechanics

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

export interface GameState {
  phase: Phase;
  t: number;
  score: number;
  best: number;
  width: number;
  height: number;
  entities: Entity[];
  events: string[];
  /** Permissive scratchpad for active game systems and tuning parameters. */
  data: Record<string, any>;
}

export interface GameSystem {
  id: string;
  order?: number;
  reset?: (state: GameState) => void;
  update?: (state: GameState, input: InputState, dt: number) => void;
  render?: (ctx: CanvasRenderingContext2D, state: GameState) => void;
}