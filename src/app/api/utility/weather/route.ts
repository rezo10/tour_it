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
          "OPENWEATHER_API_KEY tanımlı değil — openweathermap.org API anahtarı .env.local'e eklenmeli",
      },
      { status: 501 },
    );
  }

  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.searchParams.set("q", q);
  url.searchParams.set("appid", key);
  url.searchParams.set("units", "metric");
  url.searchParams.set("lang", "tr");

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    const t = await res.text();
    return NextResponse.json(
      { error: "OpenWeather hatası", detail: t.slice(0, 200) },
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
    code && /^[A-Z]{2}$/.test(code) ? countryNameFromCc(code, "tr") : "";

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
