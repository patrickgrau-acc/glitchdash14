/**
 * Implements: SPEC-76VErDY03GdyUrr0H2N4
 * Satisfies: TS-0047 (spatial filtering and object culling),
 *            TS-0051 (AABB early-out logic for collision checks),
 *            TS-0067 (AABB collision detection performance budget under 0.5ms per frame)
 */

import { GameSystem, GameState, InputState, Entity } from '../types';

interface OptimizedCollisionState {
  lastCheckDurationMs: number;
  culledCount: number;
  earlyOutCount: number;
  totalChecks: number;
}

/**
 * Helper to perform AABB collision detection with strict early-out conditions.
 * Returns false immediately if bounding boxes do not overlap on any single axis.
 * Satisfies TS-0051.
 */
export function checkAABB(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  // Early-out on X axis (right edge of A < left edge of B OR left edge of A > right edge of B)
  if (a.x + a.w < b.x) return false;
  if (a.x > b.x + b.w) return false;

  // Early-out on Y axis (bottom edge of A < top edge of B OR top edge of A > bottom edge of B)
  if (a.y + a.h < b.y) return false;
  if (a.y > b.y + b.h) return false;

  return true;
}

const optimizeCollisionDetectionSystem: GameSystem = {
  id: 'optimize_collision_detection',
  order: 15,

  reset(state: GameState): void {
    state.data.optimize_collision = {
      lastCheckDurationMs: 0,
      culledCount: 0,
      earlyOutCount: 0,
      totalChecks: 0,
    } as OptimizedCollisionState;
  },

  update(state: GameState, _input: InputState, _dt: number): void {
    const startTime = performance.now();

    if (!state.data.optimize_collision) {
      state.data.optimize_collision = {
        lastCheckDurationMs: 0,
        culledCount: 0,
        earlyOutCount: 0,
        totalChecks: 0,
      } as OptimizedCollisionState;
    }

    const data = state.data.optimize_collision as OptimizedCollisionState;
    let culled = 0;
    let earlyOuts = 0;
    let checks = 0;

    // 1. Spatial filtering & object culling (TS-0047):
    // Prune entities that have exited the viewport (e.g. far off-screen to the left or right)
    const viewportWidth = state.width || 800;
    const initialCount = state.entities.length;

    state.entities = state.entities.filter(entity => {
      // Keep entities that are within reasonable bounds or are essential runner items
      const isOutOfBounds = entity.x + (entity.w || 50) < -200 || entity.x > viewportWidth + 400;
      if (isOutOfBounds) {
        culled++;
        return false;
      }
      return true;
    });

    // 2. High-performance collision spatial sorting & early-out optimization (TS-0051, TS-0067)
    // Find player / runner entity
    const player = state.entities.find(e => e.kind === 'runner' || e.kind === 'player');
    const obstacles = state.entities.filter(e => e.kind === 'obstacle' || e.kind === 'hazard' || e.kind === 'enemy');

    if (player && obstacles.length > 0) {
      for (const obs of obstacles) {
        checks++;
        // Test early-out condition before deep calculation
        if (player.x + player.w < obs.x) {
          earlyOuts++;
          continue;
        }
        if (player.x > obs.x + obs.w) {
          earlyOuts++;
          continue;
        }
        if (player.y + player.h < obs.y) {
          earlyOuts++;
          continue;
        }
        if (player.y > obs.y + obs.h) {
          earlyOuts++;
          continue;
        }

        // Overlap confirmed if all axes pass
        // Trigger hit event if not already present
        if (!state.events.includes('hit')) {
          state.events.push('hit');
        }
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    data.lastCheckDurationMs = Number(duration.toFixed(3));
    data.culledCount = culled;
    data.earlyOutCount = earlyOuts;
    data.totalChecks = checks;

    // Expose performance metrics for monitoring HUD or telemetry
    state.data.collisionPerformance = {
      durationMs: data.lastCheckDurationMs,
      culled: data.culledCount,
      earlyOuts: data.earlyOutCount,
      underBudget: data.lastCheckDurationMs < 0.5,
    };
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    const perf = state.data.collisionPerformance;
    if (!perf || state.phase !== 'playing') return;

    // Subtle, low-profile performance telemetry indicator in top-right corner
    ctx.save();
    ctx.font = '10px Roboto, monospace';
    ctx.fillStyle = perf.underBudget ? 'rgba(76, 175, 80, 0.7)' : 'rgba(255, 152, 0, 0.9)';
    ctx.textAlign = 'right';
    ctx.fillText(
      `COLLISION: ${perf.durationMs}ms | CULL: ${perf.culled} | EARLY-OUT: ${perf.earlyOuts}`,
      state.width - 16,
      28
    );
    ctx.restore();
  },
};

export default optimizeCollisionDetectionSystem;