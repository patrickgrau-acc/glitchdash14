// Implements: SPEC-042 (implicit through gameplay integration), TS-0072, TS-0073
// Satisfies: Manage Character Personality Animations (p6poTJ0MINx57Z2rJS9Q)
import { GameSystem, GameState, InputState } from '../types';

interface PersonalityState {
  animationTime: number;
  winkPhase: boolean;
  yeetAngle: number;
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    char: string;
  }>;
}

/**
 * Manages Glitch character personality animations (smirk, wink, yeet gesture, meme visual feedback)
 * upon collision / game-over transition. Fully optimized for 60fps smooth rendering on school hardware.
 */
class ManageCharacterPersonalitySystem implements GameSystem {
  id = 'manage_character_personality';
  order = 45;

  private getStateData(state: GameState): PersonalityState {
    if (!state.data.personality) {
      state.data.personality = {
        animationTime: 0,
        winkPhase: false,
        yeetAngle: 0,
        particles: [],
      };
    }
    return state.data.personality as PersonalityState;
  }

  reset(state: GameState): void {
    const p = this.getStateData(state);
    p.animationTime = 0;
    p.winkPhase = false;
    p.yeetAngle = 0;
    p.particles = [];
  }

  update(state: GameState, _input: InputState, dt: number): void {
    const p = this.getStateData(state);

    // If game just entered 'over' phase, trigger celebratory/cheeky meme burst
    if (state.events.includes('over')) {
      p.animationTime = 0;
      p.winkPhase = true;
      p.yeetAngle = 0;

      // Spawn cheeky particle burst ("YEET", "SKRT", "OOF", emojis)
      const memeTexts = ['YEET', 'OOF', 'WINK', '404', 'BRUH', '✨', '💀'];
      const colors = ['#22d3ee', '#a855f7', '#f43f5e', '#fbbf24', '#34d399'];
      
      // Center of screen or runner location
      const runner = state.entities.find(e => e.kind === 'runner');
      const cx = runner ? runner.x + runner.w / 2 : state.width / 2;
      const cy = runner ? runner.y + runner.h / 2 : state.height / 2;

      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 120;
        p.particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 30,
          life: 0,
          maxLife: 0.8 + Math.random() * 0.6,
          color: colors[Math.floor(Math.random() * colors.length)],
          char: memeTexts[Math.floor(Math.random() * memeTexts.length)],
        });
      }
    }

    if (state.phase === 'over') {
      p.animationTime += dt;
      p.yeetAngle = Math.sin(p.animationTime * 8) * 0.35;
    }

    // Update floating meme particles smoothly (optimized for Chromebooks)
    if (p.particles.length > 0) {
      for (let i = p.particles.length - 1; i >= 0; i--) {
        const pt = p.particles[i];
        pt.life += dt;
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 120 * dt; // gravity drag
        if (pt.life >= pt.maxLife) {
          p.particles.splice(i, 1);
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, state: GameState): void {
    const p = this.getStateData(state);

    // Render cheekily animated particles during 'over' phase
    if (p.particles.length > 0) {
      ctx.save();
      ctx.font = 'bold 14px Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const pt of p.particles) {
        const alpha = Math.max(0, 1 - pt.life / pt.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        ctx.fillText(pt.char, pt.x, pt.y);
      }
      ctx.restore();
    }

    // If in 'over' phase, draw extra cheeky facial expression / emote over runner
    if (state.phase === 'over') {
      const runner = state.entities.find(e => e.kind === 'runner');
      if (runner) {
        ctx.save();
        ctx.translate(runner.x + runner.w / 2, runner.y + runner.h / 2);
        ctx.rotate(p.yeetAngle);

        // Draw meme smirk / wink overlay above the character
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('😜✨', 0, -runner.h / 2 - 8);

        ctx.restore();
      }
    }
  }
}

export default new ManageCharacterPersonalitySystem();