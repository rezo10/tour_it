import Link from "next/link";
import { CityImage } from "@/components/CityImage";
import type { SeasonPick } from "@/lib/places/seasonalPicks";
import { CalendarRange } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  picks: [SeasonPick, SeasonPick];
  /** Mobil sıra için */
  orderClass?: string;
};

export function HeroDiscoveryRail({ title, subtitle, picks, orderClass = "" }: Props) {
  return (
    <div
      className={`rounded-2xl border border-navy-900/10 bg-cream-50/70 p-4 shadow-md shadow-navy-900/5 ring-1 ring-coral-100/40 backdrop-blur-sm sm:p-5 ${orderClass}`}
    >
      <div className="mb-4 flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-coral-50 text-coral-700 ring-1 ring-coral-100">
          <CalendarRange className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-semibold leading-tight text-navy-900">
            {title}
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-navy-500">
            {subtitle}
          </p>
        </div>
      </div>
      <ul className="space-y-3">
        {picks.map((pick) => (
          <li key={`${pick.city}-${pick.country}`}>
            <Link
              href="/plan"
              className="group flex gap-3 rounded-xl border border-transparent p-1.5 transition hover:border-coral-100 hover:bg-white/80"
            >
              <div className="relative h-[4.5rem] w-[5.25rem] shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-200/60">
                <CityImage
                  city={pick.city}
                  country={pick.country}
                  sizes="96px"
                  className="transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {pick.city}
                </p>
                <p className="truncate text-[11px] font-medium uppercase tracking-wide text-coral-700/90">
                  {pick.country}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-600">
                  {pick.why}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
