import { PlanCard } from "@/components/explore/PlanCard";
import type { ExplorePlanCard } from "@/lib/mock-data";
import { mockExplorePlans } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";

const coverGradients = [
  "from-accent-200 via-coral-100 to-cream-50",
  "from-amber-100 via-orange-50 to-coral-100",
  "from-coral-100 via-cream-100 to-navy-50",
  "from-violet-100 via-fuchsia-50 to-cream-50",
  "from-rose-100 via-orange-50 to-amber-50",
];

export default async function ExplorePage() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("plans")
    .select(
      `
      id,
      title,
      country,
      city,
      trip_type,
      preferences,
      updated_at,
      profiles ( display_name )
    `,
    )
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(24);

  let cards: ExplorePlanCard[] = [];

  if (!error && rows?.length) {
    cards = rows.map((p, i) => {
      const prefs = (p.preferences ?? {}) as { note?: string };
      const creator =
        (p.profiles as { display_name?: string | null } | null)?.display_name ??
        "Gezgin";
      return {
        id: String(p.id),
        title: p.title,
        country: p.country,
        city: p.city,
        tripType: p.trip_type,
        days:
          typeof (prefs as { day_count?: number }).day_count === "number"
            ? (prefs as { day_count: number }).day_count
            : 3,
        description:
          typeof prefs.note === "string" && prefs.note
            ? prefs.note
            : `${p.trip_type} · ${p.city}, ${p.country}`,
        creator: creator || "Gezgin",
        coverGradient: coverGradients[i % coverGradients.length],
      };
    });
  }

  const showMock = cards.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Explore public trips
        </h1>
        <p className="mt-2 text-slate-600">
          Herkese açık kayıtlı planlar veritabanından gelir. Planını paylaşırken
          &quot;Explore&apos;da herkese aç&quot; seçeneğini işaretle.
        </p>
        {error && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Explore yüklenemedi ({error.message}).{" "}
            <code className="rounded bg-amber-100 px-1 text-xs">
              supabase/migrations/002_erd_schema.sql
            </code>{" "}
            çalıştırıldı mı?
          </p>
        )}
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(showMock ? mockExplorePlans : cards).map((p) => (
          <PlanCard key={p.id} plan={p} />
        ))}
      </div>
      {showMock && !error && (
        <p className="mt-8 text-center text-sm text-slate-500">
          Henüz public plan yok. Planner&apos;da kaydederken &quot;Explore&apos;da
          herkese aç&quot; seç.
        </p>
      )}
    </div>
  );
}
