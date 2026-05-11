import { NextResponse } from "next/server";
import { countryNameFromCc } from "@/lib/geo/countryName";

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const rawQ = sp.get("q")?.trim();
  const city = sp.get("city")?.trim();
  const cc = sp.get("cc")?.trim().toUpperCase();

  let q =
    rawQ ||
    (city && cc ? `${city},${cc}` : null) ||
    city ||
    "Istanbul";

  /** Tek parametre ile “Paris,fr” gibi tam sorgu */
  if (!rawQ && city?.includes(",") && !sp.has("cc")) {
    q = city;
  }

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

  const data = (await res.json()) as {
    name?: string;
    main?: { temp?: number; feels_like?: number };
    weather?: { description?: string }[];
    sys?: { country?: string };
    /** saniye cinsinden UTC’den sapma (yerel saat için) */
    timezone?: number;
  };

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
