/** Şehir + ülke için tekrarlanabilir kapak görseli (LoremFlickr etiketleri; API anahtarı gerekmez). */

function lockKey(city: string, country: string): number {
  const s = `${city.trim()}|${country.trim()}`.toLowerCase();
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0) % 50000;
}

function tagsForPlace(city: string, country: string): string {
  const tag = (x: string) =>
    x
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)[0] || "city";

  return [tag(city), tag(country), "travel", "city"].join(",");
}

/**
 * Kapak fotoğrafı URL’si. Aynı şehir/ülke için lock ile görsel sabit kalır.
 */
export function placeCoverImageUrl(
  city: string,
  country: string,
  width = 1200,
  height = 630,
): string {
  const w = Math.min(Math.max(200, width), 1920);
  const h = Math.min(Math.max(150, height), 1200);
  const tags = tagsForPlace(city, country);
  const lock = lockKey(city, country);
  return `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;
}
