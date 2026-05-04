import Link from "next/link";
import { HeroDiscoveryRail } from "@/components/home/HeroDiscoveryRail";
import { PlaceCoverImage } from "@/components/places/PlaceCoverImage";
import { getSeasonalRails } from "@/lib/places/seasonalPicks";
import { mockExplorePlans } from "@/lib/mock-data";
import { PlanCard } from "@/components/explore/PlanCard";
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
    title: "New: structured JSON itineraries",
    blurb:
      "The Plan module is designed for Gemini output you can trust — day order, duration, and map pins in one schema.",
  },
  {
    title: "Community stays lightweight",
    blurb:
      "Posts, likes, and follows without a full messaging stack — aligned with project scope.",
  },
];

export const dynamic = "force-dynamic";

export default function HomePage() {
  const seasonal = getSeasonalRails(new Date());

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
                Tour It brings discovery, itinerary building, maps, utilities, and
                shared experiences into one calm, modern workspace — built for your
                graduation project scope.
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
                Mevsim önerileri:{" "}
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
              Curated entry points — your planner will adapt to country, city,
              and trip type.
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
              Mock data — Explore will list user-published trips from Supabase.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-sm font-semibold text-coral-700 hover:text-coral-900"
          >
            View all →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {mockExplorePlans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
