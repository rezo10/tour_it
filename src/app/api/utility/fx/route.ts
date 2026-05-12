/**
 * GET /api/utility/fx
 *
 * Wrapper around Frankfurter (European Central Bank reference rates).
 * Used by the Utility page's currency widget. Cached for an hour because
 * the upstream feed updates once a day.
 */
import { NextResponse } from "next/server";

/** Frankfurter (ECB) — no API key required. Returns the live daily rate. */
export async function GET(request: Request) {
  // Default to USD→EUR so the widget shows something useful on first load.
  const from =
    new URL(request.url).searchParams.get("from")?.trim().toUpperCase() ||
    "USD";
  const to =
    new URL(request.url).searchParams.get("to")?.trim().toUpperCase() || "EUR";

  // Same-currency pair is a no-op — skip the network roundtrip entirely.
  if (from === to) {
    return NextResponse.json({
      from,
      to,
      rate: 1,
      date: new Date().toISOString().slice(0, 10),
      label: `1 ${from} = 1 ${to}`,
    });
  }

  const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
  // 1-hour Next.js cache: ECB updates rates daily, hourly is plenty fresh.
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    return NextResponse.json(
      { error: "The exchange rate service is unavailable. Try again later." },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    rates?: Record<string, number>;
    date?: string;
  };
  // Frankfurter returns a `rates` map keyed by the target currency code.
  const rate = data.rates?.[to];
  if (rate == null) {
    return NextResponse.json(
      { error: "We couldn't find a rate for that currency pair." },
      { status: 422 },
    );
  }

  return NextResponse.json({
    from,
    to,
    rate,
    date: data.date,
    label: `1 ${from} = ${rate} ${to}`,
  });
}
