/**
 * Time helpers for the Utility page's city clock card. OpenWeather returns
 * a `timezone` field as a raw UTC offset (in seconds) which is the only
 * input we need — no third-party timezone data required.
 */

/** Compute a wall-clock time from OpenWeather's `timezone` field (offset from UTC, in seconds). */
export function formatOffsetWallClock(
  nowMs: number,
  offsetSec: number,
): string {
  // Convert "now" into seconds since the Unix epoch and slice to seconds-in-day.
  const utcSec = Math.floor(nowMs / 1000);
  const utcDayRemainder = utcSec % 86400;
  // Apply the city's offset, then wrap around midnight (handles negative offsets).
  let localSec = utcDayRemainder + offsetSec;
  localSec = ((localSec % 86400) + 86400) % 86400;
  const hh = Math.floor(localSec / 3600);
  const mm = Math.floor((localSec % 3600) / 60);
  const ss = localSec % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(hh)}:${p(mm)}:${p(ss)}`;
}

/** Short timezone label, e.g. UTC+3 or UTC+5.75 */
export function offsetShortLabel(offsetSec: number): string {
  const h = offsetSec / 3600;
  // Round to nearest quarter-hour so 5h 45m stays readable as 5.75.
  const rounded = Math.round(h * 4) / 4;
  const sign = rounded >= 0 ? "+" : "";
  return `UTC${sign}${rounded}`;
}
