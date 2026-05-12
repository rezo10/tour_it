/**
 * Card tile used by /explore (and the "Recent public plans" section on
 * the home page) to advertise a single saved itinerary. The image is
 * fetched dynamically by CityImage; everything else comes from the
 * Supabase row.
 */
import Link from "next/link";
import { CityImage } from "@/components/CityImage";
import type { ExplorePlanCard as ExplorePlanCardType } from "@/lib/mock-data";
import { Calendar, MapPinned, User } from "lucide-react";

type Props = {
  plan: ExplorePlanCardType;
};

export function PlanCard({ plan }: Props) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-navy-900/10 bg-cream-50 shadow-md shadow-navy-900/5 transition hover:border-coral-300/80 hover:shadow-lg">
      <div className="relative h-40 w-full overflow-hidden">
        <CityImage
          city={plan.city}
          country={plan.country}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/25 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <span className="inline-flex w-fit rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-coral-900 shadow-sm backdrop-blur">
            {plan.tripType}
          </span>
          <h3 className="text-lg font-semibold text-white drop-shadow-md">
            {plan.title}
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <MapPinned className="h-3.5 w-3.5 text-coral-600" aria-hidden />
            {plan.city}, {plan.country}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-coral-600" aria-hidden />
            {plan.days} days
          </span>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
          {plan.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <User className="h-3.5 w-3.5" aria-hidden />
            {plan.creator}
          </span>
          <Link
            href="/plan"
            className="text-sm font-semibold text-coral-700 transition group-hover:text-coral-900"
          >
            Open planner →
          </Link>
        </div>
      </div>
    </article>
  );
}
