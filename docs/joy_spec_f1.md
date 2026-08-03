# Joy Enhancement Specification: Game State, Difficulty Scaling, Collision Detection & Score Tracking (Feature F1)

This specification establishes the joy, micro-interactions, visual feedback, celebratory moments, error recovery states, loading experiences, and microcopy guidelines for **Feature F1** of GlitchDash14 (**Manage game state including real-time difficulty scaling, collision detection, and score tracking**). 

All frontend and backend engineers implementing this feature must adhere to the design patterns and code snippets defined herein to maintain a cohesive Material You / arcade aesthetic with high performance (<16ms per frame interaction budget).

---

## 1. Micro-Interaction Specifications (Per Use Case)

### Use Case 1: Configure Intensity Scaling Curve
* **Trigger:** Player score crosses an intensity threshold (e.g., every 500 points).
* **Animation & Visual Effect:** A subtle HUD pulse and chromatic aberration flash on the score counter border (`animate-pulse` with custom oklch accent flash). The speed lines in the canvas background accelerate smoothly using cubic-bezier easing.
* **CSS / Tailwind Snippet:**
  ```tsx
  // Intensity flash trigger on score container
  <div className="transition-all duration-300 ease-out transform scale-105 border-2 border-accent bg-surface-alt/80 shadow-lg">
    {/* Score counter content */}
  </div>
  ```

### Use Case 2: Monitor Performance for Fairness
* **Trigger:** Frame rate drops below 55 FPS during high-intensity obstacle generation.
* **Animation & Visual Effect:** Smooth throttling indicator in debug/developer HUD (if enabled), automatic difficulty stabilization without jarring stutters, and graceful background particle density reduction.
* **CSS / Tailwind Snippet:**
  ```tsx
  <div className="transition-opacity duration-500 ease-in-out opacity-90 text-warning text-xs font-mono flex items-center gap-1">
    <Icon name="Gauge" className="w-3 h-3 animate-spin" />
    <span>Balancing Frame Rate...</span>
  </div>
  ```

### Use Case 3: Calculate and Display Final Session Results
* **Trigger:** Player collides with an obstacle and triggers the game-over phase.
* **Animation & Visual Effect:** Screen shake (`animate-bounce` variant or custom keyframe shake), followed by a majestic modal slide-up (`translate-y-0 opacity-100`) revealing final score count-up animation and new high score celebration.
* **CSS / Tailwind Snippet:**
  ```tsx
  <div className="transform transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-8 bg-surface border border-border p-6 rounded-xl shadow-2xl">
    {/* Game over card */}
  </div>
  ```

### Use Case 4: Display Live Score during Gameplay
* **Trigger:** Active gameplay tick / obstacle clearance.
* **Animation & Visual Effect:** Monospaced chunky score digits pop with a tiny upward scale bounce (`scale-110` settling back to `scale-100` in 150ms) whenever score increments.
* **CSS / Tailwind Snippet:**
  ```tsx
  <div className="font-mono text-3xl font-extrabold text-primary tracking-wider transition-transform duration-150 transform">
    {score}
  </div>
  ```

### Use Case 5: Apply Smoothing Functions to Difficulty Scaling
* **Trigger:** Continuous interpolation of speed multiplier and spawn gaps.
* **Animation & Visual Effect:** Zero visual jitter; lerp-based easing (`lerp(current, target, 0.05}`) applied to all environmental speed properties so speed shifts feel like acceleration rather than teleportation.

### Use Case 6: Configure Global Difficulty Constants
* **Trigger:** Initialization / settings adjustment.
* **Animation & Visual Effect:** Immediate reactive recalculation of bounding box constants without UI freeze.

### Use Case 7: Monitor Player Performance for Difficulty Scaling
* **Trigger:** Survival timer milestone or obstacle segment completion.
* **Animation & Visual Effect:** Subtle tier rank badge pop in the HUD (e.g., "SPEED: 2.5X") with a soft teal glow (`shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]`).

### Use Case 8 & 10: Configure Precise Hitboxes & Validate Collisions
* **Trigger:** Character-obstacle bounding box overlap intersection.
* **Animation & Visual Effect:** Instantaneous collision frame registration (<16ms), particle burst effect at point of impact, and momentary freeze-frame flash (100ms) on the Glitch character sprite.

### Use Case 9: Optimize Collision Detection Processing
* **Trigger:** Spatial partitioning / active entity iteration.
* **Animation & Visual Effect:** Seamless 60 FPS maintenance with zero DOM layout thrashing (canvas-based rendering).

---

## 2. Celebration Catalog

Celebrations in GlitchDash14 are earned through major milestones and personal bests:

* **Milestone 1: New Session Personal Best (HighScore)**
  * **Trigger:** Final score exceeds the previous `best` stored in `localStorage`.
  * **Celebration Type:** Confetti burst (canvas particle effect) + celebratory banner: *"New High Score! You're breaking the simulation!"*
  * **Visual Tone:** High-energy, vibrant oklch purple and teal particle explosion with zero jank (<2KB bundle addition, canvas-native).

* **Milestone 2: Difficulty Hard Cap Reached (Max Intensity)**
  * **Trigger:** Player survives past maximum difficulty threshold (e.g., 5,000+ points).
  * **Celebration Type:** Cybernetic screen border glow pulse ("SYSTEM OVERDRIVE") and sound effect trigger.

---

## 3. Error Message Library

When unexpected states occur (e.g., localStorage read failure, asset load hiccup, or API sync lag), error messages must be friendly, encouraging, and actionable.

| Error Scenario | Friendly Copy | Recovery Action / Next Step | Visual Treatment |
| :--- | :--- | :--- | :--- |
| **LocalStorage Quota / Read Error** | *"Couldn't save your high score locally — private browsing mode might be active."* | *"Your run was epic anyway! Scores will reset when you close the tab."* | Toast banner (`variant="warning"`, Icon: `AlertTriangle`) |
| **Canvas Context Init Failure** | *"Glitch encountered a graphic hiccup loading the arcade screen."* | *"Give it a quick refresh and jump right back in."* | Inline card with `EmptyState` component (Icon: `MonitorOff`, Primary Action: "Reload Arcade") |
| **Network Sync Lag (Score submission)** | *"Score saved locally! Cloud sync is taking a breather."* | *"No worries — your session best is safe on this device."* | Subtle badge notification (`variant="info"`, Icon: `CloudOff`) |

---

## 4. Loading State Designs

* **Arcade Loading State:**
  * Avoid generic spinners. Use a retro-futuristic loading skeleton that mirrors the arcade layout: a pulsating canvas placeholder skeleton with animated shimmer lines (`animate-pulse bg-surface-alt rounded-xl h-[480px] w-full`).
  * Microcopy: *"Booting GlitchOS v1.4... warming up the neon circuits..."*

---

## 5. Empty State Designs

* **First-Time Arcade Landing Page (No prior runs recorded):**
  * **Icon:** `Gamepad2` (lucide-react)
  * **Heading:** *"No Runs Recorded Yet!"*
  * **Description:** *"The digital void is waiting for your first high score. Hit start and dodge those glitches!"*
  * **Primary Action Button:** *"Launch Arcade Session"* (`variant="primary"`, Icon: `Play`)

---

## 6. Microcopy Style Guide

* **Voice & Tone:** Irreverent, encouraging, meme-aware, energetic, and developer-respectful. Never robotic ("Error 500: Database failure").
* **Button Labels:**
  * Primary Start: `"Start Arcade Run"` / `"Try Again"` / `"Resume Overdrive"`
  * Settings: `"Tune Difficulty"` / `"View Leaderboard"`
* **Tooltips & Hints:**
  * `"Spacebar or tap to jump. Dodge obstacles to scale the intensity!"`
  * `"Difficulty increases every 500 points. Watch your spacing!"`
* **Success Messages (Toasts):**
  * `"Nice work — high score updated to 4,250!"`
  * `"Intensity curve calibrated successfully."`
