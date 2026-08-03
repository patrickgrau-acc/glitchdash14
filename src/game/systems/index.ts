// Explicit system registry — regenerated deterministically by the build
// (cloud_run/game_scaffold.rebuild_systems_index) as mechanic systems land.
// Framework-agnostic: plain static ES imports (works on Vite AND Next.js).
// Do NOT hand-edit — drop a new src/game/systems/<name>.ts and it's picked up.
import type { GameSystem } from '../types';

import s0 from './allocate_assets_to_memory';
import s1 from './animate_particle_bursts';
import s2 from './apply_smoothing_functions';
import s3 from './base_player';
import s4 from './bypass_death_animation';
import s5 from './calculate_display_final_session';
import s6 from './configure_application_parameters';
import s7 from './configure_audio_mute_toggle';
import s8 from './configure_feedback_sequence';
import s9 from './configure_game_balance_constants';
import s10 from './configure_game_parameters_live';
import s11 from './configure_global_difficulty';
import s12 from './configure_input_listener_session';
import s13 from './configure_input_mapping';
import s14 from './configure_intensity_scaling_curve';
import s15 from './configure_object_pooling_obstacles';
import s16 from './configure_precise_collision_hitbox';
import s17 from './construct_self_contained_deployment';
import s18 from './design_neon_vaporwave_interface';
import s19 from './display_irreverent_game_over';
import s20 from './display_live_score_during_gameplay';
import s21 from './enable_instant_gameplay_restart';
import s22 from './enable_vertical_dodge_input';
import s23 from './flush_execution_context';
import s24 from './implement_debug_mode_real_time';
import s25 from './implement_screen_shake_feedback';
import s26 from './initialize_self_contained_runtime';
import s27 from './manage_character_personality';
import s28 from './manage_engine_state_reset';
import s29 from './manage_session_progress';
import s30 from './modify_visual_aesthetic_settings';
import s31 from './monitor_performance_for_fairness';
import s32 from './monitor_player_performance';
import s33 from './optimize_collision_detection';
import s34 from './present_session_upon_gameplay';
import s35 from './reset_gameplay_state_container';
import s36 from './retrieve_local_high_score';
import s37 from './start_initial_gameplay_session';
import s38 from './store_session_high_score';
import s39 from './update_persistent_high_score';
import s40 from './validate_character_obstacle_hitbox';
import s41 from './view_session_performance_metrics';

const registered: Array<GameSystem | undefined> = [s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26, s27, s28, s29, s30, s31, s32, s33, s34, s35, s36, s37, s38, s39, s40, s41];
// Only real GameSystem objects register: an object with at least one of
// update/render/reset. A default-exported class (typeof 'function') or a
// bare config object is filtered out so it can never break the loop.
export const systems: GameSystem[] = registered
  .filter((s): s is GameSystem => !!s && typeof s === 'object' &&
    (typeof (s as any).update === 'function' ||
     typeof (s as any).render === 'function' ||
     typeof (s as any).reset === 'function'))
  .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
