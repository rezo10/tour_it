import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  itineraryPlanSchema,
  type ParsedItineraryPlan,
} from "@/lib/itinerary/schema";
import { buildPreferencesDescription } from "@/lib/itinerary/preferences";

export const maxDuration = 120;

function getGeminiApiKey(): string {
  const direct =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim();
  return direct ?? "";
}

type Body = {
  country: string;
  city: string;
  tripType: string;
  days: number;
  walking: number;
  nightlife: number;
  audience: string;
  environment: string;
};

function buildPrompt(input: Body): string {
  const dayCount = Math.min(14, Math.max(1, Math.round(input.days)));
  const prefsDescription = buildPreferencesDescription({
    walking: input.walking,
    nightlife: input.nightlife,
    audience: input.audience,
    environment: input.environment,
  });

  return `You are the "Tour It" travel companion AI. Reply with NOTHING but a single JSON object (no markdown fences, no commentary).

═══════════════════════════════════════════════════════════
CRITICAL MANDATORY RULES — APPLY EVERY ONE OF THESE
═══════════════════════════════════════════════════════════
The four numbered constraints below describe THIS specific traveller's
preferences. They are NOT suggestions. Every single activity in the
itinerary MUST be checked against ALL FOUR rules. If a stop would
violate any rule, REPLACE IT with one that satisfies all four. Producing
an itinerary that contradicts the slider values (e.g. a club for a
low-nightlife traveller, or a hike for a low-walking traveller) is a
FAILED response.

${prefsDescription}

═══════════════════════════════════════════════════════════
SPECIFICITY RULES
═══════════════════════════════════════════════════════════
- Be SPECIFIC with venue types. BAD: "go out", "relax", "explore",
  "enjoy local food". GOOD: "rooftop bar with DJ set", "beach club
  opening at sunset", "covered market lunch with regional tapas",
  "neighbourhood walking tour through the artisans' quarter".
- Each "name" must be a recognisable, realistic venue, landmark, or
  neighbourhood — real where possible, plausibly local-style otherwise.
- Each "description" must reference WHY this stop fits the traveller's
  preferences (e.g. "yüksek gece hayatı tercihinize uygun çatı bar",
  "düşük yürüyüş tercihiniz için oturarak keyfini çıkarabileceğiniz
  panoramik restoran"). Tie it back to the slider that justified it.

═══════════════════════════════════════════════════════════
PERSONA & LANGUAGE
═══════════════════════════════════════════════════════════
- All user-facing strings INSIDE the JSON (title, day title, activity
  name / description / category) MUST be written in **Turkish**.
- Yazım üslubu: Dünyanın birçok yerini gezmiş, sıcakkanlı ve güvenilir
  bir gezi arkadaşı gibi konuş. Abartılı reklam dili kullanma; samimi
  "sana şunu öneririm" tonu kullan.
- Her aktivitenin "description" alanı 2–4 Türkçe cümle olmalı: neden bu
  durak (yukarıdaki tercih kuralına bağla), küçük pratik ipucu (en iyi
  saat, ne giymek/beklemek, kalabalık seviyesi) ve yerel bir detay.

═══════════════════════════════════════════════════════════
REALISM
═══════════════════════════════════════════════════════════
- "duration" değerleri gerçekçi: "45 dk", "1 saat", "1.5 saat",
  "2 saat", "3 saat". Transfer, mola ve yemek için pay bırak.
- Koordinatlar (lat/lng) gerçek WGS84 olmalı ve ${input.city},
  ${input.country} çevresinde anlamlı bir yerde durmalı.
- NO REPETITION across the whole trip — never reuse the same venue,
  museum, or restaurant name twice (case-insensitive). Pick distinct
  realistic or plausibly local stops.
- Within a day, adjacent stops should make geographical sense.

═══════════════════════════════════════════════════════════
JSON SHAPE — EXACT
═══════════════════════════════════════════════════════════
{
  "title": string,
  "country": "${input.country}",
  "city": "${input.city}",
  "tripType": "${input.tripType}",
  "days": [
    {
      "day": number (1…${dayCount}),
      "title": string,
      "activities": [
        {
          "order": number,
          "name": string,
          "description": string,
          "duration": string,
          "category": string,
          "lat": number,
          "lng": number
        }
      ]
    }
  ]
}

CONSTRAINTS:
- "days" array length is EXACTLY ${dayCount}.
- Each day's "day" number is sequential 1…${dayCount}.
- Each day has AT LEAST 2 activities. If the nightlife or walking rules
  above demand a heavier programme (e.g. very high nightlife = chain
  2–3 evening venues), include MORE activities for that day.
- Each activity's "order" starts at 1 and is sequential within the day.`;
}

const DEFAULT_MODEL_CHAIN = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
] as const;

function uniqueModels(preferred: string | undefined): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  if (preferred) {
    list.push(preferred);
    seen.add(preferred);
  }
  for (const m of DEFAULT_MODEL_CHAIN) {
    if (!seen.has(m)) {
      seen.add(m);
      list.push(m);
    }
  }
  return list;
}

function isNotFoundModelError(msg: string): boolean {
  return /404|not found|not supported for generateContent/i.test(msg);
}

async function generateWithModelChain(
  genAI: GoogleGenerativeAI,
  prompt: string,
  modelIds: string[],
): Promise<{ text: string; modelUsed: string }> {
  let lastError: unknown;
  for (const modelId of modelIds) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelId,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.78,
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return { text, modelUsed: modelId };
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : String(e);
      const isQuota =
        /429|Too Many Requests|quota|RESOURCE_EXHAUSTED|free_tier|limit:\s*0/i.test(
          msg,
        );
      if (isQuota) throw e;
      if (isNotFoundModelError(msg)) continue;
      throw e;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError ?? "Model chain failed"));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      {
        error: "You need to sign in before generating an itinerary.",
        code: "AUTH",
      },
      { status: 401 },
    );
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "The AI service is not configured on the server. Please contact the maintainer.",
        code: "NO_KEY",
      },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      {
        error: "We couldn't read your request. Please refresh and try again.",
      },
      { status: 400 },
    );
  }

  const safeNum = (v: unknown, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const input: Body = {
    country: String(body.country ?? "").trim(),
    city: String(body.city ?? "").trim(),
    tripType: String(body.tripType ?? "").trim(),
    days: Math.min(14, Math.max(1, Math.round(safeNum(body.days, 3)))),
    walking: Math.min(100, Math.max(0, Math.round(safeNum(body.walking, 50)))),
    nightlife: Math.min(
      100,
      Math.max(0, Math.round(safeNum(body.nightlife, 30))),
    ),
    audience: String(body.audience ?? "any"),
    environment: String(body.environment ?? "mixed"),
  };

  if (!input.country || !input.city || !input.tripType) {
    return NextResponse.json(
      {
        error: "Please pick a country, city and trip type before generating.",
        code: "VALIDATION",
      },
      { status: 400 },
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelChain = uniqueModels(process.env.GEMINI_MODEL?.trim());

  let text = "";
  let modelUsed = "";
  try {
    const out = await generateWithModelChain(
      genAI,
      buildPrompt(input),
      modelChain,
    );
    text = out.text;
    modelUsed = out.modelUsed;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isQuota =
      /429|Too Many Requests|quota|RESOURCE_EXHAUSTED|free_tier|limit:\s*0/i.test(
        msg,
      );
    if (isQuota) {
      return NextResponse.json(
        {
          error:
            "We're getting a lot of requests right now or the daily quota is full. Please try again in a few minutes.",
          code: "GEMINI_QUOTA",
          modelsTried: modelChain,
        },
        { status: 429 },
      );
    }
    return NextResponse.json(
      {
        error:
          "We couldn't generate your itinerary. Check your connection and try again.",
        code: "GEMINI_FAIL",
        modelsTried: modelChain,
      },
      { status: 502 },
    );
  }

  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      {
        error:
          "The AI returned a malformed response. Please try generating again.",
        code: "BAD_JSON",
      },
      { status: 502 },
    );
  }

  const checked = itineraryPlanSchema.safeParse(parsed);
  if (!checked.success) {
    return NextResponse.json(
      {
        error:
          "The itinerary didn't match the expected shape. Try regenerating or change the number of days.",
        code: "SCHEMA",
      },
      { status: 422 },
    );
  }

  const plan: ParsedItineraryPlan = checked.data;
  return NextResponse.json({ plan, meta: { model: modelUsed } });
}
