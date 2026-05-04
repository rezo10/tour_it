import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  itineraryPlanSchema,
  type ParsedItineraryPlan,
} from "@/lib/itinerary/schema";

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
  const walk = Math.min(100, Math.max(0, Math.round(input.walking)));
  const night = Math.min(100, Math.max(0, Math.round(input.nightlife)));

  return `You are the "Tour It" travel companion AI. Reply with NOTHING but a single JSON object (no markdown fences, no commentary).

PERSONA & LANGUAGE
- All user-facing text INSIDE the JSON must be in **Turkish**: "title", each day's "title", every activity "name", "description", and "category".
- Yazım üslubu: Dünyanın birçok yerini gezmiş, sıcakkanlı ve güvenilir bir gezi arkadaşı gibi konuş. Abartılı reklam dili kullanma; samimi "sana şunu öneririm" tonu kullan.
- Her aktivitenin "description" alanında 2–4 cümle: neden bu durak, küçük pratik ipucu (kalabalık saat, tempo, ne giymek/ ne beklemek), yerel bir detay. Kur maceraları değil, gerçekçi gezgin tavsiyesi ver.

REALISM & DURATIONS
- "duration" alanlarını gerçekçi tut: örn. "45 dk", "1 saat", "1.5 saat", "2 saat". Transfer + güvenlik + tuvalet için gün içinde acele etme.
- Yürüyüş eğilimi ${walk}/100: düşükse daha az durak veya daha kısa bacaklar; yüksekse yaya güzergâhları ve mahalle keşifleri artır.
- Gece hayatı ilgisi ${night}/100: düşükse akşamı sakin kültür/yemek; yüksekse bir iki akşam canlı mahalle veya gece kaşifi uyarısı (abartma).
- Kitle: ${input.audience}. Mekân / iç-dış tercih: ${input.environment}.

NO REPETITION
- Tüm seyahat boyunca (tüm günler) **aynı mekân / işletme / müze adını iki kez kullanma** (büyük/küçük harf fark etmez). Farklı isimlerle gerçek veya çok tipik duraklar seç.
- Aynı gün içinde komşu iki durak mantıklı sırada olsun; koordinatlar (${input.city}, ${input.country}) çevresinde gerçekçi WGS84 lat/lng kullan.

JSON ŞEKLİ (tam olarak bu yapı, sayılar ve metin türleri):
{
  "title": string,
  "country": "${input.country}",
  "city": "${input.city}",
  "tripType": "${input.tripType}",
  "days": /* exactly ${dayCount} items */, each:
    {
      "day": number (1…${dayCount}),
      "title": string,
      "activities": /* at least 2 per day */ [
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
}

Koşullar: "days" dizisinin uzunluğu tam ${dayCount} olsun; her günün "day" numarası sırayla artsın; her aktivitenin "order" o gün içinde 1'den başlasın.`;
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
      { error: "Plan üretmek için önce giriş yapmalısın.", code: "AUTH" },
      { status: 401 },
    );
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Yapay zeka anahtarı ayarlı değil. Geliştirici: .env.local içine GEMINI_API_KEY eklesin.",
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
      { error: "İstek okunamadı. Sayfayı yenileyip tekrar dene." },
      { status: 400 },
    );
  }

  const input: Body = {
    country: String(body.country ?? "").trim(),
    city: String(body.city ?? "").trim(),
    tripType: String(body.tripType ?? "").trim(),
    days: Number(body.days) || 3,
    walking: Number(body.walking) ?? 50,
    nightlife: Number(body.nightlife) ?? 30,
    audience: String(body.audience ?? "any"),
    environment: String(body.environment ?? "mixed"),
  };

  if (!input.country || !input.city || !input.tripType) {
    return NextResponse.json(
      {
        error: "Ülke, şehir ve gezi türünü seçmelisin.",
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
            "Çok istek gönderildi veya günlük ücretsiz kota doldu. Bir süre bekleyip tekrar dene.",
          code: "GEMINI_QUOTA",
          modelsTried: modelChain,
        },
        { status: 429 },
      );
    }
    return NextResponse.json(
      {
        error:
          "Plan oluşturulamadı. İnternetini kontrol edip biraz sonra tekrar dene.",
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
          "Yanıt bozuk geldi. Tekrar üretmeyi dene; olmazsa biraz sonra tekrar dene.",
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
          "Plan şekli uyuşmadı. Tekrar üretmeyi dene veya gün sayısını değiştir.",
        code: "SCHEMA",
      },
      { status: 422 },
    );
  }

  const plan: ParsedItineraryPlan = checked.data;
  return NextResponse.json({ plan, meta: { model: modelUsed } });
}
