// Framework-agnostic engine: owns state + drives all registered systems.
// A mechanic error is caught per-system so one bad mechanic can never
// kill the whole loop (Worf's rule).
//
// OWNERSHIP ENFORCEMENT (structural, per-phase): in every frame exactly
// ONE system — the OWNER of the current phase — may mutate the
// authoritative game state (phase, player identity, the entities array
// identity, score, and controller). The owner is resolved from the
// phase→owner registry in control.ts (default: the core loop base_player
// owns every phase). Ownership transfers automatically when the owner
// transitions state.phase — a boss controller can own the 'boss' phase
// without being a rival during 'playing'. Every OTHER system is sandboxed:
// it may read state, keep its own state under state.data.<key>, push
// transient entities + events, mutate the PROPERTIES of the existing
// player/entities, and render — but any attempt to REASSIGN
// phase/player/entities/score/controller is reverted after it runs. This
// makes the design contract impossible to violate, so a generated
// mechanic can never hijack or fight the loop (the GlitchDash failure).
import type { GameState, InputState } from './types';
import { systems } from './systems';
import { PHASE_OWNERS, CORE_ID } from './control';

// Resolve the system that owns authoritative state for the current phase:
//  1. the phase→owner registry (the Control Model), when that owner is a
//     registered system; else
//  2. the core loop (base_player), when present; else
//  3. the first registered system (never leaves the loop unowned).
function resolveOwner(state: GameState): string {
  const byPhase = PHASE_OWNERS[state.phase];
  if (byPhase && systems.some((s) => s.id === byPhase)) return byPhase;
  if (systems.some((s) => s.id === CORE_ID)) return CORE_ID;
  return systems[0]?.id ?? CORE_ID;
}

export function createInitialState(width: number, height: number, best = 0): GameState {
  const state: GameState = {
    phase: 'ready', t: 0, score: 0, best, width, height,
    player: null,   // the core loop's reset() populates this (or leaves it null)
    entities: [], data: {}, events: [],
  };
  resetSystems(state);
  return state;
}

export function resetSystems(state: GameState): void {
  for (const s of systems) { try { s.reset && s.reset(state); } catch (e) { /* ignore */ } }
}

export function startRun(state: GameState): void {
  state.t = 0; state.score = 0; state.entities = []; state.events = [];
  state.data = {};
  resetSystems(state);
  state.phase = 'playing';
}

export function step(state: GameState, input: InputState, dt: number): void {
  state.events = [];
  if (state.phase === 'playing') state.t += dt;
  const owner = resolveOwner(state);
  state.controller = owner;   // publish the current owner for systems to read
  for (const s of systems) {
    if (!s.update) continue;
    if (s.id === owner) {
      // The phase owner may freely mutate phase, player, entities, score.
      // When it transitions state.phase, ownership re-resolves next frame.
      try { s.update(state, input, dt); } catch (e) { /* owner error must not kill the loop */ }
      continue;
    }
    // Sandbox every non-owner: snapshot the owned fields, run it, then
    // revert any REASSIGNMENT. Pushes into the same entities array and
    // property mutations of the existing player survive; hijacking the
    // loop (phase flips, rival player/entities, score resets) does not.
    const _phase = state.phase, _player = state.player, _entities = state.entities, _score = state.score;
    const _ctrl: string | undefined = state.controller;
    try { s.update(state, input, dt); } catch (e) { /* mechanic error must not kill the loop */ }
    if (state.phase !== _phase) state.phase = _phase;
    if (state.player !== _player) state.player = _player;
    if (state.entities !== _entities) state.entities = _entities;
    if (state.score !== _score) state.score = _score;
    if (state.controller !== _ctrl) state.controller = _ctrl;
  }
}

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  // Clear every frame BEFORE any system draws — without this, each
  // frame composites on top of the last and anything that moves
  // (player, obstacles, particles) leaves a permanent trail
  // ('ghosting'). A genre pack's own background fill (if any) simply
  // paints over this immediately after — harmless, never doubles up
  // visibly, since both happen before any other system's render().
  ctx.clearRect(0, 0, state.width, state.height);
  for (const s of systems) {
    if (s.render) { try { s.render(ctx, state); } catch (e) { /* ignore */ } }
  }
}
