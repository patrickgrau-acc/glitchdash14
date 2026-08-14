# GlitchDash14

A high-energy, browser-based endless runner arcade game engineered for educational environments. No downloads, no logins, no telemetry — just press any key and run.

## How to Play

| Input | Action |
|-------|--------|
| **Space / ArrowUp / W / Click / Tap** | Jump |
| **E** | Dodge up |
| **ArrowDown / S** | Dodge down |
| **X / Shift** | Glitch Dash (speed burst + particle trail) |
| **Any key / Click / Tap** | Start run (from Ready) or instant retry (from Game Over) |

### Settings & Toggles

| Key | Action |
|-----|--------|
| **M** | Mute / unmute audio |
| **T** | Cycle visual theme (Neon Arcade, Vaporwave Sunset, High Contrast, Classic Campus) |
| **P** | Cycle deployment profile (Quick Break, Large-Scale Projection, Standard Classroom) |
| **H** | Toggle high-contrast / colorblind-safe accessibility mode |
| **` (backquote)** | Toggle debug/calibration overlay (FPS, speed, obstacle count, phase) |

Live difficulty tuning (speed, obstacle gap, gravity) is available via sliders in the **Status & Config** panel beneath the game canvas.

## Game Mechanics

### Scoring
- Real-time score counter on the HUD updates as you clear obstacles
- Session-best score persisted in browser localStorage
- Final summary screen on collision with instant retry

### Dynamic Difficulty
- Intensity scales automatically based on score thresholds
- Performance fairness monitor throttles spawn rates if FPS drops below 60
- Linear interpolation smoothing prevents jarring difficulty spikes
- Hard cap ensures the game remains beatable

### Collision Detection
- Precise hitbox geometry mapped to visual assets
- Detection executes in under 0.5ms per frame
- Hitbox verification validates overlaps within 16ms of frame transitions

### Game Flow
1. **Ready Phase** — Displays instructions and current high score, awaiting input
2. **Playing Phase** — Active loop with input handling, physics, difficulty scaling, and live scoring at 60 FPS
3. **Over Phase** — Collision triggers screen-shake, meme commentary, final stats, and instant retry

## Tech Stack

- **Framework:** Next.js 14 (App Router, standalone output)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Runtime:** Node.js 20
- **Deployment:** Docker → Google Cloud Run

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Local Development

```bash
npm install
npm run dev
```

The game runs at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t glitchdash14 .
docker run -p 3000:3000 glitchdash14
```

## Domain Routing

The application supports domain-aware landing pages via Next.js middleware:

| Domain | Serves |
|--------|--------|
| `alchemyglitchdash.com` | Alchemy SDLC promotional landing page |
| `glitch-dash.com` | Gaming / community landing page |
| `localhost` / `*.run.app` | Game directly |

All domains point to the same Cloud Run service. Non-root routes are unaffected.

## Project Structure

```
app/                    # Next.js App Router pages
  landing/alchemy/      # Alchemy SDLC landing page
  landing/gaming/       # Gaming community landing page
src/
  game/                 # Game engine (canvas, physics, systems)
  components/           # Reusable UI components
  lib/                  # Utilities (storage, helpers)
config/                 # Navigation and app configuration
public/                 # Static assets (wiki.html, health check)
middleware.ts           # Domain-aware routing
```

## Wiki

A full interactive player's guide is available at `/wiki.html` covering controls, scoring, difficulty scaling, collision systems, visual aesthetics, and pro strategy tips.

## Testing

```bash
npm test
```

Runs the middleware domain-routing test suite verifying hostname-based rewrites resolve correctly.

## License

UNLICENSED — Private project.
