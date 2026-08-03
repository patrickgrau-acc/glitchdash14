# Joy Enhancement Specification: Feature F4
**Feature:** Deliver a self-contained, client-side application requiring no login, data collection, or external dependencies.
**Target Audience:** GlitchDash14 Arcade Players & Developers
**Design Language:** Material Design 3 (Google Material You) with High-Energy Arcade Persona
**Output File:** `docs/joy_spec_f4.md`

---

## 1. Micro-Interaction Specifications

Every interactive element in the zero-dependency arcade engine and high-score manager must feature tactile feedback adhering strictly to the <16ms interaction budget and CSS keyframe implementation standards.

### 1.1 Arcade Start & Retry Buttons (`ready` & `over` phases)
- **Trigger Condition:** Hover, focus, and pointer down on "Start Game", "Retry", or "Play Again" CTA buttons.
- **Animation Type:** Smooth elevation lift and tactile scale bounce using Tailwind transitions (`transition-transform transition-colors duration-150 ease-out`).
- **Timing & Easing:** 150ms cubic-bezier(0.34, 1.56, 0.64, 1) (spring-like overshoot on release).
- **Code Snippet / Utility:**
  ```tsx
  <button className="relative px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-150 ease-out focus:outline-none focus:ring-4 focus:ring-primary/40">
    <span className="flex items-center gap-2">
      <Icon name="Gamepad2" className="w-5 h-5 animate-pulse" />
      Press Space / Tap to Jump
    </span>
  </button>
  ```

### 1.2 High Score Milestone Pop (`Update Persistent High Score`)
- **Trigger Condition:** Final score in `GameState` (`state.score`) exceeds the loaded `localStorage` high score during game-over calculation.
- **Animation Type:** Pulsing gold/teal highlight with a celebratory scale burst (`animate-bounce` or custom keyframe `score-burst`).
- **Timing & Easing:** 600ms ease-out sequence.
- **Code Snippet / Utility:**
  ```css
  @keyframes scoreBurst {
    0% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.15); filter: brightness(1.3); color: var(--color-accent); }
    100% { transform: scale(1); filter: brightness(1); }
  }
  .animate-score-burst {
    animation: scoreBurst 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  ```

### 1.3 Canvas Obstacle Collision & Glitch Effect (`playing` phase)
- **Trigger Condition:** Bounding box intersection between runner and obstacle entity.
- **Animation Type:** Canvas screen shake coupled with chromatic aberration / scanline flash in CSS overlay.
- **Timing & Easing:** 300ms rapid jitter (`animate-shake`).

---

## 2. Celebration Catalog

Because GlitchDash14 operates entirely client-side without network roundtrips, celebrations are instant, deeply rewarding, and locally persistent.

### 2.1 New Personal Best (High Score Record Broken)
- **Trigger:** `score > best` upon entering game-over (`phase === 'over'`).
- **Celebration Type:** 
  - Confetti burst simulation directly over the canvas UI overlay (using lightweight CSS particle keyframes or canvas particle emitter).
  - Sound/Visual resonance: Glowing neon badge reading `NEW RECORD! 🏆`.
- **Microcopy:** `"Legendary run! You shattered your previous best by X points."`

### 2.2 Century Milestone (Score Reaches 100, 200, 500...)
- **Trigger:** Score crosses a multiple of 100 during active gameplay.
- **Celebration Type:** Brief flash across the HUD score counter (`text-accent scale-110`).
- **Microcopy:** `"Century mark reached! Difficulty scaling engaged ⚡"`

---

## 3. Error State Design & Friendly Recovery

Even in a zero-dependency local application, edge cases like corrupted `localStorage` JSON or quota-exceeded exceptions can occur. Error states must be transparent, non-blocking, and friendly.

### 3.1 LocalStorage Read/Parse Failure (Corrupted Data)
- **Trigger Condition:** `localStorage.getItem('highScore')` throws a JSON parse error or type mismatch.
- **Friendly Copy:** `"Couldn't load your saved high score — we've reset the leaderboard safely so you can set a fresh record!"`
- **Recovery Action:** Automatically fallback to `0`, overwrite corrupted storage gracefully with `0`, and present a dismissible banner using `useToast()`.
- **Visual Treatment:** Soft warning card (`bg-warning/10 border-warning text-warning`) with an `AlertTriangle` lucide icon.

### 3.2 Storage Quota Exceeded (Private Browsing / Full Disk)
- **Trigger Condition:** `localStorage.setItem()` throws `QuotaExceededError`.
- **Friendly Copy:** `"High score couldn't be saved locally (storage is restricted in private browsing). Your current session score is safe while this tab is open!"`
- **Recovery Action:** Inform the user with an amber toast (`useToast({ title: 'Storage Restricted', description: '...', variant: 'warning' })`) and maintain gameplay continuity without crashing.

---

## 4. Loading Experiences & Zero-Latency Initialization

The arcade engine is designed for instant launch. No spinners are needed for core gameplay, but configuration loading and font/asset bootstrapping use precise skeleton and pulse states.

### 4.1 Arcade Shell Initializer
- **State:** Instant synchronous mount from `localStorage`.
- **Skeleton Structure:** Pre-rendered canvas container with a sleek Material You surface placeholder (`bg-surface-alt animate-pulse rounded-2xl`) while the requestAnimationFrame game loop hooks up.
- **Microcopy:** `"Booting GlitchDash14 Arcade Engine..."` (subtle subtitle below canvas frame during initial 100ms mount).

---

## 5. Empty States & First-Time Onboarding

When a player opens GlitchDash14 for the very first time, the empty state must immediately invite play without clutter.

### 5.1 First-Time High Score Empty State (`highScore === 0`)
- **Icon:** `Gamepad2` or `Trophy` (Lucide React).
- **Heading:** `"No High Score Yet — Time to Glitch!"`
- **Description:** `"Press Spacebar, click, or tap anywhere to launch the runner. Dodge obstacles, survive the intensity scaling, and claim the crown."`
- **Call-to-Action:** High-emphasis primary button: `"Start First Run"` with a keyboard badge `[Space / Tap]`.

---

## 6. Microcopy Style Guide & Voice

The voice of GlitchDash14 is **high-energy, encouraging, slightly cyberpunk/arcade-retro, and relentlessly positive**.

### 6.1 Button Labels & Tooltips
| UI Element | Canonical Copy | Tone / Context |
| :--- | :--- | :--- |
| **Start Button** | `"Launch Arcade Run"` | Action-oriented, energetic |
| **Retry Button** | `"Try Again — One More Run!"` | Encouraging after failure |
| **Pause Button** | `"Pause Session"` | Clear & functional |
| **Config Panel** | `"Arcade Tuning Parameters"` | Developer / Power-user toggle |
| **High Score HUD** | `"BEST: {score}"` | Crisp, high-contrast digital retro |

### 6.2 Status & Notification Templates
- **Success (New High Score):** `toast({ title: 'New Personal Best! 🌟', description: 'You scored {score}. Absolute arcade royalty.', variant: 'success' })`
- **Info (Game Over):** `toast({ title: 'Run Concluded', description: 'Score: {score} | Best: {best}. Ready for redemption?', variant: 'info' })`
- **Warning (Local Storage Fallback):** `toast({ title: 'Fresh Slate', description: 'Starting fresh with a high score of 0.', variant: 'warning' })`
