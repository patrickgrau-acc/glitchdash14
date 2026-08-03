// Implements: SPEC-0097, SPEC-0100, SPEC-0102
// Satisfies: TS-0097, TS-0100, TS-0102
import { GameSystem, GameState, InputState, Entity } from '@/game/types';

/**
 * Configure Object Pooling for Obstacles Game System
 * Manages an object pool for obstacles to prevent GC pauses and enable frictionless reuse.
 */
interface PooledObstacle extends Entity {
  active: boolean;
  poolIndex: number;
}

const POOL_SIZE = 30;

const objectPoolingSystem: GameSystem = {
  id: 'configure_object_pooling_obstacles',
  order: 5,

  reset(state: GameState): void {
    // Initialize or reset the obstacle object pool in state.data
    const pool: PooledObstacle[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      pool.push({
        id: `pooled_obstacle_${i}`,
        kind: 'obstacle',
        x: -999,
        y: -999,
        w: 40,
        h: 40,
        vx: 0,
        vy: 0,
        active: false,
        poolIndex: i,
      });
    }
    state.data.obstaclePool = pool;
    state.data.poolMetrics = {
      activeCount: 0,
      recycledCount: 0,
      totalCreations: 0,
    };
  },

  update(state: GameState, input: InputState, dt: number): void {
    if (state.phase !== 'playing') return;

    if (!state.data.obstaclePool) {
      this.reset!(state);
    }

    const pool: PooledObstacle[] = state.data.obstaclePool;

    // Synchronize or manage obstacle recycling based on state.entities
    // When obstacle entities leave the screen or become inactive, return them to pool.
    // Also, if base_player or spawner needs obstacles, we can pull from pool.
    let activeCount = 0;
    for (let i = 0; i < pool.length; i++) {
      const obstacle = pool[i];
      if (obstacle.active) {
        // Check if obstacle has moved off-screen (e.g. x < -100)
        if (obstacle.x + obstacle.w < -50) {
          obstacle.active = false;
          obstacle.x = -999;
          obstacle.y = -999;
          state.data.poolMetrics.recycledCount++;
        } else {
          activeCount++;
        }
      }
    }
    state.data.poolMetrics.activeCount = activeCount;

    // Ensure state.entities contains the active pooled obstacles
    // We map active pool items into state.entities so collision and base loop work seamlessly
    const activePooledEntities = pool.filter((o) => o.active);
    
    // Ensure non-pooled entities (like player) are kept, and sync obstacle entities
    const nonObstacles = state.entities.filter((e) => e.kind !== 'obstacle');
    state.entities = [...nonObstacles, ...activePooledEntities];

    // Listen to state events for spawning triggers
    if (state.events.includes('spawn_obstacle') || Math.random() < 0.02 * (dt || 0.016)) {
      // Retrieve an inactive obstacle from the pool
      const inactive = pool.find((o) => !o.active);
      if (inactive) {
        inactive.active = true;
        inactive.x = state.width + 50;
        inactive.y = state.height - 90; // Ground level obstacle
        inactive.vx = -(400 + (state.data.globalSpeedMultiplier || 1) * 50);
        inactive.vy = 0;
      }
    }
  },

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    // Debug render or visual indicator if debug mode is active
    if (state.data.debug?.enabled && state.data.obstaclePool) {
      ctx.save();
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 1;
      const pool: PooledObstacle[] = state.data.obstaclePool;
      for (const obs of pool) {
        if (obs.active) {
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        }
      }
      ctx.restore();
    }
  },
};

export default objectPoolingSystem;