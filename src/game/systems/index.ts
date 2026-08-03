// Explicit system registry — regenerated deterministically by the build
// (cloud_run/game_scaffold.rebuild_systems_index) as mechanic systems land.
// Framework-agnostic: plain static ES imports (works on Vite AND Next.js).
// Do NOT hand-edit — drop a new src/game/systems/<name>.ts and it's picked up.
import type { GameSystem } from '../types';

import s0 from './animate_particle_bursts';
import s1 from './apply_smoothing_functions';
import s2 from './base_player';
import s3 from './calculate_display_final_session';
import s4 from './configure_audio_mute_toggle';
import s5 from './configure_global_difficulty';
import s6 from './configure_intensity_scaling_curve';
import s7 from './configure_precise_collision_hitbox';
import s8 from './display_live_score_during_gameplay';
import s9 from './implement_screen_shake_feedback';
import s10 from './monitor_performance_for_fairness';
import s11 from './monitor_player_performance';
import s12 from './optimize_collision_detection';
import s13 from './validate_character_obstacle_hitbox';

const registered: Array<GameSystem | undefined> = [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13];
// Only real GameSystem objects register: an object with at least one of
// update/render/reset. A default-exported class (typeof 'function') or a
// bare config object is filtered out so it can never break the loop.
export const systems: GameSystem[] = registered
  .filter((s): s is GameSystem => !!s && typeof s === 'object' &&
    (typeof (s as any).update === 'function' ||
     typeof (s as any).render === 'function' ||
     typeof (s as any).reset === 'function'))
  .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
