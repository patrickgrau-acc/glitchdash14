# Joy Enhancement Specification: Configure Game Parameters & Styling (F3)

This specification defines the joy touches, micro-interactions, friendly error handling, loading states, empty states, and microcopy guidelines for **Feature F3: Configure game parameters for easy adjustments to difficulty, assets, and styling** in GlitchDash14.

---

## 1. Micro-Interaction Specs

### Use Case: Configure Game Parameters Live
Provide an in-game overlay allowing real-time adjustment of difficulty variables (`speed_modifier`, `gap_size`, `gravity_multiplier`) without interrupting the gameplay loop.

*   **Overlay Entrance / Exit:**
    *   *Trigger:* User presses `Esc`, `Settings` gear icon, or dedicated hotkey (`C`).
    *   *Animation:* Smooth slide-in drawer from the right or floating modal with backdrop blur (`backdrop-blur-md bg-surface/80`).
    *   *Timing & Easing:* `duration-200 ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`).
    *   *Micro-touch:* Subtle scaling spring effect (`scale-95` to `scale-100`) with a gentle 4px elevation drop shadow (`shadow-lg`).
*   **Slider / Number Control Adjustments:**
    *   *Trigger:* Dragging speed or gap sliders.
    *   *Feedback:* Real-time live counter incrementing/decrementing with numerical pulse (`transform scale-105 text-primary transition-transform duration-75`).
    *   *Immediate Effect:* Dispatches state updates directly to game system tick parameters without interrupting obstacle rendering (`duration-75 ease-linear`).

### Use Case: Modify Visual Aesthetic Settings
Enable users to toggle or select color palettes (Neon Arcade, Vaporwave Dusk, Cyberpunk Matrix, Retro High-Contrast) through the live configuration interface.

*   **Palette Card Selection:**
    *   *Trigger:* Clicking a theme swatch card.
    *   *Feedback:* Selected card pops up with a satisfying ring border (`ring-4 ring-primary ring-offset-2 ring-offset-surface scale-[1.02] transition-all duration-150 ease-out`).
    *   *Instant Preview:* CSS custom properties (`--color-primary`, `--color-accent`, etc.) update immediately on the root container so background grid lines and runner neon glows shift instantly without losing frame rate.
*   **Accessibility Contrast Verification Badge:**
    *   *Trigger:* Palette selection change.
    *   *Feedback:* A subtle check or warning badge ("WCAG AA Verified" / "High Contrast Active") smoothly fades in (`opacity-0` -> `opacity-100 duration-300`) alongside an icon (`<Icon name="CheckCircle2" className="w-4 h-4 text-success" />`).

---

## 2. Celebration Moments & Delight Triggers

*   **Tuning Mastery Milestone ("Sweet Spot" Unlocked):**
    *   *Trigger:* When a user successfully tests and saves a custom difficulty profile that maintains a high challenge score (e.g., speed multiplier > 1.5x with surviving > 30 seconds).
    *   *Celebration Type:* Subtle celebratory toast ("🔥 Tuned to Perfection — Custom difficulty saved!"), accompanied by a friendly success checkmark animation and glowing badge pulse in the header.
*   **Accessibility Champion Badge:**
    *   *Trigger:* Selecting the high-contrast colorblind-friendly palette.
    *   *Celebration Type:* A warm confirmation toast with supportive microcopy: "High-contrast neon mode activated — crystal clear visuals locked in!"

---

## 3. Error State Design

*   **Parameter Out of Range Error:**
    *   *Scenario:* User attempts to set an impossible gap size or extreme speed cap that breaks physics calculations.
    *   *Copy:* `"Whoa there, speedster! That gap size is too tight for the runner to clear. We adjusted it to the safest maximum limit (120px) to keep you flying."`
    *   *Recovery Action:* Inline auto-correction with a soft yellow warning banner (`bg-warning/10 text-warning border border-warning/30 rounded-lg p-3 text-sm flex items-center gap-2`) and automatic clamping to safe parameter bounds.
*   **LocalStorage Save Failure:**
    *   *Scenario:* Browser storage full or blocked.
    *   *Copy:* `"Couldn't save your custom settings locally — your browser storage might be full. Don't worry, your current game session is still rolling!"`
    *   *Recovery Action:* Provide a manual "Export Preset JSON" button so players never lose their tuned configurations.

---

## 4. Loading Experiences

*   **Configuration Overlay Initialization:**
    *   *Loading State:* Instead of a jarring layout shift or blank modal, use sleek skeleton placeholders matching the slider rows (`<Skeleton className="h-10 w-full rounded-lg animate-pulse bg-surface-alt" />`).
    *   *Timing:* Instantaneous (< 50ms for localStorage / in-memory sync), ensuring zero perceptible delay during gameplay.

---

## 5. Empty States

*   **Custom Presets Tab (Empty State):**
    *   *Icon:* `<Icon name="Sliders" className="w-12 h-12 text-text-muted" />`
    *   *Title:* `"No Custom Presets Yet"`
    *   *Description:* `"You're currently using the default arcade difficulty. Tweak the speed or gravity sliders to craft your ultimate challenge!"`
    *   *Primary Action:* `<Button variant="primary"><Icon name="Plus" className="w-4 h-4" /> Create Custom Preset</Button>`

---

## 6. Microcopy Style Guide (Voice & Tone)

*   **Tone:** Energetic, arcade-friendly, encouraging, and supportive (Material You meets retro arcade soul). Never robotic or clinical.
*   **Button Labels:**
    *   Primary Action: `"Save Configuration"`, `"Apply Theme"`, `"Reset to Default"`
    *   Secondary Action: `"Cancel"`, `"Preview Style"`, `"Export Settings"`
*   **Tooltips:**
    *   *Speed Multiplier:* `"Adjusts the base momentum of obstacles. Higher values demand quicker reflexes!"`
    *   *Gap Size:* `"Controls the minimum spacing between obstacle barriers."`
    *   *Gravity Multiplier:* `"Makes the runner feel heavier and land faster after jumping."`
*   **Success Messages:**
    *   `"Settings saved — changes are live on the course!"`
    *   `"Theme updated successfully. Looking sharp!"`
