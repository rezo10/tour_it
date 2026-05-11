import { NextResponse } from "next/server";

/** Frankfurter (ECB) — no API key required. Returns the live daily rate. */
export async function GET(request: Request) {
  const from =
    new URL(request.url).searchParams.get("from")?.trim().toUpperCase() ||
    "USD";
  const to =
    new URL(request.url).searchParams.get("to")?.trim().toUpperCase() || "EUR";

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
