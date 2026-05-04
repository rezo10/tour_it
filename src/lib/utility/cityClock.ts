/** OpenWeather `timezone` (UTC’den saniye sapma) ile yerel duvar saati. */

export function formatOffsetWallClock(
  nowMs: number,
  offsetSec: number,
): string {
  const utcSec = Math.floor(nowMs / 1000);
  const utcDayRemainder = utcSec % 86400;
  let localSec = utcDayRemainder + offsetSec;
  localSec = ((localSec % 86400) + 86400) % 86400;
  const hh = Math.floor(localSec / 3600);
  const mm = Math.floor((localSec % 3600) / 60);
  const ss = localSec % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(hh)}:${p(mm)}:${p(ss)}`;
}

/** Örn. UTC+3 veya UTC+5.75 */
export function offsetShortLabel(offsetSec: number): string {
  const h = offsetSec / 3600;
  const rounded = Math.round(h * 4) / 4;
  const sign = rounded >= 0 ? "+" : "";
  return `UTC${sign}${rounded}`;
}
