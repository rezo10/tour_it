/**
 * GET /api/utility/weather
 *
 * Thin proxy over the OpenWeather "current weather" endpoint. Hides our
 * API key from the browser and normalises the response to the small
 * shape the Utility page expects.
 *
 * Accepts either `q=City,CC` directly, or `city` + `cc` as separate
 * params for callers that already have them split.
 */
import { NextResponse } from "next/server";
import { countryNameFromCc } from "@/lib/geo/countryName";

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const rawQ = sp.get("q")?.trim();
  const city = sp.get("city")?.trim();
  const cc = sp.get("cc")?.trim().toUpperCase();

  // Build the OpenWeather "q" query in priority order.
  let q =
    rawQ ||
    (city && cc ? `${city},${cc}` : null) ||
    city ||
    "Istanbul";

  // Support the shorthand where `city=Paris,fr` is sent on its own.
  if (!rawQ && city?.includes(",") && !sp.has("cc")) {
    q = city;
  }

  // Server-side key: never exposed to the browser.
  const key = process.env.OPENWEATHER_API_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      {
        error:
          "Weather service is not configured on the server. Please contact the maintainer.",
      },
      { status: 501 },
    );
  }

  // Fetch with a 5-minute revalidate window so popular cities are cached.
  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.searchParams.set("q", q);
  url.searchParams.set("appid", key);
  url.searchParams.set("units", "metric");
  url.searchParams.set("lang", "en");

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    return NextResponse.json(
      {
        error:
          "We couldn't fetch the weather for that location. Try another city.",
      },
      { status: 502 },
    );
  }

  // Pluck only the fields the UI needs (rest is discarded).
  const data = (await res.json()) as {
    name?: string;
    main?: { temp?: number; feels_like?: number };
    weather?: { description?: string }[];
    sys?: { country?: string };
    /** Seconds offset from UTC, used by the local-time card. */
    timezone?: number;
  };

  // Resolve the human country name from the two-letter ISO code.
  const code = data.sys?.country?.toUpperCase();
  const countryLabel =
    code && /^[A-Z]{2}$/.test(code) ? countryNameFromCc(code, "en") : "";

  return NextResponse.json({
    city: data.name ?? q,
    temp: data.main?.temp,
    feelsLike: data.main?.feels_like,
    description: data.weather?.[0]?.description ?? "",
    countryCode: code ?? "",
    country: countryLabel,
    timezone: data.timezone ?? 0,
  });
}
