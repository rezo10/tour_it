/** ISO 3166-1 alpha-2 → display name (e.g. EN "Turkey", TR locale "Türkiye"). */
export function countryNameFromCc(cc: string, locale = "en"): string {
  try {
    return (
      new Intl.DisplayNames([locale], { type: "region" }).of(
        cc.toUpperCase(),
      ) ?? cc
    );
  } catch {
    return cc;
  }
}
