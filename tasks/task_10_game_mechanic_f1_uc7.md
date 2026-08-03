# Task 10: Monitor Player Performance for Difficulty Scaling (cmXcKUn2l8cdksz5zgDe)

## Functional Scope Addressed

TASK: game_mechanic_f1_uc7
UC: Monitor Player Performance for Difficulty Scaling (cmXcKUn2l8cdksz5zgDe)
FEATURE: Manage game state including real-time difficulty scaling, collision detection, and score tracking. | EPIC: Dynamic Difficulty Scaling Engine

OUTPUT CONTRACT:
• Create ONE new file src/game/systems/monitor_player_performance.ts — `export default` a GameSystem `{{ id, order?, reset?, update?(state,input,dt), render?(ctx,state) }}`.
• The GameSystem `id` MUST be exactly 'monitor_player_performance' (matches this file's name). The control registry keys phase ownership on this id — a different id breaks ownership resolution.
• Store per-mechanic state in `state.data.<key>` (permissive Record — no type edit needed). Need a shared, typed field? Add it ADDITIVELY to src/game/types.ts with a /** why */ doc comment (living data model).
• React to gameplay by CONSUMING `state.events` (vocabulary is genre-specific — read base_player.ts) and reading state; keep any effect state in `state.data.<key>` and draw it in render().
• Read keys with `input.keys.has('KeyM')` — a Set is not indexable (`input.keys['KeyM']` is TS7053). Use .has()/.add()/.delete().
• LOCKED — do NOT write engine.ts, GameCanvas.tsx, systems/index.ts, base_player.ts, storage.ts, or the '/' mount. Do NOT assign state.obstacles/state.entities. NO page, NO Form, NO fetch, NO backend.

SCOPE: Implement 'Monitor Player Performance for Difficulty Scaling' as ONE game system that plugs into the existing loop.
INTENT: Identify and track player survival metrics in real-time to determine when to adjust the intensity of the game environment.
ACCEPTANCE: Given the game is in an active session, when the player survives for a set duration, then the engine must update the internal difficulty score.
Given the game is running, when the player completes a segment of the course, then the system must monitor collision frequency to detect if the difficulty is too high.
Given the performance metrics are captured, when the difficulty score passes a predefined threshold, then the system must signal the environment to scale incrementally.

MECHANIC ROLE: CORE-AUGMENT (real gameplay). You may add a genuinely new
gameplay behavior (a new input, a dodge/dash, a new hazard reaction).
Even so, base_player owns the run loop, the obstacle list, collision,
and particles: READ state and player, emit/consume state.events, keep
your state in state.data.<key>, and add any shared field to types.ts
(documented). Do NOT assign state.obstacles/state.entities or rewrite
the loop — extend it through the event channel.
NO PRIVATE PARALLEL ENTITIES: if your mechanic needs obstacle- or
hazard-like entities, they MUST be pushed into the real, shared
state.entities array — that is the only array base_player's collision
loop actually checks. A private array of obstacle-shaped objects
under state.data.<key> is still a rival system even though it never
reassigns state.entities directly: it looks hazardous to the player
but has no collision consequence, which is worse than not building it.
If your acceptance criteria reads as a session start/restart/end
transition, see SESSION LIFECYCLE OWNERSHIP above — implement
reset(state), don't reassign state.phase/entities/score yourself.
RENDER OWNERSHIP: before adding a render(), check the UI SURFACE
OWNERSHIP section above and the MECHANIC SCOPE GUARD block (if
injected) — expose data instead of drawing a second copy of an
already-claimed surface.

GAME SYSTEM CONTRACT — this app is an interactive game, not a CRUD form app.
The deterministic shell already scaffolded — and OWNS — the engine, the
render loop, and the core gameplay. These files are IMMUTABLE to you:
  src/game/types.ts       — GameState, InputState, GameSystem (LIVING — you MAY extend, see below)
  src/game/engine.ts      — createInitialState() + step(state, input, dt)   [LOCKED]
  src/game/control.ts     — CORE_ID + PHASE_OWNERS phase-ownership registry  [LOCKED]
  src/game/GameCanvas.tsx — <canvas> host + requestAnimationFrame loop + input + HUD  [LOCKED]
  src/game/systems/index.ts — the auto-generated registry  [LOCKED — never edit]
  src/game/systems/base_player.ts — the CORE RUN LOOP  [LOCKED]
  src/lib/storage.ts      — localStorage helpers (high score, settings)  [LOCKED]
IMPORTANT: 'control.ts' is reserved for the phase-ownership registry ONLY.
If your use case is about input handling (keyboard/pointer controls), do NOT
name your file 'control.ts' — that collides with the locked file above and
will be REFUSED at write time. Name it for what it does instead, e.g.
'src/game/systems/handle_input_controls.ts'.

GENRE COMES FROM THE USE CASES. The core loop stamped in base_player.ts
matches THIS game's genre (runner, shooter, defender, ...). Read it first —
it documents this genre's entity kinds (in `state.entities`), physics, and
the event tags it emits. Do NOT assume a runner.

OWNERSHIP — base_player is the single owner of the loop. For this genre it
already owns: the primary entity population in `state.entities`, the physics,
collision, the win/lose transition, and scoring — and it announces each
moment by pushing a tag into `state.events` every frame (the exact vocabulary
is documented in base_player.ts, e.g. a runner emits 'jump'|'score'|'hit'|
'over'; a shooter adds 'fire'|'thrust'; a defender adds 'launch'|'intercept').
  DO NOT reimplement the loop. DO NOT reassign `state.entities` (reading it
  is fine, owning it is not) or run a second loop. Rival loops are exactly
  why a past game's mechanics cancelled each other out instead of composing.

HOW TO IMPLEMENT THIS USE CASE — add ONE new system file
`src/game/systems/<slug>.ts` that `export default`s a GameSystem
`{ id, order?, reset?, update?(state,input,dt), render?(ctx,state) }`. It is
auto-registered — do NOT edit the registry. No form, no page, no API. To
REACT to gameplay, consume `state.events` (e.g. play a sound when
`state.events.includes('hit')`) and READ state; to ADD an effect, keep its
particles/timers in `state.data.<yourKey>` and integrate + draw them yourself
in update()/render(). The observable, per-frame behavior IS the deliverable.

EXPORT SHAPE — export an OBJECT, never a bare class. The registry's runtime
filter checks `typeof s === 'object'` on your default export. A class's
default export is the CONSTRUCTOR, whose `typeof` is `'function'` — it fails
the check and your system silently never registers and never runs, even
though it type-checks and even though instances of the class would have
every property the GameSystem shape requires. This is not cosmetic — it is
the difference between shipping the mechanic and shipping nothing.
  CORRECT (plain object literal — the pattern base_player.ts uses):
    const system: GameSystem = {
      id: '<slug>', order: 50,
      update(state, input, dt) { /* ... */ },
      render(ctx, state) { /* ... */ },
    };
    export default system;
  CORRECT (class, but export an INSTANCE, not the class itself):
    class MySystem implements GameSystem {
      id = '<slug>';
      update(state, input, dt) { /* ... */ }
    }
    export default new MySystem();
  WRONG (exports the constructor — registers as nothing, runs never):
    export default class MySystem implements GameSystem { ... }
If you reach for a class at all, the object literal is simpler and has no
way to make this mistake — prefer it unless you have a specific reason not to.

LIVING TYPE CONTRACT — state you can grow, with through-context:
  • Per-mechanic scratch goes in `state.data.<yourKey>` — `data` is a
    permissive Record, so it needs NO type change. Example:
    `state.data.audio = state.data.audio || { muted: false };`
  • Need a first-class, typed, shared field (or a new entity kind)? ADD it to
    src/game/types.ts in THIS task, additively, WITH a doc comment (/** ... */
    above, or // inline) saying what it holds and WHY. That comment is
    injected into every later mechanic's context — it is the game's living
    data-model documentation, so a new mechanic can add exactly what it needs
    to sing and the whole crew sees it.
  • You may EXTEND types.ts but NEVER remove, rename, or narrow GameState /
    InputState / GameSystem / Entity — other mechanics depend on those shapes.

INPUT CONTRACT — input is RAW; YOU interpret it for this genre:
  • `input.keys` / `input.justPressed` are `Set<string>` of key codes (held /
    went-down-this-frame). Read with `.has('Space')` — a Set is NOT indexable
    (`input.keys['Space']` is TS7053). Use `justPressed` for one-shot actions
    (fire, launch, jump), `keys` for held actions (thrust, move).
  • `input.pointer` is `{ x, y, down }` in canvas coords; `input.pointerJustDown`
    is the press edge. Use them for aim/launch/tap.
  • The scaffold populates all of the above — just READ them; never rewrite
    the canvas or the loop to wire up input.

UI SURFACE OWNERSHIP — GameCanvas.tsx already renders, for every build,
every genre (this is scaffold vocabulary, not this game's genre — it is
identical regardless of what you're building): the SCORE/BEST header,
the Ready?/GAME OVER status line, the START/RETRY button, and the input
hint. NEVER render a second copy of any of these — any wording, any
position, any phase. A past build shipped 8 independently-built systems
each drawing their own 'press space to start' prompt on top of this
same DOM chrome; none of them were wrong about their OWN acceptance
criteria, they just didn't know the screen was already spoken for.
  If your acceptance criteria says "the UI shows X" and X is one of the
  surfaces above: your job is to COMPUTE X and expose it via
  `state.data.<key>`/`state.events` — not to draw it. A new persistent
  visual element that ISN'T one of the above (a corner badge, a second
  panel) is fine — just don't re-cover ground GameCanvas.tsx already owns.
  This is enforced after the fact by a non-blocking audit
  (`cloud_run/game_scaffold.py::audit_render_surfaces`) that flags more
  than one mechanic drawing a full-screen backdrop or centered status
  text for the SAME phase — but catching it before you write it is the
  point of this section.

SESSION LIFECYCLE OWNERSHIP — GameCanvas.tsx's START/RETRY button ALREADY
triggers the full start/restart transition, for every build, every genre:
its begin() handler calls engine.ts's startRun(state), which clears
t/score/entities/events/data, transitions state.phase to 'playing', AND
calls every registered system's OWN reset(state) hook. If your use case is
about what happens when a session starts or restarts ("the environment
resets", "the score returns to zero", "the character begins its
animation"), that transition is ALREADY IMPLEMENTED — implement your
reset(state) method to (re)initialize your own state.data.<key> there;
do NOT reassign state.phase/entities/score/data yourself, and do NOT try
to detect "the user pressed start" yourself (GameCanvas.tsx already reads
that input). A prior build generated redundant systems that reimplemented
this exact transition — each one individually satisfied its own
acceptance criteria, but none of it ever ran: the engine's ownership
sandbox reverts any non-owner's phase/entities/score writes every frame,
silently, so the real transition (GameCanvas.tsx's) always wins and the
mechanic's own code is dead on arrival. If your acceptance criteria reads
as a phase transition and you were NOT assigned MECHANIC ROLE: PHASE
OWNER for that phase, your job is `reset(state)` — not the transition
itself.

## Files (1)

**Frontend**
- `src/game/systems/monitor_player_performance.ts`

## Result

- **Created**: `src/game/systems/monitor_player_performance.ts` implementing real-time player performance tracking, survival duration scaling, collision frequency analysis, and difficulty stabilization grace periods.
- **Satisfies**: `SPEC-052`, `SPEC-059`, `SPEC-065`, and test scripts `TS-0052`, `TS-0059`, `TS-0065`.
- **Design Choice**: Plugs seamlessly into the auto-registered game loop via the `state.data` scratchpad and `state.events` channel without duplicating or colliding with core engine loop mechanics.

---
*Built by the frontend_developer_glitchdash14 crew member · CrewAI App Builder · 2026-08-03 02:36 UTC*
