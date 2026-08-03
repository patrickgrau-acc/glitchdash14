# Game systems integrity audit

Game systems audit: 10 violation(s) (competing_owner×9, undeclared_field×1) across 7 file(s). competing_owner = reassigns state.entities/phase/player/score instead of reading + consuming/emitting events; class_export = `export default class Foo` with no `new Foo()` instance exported — the registry needs an object, not a constructor; undeclared_field = writes to `state.<field>` where <field> isn't declared on GameState (per-mechanic scratch belongs in state.data.<key>). Files: base_player.ts, bypass_death_animation.ts, configure_object_pooling_obstacles.ts, enable_instant_gameplay_restart.ts, manage_engine_state_reset.ts, optimize_collision_detection.ts, start_initial_gameplay_session.ts

## Competing-owner writes
- src/game/systems/base_player.ts:14 `state.player =`
- src/game/systems/optimize_collision_detection.ts:69 `state.entities =`
- src/game/systems/start_initial_gameplay_session.ts:30 `state.phase =`
- src/game/systems/enable_instant_gameplay_restart.ts:58 `state.score =`
- src/game/systems/enable_instant_gameplay_restart.ts:60 `state.entities =`
- src/game/systems/enable_instant_gameplay_restart.ts:61 `state.phase =`
- src/game/systems/configure_object_pooling_obstacles.ts:80 `state.entities =`
- src/game/systems/manage_engine_state_reset.ts:17 `state.score =`
- src/game/systems/manage_engine_state_reset.ts:19 `state.entities =`
- src/game/systems/bypass_death_animation.ts:1 `state.phase =`

The core loop owns state.entities, physics, collision, and win/lose. Mechanics must READ state and emit/consume state.events — not reassign state.entities.
