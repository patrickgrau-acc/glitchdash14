# Task 77: Generate a self-contained HTML wiki (player's guide) for GlitchDash14. This is an INTERACTIVE CANVAS GAME — a single ...

## Functional Scope Addressed

Generate a self-contained HTML wiki (player's guide) for GlitchDash14. This is an INTERACTIVE CANVAS GAME — a single <canvas> experience mounted at '/', NOT a page/dashboard app. Document how to PLAY, from the player's perspective. The wiki MUST ship with the app's frontend (served at /wiki.html), not hidden in docs/.

GAME:
A self-contained, browser-based endless runner arcade game engineered specifically for educational environments. Operating entirely client-side with a zero-dependency architecture, the platform ensures immediate, safe, and frictionless access for students on constrained devices like Chromebooks. It delivers a high-energy, meme-inspired gaming experience without requiring logins, telemetry collection, or external network connectivity, emphasizing quick replayability, dynamic difficulty scaling, and a school-safe sensory environment.

GAMEPLAY MECHANICS (each "feature/use case" below is a gameplay capability, not a page):

### Manage game state including real-time difficulty scaling, collision detection, and score tracking.
  **Configure Intensity Scaling Curve**
    Description: Establish a programmatic controller (`src/game/systems/configure_intensity_scaling_curve.ts`) that manages the relationship between player score and game intensity, specifically controlling obstacle spawn frequency and global game speed multipliers.
    Epic: Automated Intensity Management
    Acceptance: Given a player has reached a new score threshold, when the intensity controller checks the current DifficultyCurve, then the system must update the global speed multiplier according to the defined progression.
  **Monitor Performance for Fairness**
    Description: Implement a safety monitor (`src/game/systems/monitor_performance_for_fairness.ts`) that ensures intensity scaling does not exceed hardware capabilities, specifically preventing frame rate drops that could be perceived as unfair difficulty spikes on low-end school hardware.
    Epic: Automated Intensity Management
    Acceptance: Given the intensity scaling is active, when the system detects a drop below 60 FPS, then the monitor must throttle or stabilize the spawn rate to prevent further stuttering.
  **Calculate and Display Final Session Results**
    Description: Calculate the player's final score upon collision (`src/game/systems/calculate_display_final_session.ts`) and present both the current final score and the session-best score to the player on the game-over screen.
    Epic: Comprehensive Score Tracking
    Acceptance: Given the player has collided with an obstacle, when the game-over state is triggered, then the system must display the final session score and the current best score.
  **Display Live Score during Gameplay**
    Description: Provide a real-time, high-contrast score counter (`src/game/systems/display_live_score_during_gameplay.ts`) for the player during the active gameplay session to track their performance progress efficiently.
    Epic: Comprehensive Score Tracking
    Acceptance: Given the game is in an active state, when the player clears an obstacle or progresses in time, then the score counter must update instantly on the screen.
  **Apply Smoothing Functions to Difficulty Scaling**
    Description: Control the rate of difficulty progression using smoothing functions (`src/game/systems/apply_smoothing_functions.ts`) to ensure transitions feel gradual and avoid jarring spikes.
    Epic: Dynamic Difficulty Scaling Engine
    Acceptance: Given the current difficulty level, when the engine calculates a new intensity value, then it must apply a linear interpolation or curve to prevent sudden jumps.
  **Configure Global Difficulty Constants**
    Description: Manage the foundational difficulty parameters (`src/game/systems/configure_global_difficulty.ts`) as tunable constants at the top of the codebase to allow for efficient balance updates.
    Epic: Dynamic Difficulty Scaling Engine
    Acceptance: Given the codebase is accessed, when a developer updates a constant (such as speedMultiplier), then the game must immediately utilize this new value for subsequent calculations.
  **Monitor Player Performance for Difficulty Scaling**
    Description: Identify and track player survival metrics in real-time (`src/game/systems/monitor_player_performance.ts`) to determine when to adjust the intensity of the game environment.
    Epic: Dynamic Difficulty Scaling Engine
    Acceptance: Given the game is in an active session, when the player survives for a set duration, then the engine must update the internal difficulty score.
  **Configure Precise Collision Hitbox Geometry**
    Description: Set and manage the dimensions of character and obstacle hitboxes (`src/game/systems/configure_precise_collision_hitbox.ts`) to align with visual assets, providing a fair and responsive gameplay environment.
    Epic: Precise Collision Detection System
    Acceptance: Given the environmental art assets, when the game initializes, then the system must store the calculated hitbox boundaries for each object class.
  **Optimize Collision Detection Processing**
    Description: Perform efficient collision checks (`src/game/systems/optimize_collision_detection.ts`) to ensure that the detection logic does not introduce input lag or performance drops during high-intensity gameplay.
    Epic: Precise Collision Detection System
    Acceptance: Given the game is running at 60 frames per second, when the engine calculates physics, then the collision system must complete all detection tasks in under 0.5ms per frame.
  **Validate Character-Obstacle Hitbox Collisions**
    Description: Design and implement a collision detection mechanism (`src/game/systems/validate_character_obstacle_hitbox.ts`) that verifies when the Glitch character overlaps with an environmental object, ensuring precise hitbox registration.
    Epic: Precise Collision Detection System
    Acceptance: Given the Glitch character is in motion, when the character's hitbox intersects with an environmental obstacle's hitbox, then the system must detect a collision event within 16ms of the frame transition.

### Develop a single-page, browser-based endless runner arcade game featuring the 'Glitch' character.
  **Animate Particle Bursts**
    Description: Generate dynamic particle effects (`src/game/systems/animate_particle_bursts.ts`) during scoring events to visually enhance the feeling of progress.
    Epic: Aesthetic and Audio Experience
    Acceptance: Given a player successfully passes an obstacle, when the score increment is triggered, then a burst of high-contrast, neon-colored particles is emitted at the point of action.
  **Configure Audio Mute Toggle**
    Description: Provide a persistent mute toggle interface (`src/game/systems/configure_audio_mute_toggle.ts`) to allow players to silence arcade-style sound effects during classroom use.
    Epic: Aesthetic and Audio Experience
    Acceptance: Given the game is active, when the player clicks the mute toggle button, then the game audio is suppressed immediately.
  **Implement Screen Shake Feedback**
    Description: Design and integrate a screen-shake visual effect triggered upon character collision with obstacles to heighten the sense of impact.
    Epic: Aesthetic and Audio Experience
  **Construct Self-Contained Deployment Package**
    Description: Develop the base architecture to ensure the entire game logic, styling, and assets are contained within a single file or unified bundle to facilitate zero-friction, client-side browser execution.
    Epic: Browser-Based Deployment Architecture
  **Manage session progress**
    Description: Progress the game session by continuously updating the environment and tracking survival duration.
    Epic: Core Gameplay Loop and Progression
  **Start initial gameplay session**
    Description: Trigger the start of an endless runner session upon receiving the first user input.
    Epic: Core Gameplay Loop and Progression
  **Configure Game Balance Constants**
    Description: Establish a centralized configuration block in the source code to manage game balance parameters.
    Epic: Game Configuration and Balance
  **Implement Debug Mode for Real-Time Calibration**
    Description: Integrate a 'debug mode' flag that allows developers to monitor live game variables.
    Epic: Game Configuration and Balance
  **Configure Input Mapping**
    Description: Configure the game to map physical input events from desktop and mobile devices into a unified game action.
    Epic: Input and Control Responsiveness
  **Enable Vertical Dodge Input**
    Description: Support optional vertical dodge controls for enhanced character movement in the environment.
    Epic: Input and Control Responsiveness

### Configure game parameters for easy adjustments to difficulty, assets, and styling.
  **Configure Game Parameters Live**
    Description: Provide an in-game overlay allowing real-time adjustment of difficulty variables.
    Epic: In-Game Live Configuration Interface
  **Modify Visual Aesthetic Settings**
    Description: Enable users to toggle or select color palettes through the live configuration interface.
    Epic: In-Game Live Configuration Interface

### Deliver a self-contained, client-side application requiring no login, data collection, or external dependencies.
  **Retrieve Local High Score**
    Description: Retrieve the stored high score from browser local storage upon game initialization.
    Epic: Local Session Progress Management
  **Update Persistent High Score**
    Description: Update the locally stored high score whenever a completed game run results in a higher score.
    Epic: Local Session Progress Management
  **Configure Application Parameters for Zero-Dependency Operation**
    Description: Establish a centralized configuration structure within the codebase.
    Epic: Zero-Dependency Core Application Architecture
  **Initialize Self-Contained Runtime Environment**
    Description: Construct the single-file application architecture that includes all necessary logic.
    Epic: Zero-Dependency Core Application Architecture

### Provide a frictionless instant-retry mechanic to support rapid gameplay sessions.
  **Enable Instant Gameplay Restart**
    Description: Provide a mechanism to transition from the Game Over state back to active gameplay without full page refresh.
    Epic: Instant Gameplay Reset
  **Present Session Summary upon Gameplay Termination**
    Description: Present a final summary screen immediately following a collision.
    Epic: Instant Gameplay Reset
  **Allocate Assets to Memory**
    Description: Initialize and store all game assets into memory during initial load.
    Epic: Performance-Optimized Asset Management
  **Configure Object Pooling for Obstacles**
    Description: Implement an object pool to manage obstacle instances.
    Epic: Performance-Optimized Asset Management
  **Manage Engine State Reset**
    Description: Reset core game engine variables on retry.
    Epic: Performance-Optimized Asset Management
  **Bypass Death Animation**
    Description: Design a logic interrupt that allows immediate termination of death animation.
    Epic: Persistent Pre-Session Configuration Dashboard
  **Configure Feedback Sequence Duration**
    Description: Configure timing constants controlling death animation duration.
    Epic: Persistent Pre-Session Configuration Dashboard
  **Flush Execution Context**
    Description: Manage lifecycle of event listeners and background timers.
    Epic: Stateful Engine Re-initialization
  **Reset Gameplay State Container**
    Description: Construct an engine-level reset function.
    Epic: Stateful Engine Re-initialization
  **Configure Input Listener for Session Restart**
    Description: Configure global input listener during Game Over state.
    Epic: Streamlined Input Interaction

### Design a high-energy, meme-inspired visual and auditory environment suitable for a school setting.
  **Display Irreverent Game-Over Messages**
    Description: Display cheeky, meme-inspired text on collision.
    Epic: Irreverent Content and Interaction Engine
  **Manage Character Personality Animations**
    Description: Implement character-specific animations.
    Epic: Irreverent Content and Interaction Engine
  **Design Neon Vaporwave Interface Elements**
    Description: Design high-contrast, neon-saturated UI components.
    Epic: Meme-Inspired Visual and Accessibility Design
  **Validate Accessibility for Visual Elements**
    Description: Ensure visual interface conveys critical game state without relying solely on color.
    Epic: Meme-Inspired Visual and Accessibility Design
  **Configure Multi-Modal Deployment Environment**
    Description: Prepare system parameters for different school settings.
    Epic: Multi-Modal Gameplay Deployment
  **Validate Multi-Platform Performance**
    Description: Test responsiveness across diverse school hardware.
    Epic: Multi-Modal Gameplay Deployment
  **Generate High-Energy Audio Feedback**
    Description: Deliver distinct audio cues for core gameplay moments.
    Epic: Punchy Arcade Auditory Experience
  **Manage Game Audio Controls**
    Description: Provide persistent mute toggle.
    Epic: Punchy Arcade Auditory Experience

### Implement simple, responsive one-button input mechanics for desktop and mobile devices.
  **Display Input Prompt for Cross-Device Orientation**
    Description: Present cross-device orientation prompts.
    Epic: Cross-Platform Input Integration
  **Map Unified Input Events to Game Actions**
    Description: Capture diverse hardware events and map to unified actions.
    Epic: Cross-Platform Input Integration
  **Configure Glitch Animation Constants**
    Description: Provide centralized configuration for animation timing.
    Epic: Glitch-Themed Movement Mechanics
  **Perform Glitch Dash Animation**
    Description: Trigger visual Glitch Dash effect.
    Epic: Glitch-Themed Movement Mechanics
  **Implement High-Performance Input Event Listeners**
    Description: Configure efficient event listeners for interactions.
    Epic: Responsive Input Latency Optimization
  **Optimize Input-to-Action Logic Path**
    Description: Streamline processing paths between input capture and state modification.
    Epic: Responsive Input Latency Optimization
  **Sync Game Updates with Display Refresh**
    Description: Utilize requestAnimationFrame for state updates.
    Epic: Responsive Input Latency Optimization

Tech stack: React, TypeScript, Next.js, LocalStorage, HTML5 Canvas

READ THE ACTUAL GAME IMPLEMENTATION (use read_github_file) — do NOT invent controls or features:
- src/game/GameCanvas.tsx — the canvas host + HUD (score/best), the Start/Retry flow, and how keyboard/pointer/touch input is wired.
- src/game/systems/base_player.ts — the CORE LOOP for this genre: the real controls, the objective, how score accrues, the win/lose (game-over) condition, and the events it emits (e.g. 'jump' | 'score' | 'hit' | 'over').
- src/game/systems/*.ts — every other file is ONE gameplay mechanic (`configure_intensity_scaling_curve.ts`, `monitor_performance_for_fairness.ts`, `calculate_display_final_session.ts`, `display_live_score_during_gameplay.ts`, `apply_smoothing_functions.ts`, `configure_global_difficulty.ts`, `monitor_player_performance.ts`, `configure_precise_collision_hitbox.ts`, `optimize_collision_detection.ts`, `validate_character_obstacle_hitbox.ts`, `animate_particle_bursts.ts`, `configure_audio_mute_toggle.ts`, ...). Describe each as something the PLAYER experiences.
- src/game/control.ts — the phases/modes the game moves through (e.g. ready → playing → over, plus any special mode like a boss phase).
- docs/github_context_index.json — the feature list, for completeness.
- `route_map.json` — route definitions.

OUTPUT — A SINGLE SELF-CONTAINED HTML FILE:
Create public/wiki.html — one self-contained HTML page, ALL CSS inline, no external dependencies, no frameworks.

The page MUST include:
1. A hero header with the game name and a one-line hook.
2. "How to Play in 30 Seconds" quick-start at the very top.
3. A CONTROLS section listing the REAL inputs read from the code (`src/game/GameCanvas.tsx`, `src/game/systems/base_player.ts`).
4. An OBJECTIVE & SCORING section.
5. One GAMEPLAY section per mechanic.
6. A GAME FLOW / MODES section describing phases from `src/game/control.ts`.
7. TIPS & STRATEGY.
8. A sticky table-of-contents.
9. A search/filter input.
10. Responsive layout, dark toggle, print styles.

INTEGRATION:
- Served at /wiki.html automatically (public/).
- Include a prominent "Return to Game" link pointing to "/".

CRITICAL RULES:
- Write for PLAYERS, not developers.
- Single self-contained file (public/wiki.html).

## Files (1)

**Other**
- `public/wiki.html`

## Result

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GlitchDash14 — Official Player's Guide & Wiki</title>
  <style>
    :root {
      --bg: #0d0221;
      --bg-panel: rgba(25, 8, 48, 0.85);
      --bg-code: #160733;
      --text: #f0edff;
      --text-muted: #b79ce0;
      --accent-pink: #ff2fd0;
      --accent-cyan: #00f0ff;
      --accent-yellow: #fefe33;
      --border: rgba(255, 47, 208, 0.25);
      --shadow: 0 0 25px rgba(255, 47, 208, 0.2);
    }

    [data-theme="light"] {
      --bg: #f5f2ff;
      --bg-panel: rgba(255, 255, 255, 0.9);
      --bg-code: #ebe5ff;
      --text: #1a0b2e;
      --text-muted: #5e4685;
      --accent-pink: #d900a0;
      --accent-cyan: #0077cc;
      --accent-yellow: #997700;
      --border: rgba(217, 0, 160, 0.25);
      --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      line-height: 1.6;
      padding: 0;
      margin: 0;
      transition: background 0.3s, color 0.3s;
    }

    .top-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg-panel);
      backdrop-filter: blur(10px);
      border-bottom: 2px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
    }

    .top-bar a, .top-bar button {
      background: none;
      border: 1px solid var(--accent-cyan);
      color: var(--accent-cyan);
      padding: 6px 14px;
      border-radius: 6px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      letter-spacing: 1px;
      transition: all 0.2s;
    }

    .top-bar a:hover, .top-bar button:hover {
      background: var(--accent-cyan);
      color: var(--bg);
      box-shadow: 0 0 12px var(--accent-cyan);
    }

    .top-bar .return-btn {
      border-color: var(--accent-pink);
      color: var(--accent-pink);
    }
    .top-bar .return-btn:hover {
      background: var(--accent-pink);
      color: var(--bg);
      box-shadow: 0 0 12px var(--accent-pink);
    }

    header.hero {
      text-align: center;
      padding: 60px 20px 40px;
      background: radial-gradient(circle at 50% 20%, rgba(42, 10, 74, 0.8) 0%, transparent 70%);
      border-bottom: 1px dashed var(--border);
    }

    header.hero h1 {
      font-size: clamp(2rem, 5vw, 4rem);
      letter-spacing: 8px;
      color: var(--text);
      text-shadow: 0 0 15px var(--accent-pink), 0 0 30px var(--accent-cyan);
      margin-bottom: 12px;
    }

    header.hero p {
      font-size: clamp(0.9rem, 2vw, 1.2rem);
      color: var(--text-muted);
      letter-spacing: 2px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 32px;
      padding: 32px 20px;
    }

    @media (max-width: 860px) {
      .container {
        grid-template-columns: 1fr;
      }
      aside.toc {
        position: static !important;
      }
    }

    aside.toc {
      position: sticky;
      top: 80px;
      height: calc(100vh - 100px);
      overflow-y: auto;
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      box-shadow: var(--shadow);
    }

    aside.toc h3 {
      font-size: 14px;
      letter-spacing: 2px;
      color: var(--accent-pink);
      margin-bottom: 14px;
      text-transform: uppercase;
    }

    .search-box {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: inherit;
      font-size: 13px;
      margin-bottom: 16px;
      outline: none;
    }
    .search-box:focus {
      border-color: var(--accent-cyan);
      box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
    }

    aside.toc ul {
      list-style: none;
    }

    aside.toc li {
      margin-bottom: 8px;
    }

    aside.toc a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 13px;
      display: block;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    aside.toc a:hover {
      color: var(--accent-cyan);
      background: rgba(0, 240, 255, 0.08);
      padding-left: 12px;
    }

    main.content {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    section.card {
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
      box-shadow: var(--shadow);
    }

    section.card h2 {
      font-size: 1.5rem;
      letter-spacing: 3px;
      color: var(--accent-cyan);
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
    }

    section.card h3 {
      font-size: 1.1rem;
      letter-spacing: 2px;
      color: var(--accent-pink);
      margin: 20px 0 10px 0;
    }

    section.card p, section.card li {
      color: var(--text);
      margin-bottom: 12px;
      font-size: 14px;
    }

    section.card ul {
      padding-left: 20px;
    }

    .quick-start {
      background: linear-gradient(135deg, rgba(255,47,208,0.1), rgba(0,240,255,0.1));
      border: 2px solid var(--accent-pink);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 16px;
    }

    .quick-start h2 {
      color: var(--accent-pink) !important;
      border-bottom: none !important;
      padding-bottom: 0 !important;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13px;
    }

    th, td {
      border: 1px solid var(--border);
      padding: 10px 14px;
      text-align: left;
    }

    th {
      background: var(--bg-code);
      color: var(--accent-cyan);
      letter-spacing: 1px;
    }

    td {
      background: var(--bg-panel);
    }

    kbd {
      background: var(--bg-code);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px 6px;
      font-family: inherit;
      color: var(--accent-yellow);
      font-weight: bold;
    }

    @media print {
      body { background: #fff !important; color: #000 !important; }
      .top-bar, aside.toc { display: none !important; }
      .container { display: block !important; }
      section.card { border: 1px solid #ccc !important; box-shadow: none !important; background: #fff !important; margin-bottom: 20px; }
      header.hero { background: none !important; padding: 20px 0 !important; }
      header.hero h1 { text-shadow: none !important; color: #000 !important; }
      a { color: #000 !important; text-decoration: underline !important; }
    }
  </style>
</head>
<body data-theme="dark">

  <div class="top-bar">
    <a class="return-btn" href="/">← Return to Game</a>
    <div style="display: flex; gap: 12px; align-items: center;">
      <span style="font-size: 12px; color: var(--text-muted);">GLITCHDASH14 WIKI</span>
      <button id="themeToggle" onclick="toggleTheme()">☀️ / 🌙</button>
    </div>
  </div>

  <header class="hero">
    <h1>GLITCHDASH14</h1>
    <p>Official Player's Guide & Interactive Mechanics Wiki</p>
  </header>

  <div class="container">

    <aside class="toc">
      <h3>Quick Index</h3>
      <input type="text" id="searchFilter" class="search-box" placeholder="Filter wiki..." oninput="filterWiki()">
      <ul id="tocList">
        <li><a href="#quickstart">🚀 30-Second Quick Start</a></li>
        <li><a href="#controls">🎮 Controls & Input</a></li>
        <li><a href="#objective">🏆 Objective & Scoring</a></li>
        <li><a href="#difficulty">📈 Dynamic Difficulty</a></li>
        <li><a href="#collision">💥 Collision & Hitboxes</a></li>
        <li><a href="#aesthetic">🎨 Meme Aesthetics & Audio</a></li>
        <li><a href="#retry">🔄 Instant Retry Loop</a></li>
        <li><a href="#gameflow">⚡ Game Phases & Loop</a></li>
        <li><a href="#tips">💡 Tips & Strategy</a></li>
      </ul>
    </aside>

    <main class="content">

      <section id="quickstart" class="card quick-start">
        <h2>How to Play in 30 Seconds</h2>
        <p style="margin-top: 12px;">GlitchDash14 is a high-energy, browser-based endless runner built for instant action and zero friction. There are no logins, no downloads, and no telemetry.</p>
        <ul>
          <li><strong>Start:</strong> Press any key or click/tap anywhere on the canvas to begin running instantly.</li>
          <li><strong>Survive:</strong> Jump over neon obstacles, dodge hazards, and keep the 'Glitch' character alive as speed ramps up.</li>
          <li><strong>Score:</strong> Every second survived and obstacle cleared increases your score in real-time. Your session best is saved locally.</li>
          <li><strong>Retry:</strong> Hit any key or tap immediately upon collision to instantly restart without page refreshes.</li>
        </ul>
      </section>

      <section id="controls" class="card">
        <h2>Controls & Input Integration</h2>
        <p>Engineered for simple, responsive one-button input across both desktop and mobile devices without missing a frame.</p>
        <table>
          <thead>
            <tr>
              <th>Device / Source</th>
              <th>Action / Input Key</th>
              <th>Behavior</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Desktop Keyboard</td>
              <td><kbd>Space</kbd> / <kbd>ArrowUp</kbd> / <kbd>W</kbd></td>
              <td>Triggers jump / vertical dodge action instantly (edge-triggered).</td>
            </tr>
            <tr>
              <td>Desktop Keyboard</td>
              <td>Any other key</td>
              <td>Wakes up game from 'Ready' or restarts from 'Game Over' state.</td>
            </tr>
            <tr>
              <td>Touch / Mobile / Mouse</td>
              <td>Tap or Click on Canvas</td>
              <td>Triggers jump action and immediately starts/restarts run on touch interaction.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="objective" class="card">
        <h2>Objective & Comprehensive Scoring</h2>
        <p>Master the balance of survival time and obstacle avoidance to climb the leaderboards.</p>
        <h3>Live Score Tracking</h3>
        <p>Provides a real-time, high-contrast score counter on the HUD that updates instantly as you clear obstacles and progress through sessions.</p>
        <h3>Final Session Results</h3>
        <p>Upon collision, the game pauses into an instant summary screen displaying your final score alongside your persistent browser session-best score.</p>
      </section>

      <section id="difficulty" class="card">
        <h2>Dynamic Difficulty Scaling Engine</h2>
        <p>The game adapts in real-time to keep sessions challenging yet fair across all school hardware.</p>
        <ul>
          <li><strong>Intensity Scaling Curve:</strong> Automatically adjusts obstacle spawn frequency and global game speed multipliers based on score thresholds.</li>
          <li><strong>Performance Fairness Monitor:</strong> Continuously checks frame rates (FPS). If performance dips below 60 FPS on low-end hardware, spawn rates are throttled to eliminate stuttering.</li>
          <li><strong>Smoothing Functions:</strong> Applies linear interpolation and smoothing curves to difficulty adjustments, preventing jarring spikes.</li>
          <li><strong>Global Tuning Constants:</strong> Centralized configuration parameters allowing rapid game balance adjustments.</li>
        </ul>
      </section>

      <section id="collision" class="card">
        <h2>Precise Collision Detection System</h2>
        <p>Fairness and responsiveness define every frame of interaction.</p>
        <ul>
          <li><strong>Hitbox Geometry:</strong> Precise collision boundaries mapped directly to visual assets for fair and responsive gameplay.</li>
          <li><strong>Optimized Processing:</strong> High-performance detection loops designed to execute in under 0.5ms per frame, ensuring zero input lag.</li>
          <li><strong>Hitbox Verification:</strong> Validates character-obstacle overlaps within 16ms of frame transitions.</li>
        </ul>
      </section>

      <section id="aesthetic" class="card">
        <h2>Meme-Inspired Visuals & Auditory Environment</h2>
        <p>Immersive, school-appropriate arcade sensory design.</p>
        <ul>
          <li><strong>Neon Vaporwave UI:</strong> High-contrast neon-saturated color palettes and retro arcade aesthetics.</li>
          <li><strong>Particle Bursts:</strong> Dynamic neon particle emissions triggered on scoring events and obstacle clearance.</li>
          <li><strong>Screen Shake & Irreverent Messages:</strong> Impact feedback on collision paired with cheeky, meme-inspired game-over text.</li>
          <li><strong>Audio Mute Toggle:</strong> Persistent audio control enabling silent play during classroom settings.</li>
        </ul>
      </section>

      <section id="retry" class="card">
        <h2>Instant Retry & Performance Optimization</h2>
        <p>Designed for rapid, frictionless trial-and-error sessions.</p>
        <ul>
          <li><strong>Instant Gameplay Restart:</strong> Seamless transition from Game Over back to active gameplay without reloading.</li>
          <li><strong>Object Pooling:</strong> Efficient memory management for obstacle instances to eliminate garbage collection pauses.</li>
          <li><strong>Persistent Local Storage:</strong> Automatically loads and updates your high score using browser local storage.</li>
        </ul>
      </section>

      <section id="gameflow" class="card">
        <h2>Game Flow & Lifecycle States</h2>
        <p>The core engine transitions smoothly through three primary phases:</p>
        <ul>
          <li><strong>Ready Phase:</strong> The initial waiting state displaying instructions and your current high score. Awaiting first user input.</li>
          <li><strong>Playing Phase:</strong> The active endless runner loop where input handling, physics updates, difficulty scaling, and live score tracking occur at 60 FPS.</li>
          <li><strong>Over Phase:</strong> Triggered immediately upon collision. Displays final stats, screen-shake feedback, meme commentary, and allows instant retry.</li>
        </ul>
      </section>

      <section id="tips" class="card">
        <h2>Tips & Pro Strategy</h2>
        <ul>
          <li><strong>Rhythm is Key:</strong> Don't just react visually; establish a rhythm with your jumps as speed increases.</li>
          <li><strong>Watch the Score Thresholds:</strong> Expect difficulty spikes at major score milestones as the intensity curve ramps up speed.</li>
          <li><strong>Frame Rate Matters:</strong> If playing on constrained school hardware, closing background tabs ensures a stable 60 FPS for precise hitboxes.</li>
          <li><strong>Instant Recovery:</strong> Mash <kbd>Space</kbd> or tap immediately upon death for lightning-fast training runs.</li>
        </ul>
      </section>

    </main>

  </div>

  <script>
    function toggleTheme() {
      const body = document.body;
      const currentTheme = body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('wiki_theme', newTheme);
    }

    window.addEventListener('DOMContentLoaded', () => {
      const savedTheme = localStorage.getItem('wiki_theme');
      if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
      }
    });

    function filterWiki() {
      const query = document.getElementById('searchFilter').value.toLowerCase();
      const sections = document.querySelectorAll('main.content section.card');
      const links = document.querySelectorAll('#tocList li');

      sections.forEach((sec, idx) => {
        const text = sec.textContent.toLowerCase();
        if (text.includes(query)) {
          sec.style.display = 'block';
          if (links[idx]) links[idx].style.display = 'block';
        } else {
          sec.style.display = 'none';
          if (links[idx]) links[idx].style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>

---
*Built by the project_manager_glitchdash14 crew member · CrewAI App Builder · 2026-08-03 03:02 UTC*
