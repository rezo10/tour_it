import { NextResponse } from "next/server";

/** Frankfurter (ECB) — anahtar gerekmez. */
export async function GET(request: Request) {
  const from =
    new URL(request.url).searchParams.get("from")?.trim().toUpperCase() ||
    "USD";
  const to =
    new URL(request.url).searchParams.get("to")?.trim().toUpperCase() || "EUR";

  const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Frankfurter yanıt vermedi" },
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
      { error: "Kur bulunamadı" },
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
