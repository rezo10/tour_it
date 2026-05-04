import { PlaceCoverImage } from "@/components/places/PlaceCoverImage";
import type { ItineraryPlan } from "@/types/itinerary";
import { CalendarDays, Clock, MapPin } from "lucide-react";

type Props = {
  plan: ItineraryPlan;
};

export function ItineraryPanel({ plan }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-32 w-full shrink-0 overflow-hidden">
        <PlaceCoverImage
          city={plan.city}
          country={plan.country}
          height={128}
          width={1200}
          variant="subtle"
        />
      </div>
      <div className="border-b border-slate-100 bg-white px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">{plan.title}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {plan.city}, {plan.country} · {plan.tripType}
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {plan.days.map((d) => (
          <section key={d.day} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-coral-800">
              <CalendarDays className="h-4 w-4" aria-hidden />
              Day {d.day}
              <span className="font-normal text-slate-600">— {d.title}</span>
            </div>
            <ol className="space-y-4">
              {d.activities.map((a) => (
                <li
                  key={`${d.day}-${a.order}`}
                  className="relative rounded-lg border border-white bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral-100 text-xs font-bold text-coral-800">
                        {a.order}
                      </span>
                      <div>
                        <h3 className="font-medium text-slate-900">{a.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {a.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        <Clock className="h-3 w-3" aria-hidden />
                        {a.duration}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <MapPin className="h-3 w-3" aria-hidden />
                        {a.category}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
