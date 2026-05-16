/**
 * /explore route. Lists the 60 most recently updated public plans with
 * an optional `?type=` filter for trip style. Rendered on the server so
 * filters work via plain hyperlinks (no client JS required).
 */
import Link from "next/link";
import { PlanCard } from "@/components/explore/PlanCard";
import { fetchPublicPlanCards } from "@/lib/plans/publicPlans";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const TRIP_TYPES = [
  "All",
  "Relaxing",
  "Adventure",
  "Cultural",
  "Nature",
  "Urban",
] as const;
type TripFilter = (typeof TRIP_TYPES)[number];

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

  let cards: Awaited<ReturnType<typeof fetchPublicPlanCards>>["cards"] = [];
  let errorMessage: string | null = null;

  if (!isSupabaseConfigured()) {
    errorMessage =
      "The platform is not connected to its database yet. Please contact the maintainer.";
  } else {
    const result = await fetchPublicPlanCards({
      tripFilter: tripFilter === "All" ? undefined : tripFilter,
    });
    cards = result.cards;
    errorMessage = result.error;
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
            Open the planner, generate an itinerary, and enable “Share publicly
            in Explore” before you generate — your plan is saved automatically
            and will appear here.
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
