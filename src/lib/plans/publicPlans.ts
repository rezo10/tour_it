/**
 * Shared loader for public itineraries used on /explore and the home page.
 * Fetches plans and creator display names in two steps so a broken
 * PostgREST embed does not hide every shared plan.
 */
import { createClient } from "@/lib/supabase/server";
import type { ExplorePlanCard } from "@/lib/mock-data";

const coverGradients = [
  "from-accent-200 via-coral-100 to-cream-50",
  "from-amber-100 via-orange-50 to-coral-100",
  "from-coral-100 via-cream-100 to-navy-50",
  "from-violet-100 via-fuchsia-50 to-cream-50",
  "from-rose-100 via-orange-50 to-amber-50",
];

type PlanRow = {
  id: string;
  title: string;
  country: string;
  city: string;
  trip_type: string;
  preferences: unknown;
  updated_at: string;
  user_id: string;
};

export async function fetchPublicPlanCards(options: {
  tripFilter?: string;
  limit?: number;
}): Promise<{ cards: ExplorePlanCard[]; error: string | null }> {
  const limit = options.limit ?? 60;
  const supabase = await createClient();

  let query = supabase
    .from("plans")
    .select(
      "id, title, country, city, trip_type, preferences, updated_at, user_id",
    )
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(limit);

  const tripFilter = options.tripFilter?.trim();
  if (tripFilter && tripFilter !== "All") {
    query = query.ilike("trip_type", tripFilter);
  }

  const { data: rows, error } = await query;

  if (error) {
    return {
      cards: [],
      error:
        "We couldn't load public plans right now. Please try again in a moment.",
    };
  }

  if (!rows?.length) {
    return { cards: [], error: null };
  }

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);

  const displayNameByUser = new Map(
    (profiles ?? []).map((p) => [p.id, p.display_name ?? "Traveller"]),
  );

  const cards = (rows as PlanRow[]).map((p, i) => {
    const prefs = (p.preferences ?? {}) as {
      note?: string;
      day_count?: number;
    };
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
      creator: displayNameByUser.get(p.user_id) ?? "Traveller",
      coverGradient: coverGradients[i % coverGradients.length],
    };
  });

  return { cards, error: null };
}
