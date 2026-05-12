/**
 * /explore route. Lists the 60 most recently updated public plans with
 * an optional `?type=` filter for trip style. Rendered on the server so
 * filters work via plain hyperlinks (no client JS required).
 */
import Link from "next/link";
import { PlanCard } from "@/components/explore/PlanCard";
import type { ExplorePlanCard } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Rotating gradient palette assigned to each card by index.
const coverGradients = [
  "from-accent-200 via-coral-100 to-cream-50",
  "from-amber-100 via-orange-50 to-coral-100",
  "from-coral-100 via-cream-100 to-navy-50",
  "from-violet-100 via-fuchsia-50 to-cream-50",
  "from-rose-100 via-orange-50 to-amber-50",
];

// Closed list of trip styles surfaced as filter chips.
const TRIP_TYPES = ["All", "Relaxing", "Adventure", "Cultural"] as const;
type TripFilter = (typeof TRIP_TYPES)[number];

// Map an arbitrary query-string value into one of the allowed filters.
function normalizeFilter(value: string | string[] | undefined): TripFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  const match = TRIP_TYPES.find(
    (t) => t.toLowerCase() === (raw ?? "").toLowerCase(),
  );
  return match ?? "All";
}

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const tripFilter = normalizeFilter(params?.type);

  let cards: ExplorePlanCard[] = [];
  let errorMessage: string | null = null;

  if (!isSupabaseConfigured()) {
    errorMessage =
      "The platform is not connected to its database yet. Please contact the maintainer.";
  } else {
    const supabase = await createClient();
    let query = supabase
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
      .limit(60);

    // Case-insensitive match so "Cultural"/"cultural" both work.
    if (tripFilter !== "All") {
      query = query.ilike("trip_type", tripFilter);
    }

    const { data: rows, error } = await query;

    if (error) {
      errorMessage =
        "We couldn't load public plans right now. Please try again in a moment.";
    } else if (rows?.length) {
      cards = rows.map((p, i) => {
        const prefs = (p.preferences ?? {}) as {
          note?: string;
          day_count?: number;
        };
        const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
        const creator =
          (profile as { display_name?: string | null } | null)?.display_name ??
          "Traveller";
        return {
          id: String(p.id),
          title: p.title,
          country: p.country,
          city: p.city,
          tripType: p.trip_type,
          days: typeof prefs.day_count === "number" ? prefs.day_count : 3,
          description:
            typeof prefs.note === "string" && prefs.note
              ? prefs.note
              : `${p.trip_type} · ${p.city}, ${p.country}`,
          creator: creator || "Traveller",
          coverGradient: coverGradients[i % coverGradients.length],
        };
      });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Explore public trips
        </h1>
        <p className="mt-2 text-slate-600">
          Discover itineraries shared by other travellers. Use the filters
          below to narrow by trip style.
        </p>
        {errorMessage && (
          <p
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </header>

      <nav
        aria-label="Filter by trip type"
        className="mb-8 flex flex-wrap gap-2"
      >
        {TRIP_TYPES.map((t) => {
          const active = t === tripFilter;
          const href = t === "All" ? "/explore" : `/explore?type=${t}`;
          return (
            <Link
              key={t}
              href={href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-coral-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-coral-300 hover:text-coral-700"
              }`}
            >
              {t}
            </Link>
          );
        })}
      </nav>

      {cards.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      ) : !errorMessage ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 text-center">
          <p className="text-sm font-semibold text-slate-900">
            {tripFilter === "All"
              ? "No public itineraries yet"
              : `No ${tripFilter.toLowerCase()} trips have been shared yet`}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Open the planner, generate an itinerary and toggle “Share publicly”
            when you save it — it will appear here for everyone.
          </p>
          <Link
            href="/plan"
            className="mt-5 inline-block rounded-full bg-coral-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-700"
          >
            Open the planner →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
