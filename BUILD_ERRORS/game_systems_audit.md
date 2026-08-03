# Game systems integrity audit

Game systems audit: 1 violation(s) (undeclared_field×1) across 1 file(s). competing_owner = reassigns state.entities/phase/player/score instead of reading + consuming/emitting events; class_export = `export default class Foo` with no `new Foo()` instance exported — the registry needs an object, not a constructor; undeclared_field = writes to `state.<field>` where <field> isn't declared on GameState (per-mechanic scratch belongs in state.data.<key>). Files: base_player.ts

## Competing-owner writes
- src/game/systems/base_player.ts:14 `state.player =`

The core loop owns state.entities, physics, collision, and win/lose. Mechanics must READ state and emit/consume state.events — not reassign state.entities.
