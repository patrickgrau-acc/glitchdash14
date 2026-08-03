// ============================================================
//  LIVING DATA MODEL — the shared contract every mechanic uses.
// ------------------------------------------------------------
//  This file is scaffold-seeded but MECHANIC-EXTENDABLE. A new
//  mechanic MAY add fields/interfaces here — additively, and with a
//  /** doc comment */ on every addition saying WHAT it holds and WHY.
//  Those docs are injected into later mechanics' context, so the
//  whole crew builds against one growing, documented vocabulary.
//  You must NEVER remove, rename, or narrow GameState / InputState /
//  GameSystem / Entity — other mechanics depend on those exact shapes.
//
//  GENRE-NEUTRAL BY DESIGN. This shell does not assume a runner, a
//  shooter, or anything else. What is IN the game — the entity kinds,
//  the physics, the win/lose rules, and what each key/pointer MEANS —
//  comes from the use cases via the stamped core loop (base_player.ts)
//  and the mechanic systems. Input here is RAW (keys + pointer); a
//  mechanic INTERPRETS it (Space = jump, or fire, or launch...).
//
//  OWNERSHIP IS PER-PHASE. For each phase, exactly ONE system owns the
//  authoritative state (phase transitions, the entity population,
//  scoring). By default that is the core loop (base_player.ts) for every
//  phase, but a game with distinct modes (a boss phase, a cutscene, a
//  turn hand-off) may hand a phase to a dedicated controller — see
//  src/game/control.ts (the phase→owner registry, stamped from the
//  Control Model). The engine publishes the current owner as
//  `state.controller` each frame; a system checks `state.controller ===
//  <its id>` to know if it holds the loop right now. Ownership transfers
//  automatically when the owner transitions `state.phase` — that is the
//  sanctioned hand-off. Every non-owner READS state and CONSUMES/EMITS
//  events; if it reassigns phase/player/entities/score the engine
//  reverts it. Do not run a second loop.
// ============================================================
// Phase names are DATA declared by the Control Model (control.ts). This
// union is generated from it; 'ready' | 'playing' | 'over' are always
// present, and a game with distinct modes adds its own (e.g. 'boss').
export type Phase = 'ready' | 'playing' | 'over';

export interface InputState {
  /** Raw key codes currently held (e.g. 'Space', 'ArrowUp', 'KeyM').
   *  Read with keys.has(code) — a Set is NOT indexable (keys['x'] errors). */
  keys: Set<string>;
  /** Key codes that transitioned to DOWN this frame (edge-triggered).
   *  Use for fire/launch/one-shot actions: justPressed.has('Space'). */
  justPressed: Set<string>;
  /** Pointer position in canvas coordinates + whether it is held. */
  pointer: { x: number; y: number; down: boolean };
  /** True only on the frame the pointer was pressed (edge-triggered). */
  pointerJustDown: boolean;
}

export interface Entity {
  id: string;
  /** Genre-specific tag: 'player'|'obstacle'|'asteroid'|'city'|... The
   *  core loop and mechanics branch on this. Genre packs document the
   *  kinds they use (see the genre extension appended below). */
  kind: string;
  x: number; y: number; w: number; h: number;
  vx: number; vy: number;
  [key: string]: any;   // per-entity scratch (angle, r, life, alive, ...)
}

export interface GameState {
  phase: Phase;
  t: number;            // elapsed seconds this run
  score: number;
  best: number;
  width: number;
  height: number;
  /** The controllable avatar, or null for genres with none (e.g. a
   *  Missile-Command-style defender aims a pointer, it has no avatar). */
  player: Entity | null;
  /** The primary entity population, OWNED by the core loop. Mechanics
   *  read/inspect it and may push transient juice, but must not reassign it. */
  entities: Entity[];
  /** Per-mechanic scratch space. Store YOUR state under a unique key
   *  (e.g. state.data.audio = {...}). Permissive by design so a
   *  mechanic never needs a type change just to hold local state. */
  data: Record<string, any>;
  /** One-frame event tags the core loop emits and mechanics consume.
   *  The vocabulary is genre-defined by the core loop — e.g. a runner
   *  emits 'jump'|'score'|'hit'|'over', a shooter adds 'fire'|'thrust',
   *  a defender adds 'launch'|'intercept'. Cleared at the top of every
   *  frame by engine.step(). Read it to react (sound, particles) instead
   *  of re-detecting state. The core loop documents its event vocabulary. */
  events: string[];
  /** The id of the system that OWNS authoritative state this frame,
   *  published by engine.step() from the phase→owner registry in
   *  control.ts. Read it (state.controller === '<my id>') to know if
   *  you currently hold the loop. Do NOT set it — the engine owns it. */
  controller?: string;
}

export interface GameSystem {
  id: string;
  order?: number;              // lower runs first (default 100)
  reset?(state: GameState): void;                                   // on (re)start
  update?(state: GameState, input: InputState, dt: number): void;   // per frame
  render?(ctx: CanvasRenderingContext2D, state: GameState): void;   // per frame
}


// ── GENRE PACK: runner ──────────────────────────────────
// Side-scrolling runner: player jumps, obstacles scroll left.
// These are ADDITIVE, documented extensions to the living data model.
// A mechanic may add more (with a /** why */) — never remove these.
/** Runner entity kinds carried in state.entities. */
export type RunnerEntityKind = 'player' | 'obstacle';
