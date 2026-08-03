# Joy Enhancement Specification: One-Button Input Mechanics & Arcade Responsiveness

Feature: Implement simple, responsive one-button input mechanics for desktop and mobile devices (GlitchDash14)
Target Stack: React, TypeScript, Next.js, HTML5 Canvas, Tailwind CSS

---

## 1. Micro-Interaction Specifications (Per Use Case)

### 1.1. Cross-Device Orientation & Start Prompt
- **Trigger Condition:** Game is in the initial `ready` phase (`state.phase === 'ready'`).
- **Visual Design:** A pulsating, high-contrast prompt centered over the canvas overlay. Automatically detects touch capability (`'ontouchstart' in window` or `navigator.maxTouchPoints > 0`).
- **Timing & Easing:** `animate-pulse` coupled with a subtle vertical floating hover (`transition-all duration-300 ease-out`).
- **Code Snippet / Implementation:**
  ```tsx
  // Desktop vs Mobile adaptive prompt component
  export function StartPrompt({ isTouch }: { isTouch: boolean }) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-surface/80 backdrop-blur-md rounded-2xl border border-border shadow-lg animate-bounce-subtle">
        <div className="w-12 h-12 mb-3 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <Icon name={isTouch ? "Smartphone" : "Keyboard"} className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-text tracking-wide">
          {isTouch ? "Tap to Start & Dash" : "Press Space or Click to Start"}
        </h3>
        <p className="text-sm text-text-muted mt-1">
          {isTouch ? "Tap anywhere on screen to leap through glitches" : "Hit SPACEBAR or Click to unleash the Glitch"}
        </p>
      </div>
    );
  }
  ```

### 1.2. Unified Input Mapping to Game Actions (`keydown` & `pointerdown`)
- **Trigger Condition:** User presses Spacebar, clicks mouse, or taps mobile screen.
- **Micro-Interaction:** Immediate tactile audio-visual click response. Button / canvas container scales down slightly (`scale-98`) for 50ms then springs back to 100% with `cubic-bezier(0.34, 1.56, 0.64, 1)` (snappy spring effect).
- **Latency Target:** Zero-perceptible lag (< 1 frame update via `requestAnimationFrame`).

### 1.3. Glitch Animation Constants & Developer Tuning UI
- **Trigger Condition:** Developer or player accesses tuning panel / accessibility settings.
- **Micro-Interaction:** Sliders with smooth tooltip feedback and instant live preview on the character canvas entity (`state.data.glitchIntensity`).
- **Accessibility Safeguard:** Optional "Reduced Motion" toggle that swaps high-frequency chromatic aberration for clean, high-contrast vertical lifts without rapid flashing.

### 1.4. Glitch Dash Animation & Particle Burst
- **Trigger Condition:** Successful single-button input while playing (`state.phase === 'playing'`).
- **Visual Feedback:** 
  - Rapid frame-skipping / RGB color split (chromatic aberration offset vector) lasting 180ms.
  - Spawning of 6-8 glowing neon particle fragments with random velocity vectors (`vx`, `vy`) that fade out over 300ms.
- **Timing & Easing:** Ease-out exponential deceleration (`cubic-bezier(0.16, 1, 0.3, 1)`).

### 1.5. High-Performance Input Event Listeners
- **Trigger Condition:** Event binding on window mount (`window.addEventListener('keydown', ...)` and `canvas.addEventListener('pointerdown', ...)`).
- **Architecture Note:** Input states are recorded in a pre-allocated `InputState` Set structure (`input.keys`, `input.justPressed`) preventing object allocation garbage collection pauses during gameplay.

### 1.6. Garbage-Collection-Free Input-to-Action Logic Path
- **Trigger Condition:** Continuous game loop execution.
- **Implementation Note:** Avoids `new` allocations inside `update(state, input, dt)`. Reuses existing entity vectors and primitive number arithmetic.

### 1.7. Display Sync via `requestAnimationFrame`
- **Trigger Condition:** Active game tick loop.
- **Visual Consistency:** Guaranteed 60 FPS lock synchronizing physics integration and canvas rendering to display VSync.

---

## 2. Celebration Catalog

- **Milestone 1: First Successful Glitch Dash**
  - *Trigger:* Player successfully executes their very first jump/dash in a session.
  - *Celebration Type:* Subtle screen border neon flash (teal-to-purple gradient pulse) + encouraging floating toast notification: *"Nice leap — you're in the flow!"*.
- **Milestone 2: Personal Best Score Broken**
  - *Trigger:* `state.score > state.best` during an active run.
  - *Celebration Type:* Crisp checkmark badge animation in HUD, particle fireworks burst across the canvas top, and celebratory microcopy: *"New personal best! The Glitch is unstoppable."*

---

## 3. Error Message Library

| Error Scenario | Friendly Copy | Recovery Action / Next Step | Visual Treatment |
| :--- | :--- | :--- | :--- |
| **Input Focus Lost** | *"Whoops! The window lost focus while you were escaping the glitch."* | Click anywhere inside the game area to resume instantly. | Floating banner with `AlertCircle` icon and `bg-surface-alt` styling. |
| **LocalStorage Save Failure** | *"Couldn't save your high score locally — private browsing mode might be active."* | Your score is saved for this session! Feel free to keep playing. | Soft warning toast with `Info` icon (`variant="warning"`). |
| **Network / Sync Glitch** | *"Connection hiccup — offline mode engaged. Your local scores are safe!"* | Reconnecting automatically in the background. | Minimalist status badge in top corner (`variant="warning"`). |

---

## 4. Loading State Designs

- **Game Canvas Boot / Asset Initialization:**
  - *Visual Treatment:* Skeleton screen matching the exact dimensions of the 16:9 arcade canvas container (`animate-pulse bg-surface-alt rounded-xl`).
  - *Progress Indicator:* Smooth indeterminate progress bar with gradient glow (`bg-gradient-to-r from-primary to-accent h-1.5 rounded-full`).
  - *Microcopy:* *"Calibrating quantum glitch vectors..."* (Updates every 800ms with playful status messages: *"Aligning pixels..."*, *"Warming up the jump engine..."*).

---

## 5. Empty State Designs

- **Leaderboard / Past Runs Empty State:**
  - *Icon:* `Gamepad2` from `lucide-react` with primary color tint.
  - *Heading:* *"No runs recorded yet"*
  - *Description:* *"Your high-speed escapades will appear here once you complete your first arcade dash."*
  - *Primary Call-to-Action:* `<Button><Icon name="Play" className="w-4 h-4 mr-2" /> Start First Run</Button>`

---

## 6. Microcopy Style Guide

### Tone and Voice Guidelines
- **Voice:** Playful, encouraging, cyberpunk-arcade energetic, yet respectful and accessible.
- **Rule of Thumb:** Acknowledge user effort instantly. Never use sterile system error codes (e.g. avoid *"Error 400: Bad Request"* — use *"Couldn't complete that jump — try again!"*).

### UI Element Copy Reference
- **Start Buttons:** *"Start Arcade Run"*, *"Retry Dash"*, *"Jump Back In"*
- **Settings & Tuning:** *"Glitch Intensity"*, *"Responsive Input Mode"*, *"Reduced Motion Safety"*
- **Success Confirmations:** *"Settings tuned successfully"*, *"High score secured!"*
