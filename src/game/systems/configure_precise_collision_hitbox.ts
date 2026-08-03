// Implements: SPEC-048, SPEC-058, SPEC-064
// Satisfies: TS-0048, TS-0058, TS-0064

import { GameSystem, GameState, InputState } from '../types';

/**
 * Configure Precise Collision Hitbox Geometry system for GlitchDash14.
 * Manages calculated hitbox dimensions, tolerance thresholds (2-pixel skimming rule),
 * and geometry primitives for character and obstacle instances as per fairness requirements.
 */
interface HitboxConfig {
  /** Pixel tolerance for skimming collisions */
  TOLERANCE: number;
  /** Scale factor to make hitboxes slightly smaller than visual assets */
  HITBOX_SCALE: number;
}

const CONFIG: HitboxConfig = {
  TOLERANCE: 2,
  HITBOX_SCALE: 0.85,
};

const configurePreciseCollisionHitboxSystem: GameSystem = {
  id: 'configure_precise_collision_hitbox',
  order: 10,

  reset(state: GameState): void {
    // Store calculated hitbox boundaries and configuration in state.data for engine and other systems
    state.data.collisionConfig = {
      ...CONFIG,
      initialized: true,
      objectClasses: {
        runner: { widthMultiplier: 0.8, heightMultiplier: 0.9, offsetX: 0, offsetY: 0 },
        obstacle_barrier: { widthMultiplier: 0.85, heightMultiplier: 0.85, offsetX: 2, offsetY: 2 },
        obstacle_glitch: { widthMultiplier: 0.75, heightMultiplier: 0.75, offsetX: 4, offsetY: 4 },
      },
    };
  },

  update(state: GameState, input: InputState, dt: number): void {
    // Ensure collision configuration is present
    if (!state.data.collisionConfig) {
      state.data.collisionConfig = {
        ...CONFIG,
        initialized: true,
      };
    }

    // Verify entity collision geometries and apply 2-pixel tolerance checking on events
    if (state.entities && state.entities.length > 0) {
      for (const entity of state.entities) {
        if (!entity.hitboxInitialized) {
          // Assign standardized collision geometry slightly smaller than visual bounds for fairness
          const scale = CONFIG.HITBOX_SCALE;
          entity.hitbox = {
            w: entity.w * scale,
            h: entity.h * scale,
            offsetX: (entity.w * (1 - scale)) / 2,
            offsetY: (entity.h * (1 - scale)) / 2,
            tolerance: CONFIG.TOLERANCE,
          };
          entity.hitboxInitialized = true;
        }
      }
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Tuning and configuration system; optional subtle debugging visualization if enabled in state.data
    if (state.data.debugHitboxes && state.entities) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.6)';
      ctx.lineWidth = 1;
      for (const entity of state.entities) {
        if (entity.hitbox) {
          const hx = entity.x + entity.hitbox.offsetX;
          const hy = entity.y + entity.hitbox.offsetY;
          ctx.strokeRect(hx, hy, entity.hitbox.w, entity.hitbox.h);
        }
      }
      ctx.restore();
    }
  },
};

export default configurePreciseCollisionHitboxSystem;