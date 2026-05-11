/**
 * Shared utilities that turn the four planner preferences into:
 *   1. Long-form English descriptions used as MANDATORY constraints in the
 *      Gemini prompt (so the AI actually obeys the slider values).
 *   2. Short label tokens (e.g. "High nightlife", "Solo-friendly") used to
 *      render a compact "active preferences" summary in the UI.
 *
 * Internal-field → user-facing-spec mapping
 * -----------------------------------------
 *   walking       ⇄ walkingIntensity   (0–100)
 *   nightlife     ⇄ nightlifeInterest  (0–100)
 *   audience      ⇄ travelStyle        ("any" | "family" | "solo")
 *   environment   ⇄ indoorOutdoor      ("mixed" | "indoor" | "outdoor")
 */

export type AudiencePref = "any" | "family" | "solo";
export type EnvironmentPref = "mixed" | "indoor" | "outdoor";

export type PreferenceInput = {
  walking: number;
  nightlife: number;
  audience: AudiencePref | string;
  environment: EnvironmentPref | string;
};

function clamp(n: number): number {
  if (Number.isNaN(n)) return 50;
  return Math.min(100, Math.max(0, Math.round(n)));
}

// ───────────────────────────────────────────────────────────────────────────
// Walking intensity
// ───────────────────────────────────────────────────────────────────────────

export function walkingLabel(walking: number): string {
  const v = clamp(walking);
  if (v <= 20) return "Very low walking";
  if (v <= 40) return "Low walking";
  if (v <= 60) return "Moderate walking";
  if (v <= 80) return "High walking";
  return "Very high walking";
}

export function describeWalking(walking: number): string {
  const v = clamp(walking);
  if (v <= 20) {
    return `Walking intensity is ${v}/100 — VERY LOW. The traveller wants minimal walking. Default to taxis, ride-share, or short transfers between stops. Favour comfortable, sit-down experiences: rooftop bars, spas, hammams, boat tours, scenic cafés, panoramic restaurants, short museum visits. DO NOT propose hiking, "walking tours", long city walks, viewpoint climbs, or stairs-heavy stops. Keep each stop within a few minutes' walk of the previous one.`;
  }
  if (v <= 40) {
    return `Walking intensity is ${v}/100 — LOW. Keep the day relaxed: short strolls only (10–20 minutes between stops), plenty of café/garden breaks. Avoid full walking tours, hikes, and long neighbourhood crawls. Indoor cultural stops and quick photo spots are welcome.`;
  }
  if (v <= 60) {
    return `Walking intensity is ${v}/100 — MODERATE. Moderate walking is fine: comfortable 20–40 minute legs between stops, the occasional neighbourhood stroll. Mix walkable areas with one transit or taxi hop per day.`;
  }
  if (v <= 80) {
    return `Walking intensity is ${v}/100 — HIGH. The traveller actively enjoys walking. Plan on-foot neighbourhood explorations, walking food tours, viewpoint climbs, market walks. Long legs between stops (30–60 minutes on foot) are encouraged.`;
  }
  return `Walking intensity is ${v}/100 — VERY HIGH. This traveller wants physical activity. Include hiking, long walking routes, viewpoint climbs, bike rides, kayaking, or similar active experiences. Do NOT waste slots on sedentary venues like spas or sit-down lounges.`;
}

// ───────────────────────────────────────────────────────────────────────────
// Nightlife interest
// ───────────────────────────────────────────────────────────────────────────

export function nightlifeLabel(nightlife: number): string {
  const v = clamp(nightlife);
  if (v <= 20) return "No nightlife";
  if (v <= 40) return "Low nightlife";
  if (v <= 60) return "Some nightlife";
  if (v <= 80) return "High nightlife";
  return "Maximum nightlife";
}

export function describeNightlife(nightlife: number): string {
  const v = clamp(nightlife);
  if (v <= 20) {
    return `Nightlife interest is ${v}/100 — NONE. NO bars, clubs, rooftop parties, or late-night venues. Evenings must be calm: an early sit-down dinner, a quiet walk, or returning to the hotel. Every day must END no later than 21:00.`;
  }
  if (v <= 40) {
    return `Nightlife interest is ${v}/100 — LOW. At most one quiet evening venue across the whole trip: a wine bar, jazz café, or scenic restaurant. NO clubs, beach clubs, or bar crawls. Most evenings end by 22:00.`;
  }
  if (v <= 60) {
    return `Nightlife interest is ${v}/100 — MODERATE. A few evenings should feature relaxed nightlife: a rooftop bar, live-music venue, or popular restaurant district. Not every night, and no all-night clubbing.`;
  }
  if (v <= 80) {
    return `Nightlife interest is ${v}/100 — HIGH. MOST evenings MUST feature nightlife stops: rooftop bars, live-music venues, cocktail bars, popular nightlife districts, late-night street food. Schedule LIGHTER daytimes (beach, pool, brunch, late starts) so the traveller has energy for the nights. Each evening slot must name a SPECIFIC venue type (e.g. "rooftop bar with DJ set", "speakeasy cocktail bar", "live jazz club"). DO NOT suggest temples, museums, or quiet activities in the evening.`;
  }
  return `Nightlife interest is ${v}/100 — MAXIMUM. NIGHTLIFE IS THE MAIN FOCUS OF THIS TRIP. Plan the ENTIRE itinerary around the night scene: clubs, beach clubs, bar crawls, rooftop parties, night markets, late-night food spots, after-parties. Daytime stops must be LIGHT recovery only — beach, pool, brunch, spa, late start. Evening blocks must be the longest and most detailed part of every day, with multiple back-to-back venues (e.g. "21:00 cocktail bar → 23:00 club district → 02:00 late-night food"). DO NOT suggest museums, temples, hiking, or any activity that conflicts with a heavy nightlife schedule.`;
}

// ───────────────────────────────────────────────────────────────────────────
// Travel style (audience)
// ───────────────────────────────────────────────────────────────────────────

export function travelStyleLabel(audience: string): string {
  switch (audience) {
    case "solo":
      return "Solo-friendly";
    case "family":
      return "Family-friendly";
    default:
      return "Balanced";
  }
}

export function describeTravelStyle(audience: string): string {
  switch (audience) {
    case "solo":
      return `Travel style is SOLO-FRIENDLY. Prioritise stops where a solo traveller can comfortably meet other people: free walking tours, social hostels, group cooking classes, communal-table restaurants, food markets, popular cafés, group day tours. When relevant, briefly mention that a venue is good for meeting other travellers.`;
    case "family":
      return `Travel style is FAMILY-FRIENDLY. NO bars, clubs, or adult-only venues. Favour parks, interactive science museums, child-friendly cultural sites, aquariums, zoos, family restaurants, easy walking routes, attractions with stroller access. Every activity must work for both children and adults.`;
    default:
      return `Travel style is BALANCED. A mix of cultural, casual, and social venues that works for any kind of traveller (couples, friends, solo). Avoid extreme family-only or party-only stops.`;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Indoor / outdoor
// ───────────────────────────────────────────────────────────────────────────

export function environmentLabel(environment: string): string {
  switch (environment) {
    case "indoor":
      return "Indoor";
    case "outdoor":
      return "Outdoor";
    default:
      return "Indoor & outdoor mix";
  }
}

export function describeEnvironment(environment: string): string {
  switch (environment) {
    case "indoor":
      return `Indoor/outdoor preference is MORE INDOOR. Favour museums, galleries, indoor markets, spas, design stores, cinemas, opera/theatre, covered food halls, cosy cafés. AVOID beaches, long hikes, and outdoor sports. If you mention an outdoor stop, keep it short and combine it with an indoor venue nearby.`;
    case "outdoor":
      return `Indoor/outdoor preference is MORE OUTDOOR. Favour beaches, parks, viewpoints, hikes, open-air markets, outdoor terraces, scenic drives, gardens, waterfront walks. MINIMISE indoor time — replace museum visits with outdoor alternatives where possible.`;
    default:
      return `Indoor/outdoor preference is MIXED. Healthy balance of indoor cultural stops and outdoor scenic stops every day.`;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Public aggregators
// ───────────────────────────────────────────────────────────────────────────

/**
 * Long-form description block injected into the Gemini prompt as
 * MANDATORY constraints.
 */
export function buildPreferencesDescription(input: PreferenceInput): string {
  return [
    "1. " + describeWalking(input.walking),
    "2. " + describeNightlife(input.nightlife),
    "3. " + describeTravelStyle(String(input.audience)),
    "4. " + describeEnvironment(String(input.environment)),
  ].join("\n\n");
}

/**
 * Compact tokens for the UI, e.g. ["High nightlife", "Low walking",
 * "Solo-friendly", "Outdoor"].
 */
export function summarizePreferences(input: PreferenceInput): string[] {
  return [
    nightlifeLabel(input.nightlife),
    walkingLabel(input.walking),
    travelStyleLabel(String(input.audience)),
    environmentLabel(String(input.environment)),
  ];
}
