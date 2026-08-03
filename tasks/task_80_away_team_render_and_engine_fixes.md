# Task 80: Away-Team Session — Render Deduplication, Live Engine Wiring, and a Critical Ownership Bug Fix

## Functional Scope Addressed

TASK: away_team_session_2026_08
CONTEXT: Interactive human-directed session (not the automated CrewAI build crew). The user reported that GlitchDash14's biggest playability issue was that many game mechanics render UI simultaneously, cluttering the screen, and asked for the render surface to be indexed and tightened. That request expanded over the course of the session into: consolidating duplicate render surfaces across all three phases (ready/playing/over), resolving keybinding collisions, building a real settings panel outside the canvas, and — in the course of verifying that panel — discovering and fixing a critical, pre-existing bug in the phase-ownership control model that had silently prevented the score from ever incrementing.
FEATURE: Manage game state including real-time difficulty scaling, collision detection, and score tracking. | Design a high-energy, meme-inspired visual and auditory environment suitable for a school setting. | Provide a frictionless instant-retry mechanic to support rapid gameplay sessions.

DELIVERABLES:
- One render surface per phase per concern; no stacked/duplicate panels, borders, or HUD text.
- All debug/diagnostic overlays unified behind a single shared toggle, off by default.
- Every control in the new Status & Config panel demonstrably changes live gameplay, not just stored data.
- No two keys bound to unrelated actions.
- Root-cause fix for the phase-ownership bug that froze score at 0.
- Confetti/sound feedback moved from "every score tick" (time-based, unrelated to obstacles) to "obstacle actually jumped over."

## Files (~35)

**Locked scaffold files touched — with justification, since these are normally off-limits to generated mechanics**
- `src/game/control.ts` — **critical bug fix**: `PHASE_OWNERS["playing"]` was `"manage_session_progress"` instead of `"base_player"`. Since `base_player.ts` is the system that actually writes `state.score` and `state.phase='over'`, and `engine.ts`'s ownership sandbox reverts any *non-owner's* writes to those fields every frame, this silently discarded every score increment (and likely every collision→game-over transition) for the lifetime of this build. Fixed to match the `"ready"`/`"over"` entries, which were already correct.
- `src/game/systems/base_player.ts` — (a) speed/gravity/gap formulas now actually multiply by `state.data.globalSpeedMultiplier`/`speedModifier`/`obstacleGapFactor`/`gapSize`/`gravityMultiplier`, clamped to sane ranges — previously these ~9 "difficulty scaling" systems and the config-panel sliders wrote to `state.data` that nothing ever read; (b) added obstacle-clear detection (`state.data.clearedObstacles`) for the confetti/sound retarget below; (c) background/ground/obstacle/player colors now read the active theme palette instead of hardcoded hex values — previously the Theme setting changed stored data with zero visible effect.
- `src/game/GameCanvas.tsx` — added a collapsible "Status & Config" DOM panel below the canvas (throttled ~0.4s state sync out of the render loop; sliders/toggles/dropdowns write back into `state.data` or simulate raw input). This required editing GameCanvas.tsx directly since there is no other way to surface live `state.data` into DOM UI outside the canvas; the edit is additive only — none of the existing owned score/status/button chrome was touched.

**Systems: render deduplication (ready / playing / over)**
- `start_initial_gameplay_session.ts` — emptied; was drawing a second full-screen backdrop + "GLITCH DASH 14" title + start prompt directly under GameCanvas.tsx's own DOM ready overlay.
- `design_neon_vaporwave_interface.ts` — emptied; was drawing a second (and third) border frame inside the canvas's own CSS border+glow on ready/over.
- `calculate_display_final_session.ts` — stripped down to only the meme one-liner (e.g. "BRO PLAYED WITH NO HANDS"), repositioned to the top of the canvas; previously duplicated the DOM overlay's score/best/GAME OVER/RETRY/hint inside its own bordered panel.
- `display_irreverent_game_over.ts`, `enable_instant_gameplay_restart.ts`, `view_session_performance_metrics.ts`, `present_session_upon_gameplay.ts`, `reset_gameplay_state_container.ts` — render bodies emptied (update/reset logic untouched); each drew a competing centered panel on the game-over screen.
- `display_live_score_during_gameplay.ts`, `configure_intensity_scaling_curve.ts` — render bodies emptied; duplicated the DOM score header and `apply_smoothing_functions.ts`'s intensity badge respectively.
- `allocate_assets_to_memory.ts` — "Memory Cache" corner text on the ready screen moved behind the debug flag.

**Systems: debug/diagnostic overlays unified behind one flag**
- `implement_debug_mode_real_time.ts` — `debug.enabled` now defaults `false` (was `true`, i.e. on for every player by default); toggle key moved off the overloaded `KeyM` onto dedicated `` ` `` (Backquote).
- `validate_multi_platform_performance.ts`, `optimize_collision_detection.ts`, `validate_character_obstacle_hitbox.ts` — gated behind the shared `state.data.debug.enabled` flag (the hitbox-outline one previously defaulted to always-on with no way to disable it).
- `monitor_performance_for_fairness.ts` — top-right FPS/governor box moved to the DOM panel; the red "HARDWARE THROTTLE" warning banner gated behind debug.
- `flush_execution_context.ts`, `sync_game_updates_display_refresh.ts`, `optimize_input_to_action_logic_path.ts`, `configure_object_pooling_obstacles.ts`, `configure_precise_collision_hitbox.ts` — repointed from a dead flag (`state.data.debugHitboxes`, set nowhere in the codebase, so these were unreachable even with debug on) to the one real flag.

**Systems: keybinding collisions resolved ("always split keys")**
- `configure_multi_modal_deployment.ts` — deployment-profile cycling moved from `KeyM` (collided with audio mute) to `KeyP`; also added direct-selection support consumed from the Status & Config panel dropdown.
- `apply_smoothing_functions.ts` — the hidden "hold M to force max difficulty" debug hook (a real gameplay-integrity issue — any player muting audio also maxed difficulty) is now gated behind debug mode instead of sharing the mute key.
- `allocate_assets_to_memory.ts` — removed a dead `KeyM` hook whose pushed event had no listener.
- `perform_glitch_dash_animation.ts` — fixed a bug where the alt dash key checked the nonexistent code `'KeyShiftLeft'` instead of the real `'ShiftLeft'`/`'ShiftRight'`.
- `public/wiki.html` — added a "Full Key Bindings Reference" section (Core Gameplay / Settings & Toggles / Diagnostic tables) to the in-app wiki.

**Systems: Status & Config panel — wiring bugs found in review**
- `modify_visual_aesthetic_settings.ts`, `configure_multi_modal_deployment.ts` — the panel's Theme/Mode dropdowns originally pushed `state.events.push('set_theme:...')` / `'set_deployment:...'`. This never worked: `engine.ts`'s `step()` clears `state.events` as its first line every frame, wiping anything a React handler pushes between animation frames before any system can read it. Both now read a direct `state.data.requestedThemeId` / `requestedDeploymentProfile` field instead (the same durable channel the sliders already used correctly).
- `GameCanvas.tsx` — Audio toggle had inverted semantics (`checked` was bound to *muted*, so the switch showed "off" while the label said "On"); fixed to bind `checked` to "audio is on". Its `onChange`, plus Debug and Accessibility's toggles, now simulate the real keypress (`KeyM`/`Backquote`/`KeyH`) via `inputRef.current.justPressed`, which — unlike `state.events` — survives the gap between animation frames.

**Systems: confetti/sound retargeted from "every score tick" to "obstacle jumped over"**
- `base_player.ts` — detects when an obstacle's trailing edge passes the player's (fixed) x-position without a collision — the only way that happens is by having jumped over it — and records it per-frame in `state.data.clearedObstacles`.
- `animate_particle_bursts.ts` — bursts now spawn centered on each cleared obstacle (with a leftward drift matching scroll speed so they trail off with it), instead of on every continuous score increment (score ticks by survival time in this game, unrelated to obstacles).
- `generate_high_energy_audio_feedback.ts` — the score sound now fires on the new `'cleared'` event instead of `'score'`.

**New files**
- `.claude/launch.json` — dev server preview config (`npm run dev`, port 3000).
- `scripts/deploy.bat` — one-command redeploy to the project's Cloud Run staging service (project/service identifiers are set via local environment variables, not hardcoded — see the script's comments).

## Result

- Indexed all 54 game systems' `render()` methods; found 51 implement one. Diagnosed and fixed four separate clutter clusters (always-on debug overlays, duplicate audio widgets, duplicate game-over panels, duplicate top-right HUD text), then two more rounds of the same pattern that were missed on the first pass (a collision-perf readout, a "STABLE STATE LOCK" banner, and — most visibly — a full duplicate ready-screen backdrop/title and a duplicate game-over panel/border, found via a user-supplied screenshot).
- Built a collapsible "Status & Config" panel outside the canvas (DOM, not canvas-drawn) consolidating what had been ~8 separate floating canvas overlays into one place, each row showing a plain-English description sourced from that mechanic's original task file, with a real control (toggle / dropdown / slider) instead of a hotkey hint.
- During verification of that panel, found and fixed the session's most consequential bug: `control.ts`'s phase-ownership registry gave the `'playing'` phase to a system that never touches score or phase, silently freezing the score at 0 for the life of the build via the engine's own ownership-sandbox mechanism. One-line fix, verified by code review (live rAF-driven verification wasn't possible through the available browser automation tooling — its tab reports `document.hidden: true` regardless of front/focus state — so this warrants a direct playtest).
- Wired three previously-decorative settings (Speed/Gap/Gravity sliders, and separately the Theme palette) into `base_player.ts`, the only system that owns physics/spawn/render — none of them, nor the ~9 "difficulty scaling" systems that computed inputs for them, had ever actually been read by the core loop.
- Retargeted the score-tick confetti/sound to fire on genuine obstacle-clear events instead, with confetti centered on the specific obstacle and drifting off with it.
- Deployed the mid-session state to the Cloud Run staging service once; later fixes (control.ts, panel wiring, confetti/sound, screen dedup round 2) are committed to the working tree but not yet redeployed as of this task file being written — run `scripts\deploy.bat` to ship them.

## Known follow-ups (not yet actioned — flagged during review, out of scope for this pass)

- `ArrowUp`/`KeyW` still double as both "jump" and "dodge up" in `enable_vertical_dodge_input.ts` — not a keybinding collision to mechanically split, but a game-feel decision (should dodge-up exist as distinct from jump, and on what key?) that needs a design call before touching.
- `configure_intensity_scaling_curve.ts` still computes its own `globalSpeedMultiplier`/`obstacleGapFactor` every frame that `apply_smoothing_functions.ts` immediately overwrites (order 10 vs 25) — harmless dead computation, not a rendering bug, left alone.
- `reset_gameplay_state_container.ts`'s `KeyR` restart shortcut pushes a `'trigger_restart'` event with no listener — likely vestigial, since `GameCanvas.tsx`'s own keydown handler already restarts on *any* key press from ready/over.
- `enable_instant_gameplay_restart.ts`'s `update()` independently reassigns `state.phase`/`score`/`entities`/`t` on restart input, duplicating what `GameCanvas.tsx`'s `begin()` already does — likely dead-on-arrival under the ownership sandbox (same class of bug as the control.ts fix above, but for a mechanic that isn't the phase owner), not confirmed or fixed this session.

---
*Written during an interactive session with the repository owner · not part of the original CrewAI App Builder pipeline · 2026-08-03*
