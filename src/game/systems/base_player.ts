// CORE LOOP — RUNNER. Owns: gravity, one-button jump, ground, obstacle
// spawn/move (entities kind 'obstacle'), AABB collision, particles,
// scoring. Emits: 'jump' | 'score' | 'hit' | 'over'.
import type { GameSystem } from '../types';

const GRAVITY = 2400, JUMP_V = -820, GROUND_MARGIN = 90;

const system: GameSystem = {
  id: 'base_player', order: 0,
  reset(state) {
    const gY = state.height - GROUND_MARGIN;
    state.data.groundY = gY; state.data.speed = 360; state.data.scored = 0;
    state.entities = [];
    state.player = { id: 'player', kind: 'player', x: 120, y: gY - 44, w: 34, h: 44, vx: 0, vy: 0, onGround: true };
  },
  update(state, input, dt) {
    if (state.phase !== 'playing' || !state.player) return;
    const p = state.player, gY = state.data.groundY;
    // Difficulty knobs, clamped so neither the automatic scaling systems nor a
    // manually-dragged slider can push the game into an unrecoverable state.
    // globalSpeedMultiplier/obstacleGapFactor are computed automatically (score/time-based
    // intensity ramp); speedModifier/gapSize/gravityMultiplier are the player-facing sliders
    // in the Status & Config panel — both apply on top of the base formulas below.
    const speedMul = Math.min(5, Math.max(0.3, (state.data.globalSpeedMultiplier ?? 1) * (state.data.speedModifier ?? 1)));
    const gapMul = Math.min(4, Math.max(0.25, (state.data.obstacleGapFactor ?? 1) * (state.data.gapSize ?? 1)));
    const gravMul = Math.min(3, Math.max(0.3, state.data.gravityMultiplier ?? 1));
    p.vy += GRAVITY * gravMul * dt; p.y += p.vy * dt;
    if (p.y >= gY - p.h) { p.y = gY - p.h; p.vy = 0; p.onGround = true; }
    const jump = input.keys.has('Space') || input.keys.has('ArrowUp') || input.keys.has('KeyW') || input.pointer.down;
    if (jump && p.onGround) { p.vy = JUMP_V; p.onGround = false; state.events.push('jump'); }
    state.data.speed = (360 + state.t * 9) * speedMul;
    state.score += state.data.speed * dt * 0.05;
    if (Math.floor(state.score) > state.data.scored) { state.data.scored = Math.floor(state.score); state.events.push('score'); }
    // Obstacle placement must stay mathematically jumpable no matter how the
    // gravity/gap/speed knobs are set. Derive the actual jump arc from the live
    // gravity + current scroll speed and clamp obstacle height/width/spacing to
    // what that arc can clear, rather than trusting the sliders' requested gap
    // factor at face value — an extreme combo (e.g. high gravity + low speed)
    // can otherwise ask for a box that's tall enough or a gap tight enough
    // that no jump timing could ever clear it.
    const gravityNow = GRAVITY * gravMul;
    const jumpRise = (JUMP_V * JUMP_V) / (2 * gravityNow); // max height (px) feet reach above ground
    const jumpAirtime = (2 * Math.abs(JUMP_V)) / gravityNow; // ground-to-ground hang time (s)
    const jumpSpan = state.data.speed * jumpAirtime; // max ground distance (px) coverable while airborne
    const REACTION_TIME = 0.18; // seconds a player needs on the ground to see + react + jump again
    const maxSafeHeight = Math.max(14, jumpRise * 0.65);
    const maxSafeWidth = Math.max(14, jumpSpan * 0.5);
    const minGap = REACTION_TIME * state.data.speed + jumpSpan * 0.35;
    let rightmostEdge = -Infinity;
    for (const o of state.entities) if (o.kind === 'obstacle') rightmostEdge = Math.max(rightmostEdge, o.x + o.w);
    const spawnX = state.width + 40;
    const roomAvailable = rightmostEdge === -Infinity || spawnX - rightmostEdge >= minGap;
    // Bigger gap factor = rarer spawns (more room between obstacles); smaller = denser —
    // but roomAvailable is a hard floor the requested gap factor can never shrink past.
    if (roomAvailable && Math.random() < 0.02 / gapMul && state.entities.length < 4) {
      const h = Math.min(30 + Math.random() * 26, maxSafeHeight);
      const w = Math.min(26, maxSafeWidth);
      state.entities.push({ id: Math.random().toString(), kind: 'obstacle', x: spawnX, y: gY - h, w, h, vx: 0, vy: 0 });
    }
    // This frame's obstacle-clear events — consumed by confetti/audio systems that
    // run later in system order, then discarded (mirrors how state.events works,
    // but carries the obstacle's position so effects can center on it).
    state.data.clearedObstacles = [];
    for (let i = state.entities.length - 1; i >= 0; i--) {
      const o = state.entities[i]; if (o.kind !== 'obstacle') continue;
      o.x -= state.data.speed * dt;
      if (o.x + o.w < -40) { state.entities.splice(i, 1); continue; }
      const t = 5;
      if (p.x + t < o.x + o.w - t && p.x + p.w - t > o.x + t && p.y + t < o.y + o.h - t && p.y + p.h - t > o.y + t) {
        state.phase = 'over'; state.events.push('hit'); state.events.push('over');
      } else if (!o.cleared && o.x + o.w < p.x) {
        // Player's x is fixed, so the only way an obstacle passes it without a
        // collision is by having jumped over it — this is the "cleared" moment.
        o.cleared = true;
        state.events.push('cleared');
        state.data.clearedObstacles.push({ x: o.x, y: o.y, w: o.w, h: o.h });
      }
    }
  },
  render(ctx, state) {
    const gY = state.data.groundY ?? state.height - GROUND_MARGIN;
    // Visual Theme (Status & Config panel) was only ever stored in state.data —
    // nothing actually drew with it. This is the one place backdrop/ground/
    // obstacle/player colors are drawn, so it's the one place theme can matter.
    const palette = state.data.aesthetic?.palette;
    const bgTop = palette?.surface || '#1a0033';
    const bgBottom = palette?.background || '#0d0221';
    const groundColor = palette?.accent || '#00f0ff';
    const hazardColor = palette?.hazardColor || '#ff2fd0';
    const playerColor = palette?.primary || '#ff2fd0';

    const g = ctx.createLinearGradient(0, 0, 0, state.height); g.addColorStop(0, bgTop); g.addColorStop(1, bgBottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, state.width, state.height);
    ctx.strokeStyle = groundColor; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, gY); ctx.lineTo(state.width, gY); ctx.stroke();
    for (const o of state.entities) { if (o.kind === 'obstacle') { ctx.fillStyle = o.color || hazardColor; ctx.fillRect(o.x, o.y, o.w, o.h); } }
    const p = state.player; if (!p) return;
    ctx.shadowColor = playerColor; ctx.shadowBlur = 18; ctx.fillStyle = playerColor; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.shadowBlur = 0;
  },
};
export default system;
