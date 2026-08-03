// ============================================================
//  CONTROL REGISTRY — phase → owner (the Control Model, runtime form).
// ------------------------------------------------------------
//  LOCKED. Regenerated deterministically from the Control Model
//  (core/control_model.py). Do NOT hand-edit — a mechanic changes
//  ownership by being routed to a phase in the model, not by editing
//  this file.
//
//  In every frame the engine gives authoritative control to
//  PHASE_OWNERS[state.phase] (falling back to CORE_ID). That single
//  system may mutate phase/player/entities/score; all others are
//  sandboxed. Ownership transfers when the owner changes state.phase.
//  genre: runner | loop: realtime | derived_by: llm
// ============================================================

export const CORE_ID = "base_player";

/** Phase → the system id that owns authoritative state during it. */
export const PHASE_OWNERS: Record<string, string> = {
  "ready": "base_player",
  "playing": "base_player",
  "over": "base_player"
};
