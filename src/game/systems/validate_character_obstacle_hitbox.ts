/**
 * Implements: SPEC-049, SPEC-057
 * Satisfies: TS-0049 (AABB collision detection trigger), TS-0057 (high-velocity thin wall tunnel prevention)
 * 
 * GameSystem: validate_character_obstacle_hitbox
 * Epic: Precise Collision Detection System
 * 
 * Provides robust AABB collision detection and swept collision resolution for high-velocity
 * movement against environmental obstacles, ensuring collision triggers within 16ms and
 * preventing high-velocity tunneling through thin obstacles.
 */

import { GameSystem, GameState, InputState, Entity } from '@/game/types';

// Extend Entity or GameState via shared scratchpad state.data.<key>
// and document any custom properties needed.

interface AABB {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface RayHit {
  hit: boolean;
  time: number; // 0 to 1 along velocity vector
  normalX: number;
  normalY: number;
}

/**
 * Perform swept AABB collision check (Slab method / Minkowski sum approach)
 * between a moving box (player) and a static/moving box (obstacle) over timestep dt.
 */
function sweepAABB(
  box: AABB & { vx: number; vy: number },
  obstacle: AABB & { vx?: number; vy?: number },
  dt: number
): RayHit {
  const vx = (box.vx - (obstacle.vx || 0)) * dt;
  const vy = (box.vy - (obstacle.vy || 0)) * dt;

  const bOldX = box.x;
  const bOldY = box.y;
  const bW = box.w;
  const bH = box.h;

  const oX = obstacle.x;
  const oY = obstacle.y;
  const oW = obstacle.w;
  const oH = obstacle.h;

  // Broadphase check using Minkowski difference expanded bounding box
  // Expand obstacle by player dimensions
  let xInvEntry = 0;
  let yInvEntry = 0;
  let xInvExit = 0;
  let yInvExit = 0;

  // Determine entry and exit times for x and y axes
  let xEntry = 0;
  let xExit = 0;
  let yEntry = 0;
  let yExit = 0;

  if (vx > 0) {
    xEntry = (oX - (bOldX + bW)) / vx;
    xExit = (oX + oW - bOldX) / vx;
  } else if (vx < 0) {
    xEntry = (oX + oW - bOldX) / vx;
    xExit = (oX - (bOldX + bW)) / vx;
  } else {
    if (bOldX + bW <= oX || bOldX >= oX + oW) {
      return { hit: false, time: 1, normalX: 0, normalY: 0 };
    }
    xEntry = -Infinity;
    xExit = Infinity;
  }

  if (vy > 0) {
    yEntry = (oY - (bOldY + bH)) / vy;
    yExit = (oY + oH - bOldY) / vy;
  } else if (vy < 0) {
    yEntry = (oY + oH - bOldY) / vy;
    yExit = (oY - (bOldY + bH)) / vy;
  } else {
    if (bOldY + bH <= oY || bOldY >= oY + oH) {
      return { hit: false, time: 1, normalX: 0, normalY: 0 };
    }
    yEntry = -Infinity;
    yExit = Infinity;
  }

  const entryTime = Math.max(xEntry, yEntry);
  const exitTime = Math.min(xExit, yExit);

  if (entryTime > exitTime || (xEntry < 0 && yEntry < 0) || xEntry > 1 || yEntry > 1) {
    return { hit: false, time: 1, normalX: 0, normalY: 0 };
  }

  let normalX = 0;
  let normalY = 0;

  if (xEntry > yEntry) {
    if (vx < 0) {
      normalX = 1;
      normalY = 0;
    } else {
      normalX = -1;
      normalY = 0;
    }
  } else {
    if (vy < 0) {
      normalX = 0;
      normalY = 1;
    } else {
      normalX = 0;
      normalY = -1;
    }
  }

  return {
    hit: true,
    time: Math.max(0, entryTime),
    normalX,
    normalY,
  };
}

/**
 * Standard AABB overlap check for stationary or frame-transition intersection (TS-0049)
 */
function checkAABBOverlap(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

const validateCharacterObstacleHitboxSystem: GameSystem = {
  id: 'validate_character_obstacle_hitbox',
  order: 25, // Runs early in physics/collision sequence

  reset(state: GameState) {
    state.data.collisionValidation = {
      lastCollisionTime: 0,
      tunnelingPreventedCount: 0,
      activeHitboxCollisions: 0,
    };
  },

  update(state: GameState, input: InputState, dt: number) {
    if (state.phase !== 'playing') return;

    // The real player lives in state.player (base_player.ts's own top-level field) — it is
    // NEVER pushed into state.entities (only obstacles are). The old
    // `state.entities.find(e => e.kind === 'player') || state.entities[0]` fallback always
    // failed to find a match and always fell through to state.entities[0] — silently
    // treating the FIRST OBSTACLE as "the player" and checking it for overlap against every
    // OTHER obstacle. When two obstacles spawned close enough to overlap, that registered
    // as a false 'hit' — the collision sound firing for an obstacle/obstacle overlap that
    // never involved the real player at all.
    const player = state.player;
    if (!player) return;

    // Initialize per-mechanic data if missing
    if (!state.data.collisionValidation) {
      this.reset!(state);
    }

    let collisionDetected = false;

    // Check all obstacle / hazard entities against player
    for (const entity of state.entities) {
      if (entity.kind === 'particle' || entity.kind === 'fx') continue;

      // 1. Static/Frame AABB Overlap (TS-0049)
      const isOverlapping = checkAABBOverlap(
        { x: player.x, y: player.y, w: player.w, h: player.h },
        { x: entity.x, y: entity.y, w: entity.w, h: entity.h }
      );

      // 2. High-velocity Swept Collision / Tunnel Prevention (TS-0057)
      // Check if velocity is high enough to warrant continuous swept collision testing
      const speedSq = (player.vx || 0) * (player.vx || 0) + (player.vy || 0) * (player.vy || 0);
      let sweptHit = isOverlapping;

      if (!isOverlapping && speedSq > 400) {
        const sweep = sweepAABB(
          {
            x: player.x - (player.vx || 0) * dt,
            y: player.y - (player.vy || 0) * dt,
            w: player.w,
            h: player.h,
            vx: player.vx || 0,
            vy: player.vy || 0,
          },
          {
            x: entity.x,
            y: entity.y,
            w: entity.w,
            h: entity.h,
            vx: entity.vx || 0,
            vy: entity.vy || 0,
          },
          dt
        );

        if (sweep.hit) {
          sweptHit = true;
          state.data.collisionValidation.tunnelingPreventedCount++;
        }
      }

      if (isOverlapping || sweptHit) {
        collisionDetected = true;
        state.data.collisionValidation.lastCollisionTime = state.t;
        
        // Push hit event to shared event channel for base_player and lifecycle handlers
        if (!state.events.includes('hit')) {
          state.events.push('hit');
        }
        break;
      }
    }

    state.data.collisionValidation.activeHitboxCollisions = collisionDetected ? 1 : 0;
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    if (state.phase !== 'playing') return;
    const config = state.data.collisionValidation;
    // Was defaulting to enabled=true with no way to turn it off — every obstacle
    // and the player always had a debug outline box drawn around them. Now driven
    // by the same shared debug flag (Backquote) as the rest of the diagnostics.
    if (!config || !state.data.debug?.enabled) return;

    // Optional subtle debug overlay for precise hitbox visualization when enabled in state.data
    const player = state.player;
    if (!player) return;

    ctx.save();
    ctx.strokeStyle = config.activeHitboxCollisions > 0 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(player.x, player.y, player.w, player.h);

    // Draw thin obstacle bounding boxes for active inspection
    for (const entity of state.entities) {
      if (entity.kind === 'particle') continue;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.strokeRect(entity.x, entity.y, entity.w, entity.h);
    }
    ctx.restore();
  },
};

export default validateCharacterObstacleHitboxSystem;