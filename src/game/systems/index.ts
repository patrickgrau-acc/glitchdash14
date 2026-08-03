// Explicit system registry — regenerated deterministically by the build
// (cloud_run/game_scaffold.rebuild_systems_index) as mechanic systems land.
// Framework-agnostic: plain static ES imports (works on Vite AND Next.js).
// Do NOT hand-edit — drop a new src/game/systems/<name>.ts and it's picked up.
import type { GameSystem } from '../types';

import s0 from './allocate_assets_to_memory';
import s1 from './animate_particle_bursts';
import s2 from './apply_smoothing_functions';
import s3 from './base_player';
import s4 from './calculate_display_final_session';
import s5 from './configure_application_parameters';
import s6 from './configure_audio_mute_toggle';
import s7 from './configure_game_balance_constants';
import s8 from './configure_game_parameters_live';
import s9 from './configure_global_difficulty';
import s10 from './configure_input_mapping';
import s11 from './configure_intensity_scaling_curve';
import s12 from './configure_precise_collision_hitbox';
import s13 from './construct_self_contained_deployment';
import s14 from './display_live_score_during_gameplay';
import s15 from './enable_instant_gameplay_restart';
import s16 from './enable_vertical_dodge_input';
import s17 from './implement_debug_mode_real_time';
import s18 from './implement_screen_shake_feedback';
import s19 from './initialize_self_contained_runtime';
import s20 from './manage_session_progress';
import s21 from './modify_visual_aesthetic_settings';
import s22 from './monitor_performance_for_fairness';
import s23 from './monitor_player_performance';
import s24 from './optimize_collision_detection';
import s25 from './present_session_upon_gameplay';
import s26 from './retrieve_local_high_score';
import s27 from './start_initial_gameplay_session';
import s28 from './store_session_high_score';
import s29 from './update_persistent_high_score';
import s30 from './validate_character_obstacle_hitbox';
import s31 from './view_session_performance_metrics';

const registered: Array<GameSystem | undefined> = [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26, s27, s28, s29, s30, s31];
// Only real GameSystem objects register: an object with at least one of
// update/render/reset. A default-exported class (typeof 'function') or a
// bare config object is filtered out so it can never break the loop.
export const systems: GameSystem[] = registered
  .filter((s): s is GameSystem => !!s && typeof s === 'object' &&
    (typeof (s as any).update === 'function' ||
     typeof (s as any).render === 'function' ||
     typeof (s as any).reset === 'function'))
  .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
