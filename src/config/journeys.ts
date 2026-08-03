/**
 * Journey Dashboard Configuration — User journey registry.
 *
 * INFRASTRUCTURE FILE — populated automatically by the deterministic wiring
 * pipeline from the uploaded journeys.md (see docs/journeys-md-format.md).
 * Starts empty; stays empty for builds that didn't upload journeys.md.
 * The Sidebar and Dashboard fall back to the feature-directory view
 * (NAV_SECTIONS / navigationConfig) whenever JOURNEYS is empty — do NOT
 * hand-write journeys here.
 *
 * @business-card
 * @module journeys
 * @exports JourneyStepConfig, JourneyConfig, JOURNEYS, getPrimaryJourney
 */

export interface JourneyStepConfig {
  order: number;
  title: string;
  /** Real route path, or null if this step has no page yet. */
  path: string | null;
  actor?: string;
  description?: string;
}

export interface JourneyConfig {
  title: string;
  persona: string | null;
  anchoredOnCapture: boolean;
  description: string;
  steps: JourneyStepConfig[];
}

/** User journeys, in primary-flow-first order. Empty until the wiring
 *  pipeline populates it from journeys.md. */
export const JOURNEYS: JourneyConfig[] = [];

/** First journey with at least one resolvable step, or null. */
export function getPrimaryJourney(): JourneyConfig | null {
  return JOURNEYS[0] ?? null;
}
