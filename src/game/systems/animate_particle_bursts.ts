// Implements: SPEC-042 (implicit via feature epic)
// Satisfies: TS-0009
import { GameSystem, GameState, InputState } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface ParticleSystemData {
  particles: Particle[];
  lastScore: number;
}

const NEON_COLORS = [
  '#00ffcc', // neon cyan
  '#ff007f', // neon pink/magenta
  '#ccff00', // neon lime
  '#9d00ff', // electric purple
  '#ffaa00', // neon amber
];

/**
 * System to animate neon-colored geometric particle bursts upon obstacle clearance/scoring events.
 * Satisfies TS-0009 by emitting high-contrast particles and cleanly removing them upon expiry.
 */
const animateParticleBurstsSystem: GameSystem = {
  id: 'animate_particle_bursts',
  order: 50,

  reset(state: GameState) {
    const data: ParticleSystemData = {
      particles: [],
      lastScore: state.score || 0,
    };
    state.data.animateParticleBursts = data;
  },

  update(state: GameState, _input: InputState, dt: number) {
    if (!state.data.animateParticleBursts) {
      state.data.animateParticleBursts = {
        particles: [],
        lastScore: state.score || 0,
      };
    }

    const data: ParticleSystemData = state.data.animateParticleBursts;

    // Detect score increments or 'score' events in state.events
    const scoreChanged = state.score > data.lastScore;
    const scoredViaEvent = state.events.includes('score');

    if (scoreChanged || scoredViaEvent) {
      data.lastScore = state.score;

      // Find Glitch character position or default to near left-center if not found
      let originX = 120;
      let originY = state.height ? state.height / 2 : 200;

      const glitchEntity = state.entities.find(e => e.kind === 'player' || e.kind === 'glitch' || e.kind === 'runner');
      if (glitchEntity) {
        originX = glitchEntity.x + (glitchEntity.w || 40) / 2;
        originY = glitchEntity.y + (glitchEntity.h || 40) / 2;
      }

      // Emit a burst of geometric neon particles (TS-0009)
      const particleCount = 18;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 120 + Math.random() * 220;
        const maxLife = 0.4 + Math.random() * 0.5; // seconds
        
        data.particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 8,
          color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
          alpha: 1.0,
          life: 0,
          maxLife,
        });
      }
    } else {
      // Keep track of score updates even if no event fired immediately
      if (state.score !== data.lastScore) {
        data.lastScore = state.score;
      }
    }

    // Update active particles and remove expired ones (DOM/memory cleanup per TS-0009)
    const activeParticles: Particle[] = [];
    for (const p of data.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // apply light drag/gravity
      p.vy += 150 * dt;
      p.life += dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life < p.maxLife && p.alpha > 0) {
        activeParticles.push(p);
      }
    }
    data.particles = activeParticles;
  },

  render(ctx: CanvasRenderingContext2D, state: GameState) {
    const data: ParticleSystemData | undefined = state.data.animateParticleBursts;
    if (!data || !data.particles || data.particles.length === 0) return;

    ctx.save();
    for (const p of data.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;

      ctx.translate(p.x, p.y);
      // Rotate for geometric/arcade feel
      ctx.rotate(p.life * 5);

      // Draw geometric neon particle (square / diamond / triangle)
      if (p.size > 8) {
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }
    ctx.restore();
  },
};

export default animateParticleBurstsSystem;