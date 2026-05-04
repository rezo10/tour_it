/** ISO 3166-1 alpha-2 → bölge adı (ör. EN "Turkey", TR yerelinde "Türkiye"). */
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
