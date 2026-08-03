# Render-ownership gate — auto-corrections

Non-blocking quality gate: when a game_mechanic_* task's own file introduces a phase-overlay that ANOTHER file already claims, this gate fixes it immediately (LLM rewrite shown the actual competing code, falling back to a deterministic render() strip) instead of only reporting it.

Checked: 2 | Fixed by LLM: 1 | Fixed by strip: 1 | Unresolved: 0

## Actions
- src/game/systems/bypass_death_animation.ts: render() stripped (duplicate full_backdrop for phase 'playing', already owned by src/game/systems/monitor_performance_for_fairness.ts)
- src/game/systems/bypass_death_animation.ts: LLM rewrite removed duplicate full_backdrop for phase 'over' (already owned by src/game/systems/enable_instant_gameplay_restart.ts)
