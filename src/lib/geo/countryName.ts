/**
 * Tiny wrapper around Intl.DisplayNames so we can render readable country
 * names from the ISO-3166 alpha-2 codes stored in popularCities and
 * Supabase rows.
 */

/** ISO 3166-1 alpha-2 → display name (e.g. EN "Turkey", TR locale "Türkiye"). */
export function countryNameFromCc(cc: string, locale = "en"): string {
  try {
    // Intl.DisplayNames is built into modern JS runtimes; falls back to the
    // raw code if the locale or code is unknown.
    return (
      new Intl.DisplayNames([locale], { type: "region" }).of(
        cc.toUpperCase(),
      ) ?? cc
    );
  } catch {
    // Defensive — older Node versions or invalid input.
    return cc;
  }
}
