import Link from "next/link";
import { HeroDiscoveryRail } from "@/components/home/HeroDiscoveryRail";
import { PlaceCoverImage } from "@/components/places/PlaceCoverImage";
import { getSeasonalRails } from "@/lib/places/seasonalPicks";
import { PlanCard } from "@/components/explore/PlanCard";
import type { ExplorePlanCard } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  ArrowRight,
  Globe2,
  Newspaper,
  Sparkles,
} from "lucide-react";

const featured = [
  {
    name: "Lisbon",
    country: "Portugal",
    tag: "Riverside & tiles",
  },
  {
    name: "Kyoto",
    country: "Japan",
    tag: "Temples & gardens",
  },
  {
    name: "Copenhagen",
    country: "Denmark",
    tag: "Design & canals",
  },
];

const news = [
  {
    title: "Structured AI itineraries",
    blurb:
      "The Plan module turns your country, city and preferences into a validated JSON itinerary — day order, durations and map coordinates in one schema.",
  },
  {
    title: "Lightweight community",
    blurb:
      "Posts, likes, comments and follows powered by Supabase row-level security — built for the project scope, not bloated with messaging.",
  },
];

const coverGradients = [
  "from-accent-200 via-coral-100 to-cream-50",
  "from-amber-100 via-orange-50 to-coral-100",
  "from-coral-100 via-cream-100 to-navy-50",
];

export const dynamic = "force-dynamic";

async function loadRecentPublicPlans(): Promise<ExplorePlanCard[]> {
  if (!isSupabaseConfigured()) return [];
  try {
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
      .limit(3);

    if (error || !rows) return [];

    return rows.map((p, i) => {
      const prefs = (p.preferences ?? {}) as { note?: string; day_count?: number };
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
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const seasonal = getSeasonalRails(new Date());
  const recentPlans = await loadRecentPublicPlans();

  return (
    <div className="bg-gradient-to-b from-cream-50 via-cream-100/90 to-coral-50/30">
      <section className="relative overflow-hidden border-b border-navy-900/10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-coral-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent-200/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
            <div className="order-2 lg:order-1 lg:col-span-3">
              <HeroDiscoveryRail
                title={seasonal.leftTitle}
                subtitle={seasonal.leftSubtitle}
                picks={seasonal.left}
              />
            </div>

            <div className="order-1 max-w-2xl lg:order-2 lg:col-span-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-coral-800 shadow-sm ring-1 ring-coral-100">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Intelligent travel planning & community
              </p>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
                Plan less in tabs,
                <span className="bg-gradient-to-r from-coral-500 to-coral-600 bg-clip-text text-transparent">
                  {" "}
                  travel more in flow
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-navy-600">
                Tour It brings discovery, AI itinerary building, maps, weather
                utilities and shared experiences into one calm, modern
                workspace.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-coral-600 hover:to-coral-700"
                >
                  Open trip planner
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-full border border-navy-900/12 bg-cream-50 px-6 py-3 text-sm font-semibold text-navy-800 shadow-sm transition hover:border-coral-300/80 hover:bg-white"
                >
                  Browse public plans
                </Link>
              </div>
              <p className="mt-8 text-xs text-slate-400">
                Season picks for{" "}
                <span className="font-medium text-slate-500">
                  {seasonal.periodLabel}
                </span>
              </p>
            </div>

            <div className="order-3 lg:col-span-3">
              <HeroDiscoveryRail
                title={seasonal.rightTitle}
                subtitle={seasonal.rightSubtitle}
                picks={seasonal.right}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Featured destinations
            </h2>
            <p className="mt-1 text-slate-600">
              Curated entry points — your planner adapts to country, city and
              trip type.
            </p>
          </div>
          <Link
            href="/utility"
            className="text-sm font-semibold text-coral-700 hover:text-coral-900"
          >
            Check weather & time →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {featured.map((f, index) => (
            <Link
              key={f.name}
              href="/plan"
              className="group relative block h-56 overflow-hidden rounded-2xl border border-slate-200/80 shadow-md ring-1 ring-slate-200/60 transition hover:border-coral-200 hover:shadow-lg"
            >
              <PlaceCoverImage
                city={f.name}
                country={f.country}
                height={224}
                width={1200}
                priority={index === 0}
                variant="hero"
                className="transition duration-300 group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent" />
              <Globe2 className="absolute right-4 top-4 h-8 w-8 text-white/80 drop-shadow" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-cream-100">
                  {f.country}
                </p>
                <h3 className="mt-1 text-xl font-bold text-white drop-shadow-sm">
                  {f.name}
                </h3>
                <p className="mt-1 text-sm text-white/90">{f.tag}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-coral-600" aria-hidden />
            <h2 className="text-2xl font-bold text-slate-900">
              Product updates
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {news.map((n) => (
              <div
                key={n.title}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6"
              >
                <h3 className="font-semibold text-slate-900">{n.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {n.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Recent public plans
            </h2>
            <p className="mt-1 text-slate-600">
              Itineraries the community has just shared.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-sm font-semibold text-coral-700 hover:text-coral-900"
          >
            View all →
          </Link>
        </div>
        {recentPlans.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {recentPlans.map((p) => (
              <PlanCard key={p.id} plan={p} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-sm text-slate-600">
            No public itineraries have been shared yet. Be the first — open the
            <Link
              href="/plan"
              className="ml-1 font-semibold text-coral-700 hover:text-coral-900"
            >
              planner
            </Link>{" "}
            and toggle “Share publicly” when you save.
          </div>
        )}
      </section>
    </div>
  );
}
