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
    p.vy += GRAVITY * dt; p.y += p.vy * dt;
    if (p.y >= gY - p.h) { p.y = gY - p.h; p.vy = 0; p.onGround = true; }
    const jump = input.keys.has('Space') || input.keys.has('ArrowUp') || input.keys.has('KeyW') || input.pointer.down;
    if (jump && p.onGround) { p.vy = JUMP_V; p.onGround = false; state.events.push('jump'); }
    state.data.speed = 360 + state.t * 9;
    state.score += state.data.speed * dt * 0.05;
    if (Math.floor(state.score) > state.data.scored) { state.data.scored = Math.floor(state.score); state.events.push('score'); }
    if (Math.random() < 0.02 && state.entities.length < 4) {
      const h = 30 + Math.random() * 26;
      state.entities.push({ id: Math.random().toString(), kind: 'obstacle', x: state.width + 40, y: gY - h, w: 26, h, vx: 0, vy: 0, color: '#ff2fd0' });
    }
    for (let i = state.entities.length - 1; i >= 0; i--) {
      const o = state.entities[i]; if (o.kind !== 'obstacle') continue;
      o.x -= state.data.speed * dt;
      if (o.x + o.w < -40) { state.entities.splice(i, 1); continue; }
      const t = 5;
      if (p.x + t < o.x + o.w - t && p.x + p.w - t > o.x + t && p.y + t < o.y + o.h - t && p.y + p.h - t > o.y + t) {
        state.phase = 'over'; state.events.push('hit'); state.events.push('over');
      }
    }
  },
  render(ctx, state) {
    const gY = state.data.groundY ?? state.height - GROUND_MARGIN;
    const g = ctx.createLinearGradient(0, 0, 0, state.height); g.addColorStop(0, '#1a0033'); g.addColorStop(1, '#0d0221');
    ctx.fillStyle = g; ctx.fillRect(0, 0, state.width, state.height);
    ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, gY); ctx.lineTo(state.width, gY); ctx.stroke();
    for (const o of state.entities) { if (o.kind === 'obstacle') { ctx.fillStyle = o.color || '#ff2fd0'; ctx.fillRect(o.x, o.y, o.w, o.h); } }
    const p = state.player; if (!p) return;
    ctx.shadowColor = '#ff2fd0'; ctx.shadowBlur = 18; ctx.fillStyle = '#ff2fd0'; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.shadowBlur = 0;
  },
};
export default system;
